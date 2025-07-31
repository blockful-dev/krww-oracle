"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpbitFeed = void 0;
const axios_1 = __importDefault(require("axios"));
const types_1 = require("../types");
const logger_1 = require("../utils/logger");
class UpbitFeed extends types_1.PriceFeedProvider {
    name = types_1.PriceFeedSource.UPBIT;
    baseUrl = 'https://api.upbit.com/v1';
    symbolMap = {
        [types_1.SupportedToken.BTC]: 'KRW-BTC',
        [types_1.SupportedToken.ETH]: 'KRW-ETH',
        [types_1.SupportedToken.SOL]: 'KRW-SOL',
        [types_1.SupportedToken.XRP]: 'KRW-XRP'
    };
    getSupportedTokens() {
        return Object.keys(this.symbolMap);
    }
    async fetchPrice(token) {
        try {
            const symbol = this.symbolMap[token];
            if (!symbol) {
                throw new Error(`Unsupported token: ${token}`);
            }
            const [tickerResponse, candleResponse] = await Promise.all([
                axios_1.default.get(`${this.baseUrl}/ticker`, { params: { markets: symbol } }),
                axios_1.default.get(`${this.baseUrl}/candles/days`, {
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
        }
        catch (error) {
            logger_1.logger.error(`Upbit feed error for ${token}:`, error);
            throw error;
        }
    }
    async getUSDKRWRate() {
        try {
            const response = await axios_1.default.get('https://api.exchangerate-api.com/v4/latest/USD');
            return response.data.rates.KRW;
        }
        catch (error) {
            logger_1.logger.warn('Failed to get USD/KRW rate, using fallback:', error);
            return 1300;
        }
    }
    async isHealthy() {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/market/all`, { timeout: 5000 });
            return response.status === 200 && Array.isArray(response.data);
        }
        catch (error) {
            logger_1.logger.warn('Upbit health check failed:', error);
            return false;
        }
    }
}
exports.UpbitFeed = UpbitFeed;
//# sourceMappingURL=upbit.js.map