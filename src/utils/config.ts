import dotenv from 'dotenv';
import { OracleConfig, PriceFeedSource } from '../types';

dotenv.config();

export const config: OracleConfig = {
  feeds: {
    [PriceFeedSource.BINANCE]: {
      enabled: true,
      weight: 0.25,
      timeout: 5000,
      retryAttempts: 3
    },
    [PriceFeedSource.UPBIT]: {
      enabled: true,
      weight: 0.2,
      timeout: 5000,
      retryAttempts: 3
    },
    [PriceFeedSource.BITHUMB]: {
      enabled: true,
      weight: 0.2,
      timeout: 5000,
      retryAttempts: 3
    },
    [PriceFeedSource.PYTH]: {
      enabled: true,
      weight: 0.2,
      timeout: 8000,
      retryAttempts: 2
    },
    [PriceFeedSource.CHAINLINK]: {
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

export const apiKeys = {
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