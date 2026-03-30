/**
 * First-touch campaign attribution from URL query params (UTM, ref, optional variant).
 * Persisted in sessionStorage for the browser session and merged into PostHog events / identify.
 */

const STORAGE_KEY = 'fs_campaign_v1'
const LANDING_TRACKED_KEY = 'fs_campaign_landing_tracked_v1'
const SIGNUP_FUNNEL_TRACKED_KEY = 'fs_signup_funnel_from_campaign_tracked_v1'
const SIGNIN_FUNNEL_TRACKED_KEY = 'fs_signin_funnel_from_campaign_tracked_v1'

export type CampaignAttribution = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  ref?: string
  /** Short campaign or A/B label from query, e.g. ?lv=hero-a */
  landing_variant?: string
  /** First path that captured attribution */
  landing_path?: string
  first_seen_at?: string
}

function parseParam(sp: URLSearchParams, key: string): string | undefined {
  const v = sp.get(key)
  return v && v.trim() ? v.trim().slice(0, 500) : undefined
}

export function parseCampaignFromSearchParams(search: string): Partial<CampaignAttribution> {
  const sp = new URLSearchParams(search.startsWith('?') ? search : `?${search}`)
  const out: Partial<CampaignAttribution> = {}
  const utm_source = parseParam(sp, 'utm_source')
  const utm_medium = parseParam(sp, 'utm_medium')
  const utm_campaign = parseParam(sp, 'utm_campaign')
  const utm_content = parseParam(sp, 'utm_content')
  const utm_term = parseParam(sp, 'utm_term')
  const ref = parseParam(sp, 'ref')
  const landing_variant = parseParam(sp, 'lv') ?? parseParam(sp, 'variant')
  if (utm_source) out.utm_source = utm_source
  if (utm_medium) out.utm_medium = utm_medium
  if (utm_campaign) out.utm_campaign = utm_campaign
  if (utm_content) out.utm_content = utm_content
  if (utm_term) out.utm_term = utm_term
  if (ref) out.ref = ref
  if (landing_variant) out.landing_variant = landing_variant
  return out
}

export function hasCampaignSignal(partial: Partial<CampaignAttribution>): boolean {
  return !!(
    partial.utm_source ||
    partial.utm_medium ||
    partial.utm_campaign ||
    partial.utm_content ||
    partial.utm_term ||
    partial.ref ||
    partial.landing_variant
  )
}

export function getStoredCampaignAttribution(): CampaignAttribution {
  if (typeof window === 'undefined') return {}
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as CampaignAttribution
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function setStoredCampaignAttribution(next: CampaignAttribution): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* ignore quota */
  }
}

/**
 * Call on client when the URL may contain new params (e.g. first load, or marketing link).
 * Merges into session storage; first non-empty values win unless overwritten by new URL keys.
 */
export function captureCampaignFromCurrentUrl(): CampaignAttribution {
  if (typeof window === 'undefined') return {}
  const fromUrl = parseCampaignFromSearchParams(window.location.search)
  const existing = getStoredCampaignAttribution()
  const merged: CampaignAttribution = {
    ...existing,
    ...Object.fromEntries(
      Object.entries(fromUrl).filter(([, v]) => v !== undefined && v !== '')
    ) as CampaignAttribution,
  }
  if (hasCampaignSignal(fromUrl)) {
    if (!merged.first_seen_at) merged.first_seen_at = new Date().toISOString()
    merged.landing_path = typeof window !== 'undefined' ? window.location.pathname : merged.landing_path
  }
  if (hasCampaignSignal(merged)) {
    setStoredCampaignAttribution(merged)
  }
  return getStoredCampaignAttribution()
}

/** Flat props for PostHog (omit undefined). */
export function campaignPropsForPostHog(): Record<string, string> {
  const c = getStoredCampaignAttribution()
  const out: Record<string, string> = {}
  const keys: (keyof CampaignAttribution)[] = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'ref',
    'landing_variant',
    'landing_path',
    'first_seen_at',
  ]
  for (const k of keys) {
    const v = c[k]
    if (typeof v === 'string' && v.length > 0) out[k] = v
  }
  return out
}

export function wasCampaignLandingTrackedThisSession(): boolean {
  if (typeof sessionStorage === 'undefined') return true
  return sessionStorage.getItem(LANDING_TRACKED_KEY) === '1'
}

export function markCampaignLandingTracked(): void {
  try {
    sessionStorage.setItem(LANDING_TRACKED_KEY, '1')
  } catch {
    /* ignore */
  }
}

export function wasSignupFunnelFromCampaignTracked(): boolean {
  if (typeof sessionStorage === 'undefined') return true
  return sessionStorage.getItem(SIGNUP_FUNNEL_TRACKED_KEY) === '1'
}

export function markSignupFunnelFromCampaignTracked(): void {
  try {
    sessionStorage.setItem(SIGNUP_FUNNEL_TRACKED_KEY, '1')
  } catch {
    /* ignore */
  }
}

export function wasSigninFunnelFromCampaignTracked(): boolean {
  if (typeof sessionStorage === 'undefined') return true
  return sessionStorage.getItem(SIGNIN_FUNNEL_TRACKED_KEY) === '1'
}

export function markSigninFunnelFromCampaignTracked(): void {
  try {
    sessionStorage.setItem(SIGNIN_FUNNEL_TRACKED_KEY, '1')
  } catch {
    /* ignore */
  }
}
