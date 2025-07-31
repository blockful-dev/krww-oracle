"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const oracle_1 = require("./services/oracle");
const routes_1 = require("./api/routes");
const config_1 = require("./utils/config");
const logger_1 = require("./utils/logger");
async function main() {
    const app = (0, express_1.default)();
    const oracleService = new oracle_1.OracleService();
    app.use(express_1.default.json());
    app.use((_req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });
    app.use('/api/v1', (0, routes_1.createRoutes)(oracleService));
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
    const server = app.listen(config_1.config.server.port, () => {
        logger_1.logger.info(`KRWW Oracle server running on port ${config_1.config.server.port}`);
    });
    await oracleService.start();
    process.on('SIGTERM', async () => {
        logger_1.logger.info('Received SIGTERM, shutting down gracefully');
        await oracleService.stop();
        server.close(() => {
            logger_1.logger.info('Server closed');
            process.exit(0);
        });
    });
    process.on('SIGINT', async () => {
        logger_1.logger.info('Received SIGINT, shutting down gracefully');
        await oracleService.stop();
        server.close(() => {
            logger_1.logger.info('Server closed');
            process.exit(0);
        });
    });
}
main().catch((error) => {
    logger_1.logger.error('Failed to start application:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map