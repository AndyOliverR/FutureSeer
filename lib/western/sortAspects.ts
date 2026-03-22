/**
 * Stable aspect ordering: tightest orbs first, then planet-pair name order.
 */

export interface AspectRow {
  planet1: string
  planet2: string
  type: string
  orb?: number
}

export function sortAspectsForDisplay<T extends AspectRow>(aspects: T[]): T[] {
  return [...aspects].sort((a, b) => {
    const orbA = typeof a.orb === 'number' && !Number.isNaN(a.orb) ? a.orb : 999
    const orbB = typeof b.orb === 'number' && !Number.isNaN(b.orb) ? b.orb : 999
    if (orbA !== orbB) return orbA - orbB
    const pairA = [a.planet1, a.planet2].sort().join('|')
    const pairB = [b.planet1, b.planet2].sort().join('|')
    const c = pairA.localeCompare(pairB)
    if (c !== 0) return c
    return (a.type || '').localeCompare(b.type || '')
  })
}

export function formatAspectType(type: string): string {
  const t = (type || '').toLowerCase()
  if (!t) return ''
  return t.charAt(0).toUpperCase() + t.slice(1)
}
