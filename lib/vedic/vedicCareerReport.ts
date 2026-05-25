import { parseStructuredJsonFromResponse } from '@/lib/aiStructuredOutputParse';
import type { ChartDataInput } from '@/lib/vedic/vedicChartContext';
import { formatChartContextBlock } from '@/lib/vedic/vedicChartContext';
import {
  birthProfileMatches,
  getVedicReportDoc,
  VEDIC_FOCUSED_CACHE_TTL_MS,
  type VedicBirthProfile,
} from '@/lib/vedic/vedicReportFirestore';

export const VEDIC_CAREER_REPORT_SCHEMA_VERSION = '1.0';
export const VEDIC_CAREER_CACHE_DOC_ID = 'comprehensiveVedicCareer';

export interface VedicCareerDayPlan {
  day: number;
  label: string;
  theme: string;
  chartReason: string;
  action: string;
  directionColour: string;
  eveningCheck: string;
}

export interface VedicCareerMonth {
  month: string;
  focus: string;
  actions: string[];
  caution?: string;
}

export interface VedicCareerPath {
  title: string;
  fit: string;
  actionTip: string;
}

export interface VedicCareerAnalysis {
  careerProfile: string;
  dashaCareer: string;
  nextDashaCareer: string;
  careerYogas: string;
  moneyAndWealth: string;
  venusCareer: string;
  careerTiming: string;
  doshaAlerts: string;
  sevenDayPlan: VedicCareerDayPlan[];
  monthByMonth: VedicCareerMonth[];
  careerPaths: VedicCareerPath[];
  actionableAdvice: string[];
  alignmentScore: { score: number; bullets: string[] };
}

