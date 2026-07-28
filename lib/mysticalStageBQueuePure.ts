import { ALL_TOOL_SLUGS, classifyToolReportState } from '@/lib/profileGenerationOrchestrator';

export type ToolQueueTaskStatus = 'pending' | 'running' | 'ready' | 'failed' | 'skipped';

export type ToolQueueTask = {
  toolSlug: string;
  idempotencyKey: string;
  status: ToolQueueTaskStatus;
  attempts: number;
  maxAttempts: number;
  nextRetryAt: number | null;
  claimId?: string | null;
  lastError?: string | null;
  updatedAt: number;
};

export type ToolQueueMap = Record<string, ToolQueueTask>;

export const TOOL_QUEUE_MAX_ATTEMPTS = 3;

export function buildToolIdempotencyKey(profileHash: string, toolSlug: string): string {
  return `${profileHash}:${toolSlug}`;
}

export function isToolReportReadyForHash(
  report: unknown,
  profileHash: string,
  toolSlug?: string,
): boolean {
  if (classifyToolReportState(report, toolSlug) !== 'ready') return false;
  if (!report || typeof report !== 'object') return false;
  const key = (report as { generationIdempotencyKey?: string }).generationIdempotencyKey;
  return key === profileHash;
}

export function buildInitialToolQueue(
  profile: Record<string, unknown>,
  profileHash: string,
  nowMs = Date.now(),
): ToolQueueMap {
  const queue: ToolQueueMap = {};
  for (const slug of ALL_TOOL_SLUGS) {
    const report = profile[slug];
    const ready = isToolReportReadyForHash(report, profileHash, slug);
    queue[slug] = {
      toolSlug: slug,
      idempotencyKey: buildToolIdempotencyKey(profileHash, slug),
      status: ready ? 'ready' : 'pending',
      attempts: 0,
      maxAttempts: TOOL_QUEUE_MAX_ATTEMPTS,
      nextRetryAt: null,
      lastError: null,
      updatedAt: nowMs,
    };
  }
  return queue;
}

export function isTerminalFailedToolTask(
  task: ToolQueueTask | undefined,
  profileHash: string,
  toolSlug: string,
): boolean {
  if (!task) return false;
  if (task.idempotencyKey !== buildToolIdempotencyKey(profileHash, toolSlug)) return false;
  return task.status === 'failed' && task.attempts >= task.maxAttempts;
}

/**
 * Tools that still owe work: pending/running/backoff/missing, or ready-marked without a displayable report.
 * Excludes skipped and terminal-failed tasks for the current profile hash.
 */
export function selectIncompleteToolSlugs(
  queue: ToolQueueMap,
  profile: Record<string, unknown>,
  profileHash: string,
): string[] {
  const incomplete: string[] = [];
  for (const slug of ALL_TOOL_SLUGS) {
    if (isToolReportReadyForHash(profile[slug], profileHash, slug)) continue;
    const task = queue[slug];
    if (!task) {
      incomplete.push(slug);
      continue;
    }
    if (task.idempotencyKey !== buildToolIdempotencyKey(profileHash, slug)) {
      incomplete.push(slug);
      continue;
    }
    if (task.status === 'skipped') continue;
    if (isTerminalFailedToolTask(task, profileHash, slug)) continue;
    incomplete.push(slug);
  }
  return incomplete;
}

/** Tools that exhausted retries and still lack a displayable report for this hash. */
export function selectTerminalFailedToolSlugs(
  queue: ToolQueueMap,
  profile: Record<string, unknown>,
  profileHash: string,
): string[] {
  const failed: string[] = [];
  for (const slug of ALL_TOOL_SLUGS) {
    if (isToolReportReadyForHash(profile[slug], profileHash, slug)) continue;
    const task = queue[slug];
    if (isTerminalFailedToolTask(task, profileHash, slug)) failed.push(slug);
  }
  return failed;
}

/** Earliest future nextRetryAt among incomplete tasks, or null if none. */
export function soonestToolRetryAt(
  queue: ToolQueueMap,
  incompleteSlugs: string[],
  nowMs = Date.now(),
): number | null {
  let soonest: number | null = null;
  for (const slug of incompleteSlugs) {
    const nextRetryAt = queue[slug]?.nextRetryAt;
    if (typeof nextRetryAt !== 'number' || nextRetryAt <= nowMs) continue;
    if (soonest == null || nextRetryAt < soonest) soonest = nextRetryAt;
  }
  return soonest;
}

export function selectRunnableToolSlugs(
  queue: ToolQueueMap,
  profile: Record<string, unknown>,
  profileHash: string,
  nowMs = Date.now(),
): string[] {
  const runnable: string[] = [];
  for (const slug of ALL_TOOL_SLUGS) {
    const task = queue[slug];
    if (!task) {
      runnable.push(slug);
      continue;
    }
    if (task.idempotencyKey !== buildToolIdempotencyKey(profileHash, slug)) {
      runnable.push(slug);
      continue;
    }
    if (task.status === 'skipped') continue;
    // Task marked ready but payload fails displayable readiness → re-run (tightened contract / thin shells).
    if (task.status === 'ready') {
      if (isToolReportReadyForHash(profile[slug], profileHash, slug)) continue;
    } else if (task.status === 'running') {
      continue;
    } else if (isTerminalFailedToolTask(task, profileHash, slug)) {
      continue;
    }
    if (task.nextRetryAt != null && task.nextRetryAt > nowMs) continue;
    if (isToolReportReadyForHash(profile[slug], profileHash, slug)) continue;
    runnable.push(slug);
  }
  return runnable;
}
