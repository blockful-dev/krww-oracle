import express from 'express';
import { OracleService } from './services/oracle';
import { createRoutes } from './api/routes';
import { config } from './utils/config';
import { logger } from './utils/logger';

async function main() {
  const app = express();
  const oracleService = new OracleService();

  app.use(express.json());

  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  app.use('/api/v1', createRoutes(oracleService));

  app.get('/', (_req, res) => {
    res.json({
      name: 'KRWW Oracle',
      version: '1.0.0',
      description: 'Blockchain oracle aggregating price feeds from multiple sources',
      endpoints: {
        health: '/api/v1/health',
        price: '/api/v1/price/{token}',
        prices: '/api/v1/prices',
        feeds: '/api/v1/feeds/{token}'
      },
      supportedTokens: ['BTC', 'ETH', 'SOL', 'XRP'],
      sources: ['BINANCE', 'UPBIT', 'BITHUMB', 'PYTH', 'CHAINLINK']
    });
  });

  const server = app.listen(config.server.port, () => {
    logger.info(`KRWW Oracle server running on port ${config.server.port}`);
  });

  await oracleService.start();

  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down gracefully');
    await oracleService.stop();
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down gracefully');
    await oracleService.stop();
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });
}

main().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});