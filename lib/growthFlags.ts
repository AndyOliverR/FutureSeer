/**
 * Client-safe growth feature flags. All default to false when unset (safe for production).
 * Disable any layer instantly by removing the env or setting to "0" / "false".
 */

function envBool(name: string): boolean {
  if (typeof process === 'undefined' || !process.env) return false
  const v = process.env[name]
  if (v === undefined || v === '') return false
  const lower = v.toLowerCase()
  return lower === '1' || lower === 'true' || lower === 'yes'
}

/** Short /l/... campaign redirects and metadata */
export function isGrowthShortLinksEnabled(): boolean {
  return envBool('NEXT_PUBLIC_GROWTH_SHORT_LINKS_ENABLED')
}

/** Profile form draft save/resume in localStorage */
export function isGrowthProfileDraftEnabled(): boolean {
  return envBool('NEXT_PUBLIC_GROWTH_PROFILE_DRAFT_ENABLED')
}
