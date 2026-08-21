import {
  ALL_TOOL_SLUGS,
  classifyToolReportState,
  type ReportReadinessState,
} from '@/lib/toolReportReadiness';
import type { PersistedToolStatusMap } from '@/lib/mysticalStageB';
import { humanizePipelineSlug } from '@/lib/toolSlugLabels';

export type FailedToolSummary = {
  slug: string;
  label: string;
  error?: string | null;
};

function resolveReportForSlug(
  profile: Record<string, unknown>,
  slug: string,
): unknown {
  const toolReports = profile.toolReports as Record<string, { data?: unknown; status?: string }> | undefined;
  return profile[slug] ?? toolReports?.[slug]?.data ?? toolReports?.[slug];
}

/**
 * Tools explicitly marked failed in persisted toolStatus or report payloads.
 * Omits slugs still pending/running — those are handled by the progress panel.
 */
export function extractFailedToolSummaries(
  profile: Record<string, unknown> | null | undefined,
): FailedToolSummary[] {
  if (!profile) return [];

  const toolStatus = (profile.toolStatus as PersistedToolStatusMap | undefined) ?? {};
  const summaries: FailedToolSummary[] = [];
  const seen = new Set<string>();

  const pushFailed = (slug: string, error?: string | null) => {
    if (seen.has(slug)) return;
    seen.add(slug);
    summaries.push({
      slug,
      label: humanizePipelineSlug(slug),
      error: error ?? null,
    });
  };

  for (const slug of ALL_TOOL_SLUGS) {
    const status = toolStatus[slug];
    if (status?.state === 'failed') {
      pushFailed(slug, status.error);
      continue;
    }
    const report = resolveReportForSlug(profile, slug);
    const state: ReportReadinessState = classifyToolReportState(report);
    if (state === 'failed') {
      const err =
        typeof report === 'object' && report != null
          ? (report as { error?: string }).error
          : undefined;
      pushFailed(slug, err ?? status?.error);
    }
  }

  return summaries;
}

export function formatPartialGenerationHeadline(failedCount: number): string {
  if (failedCount <= 0) return '';
  return failedCount === 1
    ? 'One report did not finish'
    : `${failedCount} reports did not finish`;
}

export function formatPartialGenerationBody(failedCount: number): string {
  if (failedCount <= 0) return '';
  return failedCount === 1
    ? 'Your mystical library is mostly ready. One divination system needs another pass — you can retry from Profile without losing completed readings.'
    : 'Your mystical library is mostly ready. A few divination systems need another pass — retry from Profile without losing completed readings.';
}
