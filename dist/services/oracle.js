"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OracleService = void 0;
const types_1 = require("../types");
const aggregator_1 = require("./aggregator");
const feeds_1 = require("../feeds");
const config_1 = require("../utils/config");
const logger_1 = require("../utils/logger");
class OracleService {
    aggregator;
    providers;
    isRunning = false;
    updateInterval;
    constructor() {
        this.aggregator = new aggregator_1.PriceAggregator();
        this.providers = new Map();
        this.providers.set(types_1.PriceFeedSource.BINANCE, new feeds_1.BinanceFeed());
        this.providers.set(types_1.PriceFeedSource.UPBIT, new feeds_1.UpbitFeed());
        this.providers.set(types_1.PriceFeedSource.BITHUMB, new feeds_1.BithumbFeed());
        this.providers.set(types_1.PriceFeedSource.PYTH, new feeds_1.PythFeed());
        this.providers.set(types_1.PriceFeedSource.CHAINLINK, new feeds_1.ChainlinkFeed());
    }
    async start() {
        if (this.isRunning) {
            logger_1.logger.warn('Oracle service is already running');
            return;
        }
        logger_1.logger.info('Starting Oracle service...');
        await this.performHealthChecks();
        await this.updateAllPrices();
        this.updateInterval = setInterval(async () => {
            try {
                await this.updateAllPrices();
            }
            catch (error) {
                logger_1.logger.error('Error in price update cycle:', error);
            }
        }, config_1.config.server.updateInterval);
        this.isRunning = true;
        logger_1.logger.info(`Oracle service started with ${config_1.config.server.updateInterval}ms update interval`);
    }
    async stop() {
        if (!this.isRunning)
            return;
        logger_1.logger.info('Stopping Oracle service...');
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = undefined;
        }
        this.isRunning = false;
        logger_1.logger.info('Oracle service stopped');
    }
    async getPrice(token) {
        const cached = this.aggregator.getCachedPrice(token);
        if (cached) {
            return cached;
        }
        logger_1.logger.info(`No cached price for ${token}, fetching fresh data...`);
        const priceFeeds = await this.fetchPriceFeeds(token);
        return this.aggregator.aggregatePrice(token, priceFeeds);
    }
    async getAllPrices() {
        const prices = new Map();
        for (const token of Object.values(types_1.SupportedToken)) {
            try {
                const price = await this.getPrice(token);
                prices.set(token, price);
            }
            catch (error) {
                logger_1.logger.error(`Failed to get price for ${token}:`, error);
            }
        }
        return prices;
    }
    async getHealthStatus() {
        const healthStatus = {};
        const healthPromises = Array.from(this.providers.entries()).map(async ([source, provider]) => {
            try {
                const isHealthy = await provider.isHealthy();
                healthStatus[source] = isHealthy;
            }
            catch (error) {
                logger_1.logger.error(`Health check failed for ${source}:`, error);
                healthStatus[source] = false;
            }
        });
        await Promise.allSettled(healthPromises);
        return healthStatus;
    }
    async updateAllPrices() {
        logger_1.logger.debug('Updating all prices...');
        const updatePromises = Object.values(types_1.SupportedToken).map(async (token) => {
            try {
                const priceFeeds = await this.fetchPriceFeeds(token);
                this.aggregator.aggregatePrice(token, priceFeeds);
            }
            catch (error) {
                logger_1.logger.error(`Failed to update price for ${token}:`, error);
            }
        });
        await Promise.allSettled(updatePromises);
        logger_1.logger.debug('Price update cycle completed');
    }
    async fetchPriceFeeds(token) {
        const pricePromises = Array.from(this.providers.entries())
            .filter(([source]) => config_1.config.feeds[source].enabled)
            .map(async ([source, provider]) => {
            try {
                if (!provider.getSupportedTokens().includes(token)) {
                    return null;
                }
                const timeout = config_1.config.feeds[source].timeout;
                return await this.withTimeout(provider.fetchPrice(token), timeout);
            }
            catch (error) {
                logger_1.logger.warn(`Failed to fetch price from ${source} for ${token}:`, error);
                return null;
            }
        });
        const results = await Promise.allSettled(pricePromises);
        const priceFeeds = results
            .filter((result) => result.status === 'fulfilled' && result.value !== null)
            .map(result => result.value);
        logger_1.logger.debug(`Fetched ${priceFeeds.length} price feeds for ${token}`);
        return priceFeeds;
    }
    async performHealthChecks() {
        logger_1.logger.info('Performing health checks...');
        const healthStatus = await this.getHealthStatus();
        const healthyCount = Object.values(healthStatus).filter(Boolean).length;
        const totalCount = Object.keys(healthStatus).length;
        logger_1.logger.info(`Health check results: ${healthyCount}/${totalCount} providers healthy`);
        for (const [source, isHealthy] of Object.entries(healthStatus)) {
            logger_1.logger.info(`${source}: ${isHealthy ? '✓ Healthy' : '✗ Unhealthy'}`);
        }
    }
    async withTimeout(promise, timeoutMs) {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
        });
        return Promise.race([promise, timeoutPromise]);
    }
    get isServiceRunning() {
        return this.isRunning;
    }
}
exports.OracleService = OracleService;
//# sourceMappingURL=oracle.js.map