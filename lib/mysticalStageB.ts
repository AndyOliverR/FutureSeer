import { adminDb, batchSetDocuments, getDocument, setDocument } from '@/lib/firebase-admin';
import { userRootDocSet } from '@/lib/userSubcollectionFirestore';
import { generateAllReports, getCoreStageToolCount } from '@/lib/reportGenerationService';
import {
  ALL_TOOL_SLUGS,
  classifyToolReportState,
  summarizeToolReadiness,
  type ReportReadinessState,
} from '@/lib/profileGenerationOrchestrator';
import { clearCachedDivinationData } from '@/lib/universalDataAggregator';
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

function cleanData(obj: unknown): unknown {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((item) => cleanData(item));
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (value !== undefined) {
      cleaned[key] = cleanData(value);
    }
  }
  return cleaned;
}

function stableStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function isRealReport(report: unknown): boolean {
  if (!report || typeof report !== 'object') return false;
  return (report as { placeholder?: boolean }).placeholder !== true;
}

function deriveToolStatus(report: unknown): PersistedToolStatus {
  const state = classifyToolReportState(report);
  return { state };
}

function buildToolStatusMap(
  profile: Record<string, unknown>,
  now: number,
  attempts: number,
  existingToolStatus: PersistedToolStatusMap = {},
): PersistedToolStatusMap {
  const next: PersistedToolStatusMap = {};
  for (const slug of ALL_TOOL_SLUGS) {
    const report = profile[slug];
    const derived = deriveToolStatus(report);
    const prev = existingToolStatus[slug];
    next[slug] = {
      state: derived.state,
      startedAt: prev?.startedAt ?? now,
      updatedAt: now,
      generatedAt: derived.state === 'ready' ? now : prev?.generatedAt,
      attempts,
      error: derived.state === 'failed' ? prev?.error ?? 'Generation failed' : null,
      unchanged: false,
    };
  }
  return next;
}

