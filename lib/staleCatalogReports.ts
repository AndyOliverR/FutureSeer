/**
 * Pure helpers to drop catalog reports that belong to a previous profile hash.
 * Used when Generate Full Report commits a new natal hash so other tools are
 * not shown or packed as if they still match the new birth data.
 */

import { ALL_TOOL_SLUGS } from '@/lib/toolReportReadiness';

/** Synthesis / derived keys that must not survive a profile-hash change. */
export const STALE_CATALOG_EXTRA_KEYS = [
  'interpretations',
  'seerMaster',
  'vedicAstroNumerology',
  'astroNumerology',
] as const;

function generationKey(report: unknown): string | null {
  if (!report || typeof report !== 'object' || Array.isArray(report)) return null;
  const key = (report as { generationIdempotencyKey?: unknown }).generationIdempotencyKey;
  return typeof key === 'string' && key.length > 0 ? key : null;
}

function reportBelongsToHash(report: unknown, profileHash: string): boolean {
  const key = generationKey(report);
  return key === profileHash;
}

function nestedReportData(entry: unknown): unknown {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return entry;
  const data = (entry as { data?: unknown }).data;
  return data !== undefined ? data : entry;
}

/**
 * Build a merge patch that nulls catalog fields whose generation key does not
 * match `profileHash`. Missing keys are treated as stale on hash change.
 */
export function buildStaleCatalogClearPatch(
  existingProfile: Record<string, unknown>,
  profileHash: string,
  keepSlugs: readonly string[] = [],
  now = Date.now(),
): Record<string, unknown> | null {
  const keep = new Set(keepSlugs);
  const patch: Record<string, unknown> = {};

  for (const slug of ALL_TOOL_SLUGS) {
    if (keep.has(slug)) continue;
    const report = existingProfile[slug];
    if (report == null) continue;
    if (reportBelongsToHash(report, profileHash)) continue;
    patch[slug] = null;
  }

  const nested = existingProfile.toolReports;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const nextNested = { ...(nested as Record<string, unknown>) };
    let nestedChanged = false;
    for (const slug of ALL_TOOL_SLUGS) {
      if (keep.has(slug) || nextNested[slug] == null) continue;
      if (reportBelongsToHash(nestedReportData(nextNested[slug]), profileHash)) continue;
      delete nextNested[slug];
      nestedChanged = true;
    }
    if (nestedChanged) patch.toolReports = nextNested;
  }

  const existingStatus = existingProfile.toolStatus;
  if (existingStatus && typeof existingStatus === 'object' && !Array.isArray(existingStatus)) {
    const nextStatus: Record<string, unknown> = { ...(existingStatus as Record<string, unknown>) };
    let statusChanged = false;
    for (const slug of ALL_TOOL_SLUGS) {
      if (keep.has(slug) || patch[slug] !== null) continue;
      if (nextStatus[slug] == null) continue;
      const prev =
        typeof nextStatus[slug] === 'object' && nextStatus[slug] !== null
          ? (nextStatus[slug] as Record<string, unknown>)
          : {};
      nextStatus[slug] = {
        ...prev,
        state: 'pending',
        updatedAt: now,
        error: null,
        unchanged: false,
      };
      statusChanged = true;
    }
    if (statusChanged) patch.toolStatus = nextStatus;
  }

  for (const key of STALE_CATALOG_EXTRA_KEYS) {
    if (existingProfile[key] != null) patch[key] = null;
  }

  return Object.keys(patch).length > 0 ? patch : null;
}
