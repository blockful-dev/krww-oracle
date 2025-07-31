export declare enum SupportedToken {
    BTC = "BTC",
    ETH = "ETH",
    SOL = "SOL",
    XRP = "XRP"
}
export declare enum PriceFeedSource {
    BINANCE = "BINANCE",
    UPBIT = "UPBIT",
    BITHUMB = "BITHUMB",
    PYTH = "PYTH",
    CHAINLINK = "CHAINLINK"
}
export interface PriceData {
    symbol: SupportedToken;
    price: number;
    timestamp: number;
    source: PriceFeedSource;
    confidence?: number;
    volume24h?: number;
}
export interface AggregatedPrice {
    symbol: SupportedToken;
    price: number;
    timestamp: number;
    sources: PriceFeedSource[];
    confidence: number;
    priceFeeds: PriceData[];
    weightedAverage: number;
    standardDeviation: number;
}
export interface FeedConfig {
    enabled: boolean;
    weight: number;
    timeout: number;
    retryAttempts: number;
}
export interface OracleConfig {
    feeds: {
        [key in PriceFeedSource]: FeedConfig;
    };
    aggregation: {
        minSources: number;
        outlierThreshold: number;
        maxPriceAge: number;
    };
    server: {
        port: number;
        updateInterval: number;
    };
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: number;
}
export declare abstract class PriceFeedProvider {
    abstract name: PriceFeedSource;
    abstract getSupportedTokens(): SupportedToken[];
    abstract fetchPrice(token: SupportedToken): Promise<PriceData>;
    abstract isHealthy(): Promise<boolean>;
}
//# sourceMappingURL=index.d.ts.map