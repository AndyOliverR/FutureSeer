import { calcKuaNumber, getKuaResult, gregorianYearFromBirthDate, KUA_FORMULA_VERSION } from '@/lib/numerology/kua'
import { calculateKuaAnalysis, fengShuiAnalysisIsCurrent, generateFengShuiAnalysis } from '@/lib/fengshui/fengShuiService'
import type { UserProfile } from '@/lib/firebase'

function profile(birthDate: string, gender: 'male' | 'female'): UserProfile {
  return {
    uid: 'kua-test',
    email: 'kua@example.com',
    displayName: 'Kua Test',
    isSubscribed: false,
    isTipped: false,
    createdAt: 0,
    lastLoginAt: 0,
    birthDate,
    gender,
  }
}

describe('calcKuaNumber', () => {
  it('uses the Eight Mansions number for published birth years', () => {
    expect(calcKuaNumber(1975, true)).toBe(7)
    expect(calcKuaNumber(1978, false)).toBe(2)
    expect(calcKuaNumber(1985, true)).toBe(6)
    expect(calcKuaNumber(1990, true)).toBe(1)
    expect(calcKuaNumber(1995, true)).toBe(2)
    expect(calcKuaNumber(1964, true)).toBe(9)
    expect(calcKuaNumber(1964, false)).toBe(6)
    expect(calcKuaNumber(2000, true)).toBe(9)
    expect(calcKuaNumber(2000, false)).toBe(6)
    expect(calcKuaNumber(2001, true)).toBe(8)
    expect(calcKuaNumber(2008, false)).toBe(8)
    expect(calcKuaNumber(2009, true)).toBe(9)
    expect(calcKuaNumber(2014, true)).toBe(4)
    expect(calcKuaNumber(2014, false)).toBe(2)
  })

  it('keeps East-group Kua 1 off West-group directions', () => {
    const result = getKuaResult(1990, true)
    expect(result.number).toBe(1)
    expect(result.element).toBe('Water')
    expect(result.directions).toEqual({
      success: 'Southeast',
      health: 'East',
      relationships: 'South',
      wisdom: 'North',
    })
    expect(Object.values(result.directions)).not.toContain('Northeast')
  })

  it('uses Fu Wei as the sitting direction', () => {
    expect(getKuaResult(1975, true).directions.wisdom).toBe('West')
    expect(getKuaResult(1964, false).directions.wisdom).toBe('Northwest')
    expect(getKuaResult(2000, true).directions.wisdom).toBe('South')
  })
})

describe('Feng Shui Kua year', () => {
  it('reads the ISO calendar year instead of shifting January 1', () => {
    expect(gregorianYearFromBirthDate('1990-01-01')).toBe(1990)
    const analysis = calculateKuaAnalysis(profile('1990-01-01', 'male'))
    expect(analysis?.number).toBe(1)
    expect(analysis?.favorableDirections.success).toBe('Southeast')
  })

  it('marks a fresh analysis with the current formula version', () => {
    const analysis = generateFengShuiAnalysis(profile('1990-06-15', 'male'))
    expect(analysis?.formulaVersion).toBe(KUA_FORMULA_VERSION)
    expect(fengShuiAnalysisIsCurrent(analysis)).toBe(true)
    expect(fengShuiAnalysisIsCurrent({ formulaVersion: 1 })).toBe(false)
    expect(fengShuiAnalysisIsCurrent({})).toBe(false)
  })
})
