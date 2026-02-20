/**
 * Mundane astrology report builder: assemble chart + risk data and call AI
 * to generate the 8-section narrative. Compliance: risk bands, probabilistic language.
 */

import { createAICompletion } from '@/lib/aiGateway';
import type { MundaneChart } from './mundaneChartService';
import type { RiskScores } from './riskScoring';

export interface MundaneReportInput {
  countryName: string;
  capitalName: string;
  chart: MundaneChart;
  riskScores: RiskScores;
  nationalChartNote?: string;
  year: number;
}

function formatChartSummary(chart: MundaneChart): string {
  const lines: string[] = [
    `Aries Ingress chart: ${chart.datetime.toISOString()} at ${chart.latitude.toFixed(2)}°N, ${chart.longitude.toFixed(2)}°E.`,
    `Ascendant: ${chart.ascendant.sign} ${chart.ascendant.degree.toFixed(1)}°. MC: ${chart.midheaven.sign} ${chart.midheaven.degree.toFixed(1)}°.`,
    'Planets: ' +
      chart.planets
        .map((p) => `${p.name} ${p.sign} ${p.degree.toFixed(0)}° (House ${p.house})`)
        .join('; '),
    'Aspects: ' +
      chart.aspects
        .slice(0, 20)
        .map((a) => `${a.planet1}-${a.planet2} ${a.type} (${a.orb.toFixed(1)}°)`)
        .join('; '),
  ];
  return lines.join('\n');
}

const MUNDANE_SYSTEM_PROMPT = `You are an expert in Mundane (political/national) Astrology. You produce reports that are:
- Framed as cyclical geopolitical modeling, NOT deterministic prediction.
- Using risk bands (low / moderate / elevated / high) and probabilistic language.
- Avoiding political persuasion, definitive election outcomes, or sensational claims.
- Compliant: for reflection and cyclical context only.

You must respond with a single valid JSON object containing exactly these keys (each value is a string of 2-4 short paragraphs):
- executiveOverview
- governmentStability
- economicPressure
- foreignRelationsAndConflictRisk
- socialUnrestIndicators
- legislativeAndInstitutionalHealth
- twelveMonthForecast
- fiveYearStructuralOutlook

Do not include markdown or code fences. Only the JSON object.`;

function buildUserPrompt(input: MundaneReportInput): string {
  const chartText = formatChartSummary(input.chart);
  const r = input.riskScores;
  return `
Generate a mundane astrology report for ${input.countryName} (capital: ${input.capitalName}) for the year ${input.year}.
${input.nationalChartNote ? `National foundation context: ${input.nationalChartNote}.` : ''}

Chart data (Aries Ingress at capital):
${chartText}

Pre-computed risk bands (use these; do not contradict):
- Economic stress: ${r.bands.economic}
- Political stability: ${r.bands.political}
- Conflict risk: ${r.bands.conflict}
- Geopolitical Volatility Score (0-100): ${r.geopoliticalVolatilityScore}

Scores: Economic Stress Index ${r.economicStressIndex}, Political Stability Index ${r.politicalStabilityIndex}, Conflict Risk ${r.conflictRiskScore}.

Write the 8 sections as specified. Use risk bands and probabilistic wording. Keep each section concise (2-4 short paragraphs). No sensationalism.
`.trim();
}

function parseJsonResponse(response: string): Record<string, unknown> {
  const trimmed = response.trim();
  let jsonStr = trimmed;
  const codeBlock = trimmed.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (codeBlock?.[1]) jsonStr = codeBlock[1];
  else {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match?.[0]) jsonStr = match[0];
  }
  jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(jsonStr) as Record<string, unknown>;
}

export interface MundaneReportSections {
  executiveOverview: string;
  governmentStability: string;
  economicPressure: string;
  foreignRelationsAndConflictRisk: string;
  socialUnrestIndicators: string;
  legislativeAndInstitutionalHealth: string;
  twelveMonthForecast: string;
  fiveYearStructuralOutlook: string;
}

export interface MundaneComprehensiveAnalysis {
  countryName: string;
  capitalName: string;
  year: number;
  ingressDatetime: string;
  chartSummary: string;
  riskScores: RiskScores;
  sections: MundaneReportSections;
  disclaimer: string;
}

export async function buildMundaneReport(input: MundaneReportInput): Promise<MundaneComprehensiveAnalysis> {
  const userPrompt = buildUserPrompt(input);

  const result = await createAICompletion({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: MUNDANE_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.5,
    maxTokens: 2400,
    responseFormat: { type: 'json_object' },
  });

  const content = result.content || '';
  const parsed = content.trim() ? parseJsonResponse(content) : {};

  const sections: MundaneReportSections = {
    executiveOverview: String(parsed.executiveOverview ?? 'Executive overview not generated.'),
    governmentStability: String(parsed.governmentStability ?? 'Government stability assessment not generated.'),
    economicPressure: String(parsed.economicPressure ?? 'Economic pressure outlook not generated.'),
    foreignRelationsAndConflictRisk: String(parsed.foreignRelationsAndConflictRisk ?? 'Foreign relations and conflict risk not generated.'),
    socialUnrestIndicators: String(parsed.socialUnrestIndicators ?? 'Social unrest indicators not generated.'),
    legislativeAndInstitutionalHealth: String(parsed.legislativeAndInstitutionalHealth ?? 'Legislative and institutional health not generated.'),
    twelveMonthForecast: String(parsed.twelveMonthForecast ?? '12-month forecast not generated.'),
    fiveYearStructuralOutlook: String(parsed.fiveYearStructuralOutlook ?? '5-year structural outlook not generated.'),
  };

  return {
    countryName: input.countryName,
    capitalName: input.capitalName,
    year: input.year,
    ingressDatetime: input.chart.datetime.toISOString(),
    chartSummary: formatChartSummary(input.chart),
    riskScores: input.riskScores,
    sections,
    disclaimer: 'This report is for reflection and cyclical context only. It is not deterministic prediction, political advice, or a substitute for professional analysis.',
  };
}
