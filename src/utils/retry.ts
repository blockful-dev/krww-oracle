import { logger } from './logger';

export interface RetryOptions {
  attempts: number;
  delay: number;
  backoffMultiplier?: number;
  maxDelay?: number;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions,
  context: string = 'operation'
): Promise<T> {
  let lastError: Error;
  let delay = options.delay;

  for (let attempt = 1; attempt <= options.attempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === options.attempts) {
        logger.error(`${context} failed after ${attempt} attempts:`, lastError);
        break;
      }

      logger.warn(`${context} attempt ${attempt} failed, retrying in ${delay}ms:`, lastError.message);

      await new Promise(resolve => setTimeout(resolve, delay));

      if (options.backoffMultiplier && options.backoffMultiplier > 1) {
        delay = Math.min(
          delay * options.backoffMultiplier,
          options.maxDelay || delay * 10
        );
      }
    }
  }

  throw lastError!;
}

export function createRetryWrapper(defaultOptions: Partial<RetryOptions>) {
  return function retry<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {},
    context?: string
  ): Promise<T> {
    const finalOptions: RetryOptions = {
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