export function buildVedicCareerPrompt(
  chart: ChartDataInput,
  userProfile?: VedicBirthProfile,
): string {
  const today = new Date();
  const currentYear = today.getFullYear();
  const name = userProfile?.fullName || userProfile?.displayName || 'the user';
  const role = userProfile?.currentRole?.trim();
  const skills = userProfile?.skills?.trim();
  const userContext = [
    role ? `Current role/context: ${role}` : '',
    skills ? `Skills/interests: ${skills}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const chartBlock = formatChartContextBlock(chart, userContext);

  return `You are an expert Vedic (Jyotish) astrologer writing a **Career & timing** report only. Use traditional Jyotish: 10th house (karma/career), 2nd and 11th (wealth/gains), 6th (service/competition), lagna lord, Saturn/Mercury/Jupiter/Mars for profession, Dasha as primary timing. No medical or legal certainty. No fear-mongering on doshas.

Today: ${today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Year: ${currentYear}

Client: ${name}
${chartBlock}

RULES:
- Every section MUST reference THIS chart (houses, lords, dasha, planets). No generic horoscope filler.
- Dasha decides possibility; transits refine timing — use periods/months, not fake exact dates unless dasha supports a window.
- sevenDayPlan: exactly 7 days starting from today; each day actionable (career/wealth/10th/11th/Venus themes).
- monthByMonth: next 12 calendar months from ${today.toLocaleString('en-US', { month: 'long', year: 'numeric' })}.
- careerPaths: 5–7 realistic role/industry directions tied to chart.
- alignmentScore.score: integer 1–10 with 3–5 bullets.
- Tone: calm, authoritative, practical — like a senior career jyotishi.

Respond with valid JSON only:
{
  "careerProfile": "Paragraph: work style, lagna + 10th house, leadership/communication tied to what they do today.",
  "dashaCareer": "Current mahadasha/antardasha for career with start/end if known; themes and 3–5 actions for remainder of period.",
  "nextDashaCareer": "Next major dasha and what it emphasizes for career.",
  "careerYogas": "Named yogas from chart data and plain-language career/reputation/wealth effect.",
  "moneyAndWealth": "2nd and 11th house: earning, savings, value creation; link to current dasha.",
  "venusCareer": "Venus sign/house: alliances, income magnetism; cross-ref 2nd/10th/11th.",
  "careerTiming": "Months favorable for job switch vs salary negotiation; caution windows; relative to report date.",
  "doshaAlerts": "Mangal/other doshas if present — calm workplace framing + practical remedies only.",
  "sevenDayPlan": [
    {"day": 1, "label": "Day 1 · [weekday date]", "theme": "...", "chartReason": "one line", "action": "specific task", "directionColour": "face direction · colours", "eveningCheck": "2 min reflection question"}
  ],
  "monthByMonth": [
    {"month": "Month Year", "focus": "...", "actions": ["..."], "caution": "optional"}
  ],
  "careerPaths": [
    {"title": "Role or path", "fit": "chart + skills fit", "actionTip": "one concrete step"}
  ],
  "actionableAdvice": ["5–7 bullets for next 90 days"],
  "alignmentScore": {"score": 7, "bullets": ["strength", "gap", "one move"]}
}`;
}

function normalizeDayPlan(raw: unknown): VedicCareerDayPlan[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x, i) => {
      const o = x as Record<string, unknown>;
      return {
        day: Number(o.day ?? i + 1),
        label: String(o.label ?? `Day ${i + 1}`),
        theme: String(o.theme ?? ''),
        chartReason: String(o.chartReason ?? o.chart_reason ?? ''),
        action: String(o.action ?? ''),
        directionColour: String(o.directionColour ?? o.direction_colour ?? ''),
        eveningCheck: String(o.eveningCheck ?? o.evening_check ?? ''),
      };
    })
    .filter((d) => d.theme || d.action)
    .slice(0, 7);
}

function normalizeMonths(raw: unknown): VedicCareerMonth[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => {
      const o = x as Record<string, unknown>;
      return {
        month: String(o.month ?? ''),
        focus: String(o.focus ?? ''),
        actions: Array.isArray(o.actions) ? o.actions.map(String).filter(Boolean) : [],
        caution: o.caution ? String(o.caution) : undefined,
      };
    })
    .filter((m) => m.month || m.focus)
    .slice(0, 12);
}

function normalizePaths(raw: unknown): VedicCareerPath[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => {
      const o = x as Record<string, unknown>;
      return {
        title: String(o.title ?? ''),
        fit: String(o.fit ?? ''),
        actionTip: String(o.actionTip ?? o.action_tip ?? ''),
      };
    })
    .filter((p) => p.title)
    .slice(0, 10);
}

export function mapVedicCareerParsed(parsed: Record<string, unknown>): VedicCareerAnalysis {
  const scoreRaw = parsed.alignmentScore ?? parsed.alignment_score;
  let score = 7;
  let bullets: string[] = [];
  if (scoreRaw && typeof scoreRaw === 'object') {
    const s = scoreRaw as Record<string, unknown>;
    score = Math.min(10, Math.max(1, Number(s.score) || 7));
    bullets = Array.isArray(s.bullets) ? s.bullets.map(String).filter(Boolean) : [];
  }

  return {
    careerProfile: String(parsed.careerProfile ?? parsed.career_profile ?? '').trim() || 'Career profile from your chart.',
    dashaCareer: String(parsed.dashaCareer ?? parsed.dasha_career ?? '').trim() || 'Dasha career analysis.',
    nextDashaCareer: String(parsed.nextDashaCareer ?? parsed.next_dasha_career ?? '').trim() || 'Next dasha preview.',
    careerYogas: String(parsed.careerYogas ?? parsed.career_yogas ?? '').trim() || 'Yoga analysis for career.',
    moneyAndWealth: String(parsed.moneyAndWealth ?? parsed.money_and_wealth ?? '').trim() || 'Wealth house analysis.',
    venusCareer: String(parsed.venusCareer ?? parsed.venus_career ?? '').trim() || 'Venus and career magnetism.',
    careerTiming: String(parsed.careerTiming ?? parsed.career_timing ?? '').trim() || 'Career timing insights.',
    doshaAlerts: String(parsed.doshaAlerts ?? parsed.dosha_alerts ?? '').trim() || 'No major dosha alerts for workplace context.',
    sevenDayPlan: normalizeDayPlan(parsed.sevenDayPlan ?? parsed.seven_day_plan),
    monthByMonth: normalizeMonths(parsed.monthByMonth ?? parsed.month_by_month),
    careerPaths: normalizePaths(parsed.careerPaths ?? parsed.career_paths),
    actionableAdvice: (() => {
      const raw = parsed.actionableAdvice ?? parsed.actionable_advice;
      return Array.isArray(raw) ? raw.map(String).filter(Boolean) : [];
    })(),
    alignmentScore: { score, bullets },
  };
}

export function buildVedicCareerDeterministicFallback(): VedicCareerAnalysis {
  return mapVedicCareerParsed({
    careerProfile:
      'Your chart points to a distinctive work style. Generate again when the AI service is available for a full personalised report.',
    dashaCareer: 'Current dasha shapes career emphasis — see your Dasha tab for period details.',
    nextDashaCareer: 'The next major dasha will shift vocational themes.',
    careerYogas: 'Yoga combinations in your chart influence reputation and professional growth.',
    moneyAndWealth: 'Second and eleventh houses describe earning and gains.',
    venusCareer: 'Venus colours alliances, income style, and professional appeal.',
    careerTiming: 'Favourable windows depend on your running dasha and transits.',
    doshaAlerts: 'Workplace-relevant dosha notes appear when present in chart data.',
    sevenDayPlan: [],
    monthByMonth: [],
    careerPaths: [],
    actionableAdvice: ['Review your comprehensive Vedic report and retry this tab shortly.'],
    alignmentScore: { score: 5, bullets: ['Chart data loaded', 'Full AI narrative pending'] },
  });
}

export function parseVedicCareerResponse(raw: string | Record<string, unknown>): VedicCareerAnalysis {
  if (typeof raw === 'object' && raw !== null) {
    return mapVedicCareerParsed(raw as Record<string, unknown>);
  }
  const structured = parseStructuredJsonFromResponse(String(raw).trim());
  if (structured.ok && structured.data) {
    return mapVedicCareerParsed(structured.data);
  }
  return mapVedicCareerParsed({ careerProfile: String(raw).slice(0, 800) });
}

export function extractCareerFromCache(cached: Record<string, unknown>): VedicCareerAnalysis | null {
  const analysis = cached.careerAnalysis as VedicCareerAnalysis | undefined;
  if (!analysis?.careerProfile) return null;
  return analysis;
}

export async function readVedicCareerCache(
  userId: string,
  userProfile: VedicBirthProfile,
  options?: { allowStale?: boolean },
): Promise<VedicCareerAnalysis | null> {
  const cacheDoc = await getVedicReportDoc(['users', userId, 'mysticalProfile'], VEDIC_CAREER_CACHE_DOC_ID);
  if (!cacheDoc?.exists()) return null;
  const cached = cacheDoc.data();
  if (!cached) return null;
  if (cached.schemaVersion !== VEDIC_CAREER_REPORT_SCHEMA_VERSION) return null;
  if (!birthProfileMatches(cached, userProfile)) return null;
  const timestamp = cached.timestamp as number | undefined;
  if (!options?.allowStale && (!timestamp || Date.now() - timestamp >= VEDIC_FOCUSED_CACHE_TTL_MS)) {
    return null;
  }
  return extractCareerFromCache(cached);
}

export function extractPersistedCareerAnalysis(src: unknown): VedicCareerAnalysis | null {
  if (!src || typeof src !== 'object') return null;
  const rec = src as Record<string, unknown>;
  const direct = rec.careerAnalysis ?? rec.vedicCareerAnalysis;
  if (direct && typeof direct === 'object') {
    return extractCareerFromCache({ careerAnalysis: direct } as Record<string, unknown>);
  }
  const nested = (rec.vedic as Record<string, unknown> | undefined)?.careerAnalysis;
  if (nested && typeof nested === 'object') {
    return extractCareerFromCache({ careerAnalysis: nested } as Record<string, unknown>);
  }
  const tool = (
    (rec.toolReports as Record<string, { data?: Record<string, unknown> }> | undefined)?.vedic?.data as
      | Record<string, unknown>
      | undefined
  )?.careerAnalysis;
  if (tool && typeof tool === 'object') {
    return extractCareerFromCache({ careerAnalysis: tool } as Record<string, unknown>);
  }
  return null;
}

/** Compact block for Ask the Vedic Seer when career lens is active. */
export function formatCareerReportForSeer(report: VedicCareerAnalysis): string {
  const days = report.sevenDayPlan
    .slice(0, 3)
    .map((d) => `Day ${d.day}: ${d.theme} — ${d.action}`)
    .join('\n');
  return `## Career lens report (use as primary context for career, job, money, promotion, business questions)
Career profile: ${report.careerProfile.slice(0, 400)}
Current dasha (career): ${report.dashaCareer.slice(0, 300)}
Timing: ${report.careerTiming.slice(0, 300)}
Alignment: ${report.alignmentScore.score}/10 — ${report.alignmentScore.bullets.slice(0, 3).join('; ')}
7-day plan (sample): ${days || 'See full career report'}
Do not contradict this report; extend with chart slice for specifics.`;
}
