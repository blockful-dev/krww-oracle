import { SupportedToken, AggregatedPrice, PriceFeedSource } from '../types';
export declare class OracleService {
    private aggregator;
    private providers;
    private isRunning;
    private updateInterval?;
    constructor();
    start(): Promise<void>;
    stop(): Promise<void>;
    getPrice(token: SupportedToken): Promise<AggregatedPrice>;
    getAllPrices(): Promise<Map<SupportedToken, AggregatedPrice>>;
    getHealthStatus(): Promise<{
        [key in PriceFeedSource]: boolean;
    }>;
    private updateAllPrices;
    private fetchPriceFeeds;
    private performHealthChecks;
    private withTimeout;
    get isServiceRunning(): boolean;
}
//# sourceMappingURL=oracle.d.ts.map