import { parseStructuredJsonFromResponse } from '@/lib/aiStructuredOutputParse';
import type { ChartDataInput } from '@/lib/vedic/vedicChartContext';
import { formatChartContextBlock } from '@/lib/vedic/vedicChartContext';
import {
  birthProfileMatches,
  getVedicReportDoc,
  VEDIC_FOCUSED_CACHE_TTL_MS,
  type VedicBirthProfile,
} from '@/lib/vedic/vedicReportFirestore';

export const VEDIC_RELATIONSHIP_REPORT_SCHEMA_VERSION = '1.0';
export const VEDIC_RELATIONSHIP_CACHE_DOC_ID = 'comprehensiveVedicRelationships';

export interface VedicRelationshipMonth {
  month: string;
  focus: string;
  actions: string[];
  caution?: string;
}

export interface VedicRelationshipAnalysis {
  relationshipProfile: string;
  d9Navamsa: string;
  dashaRelationships: string;
  venusAndMoon: string;
  partnershipPatterns: string;
  relationshipTiming: string;
  connectionCompatibility: string;
  thirtyDayThemes: string[];
  monthByMonth: VedicRelationshipMonth[];
  partnershipAdvice: string[];
  remediesForConnection: string;
}

export type PartnerContext = {
  name?: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  birthPlace?: string;
  relationshipType?: string;
};

export function buildVedicRelationshipPrompt(
  chart: ChartDataInput,
  userProfile?: VedicBirthProfile,
  partner?: PartnerContext | null,
): string {
  const today = new Date();
  const name = userProfile?.fullName || userProfile?.displayName || 'the user';

  let partnerBlock = '';
  if (partner?.name && partner?.dateOfBirth) {
    partnerBlock = `PARTNER (for connection/compatibility narrative — synastry-style, traditional 7th house + Venus/Jupiter themes; do not claim medical/legal certainty):
- Name: ${partner.name}
- Birth: ${partner.dateOfBirth}${partner.timeOfBirth ? ` ${partner.timeOfBirth}` : ''}${partner.birthPlace ? `, ${partner.birthPlace}` : ''}
- Relationship type: ${partner.relationshipType || 'unspecified'}
If partner data is incomplete, focus on user's 7th house/D9 and general partnership timing.`;
  } else {
    partnerBlock =
      'PARTNER: Not provided. Focus on native chart (7th house, Venus, Moon, D9) for connection style and timing. Suggest using Compatibility tab to compare a specific person later.';
  }

  const chartBlock = formatChartContextBlock(chart, partnerBlock);

  return `You are an expert Vedic (Jyotish) astrologer writing a **Love & relationships** report only. Use 7th house (partnership), 5th (romance), Venus, Moon, Jupiter (marriage karaka), D9 Navamsa. Dasha is primary timing. Supportive tone; no predicting death, betrayal certainty, or medical outcomes.

Today: ${today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

Client: ${name}
${chartBlock}

RULES:
- Reference THIS chart only; plain language, not jargon dumps.
- connectionCompatibility: if partner given, describe dynamic themes (not "will definitely marry").
- monthByMonth: next 12 months from current month.
- thirtyDayThemes: 4–6 themes for the next 30 days (not necessarily daily tasks).
- remediesForConnection: astrological upayas only (mantra, charity, Venus/Moon-friendly practices).

JSON only:
{
  "relationshipProfile": "Paragraph: how chart reads for connection, 7th house, lagna lord in relationships.",
  "d9Navamsa": "D9 / Navamsa themes for inner partnership capacity and marriage potential (traditional framing).",
  "dashaRelationships": "Current dasha/antardasha for love/partnership with period themes.",
  "venusAndMoon": "Venus and Moon: emotional needs, attraction style, what you seek in connection.",
  "partnershipPatterns": "Repeating patterns (attachment, timing, blocks) from chart — constructive framing.",
  "relationshipTiming": "Favorable/challenging windows for dating, commitment, clarity talks — months/phases.",
  "connectionCompatibility": "Compatibility narrative (general or with named partner if provided).",
  "thirtyDayThemes": ["theme 1", "theme 2"],
  "monthByMonth": [{"month": "Month Year", "focus": "...", "actions": ["..."], "caution": "optional"}],
  "partnershipAdvice": ["5–7 practical bullets"],
  "remediesForConnection": "Short paragraph on remedies suited to chart"
}`;
}

