/**
 * Durable per-tool queue for mystical profile Stage B.
 * State lives on generationJobs/{uid}.toolTasks; workers drain via process API + cron.
 */

import 'server-only';

import { adminDb, getDocument, setDocument } from '@/lib/firebase-admin';
import { devLog } from '@/lib/devLogger';
import { getServerBaseUrl } from '@/lib/serverBaseUrl';
import {
  ALL_TOOL_SLUGS,
  classifyToolReportState,
  summarizeToolReadiness,
  toolReportsFromComprehensiveProfile,
  runProfileGenerationToolSlugs,
  finalizeProfileGenerationFromToolReports,
} from '@/lib/profileGenerationOrchestrator';
import type { UserProfile } from '@/lib/firebase';
import type { PersistedToolStatus, PersistedToolStatusMap } from '@/lib/mysticalStageB';
import { userRootDocSet } from '@/lib/userSubcollectionFirestore';
import {
  buildInitialToolQueue,
  buildToolIdempotencyKey,
  isToolReportReadyForHash,
  selectRunnableToolSlugs,
  TOOL_QUEUE_MAX_ATTEMPTS,
  type ToolQueueMap,
  type ToolQueueTask,
  type ToolQueueTaskStatus,
} from '@/lib/mysticalStageBQueuePure';

export type { ToolQueueMap, ToolQueueTask, ToolQueueTaskStatus };
export {
  buildInitialToolQueue,
  buildToolIdempotencyKey,
  isToolReportReadyForHash,
  selectRunnableToolSlugs,
};

const TOOL_MAX_ATTEMPTS = TOOL_QUEUE_MAX_ATTEMPTS;
const TOOL_RETRY_BASE_MS = 15_000;
const WORKER_TIME_BUDGET_MS = 240_000;

function computeToolRetryAt(attempt: number, nowMs = Date.now()): number {
  return nowMs + TOOL_RETRY_BASE_MS * Math.max(1, attempt) + Math.floor(Math.random() * 3_000);
}

function resolveToolConcurrency(): number {
  const raw =
    typeof process.env.MYSTICAL_TOOL_RUN_CONCURRENCY === 'string'
      ? parseInt(process.env.MYSTICAL_TOOL_RUN_CONCURRENCY, 10)
      : Number.NaN;
  return Number.isFinite(raw) && raw >= 1 ? Math.min(8, Math.floor(raw)) : 4;
}

export async function ensureToolQueueInitialized(
  uid: string,
  profileHash: string,
  profileSnapshot: UserProfile,
): Promise<ToolQueueMap> {
  const job = ((await getDocument('generationJobs', uid)) || {}) as Record<string, unknown>;
  const existing = job.toolTasks as ToolQueueMap | undefined;
  const profileDoc = ((await getDocument('comprehensiveMysticalProfiles', uid)) || {}) as Record<
    string,
    unknown
  >;
  if (existing && Object.keys(existing).length >= ALL_TOOL_SLUGS.length) {
    const hash = typeof job.profileHash === 'string' ? job.profileHash : '';
    if (hash === profileHash) return existing;
  }
  const queue = buildInitialToolQueue(profileDoc, profileHash);
  await setDocument('generationJobs', uid, {
    toolTasks: queue,
    profileHash,
    profileSnapshot,
    queueVersion: 1,
    updatedAt: Date.now(),
  });
  return queue;
}

export async function scheduleStageBContinuation(uid: string): Promise<void> {
  const base = getServerBaseUrl();
  const secret = process.env.CRON_SECRET?.trim();
  if (!base || !secret || process.env.CAPACITOR_BUILD === '1') {
    const { tryResumeMysticalStageB } = await import('@/lib/mysticalStageB');
    void tryResumeMysticalStageB(uid).catch((e) => {
      devLog.warn('[mysticalStageBQueue] in-process resume failed', e, 'mysticalStageBQueue');
    });
    return;
  }
  const url = `${base}/api/internal/mystical-stage-b/process`;
  void fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uid }),
  }).catch((e) => {
    devLog.warn('[mysticalStageBQueue] worker fetch failed, will rely on cron/GET resume', e, 'mysticalStageBQueue');
  });
}

export type ProcessStageBQueueResult = {
  done: boolean;
  processedTools: number;
  remainingTools: number;
  finalized: boolean;
};

export type StageBWorkerSkipped = { skipped: true; reason: string };

export type StageBWorkerOutcome = ProcessStageBQueueResult | StageBWorkerSkipped;

