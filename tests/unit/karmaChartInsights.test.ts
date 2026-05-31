import { buildVedicKarmaInsights } from '@/lib/vedic/karmaChartInsights';

describe('buildVedicKarmaInsights', () => {
  it('returns philosophy and prompts without chart data', () => {
    const result = buildVedicKarmaInsights(null);
    expect(result.philosophy).toMatch(/karmic blueprint|not a fixed fate/i);
    expect(result.chartSignals).toHaveLength(0);
    expect(result.reflectionPrompts.length).toBeGreaterThan(0);
  });

  it('builds chart signals from Moon, Lagna, and dasha', () => {
    const result = buildVedicKarmaInsights({
      ascendant: { signName: 'Cancer' },
      planets: [
        { name: 'Moon', signName: 'Taurus', house: 4, nakshatra: 'Rohini' },
        { name: 'Saturn', signName: 'Capricorn', house: 8 },
        { name: 'Rahu', signName: 'Gemini', house: 12 },
      ],
      currentDasha: { planet: 'Saturn' },
    });
    expect(result.chartSignals.some((s) => s.includes('Moon'))).toBe(true);
    expect(result.chartSignals.some((s) => s.includes('Lagna'))).toBe(true);
    expect(result.chartSignals.some((s) => s.includes('Saturn'))).toBe(true);
    expect(result.dashaTheme).toMatch(/Structure|accountability|patience/i);
  });
});
