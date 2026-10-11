/**
 * Krishnamurti Paddhati sub-lord.
 * A nakshatra (13°20') is divided in Vimshottari proportion, starting at the star lord.
 * Equal ninths are not KP.
 */

/** Bump when the sub-lord span rule changes so stored KP reports are recast. */
export const KP_SUBLORD_FORMULA_VERSION = 2

const SUB_SEQUENCE = [
  { lord: 'Ketu', years: 7 },
  { lord: 'Venus', years: 20 },
  { lord: 'Sun', years: 6 },
  { lord: 'Moon', years: 10 },
  { lord: 'Mars', years: 7 },
  { lord: 'Rahu', years: 18 },
  { lord: 'Jupiter', years: 16 },
  { lord: 'Saturn', years: 19 },
  { lord: 'Mercury', years: 17 },
] as const

const ARCSEC_IN_CIRCLE = 360 * 3600
const NAKSHATRA_ARCSEC = ARCSEC_IN_CIRCLE / 27
/** Each Vimshottari year occupies 400" of a 48,000" nakshatra (48,000 / 120). */
const ARCSEC_PER_YEAR = NAKSHATRA_ARCSEC / 120

function longitudeToArcsec(longitude: number): number {
  const turns = longitude / 360
  const fraction = turns - Math.floor(turns)
  const arcsec = Math.round(fraction * ARCSEC_IN_CIRCLE)
  return arcsec >= ARCSEC_IN_CIRCLE ? 0 : arcsec
}

export function calculateKpSubLord(longitude: number): string {
  if (!Number.isFinite(longitude)) return SUB_SEQUENCE[0].lord
  const arcsec = longitudeToArcsec(longitude)
  const nakIndex = Math.min(26, Math.floor(arcsec / NAKSHATRA_ARCSEC))
  const within = arcsec - nakIndex * NAKSHATRA_ARCSEC
  const startIndex = nakIndex % 9
  let cursor = 0

  for (let i = 0; i < 9; i++) {
    const entry = SUB_SEQUENCE[(startIndex + i) % 9]
    cursor += entry.years * ARCSEC_PER_YEAR
    if (i === 8 || within < cursor) return entry.lord
  }

  return SUB_SEQUENCE[(startIndex + 8) % 9].lord
}

export function kpSubLordFormulaVersion(report: Record<string, unknown>): number | undefined {
  const direct = report.subLordFormulaVersion
  if (typeof direct === 'number') return direct
  for (const wrap of ['data', 'profile', 'chart', 'report', 'analysis'] as const) {
    const inner = report[wrap]
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      const version = (inner as Record<string, unknown>).subLordFormulaVersion
      if (typeof version === 'number') return version
    }
  }
  return undefined
}
