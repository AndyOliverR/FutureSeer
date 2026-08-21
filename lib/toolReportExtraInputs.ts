/**
 * Optional per-tool fields collected on the tool page and passed to
 * POST /api/profile/ensure-tool-report so the stored report is a real reading,
 * not a requiresNextStep baseline.
 */
export interface ToolReportExtraInputs {
  question?: string
  questionTime?: string
  questionPlace?: string
  questionDate?: string
  latitude?: number
  longitude?: number
  timezone?: string
  method?: string
  spreadType?: string
  pendulumType?: string
  partnerName?: string
  partnerBirthDate?: string
  partnerBirthTime?: string
  partnerBirthPlace?: string
  partnerBirthLatitude?: number
  partnerBirthLongitude?: number
  dreamDescription?: string
  observedNumber?: string
  dominantHand?: 'left' | 'right'
  facingDirection?: string
  layout?: Record<string, string>
}

const STRING_KEYS = [
  'question',
  'questionTime',
  'questionPlace',
  'questionDate',
  'method',
  'spreadType',
  'pendulumType',
  'partnerName',
  'partnerBirthDate',
  'partnerBirthTime',
  'partnerBirthPlace',
  'dreamDescription',
  'observedNumber',
  'facingDirection',
  'timezone',
] as const

function clip(value: string, max: number): string {
  return value.trim().slice(0, max)
}

export function hasToolReportExtraInputs(
  extra: ToolReportExtraInputs | undefined | null,
): extra is ToolReportExtraInputs {
  if (!extra || typeof extra !== 'object') return false
  return Object.values(extra).some((v) => {
    if (typeof v === 'string') return v.trim().length > 0
    if (typeof v === 'number') return Number.isFinite(v)
    if (v && typeof v === 'object') return Object.keys(v).length > 0
    return false
  })
}

export function sanitizeToolReportExtraInputs(raw: unknown): ToolReportExtraInputs | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined
  const rec = raw as Record<string, unknown>
  const out: ToolReportExtraInputs = {}

  for (const key of STRING_KEYS) {
    const val = rec[key]
    if (typeof val === 'string' && val.trim()) {
      out[key] = clip(val, key === 'dreamDescription' || key === 'question' ? 2000 : 200)
    }
  }

  if (rec.dominantHand === 'left' || rec.dominantHand === 'right') {
    out.dominantHand = rec.dominantHand
  }
  for (const key of ['latitude', 'longitude', 'partnerBirthLatitude', 'partnerBirthLongitude'] as const) {
    const val = rec[key]
    if (typeof val === 'number' && Number.isFinite(val)) out[key] = val
    if (typeof val === 'string' && val.trim() && Number.isFinite(Number(val))) out[key] = Number(val)
  }
  if (rec.layout && typeof rec.layout === 'object' && !Array.isArray(rec.layout)) {
    const layout: Record<string, string> = {}
    for (const [k, v] of Object.entries(rec.layout as Record<string, unknown>)) {
      if (typeof v === 'string' && v.trim()) layout[clip(k, 40)] = clip(v, 200)
    }
    if (Object.keys(layout).length > 0) out.layout = layout
  }

  return hasToolReportExtraInputs(out) ? out : undefined
}

export function mergeExtraInputsOntoProfile(
  profile: { [key: string]: unknown },
  extra?: ToolReportExtraInputs,
): { [key: string]: unknown } {
  if (!extra) return profile
  return {
    ...profile,
    partnerName: extra.partnerName ?? profile.partnerName,
    partnerBirthDate: extra.partnerBirthDate ?? profile.partnerBirthDate,
    partnerDateOfBirth: extra.partnerBirthDate ?? profile.partnerDateOfBirth,
    partnerBirthTime: extra.partnerBirthTime ?? profile.partnerBirthTime,
    partnerTimeOfBirth: extra.partnerBirthTime ?? profile.partnerTimeOfBirth,
    partnerBirthPlace: extra.partnerBirthPlace ?? profile.partnerBirthPlace,
    partnerPlaceOfBirth: extra.partnerBirthPlace ?? profile.partnerPlaceOfBirth,
    partnerBirthLatitude: extra.partnerBirthLatitude ?? profile.partnerBirthLatitude,
    partnerBirthLongitude: extra.partnerBirthLongitude ?? profile.partnerBirthLongitude,
  }
}
