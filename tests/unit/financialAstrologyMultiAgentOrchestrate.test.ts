jest.mock('@/lib/aiGateway', () => ({
  createAICompletion: jest.fn(),
}));

import { createAICompletion } from '@/lib/aiGateway';
import { runFinancialAstrologyMultiAgent } from '@/lib/financialAstrology/multiAgent/orchestrate';
import { computeNatalWealthProfile } from '@/lib/financialAstrology/natalWealthEngine';
import { computeMarketCycleProfile } from '@/lib/financialAstrology/marketCycleEngine';
import { computeAlignment } from '@/lib/financialAstrology/integrationEngine';

describe('runFinancialAstrologyMultiAgent', () => {
  const planets = [
    { name: 'Sun', sign: 'Leo', house: 10, degree: 10, isRetrograde: false },
    { name: 'Moon', sign: 'Cancer', house: 9, degree: 5, isRetrograde: false },
  ];
  const houses = [
    { number: 1, sign: 'Scorpio', degree: 0 },
    { number: 2, sign: 'Sagittarius', degree: 30 },
  ];
  const natal = computeNatalWealthProfile(planets as never, houses as never);
  const market = computeMarketCycleProfile(new Date('2026-06-15'));
  const alignment = computeAlignment(natal, market);

  beforeEach(() => {
    (createAICompletion as jest.Mock).mockImplementation(
      async (opts: { messages: Array<{ content?: string }> }) => {
        const user = String(opts.messages[1]?.content ?? '');
        if (user.includes('Natal Wealth Analyst')) {
          return {
            content: JSON.stringify({
              summary: 'Natal summary',
              signals: ['n1'],
              notableTransits: [],
              confidence: 0.75,
            }),
          };
        }
        if (user.includes('Market Cycle Analyst')) {
          return {
            content: JSON.stringify({
              summary: 'Market summary',
              signals: ['m1'],
              notableTransits: [],
              confidence: 0.7,
            }),
          };
        }
        if (user.includes('Mundane / Collective')) {
          return {
            content: JSON.stringify({
              summary: 'Mundane summary',
              signals: ['u1'],
              notableTransits: [],
              confidence: 0.65,
            }),
          };
        }
        if (user.includes('Personal Timing Analyst')) {
          return {
            content: JSON.stringify({
              summary: 'Timing summary',
              signals: ['t1'],
              notableTransits: [],
              confidence: 0.72,
            }),
          };
        }
        if (user.includes('Five-tier rating')) {
          return {
            content: JSON.stringify({
              rating: 'steady',
              executiveSummary: 'Balanced posture.',
              thesis: 'Integrated thesis.',
              timeHorizonDays: 45,
              riskBand: 'medium',
            }),
          };
        }
        if (user.includes('You are the Opportunity Seer')) {
          return {
            content: JSON.stringify({
              side: 'bull',
              round: 1,
              citations: ['natal'],
              argument: 'Opportunity argument.',
            }),
          };
        }
        if (user.includes('You are the Caution Seer')) {
          return {
            content: JSON.stringify({
              side: 'bear',
              round: 1,
              citations: ['market'],
              argument: 'Caution argument.',
            }),
          };
        }
        return { content: '{}' };
      }
    );
  });

  it('returns validated multi-agent bundle', async () => {
    process.env.FINANCIAL_MULTIAGENT_DEBATE_ROUNDS = '1';
    const out = await runFinancialAstrologyMultiAgent({
      chartContext: 'Sun in Leo H10',
      natalWealth: natal,
      marketCycle: market,
      alignment,
      priorHistory: [],
    });
    expect(out.analystReports).toHaveLength(4);
    expect(out.debate.length).toBeGreaterThanOrEqual(2);
    expect(out.posture?.rating).toBe('steady');
  });
});
