"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeys = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const types_1 = require("../types");
dotenv_1.default.config();
exports.config = {
    feeds: {
        [types_1.PriceFeedSource.BINANCE]: {
            enabled: true,
            weight: 0.25,
            timeout: 5000,
            retryAttempts: 3
        },
        [types_1.PriceFeedSource.UPBIT]: {
            enabled: true,
            weight: 0.2,
            timeout: 5000,
            retryAttempts: 3
        },
        [types_1.PriceFeedSource.BITHUMB]: {
            enabled: true,
            weight: 0.2,
            timeout: 5000,
            retryAttempts: 3
        },
        [types_1.PriceFeedSource.PYTH]: {
            enabled: true,
            weight: 0.2,
            timeout: 8000,
            retryAttempts: 2
        },
        [types_1.PriceFeedSource.CHAINLINK]: {
            enabled: true,
            weight: 0.15,
            timeout: 10000,
            retryAttempts: 2
        }
    },
    aggregation: {
        minSources: 2,
        outlierThreshold: 0.05,
        maxPriceAge: 60000
    },
    server: {
        port: parseInt(process.env.PORT || '3000'),
        updateInterval: 10000
    }
};
exports.apiKeys = {
    binance: {
        key: process.env.BINANCE_API_KEY,
        secret: process.env.BINANCE_SECRET
    },
    upbit: {
        accessKey: process.env.UPBIT_ACCESS_KEY,
        secretKey: process.env.UPBIT_SECRET_KEY
    },
    bithumb: {
        apiKey: process.env.BITHUMB_API_KEY,
        secretKey: process.env.BITHUMB_SECRET_KEY
    },
    ethereum: {
        rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo'
    }
};
//# sourceMappingURL=config.js.map