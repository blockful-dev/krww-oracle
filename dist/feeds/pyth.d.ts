import { PriceFeedProvider, PriceData, PriceFeedSource, SupportedToken } from '../types';
export declare class PythFeed extends PriceFeedProvider {
    name: PriceFeedSource;
    private baseUrl;
    private priceIdMap;
    getSupportedTokens(): SupportedToken[];
    fetchPrice(token: SupportedToken): Promise<PriceData>;
    isHealthy(): Promise<boolean>;
}
//# sourceMappingURL=pyth.d.ts.map