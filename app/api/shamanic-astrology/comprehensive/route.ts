import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { runStructuredReportAI } from '@/lib/aiStructuredOutput';
import { resolveAiReportWithFallback, mapStructuredReportRun } from '@/lib/aiFallbackRouter';
import {
  readAdminComprehensiveCache,
  writeAdminComprehensiveCache,
} from '@/lib/adminComprehensiveCache';
import type { GroqStructuredParseInput } from '@/lib/groqStructuredParse';
import { parseLlmJsonRecord } from '@/lib/aiStructuredOutputParse';
import {
  buildShamanicReportSystemPrompt,
  buildShamanicProfileContext,
} from '@/lib/shamanicSeerPrompts';
import { universalOccultService, BirthData } from '@/lib/universalOccultService';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface ShamanicComprehensiveRequest {
  userId: string;
  userProfile?: {
    birthDate?: string;
    birthTime?: string;
    birthPlace?: string;
    birthLatitude?: number;
    birthLongitude?: number;
    displayName?: string;
    fullName?: string;
  };
  chartData?: {
    planets?: any[];
    houses?: any[];
    aspects?: any[];
  };
  birthData?: {
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    latitude?: number;
    longitude?: number;
  };
}

function formatChartContext(planets: any[], houses: any[], aspects: any[]): string {
  const planetsText = (planets || [])
    .map(
      (p) =>
        `${p.name}: ${p.sign?.signName || p.sign} in House ${p.house ?? 'N/A'} at ${p.degree?.toFixed?.(1) ?? 'N/A'}°`
    )
    .join('\n');
  const housesText = (houses || [])
    .map(
      (h, idx) =>
        `House ${h.number ?? idx + 1}: ${h.sign?.signName || h.sign} cusp at ${h.degree?.toFixed?.(1) ?? 'N/A'}°`
    )
    .join('\n');
  const aspectsText = (aspects || [])
    .slice(0, 20)
    .map(
      (a) =>
        `${a.planet1 || 'Planet1'} ${a.type || 'aspect'} ${a.planet2 || 'Planet2'} (${a.orb?.toFixed?.(2) ?? 'N/A'}° orb)`
    )
    .join('\n');
  return `PLANETS:\n${planetsText || 'None'}\n\nHOUSES:\n${housesText || 'None'}\n\nASPECTS:\n${aspectsText || 'None'}`;
}

/** Get planet by name (case-insensitive). */
function getPlanet(planets: any[], name: string): any {
  const lower = name.toLowerCase();
  return planets.find((p: any) => (p.name || '').toLowerCase() === lower);
}

/** Sign to element mapping (Fire, Earth, Air, Water). */
const SIGN_ELEMENT: Record<string, string> = {
  Aries: 'Fire',
  Taurus: 'Earth',
  Gemini: 'Air',
  Cancer: 'Water',
  Leo: 'Fire',
  Virgo: 'Earth',
  Libra: 'Air',
  Scorpio: 'Water',
  Sagittarius: 'Fire',
  Capricorn: 'Earth',
  Aquarius: 'Air',
  Pisces: 'Water',
};

/** Compute Venus phase: Morning Star | Evening Star | Underworld; optional retrograde. */
function computeVenusPhase(planets: any[]): { phase: string; retrograde: boolean } {
  const sun = getPlanet(planets, 'Sun');
  const venus = getPlanet(planets, 'Venus');
  if (!sun || !venus) return { phase: 'Unknown', retrograde: false };
  const sunLon = typeof sun.longitude === 'number' ? sun.longitude : 0;
  const venusLon = typeof venus.longitude === 'number' ? venus.longitude : 0;
  let delta = venusLon - sunLon;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  const elongation = Math.abs(delta);
  const retrograde = venus.speed < 0 || venus.isRetrograde === true;
  if (elongation < 10) return { phase: 'Underworld', retrograde };
  if (delta > 0) return { phase: 'Evening Star', retrograde };
  return { phase: 'Morning Star', retrograde };
}

