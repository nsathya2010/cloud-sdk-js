import { timeout } from './timeout';
import { retry } from './retry';
import { circuitBreakerHttp } from './circuit-breaker';
import { Context } from './middleware';
import type { Middleware } from './middleware';
/**
 * Interface for Resilience Options.
 */
export interface ResilienceOptions {
  /**
   * Option for Retry Middleware.
   * False by default. If set to true, the number of retries is 3.
   * Assign a different value to set custom number of reties.
   */
  retry?: boolean | number;
  /**
   * Option for Timeout Middleware.
   * True by default, with a 10000 milliseconds timeout.
   * Assign a different value to set a custom timeout.
   */
  timeout?: boolean | number;
  /**
   * Option for CircuitBreaker Middleware.
   * True by default. Set false to disable.
   */
  circuitBreaker?: boolean;
}

const defaultResilienceOptions: ResilienceOptions = {
  retry: false,
  timeout: true,
  circuitBreaker: true
};

/**
 * Return the resilience middleware functions as an array.
 * By default, Timeout and Circuit Breaker are enabled and Retry is disabled.
 * This behavior can be overridden by adjusting the resilience options {@link ResilienceOptions}.
 * @param options - Resilience Options.
 * @returns Array of middleware functions.
 */
export function resilience<ReturnT, ContextT extends Context>(
  options?: ResilienceOptions
): Middleware<ReturnT, ContextT>[] {
  const resilienceOption = { ...defaultResilienceOptions, ...options };
  const middlewares: Middleware<ReturnT, ContextT>[] = [];
  if (typeof resilienceOption.timeout === 'number') {
    middlewares.push(timeout(resilienceOption.timeout));
  } else if (resilienceOption.timeout) {
    middlewares.push(timeout());
  }

  if (resilienceOption.circuitBreaker) {
    middlewares.push(circuitBreakerHttp());
  }

  if (typeof resilienceOption.retry === 'number') {
    middlewares.push(retry(resilienceOption.retry));
  } else if (resilienceOption.retry) {
    middlewares.push(retry());
  }
  return middlewares;
}
