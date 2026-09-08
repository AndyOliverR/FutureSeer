import 'server-only';

import { getDocument, setDocument } from '@/lib/firebase-admin';
import type { UserProfile } from '@/lib/firebase';
import {
  ALL_TOOL_SLUGS,
  classifyToolReportState,
  isReadyToolReport,
  runProfileGenerationToolSlugs,
  summarizeToolReadiness,
  type ToolReportEntry,
} from '@/lib/profileGenerationOrchestrator';
import type { PersistedToolStatusMap } from '@/lib/mysticalStageB';
import { collapseDuplicateReportFields } from '@/lib/reportDedup';
import type { ToolReportExtraInputs } from '@/lib/toolReportExtraInputs';
import { clearCachedDivinationData } from '@/lib/universalDataAggregator';

export const NATAL_CHART_SLUGS = ['vedic', 'western'] as const;

export type OnDemandToolSlug = (typeof ALL_TOOL_SLUGS)[number];

export function isOnDemandToolSlug(slug: string): slug is OnDemandToolSlug {
  return (ALL_TOOL_SLUGS as readonly string[]).includes(slug);
}

function isRealStoredReport(report: unknown): boolean {
  if (!report || typeof report !== 'object') return false;
  return (report as { placeholder?: boolean }).placeholder !== true;
}

/**
 * Stage B persist already refuses to clobber a real reading with a placeholder.
 * Catalog fill, ensure-tool-report extraInputs, and overlapping generate/visit
 * races all share persistOnDemandToolReports — apply the same guard here.
 */
export function shouldKeepExistingReportOverPlaceholder(
  existing: unknown,
  incoming: unknown,
): boolean {
  if (!isRealStoredReport(existing)) return false;
  if (!incoming || typeof incoming !== 'object') return false;
  return (incoming as { placeholder?: boolean }).placeholder === true;
}

function mergeToolStatus(
  existing: PersistedToolStatusMap,
  slug: string,
  entry: ToolReportEntry,
  now: number,
): PersistedToolStatusMap {
  const data = entry.status === 'success' ? entry.data : undefined;
  const state =
    entry.status === 'failed' ? 'failed' : classifyToolReportState(data, slug);
  return {
    ...existing,
    [slug]: {
      ...(existing[slug] ?? {}),
      state,
      startedAt: existing[slug]?.startedAt ?? now,
      updatedAt: now,
      generatedAt: state === 'ready' ? now : existing[slug]?.generatedAt,
      attempts: (existing[slug]?.attempts ?? 0) + 1,
      error: entry.status === 'failed' ? entry.error ?? 'Generation failed' : null,
      unchanged: false,
    },
  };
}

/**
 * Persist one or more tool reports and derive catalog readiness from the merged
 * profile. Do not claim allReportsReady while other catalog tools are still missing.
 */
export async function persistOnDemandToolReports(params: {
  uid: string;
  profileHash: string;
  toolReports: Record<string, ToolReportEntry>;
}): Promise<{
  readySlugs: string[];
  failedSlugs: string[];
  readiness: ReturnType<typeof summarizeToolReadiness>;
  toolStatus: PersistedToolStatusMap;
}> {
  const { uid, profileHash, toolReports } = params;
  const now = Date.now();
  const existingProfile = ((await getDocument('comprehensiveMysticalProfiles', uid)) ||
    {}) as Record<string, unknown>;
  let toolStatus = (existingProfile.toolStatus as PersistedToolStatusMap | undefined) ?? {};
  const profilePatch: Record<string, unknown> = {
    lastProgressAt: now,
    profileDataHash: profileHash,
  };
  const readySlugs: string[] = [];
  const failedSlugs: string[] = [];

  for (const [slug, entry] of Object.entries(toolReports)) {
    const incomingData =
      entry.status === 'success' && entry.data && typeof entry.data === 'object'
        ? collapseDuplicateReportFields(entry.data as Record<string, unknown>)
        : null;
    if (incomingData && shouldKeepExistingReportOverPlaceholder(existingProfile[slug], incomingData)) {
      failedSlugs.push(slug);
      continue;
    }
    toolStatus = mergeToolStatus(toolStatus, slug, entry, now);
    if (incomingData) {
      profilePatch[slug] = {
        ...incomingData,
        generationIdempotencyKey: profileHash,
      };
      if (isReadyToolReport(incomingData, slug)) readySlugs.push(slug);
      else failedSlugs.push(slug);
    } else {
      failedSlugs.push(slug);
    }
  }

  profilePatch.toolStatus = toolStatus;
  const mergedProfile = { ...existingProfile, ...profilePatch };
  const readiness = summarizeToolReadiness(mergedProfile, ALL_TOOL_SLUGS);
  await setDocument('comprehensiveMysticalProfiles', uid, profilePatch);
  await setDocument('users', uid, {
    mysticalProfileGenerated: true,
    mysticalProfileGeneratedAt: now,
    profileDataHash: profileHash,
    profileStatus: readiness.allReportsReady ? 'completed' : 'running',
    allReportsReady: readiness.allReportsReady,
    pendingToolSlugs: readiness.pendingToolSlugs,
    toolStatus,
    lastProgressAt: now,
    updatedAt: now,
  });
  const lockPatch: Record<string, unknown> = {
    status: readiness.allReportsReady ? 'completed' : 'running',
    phase: readiness.allReportsReady ? 'completed' : 'catalog',
    allReportsReady: readiness.allReportsReady,
    pendingToolSlugs: readiness.pendingToolSlugs,
    readyToolsCount: readiness.readyToolsCount,
    totalTools: ALL_TOOL_SLUGS.length,
    completedTools: readiness.readyToolsCount,
    pipelineMode: 'catalog',
    toolStatus,
    updatedAt: now,
  };
  if (readiness.allReportsReady) {
    lockPatch.lockedAt = null;
    lockPatch.completedAt = now;
  }
  await setDocument('generationLocks', uid, lockPatch);
  clearCachedDivinationData(uid);
  return { readySlugs, failedSlugs, readiness, toolStatus };
}

export async function generateAndPersistToolReports(params: {
  uid: string;
  profile: UserProfile;
  profileHash: string;
  toolSlugs: readonly string[];
  skipVedicComprehensive?: boolean;
  extraInputs?: ToolReportExtraInputs;
}): Promise<{
  readySlugs: string[];
  failedSlugs: string[];
  toolReports: Record<string, ToolReportEntry>;
  readiness: ReturnType<typeof summarizeToolReadiness>;
  toolStatus: PersistedToolStatusMap;
}> {
  const { uid, profile, profileHash, toolSlugs, skipVedicComprehensive, extraInputs } = params;
  const result = await runProfileGenerationToolSlugs(uid, profile, toolSlugs, {
    skipVedicComprehensive,
    extraInputs,
  });
  const persisted = await persistOnDemandToolReports({
    uid,
    profileHash,
    toolReports: result.toolReports,
  });
  return {
    ...persisted,
    toolReports: result.toolReports,
  };
}

export function storedReportMatchesHash(
  report: unknown,
  profileHash: string,
): boolean {
  if (!report || typeof report !== 'object') return false;
  const rec = report as Record<string, unknown>;
  const key = rec.generationIdempotencyKey;
  if (typeof key !== 'string' || key.length === 0) return false;
  return key === profileHash;
}
