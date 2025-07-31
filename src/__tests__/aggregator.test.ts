import { PriceAggregator } from '../services/aggregator';
import { PriceData, SupportedToken, PriceFeedSource } from '../types';

describe('PriceAggregator', () => {
  let aggregator: PriceAggregator;

  beforeEach(() => {
    aggregator = new PriceAggregator();
  });

  const createMockPriceData = (
    symbol: SupportedToken,
    price: number,
    source: PriceFeedSource,
    timestamp: number = Date.now()
  ): PriceData => ({
    symbol,
    price,
    timestamp,
    source,
    confidence: 0.9
  });

  describe('aggregatePrice', () => {
    it('should aggregate prices from multiple sources', () => {
      const priceFeeds: PriceData[] = [
        createMockPriceData(SupportedToken.BTC, 50000, PriceFeedSource.BINANCE),
        createMockPriceData(SupportedToken.BTC, 50100, PriceFeedSource.UPBIT),
        createMockPriceData(SupportedToken.BTC, 49900, PriceFeedSource.BITHUMB)
      ];

      const result = aggregator.aggregatePrice(SupportedToken.BTC, priceFeeds);

      expect(result.symbol).toBe(SupportedToken.BTC);
      expect(result.price).toBeGreaterThan(49000);
      expect(result.price).toBeLessThan(51000);
      expect(result.sources).toHaveLength(3);
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should remove outlier prices', () => {
      const priceFeeds: PriceData[] = [
        createMockPriceData(SupportedToken.BTC, 50000, PriceFeedSource.BINANCE),
        createMockPriceData(SupportedToken.BTC, 50100, PriceFeedSource.UPBIT),
        createMockPriceData(SupportedToken.BTC, 60000, PriceFeedSource.BITHUMB) // Outlier
      ];

      const result = aggregator.aggregatePrice(SupportedToken.BTC, priceFeeds);

      expect(result.sources).toHaveLength(2);
      expect(result.sources).not.toContain(PriceFeedSource.BITHUMB);
    });

    it('should throw error with insufficient sources', () => {
      const priceFeeds: PriceData[] = [
        createMockPriceData(SupportedToken.BTC, 50000, PriceFeedSource.BINANCE)
      ];

      expect(() => {
        aggregator.aggregatePrice(SupportedToken.BTC, priceFeeds);
      }).toThrow('Insufficient price sources');
    });

    it('should filter out stale prices', () => {
      const staleTimestamp = Date.now() - 120000; // 2 minutes ago
      const priceFeeds: PriceData[] = [
        createMockPriceData(SupportedToken.BTC, 50000, PriceFeedSource.BINANCE),
        createMockPriceData(SupportedToken.BTC, 50100, PriceFeedSource.UPBIT),
        createMockPriceData(SupportedToken.BTC, 49900, PriceFeedSource.BITHUMB, staleTimestamp)
      ];

      const result = aggregator.aggregatePrice(SupportedToken.BTC, priceFeeds);

      expect(result.sources).toHaveLength(2);
      expect(result.sources).not.toContain(PriceFeedSource.BITHUMB);
    });
  });

  describe('getCachedPrice', () => {
    it('should return cached price if available and fresh', () => {
      const priceFeeds: PriceData[] = [
        createMockPriceData(SupportedToken.BTC, 50000, PriceFeedSource.BINANCE),
        createMockPriceData(SupportedToken.BTC, 50100, PriceFeedSource.UPBIT)
      ];

      const aggregated = aggregator.aggregatePrice(SupportedToken.BTC, priceFeeds);
      const cached = aggregator.getCachedPrice(SupportedToken.BTC);

      expect(cached).toBeDefined();
      expect(cached?.price).toBe(aggregated.price);
    });

    it('should return undefined for non-existent cached price', () => {
      const cached = aggregator.getCachedPrice(SupportedToken.ETH);
      expect(cached).toBeUndefined();
    });
  });
});