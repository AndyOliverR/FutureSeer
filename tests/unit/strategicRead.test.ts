import { buildStrategicReadData } from '@/lib/strategicRead';
import type { ComprehensiveMysticalProfile } from '@/contexts/MysticalProfileContext';

function minimalProfile(overrides: Partial<ComprehensiveMysticalProfile> = {}): ComprehensiveMysticalProfile {
  return {
    metadata: { generatedAt: Date.now(), version: '1' },
    vedic: {
      currentDasha: { planet: 'Jupiter', startDate: '', endDate: '' },
      planets: [{ name: 'Moon', sign: 'Libra' }],
    },
    interpretations: {
      career: { overview: 'Leadership and public visibility are emphasized this year.' },
      dasha: { timing: 'A supportive window for steady career moves.' },
      personality: { strengths: ['Strategic patience'], challenges: [] },
    },
    ...overrides,
  } as ComprehensiveMysticalProfile;
}

describe('buildStrategicReadData', () => {
  it('returns guest pattern when profile is missing', () => {
    const data = buildStrategicReadData(null, 'Alex', new Date('2026-06-02T12:00:00Z'));
    expect(data.headline).toBe('Strategic read for Alex');
    expect(data.patternTitle).toBe('Scan your environment');
    expect(data.ctaHref).toBe('/profile');
    expect(data.signals.length).toBeGreaterThanOrEqual(1);
    expect(data.scenarioPrompts).toHaveLength(2);
  });

  it('clusters career signals and sets action band for favorable timing', () => {
    const data = buildStrategicReadData(minimalProfile(), 'Priya');
    expect(data.patternTitle).toMatch(/Career|Timing|Cross-currents/);
    expect(['observe', 'neutral', 'favorable']).toContain(data.actionBand);
    expect(data.actionBandLabel).toBeTruthy();
    expect(data.ctaHref).toBe('/seer');
    expect(data.signals.some((s) => s.id === 'moon-sign')).toBe(true);
  });

  it('leans observe when malefic dasha and multiple challenges', () => {
    const data = buildStrategicReadData(
      minimalProfile({
        vedic: {
          currentDasha: { planet: 'Saturn', startDate: '', endDate: '' },
          planets: [{ name: 'Moon', sign: 'Scorpio' }],
        },
        interpretations: {
          personality: {
            strengths: ['Resilience'],
            challenges: ['Impatience', 'Overcommitment'],
          },
        },
      }),
      null,
    );
    expect(data.actionBand).toBe('observe');
    expect(data.actionBandLabel).toBe('Observe');
  });
});
