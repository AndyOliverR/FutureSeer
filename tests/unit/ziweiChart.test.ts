/**
 * @jest-environment node
 */

import { astro } from 'iztro'
import { findZiweiPalace, ziweiTimeIndex } from '@/lib/ziweiChart'

/** The pre-fix index: `parseInt('00') || 12` made midnight noon, and 23:00 stayed early Rat. */
function legacyZiweiTimeIndex(birthTime: string): number {
  const parts = String(birthTime || '12:00').trim().split(/[:\s]/)
  const hour = Math.min(23, Math.max(0, parseInt(parts[0], 10) || 12))
  if (hour === 23 || hour === 0) return 0
  return Math.floor((hour + 1) / 2)
}

function lifeStarNames(chart: { palaces: Array<{ name?: string; majorStars?: Array<{ name?: string }> }> }): string {
  const life = findZiweiPalace(chart.palaces, 'soul')
  return (life?.majorStars ?? []).map((star) => star.name).filter(Boolean).join(', ')
}

describe('ziweiTimeIndex', () => {
  const expectedByHour = [0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12]

  it('follows iztro double-hours, including midnight and 23:00', () => {
    expectedByHour.forEach((index, hour) => {
      const hh = String(hour).padStart(2, '0')
      expect(ziweiTimeIndex(`${hh}:30:00`)).toBe(index)
    })
    expect(ziweiTimeIndex('')).toBe(6)
    expect(ziweiTimeIndex(undefined)).toBe(6)
  })

  it('does not cast 00:30 as the Horse hour', () => {
    expect(legacyZiweiTimeIndex('00:30:00')).toBe(6)
    expect(ziweiTimeIndex('00:30:00')).toBe(0)
    expect(legacyZiweiTimeIndex('23:15:00')).toBe(0)
    expect(ziweiTimeIndex('23:15:00')).toBe(12)
  })
})

describe('Zi Wei chart assembly', () => {
  it('puts a midnight birth on early Rat, not noon', () => {
    const midnight = astro.bySolar('1990-6-15', ziweiTimeIndex('00:30:00'), 'male', true, 'en-US')
    const noon = astro.bySolar('1990-6-15', legacyZiweiTimeIndex('00:30:00'), 'male', true, 'en-US')

    expect(midnight.timeRange).toBe('00:00~01:00')
    expect(noon.timeRange).toBe('11:00~13:00')
    expect(midnight.earthlyBranchOfSoulPalace).toBe('woo')
    expect(noon.earthlyBranchOfSoulPalace).toBe('zi')
    expect(lifeStarNames(midnight)).toBe('rebel')
    expect(lifeStarNames(noon)).toBe('general, empress')
  })

  it('counts 23:00 as late Rat, which changes the Life Palace stars', () => {
    const lateRat = astro.bySolar('1990-6-15', ziweiTimeIndex('23:30:00'), 'male', true, 'en-US')
    const earlyRat = astro.bySolar('1990-6-15', legacyZiweiTimeIndex('23:30:00'), 'male', true, 'en-US')

    expect(lateRat.timeRange).toBe('23:00~00:00')
    expect(earlyRat.timeRange).toBe('00:00~01:00')
    expect(lifeStarNames(lateRat)).toBe('sun')
    expect(lifeStarNames(earlyRat)).toBe('rebel')
  })

  it('reads Life Palace stars from the soul palace, not the first palace', () => {
    const chart = astro.bySolar('1990-6-15', ziweiTimeIndex('12:00:00'), 'male', true, 'en-US')
    const first = chart.palaces[0]
    const life = findZiweiPalace(chart.palaces, 'soul')

    expect(first?.name).toBe('spirit')
    expect(life?.name).toBe('soul')
    expect(life?.earthlyBranch).toBe(chart.earthlyBranchOfSoulPalace)
    expect((first?.majorStars ?? []).map((star) => star.name).join(', ')).toBe('wolf')
    expect(lifeStarNames(chart)).toBe('general, empress')
  })
})
