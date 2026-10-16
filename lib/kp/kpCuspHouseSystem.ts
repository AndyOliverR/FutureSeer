/** Krishnamurti Paddhati cusps are Placidus. Older stored charts used whole-sign. */
export const KP_CUSP_HOUSE_SYSTEM = 'placidus'

const REPORT_WRAPS = ['data', 'profile', 'chart', 'report', 'analysis'] as const

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function hasChartCusps(node: Record<string, unknown>): boolean {
  const cusps = node.cusps
  const planets = node.planets
  const houses = node.houses
  return (
    (Array.isArray(cusps) && cusps.length > 0) ||
    (Array.isArray(planets) && planets.length > 0) ||
    (Array.isArray(houses) && houses.length > 0)
  )
}

/** House system stamped on a stored KP report, including one nested wrapper. */
export function kpStoredCuspHouseSystem(report: Record<string, unknown>): string | undefined {
  if (typeof report.cuspHouseSystem === 'string') return report.cuspHouseSystem
  for (const wrap of REPORT_WRAPS) {
    const inner = asRecord(report[wrap])
    if (inner && typeof inner.cuspHouseSystem === 'string') return inner.cuspHouseSystem
  }
  return undefined
}

/** True when this payload is a KP chart that was not cast with Placidus cusps. */
export function kpChartNeedsPlacidusRecast(report: Record<string, unknown>): boolean {
  const nodes = [report]
  for (const wrap of REPORT_WRAPS) {
    const inner = asRecord(report[wrap])
    if (inner) nodes.push(inner)
  }
  if (!nodes.some(hasChartCusps)) return false
  return kpStoredCuspHouseSystem(report) !== KP_CUSP_HOUSE_SYSTEM
}
