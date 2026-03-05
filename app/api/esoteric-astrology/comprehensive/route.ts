import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { createAICompletion } from '@/lib/aiGateway';
import { buildEsotericReportSystemPrompt, type EsotericPrecomputedContext } from '@/lib/esotericSeerPrompts';
import {
  getEsotericRuler,
  getExotericRuler,
  getSoulKeynote,
  getModality,
  getLifeDirection,
} from '@/lib/esotericAstrologyData';
import {
  computeSoulRay,
  computePersonalityRay,
  computeRayWeights,
} from '@/lib/esotericRays';
import {
  computeCrossDominant,
  computeVeiledPlanets,
  addVulcanToPlanets,
  computeTriangleEmphasis,
  type PlanetPosition,
} from '@/lib/esotericEngines';
import { universalOccultService, BirthData } from '@/lib/universalOccultService';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface EsotericComprehensiveRequest {
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

const SIGN_TO_LONGITUDE: Record<string, number> = {
  Aries: 0, Taurus: 30, Gemini: 60, Cancer: 90, Leo: 120, Virgo: 150,
  Libra: 180, Scorpio: 210, Sagittarius: 240, Capricorn: 270, Aquarius: 300, Pisces: 330,
};

function getSign(obj: { sign?: { signName?: string } | string }): string {
  const s = obj?.sign;
  return (s && (typeof s === 'string' ? s : (s as { signName?: string }).signName)) || '';
}

function toPlanetPosition(p: any): PlanetPosition {
  const signName = getSign(p);
  const lon = typeof p.longitude === 'number' ? p.longitude : (SIGN_TO_LONGITUDE[signName] ?? 0) + (Number(p.degree) || 0);
  return {
    name: p.name,
    longitude: lon,
    sign: p.sign,
  };
}

function buildPrecomputedContext(planets: any[], houses: any[]): EsotericPrecomputedContext {
  let planetList = (planets || []).map(toPlanetPosition);
  planetList = addVulcanToPlanets(planetList);

  const ascPlanet = planets.find((p: any) => p.name === 'Ascendant');
  const house1 = houses?.[0];
  const ascendantSign = getSign(ascPlanet || {}) || getSign(house1 || {});

  const sunPlanet = planets.find((p: any) => p.name === 'Sun');
  const moonPlanet = planets.find((p: any) => p.name === 'Moon');
  const northNode = planets.find(
    (p: any) =>
      p.name === 'North Node' || p.name === 'NorthNode' || p.name === 'True North Node'
  );
  const southNode = planets.find(
    (p: any) =>
      p.name === 'South Node' || p.name === 'SouthNode' || p.name === 'True South Node'
  );

  const sunSign = getSign(sunPlanet || {});
  const moonSign = getSign(moonPlanet || {});
  const northNodeSign = getSign(northNode || {});
  const southNodeSign = getSign(southNode || {});

  const modality = getModality(ascendantSign);
  const crossLabel = modality || getModality(sunSign);
  const lifeDir = crossLabel ? getLifeDirection(crossLabel) : null;

  const ascendantOrthodox = getExotericRuler(ascendantSign);
  const sunOrthodox = getExotericRuler(sunSign);
  const sunEsoteric = getEsotericRuler(sunSign);
  const esotericRulerName = getEsotericRuler(ascendantSign);
  const esotericRulerPlanet = planets.find(
    (p: any) => p.name === esotericRulerName || (p.name && p.name.toLowerCase() === esotericRulerName?.toLowerCase())
  );
  const esotericRulerSign = esotericRulerPlanet ? getSign(esotericRulerPlanet) : undefined;
  const esotericRulerHouse = esotericRulerPlanet?.house != null ? Number(esotericRulerPlanet.house) : undefined;

  const soulRay = computeSoulRay(sunSign);
  const personalityRay = computePersonalityRay(ascendantSign);
  const rayWeights = computeRayWeights({ sunSign, ascendantSign, moonSign });

  const cross = computeCrossDominant(planetList);
  const veiled = computeVeiledPlanets(planetList);
  const triangles = computeTriangleEmphasis(planetList);
  const triangleEmphasis = triangles
    .filter((t) => t.count > 0)
    .map((t) => `${t.name}: ${t.count} planet(s)`);

  return {
    ascendant_sign: ascendantSign || undefined,
    esoteric_ruler: getEsotericRuler(ascendantSign),
    key_mantra: getSoulKeynote(ascendantSign),
    life_direction_cross: crossLabel || undefined,
    life_direction_focus: lifeDir?.focus,
    life_direction_tests: lifeDir?.tests,
    sun_sign: sunSign || undefined,
    sun_house: sunPlanet?.house != null ? Number(sunPlanet.house) : undefined,
    moon_sign: moonSign || undefined,
    moon_house: moonPlanet?.house != null ? Number(moonPlanet.house) : undefined,
    north_node_sign: northNodeSign || undefined,
    south_node_sign: southNodeSign || undefined,
    ascendant_orthodox_ruler: ascendantOrthodox !== 'Unknown' ? ascendantOrthodox : undefined,
    sun_esoteric_ruler: sunEsoteric !== 'Unknown' ? sunEsoteric : undefined,
    sun_orthodox_ruler: sunOrthodox !== 'Unknown' ? sunOrthodox : undefined,
    esoteric_ruler_sign: esotericRulerSign || undefined,
    esoteric_ruler_house: esotericRulerHouse,
    ray_soul: soulRay.label,
    ray_personality: personalityRay.label,
    ray_dominant: rayWeights.label,
    cross_dominant: cross.dominant,
    cross_planet_counts: cross.counts,
    evolutionary_stage: cross.evolutionaryStage,
    veiled_by_sun: veiled.veiledBySun.length ? veiled.veiledBySun : undefined,
    veiled_by_moon: veiled.veiledByMoon.length ? veiled.veiledByMoon : undefined,
    triangle_emphasis: triangleEmphasis.length ? triangleEmphasis : undefined,
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

function parseEsotericResponse(response: string): Record<string, unknown> {
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

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function strList(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

function normalizeAnalysis(
  parsed: Record<string, unknown>,
  precomputed?: EsotericPrecomputedContext
): Record<string, unknown> {
  const lifeDir = precomputed?.life_direction_cross
    ? getLifeDirection(precomputed.life_direction_cross as 'Cardinal' | 'Fixed' | 'Mutable')
    : null;
  const lifeDirectionSentence =
    str(parsed.life_direction_sentence) ||
    (lifeDir
      ? `Your life is currently focused on ${lifeDir.focus}, meaning your challenges will primarily test your ${lifeDir.tests}.`
      : '');

  return {
    soul_ruler: typeof parsed.soul_ruler === 'string' ? parsed.soul_ruler : (precomputed?.esoteric_ruler ?? 'Unknown'),
    personality_ruler: typeof parsed.personality_ruler === 'string' ? parsed.personality_ruler : 'Unknown',
    dominant_ray: typeof parsed.dominant_ray === 'string' ? parsed.dominant_ray : (precomputed?.ray_dominant ?? 'Unknown'),
    evolutionary_theme: str(parsed.evolutionary_theme),
    spiritual_challenges: strList(parsed.spiritual_challenges),
    soul_growth_focus: str(parsed.soul_growth_focus),
    integration_guidance: str(parsed.integration_guidance),
    esoteric_ruler: precomputed?.esoteric_ruler ?? str(parsed.esoteric_ruler),
    key_mantra: precomputed?.key_mantra ?? str(parsed.key_mantra),
    life_direction_cross: precomputed?.life_direction_cross ?? str(parsed.life_direction_cross),
    life_direction_sentence: lifeDirectionSentence,
    soul_purpose_interpretation: str(parsed.soul_purpose_interpretation),
    instrument_paragraph: str(parsed.instrument_paragraph),
    moon_warning: str(parsed.moon_warning),
    moon_esoteric_task: str(parsed.moon_esoteric_task),
    south_node_theme: str(parsed.south_node_theme),
    north_node_theme: str(parsed.north_node_theme),
    karmic_axis_actions: strList(parsed.karmic_axis_actions),
    major_energy_circuit: str(parsed.major_energy_circuit),
    growth_strengths: strList(parsed.growth_strengths),
    growth_patterns_to_transcend: strList(parsed.growth_patterns_to_transcend),
    growth_habits: strList(parsed.growth_habits),
    growth_mindset_shifts: strList(parsed.growth_mindset_shifts),
    core_soul_theme: str(parsed.core_soul_theme),
    primary_karmic_lesson: str(parsed.primary_karmic_lesson),
    key_life_arena: str(parsed.key_life_arena),
    growth_strategy: str(parsed.growth_strategy),
    executive_soul_profile: str(parsed.executive_soul_profile),
    cross_of_evolution_assessment: str(parsed.cross_of_evolution_assessment),
    ray_dominance_matrix: str(parsed.ray_dominance_matrix),
    esoteric_rulership_analysis: str(parsed.esoteric_rulership_analysis),
    personality_vs_soul_conflict_zones: str(parsed.personality_vs_soul_conflict_zones),
    spiritual_service_orientation: str(parsed.spiritual_service_orientation),
    group_karma_indicators: str(parsed.group_karma_indicators),
    current_evolutionary_phase: str(parsed.current_evolutionary_phase),
    ray_soul: precomputed?.ray_soul,
    ray_personality: precomputed?.ray_personality,
    cross_dominant: precomputed?.cross_dominant,
    cross_planet_counts: precomputed?.cross_planet_counts,
    evolutionary_stage: precomputed?.evolutionary_stage,
    veiled_by_sun: precomputed?.veiled_by_sun,
    veiled_by_moon: precomputed?.veiled_by_moon,
    triangle_emphasis: precomputed?.triangle_emphasis,
    sun_esoteric_ruler: precomputed?.sun_esoteric_ruler,
    sun_orthodox_ruler: precomputed?.sun_orthodox_ruler,
    ascendant_orthodox_ruler: precomputed?.ascendant_orthodox_ruler,
    esoteric_ruler_sign: precomputed?.esoteric_ruler_sign,
    esoteric_ruler_house: precomputed?.esoteric_ruler_house,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: EsotericComprehensiveRequest = await request.json();
    const { userId, userProfile, chartData: bodyChartData, birthData: bodyBirthData } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
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

    const precomputed = buildPrecomputedContext(planets, houses);
    const chartContext = formatChartContext(planets, houses, aspects);
    const systemPrompt = buildEsotericReportSystemPrompt(chartContext, precomputed);

    const result = await createAICompletion({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are an expert in Esoteric Astrology. Respond only with a single valid JSON object, no other text.' },
        { role: 'user', content: systemPrompt },
      ],
      temperature: 0.6,
      maxTokens: 2400,
      responseFormat: { type: 'json_object' },
    });

    const content = result.content || '';
    let comprehensiveAnalysis: Record<string, unknown>;

    try {
      const parsed = parseEsotericResponse(content);
      comprehensiveAnalysis = normalizeAnalysis(parsed, precomputed);
    } catch {
      const sunSign = getSign(planets.find((p: any) => p.name?.toLowerCase() === 'sun') || {}) || 'Unknown';
      const lifeDir = precomputed.life_direction_cross
        ? getLifeDirection(precomputed.life_direction_cross as 'Cardinal' | 'Fixed' | 'Mutable')
        : null;
      comprehensiveAnalysis = {
        soul_ruler: precomputed.esoteric_ruler ?? 'Unknown',
        personality_ruler: 'Unknown',
        dominant_ray: precomputed.ray_dominant ?? 'Unknown',
        evolutionary_theme: `Soul growth and integration (Sun in ${sunSign})`,
        spiritual_challenges: ['Generalizing cautiously—full chart analysis unavailable'],
        soul_growth_focus: 'Align action with higher intention and service.',
        integration_guidance: 'Seek alignment between personality and soul purpose.',
        esoteric_ruler: precomputed.esoteric_ruler ?? '',
        key_mantra: precomputed.key_mantra ?? '',
        life_direction_cross: precomputed.life_direction_cross ?? '',
        life_direction_sentence: lifeDir
          ? `Your life is currently focused on ${lifeDir.focus}, meaning your challenges will primarily test your ${lifeDir.tests}.`
          : '',
        soul_purpose_interpretation: '',
        instrument_paragraph: '',
        moon_warning: '',
        moon_esoteric_task: '',
        south_node_theme: '',
        north_node_theme: '',
        karmic_axis_actions: [],
        major_energy_circuit: '',
        growth_strengths: [],
        growth_patterns_to_transcend: [],
        growth_habits: [],
        growth_mindset_shifts: [],
        core_soul_theme: '',
        primary_karmic_lesson: '',
        key_life_arena: '',
        growth_strategy: '',
        executive_soul_profile: '',
        cross_of_evolution_assessment: precomputed.cross_dominant
          ? `Dominant cross: ${precomputed.cross_dominant}; evolutionary stage: ${precomputed.evolutionary_stage ?? '—'}.`
          : '',
        ray_dominance_matrix: [precomputed.ray_soul, precomputed.ray_personality, precomputed.ray_dominant]
          .filter(Boolean)
          .join(' | ') || '',
        esoteric_rulership_analysis: '',
        personality_vs_soul_conflict_zones: '',
        spiritual_service_orientation: '',
        group_karma_indicators: '',
        current_evolutionary_phase: precomputed.evolutionary_stage ?? '',
        ray_soul: precomputed.ray_soul,
        ray_personality: precomputed.ray_personality,
        cross_dominant: precomputed.cross_dominant,
        cross_planet_counts: precomputed.cross_planet_counts,
        evolutionary_stage: precomputed.evolutionary_stage,
        veiled_by_sun: precomputed.veiled_by_sun,
        veiled_by_moon: precomputed.veiled_by_moon,
        triangle_emphasis: precomputed.triangle_emphasis,
        sun_esoteric_ruler: precomputed.sun_esoteric_ruler,
        sun_orthodox_ruler: precomputed.sun_orthodox_ruler,
        ascendant_orthodox_ruler: precomputed.ascendant_orthodox_ruler,
        esoteric_ruler_sign: precomputed.esoteric_ruler_sign,
        esoteric_ruler_house: precomputed.esoteric_ruler_house,
      };
    }

    if (adminDb) {
      try {
        await adminDb
          .collection('users')
          .doc(userId)
          .collection('esotericAstrologyReports')
          .doc('comprehensive')
          .set(
            {
              comprehensiveAnalysis,
              timestamp: Date.now(),
            },
            { merge: true }
          );
      } catch (e) {
        devLog.warn('Esoteric report cache write failed:', e, 'route');
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        comprehensiveAnalysis,
        timestamp: Date.now(),
      },
      _usage: result.usage,
    });
  } catch (err) {
    devLog.error('Esoteric comprehensive API error:', err, 'route');
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed to generate esoteric report' },
      { status: 500 }
    );
  }
}
