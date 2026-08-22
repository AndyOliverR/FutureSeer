import 'server-only';

import { deleteDocument, getDocument, setDocument } from '@/lib/firebase-admin';
import { buildStaleCatalogClearPatch } from '@/lib/staleCatalogReports';
import type { UserProfile } from '@/lib/firebase';
import {
  ALL_TOOL_SLUGS,
  classifyToolReportState,
  isReadyToolReport,
  runProfileGenerationToolSlugs,
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
 * Persist one or more tool reports. Catalog is on-demand: do not mark missing
 * tools as a running pipeline (`allReportsReady` means profile is committed).
 */
export async function persistOnDemandToolReports(params: {
  uid: string;
  profileHash: string;
  toolReports: Record<string, ToolReportEntry>;
}): Promise<{ readySlugs: string[]; failedSlugs: string[] }> {
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
    toolStatus = mergeToolStatus(toolStatus, slug, entry, now);
    if (entry.status === 'success' && entry.data && typeof entry.data === 'object') {
      profilePatch[slug] = {
        ...collapseDuplicateReportFields(entry.data as Record<string, unknown>),
        generationIdempotencyKey: profileHash,
      };
      if (isReadyToolReport(entry.data, slug)) readySlugs.push(slug);
      else failedSlugs.push(slug);
    } else {
      failedSlugs.push(slug);
    }
  }

  profilePatch.toolStatus = toolStatus;
  await setDocument('comprehensiveMysticalProfiles', uid, profilePatch);
  await setDocument('users', uid, {
    mysticalProfileGenerated: true,
    mysticalProfileGeneratedAt: now,
    profileDataHash: profileHash,
    profileStatus: 'completed',
    allReportsReady: true,
    pendingToolSlugs: [],
    toolStatus,
    lastProgressAt: now,
    updatedAt: now,
  });
  await setDocument('generationLocks', uid, {
    lockedAt: null,
    status: 'completed',
    phase: 'completed',
    completedAt: now,
    allReportsReady: true,
    pendingToolSlugs: [],
    readyToolsCount: readySlugs.length,
    toolStatus,
    updatedAt: now,
  });
  await setDocument('generationJobs', uid, {
    status: 'completed',
    phase: 'completed',
    completedAt: now,
    allReportsReady: true,
    pendingToolSlugs: [],
    queueDrained: true,
    pipelineMode: 'on_demand',
    updatedAt: now,
  });
  clearCachedDivinationData(uid);
  return { readySlugs, failedSlugs };
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

/**
 * Drop catalog reports (and Seer Master) that belong to a previous profile hash.
 * Natal charts for the new hash are written afterwards by persistOnDemandToolReports.
 */
export async function clearStaleCatalogReports(params: {
  uid: string;
  profileHash: string;
  keepSlugs?: readonly string[];
}): Promise<void> {
  const { uid, profileHash, keepSlugs = [] } = params;
  const existingProfile = ((await getDocument('comprehensiveMysticalProfiles', uid)) ||
    {}) as Record<string, unknown>;
  const patch = buildStaleCatalogClearPatch(existingProfile, profileHash, keepSlugs);
  if (patch) {
    await setDocument('comprehensiveMysticalProfiles', uid, patch);
  }
  const seerMaster = await getDocument('seerMaster', uid);
  if (seerMaster) {
    await deleteDocument('seerMaster', uid);
  }
  clearCachedDivinationData(uid);
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
