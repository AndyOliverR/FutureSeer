export interface ComprehensiveProfileFreshnessSource {
  metadata?: {
    generatedAt?: unknown
  }
  lastProgressAt?: unknown
  toolStatus?: unknown
}

export interface ComprehensiveProfileFreshnessMarker {
  generatedAtMs: number | null
  lastProgressAtMs: number | null
  readyToolsCount: number
}

function toMillis(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Date.parse(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  if (value instanceof Date) {
    const parsed = value.getTime()
    return Number.isFinite(parsed) ? parsed : null
  }
  if (value && typeof value === 'object') {
    const maybeTimestamp = value as { toMillis?: unknown; seconds?: unknown }
    if (typeof maybeTimestamp.toMillis === 'function') {
      const parsed = maybeTimestamp.toMillis()
      return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : null
    }
    if (typeof maybeTimestamp.seconds === 'number' && Number.isFinite(maybeTimestamp.seconds)) {
      return maybeTimestamp.seconds * 1000
    }
  }
  return null
}

function countReadyTools(toolStatus: unknown): number {
  if (!toolStatus || typeof toolStatus !== 'object') return 0
  return Object.values(toolStatus as Record<string, unknown>).filter((status) => {
    if (!status || typeof status !== 'object') return false
    return (status as { state?: unknown }).state === 'ready'
  }).length
}

export function getComprehensiveProfileFreshnessMarker(
  profile: ComprehensiveProfileFreshnessSource,
): ComprehensiveProfileFreshnessMarker {
  return {
    generatedAtMs: toMillis(profile.metadata?.generatedAt),
    lastProgressAtMs: toMillis(profile.lastProgressAt),
    readyToolsCount: countReadyTools(profile.toolStatus),
  }
}

export function shouldApplyComprehensiveProfileSnapshot(
  incomingProfile: ComprehensiveProfileFreshnessSource,
  lastApplied: ComprehensiveProfileFreshnessMarker | null,
): boolean {
  if (!lastApplied) return true

  const incoming = getComprehensiveProfileFreshnessMarker(incomingProfile)
  if (incoming.generatedAtMs == null || lastApplied.generatedAtMs == null) return true
  if (incoming.generatedAtMs < lastApplied.generatedAtMs) return false
  if (incoming.generatedAtMs > lastApplied.generatedAtMs) return true

  if (
    incoming.lastProgressAtMs != null &&
    (lastApplied.lastProgressAtMs == null || incoming.lastProgressAtMs > lastApplied.lastProgressAtMs)
  ) {
    return true
  }

  return incoming.readyToolsCount > lastApplied.readyToolsCount
}
