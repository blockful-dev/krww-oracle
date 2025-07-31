import { Router, Request, Response } from 'express';
import { OracleService } from '../services/oracle';
import { SupportedToken, ApiResponse } from '../types';
import { logger } from '../utils/logger';

export function createRoutes(oracleService: OracleService): Router {
  const router = Router();

  router.get('/health', async (_req: Request, res: Response) => {
    try {
      const healthStatus = await oracleService.getHealthStatus();
      const isServiceRunning = oracleService.isServiceRunning;
      
      const response: ApiResponse<any> = {
        success: true,
        data: {
          service: isServiceRunning ? 'running' : 'stopped',
          providers: healthStatus,
          timestamp: Date.now()
        },
        timestamp: Date.now()
      };

      res.json(response);
    } catch (error) {
      logger.error('Health check error:', error);
      const response: ApiResponse<any> = {
        success: false,
        error: 'Health check failed',
        timestamp: Date.now()
      };
      res.status(500).json(response);
    }
  });

  router.get('/price/:token', async (req: Request, res: Response) => {
    try {
      const token = req.params.token.toUpperCase() as SupportedToken;
      
      if (!Object.values(SupportedToken).includes(token)) {
        const response: ApiResponse<any> = {
          success: false,
          error: `Unsupported token: ${token}. Supported tokens: ${Object.values(SupportedToken).join(', ')}`,
          timestamp: Date.now()
        };
        res.status(400).json(response);
        return;
      }

      const aggregatedPrice = await oracleService.getPrice(token);
      
      const response: ApiResponse<any> = {
        success: true,
        data: aggregatedPrice,
        timestamp: Date.now()
      };

      res.json(response);
    } catch (error) {
      logger.error(`Price fetch error for ${req.params.token}:`, error);
      const response: ApiResponse<any> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch price',
        timestamp: Date.now()
      };
      res.status(500).json(response);
    }
  });

  router.get('/prices', async (_req: Request, res: Response) => {
    try {
      const allPrices = await oracleService.getAllPrices();
      const pricesObject = Object.fromEntries(allPrices);
      
      const response: ApiResponse<any> = {
        success: true,
        data: pricesObject,
        timestamp: Date.now()
      };

      res.json(response);
    } catch (error) {
      logger.error('All prices fetch error:', error);
      const response: ApiResponse<any> = {
        success: false,
        error: 'Failed to fetch prices',
        timestamp: Date.now()
      };
      res.status(500).json(response);
    }
  });

  router.get('/price/:token/history', async (_req: Request, res: Response) => {
    const response: ApiResponse<any> = {
      success: false,
      error: 'Historical data not implemented yet',
      timestamp: Date.now()
    };
    res.status(501).json(response);
  });

  router.get('/feeds/:token', async (req: Request, res: Response) => {
    try {
      const token = req.params.token.toUpperCase() as SupportedToken;
      
      if (!Object.values(SupportedToken).includes(token)) {
        const response: ApiResponse<any> = {
          success: false,
          error: `Unsupported token: ${token}`,
          timestamp: Date.now()
        };
        res.status(400).json(response);
        return;
      }

      const aggregatedPrice = await oracleService.getPrice(token);
      
      const response: ApiResponse<any> = {
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
    } catch (error) {
      logger.error(`Feeds fetch error for ${req.params.token}:`, error);
      const response: ApiResponse<any> = {
        success: false,
        error: 'Failed to fetch feed data',
        timestamp: Date.now()
      };
      res.status(500).json(response);
    }
  });

  return router;
}