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

export function isToolReportReadyForHash(report: unknown, profileHash: string): boolean {
  if (classifyToolReportState(report) !== 'ready') return false;
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
    const ready = isToolReportReadyForHash(report, profileHash);
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
    if (task.status === 'ready' || task.status === 'skipped') continue;
    if (task.status === 'running') continue;
    if (task.status === 'failed' && task.attempts >= task.maxAttempts) continue;
    if (task.nextRetryAt != null && task.nextRetryAt > nowMs) continue;
    if (isToolReportReadyForHash(profile[slug], profileHash)) continue;
    runnable.push(slug);
  }
  return runnable;
}
