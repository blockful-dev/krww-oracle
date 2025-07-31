"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRetryWrapper = exports.withRetry = void 0;
const logger_1 = require("./logger");
async function withRetry(operation, options, context = 'operation') {
    let lastError;
    let delay = options.delay;
    for (let attempt = 1; attempt <= options.attempts; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt === options.attempts) {
                logger_1.logger.error(`${context} failed after ${attempt} attempts:`, lastError);
                break;
            }
            logger_1.logger.warn(`${context} attempt ${attempt} failed, retrying in ${delay}ms:`, lastError.message);
            await new Promise(resolve => setTimeout(resolve, delay));
            if (options.backoffMultiplier && options.backoffMultiplier > 1) {
                delay = Math.min(delay * options.backoffMultiplier, options.maxDelay || delay * 10);
            }
        }
    }
    throw lastError;
}
exports.withRetry = withRetry;
function createRetryWrapper(defaultOptions) {
    return function retry(operation, options = {}, context) {
        const finalOptions = {
            attempts: 3,
            delay: 1000,
            backoffMultiplier: 2,
            maxDelay: 10000,
            ...defaultOptions,
            ...options
        };
        return withRetry(operation, finalOptions, context);
    };
}
exports.createRetryWrapper = createRetryWrapper;
//# sourceMappingURL=retry.js.map