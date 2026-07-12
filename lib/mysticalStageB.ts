import { adminDb, getDocument, setDocument } from '@/lib/firebase-admin';
import {
  processMysticalStageBQueue,
  isStageBWorkerSkipped,
  runStageBWorkerForUser,
  scheduleStageBContinuation,
} from '@/lib/mysticalStageBQueue';
import { type ReportReadinessState } from '@/lib/profileGenerationOrchestrator';
import { devLog } from '@/lib/devLogger';
import type { UserProfile } from '@/lib/firebase';

const STAGE_B_MAX_ATTEMPTS = 3;
const STAGE_B_BASE_RETRY_MS = 30_000;
const STAGE_B_HEARTBEAT_STALE_MS = 45_000;

type StageBClaimStatus = 'claimed' | 'not_claimed' | 'retry_wait' | 'max_attempts';
type StageBJobRecord = Record<string, unknown> & {
  profileSnapshot?: UserProfile;
  profileHash?: string;
  attempts?: number;
  status?: string;
  nextRetryAt?: number;
  claimId?: string;
  lastHeartbeatAt?: number;
  pipelineMode?: 'legacy_staged' | 'unified';
};
export type PersistedToolState = ReportReadinessState | 'running';
export type PersistedToolStatus = {
  state: PersistedToolState;
  startedAt?: number;
  updatedAt?: number;
  generatedAt?: number;
  attempts?: number;
  error?: string | null;
  unchanged?: boolean;
};
export type PersistedToolStatusMap = Record<string, PersistedToolStatus>;

export async function runMysticalStageBJob(params: {
  uid: string;
  profileWithUid: UserProfile;
  profileHash: string;
  claimId: string;
  attempt: number;
  pipelineMode?: 'legacy_staged' | 'unified';
}): Promise<void> {
  const result = await processMysticalStageBQueue(params);
  if (!result.done) {
    await scheduleStageBContinuation(params.uid);
  }
}

function computeNextRetryAt(attempt: number, nowMs = Date.now()): number {
  const exp = Math.max(1, attempt);
  const jitter = Math.floor(Math.random() * 5_000);
  return nowMs + STAGE_B_BASE_RETRY_MS * exp + jitter;
}

export async function claimMysticalStageBJob(
  uid: string,
  allowedStatuses: ReadonlyArray<string> = ['queued', 'failed', 'stale_running'],
): Promise<
  | {
      status: StageBClaimStatus;
      claimId?: string;
      attempt?: number;
      profileWithUid?: UserProfile;
      profileHash?: string;
      pipelineMode?: 'legacy_staged' | 'unified';
      reason?: string;
    }
  | { status: 'not_claimed'; reason: string }
> {
  const db = adminDb;
  if (!db) {
    return { status: 'not_claimed', reason: 'admin_db_unavailable' };
  }
  const claimId = `${uid}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const result = await db.runTransaction<
    | { status: 'not_claimed'; reason: string }
    | { status: 'retry_wait'; reason: string }
    | { status: 'max_attempts'; reason: string }
    | {
        status: 'claimed';
        claimId: string;
        attempt: number;
        profileWithUid: UserProfile;
        profileHash: string;
        pipelineMode: 'legacy_staged' | 'unified';
      }
  >(async (transaction) => {
    const ref = db.collection('generationJobs').doc(uid);
    const snap = await transaction.get(ref);
    const job = (snap.data() ?? {}) as StageBJobRecord;
    const status = typeof job.status === 'string' ? job.status : '';
    const attempts = Number(job.attempts ?? 0);
    const nextRetryAt = Number(job.nextRetryAt ?? 0);
    const lastHeartbeatAt = Number(job.lastHeartbeatAt ?? 0);
    const now = Date.now();
    if (status === 'running') {
      const staleRunning = lastHeartbeatAt > 0 && now - lastHeartbeatAt > STAGE_B_HEARTBEAT_STALE_MS;
      if (!staleRunning) {
        return { status: 'not_claimed' as const, reason: 'status_running' };
      }
    } else if (!allowedStatuses.includes(status)) {
      return { status: 'not_claimed' as const, reason: `status_${status || 'unknown'}` };
    }
    if (nextRetryAt > now) {
      return { status: 'retry_wait' as const, reason: 'backoff_active' };
    }
    if (attempts >= STAGE_B_MAX_ATTEMPTS) {
      return { status: 'max_attempts' as const, reason: 'max_attempts_reached' };
    }
    const profileWithUid = job.profileSnapshot;
    const profileHash = typeof job.profileHash === 'string' ? job.profileHash : '';
    const pipelineMode: 'legacy_staged' | 'unified' =
      job.pipelineMode === 'unified' ? 'unified' : 'legacy_staged';
    if (!profileWithUid || !profileHash) {
      return { status: 'not_claimed' as const, reason: 'missing_profile_snapshot' };
    }
    const nextAttempt = attempts + 1;
    transaction.set(
      ref,
      {
        uid,
        status: 'running',
        phase: 'stageB',
        claimId,
        claimedAt: now,
        attempts: nextAttempt,
        updatedAt: now,
        startedAt: typeof job.startedAt === 'number' ? job.startedAt : now,
        nextRetryAt: null,
        lastError: null,
      },
      { merge: true },
    );
    return {
      status: 'claimed' as const,
      claimId,
      attempt: nextAttempt,
      profileWithUid,
      profileHash,
      pipelineMode,
    };
  });
  return result;
}

export async function failMysticalStageBJob(
  uid: string,
  error: unknown,
  options?: { claimId?: string; attempt?: number },
): Promise<void> {
  const errorMessage = error instanceof Error ? error.message : 'Unknown stageB failure';
  const claimId = options?.claimId;
  const attempt = typeof options?.attempt === 'number' ? options.attempt : 1;
  const isFinalAttempt = attempt >= STAGE_B_MAX_ATTEMPTS;
  const nextRetryAt = isFinalAttempt ? null : computeNextRetryAt(attempt);
  if (claimId) {
    const job = (await getDocument('generationJobs', uid)) as StageBJobRecord | null;
    if (job?.claimId && job.claimId !== claimId) {
      return;
    }
  }
  devLog.error('[generate-mystical] Stage B continuation failed', error, 'generate-mystical');
  await setDocument('generationLocks', uid, {
    lockedAt: null,
    status: 'failed',
    phase: 'failed',
    failedAt: Date.now(),
    updatedAt: Date.now(),
  });
  await setDocument('generationJobs', uid, {
    status: isFinalAttempt ? 'failed_terminal' : 'failed',
    phase: 'failed',
    error: errorMessage,
    lastError: errorMessage,
    nextRetryAt,
    maxAttempts: STAGE_B_MAX_ATTEMPTS,
    failedAt: Date.now(),
    updatedAt: Date.now(),
  });
}

export async function tryResumeMysticalStageB(uid: string): Promise<{
  started: boolean;
  reason?: string;
}> {
  const outcome = await runStageBWorkerForUser(uid);
  if (isStageBWorkerSkipped(outcome)) {
    return { started: false, reason: outcome.reason };
  }
  if (!outcome.done) {
    await scheduleStageBContinuation(uid);
  }
  return { started: true };
}
