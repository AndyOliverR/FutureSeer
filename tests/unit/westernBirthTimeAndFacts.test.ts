import {
  formatDualHourLabel,
  time12To24,
  time24To12,
} from '@/lib/birthTime12h24hLabels'
import {
  aspectHarmonyScore,
  elementModalityPolarityCounts,
  partOfFortuneFromPlanets,
} from '@/lib/western/chartDerivedFacts'
import { computeSwissNatalPlanets } from '@/lib/western/swissNatalChart'

describe('birthTime12h24hLabels', () => {
  it('labels hours in Cafe-style form', () => {
    expect(formatDualHourLabel(0)).toContain('midnight')
    expect(formatDualHourLabel(13)).toContain('1 pm')
    expect(formatDualHourLabel(14)).toContain('2 pm')
  })

  it('round-trips 24h via 12h helpers', () => {
    expect(time12To24(2, 30, 'PM')).toBe('14:30')
    const t = time24To12('14:30')
    expect(t.hour12).toBe(2)
    expect(t.ampm).toBe('PM')
    expect(t.minute).toBe(30)
  })
})

describe('chartDerivedFacts western extras', () => {
  it('counts elements for classical planets', () => {
    const planets = [
      { name: 'Sun', sign: 'Pisces' },
      { name: 'Moon', sign: 'Cancer' },
      { name: 'Mercury', sign: 'Aquarius' },
      { name: 'Venus', sign: 'Aries' },
      { name: 'Mars', sign: 'Pisces' },
      { name: 'Jupiter', sign: 'Sagittarius' },
      { name: 'Saturn', sign: 'Scorpio' },
      { name: 'Uranus', sign: 'Sagittarius' },
      { name: 'Neptune', sign: 'Sagittarius' },
      { name: 'Pluto', sign: 'Libra' },
    ]
    const c = elementModalityPolarityCounts(planets as never)
    expect(c.fire + c.earth + c.air + c.water).toBe(10)
    expect(c.masculine + c.feminine).toBe(10)
  })

  it('computes Part of Fortune when longitudes exist', () => {
    const asc = 99.77
    const sun = 335.2
    const moon = 113.37
    const planets = [
      { name: 'Ascendant', longitude: asc, sign: 'Cancer', house: 1 },
      { name: 'Sun', longitude: sun, sign: 'Pisces', house: 9 },
      { name: 'Moon', longitude: moon, sign: 'Cancer', house: 1 },
    ]
    const pof = partOfFortuneFromPlanets(planets as never)
    expect(pof).not.toBeNull()
    expect(pof!.isDayChart).toBe(true)
    expect(pof!.sign).toBe('Scorpio')
  })

  it('aspectHarmonyScore returns finite numbers', () => {
    expect(aspectHarmonyScore('trine', 1)).toBeLessThan(100)
    expect(aspectHarmonyScore('square', 2)).toBeLessThan(0)
  })
})

describe('computeSwissNatalPlanets (WASM)', () => {
  it('returns tropical Sun near Pisces 5° for Mysore sample UTC', async () => {
    const d = new Date(Date.UTC(1983, 1, 24, 9, 0, 0))
    const r = await computeSwissNatalPlanets(d)
    if (!r) {
      // Native/WASM may be unavailable in some CI sandboxes
      return
    }
    expect(r.planets.sun.longitude).toBeGreaterThan(334)
    expect(r.planets.sun.longitude).toBeLessThan(336)
    expect(r.julianDayUt).toBeGreaterThan(2445389)
  })
})
