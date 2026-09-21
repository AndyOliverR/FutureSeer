/**
 * Freshness for comprehensive mystical profiles.
 *
 * Stage B (and other incremental writers) update tool payloads / toolStatus /
 * lastProgressAt without bumping metadata.generatedAt. Client gates that only
 * compare generatedAt discard those updates and can also retain a prior account's
 * marker across sign-out / account switch.
 */

export type ComprehensiveProfileFreshnessSource = {
  metadata?: { generatedAt?: string | null } | null
  lastProgressAt?: unknown
  toolStatus?: unknown
  lastUpdated?: unknown
} | null | undefined

function maxFinite(...values: number[]): number {
  let max = 0
  for (const value of values) {
    if (Number.isFinite(value) && value > max) max = value
  }
  return max
}

function parseGeneratedAtMs(generatedAt: unknown): number {
  if (typeof generatedAt !== 'string' || !generatedAt.trim()) return 0
  const ms = Date.parse(generatedAt)
  return Number.isFinite(ms) ? ms : 0
}

function parseNumericMs(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const asNumber = Number(value)
    if (Number.isFinite(asNumber)) return asNumber
    const parsed = Date.parse(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return 0
}

function maxToolStatusMs(toolStatus: unknown): number {
  if (!toolStatus || typeof toolStatus !== 'object') return 0
  let max = 0
  for (const entry of Object.values(toolStatus as Record<string, unknown>)) {
    if (!entry || typeof entry !== 'object') continue
    const row = entry as { updatedAt?: unknown; generatedAt?: unknown }
    max = maxFinite(max, parseNumericMs(row.updatedAt), parseNumericMs(row.generatedAt))
  }
  return max
}

/** Highest known progress timestamp for a comprehensive profile document. */
export function getComprehensiveProfileFreshnessMs(
  data: ComprehensiveProfileFreshnessSource,
): number {
  if (!data || typeof data !== 'object') return 0
  return maxFinite(
    parseGeneratedAtMs(data.metadata?.generatedAt),
    parseNumericMs(data.lastProgressAt),
    parseNumericMs(data.lastUpdated),
    maxToolStatusMs(data.toolStatus),
  )
}

/**
 * Whether incoming server/cache data should replace the last applied snapshot.
 * Equal freshness is skipped to avoid thrashing; unknown freshness applies.
 */
export function shouldApplyComprehensiveProfileUpdate(
  incoming: ComprehensiveProfileFreshnessSource,
  lastAppliedFreshnessMs: number | null | undefined,
): boolean {
  if (lastAppliedFreshnessMs == null || lastAppliedFreshnessMs <= 0) return true
  const incomingMs = getComprehensiveProfileFreshnessMs(incoming)
  if (incomingMs <= 0) return true
  return incomingMs > lastAppliedFreshnessMs
}
