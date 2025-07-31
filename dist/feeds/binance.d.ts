import { PriceFeedProvider, PriceData, PriceFeedSource, SupportedToken } from '../types';
export declare class BinanceFeed extends PriceFeedProvider {
    name: PriceFeedSource;
    private baseUrl;
    private symbolMap;
    getSupportedTokens(): SupportedToken[];
    fetchPrice(token: SupportedToken): Promise<PriceData>;
    isHealthy(): Promise<boolean>;
}
//# sourceMappingURL=binance.d.ts.map