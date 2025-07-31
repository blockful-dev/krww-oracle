"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoutes = void 0;
const express_1 = require("express");
const types_1 = require("../types");
const logger_1 = require("../utils/logger");
function createRoutes(oracleService) {
    const router = (0, express_1.Router)();
    router.get('/health', async (_req, res) => {
        try {
            const healthStatus = await oracleService.getHealthStatus();
            const isServiceRunning = oracleService.isServiceRunning;
            const response = {
                success: true,
                data: {
                    service: isServiceRunning ? 'running' : 'stopped',
                    providers: healthStatus,
                    timestamp: Date.now()
                },
                timestamp: Date.now()
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('Health check error:', error);
            const response = {
                success: false,
                error: 'Health check failed',
                timestamp: Date.now()
            };
            res.status(500).json(response);
        }
    });
    router.get('/price/:token', async (req, res) => {
        try {
            const token = req.params.token.toUpperCase();
            if (!Object.values(types_1.SupportedToken).includes(token)) {
                const response = {
                    success: false,
                    error: `Unsupported token: ${token}. Supported tokens: ${Object.values(types_1.SupportedToken).join(', ')}`,
                    timestamp: Date.now()
                };
                res.status(400).json(response);
                return;
            }
            const aggregatedPrice = await oracleService.getPrice(token);
            const response = {
                success: true,
                data: aggregatedPrice,
                timestamp: Date.now()
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error(`Price fetch error for ${req.params.token}:`, error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch price',
                timestamp: Date.now()
            };
            res.status(500).json(response);
        }
    });
    router.get('/prices', async (_req, res) => {
        try {
            const allPrices = await oracleService.getAllPrices();
            const pricesObject = Object.fromEntries(allPrices);
            const response = {
                success: true,
                data: pricesObject,
                timestamp: Date.now()
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error('All prices fetch error:', error);
            const response = {
                success: false,
                error: 'Failed to fetch prices',
                timestamp: Date.now()
            };
            res.status(500).json(response);
        }
    });
    router.get('/price/:token/history', async (_req, res) => {
        const response = {
            success: false,
            error: 'Historical data not implemented yet',
            timestamp: Date.now()
        };
        res.status(501).json(response);
    });
    router.get('/feeds/:token', async (req, res) => {
        try {
            const token = req.params.token.toUpperCase();
            if (!Object.values(types_1.SupportedToken).includes(token)) {
                const response = {
                    success: false,
                    error: `Unsupported token: ${token}`,
                    timestamp: Date.now()
                };
                res.status(400).json(response);
                return;
            }
            const aggregatedPrice = await oracleService.getPrice(token);
            const response = {
                success: true,
                data: {
                    token,
                    feeds: aggregatedPrice.priceFeeds,
                    aggregation: {
                        weightedAverage: aggregatedPrice.weightedAverage,
                        standardDeviation: aggregatedPrice.standardDeviation,
                        confidence: aggregatedPrice.confidence
                    }
                },
                timestamp: Date.now()
            };
            res.json(response);
        }
        catch (error) {
            logger_1.logger.error(`Feeds fetch error for ${req.params.token}:`, error);
            const response = {
                success: false,
                error: 'Failed to fetch feed data',
                timestamp: Date.now()
            };
            res.status(500).json(response);
        }
    });
    return router;
}
exports.createRoutes = createRoutes;
//# sourceMappingURL=routes.js.map