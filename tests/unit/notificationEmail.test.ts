import { formatDailyInsightEmailHtml } from '@/lib/dailyInsightEmailFormat';

describe('formatDailyInsightEmailHtml', () => {
  it('includes personalized insight summary and moon sign', () => {
    const { subject, html } = formatDailyInsightEmailHtml({
      displayName: 'Ananya',
      nudgeStage: 'active',
      trialDaysLeft: null,
      insight: {
        summary: 'Sun rules this day—lead with clarity.',
        accentLabel: 'Sun day',
        luckyColor: 'Gold',
        luckyNumber: 7,
        rulingPlanet: 'Sun',
        moonSign: 'Libra',
      },
    });
    expect(subject).toBe('Your Daily Astrological Insight');
    expect(html).toContain('Hi Ananya');
    expect(html).toContain('lead with clarity');
    expect(html).toContain('Moon in Libra');
    expect(html).toContain('Lucky number: 7');
  });
});
