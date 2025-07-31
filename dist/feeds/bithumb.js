"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BithumbFeed = void 0;
const axios_1 = __importDefault(require("axios"));
const types_1 = require("../types");
const logger_1 = require("../utils/logger");
class BithumbFeed extends types_1.PriceFeedProvider {
    name = types_1.PriceFeedSource.BITHUMB;
    baseUrl = 'https://api.bithumb.com/public';
    symbolMap = {
        [types_1.SupportedToken.BTC]: 'BTC_KRW',
        [types_1.SupportedToken.ETH]: 'ETH_KRW',
        [types_1.SupportedToken.SOL]: 'SOL_KRW',
        [types_1.SupportedToken.XRP]: 'XRP_KRW'
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
            const currency = symbol.split('_')[0];
            const response = await axios_1.default.get(`${this.baseUrl}/ticker/${currency}_KRW`);
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
        }
        catch (error) {
            logger_1.logger.error(`Bithumb feed error for ${token}:`, error);
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
            const response = await axios_1.default.get(`${this.baseUrl}/ticker/BTC_KRW`, { timeout: 5000 });
            return response.status === 200 && response.data.status === '0000';
        }
        catch (error) {
            logger_1.logger.warn('Bithumb health check failed:', error);
            return false;
        }
    }
}
exports.BithumbFeed = BithumbFeed;
//# sourceMappingURL=bithumb.js.map