/** Compute age from birthDate (YYYY-MM-DD). */
function computeAge(birthDate: string | undefined): number | null {
  if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return null;
  const [y, m, d] = birthDate.split('-').map(Number);
  const today = new Date();
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age--;
  return age >= 0 ? age : null;
}

/** Map age to Saturn phase label. */
function getSaturnPhaseLabel(age: number | null): string {
  if (age == null) return 'Unknown';
  if (age < 27) return 'pre-return';
  if (age <= 30) return 'return';
  if (age < 56) return 'post-return';
  if (age <= 60) return 'second-return';
  return 'post-second-return';
}

function normalizeSignToElementKey(sign: string): string {
  if (!sign) return '';
  const s = sign.trim();
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/** Elemental counts from planet signs (exclude angles; include main planets + nodes). */
function computeElementalBalance(planets: any[]): { fire: number; earth: number; air: number; water: number; dominant: string; deficient: string } {
  const counts = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const skipNames = ['Ascendant', 'MC', 'Descendant', 'IC'];
  for (const p of planets || []) {
    const name = (p.name || '').toString();
    if (skipNames.some((s) => name.toLowerCase().includes(s.toLowerCase()))) continue;
    const signRaw = (p.sign?.signName || p.sign || '').toString().trim();
    const signKey = normalizeSignToElementKey(signRaw);
    const el = SIGN_ELEMENT[signKey];
    if (el && counts.hasOwnProperty(el)) (counts as any)[el]++;
  }
  const entries = Object.entries(counts) as [string, number][];
  const max = Math.max(...entries.map(([, v]) => v));
  const min = Math.min(...entries.map(([, v]) => v));
  const dominant = max > 0 ? (entries.find(([, v]) => v === max)?.[0] || 'Unknown') : 'Unknown';
  const deficient = min < max ? (entries.find(([, v]) => v === min)?.[0] || 'Unknown') : 'Unknown';
  return {
    fire: counts.Fire,
    earth: counts.Earth,
    air: counts.Air,
    water: counts.Water,
    dominant,
    deficient,
  };
}

/** One-line nodal summary from planets. */
function getNodalSummary(planets: any[]): string {
  const nn = getPlanet(planets, 'North Node') || getPlanet(planets, 'Northnode') || getPlanet(planets, 'North Node');
  const sn = getPlanet(planets, 'South Node') || getPlanet(planets, 'Southnode') || getPlanet(planets, 'South Node');
  const nnSign = nn ? (nn.sign?.signName || nn.sign || '') : '';
  const snSign = sn ? (sn.sign?.signName || sn.sign || '') : '';
  const nnHouse = nn?.house ?? '';
  if (nnSign || snSign) return `North Node ${nnSign} (House ${nnHouse}); South Node ${snSign}.`;
  return 'Nodal positions in chart.';
}

/** Build precomputed block for the prompt. */
function buildPrecomputedBlock(
  planets: any[],
  birthDate: string | undefined,
  userProfile: ShamanicComprehensiveRequest['userProfile']
): string {
  const venus = computeVenusPhase(planets);
  const age = computeAge(birthDate || userProfile?.birthDate);
  const saturnPhase = getSaturnPhaseLabel(age);
  const elements = computeElementalBalance(planets);
  const nodal = getNodalSummary(planets);
  const lines: string[] = [
    `Venus phase: ${venus.phase}${venus.retrograde ? ' (retrograde)' : ''}.`,
    `Age: ${age != null ? age : 'Unknown'}. Saturn phase: ${saturnPhase}.`,
    `Elements: Fire ${elements.fire}, Earth ${elements.earth}, Air ${elements.air}, Water ${elements.water}. Dominant: ${elements.dominant}. Deficient or under-emphasized: ${elements.deficient}. Consider Ether (Spirit) as fifth dimension where relevant.`,
    `Nodes: ${nodal}`,
  ];
  return lines.join('\n');
}

function parseShamanicResponse(response: GroqStructuredParseInput): Record<string, unknown> {
  const parsed = parseLlmJsonRecord(response);
  if (!parsed) throw new Error('Shamanic report JSON parse failed');
  return parsed;
}

function str(val: unknown): string {
  return typeof val === 'string' ? val : '';
}

function normalizeAnalysis(parsed: Record<string, unknown>): Record<string, unknown> {
  return {
    orientation: str(parsed.orientation),
    sacred_birth_signature: str(parsed.sacred_birth_signature),
    life_purpose_axis: str(parsed.life_purpose_axis),
    elemental_medicine: str(parsed.elemental_medicine),
    initiatory_cycles: str(parsed.initiatory_cycles),
    relationship_sacred_mirror: str(parsed.relationship_sacred_mirror),
    power_shadow: str(parsed.power_shadow),
    current_cycle_snapshot: str(parsed.current_cycle_snapshot),
    integration_ceremony: str(parsed.integration_ceremony),
    executive_summary: str(parsed.executive_summary),
    life_cycle_phase: str(parsed.life_cycle_phase),
    archetypal_theme: str(parsed.archetypal_theme),
    shadow_pattern: str(parsed.shadow_pattern),
    power_dynamic: str(parsed.power_dynamic),
    spiritual_threshold: str(parsed.spiritual_threshold),
    integration_path: str(parsed.integration_path),
  };
}

function buildShamanicDeterministic(planets: any[]): Record<string, unknown> {
  const sunPlanet = getPlanet(planets, 'Sun');
  const moonPlanet = getPlanet(planets, 'Moon');
  const sunSign = sunPlanet?.sign?.signName || sunPlanet?.sign || 'Unknown';
  const moonSign = moonPlanet?.sign?.signName || moonPlanet?.sign || 'Unknown';
  const venus = computeVenusPhase(planets);
  return normalizeAnalysis({
    orientation:
      'Shamanic Astrology emphasizes life purpose and sacred timing through initiatory cycles, not personality labels or prediction.',
    sacred_birth_signature: `Sun ${sunSign}, Moon ${moonSign}—interpret through mythic and soul lens.`,
    life_purpose_axis: 'North and South Node indicate soul lineage and evolutionary direction; see chart for details.',
    elemental_medicine: 'Balance of Fire, Earth, Air, Water shapes inner medicine and spiritual style.',
    initiatory_cycles: `Venus phase: ${venus.phase}. Saturn and nodal phases indicate current life initiation.`,
    relationship_sacred_mirror: '7th house and Venus/Mars reflect sacred mirror and polarity lessons.',
    power_shadow: 'Pluto and 8th/12th house themes point to power retrieval and transformation.',
    current_cycle_snapshot: '',
    integration_ceremony: 'Reflection, nature alignment, journaling, and embodiment support integration.',
    executive_summary: 'Soul-aligned growth; chart supports deeper initiatory theme.',
    life_cycle_phase: `Initiatory phase (Sun ${sunSign}, Moon ${moonSign})—archetypal mapping`,
    archetypal_theme: 'Soul-aligned growth; full chart supports deeper theme.',
    shadow_pattern: 'Integration of visibility and authority.',
    power_dynamic: 'Oscillation between doubt and claiming; chart refines this.',
    spiritual_threshold: 'Stepping into responsibility and service.',
    integration_path: 'Owning your path without domination.',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: ShamanicComprehensiveRequest = await request.json();
    const { userId, userProfile, chartData: bodyChartData, birthData: bodyBirthData } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
    }

    const freshCached = await readAdminComprehensiveCache(userId, 'shamanicAstrologyReports', 'comprehensive', {
      extract: (d) => (d.comprehensiveAnalysis as Record<string, unknown>) ?? null,
    });
    if (freshCached) {
      return NextResponse.json({
        success: true,
        data: { comprehensiveAnalysis: freshCached, timestamp: Date.now() },
      });
    }

    let planets: any[] = [];
    let houses: any[] = [];
    let aspects: any[] = [];

    if (bodyChartData?.planets?.length) {
      planets = bodyChartData.planets;
      houses = bodyChartData.houses || [];
      aspects = bodyChartData.aspects || [];
    } else {
      const birthData: BirthData | null = bodyBirthData
        ? {
            birthDate: bodyBirthData.birthDate,
            birthTime: bodyBirthData.birthTime || '12:00:00',
            birthPlace: bodyBirthData.birthPlace,
            latitude: bodyBirthData.latitude ?? 0,
            longitude: bodyBirthData.longitude ?? 0,
          }
        : userProfile?.birthDate && userProfile?.birthPlace
          ? {
              birthDate: userProfile.birthDate,
              birthTime: userProfile.birthTime || '12:00:00',
              birthPlace: userProfile.birthPlace,
              latitude: userProfile.birthLatitude ?? 0,
              longitude: userProfile.birthLongitude ?? 0,
            }
          : null;

      if (!birthData) {
        return NextResponse.json(
          { success: false, error: 'Missing chartData or birthData/userProfile with birth date and place' },
          { status: 400 }
        );
      }

      const westernRes = await universalOccultService.calculateWesternChart(birthData, {
        houseSystem: 'placidus',
        includeAspects: true,
      });
      const data = westernRes?.data ?? westernRes;
      planets = data?.planets ?? [];
      houses = data?.houses ?? [];
      aspects = data?.aspects ?? [];
    }

    if (!planets.length) {
      return NextResponse.json(
        { success: false, error: 'No planetary chart data available' },
        { status: 400 }
      );
    }

    const chartContext = formatChartContext(planets, houses, aspects);
    const profileContext = buildShamanicProfileContext(userProfile ?? null);
    const birthDate = userProfile?.birthDate || bodyBirthData?.birthDate;
    const precomputed = buildPrecomputedBlock(planets, birthDate, userProfile);
    const systemPrompt = buildShamanicReportSystemPrompt(chartContext, profileContext, precomputed);

    const resolved = await resolveAiReportWithFallback({
      label: 'shamanic-comprehensive',
      userId,
      tryLlm: async () => {
        const aiRun = await runStructuredReportAI({
          label: 'shamanic-comprehensive',
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert in Shamanic Astrology. Respond only with a single valid JSON object, no other text.',
            },
            { role: 'user', content: systemPrompt },
          ],
          temperature: 0.6,
          maxTokens: 4000,
          maxAttempts: 3,
        });
        return mapStructuredReportRun(aiRun, normalizeAnalysis);
      },
      readFirestoreCache: () =>
        readAdminComprehensiveCache(userId, 'shamanicAstrologyReports', 'comprehensive', {
          allowStale: true,
          extract: (d) => (d.comprehensiveAnalysis as Record<string, unknown>) ?? null,
        }),
      buildDeterministic: () => buildShamanicDeterministic(planets),
    });

    const comprehensiveAnalysis = resolved.data;

    if (resolved.degraded && resolved.source !== 'llm') {
      return NextResponse.json({
        success: true,
        data: {
          comprehensiveAnalysis,
          timestamp: Date.now(),
          parsingFailed: resolved.parsingFailed ?? true,
          fallbackSource: resolved.source,
          error:
            resolved.source === 'firestore_cache'
              ? 'Using last saved report; AI narrative refresh failed'
              : 'Failed to parse AI response, using chart-based fallback',
        },
      });
    }

    await writeAdminComprehensiveCache(userId, 'shamanicAstrologyReports', 'comprehensive', {
      comprehensiveAnalysis,
    });

    return NextResponse.json({
      success: true,
      data: {
        comprehensiveAnalysis,
        timestamp: Date.now(),
      },
    });
  } catch (err) {
    devLog.error('Shamanic comprehensive API error:', err, 'route');
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed to generate shamanic report' },
      { status: 500 }
    );
  }
}
