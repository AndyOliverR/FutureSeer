import {
  mapVedicCareerParsed,
  buildVedicCareerPrompt,
  formatCareerReportForSeer,
} from '@/lib/vedic/vedicCareerReport';

describe('vedicCareerReport', () => {
  it('maps parsed JSON into career analysis shape', () => {
    const result = mapVedicCareerParsed({
      careerProfile: 'Leo lagna favors visibility.',
      dashaCareer: 'Jupiter mahadasha supports growth.',
      nextDashaCareer: 'Saturn next.',
      careerYogas: 'Gaja Kesari',
      moneyAndWealth: '2nd house strong.',
      venusCareer: 'Venus in 3rd.',
      careerTiming: 'Q3 favorable for negotiation.',
      doshaAlerts: 'None significant.',
      sevenDayPlan: [
        {
          day: 1,
          label: 'Day 1',
          theme: 'Career house',
          chartReason: '10th lord active',
          action: 'Send one outreach',
          directionColour: 'Face east',
          eveningCheck: 'Did you send it?',
        },
      ],
      monthByMonth: [{ month: 'June 2026', focus: 'Apply', actions: ['Update CV'] }],
      careerPaths: [{ title: 'Lead PM', fit: 'Mercury strong', actionTip: 'Pitch one idea' }],
      actionableAdvice: ['Network weekly'],
      alignmentScore: { score: 8, bullets: ['Strong 10th', 'Watch Saturn'] },
    });

    expect(result.careerProfile).toContain('Leo');
    expect(result.sevenDayPlan).toHaveLength(1);
    expect(result.alignmentScore.score).toBe(8);
    expect(result.careerPaths[0].title).toBe('Lead PM');
  });

  it('buildVedicCareerPrompt includes chart and client context', () => {
    const prompt = buildVedicCareerPrompt(
      {
        ascendant: { signName: 'Leo' },
        planets: [{ name: 'Sun', signName: 'Leo', house: 10 }],
        currentDasha: { planet: 'Jupiter', antardasha: 'Venus' },
      },
      { fullName: 'Priya', currentRole: 'Designer' },
    );
    expect(prompt).toContain('Leo');
    expect(prompt).toContain('Jupiter');
    expect(prompt).toContain('Priya');
    expect(prompt).toContain('sevenDayPlan');
  });

  it('formatCareerReportForSeer includes lens header', () => {
    const block = formatCareerReportForSeer(
      mapVedicCareerParsed({
        careerProfile: 'Test profile',
        dashaCareer: 'Dasha',
        nextDashaCareer: 'Next',
        careerYogas: 'Yogas',
        moneyAndWealth: 'Money',
        venusCareer: 'Venus',
        careerTiming: 'Timing',
        doshaAlerts: '',
        sevenDayPlan: [],
        monthByMonth: [],
        careerPaths: [],
        actionableAdvice: [],
        alignmentScore: { score: 5, bullets: [] },
      }),
    );
    expect(block).toContain('Career lens report');
  });
});