function normalizeRelMonths(raw: unknown): VedicRelationshipMonth[] {
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

export function mapVedicRelationshipParsed(parsed: Record<string, unknown>): VedicRelationshipAnalysis {
  return {
    relationshipProfile: String(parsed.relationshipProfile ?? parsed.relationship_profile ?? '').trim() || 'Relationship profile from your chart.',
    d9Navamsa: String(parsed.d9Navamsa ?? parsed.d9_navamsa ?? '').trim() || 'Navamsa (D9) insights.',
    dashaRelationships: String(parsed.dashaRelationships ?? parsed.dasha_relationships ?? '').trim() || 'Dasha and relationships.',
    venusAndMoon: String(parsed.venusAndMoon ?? parsed.venus_and_moon ?? '').trim() || 'Venus and Moon analysis.',
    partnershipPatterns: String(parsed.partnershipPatterns ?? parsed.partnership_patterns ?? '').trim() || 'Partnership patterns.',
    relationshipTiming: String(parsed.relationshipTiming ?? parsed.relationship_timing ?? '').trim() || 'Relationship timing.',
    connectionCompatibility: String(parsed.connectionCompatibility ?? parsed.connection_compatibility ?? '').trim() || 'Connection and compatibility themes.',
    thirtyDayThemes: (() => {
      const raw = parsed.thirtyDayThemes ?? parsed.thirty_day_themes;
      return Array.isArray(raw) ? raw.map(String).filter(Boolean).slice(0, 8) : [];
    })(),
    monthByMonth: normalizeRelMonths(parsed.monthByMonth ?? parsed.month_by_month),
    partnershipAdvice: (() => {
      const raw = parsed.partnershipAdvice ?? parsed.partnership_advice;
      return Array.isArray(raw) ? raw.map(String).filter(Boolean) : [];
    })(),
    remediesForConnection: String(parsed.remediesForConnection ?? parsed.remedies_for_connection ?? '').trim() || 'Connection remedies from chart.',
  };
}

export function buildVedicRelationshipDeterministicFallback(): VedicRelationshipAnalysis {
  return mapVedicRelationshipParsed({
    relationshipProfile:
      'Your chart describes how you connect and what you seek in partnership. Retry for a full AI narrative when the service is available.',
    d9Navamsa: 'Navamsa (D9) refines marriage and inner partnership capacity.',
    dashaRelationships: 'Current dasha colours relationship timing and themes.',
    venusAndMoon: 'Venus and Moon describe attraction and emotional needs.',
    partnershipPatterns: 'Repeating patterns can be read from the seventh house and its lord.',
    relationshipTiming: 'Supportive windows follow dasha and transit emphasis.',
    connectionCompatibility: 'Add a partner profile or use the Compatibility tab to compare two charts.',
    thirtyDayThemes: ['Clarity in communication', 'Patience with timing'],
    monthByMonth: [],
    partnershipAdvice: ['Use the Compatibility tab for a two-chart comparison.'],
    remediesForConnection: 'Chart-aligned mantras and Venus-friendly practices may be suggested after full generation.',
  });
}

export function parseVedicRelationshipResponse(
  raw: string | Record<string, unknown>,
): VedicRelationshipAnalysis {
  if (typeof raw === 'object' && raw !== null) {
    return mapVedicRelationshipParsed(raw as Record<string, unknown>);
  }
  const structured = parseStructuredJsonFromResponse(String(raw).trim());
  if (structured.ok && structured.data) {
    return mapVedicRelationshipParsed(structured.data);
  }
  return mapVedicRelationshipParsed({ relationshipProfile: String(raw).slice(0, 800) });
}

export function extractRelationshipFromCache(
  cached: Record<string, unknown>,
): VedicRelationshipAnalysis | null {
  const analysis = cached.relationshipAnalysis as VedicRelationshipAnalysis | undefined;
  if (!analysis?.relationshipProfile) return null;
  return analysis;
}

export async function readVedicRelationshipCache(
  userId: string,
  userProfile: VedicBirthProfile,
  options?: { allowStale?: boolean },
): Promise<VedicRelationshipAnalysis | null> {
  const cacheDoc = await getVedicReportDoc(
    ['users', userId, 'mysticalProfile'],
    VEDIC_RELATIONSHIP_CACHE_DOC_ID,
  );
  if (!cacheDoc?.exists()) return null;
  const cached = cacheDoc.data();
  if (!cached) return null;
  if (cached.schemaVersion !== VEDIC_RELATIONSHIP_REPORT_SCHEMA_VERSION) return null;
  if (!birthProfileMatches(cached, userProfile)) return null;
  const timestamp = cached.timestamp as number | undefined;
  if (!options?.allowStale && (!timestamp || Date.now() - timestamp >= VEDIC_FOCUSED_CACHE_TTL_MS)) {
    return null;
  }
  return extractRelationshipFromCache(cached);
}

export function extractPersistedRelationshipAnalysis(src: unknown): VedicRelationshipAnalysis | null {
  if (!src || typeof src !== 'object') return null;
  const rec = src as Record<string, unknown>;
  const direct = rec.relationshipAnalysis ?? rec.vedicRelationshipAnalysis;
  if (direct && typeof direct === 'object') {
    return extractRelationshipFromCache({ relationshipAnalysis: direct } as Record<string, unknown>);
  }
  const nested = (rec.vedic as Record<string, unknown> | undefined)?.relationshipAnalysis;
  if (nested && typeof nested === 'object') {
    return extractRelationshipFromCache({ relationshipAnalysis: nested } as Record<string, unknown>);
  }
  const tool = (
    (rec.toolReports as Record<string, { data?: Record<string, unknown> }> | undefined)?.vedic?.data as
      | Record<string, unknown>
      | undefined
  )?.relationshipAnalysis;
  if (tool && typeof tool === 'object') {
    return extractRelationshipFromCache({ relationshipAnalysis: tool } as Record<string, unknown>);
  }
  return null;
}

export function formatRelationshipReportForSeer(report: VedicRelationshipAnalysis): string {
  return `## Love & relationships lens report (primary for marriage, partner, compatibility, timing questions)
Profile: ${report.relationshipProfile.slice(0, 400)}
D9: ${report.d9Navamsa.slice(0, 250)}
Dasha: ${report.dashaRelationships.slice(0, 250)}
Timing: ${report.relationshipTiming.slice(0, 300)}
Compatibility: ${report.connectionCompatibility.slice(0, 300)}
Do not contradict this report; use chart slice for detail.`;
}
