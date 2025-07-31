import axios from 'axios';
import { PriceFeedProvider, PriceData, PriceFeedSource, SupportedToken } from '../types';
import { logger } from '../utils/logger';

export class BinanceFeed extends PriceFeedProvider {
  name = PriceFeedSource.BINANCE;
  private baseUrl = 'https://api.binance.com/api/v3';

  private symbolMap = {
    [SupportedToken.BTC]: 'BTCUSDT',
    [SupportedToken.ETH]: 'ETHUSDT',
    [SupportedToken.SOL]: 'SOLUSDT',
    [SupportedToken.XRP]: 'XRPUSDT'
  };

  getSupportedTokens(): SupportedToken[] {
    return Object.keys(this.symbolMap) as SupportedToken[];
  }

  async fetchPrice(token: SupportedToken): Promise<PriceData> {
    try {
      const symbol = this.symbolMap[token];
      if (!symbol) {
        throw new Error(`Unsupported token: ${token}`);
      }

      const [priceResponse, statsResponse] = await Promise.all([
        axios.get(`${this.baseUrl}/ticker/price`, { params: { symbol } }),
        axios.get(`${this.baseUrl}/ticker/24hr`, { params: { symbol } })
      ]);

      const price = parseFloat(priceResponse.data.price);
      const volume24h = parseFloat(statsResponse.data.volume);

      return {
        symbol: token,
        price,
        timestamp: Date.now(),
        source: this.name,
        volume24h
      };
    } catch (error) {
      logger.error(`Binance feed error for ${token}:`, error);
      throw error;
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/ping`, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      logger.warn('Binance health check failed:', error);
      return false;
    }
  }
}