/**
 * @jest-environment node
 */

import { birthCalendarParts, parseBirthDateCalendar } from '@/lib/birthTimeUtils'
import { calculateLifePathNumber } from '@/lib/numerologyCalculations'
import { computeChaldeanProfile } from '@/lib/numerology/chaldean'
import { getZodiacFromDate } from '@/lib/numerology/zodiac'
import { tarotIntelligence } from '@/lib/tarotIntelligence'
import { calculateVedicLifePathNumber } from '@/lib/vedicNumerologyCalculations'

describe('birth date calendar parts', () => {
  it('reads YYYY-MM-DD as the written civil day', () => {
    expect(parseBirthDateCalendar('1990-01-15')).toEqual({ year: 1990, month: 1, day: 15 })
    expect(birthCalendarParts('1990-01-15T00:00:00.000Z')).toEqual({ year: 1990, month: 1, day: 15 })
  })

  it('does not take the life path from the previous local day', () => {
    const getDate = jest.spyOn(Date.prototype, 'getDate')
    try {
      // 15 January 1990 → 6 + 1 + 1 = 8. The previous local day, 14 January, is 7.
      expect(calculateLifePathNumber('1990-01-15')).toBe(8)
      expect(calculateVedicLifePathNumber('1990-01-15')).toBe(8)
      expect(computeChaldeanProfile('Ada', '1990-01-15').numbers.lifePath).toBe(8)
      expect(computeChaldeanProfile('Ada', '1990-01-15').numbers.birthday).toBe(6)
      expect(getDate).not.toHaveBeenCalled()
    } finally {
      getDate.mockRestore()
    }
  })

  it('keeps the first day of Aries on Aries', () => {
    const getDate = jest.spyOn(Date.prototype, 'getDate')
    try {
      expect(getZodiacFromDate('1990-03-21')?.sign).toBe('Aries')
      expect(getDate).not.toHaveBeenCalled()
    } finally {
      getDate.mockRestore()
    }
  })

  it('casts tarot profile cards from the written birth day', () => {
    const getDate = jest.spyOn(Date.prototype, 'getDate')
    try {
      const cards = tarotIntelligence.calculateProfileCards('1990-01-15', 'Ada')
      // Digit sum 1+5+1+1+9+9+0 = 26 → 8. The previous day sums to 7.
      expect(cards.birthCard?.number).toBe(8)
      expect(cards.lifePathCard?.number).toBe(8)
      expect(getDate).not.toHaveBeenCalled()
    } finally {
      getDate.mockRestore()
    }
  })
})
