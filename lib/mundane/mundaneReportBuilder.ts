/**
 * Mundane astrology report builder: assemble chart + risk data and call AI
 * to generate the 8-section narrative. Compliance: risk bands, probabilistic language.
 */

import { callStructuredAI } from '@/lib/aiStructuredOutput';
import { devLog } from '@/lib/devLogger';
import type { MundaneChart } from './mundaneChartService';
import type { RiskScores } from './riskScoring';

export interface MundaneReportInput {
  countryName: string;
  /** National administrative capital (narrative context only). */
  nationalCapitalName: string | null;
  /** Geocoded or resolved place where the ingress chart is cast. */
  chartLocationName: string;
  chart: MundaneChart;
  riskScores: RiskScores;
  nationalChartNote?: string;
  year: number;
  /** Human-readable ingress time in a best-effort timezone for the country. */
  ingressDisplayLocal: string;
}

function formatLatLon(lat: number, lon: number): string {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${ns}, ${Math.abs(lon).toFixed(2)}°${ew}`;
}

function formatChartSummary(chart: MundaneChart): string {
  const lines: string[] = [
    `Aries Ingress chart: ${chart.datetime.toISOString()} at ${formatLatLon(chart.latitude, chart.longitude)}.`,
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
  const capitalLine = input.nationalCapitalName
    ? `National administrative capital (context only): ${input.nationalCapitalName}.`
    : '';
  return `
Generate a mundane astrology report for ${input.countryName} for the year ${input.year}.
The Aries Ingress chart is cast for: ${input.chartLocationName}.
${capitalLine}
${input.nationalChartNote ? `National foundation context: ${input.nationalChartNote}.` : ''}
Ingress (reference local display): ${input.ingressDisplayLocal}.

Chart data:
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
  /** National administrative capital when known (e.g. New Delhi). */
  capitalName: string | null;
  /** Place the ingress chart was cast for (geocoded scope or fallback label). */
  chartLocationName: string;
  year: number;
  ingressDatetime: string;
  /** Formatted ingress time for the user’s region (best-effort timezone). */
  ingressDisplayLocal: string;
  chartSummary: string;
  riskScores: RiskScores;
  sections: MundaneReportSections;
  disclaimer: string;
}

export async function buildMundaneReport(input: MundaneReportInput): Promise<MundaneComprehensiveAnalysis> {
  const userPrompt = buildUserPrompt(input);

  const structured = await callStructuredAI({
    label: 'mundane-comprehensive',
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: MUNDANE_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.5,
    maxTokens: 2400,
    responseFormat: { type: 'json_object' },
    maxAttempts: 3,
  });

  if (!structured.ok && structured.failureMode !== 'none') {
    devLog.warn(
      `mundane-comprehensive structured AI: ${structured.failureMode} after ${structured.attempts} attempt(s)`,
      undefined,
      'mundaneReportBuilder',
    );
  }

  const parsed = structured.raw ?? {};

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
    capitalName: input.nationalCapitalName,
    chartLocationName: input.chartLocationName,
    year: input.year,
    ingressDatetime: input.chart.datetime.toISOString(),
    ingressDisplayLocal: input.ingressDisplayLocal,
    chartSummary: formatChartSummary(input.chart),
    riskScores: input.riskScores,
    sections,
    disclaimer: 'This report is for reflection and cyclical context only. It is not deterministic prediction, political advice, or a substitute for professional analysis.',
  };
}
