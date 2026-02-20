import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import { createAICompletion } from '@/lib/aiGateway';
import {
  buildKabbalisticAstrologyReportSystemPrompt,
  type KabbalisticPrecomputedContext,
} from '@/lib/kabbalisticAstrologySeerPrompts';
import {
  getHebrewMonthForSign,
  getSignIndex,
  getDegreeInSign,
  getDecanIndex,
  getAngelForDecan,
  computeElementDistribution,
  computeModeDistribution,
  getDominantElement,
  getDeficientElement,
  get72NameFromLongitude,
  getLetterOfSign,
  getLetterOfPlanetForSign,
  computeSephiroticActivation,
  PLANET_SEFIROT,
} from '@/lib/kabbalisticAstrologyOntology';
import { getHebrewBirthday } from '@/lib/hebrewBirthday';
import { universalOccultService, BirthData } from '@/lib/universalOccultService';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface KabbalisticAstrologyComprehensiveRequest {
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

function getSign(obj: { sign?: { signName?: string } | string }): string {
  const s = obj?.sign;
  return (s && (typeof s === 'string' ? s : (s as { signName?: string }).signName)) || '';
}

interface BirthInfo {
  birthDateStr: string;
  birthTimeStr: string;
  latitude?: number;
  longitude?: number;
}

async function buildPrecomputedContext(
  planets: any[],
  houses: any[],
  aspects: any[],
  birthInfo?: BirthInfo
): Promise<KabbalisticPrecomputedContext> {
  const sunPlanet = planets.find((p: any) => (p.name || '').toLowerCase() === 'sun');
  const moonPlanet = planets.find((p: any) => (p.name || '').toLowerCase() === 'moon');
  const ascPlanet = planets.find((p: any) => (p.name || '').toLowerCase() === 'ascendant');
  const saturnPlanet = planets.find((p: any) => (p.name || '').toLowerCase() === 'saturn');
  const house1 = houses?.find((h: any) => h.number === 1) || houses?.[0];
  const northNode = planets.find(
    (p: any) =>
      (p.name || '').toLowerCase().includes('north node') ||
      (p.name || '').toLowerCase() === 'northnode' ||
      (p.name || '').toLowerCase().includes('true node')
  );
  const southNode = planets.find(
    (p: any) =>
      (p.name || '').toLowerCase().includes('south node') ||
      (p.name || '').toLowerCase() === 'southnode'
  );

  const sunSign = getSign(sunPlanet || {});
  const moonSign = getSign(moonPlanet || {});
  const ascendantSign = getSign(ascPlanet || {}) || getSign(house1 || {});
  const northNodeSign = getSign(northNode || {});
  const southNodeSign = getSign(southNode || {});

  const elementDist = computeElementDistribution(planets);
  const modeDist = computeModeDistribution(planets);

  const sunLongitude = typeof sunPlanet?.longitude === 'number' ? sunPlanet.longitude : 0;
  const signIdx = getSignIndex(sunSign);
  const degreeInSign = getDegreeInSign(sunLongitude);
  const decanIdx = getDecanIndex(degreeInSign);
  const birthDecanAngel = getAngelForDecan(signIdx, decanIdx);

  const name72 = get72NameFromLongitude(sunLongitude);
  const letterOfSign = sunSign ? getLetterOfSign(sunSign) : undefined;
  const letterOfPlanet = sunSign ? getLetterOfPlanetForSign(sunSign) : undefined;

  const twelfthHousePlanets = (planets || [])
    .filter((p: any) => p.house === 12 || p.house === '12')
    .map((p: any) => p.name || '')
    .filter(Boolean);
  const saturnHouse = saturnPlanet?.house != null ? Number(saturnPlanet.house) : undefined;

  const sephirotic = computeSephiroticActivation(planets);
  const planetSefirot = (planets || [])
    .map((p: any) => {
      const name = (p.name || '').trim();
      const mapping = name && PLANET_SEFIROT[name];
      return mapping ? { planet: name, sefirah: mapping.sefirah } : null;
    })
    .filter(Boolean) as Array<{ planet: string; sefirah: string }>;

  let hebrewBirthday: string | undefined;
  let hebrewMonthDay: string | undefined;
  let isLeapMonthAdar: boolean | undefined;
  if (birthInfo?.birthDateStr) {
    const hebrew = await getHebrewBirthday(
      birthInfo.birthDateStr,
      birthInfo.birthTimeStr || '12:00',
      birthInfo.latitude,
      birthInfo.longitude
    );
    if (hebrew) {
      hebrewBirthday = hebrew.hebrewDateString;
      hebrewMonthDay = `${hebrew.hebrewMonthName} ${hebrew.hebrewDay}`;
      isLeapMonthAdar = hebrew.isLeapMonthAdar;
    }
  }

  const now = Date.now();
  let currentSaturnCycleYear: number | undefined;
  let nodalCyclePhase: string | undefined;
  let jupiterCyclePhase: string | undefined;
  if (birthInfo?.birthDateStr) {
    const [y, m, d] = birthInfo.birthDateStr.split('-').map(Number);
    const birthTs = new Date(y, m - 1, d).getTime();
    const yearsSinceBirth = (now - birthTs) / (365.25 * 24 * 60 * 60 * 1000);
    currentSaturnCycleYear = Math.floor(yearsSinceBirth % 29) + 1;
    const nodalYears = yearsSinceBirth / 18.6;
    const nodalCycle = Math.floor(nodalYears % 1 * 10) / 10;
    nodalCyclePhase = `~${(nodalCycle * 18.6).toFixed(1)} years in 18.6y cycle`;
    const jupiterYears = yearsSinceBirth / 11.86;
    const jupiterCycle = Math.floor(jupiterYears % 1 * 10) / 10;
    jupiterCyclePhase = `~${(jupiterCycle * 11.86).toFixed(1)} years in ~12y cycle`;
  }

  const challengingAspects = (aspects || [])
    .filter((a: any) => {
      const t = (a.type || '').toLowerCase();
      return t === 'square' || t === 'opposition';
    })
    .slice(0, 6)
    .map(
      (a: any) =>
        `${a.planet1 || 'Planet1'} ${a.type || 'aspect'} ${a.planet2 || 'Planet2'}`
    );

  return {
    sunSign: sunSign || undefined,
    sunHouse: sunPlanet?.house != null ? Number(sunPlanet.house) : undefined,
    moonSign: moonSign || undefined,
    moonHouse: moonPlanet?.house != null ? Number(moonPlanet.house) : undefined,
    ascendantSign: ascendantSign || undefined,
    northNodeSign: northNodeSign || undefined,
    northNodeHouse: northNode?.house != null ? Number(northNode.house) : undefined,
    southNodeSign: southNodeSign || undefined,
    southNodeHouse: southNode?.house != null ? Number(southNode.house) : undefined,
    hebrewMonth: sunSign ? getHebrewMonthForSign(sunSign) : undefined,
    birthDecanAngel: birthDecanAngel || undefined,
    elementDistribution: elementDist,
    modeDistribution: modeDist,
    dominantElement: getDominantElement(elementDist),
    deficientElement: getDeficientElement(elementDist),
    challengingAspects: challengingAspects.length ? challengingAspects : undefined,
    hebrewBirthday,
    hebrewMonthDay,
    isLeapMonthAdar,
    letterOfSign,
    letterOfPlanet,
    name72: { index: name72.index, name: name72.name },
    twelfthHousePlanets: twelfthHousePlanets.length ? twelfthHousePlanets : undefined,
    saturnHouse,
    currentSaturnCycleYear,
    nodalCyclePhase,
    jupiterCyclePhase,
    sephiroticDominant: sephirotic.dominant.length ? sephirotic.dominant : undefined,
    sephiroticUnderdeveloped: sephirotic.underdeveloped.length ? sephirotic.underdeveloped : undefined,
    planetSefirot: planetSefirot.length ? planetSefirot : undefined,
  };
}

function formatChartContext(planets: any[], houses: any[], aspects: any[]): string {
  const planetsText = (planets || [])
    .map(
      (p) =>
        `${p.name}: ${p.sign?.signName || p.sign} in House ${p.house ?? 'N/A'} at ${p.degree?.toFixed?.(1) ?? p.longitude?.toFixed?.(1) ?? 'N/A'}°`
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

function parseKabbalisticResponse(response: string): Record<string, unknown> {
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

function normalizeAnalysis(parsed: Record<string, unknown>): Record<string, unknown> {
  return {
    executive_summary: str(parsed.executive_summary),
    natal_overview: str(parsed.natal_overview),
    hebrew_sign: str(parsed.hebrew_sign) || 'Unknown',
    hebrew_birthday: str(parsed.hebrew_birthday),
    name_72: str(parsed.name_72),
    letter_of_sign: str(parsed.letter_of_sign),
    letter_of_planet: str(parsed.letter_of_planet),
    sun_through_tree_of_life: str(parsed.sun_through_tree_of_life),
    moon_emotional_root: str(parsed.moon_emotional_root),
    ascendant_path: str(parsed.ascendant_path),
    sefirotic_mapping: str(parsed.sefirotic_mapping),
    tikkun_theme: str(parsed.tikkun_theme),
    tikkun_axis: str(parsed.tikkun_axis),
    past_life_residue: str(parsed.past_life_residue),
    core_correction: str(parsed.core_correction),
    recommended_spiritual_discipline: str(parsed.recommended_spiritual_discipline),
    elemental_modal_balance: str(parsed.elemental_modal_balance),
    challenging_aspects: str(parsed.challenging_aspects),
    angelic_correspondence: str(parsed.angelic_correspondence),
    lunar_influence: str(parsed.lunar_influence),
    spiritual_strength: str(parsed.spiritual_strength),
    growth_path: str(parsed.growth_path),
    integration_guidance: str(parsed.integration_guidance),
    career_malkuth: str(parsed.career_malkuth),
    relationship_emotional_correction: str(parsed.relationship_emotional_correction),
    long_term_rectification_cycles: str(parsed.long_term_rectification_cycles),
    current_spiritual_test: str(parsed.current_spiritual_test),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: KabbalisticAstrologyComprehensiveRequest = await request.json();
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

    const chartContext = formatChartContext(planets, houses, aspects);
    const birthInfo: BirthInfo | undefined = bodyBirthData?.birthDate
      ? {
          birthDateStr: bodyBirthData.birthDate,
          birthTimeStr: bodyBirthData.birthTime || '12:00',
          latitude: bodyBirthData.latitude,
          longitude: bodyBirthData.longitude,
        }
      : userProfile?.birthDate
        ? {
            birthDateStr: userProfile.birthDate,
            birthTimeStr: userProfile.birthTime || '12:00',
            latitude: userProfile.birthLatitude,
            longitude: userProfile.birthLongitude,
          }
        : undefined;
    const precomputedContext = await buildPrecomputedContext(planets, houses, aspects, birthInfo);
    const userName = userProfile?.fullName || userProfile?.displayName || '';

    const systemPrompt = buildKabbalisticAstrologyReportSystemPrompt({
      chartContext,
      userName: userName || undefined,
      precomputedContext,
    });

    const result = await createAICompletion({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in Kabbalistic Astrology. Respond only with a single valid JSON object, no other text.',
        },
        { role: 'user', content: systemPrompt },
      ],
      temperature: 0.6,
      maxTokens: 2500,
      responseFormat: { type: 'json_object' },
    });

    const content = result.content || '';
    let comprehensiveAnalysis: Record<string, unknown>;

    try {
      const parsed = parseKabbalisticResponse(content);
      comprehensiveAnalysis = normalizeAnalysis(parsed);
    } catch {
      const sunPlanet = planets.find((p: any) => p.name?.toLowerCase() === 'sun');
      const sunSign = sunPlanet?.sign?.signName || sunPlanet?.sign || 'Unknown';
      const hebrewMonth = sunSign ? getHebrewMonthForSign(sunSign) : 'Unknown';
      comprehensiveAnalysis = {
        executive_summary: 'Chart analysis unavailable; using Sun sign only.',
        natal_overview: '',
        hebrew_sign: sunSign ? `${sunSign} (${hebrewMonth})` : 'Unknown',
        hebrew_birthday: '',
        name_72: '',
        letter_of_sign: '',
        letter_of_planet: '',
        sun_through_tree_of_life: '',
        moon_emotional_root: '',
        ascendant_path: '',
        sefirotic_mapping: '',
        tikkun_theme: 'Transforming inner patterns into constructive expression.',
        tikkun_axis: '',
        past_life_residue: 'Generalizing cautiously—full chart analysis unavailable.',
        core_correction: 'Balance and alignment with higher intention.',
        recommended_spiritual_discipline: '',
        elemental_modal_balance: '',
        challenging_aspects: '',
        angelic_correspondence: '',
        lunar_influence: '',
        spiritual_strength: 'Resilience and depth of soul.',
        growth_path: 'Discipline and emotional refinement.',
        integration_guidance: 'Respond with awareness rather than reaction.',
        career_malkuth: '',
        relationship_emotional_correction: '',
        long_term_rectification_cycles: '',
        current_spiritual_test: '',
      };
    }

    if (adminDb) {
      try {
        await adminDb
          .collection('users')
          .doc(userId)
          .collection('kabbalisticAstrologyReports')
          .doc('comprehensive')
          .set(
            {
              comprehensiveAnalysis,
              timestamp: Date.now(),
            },
            { merge: true }
          );
      } catch (e) {
        devLog.warn('Kabbalistic Astrology report cache write failed:', e, 'route');
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        comprehensiveAnalysis,
        timestamp: Date.now(),
      },
    });
  } catch (err) {
    devLog.error('Kabbalistic Astrology comprehensive API error:', err, 'route');
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to generate Kabbalistic Astrology report',
      },
      { status: 500 }
    );
  }
}
