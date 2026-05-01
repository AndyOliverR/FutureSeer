import { createAICompletion } from '@/lib/aiGateway';
import type { NatalWealthProfile } from '@/lib/financialAstrology/natalWealthEngine';
import type { MarketCycleProfile } from '@/lib/financialAstrology/marketCycleEngine';
import type { AlignmentOutput } from '@/lib/financialAstrology/integrationEngine';
import { AnalystReportSchema, type AnalystReport, type AnalystRole } from '@/lib/financialAstrology/multiAgent/schemas';
import { parseJsonObjectFromLLM } from '@/lib/financialAstrology/multiAgent/jsonParse';
import {
  buildNatalWealthAnalystSystemPrompt,
  buildMarketCycleAnalystSystemPrompt,
  buildMundaneCollectiveAnalystSystemPrompt,
  buildPersonalTimingAnalystSystemPrompt,
} from '@/lib/financialAstrology/multiAgent/prompts';

export function getFinancialMultiAgentAnalystModel(): string {
  return process.env.FINANCIAL_MULTIAGENT_ANALYST_MODEL?.trim() || 'llama-3.1-8b-instant';
}

function serializeNatalContext(natal: NatalWealthProfile, chartContext: string): string {
  const houses = natal.wealthHouses
    .map(
      (h) =>
        `H${h.houseNumber} ${h.sign}: strength ${h.strength}, stress ${h.maleficStress}, ${h.summary}`
    )
    .join('\n');
  const planets = natal.wealthPlanets
    .map((p) => `${p.planet} in ${p.sign} H${p.house}, dignity ${p.dignity}, score ${p.score}, ${p.financialRole}`)
    .join('\n');
  return JSON.stringify(
    {
      scores: {
        incomeStabilityScore: natal.incomeStabilityScore,
        speculativeRiskIndex: natal.speculativeRiskIndex,
        longTermAccumulationScore: natal.longTermAccumulationScore,
        liquidityStressIndex: natal.liquidityStressIndex,
        temperamentSummary: natal.temperamentSummary,
      },
      wealthHouses: houses,
      wealthPlanets: planets,
      chartContextSnippet: chartContext.slice(0, 6000),
    },
    null,
    2
  );
}

function serializeMarketContext(market: MarketCycleProfile, asOf: Date): string {
  return JSON.stringify(
    {
      asOfISO: asOf.toISOString(),
      currentPhase: market.currentPhase,
      expansionScore: market.expansionScore,
      contractionScore: market.contractionScore,
      volatilityIndex: market.volatilityIndex,
      liquidityCompression: market.liquidityCompression,
      cycles: market.cycles.slice(0, 12),
      volatilityWindows: market.volatilityWindows.slice(0, 12),
      climateSample: market.next12MonthsOverview.slice(0, 6),
    },
    null,
    2
  );
}

function serializeMundaneContext(market: MarketCycleProfile, asOf: Date): string {
  return JSON.stringify(
    {
      asOfISO: asOf.toISOString(),
      collectiveCycles: market.cycles,
      volatilityWindows: market.volatilityWindows,
      phase: market.currentPhase,
      volatilityIndex: market.volatilityIndex,
    },
    null,
    2
  );
}

function serializeAlignmentContext(alignment: AlignmentOutput): string {
  return JSON.stringify(alignment, null, 2);
}

async function runOneAnalyst(
  expectedRole: AnalystRole,
  systemPrompt: string,
  userPayload: string
): Promise<AnalystReport> {
  const model = getFinancialMultiAgentAnalystModel();
  const result = await createAICompletion({
    model,
    messages: [
      {
        role: 'system',
        content:
          'Respond only with a single valid JSON object matching the schema in your instructions. No markdown, no prose outside JSON.',
      },
      { role: 'user', content: `${systemPrompt}\n\n## Precomputed data\n${userPayload}` },
    ],
    temperature: 0.45,
    maxTokens: 700,
    responseFormat: { type: 'json_object' },
  });
  const raw = parseJsonObjectFromLLM(result?.content || '{}');
  const parsed = AnalystReportSchema.safeParse({ ...raw, role: expectedRole });
  if (!parsed.success) {
    throw new Error(`Analyst parse failed: ${parsed.error.message}`);
  }
  return { ...parsed.data, role: expectedRole };
}

export async function runNatalWealthAnalyst(
  natal: NatalWealthProfile,
  chartContext: string
): Promise<AnalystReport> {
  const payload = serializeNatalContext(natal, chartContext);
  return runOneAnalyst('natalWealth', buildNatalWealthAnalystSystemPrompt(), payload);
}

export async function runMarketCycleAnalyst(
  market: MarketCycleProfile,
  asOf: Date = new Date()
): Promise<AnalystReport> {
  const payload = serializeMarketContext(market, asOf);
  return runOneAnalyst('marketCycle', buildMarketCycleAnalystSystemPrompt(), payload);
}

export async function runMundaneCollectiveAnalyst(
  market: MarketCycleProfile,
  asOf: Date = new Date()
): Promise<AnalystReport> {
  const payload = serializeMundaneContext(market, asOf);
  return runOneAnalyst('mundaneCollective', buildMundaneCollectiveAnalystSystemPrompt(), payload);
}

export async function runPersonalTimingAnalyst(
  alignment: AlignmentOutput,
  chartContext: string
): Promise<AnalystReport> {
  const payload = `${serializeAlignmentContext(alignment)}\n\n## Chart context (snippet)\n${chartContext.slice(0, 4000)}`;
  return runOneAnalyst('personalTiming', buildPersonalTimingAnalystSystemPrompt(), payload);
}

export async function runAllFinancialAnalysts(params: {
  natalWealth: NatalWealthProfile;
  marketCycle: MarketCycleProfile;
  alignment: AlignmentOutput;
  chartContext: string;
  asOf?: Date;
}): Promise<AnalystReport[]> {
  const asOf = params.asOf ?? new Date();
  const [a, b, c, d] = await Promise.all([
    runNatalWealthAnalyst(params.natalWealth, params.chartContext),
    runMarketCycleAnalyst(params.marketCycle, asOf),
    runMundaneCollectiveAnalyst(params.marketCycle, asOf),
    runPersonalTimingAnalyst(params.alignment, params.chartContext),
  ]);
  return [a, b, c, d];
}
