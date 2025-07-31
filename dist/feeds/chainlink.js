"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainlinkFeed = void 0;
const ethers_1 = require("ethers");
const types_1 = require("../types");
const logger_1 = require("../utils/logger");
const config_1 = require("../utils/config");
const CHAINLINK_AGGREGATOR_ABI = [
    'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
    'function decimals() view returns (uint8)'
];
class ChainlinkFeed extends types_1.PriceFeedProvider {
    name = types_1.PriceFeedSource.CHAINLINK;
    provider;
    aggregatorAddresses = {
        [types_1.SupportedToken.BTC]: '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
        [types_1.SupportedToken.ETH]: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
        [types_1.SupportedToken.SOL]: '0x4ffC43a60e009B551865A93d232E33Fce9f01507',
        [types_1.SupportedToken.XRP]: '0xCed2660c6Dd1Ffd856A5A82C67f3482d88C50b12'
    };
    constructor() {
        super();
        this.provider = new ethers_1.ethers.JsonRpcProvider(config_1.apiKeys.ethereum.rpcUrl);
    }
    getSupportedTokens() {
        return Object.keys(this.aggregatorAddresses);
    }
    async fetchPrice(token) {
        try {
            const aggregatorAddress = this.aggregatorAddresses[token];
            if (!aggregatorAddress) {
                throw new Error(`Unsupported token: ${token}`);
            }
            const aggregator = new ethers_1.ethers.Contract(aggregatorAddress, CHAINLINK_AGGREGATOR_ABI, this.provider);
            const [roundData, decimals] = await Promise.all([
                aggregator.latestRoundData(),
                aggregator.decimals()
            ]);
            const price = Number(roundData.answer) / Math.pow(10, Number(decimals));
            const updatedAt = Number(roundData.updatedAt) * 1000;
            const ageInMinutes = (Date.now() - updatedAt) / (1000 * 60);
            if (ageInMinutes > 60) {
                logger_1.logger.warn(`Chainlink price for ${token} is ${ageInMinutes.toFixed(1)} minutes old`);
            }
            return {
                symbol: token,
                price,
                timestamp: updatedAt,
                source: this.name,
                confidence: Math.max(0.5, 1 - (ageInMinutes / 120))
            };
        }
        catch (error) {
            logger_1.logger.error(`Chainlink feed error for ${token}:`, error);
            throw error;
        }
    }
    async isHealthy() {
        try {
            const btcAggregator = new ethers_1.ethers.Contract(this.aggregatorAddresses[types_1.SupportedToken.BTC], CHAINLINK_AGGREGATOR_ABI, this.provider);
            const roundData = await btcAggregator.latestRoundData();
            const updatedAt = Number(roundData.updatedAt) * 1000;
            const ageInMinutes = (Date.now() - updatedAt) / (1000 * 60);
            return ageInMinutes < 120;
        }
        catch (error) {
            logger_1.logger.warn('Chainlink health check failed:', error);
            return false;
        }
    }
}
exports.ChainlinkFeed = ChainlinkFeed;
//# sourceMappingURL=chainlink.js.map