export async function runMysticalStageBJob(params: {
  uid: string;
  profileWithUid: UserProfile;
  profileHash: string;
  claimId: string;
  attempt: number;
  pipelineMode?: 'legacy_staged' | 'unified';
}): Promise<void> {
  const { uid, profileWithUid, profileHash, claimId, attempt, pipelineMode = 'legacy_staged' } = params;
  const now = Date.now();
  const coreCount = pipelineMode === 'unified' ? 0 : getCoreStageToolCount();
  const totalTools = ALL_TOOL_SLUGS.length;

  await setDocument('generationJobs', uid, {
    uid,
    status: 'running',
    phase: pipelineMode === 'unified' ? 'running' : 'stageB',
    startedAt: now,
    updatedAt: now,
    attempts: attempt,
    claimId,
    profileHash,
    lastHeartbeatAt: now,
  });

  await setDocument('generationLocks', uid, {
    status: 'running',
    phase: pipelineMode === 'unified' ? 'running' : 'stageB',
    totalTools,
    completedTools: coreCount,
    startedAt: now,
    updatedAt: now,
    lastHeartbeatAt: now,
  });

  const result = await generateAllReports(uid, profileWithUid, {
    onToolHeartbeat: async ({ toolSlug, startedAt, heartbeatAt, elapsedMs }) => {
      await setDocument('generationLocks', uid, {
        status: 'running',
        phase: 'stageB',
        currentToolSlug: toolSlug,
        currentToolStartedAt: startedAt,
        currentToolElapsedMs: elapsedMs,
        lastHeartbeatAt: heartbeatAt,
        updatedAt: heartbeatAt,
      });
      await setDocument('generationJobs', uid, {
        status: 'running',
        phase: 'stageB',
        currentToolSlug: toolSlug,
        currentToolStartedAt: startedAt,
        currentToolElapsedMs: elapsedMs,
        lastHeartbeatAt: heartbeatAt,
        updatedAt: heartbeatAt,
      });
    },
    onToolRun: async ({ toolSlug, entry }) => {
      const updatedAt = Date.now();
      const existingProfile = ((await getDocument('comprehensiveMysticalProfiles', uid)) || {}) as Record<string, unknown>;
      const nextProfile: Record<string, unknown> = { ...existingProfile };
      if (entry.status === 'success' && entry.data && typeof entry.data === 'object') {
        nextProfile[toolSlug] = entry.data;
      }
      const existingToolStatus = (nextProfile.toolStatus as PersistedToolStatusMap | undefined) ?? {};
      const nextState = entry.status === 'failed' ? 'failed' : classifyToolReportState(entry.data);
      const nextToolStatus: PersistedToolStatusMap = {
        ...existingToolStatus,
        [toolSlug]: {
          ...(existingToolStatus[toolSlug] ?? {}),
          state: nextState,
          startedAt: existingToolStatus[toolSlug]?.startedAt ?? updatedAt,
          updatedAt,
          generatedAt: nextState === 'ready' ? updatedAt : existingToolStatus[toolSlug]?.generatedAt,
          attempts: attempt,
          error: entry.status === 'failed' ? entry.error ?? 'Generation failed' : null,
          unchanged: false,
        },
      };
      nextProfile.toolStatus = nextToolStatus;
      nextProfile.lastProgressAt = updatedAt;
      const profilePatch: Record<string, unknown> = {
        toolStatus: nextToolStatus,
        lastProgressAt: updatedAt,
      };
      if (entry.status === 'success' && nextProfile[toolSlug] !== undefined) {
        profilePatch[toolSlug] = nextProfile[toolSlug];
      }
      await setDocument('comprehensiveMysticalProfiles', uid, profilePatch);
      const readiness = summarizeToolReadiness(nextProfile, ALL_TOOL_SLUGS);
      await userRootDocSet(
        uid,
        {
          toolStatus: nextToolStatus,
          allReportsReady: readiness.allReportsReady,
          pendingToolSlugs: readiness.pendingToolSlugs,
          corePhaseCompleted: readiness.readyToolsCount >= coreCount,
          coreReadyCount: Math.min(readiness.readyToolsCount, coreCount),
          longTailReadyCount: Math.max(0, readiness.readyToolsCount - coreCount),
          lastProgressAt: updatedAt,
          updatedAt,
        },
        { merge: true }
      );
    },
    onProgress: async ({ completedTools, toolSlug }) => {
      const stageBCompleted = Math.max(0, completedTools - coreCount);
      const stageBTotal = Math.max(0, totalTools - coreCount);
      const overallCompleted = Math.min(totalTools, coreCount + stageBCompleted);
      const updatedAt = Date.now();
      const existingJob = ((await getDocument('generationJobs', uid)) || {}) as Record<string, unknown>;
      const nextToolStatus = ((existingJob.toolStatus || {}) as PersistedToolStatusMap);
      if (toolSlug) {
        nextToolStatus[toolSlug] = {
          ...(nextToolStatus[toolSlug] ?? {}),
          state: 'running',
          startedAt: nextToolStatus[toolSlug]?.startedAt ?? updatedAt,
          updatedAt,
          attempts: attempt,
          error: null,
          unchanged: false,
        };
      }
      await setDocument('generationLocks', uid, {
        status: 'running',
        phase: pipelineMode === 'unified' ? 'running' : 'stageB',
        completedTools: overallCompleted,
        totalTools,
        stageBCompletedTools: stageBCompleted,
        stageBTotalTools: stageBTotal,
        currentToolSlug: toolSlug,
        currentToolElapsedMs: 0,
        lastHeartbeatAt: updatedAt,
        updatedAt,
      });
      await setDocument('generationJobs', uid, {
        status: 'running',
        phase: pipelineMode === 'unified' ? 'running' : 'stageB',
        completedTools: overallCompleted,
        totalTools,
        currentToolSlug: toolSlug,
        currentToolElapsedMs: 0,
        toolStatus: nextToolStatus,
        lastHeartbeatAt: updatedAt,
        lastProgressAt: updatedAt,
        updatedAt,
      });
    },
  });

  const finalToStore = cleanData(result.comprehensiveProfile) as Record<string, unknown>;
  delete (finalToStore as Record<string, unknown>).toolReports;
  const existingProfile = ((await getDocument('comprehensiveMysticalProfiles', uid)) || {}) as Record<string, unknown>;
  const existingStatus = (existingProfile.toolStatus || {}) as PersistedToolStatusMap;
  const unchangedSlugs: string[] = [];
  for (const slug of ALL_TOOL_SLUGS) {
    const existingVal = existingProfile[slug];
    const newVal = finalToStore[slug];
    const newIsPlaceholder =
      newVal != null && typeof newVal === 'object' && (newVal as { placeholder?: boolean }).placeholder === true;
    if (newIsPlaceholder && isRealReport(existingVal)) {
      finalToStore[slug] = existingVal;
      unchangedSlugs.push(slug);
      continue;
    }
    const existingHash = stableStringify(existingVal);
    const newHash = stableStringify(newVal);
    if (existingVal != null && newVal != null && existingHash === newHash) {
      unchangedSlugs.push(slug);
    }
  }
  const nowTs = Date.now();
  const toolStatus = buildToolStatusMap(finalToStore, nowTs, attempt, existingStatus);
  for (const slug of unchangedSlugs) {
    const prevGeneratedAt = existingStatus[slug]?.generatedAt;
    toolStatus[slug] = {
      ...toolStatus[slug],
      unchanged: true,
      generatedAt: prevGeneratedAt ?? toolStatus[slug]?.generatedAt,
    };
  }
  finalToStore.toolStatus = toolStatus;
  const finalReadiness = summarizeToolReadiness(finalToStore as Record<string, unknown>, ALL_TOOL_SLUGS);
  const batchSuccessFinal = await batchSetDocuments([
    { collection: 'comprehensiveMysticalProfiles', docId: uid, data: finalToStore },
    {
      collection: 'users',
      docId: uid,
      data: {
        mysticalProfileGenerated: true,
        mysticalProfileGeneratedAt: Date.now(),
        profileDataHash: profileHash,
        profileStatus: 'completed',
        allReportsReady: finalReadiness.allReportsReady,
        pendingToolSlugs: finalReadiness.pendingToolSlugs,
        toolStatus,
        corePhaseCompleted: finalReadiness.readyToolsCount >= coreCount,
        coreReadyCount: Math.min(finalReadiness.readyToolsCount, coreCount),
        longTailReadyCount: Math.max(0, finalReadiness.readyToolsCount - coreCount),
        lastProgressAt: nowTs,
        updatedAt: Date.now(),
      },
    },
    {
      collection: 'seerMaster',
      docId: uid,
      data: {
        ...result.seerMaster,
        userId: uid,
        generatedAt: new Date().toISOString(),
        systemsUsed: result.systemsUsed,
      },
    },
  ]);
  if (!batchSuccessFinal) {
    throw new Error('Failed to save Stage B data.');
  }

  const completedAt = Date.now();
  await setDocument('generationLocks', uid, {
    lockedAt: null,
    status: 'completed',
    phase: 'completed',
    completedAt,
    completedTools: ALL_TOOL_SLUGS.length,
    totalTools: ALL_TOOL_SLUGS.length,
    readyToolsCount: finalReadiness.readyToolsCount,
    pendingToolSlugs: finalReadiness.pendingToolSlugs,
    allReportsReady: finalReadiness.allReportsReady,
    toolStatus,
    updatedAt: completedAt,
  });
  await setDocument('generationJobs', uid, {
    status: 'completed',
    phase: 'completed',
    completedAt,
    completedTools: ALL_TOOL_SLUGS.length,
    totalTools: ALL_TOOL_SLUGS.length,
    readyToolsCount: finalReadiness.readyToolsCount,
    pendingToolSlugs: finalReadiness.pendingToolSlugs,
    allReportsReady: finalReadiness.allReportsReady,
    updatedAt: completedAt,
  });
  clearCachedDivinationData(uid);
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
  const claim = await claimMysticalStageBJob(uid);
  if (claim.status !== 'claimed' || !claim.profileWithUid || !claim.profileHash || !claim.claimId || !claim.attempt) {
    return { started: false, reason: claim.reason ?? claim.status };
  }
  void runMysticalStageBJob({
    uid,
    profileWithUid: claim.profileWithUid,
    profileHash: claim.profileHash,
    claimId: claim.claimId,
    attempt: claim.attempt,
    pipelineMode: claim.pipelineMode ?? 'legacy_staged',
  }).catch((err) => failMysticalStageBJob(uid, err, { claimId: claim.claimId, attempt: claim.attempt }));
  return { started: true };
}
