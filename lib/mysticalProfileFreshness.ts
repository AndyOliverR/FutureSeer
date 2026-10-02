/**
 * Freshness rules for comprehensiveMysticalProfiles.
 * Catalog persist merges tool fields without replacing the document, so callers
 * must not treat an unchanged metadata.generatedAt as "nothing new".
 */

function epochMs(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim().length > 0) {
    const ms = Date.parse(value)
    return Number.isFinite(ms) ? ms : null
  }
  return null
}

function hasRecordFields(value: unknown): boolean {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value) && Object.keys(value as object).length > 0
}

/**
 * Apply a server snapshot unless its generatedAt is strictly older than the
 * profile already on screen. Equal timestamps still apply: Firestore emits them
 * when other fields changed and the writer did not bump generatedAt.
 */
export function shouldApplyProfileSnapshot(
  incomingGeneratedAt: unknown,
  lastAppliedGeneratedAt: unknown,
): boolean {
  const incomingMs = epochMs(incomingGeneratedAt)
  const lastMs = epochMs(lastAppliedGeneratedAt)
  if (incomingMs == null || lastMs == null) return true
  return incomingMs >= lastMs
}

/** Preserve existing metadata keys and move generatedAt forward for this write. */
export function stampMysticalProfileMetadata(
  existingMetadata: unknown,
  nowMs: number,
): Record<string, unknown> {
  const existing =
    existingMetadata && typeof existingMetadata === 'object' && !Array.isArray(existingMetadata)
      ? { ...(existingMetadata as Record<string, unknown>) }
      : {}
  return {
    ...existing,
    generatedAt: new Date(nowMs).toISOString(),
  }
}

/**
 * Home cards use this to decide guest vs chart-grounded copy.
 * Catalog profiles store vedic/western at the root and may omit metadata.generatedAt.
 */
export function mysticalProfileLooksGenerated(profile: unknown): boolean {
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) return false
  const rec = profile as Record<string, unknown>
  const metadata = rec.metadata
  if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
    const generatedAt = (metadata as { generatedAt?: unknown }).generatedAt
    if (generatedAt) return true
  }
  return hasRecordFields(rec.vedic) || hasRecordFields(rec.western)
}
