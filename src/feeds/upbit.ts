import axios from 'axios';
import { PriceFeedProvider, PriceData, PriceFeedSource, SupportedToken } from '../types';
import { logger } from '../utils/logger';

export class UpbitFeed extends PriceFeedProvider {
  name = PriceFeedSource.UPBIT;
  private baseUrl = 'https://api.upbit.com/v1';

  private symbolMap = {
    [SupportedToken.BTC]: 'KRW-BTC',
    [SupportedToken.ETH]: 'KRW-ETH',
    [SupportedToken.SOL]: 'KRW-SOL',
    [SupportedToken.XRP]: 'KRW-XRP'
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

      const [tickerResponse, candleResponse] = await Promise.all([
        axios.get(`${this.baseUrl}/ticker`, { params: { markets: symbol } }),
        axios.get(`${this.baseUrl}/candles/days`, {
          params: { market: symbol, count: 1 }
        })
      ]);

      const ticker = tickerResponse.data[0];
      const candle = candleResponse.data[0];

      const priceKRW = ticker.trade_price;
      const volume24h = candle.candle_acc_trade_volume;

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
      logger.error(`Upbit feed error for ${token}:`, error);
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
      const response = await axios.get(`${this.baseUrl}/market/all`, { timeout: 5000 });
      return response.status === 200 && Array.isArray(response.data);
    } catch (error) {
      logger.warn('Upbit health check failed:', error);
      return false;
    }
  }
}