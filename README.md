# KRWW Oracle

A blockchain oracle that aggregates cryptocurrency price feeds from multiple sources including centralized exchanges (Binance, Upbit, Bithumb) and decentralized oracles (Pyth Network, Chainlink).

## Features

- **Multiple Price Sources**: Binance, Upbit, Bithumb, Pyth Network, Chainlink
- **Supported Tokens**: BTC, ETH, SOL, XRP
- **Price Aggregation**: Weighted averages with outlier detection
- **Real-time Updates**: Configurable update intervals
- **REST API**: Easy-to-use HTTP endpoints
- **Health Monitoring**: Provider health checks
- **Error Handling**: Retry logic and graceful degradation
- **Logging**: Comprehensive logging with Winston

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment** (optional but recommended):
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and settings
   ```

3. **Build and run**:
   ```bash
   npm run build
   npm start
   ```

   Or for development:
   ```bash
   npm run dev
   ```

## API Endpoints

### Get Single Token Price
```
GET /api/v1/price/{token}
```
Example: `GET /api/v1/price/BTC`

### Get All Token Prices
```
GET /api/v1/prices
```

### Get Feed Details
```
GET /api/v1/feeds/{token}
```
Returns individual feed data and aggregation details.

### Health Check
```
GET /api/v1/health
```
Returns service status and provider health.

## Configuration

The oracle can be configured via environment variables or by modifying `src/utils/config.ts`.

### Environment Variables

```bash
# API Keys (optional but recommended for rate limits)
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET=your_binance_secret
UPBIT_ACCESS_KEY=your_upbit_access_key
UPBIT_SECRET_KEY=your_upbit_secret_key
BITHUMB_API_KEY=your_bithumb_api_key
BITHUMB_SECRET_KEY=your_bithumb_secret_key

# Ethereum RPC for Chainlink feeds
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Server Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

### Feed Configuration

Each price feed can be configured with:
- `enabled`: Whether to use this feed
- `weight`: Weight in price aggregation (0-1)
- `timeout`: Request timeout in milliseconds
- `retryAttempts`: Number of retry attempts

### Aggregation Settings

- `minSources`: Minimum number of sources required
- `outlierThreshold`: Threshold for outlier detection (e.g., 0.05 = 5%)
- `maxPriceAge`: Maximum age of price data in milliseconds

## Architecture

```
src/
├── types/          # TypeScript interfaces and enums
├── feeds/          # Price feed implementations
├── services/       # Core business logic
├── api/           # REST API routes
├── utils/         # Utilities (config, logging, retry)
└── index.ts       # Application entry point
```

## Price Aggregation

The oracle uses a sophisticated aggregation algorithm:

1. **Data Collection**: Fetches prices from all enabled sources
2. **Freshness Check**: Filters out stale data based on `maxPriceAge`
3. **Outlier Detection**: Removes prices that deviate significantly from the median
4. **Weighted Average**: Calculates weighted average based on:
   - Source weight configuration
   - Source confidence (if available)
   - Data freshness
5. **Confidence Calculation**: Derives overall confidence from:
   - Number of sources
   - Price variance
   - Individual source confidence

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint

# Type check
npm run typecheck
```

## Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## License

MIT License - see LICENSE file for details.