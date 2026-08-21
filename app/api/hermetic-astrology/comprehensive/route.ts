import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { runStructuredReportAI } from '@/lib/aiStructuredOutput';
import { resolveAiReportWithFallback, mapStructuredReportRun } from '@/lib/aiFallbackRouter';
import {
  readAdminComprehensiveCache,
  writeAdminComprehensiveCache,
} from '@/lib/adminComprehensiveCache';
import { buildHermeticReportSystemPrompt } from '@/lib/hermeticSeerPrompts';
import { universalOccultService, BirthData } from '@/lib/universalOccultService';
import { GROQ_DEFAULT_TEXT_MODEL } from '@/lib/groqModels';
import {
  determineSect,
  calculateLotOfFortune,
  calculateLotOfSpirit,
  getChartRuler,
} from '@/lib/hermeticChartCalculator';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface HermeticComprehensiveRequest {
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

function normalizePlanetaryDynamics(obj: unknown): Record<string, string> {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') out[k] = v;
  }
  return out;
}

function normalizeLifeArenas(obj: unknown): Record<string, string> {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') out[k] = v;
  }
  return out;
}

function normalizeAnalysis(parsed: Record<string, unknown>): Record<string, unknown> {
  return {
    sect_summary: typeof parsed.sect_summary === 'string' ? parsed.sect_summary : '',
    lot_of_fortune_summary: typeof parsed.lot_of_fortune_summary === 'string' ? parsed.lot_of_fortune_summary : '',
    lot_of_spirit_summary: typeof parsed.lot_of_spirit_summary === 'string' ? parsed.lot_of_spirit_summary : '',
    helmsman_summary: typeof parsed.helmsman_summary === 'string' ? parsed.helmsman_summary : '',
    life_arenas: normalizeLifeArenas(parsed.life_arenas),
    predominator_note: typeof parsed.predominator_note === 'string' ? parsed.predominator_note : '',
    dominant_element: typeof parsed.dominant_element === 'string' ? parsed.dominant_element : 'Unknown',
    elemental_imbalance: typeof parsed.elemental_imbalance === 'string' ? parsed.elemental_imbalance : '',
    polarity_balance: typeof parsed.polarity_balance === 'string' ? parsed.polarity_balance : '',
    archetypal_theme: typeof parsed.archetypal_theme === 'string' ? parsed.archetypal_theme : '',
    planetary_dynamics: normalizePlanetaryDynamics(parsed.planetary_dynamics),
    alchemical_lesson: typeof parsed.alchemical_lesson === 'string' ? parsed.alchemical_lesson : '',
    integration_guidance: typeof parsed.integration_guidance === 'string' ? parsed.integration_guidance : '',
  };
}

