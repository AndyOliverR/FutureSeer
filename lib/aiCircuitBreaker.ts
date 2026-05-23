/**
 * In-process circuit breaker for LLM provider calls (per server instance).
 * Fails fast when consecutive provider errors exceed threshold.
 */

import { devLog } from '@/lib/devLogger';

export type CircuitState = 'closed' | 'open' | 'half_open';

const DEFAULT_FAILURE_THRESHOLD = 5;
const DEFAULT_RECOVERY_SECONDS = 30;

export class AICircuitBreaker {
  private state: CircuitState = 'closed';
  private consecutiveFailures = 0;
  private lastFailureTime = 0;

  constructor(
    private readonly failureThreshold = DEFAULT_FAILURE_THRESHOLD,
    private readonly recoverySeconds = DEFAULT_RECOVERY_SECONDS,
  ) {}

  /** Returns true when requests must be rejected immediately. */
  isOpen(): boolean {
    if (this.state === 'open') {
      const elapsedSec = (Date.now() - this.lastFailureTime) / 1000;
      if (elapsedSec >= this.recoverySeconds) {
        this.state = 'half_open';
        devLog.warn('AI circuit half-open: probing provider', undefined, 'aiCircuitBreaker');
      }
    }
    return this.state === 'open';
  }

  getState(): CircuitState {
    this.isOpen();
    return this.state;
  }

  assertClosed(): void {
    if (this.isOpen()) {
      const err = new Error(
        'AI service is temporarily unavailable. Please try again in a moment.',
      ) as Error & { code: string; status: number };
      err.code = 'AI_CIRCUIT_OPEN';
      err.status = 503;
      throw err;
    }
  }

  recordSuccess(): void {
    if (this.state !== 'closed') {
      devLog.info('AI circuit closed after successful call', undefined, 'aiCircuitBreaker');
    }
    this.consecutiveFailures = 0;
    this.state = 'closed';
  }

  recordFailure(): void {
    this.consecutiveFailures += 1;
    this.lastFailureTime = Date.now();

    if (this.state === 'half_open') {
      this.state = 'open';
      devLog.warn('AI circuit re-opened after half-open failure', undefined, 'aiCircuitBreaker');
      return;
    }

    if (this.consecutiveFailures >= this.failureThreshold) {
      this.state = 'open';
      devLog.warn(
        `AI circuit opened after ${this.consecutiveFailures} consecutive failures`,
        undefined,
        'aiCircuitBreaker',
      );
    }
  }

  /** Test helper */
  reset(): void {
    this.state = 'closed';
    this.consecutiveFailures = 0;
    this.lastFailureTime = 0;
  }
}

/** Shared breaker for all aiGateway provider calls. */
export const aiCircuitBreaker = new AICircuitBreaker();