export function isStageBWorkerSkipped(outcome: StageBWorkerOutcome): outcome is StageBWorkerSkipped {
  return (outcome as StageBWorkerSkipped).skipped === true;
}

export async function processMysticalStageBQueue(params: {
  uid: string;
  profileWithUid: UserProfile;
  profileHash: string;
  claimId: string;
  attempt: number;
  pipelineMode?: 'legacy_staged' | 'unified';
}): Promise<ProcessStageBQueueResult> {
  const { uid, profileWithUid, profileHash, claimId, attempt, pipelineMode = 'unified' } = params;
  const deadline = Date.now() + WORKER_TIME_BUDGET_MS;
  const concurrency = resolveToolConcurrency();
  let processedTools = 0;

  await ensureToolQueueInitialized(uid, profileHash, profileWithUid);

  const persistToolPatch = async (
    toolSlug: string,
    entry: { status: 'success' | 'failed'; data?: Record<string, unknown>; error?: string },
    taskStatus: ToolQueueTaskStatus,
    taskError: string | null,
    taskAttempts: number,
  ) => {
    const updatedAt = Date.now();
    const existingProfile = ((await getDocument('comprehensiveMysticalProfiles', uid)) ||
      {}) as Record<string, unknown>;
    const job = ((await getDocument('generationJobs', uid)) || {}) as Record<string, unknown>;
    const toolTasks = { ...(job.toolTasks as ToolQueueMap) };
    toolTasks[toolSlug] = {
      ...(toolTasks[toolSlug] ?? {
        toolSlug,
        idempotencyKey: buildToolIdempotencyKey(profileHash, toolSlug),
        maxAttempts: TOOL_MAX_ATTEMPTS,
      }),
      status: taskStatus,
      attempts: taskAttempts,
      idempotencyKey: buildToolIdempotencyKey(profileHash, toolSlug),
      nextRetryAt:
        taskStatus === 'failed' && taskAttempts < TOOL_MAX_ATTEMPTS
          ? computeToolRetryAt(taskAttempts)
          : null,
      lastError: taskError,
      claimId,
      updatedAt,
    };

    const existingToolStatus = (existingProfile.toolStatus as PersistedToolStatusMap | undefined) ?? {};
    const nextState =
      entry.status === 'failed' ? 'failed' : classifyToolReportState(entry.data);
    const nextToolStatus: PersistedToolStatusMap = {
      ...existingToolStatus,
      [toolSlug]: {
        ...(existingToolStatus[toolSlug] ?? {}),
        state: nextState,
        startedAt: existingToolStatus[toolSlug]?.startedAt ?? updatedAt,
        updatedAt,
        generatedAt: nextState === 'ready' ? updatedAt : existingToolStatus[toolSlug]?.generatedAt,
        attempts: taskAttempts,
        error: entry.status === 'failed' ? entry.error ?? 'Generation failed' : null,
        unchanged: false,
      },
    };

    const profilePatch: Record<string, unknown> = {
      toolStatus: nextToolStatus,
      lastProgressAt: updatedAt,
      toolTasks,
    };
    if (entry.status === 'success' && entry.data) {
      profilePatch[toolSlug] = {
        ...entry.data,
        generationIdempotencyKey: profileHash,
      };
    }

    await setDocument('comprehensiveMysticalProfiles', uid, profilePatch);
    const readiness = summarizeToolReadiness(
      { ...existingProfile, ...profilePatch },
      ALL_TOOL_SLUGS,
    );
    await userRootDocSet(
      uid,
      {
        toolStatus: nextToolStatus,
        allReportsReady: readiness.allReportsReady,
        pendingToolSlugs: readiness.pendingToolSlugs,
        lastProgressAt: updatedAt,
        updatedAt,
      },
      { merge: true },
    );
    await setDocument('generationJobs', uid, {
      toolTasks,
      lastProgressAt: updatedAt,
      updatedAt,
      claimId,
      lastHeartbeatAt: updatedAt,
    });
  };

  while (Date.now() < deadline) {
    const job = ((await getDocument('generationJobs', uid)) || {}) as Record<string, unknown>;
    const profileDoc = ((await getDocument('comprehensiveMysticalProfiles', uid)) ||
      {}) as Record<string, unknown>;
    const queue = (job.toolTasks as ToolQueueMap) ?? buildInitialToolQueue(profileDoc, profileHash);
    const runnable = selectRunnableToolSlugs(queue, profileDoc, profileHash);
    if (runnable.length === 0) break;

    const batch = runnable.slice(0, concurrency);
    const batchResult = await runProfileGenerationToolSlugs(uid, profileWithUid, batch, {
      onToolHeartbeat: async ({ toolSlug, startedAt, heartbeatAt, elapsedMs }) => {
        await setDocument('generationJobs', uid, {
          status: 'running',
          phase: pipelineMode === 'unified' ? 'running' : 'stageB',
          currentToolSlug: toolSlug,
          currentToolStartedAt: startedAt,
          currentToolElapsedMs: elapsedMs,
          lastHeartbeatAt: heartbeatAt,
          updatedAt: heartbeatAt,
          claimId,
        });
      },
    });

    for (const slug of batch) {
      const entry = batchResult.toolReports[slug];
      if (!entry) continue;
      const jobNow = ((await getDocument('generationJobs', uid)) || {}) as Record<string, unknown>;
      const tasks = (jobNow.toolTasks as ToolQueueMap) ?? {};
      const prevAttempts = tasks[slug]?.attempts ?? 0;
      const nextAttempts = prevAttempts + 1;
      if (entry.status === 'success') {
        await persistToolPatch(
          slug,
          { status: 'success', data: entry.data as Record<string, unknown> },
          'ready',
          null,
          nextAttempts,
        );
      } else {
        const terminal = nextAttempts >= TOOL_MAX_ATTEMPTS;
        await persistToolPatch(
          slug,
          { status: 'failed', error: entry.error ?? 'Generation failed' },
          terminal ? 'failed' : 'pending',
          entry.error ?? 'Generation failed',
          nextAttempts,
        );
      }
      processedTools += 1;
    }

    const readinessMid = summarizeToolReadiness(
      ((await getDocument('comprehensiveMysticalProfiles', uid)) || {}) as Record<string, unknown>,
      ALL_TOOL_SLUGS,
    );
    await setDocument('generationLocks', uid, {
      status: 'running',
      phase: pipelineMode === 'unified' ? 'running' : 'stageB',
      completedTools: readinessMid.readyToolsCount,
      totalTools: ALL_TOOL_SLUGS.length,
      updatedAt: Date.now(),
      lastHeartbeatAt: Date.now(),
    });
  }

  const profileFinal = ((await getDocument('comprehensiveMysticalProfiles', uid)) ||
    {}) as Record<string, unknown>;
  const jobFinal = ((await getDocument('generationJobs', uid)) || {}) as Record<string, unknown>;
  const queueFinal = (jobFinal.toolTasks as ToolQueueMap) ?? {};
  const remainingTools = selectRunnableToolSlugs(queueFinal, profileFinal, profileHash).length;

  if (remainingTools > 0) {
    await setDocument('generationJobs', uid, {
      status: 'queued',
      phase: pipelineMode === 'unified' ? 'running' : 'stageB',
      nextRetryAt: Date.now() + 5_000,
      updatedAt: Date.now(),
      claimId,
    });
    return { done: false, processedTools, remainingTools, finalized: false };
  }

  const toolReports = toolReportsFromComprehensiveProfile(profileFinal);
  const result = await finalizeProfileGenerationFromToolReports(
    uid,
    profileWithUid,
    toolReports,
    profileFinal,
  );
  const { applyStageBFinalPersistence } = await import('@/lib/mysticalStageBPersist');
  await applyStageBFinalPersistence({
    uid,
    profileHash,
    claimId,
    attempt,
    result,
    pipelineMode,
  });

  return { done: true, processedTools, remainingTools: 0, finalized: true };
}

export async function runStageBWorkerForUser(uid: string): Promise<StageBWorkerOutcome> {
  const { claimMysticalStageBJob, failMysticalStageBJob } = await import('@/lib/mysticalStageB');
  const claim = await claimMysticalStageBJob(uid);
  if (claim.status !== 'claimed' || !claim.profileWithUid || !claim.profileHash || !claim.claimId || !claim.attempt) {
    return { skipped: true, reason: claim.reason ?? claim.status };
  }
  try {
    return await processMysticalStageBQueue({
      uid,
      profileWithUid: claim.profileWithUid,
      profileHash: claim.profileHash,
      claimId: claim.claimId,
      attempt: claim.attempt,
      pipelineMode: claim.pipelineMode ?? 'unified',
    });
  } catch (err) {
    await failMysticalStageBJob(uid, err, { claimId: claim.claimId, attempt: claim.attempt });
    throw err;
  }
}