function buildHermeticDeterministic(planets: any[]): Record<string, unknown> {
  const sunP = planets.find((p: any) => (p.name || '').toLowerCase() === 'sun');
  const sunSign = sunP?.sign?.signName || sunP?.sign || 'Unknown';
  return {
    sect_summary: '',
    lot_of_fortune_summary: '',
    lot_of_spirit_summary: '',
    helmsman_summary: '',
    life_arenas: {},
    predominator_note: '',
    dominant_element: 'Unknown',
    elemental_imbalance: 'Chart data incomplete—generalized interpretation.',
    polarity_balance: 'Balance active and receptive forces.',
    archetypal_theme: `Inner alignment and refinement (Sun in ${sunSign})`,
    planetary_dynamics: {},
    alchemical_lesson: 'Cultivate awareness of elemental and polar dynamics.',
    integration_guidance: 'Seek balance between force and receptivity.',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: HermeticComprehensiveRequest = await request.json();
    const { userId, userProfile, chartData: bodyChartData, birthData: bodyBirthData } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
    }

    const freshCached = await readAdminComprehensiveCache(userId, 'hermeticAstrologyReports', 'comprehensive', {
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

    const sunPlanet = planets.find((p: any) => (p.name || '').toLowerCase() === 'sun');
    const moonPlanet = planets.find((p: any) => (p.name || '').toLowerCase() === 'moon');
    const ascendantHouse = houses.find((h: any) => h.number === 1) || houses[0];
    const sunLongitude = typeof sunPlanet?.longitude === 'number' ? sunPlanet.longitude : 0;
    const moonLongitude = typeof moonPlanet?.longitude === 'number' ? moonPlanet.longitude : 0;
    const ascendantLongitude =
      typeof ascendantHouse?.longitude === 'number'
        ? ascendantHouse.longitude
        : typeof ascendantHouse?.cusp === 'number'
          ? ascendantHouse.cusp
          : 0;

    let hermeticContext = '';
    if (sunPlanet && moonPlanet && ascendantHouse) {
      const sect = determineSect(sunLongitude, ascendantLongitude);
      const lotFortune = calculateLotOfFortune(sunLongitude, moonLongitude, ascendantLongitude, sect.type === 'day');
      const lotSpirit = calculateLotOfSpirit(sunLongitude, moonLongitude, ascendantLongitude, sect.type === 'day');
      const ascendantSign =
        typeof ascendantHouse?.sign === 'string'
          ? ascendantHouse.sign
          : (ascendantHouse?.sign as any)?.signName ?? '';
      const chartRuler = getChartRuler(ascendantSign || sunPlanet?.sign || 'Unknown');

      const house1 = houses.find((h: any) => h.number === 1);
      const house5 = houses.find((h: any) => h.number === 5);
      const house10 = houses.find((h: any) => h.number === 10);
      const house11 = houses.find((h: any) => h.number === 11);

      hermeticContext = [
        `SECT (Your Team): ${sect.type.toUpperCase()} Chart. Sect Leader: ${sect.sectLeader}. Benefic: ${sect.benefic}. Malefic: ${sect.malefic}.`,
        `LOT OF FORTUNE (Your Body & Fate): ${lotFortune.sign} at ${lotFortune.degree.toFixed(1)}°, House ${lotFortune.house}.`,
        `LOT OF SPIRIT (Your Will & Career): ${lotSpirit.sign} at ${lotSpirit.degree.toFixed(1)}°, House ${lotSpirit.house}.`,
        `CHART RULER (The Helmsman): ${chartRuler} (rules Ascendant ${ascendantSign || '—'}).`,
        house1 ? `House 1 (Self/Health): ${house1.sign?.signName || house1.sign} cusp.` : '',
        house5 ? `House 5 (Good Fortune): ${house5.sign?.signName || house5.sign} cusp.` : '',
        house10 ? `House 10 (Action/Reputation): ${house10.sign?.signName || house10.sign} cusp.` : '',
        house11 ? `House 11 (Good Spirit): ${house11.sign?.signName || house11.sign} cusp.` : '',
      ]
        .filter(Boolean)
        .join('\n');
    }

    const chartContext = formatChartContext(planets, houses, aspects);
    const userName = userProfile?.fullName?.trim() || userProfile?.displayName?.trim() || undefined;
    const systemPrompt = buildHermeticReportSystemPrompt({
      chartContext,
      hermeticContext: hermeticContext || undefined,
      userName,
    });

    const resolved = await resolveAiReportWithFallback({
      label: 'hermetic-comprehensive',
      userId,
      tryLlm: async () => {
        const aiRun = await runStructuredReportAI({
          label: 'hermetic-comprehensive',
          model: GROQ_DEFAULT_TEXT_MODEL,
          messages: [
            {
              role: 'system',
              content:
                'You are an expert in Hermetic Astrology. Respond only with a single valid JSON object, no other text.',
            },
            { role: 'user', content: systemPrompt },
          ],
          temperature: 0.6,
          maxTokens: 2400,
          maxAttempts: 3,
        });
        return mapStructuredReportRun(aiRun, normalizeAnalysis);
      },
      readFirestoreCache: () =>
        readAdminComprehensiveCache(userId, 'hermeticAstrologyReports', 'comprehensive', {
          allowStale: true,
          extract: (d) => (d.comprehensiveAnalysis as Record<string, unknown>) ?? null,
        }),
      buildDeterministic: () => buildHermeticDeterministic(planets),
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

    await writeAdminComprehensiveCache(userId, 'hermeticAstrologyReports', 'comprehensive', {
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
    devLog.error('Hermetic comprehensive API error:', err, 'route');
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed to generate Hermetic report' },
      { status: 500 }
    );
  }
}
