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
            status?: string;
            idempotencyKey?: string | null;
          }
        | undefined;

      if (data?.lockedAt != null && typeof data.lockedAt === 'number' && data.status === 'running') {
        const age = now - data.lockedAt;
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
