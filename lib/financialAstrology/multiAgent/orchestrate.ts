import type { NatalWealthProfile } from '@/lib/financialAstrology/natalWealthEngine';
import type { MarketCycleProfile } from '@/lib/financialAstrology/marketCycleEngine';
import type { AlignmentOutput } from '@/lib/financialAstrology/integrationEngine';
import type { FinancialHistoryEntry, MultiAgentResult } from '@/lib/financialAstrology/multiAgent/schemas';
import { MultiAgentResultSchema } from '@/lib/financialAstrology/multiAgent/schemas';
import { runAllFinancialAnalysts } from '@/lib/financialAstrology/multiAgent/analystAgents';
import { runBullBearDebate, getFinancialMultiAgentDebateRounds } from '@/lib/financialAstrology/multiAgent/debate';
import { synthesizePosture } from '@/lib/financialAstrology/multiAgent/synthesize';

export { isFinancialMultiAgentEnabled } from '@/lib/financialAstrology/multiAgent/flags';

export type MultiAgentSerializable = Omit<MultiAgentResult, 'posture'> & {
  posture: MultiAgentResult['posture'];
};

/**
 * Full multi-agent financial astrology pass: analysts → debate → synthesis.
 * Throws on any hard failure so the API route can fall back to legacy single-call.
 */
export async function runFinancialAstrologyMultiAgent(params: {
  chartContext: string;
  natalWealth: NatalWealthProfile;
  marketCycle: MarketCycleProfile;
  alignment: AlignmentOutput;
  priorHistory?: FinancialHistoryEntry[];
  asOf?: Date;
}): Promise<MultiAgentSerializable> {
  const asOf = params.asOf ?? new Date();
  const analystReports = await runAllFinancialAnalysts({
    natalWealth: params.natalWealth,
    marketCycle: params.marketCycle,
    alignment: params.alignment,
    chartContext: params.chartContext,
    asOf,
  });

  if (analystReports.length !== 4) {
    throw new Error('Expected four analyst reports');
  }

  const debate = await runBullBearDebate(analystReports, getFinancialMultiAgentDebateRounds());
  const posture = await synthesizePosture({
    analystReports,
    debate,
    priorHistory: params.priorHistory,
  });

  const bundle = {
    analystReports,
    debate,
    posture,
    generatedAt: new Date().toISOString(),
  };

  const validated = MultiAgentResultSchema.safeParse(bundle);
  if (!validated.success) {
    throw new Error(`Multi-agent bundle validation failed: ${validated.error.message}`);
  }

  return validated.data;
}
