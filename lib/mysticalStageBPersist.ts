import 'server-only';

import { batchSetDocuments, getDocument, setDocument } from '@/lib/firebase-admin';
import {
  ALL_TOOL_SLUGS,
  classifyToolReportState,
  summarizeToolReadiness,
  type GenerationResult,
} from '@/lib/profileGenerationOrchestrator';
import { clearCachedDivinationData } from '@/lib/universalDataAggregator';
import type { PersistedToolStatusMap } from '@/lib/mysticalStageB';
import { cleanData } from '@/lib/mysticalStageBQueueUtils';

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

function buildToolStatusMap(
  profile: Record<string, unknown>,
  now: number,
  attempts: number,
  existingToolStatus: PersistedToolStatusMap = {},
): PersistedToolStatusMap {
  const next: PersistedToolStatusMap = {};
  for (const slug of ALL_TOOL_SLUGS) {
    const report = profile[slug];
    const derived = { state: classifyToolReportState(report) };
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

export async function applyStageBFinalPersistence(params: {
  uid: string;
  profileHash: string;
  claimId: string;
  attempt: number;
  result: GenerationResult;
  pipelineMode: 'legacy_staged' | 'unified';
}): Promise<void> {
  const { uid, profileHash, attempt, result, pipelineMode } = params;
  const finalToStore = cleanData(result.comprehensiveProfile) as Record<string, unknown>;
  delete finalToStore.toolReports;
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
  const finalReadiness = summarizeToolReadiness(finalToStore, ALL_TOOL_SLUGS);
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
    queueDrained: true,
    pipelineMode,
  });
  clearCachedDivinationData(uid);
}
