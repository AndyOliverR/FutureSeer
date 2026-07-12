import { buildDailyInsightCardData } from '@/lib/dailyInsightForHome'
import type { ComprehensiveMysticalProfile } from '@/contexts/MysticalProfileContext'

function makeProfile(overrides: Partial<ComprehensiveMysticalProfile> = {}): ComprehensiveMysticalProfile {
  return {
    vedic: {
      ascendant: 0,
      planets: [],
      houses: [],
      nakshatras: [],
      yogas: [],
      dasha: [],
      currentDasha: {},
    },
    interpretations: {
      personality: { overview: '', strengths: [], challenges: [] },
      lifePurpose: { overview: '', karmicLessons: [], spiritualPath: '', soulEvolution: '' },
      relationships: { overview: '', marriageTiming: '', compatibility: '', familyLife: '' },
      career: { overview: '', suitableProfessions: [], successFactors: [], timing: '' },
      health: { overview: '', constitution: '', healthTips: [], vulnerableAreas: [] },
      spirituality: { overview: '', practices: [], evolution: '', divineConnection: '' },
      dasha: { overview: '', current: {}, upcoming: [], timing: '' },
      remedies: { overview: '', mantras: [], gemstones: [], practices: [] },
    },
    metadata: {
      source: 'test',
      version: '1',
      generatedAt: '2026-01-01T00:00:00.000Z',
      calculationTime: 0,
      systemsUsed: [],
      interpretationType: 'test',
    },
    ...overrides,
  }
}

describe('buildDailyInsightCardData', () => {
  const fixedDate = new Date('2026-07-12T12:00:00.000Z') // Sunday → Sun

  it('uses Sunday Sun ruler and guest copy without profile', () => {
    const data = buildDailyInsightCardData(null, null, fixedDate)
    expect(data.rulingPlanet).toBe('Sun')
    expect(data.accentLabel).toBe('Sun day')
    expect(data.headline).toBe('Your day at a glance')
    expect(data.summary).toContain('Sun rules this day')
    expect(data.ctaHref).toBe('/profile')
  })

  it('personalizes with display name and profile strengths', () => {
    const profile = makeProfile({
      userId: 'u1',
      interpretations: {
        ...makeProfile().interpretations,
        personality: {
          overview: '',
          strengths: ['You lead with calm intuition under pressure.'],
          challenges: [],
        },
      },
      vedic: {
        ...makeProfile().vedic,
        planets: [{ name: 'Moon', sign: 'Libra' }],
      },
    })
    const data = buildDailyInsightCardData(profile, 'Ananya Devi', fixedDate)
    expect(data.headline).toBe('Today for Ananya')
    expect(data.moonSign).toBe('Libra')
    expect(data.summary).toContain('calm intuition')
    expect(data.ctaHref).toBe('/mystical-profile')
    expect(data.luckyNumber).toBeGreaterThanOrEqual(1)
    expect(data.luckyNumber).toBeLessThanOrEqual(9)
  })
})
