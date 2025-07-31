import { PriceFeedProvider, SupportedToken, PriceData, AggregatedPrice, PriceFeedSource } from '../types';
import { PriceAggregator } from './aggregator';
import { BinanceFeed, UpbitFeed, BithumbFeed, PythFeed, ChainlinkFeed } from '../feeds';
import { config } from '../utils/config';
import { logger } from '../utils/logger';

export class OracleService {
  private aggregator: PriceAggregator;
  private providers: Map<PriceFeedSource, PriceFeedProvider>;
  private isRunning = false;
  private updateInterval?: NodeJS.Timeout | undefined;

  constructor() {
    this.aggregator = new PriceAggregator();
    this.providers = new Map();
    this.providers.set(PriceFeedSource.BINANCE, new BinanceFeed());
    this.providers.set(PriceFeedSource.UPBIT, new UpbitFeed());
    this.providers.set(PriceFeedSource.BITHUMB, new BithumbFeed());
    this.providers.set(PriceFeedSource.PYTH, new PythFeed());
    this.providers.set(PriceFeedSource.CHAINLINK, new ChainlinkFeed());
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Oracle service is already running');
      return;
    }

    logger.info('Starting Oracle service...');

    await this.performHealthChecks();
    await this.updateAllPrices();

    this.updateInterval = setInterval(async () => {
      try {
        await this.updateAllPrices();
      } catch (error) {
        logger.error('Error in price update cycle:', error);
      }
    }, config.server.updateInterval);

    this.isRunning = true;
    logger.info(`Oracle service started with ${config.server.updateInterval}ms update interval`);
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    logger.info('Stopping Oracle service...');

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
    }

    this.isRunning = false;
    logger.info('Oracle service stopped');
  }

  async getPrice(token: SupportedToken): Promise<AggregatedPrice> {
    const cached = this.aggregator.getCachedPrice(token);
    if (cached) {
      return cached;
    }

    logger.info(`No cached price for ${token}, fetching fresh data...`);
    const priceFeeds = await this.fetchPriceFeeds(token);
    return this.aggregator.aggregatePrice(token, priceFeeds);
  }

  async getAllPrices(): Promise<Map<SupportedToken, AggregatedPrice>> {
    const prices = new Map<SupportedToken, AggregatedPrice>();

    for (const token of Object.values(SupportedToken)) {
      try {
        const price = await this.getPrice(token);
        prices.set(token, price);
      } catch (error) {
        logger.error(`Failed to get price for ${token}:`, error);
      }
    }

    return prices;
  }

  async getHealthStatus(): Promise<{ [key in PriceFeedSource]: boolean }> {
    const healthStatus = {} as { [key in PriceFeedSource]: boolean };

    const healthPromises = Array.from(this.providers.entries()).map(async ([source, provider]) => {
      try {
        const isHealthy = await provider.isHealthy();
        healthStatus[source] = isHealthy;
      } catch (error) {
        logger.error(`Health check failed for ${source}:`, error);
        healthStatus[source] = false;
      }
    });

    await Promise.allSettled(healthPromises);
    return healthStatus;
  }

  private async updateAllPrices(): Promise<void> {
    logger.debug('Updating all prices...');

    const updatePromises = Object.values(SupportedToken).map(async (token) => {
      try {
        const priceFeeds = await this.fetchPriceFeeds(token);
        this.aggregator.aggregatePrice(token, priceFeeds);
      } catch (error) {
        logger.error(`Failed to update price for ${token}:`, error);
      }
    });

    await Promise.allSettled(updatePromises);
    logger.debug('Price update cycle completed');
  }

  private async fetchPriceFeeds(token: SupportedToken): Promise<PriceData[]> {
    const pricePromises = Array.from(this.providers.entries())
      .filter(([source]) => config.feeds[source].enabled)
      .map(async ([source, provider]) => {
        try {
          if (!provider.getSupportedTokens().includes(token)) {
            return null;
          }

          const timeout = config.feeds[source].timeout;
          return await this.withTimeout(provider.fetchPrice(token), timeout);
        } catch (error) {
          logger.warn(`Failed to fetch price from ${source} for ${token}:`, error);
          return null;
        }
      });

    const results = await Promise.allSettled(pricePromises);
    const priceFeeds = results
      .filter((result): result is PromiseFulfilledResult<PriceData> =>
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);

    logger.debug(`Fetched ${priceFeeds.length} price feeds for ${token}`);
    return priceFeeds;
  }

  private async performHealthChecks(): Promise<void> {
    logger.info('Performing health checks...');
    const healthStatus = await this.getHealthStatus();

    const healthyCount = Object.values(healthStatus).filter(Boolean).length;
    const totalCount = Object.keys(healthStatus).length;

    logger.info(`Health check results: ${healthyCount}/${totalCount} providers healthy`);

    for (const [source, isHealthy] of Object.entries(healthStatus)) {
      logger.info(`${source}: ${isHealthy ? '✓ Healthy' : '✗ Unhealthy'}`);
    }
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  get isServiceRunning(): boolean {
    return this.isRunning;
  }
}