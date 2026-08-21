/**
 * Stage B claim ownership fence.
 * Stale workers must not overwrite generationJobs after a 45s heartbeat reclaim.
 */

import 'server-only';

import { adminDb, getDocument } from '@/lib/firebase-admin';
import {
  StageBClaimLostError,
  isActiveStageBClaim,
  type StageBJobClaimFields,
} from '@/lib/mysticalStageBClaimPure';

export {
  StageBClaimLostError,
  isActiveStageBClaim,
  isStageBClaimLostError,
} from '@/lib/mysticalStageBClaimPure';

/** Read-time ownership check; prefer mergeGenerationJobIfClaimHeld for writes. */
export async function assertStageBClaimHeld(uid: string, claimId: string): Promise<void> {
  const job = (await getDocument('generationJobs', uid)) as StageBJobClaimFields | null;
  if (!isActiveStageBClaim(job, claimId)) {
    throw new StageBClaimLostError(uid, claimId);
  }
}

/**
 * Transactionally merge into generationJobs only if this claim still owns a running job.
 * Prevents stale workers from overwriting claimId / toolTasks after a 45s reclaim.
 */
export async function mergeGenerationJobIfClaimHeld(
  uid: string,
  claimId: string,
  patch: Record<string, unknown>,
): Promise<boolean> {
  const db = adminDb;
  if (!db) {
    // Without Admin, claim fencing cannot run — fail closed for Stage B writes.
    return false;
  }
  return db.runTransaction(async (transaction) => {
    const ref = db.collection('generationJobs').doc(uid);
    const snap = await transaction.get(ref);
    const job = (snap.data() ?? {}) as StageBJobClaimFields;
    if (!isActiveStageBClaim(job, claimId)) {
      return false;
    }
    const now = Date.now();
    transaction.set(
      ref,
      {
        ...patch,
        claimId,
        updatedAt: typeof patch.updatedAt === 'number' ? patch.updatedAt : now,
      },
      { merge: true },
    );
    return true;
  });
}
