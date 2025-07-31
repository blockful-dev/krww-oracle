export interface RetryOptions {
    attempts: number;
    delay: number;
    backoffMultiplier?: number;
    maxDelay?: number;
}
export declare function withRetry<T>(operation: () => Promise<T>, options: RetryOptions, context?: string): Promise<T>;
export declare function createRetryWrapper(defaultOptions: Partial<RetryOptions>): <T>(operation: () => Promise<T>, options?: Partial<RetryOptions>, context?: string) => Promise<T>;
//# sourceMappingURL=retry.d.ts.map