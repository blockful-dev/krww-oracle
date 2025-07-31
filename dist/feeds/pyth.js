"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythFeed = void 0;
const axios_1 = __importDefault(require("axios"));
const types_1 = require("../types");
const logger_1 = require("../utils/logger");
class PythFeed extends types_1.PriceFeedProvider {
    name = types_1.PriceFeedSource.PYTH;
    baseUrl = 'https://hermes.pyth.network/v2/updates/price/latest';
    priceIdMap = {
        [types_1.SupportedToken.BTC]: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
        [types_1.SupportedToken.ETH]: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
        [types_1.SupportedToken.SOL]: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
        [types_1.SupportedToken.XRP]: '0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8'
    };
    getSupportedTokens() {
        return Object.keys(this.priceIdMap);
    }
    async fetchPrice(token) {
        try {
            const priceId = this.priceIdMap[token];
            if (!priceId) {
                throw new Error(`Unsupported token: ${token}`);
            }
            const response = await axios_1.default.get(this.baseUrl, {
                params: {
                    ids: [priceId],
                    parsed: true
                },
                timeout: 8000
            });
            const parsed = response.data.parsed;
            if (!parsed || !parsed.length || !parsed[0]) {
                throw new Error(`No price data received from Pyth for ${token}`);
            }
            const priceData = parsed[0];
            const priceInfo = priceData.price;
            if (!priceInfo) {
                throw new Error(`Invalid price structure from Pyth for ${token}`);
            }
            const price = parseFloat(priceInfo.price) * Math.pow(10, priceInfo.expo);
            const confidence = parseFloat(priceInfo.conf) * Math.pow(10, priceInfo.expo);
            const publishTime = priceInfo.publish_time * 1000;
            const confidenceRatio = price > 0 ? confidence / price : 1;
            return {
                symbol: token,
                price,
                timestamp: publishTime,
                source: this.name,
                confidence: Math.max(0.1, 1 - Math.min(confidenceRatio, 1))
            };
        }
        catch (error) {
            logger_1.logger.error(`Pyth feed error for ${token}:`, error);
            throw error;
        }
    }
    async isHealthy() {
        try {
            const btcPriceId = this.priceIdMap[types_1.SupportedToken.BTC];
            const response = await axios_1.default.get(this.baseUrl, {
                params: {
                    ids: [btcPriceId],
                    parsed: true
                },
                timeout: 5000
            });
            return response.status === 200 &&
                response.data.parsed &&
                Array.isArray(response.data.parsed) &&
                response.data.parsed.length > 0;
        }
        catch (error) {
            logger_1.logger.warn('Pyth health check failed:', error);
            return false;
        }
    }
}
exports.PythFeed = PythFeed;
//# sourceMappingURL=pyth.js.map