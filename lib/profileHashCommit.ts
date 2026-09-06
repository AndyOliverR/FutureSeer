/**
 * Catalog / on-demand persist may only advance profileDataHash when the
 * committed hash still matches live birth fields. Otherwise natal charts stay
 * on the previous hash while the stale banner disappears.
 */

export const NATAL_CHART_SLUGS = ['vedic', 'western'] as const;

export function isCommittedProfileHash(
  committedHash: unknown,
  liveHash: string,
): boolean {
  if (typeof committedHash !== 'string' || committedHash.length === 0) {
    return true;
  }
  return committedHash === liveHash;
}

function reportGenerationKey(report: unknown): string | null {
  if (!report || typeof report !== 'object') return null;
  const key = (report as Record<string, unknown>).generationIdempotencyKey;
  if (typeof key !== 'string' || key.length === 0) return null;
  return key;
}

/**
 * True when existing natal reports are either missing (legacy), have no key
 * (legacy), match profileHash, or are being rewritten in this persist.
 */
export function natalReportsMatchProfileHash(
  profile: Record<string, unknown>,
  profileHash: string,
  rewritingSlugs: readonly string[] = [],
): boolean {
  for (const slug of NATAL_CHART_SLUGS) {
    if (rewritingSlugs.includes(slug)) continue;
    const key = reportGenerationKey(profile[slug]);
    if (key == null) continue;
    if (key !== profileHash) return false;
  }
  return true;
}
