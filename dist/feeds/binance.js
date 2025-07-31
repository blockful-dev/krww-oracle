"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinanceFeed = void 0;
const axios_1 = __importDefault(require("axios"));
const types_1 = require("../types");
const logger_1 = require("../utils/logger");
class BinanceFeed extends types_1.PriceFeedProvider {
    name = types_1.PriceFeedSource.BINANCE;
    baseUrl = 'https://api.binance.com/api/v3';
    symbolMap = {
        [types_1.SupportedToken.BTC]: 'BTCUSDT',
        [types_1.SupportedToken.ETH]: 'ETHUSDT',
        [types_1.SupportedToken.SOL]: 'SOLUSDT',
        [types_1.SupportedToken.XRP]: 'XRPUSDT'
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
            const [priceResponse, statsResponse] = await Promise.all([
                axios_1.default.get(`${this.baseUrl}/ticker/price`, { params: { symbol } }),
                axios_1.default.get(`${this.baseUrl}/ticker/24hr`, { params: { symbol } })
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
        }
        catch (error) {
            logger_1.logger.error(`Binance feed error for ${token}:`, error);
            throw error;
        }
    }
    async isHealthy() {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/ping`, { timeout: 5000 });
            return response.status === 200;
        }
        catch (error) {
            logger_1.logger.warn('Binance health check failed:', error);
            return false;
        }
    }
}
exports.BinanceFeed = BinanceFeed;
//# sourceMappingURL=binance.js.map