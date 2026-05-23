/**
 * Unified circuit breaker API: in-process per instance + optional Firestore coordination.
 * Uses dynamic import for Firestore store so non-server modules can import this safely.
 */

import { aiCircuitBreaker } from '@/lib/aiCircuitBreaker';

const DEFAULT_KEY = 'global';

function distributedCircuitStoreEnabled(): boolean {
  return process.env.AI_CIRCUIT_STORE === 'firestore' && process.env.CAPACITOR_BUILD !== '1';
}

export async function assertAiCircuitClosed(providerKey: string = DEFAULT_KEY): Promise<void> {
  aiCircuitBreaker.assertClosed();
  if (!distributedCircuitStoreEnabled()) return;
  const { assertDistributedCircuitClosed } = await import('@/lib/aiCircuitBreakerStore');
  await assertDistributedCircuitClosed(providerKey);
}

export async function recordAiCircuitSuccess(providerKey: string = DEFAULT_KEY): Promise<void> {
  aiCircuitBreaker.recordSuccess();
  if (!distributedCircuitStoreEnabled()) return;
  const { recordDistributedCircuitSuccess } = await import('@/lib/aiCircuitBreakerStore');
  await recordDistributedCircuitSuccess(providerKey);
}

export async function recordAiCircuitFailure(providerKey: string = DEFAULT_KEY): Promise<void> {
  aiCircuitBreaker.recordFailure();
  if (!distributedCircuitStoreEnabled()) return;
  const { recordDistributedCircuitFailure } = await import('@/lib/aiCircuitBreakerStore');
  await recordDistributedCircuitFailure(providerKey);
}

export async function isAiCircuitOpen(providerKey: string = DEFAULT_KEY): Promise<boolean> {
  if (aiCircuitBreaker.isOpen()) return true;
  if (!distributedCircuitStoreEnabled()) return false;
  const { isDistributedCircuitOpen } = await import('@/lib/aiCircuitBreakerStore');
  return isDistributedCircuitOpen(providerKey);
}
