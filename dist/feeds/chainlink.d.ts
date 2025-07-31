import { PriceFeedProvider, PriceData, PriceFeedSource, SupportedToken } from '../types';
export declare class ChainlinkFeed extends PriceFeedProvider {
    name: PriceFeedSource;
    private provider;
    private aggregatorAddresses;
    constructor();
    getSupportedTokens(): SupportedToken[];
    fetchPrice(token: SupportedToken): Promise<PriceData>;
    isHealthy(): Promise<boolean>;
}
//# sourceMappingURL=chainlink.d.ts.map