import { PriceData, AggregatedPrice, SupportedToken } from '../types';
export declare class PriceAggregator {
    private cache;
    aggregatePrice(token: SupportedToken, priceFeeds: PriceData[]): AggregatedPrice;
    getCachedPrice(token: SupportedToken): AggregatedPrice | undefined;
    private removeOutliers;
    private calculateWeightedAverage;
    private calculateStandardDeviation;
    private calculateMedian;
    private calculateConfidence;
}
//# sourceMappingURL=aggregator.d.ts.map