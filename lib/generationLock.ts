/**
 * Firestore-backed lock for one-at-a-time mystical profile generation per user.
 */

import { adminDb } from '@/lib/firebase-admin';
import { devLog } from '@/lib/devLogger';

const COLLECTION = 'generationLocks';

export type MysticalGenerationAcquire =
  | 'acquired'
  | 'idempotent_in_progress'
  | 'concurrent';

export type MysticalLockRuntimeStatus = {
  isRunning: boolean;
  isStale: boolean;
  lockAgeMs: number | null;
};

export function getMysticalLockRuntimeStatus(
  lock: { status?: unknown; lockedAt?: unknown; updatedAt?: unknown } | null | undefined,
  staleMs: number,
  nowMs = Date.now(),
): MysticalLockRuntimeStatus {
  const status = typeof lock?.status === 'string' ? lock.status : '';
  const isRunning = status === 'running' || status === 'started';
  const updatedAt =
    typeof lock?.updatedAt === 'number'
      ? lock.updatedAt
      : typeof lock?.lockedAt === 'number'
        ? lock.lockedAt
        : null;
  if (!isRunning || updatedAt == null) {
    return { isRunning, isStale: false, lockAgeMs: null };
  }
  const lockAgeMs = Math.max(0, nowMs - updatedAt);
  return {
    isRunning,
    isStale: lockAgeMs > staleMs,
    lockAgeMs,
  };
}

/**
 * Try to acquire the generation lock. Stale locks older than `staleMs` are overwritten.
 * If the same `idempotencyKey` is replayed while a non-stale run is active, returns
 * `idempotent_in_progress` (caller should respond 202).
 */
export async function acquireMysticalGenerationLock(
  uid: string,
  idempotencyKey: string | undefined,
  staleMs: number
): Promise<MysticalGenerationAcquire> {
  if (!adminDb) return 'acquired';

  try {
    return await adminDb.runTransaction(async (transaction) => {
      const ref = adminDb!.collection(COLLECTION).doc(uid);
      const snap = await transaction.get(ref);
      const now = Date.now();
      const data = snap.data() as
        | {
            lockedAt?: number;
            updatedAt?: number;
            status?: string;
            idempotencyKey?: string | null;
          }
        | undefined;

      const runningUpdatedAt =
        typeof data?.updatedAt === 'number'
          ? data.updatedAt
          : typeof data?.lockedAt === 'number'
            ? data.lockedAt
            : null;
      if (runningUpdatedAt != null && data?.status === 'running') {
        const age = now - runningUpdatedAt;
        if (age < staleMs) {
          if (idempotencyKey && data.idempotencyKey === idempotencyKey) {
            return 'idempotent_in_progress';
          }
          return 'concurrent';
        }
        devLog.info(
          `[generationLock] Clearing stale lock for ${uid} (age ${age}ms > stale ${staleMs}ms)`,
          'generationLock'
        );
      }

      transaction.set(ref, {
        lockedAt: now,
        updatedAt: now,
        status: 'running',
        idempotencyKey: idempotencyKey ?? null,
      });
      return 'acquired';
    });
  } catch (e) {
    devLog.error('[generationLock] Transaction failed', e, 'generationLock');
    return 'concurrent';
  }
}
