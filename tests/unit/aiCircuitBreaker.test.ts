import { AICircuitBreaker } from '@/lib/aiCircuitBreaker';

describe('AICircuitBreaker', () => {
  it('opens after consecutive failures and rejects while open', () => {
    const breaker = new AICircuitBreaker(3, 60);
    breaker.recordFailure();
    breaker.recordFailure();
    expect(breaker.isOpen()).toBe(false);
    breaker.recordFailure();
    expect(breaker.isOpen()).toBe(true);
    expect(() => breaker.assertClosed()).toThrow(/temporarily unavailable/);
  });

  it('closes after a successful call', () => {
    const breaker = new AICircuitBreaker(2, 60);
    breaker.recordFailure();
    breaker.recordFailure();
    expect(breaker.isOpen()).toBe(true);
    breaker.recordSuccess();
    expect(breaker.isOpen()).toBe(false);
  });
});
