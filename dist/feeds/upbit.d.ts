import { PriceFeedProvider, PriceData, PriceFeedSource, SupportedToken } from '../types';
export declare class UpbitFeed extends PriceFeedProvider {
    name: PriceFeedSource;
    private baseUrl;
    private symbolMap;
    getSupportedTokens(): SupportedToken[];
    fetchPrice(token: SupportedToken): Promise<PriceData>;
    private getUSDKRWRate;
    isHealthy(): Promise<boolean>;
}
//# sourceMappingURL=upbit.d.ts.map