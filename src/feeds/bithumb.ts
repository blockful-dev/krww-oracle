import axios from 'axios';
import { PriceFeedProvider, PriceData, PriceFeedSource, SupportedToken } from '../types';
import { logger } from '../utils/logger';

export class BithumbFeed extends PriceFeedProvider {
  name = PriceFeedSource.BITHUMB;
  private baseUrl = 'https://api.bithumb.com/public';

  private symbolMap = {
    [SupportedToken.BTC]: 'BTC_KRW',
    [SupportedToken.ETH]: 'ETH_KRW',
    [SupportedToken.SOL]: 'SOL_KRW',
    [SupportedToken.XRP]: 'XRP_KRW'
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

      const currency = symbol.split('_')[0];
      const response = await axios.get(`${this.baseUrl}/ticker/${currency}_KRW`);

      if (response.data.status !== '0000') {
        throw new Error(`Bithumb API error: ${response.data.message}`);
      }

      const data = response.data.data;
      const priceKRW = parseFloat(data.closing_price);
      const volume24h = parseFloat(data.units_traded_24H);

      const usdKrwRate = await this.getUSDKRWRate();
      const priceUSD = priceKRW / usdKrwRate;

      return {
        symbol: token,
        price: priceUSD,
        timestamp: Date.now(),
        source: this.name,
        volume24h
      };
    } catch (error) {
      logger.error(`Bithumb feed error for ${token}:`, error);
      throw error;
    }
  }

  private async getUSDKRWRate(): Promise<number> {
    try {
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
      return response.data.rates.KRW;
    } catch (error) {
      logger.warn('Failed to get USD/KRW rate, using fallback:', error);
      return 1300;
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/ticker/BTC_KRW`, { timeout: 5000 });
      return response.status === 200 && response.data.status === '0000';
    } catch (error) {
      logger.warn('Bithumb health check failed:', error);
      return false;
    }
  }
}