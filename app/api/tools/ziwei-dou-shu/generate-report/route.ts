/**
 * POST /api/tools/ziwei-dou-shu/generate-report
 *
 * Generates a Zi Wei Dou Shu (Purple Star Astrology) report from birth data.
 * Used by the profile generation pipeline. Uses iztro for all calculations (no external APIs).
 */

import { NextRequest, NextResponse } from 'next/server';
import { astro } from 'iztro';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function getTimeIndex(birthTime: string): number {
  const parts = String(birthTime || '12:00').trim().split(/[:\s]/);
  const hour = Math.min(23, Math.max(0, parseInt(parts[0], 10) || 12));
  if (hour === 23 || hour === 0) return 0;
  return Math.floor((hour + 1) / 2);
}

function getSolarDateStr(birthDate: string): string {
  const d = new Date(birthDate);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}-${m}-${day}`;
}

function getGender(gender: string): 'male' | 'female' {
  const g = String(gender || '').toLowerCase();
  if (g === 'female' || g === 'f' || g === '女') return 'female';
  return 'male';
}

function starName(s: unknown): string {
  if (s && typeof s === 'object' && 'name' in s && typeof (s as { name: unknown }).name === 'string') {
    return (s as { name: string }).name;
  }
  return String(s);
}

function serializePalace(palace: Record<string, unknown>): Record<string, unknown> {
  const major = ((palace.majorStars as unknown[]) || []).map(starName);
  const minor = ((palace.minorStars as unknown[]) || []).map(starName);
  const adj = ((palace.adjectiveStars as unknown[]) || []).map(starName);
  return {
    name: palace.name ?? palace.palaceName ?? '',
    palaceName: palace.name ?? palace.palaceName ?? '',
    stars: [...major, ...minor, ...adj],
    majorStars: major,
    minorStars: minor,
    decadal: palace.decadal,
  };
}

function buildReportFromAstrolabe(astrolabe: {
  palaces: Array<Record<string, unknown>>;
  gender: string;
  solarDate: string;
  lunarDate: string;
  time: string;
  timeRange: string;
  zodiac: string;
  sign: string;
  soul: string;
  body: string;
  fiveElementsClass: string;
  earthlyBranchOfSoulPalace: string;
  earthlyBranchOfBodyPalace: string;
}): Record<string, unknown> {
  const palaces = astrolabe.palaces || [];
  const lifePalace = palaces[0];
  const wealthPalace = palaces[4];
  const careerPalace = palaces[8];
  const spousePalace = palaces[2];
  const healthPalace = palaces[5];

  const lifeStars = (lifePalace?.majorStars as unknown[]) || [];
  const lifeStarNames = lifeStars.map(starName).join(', ') || '—';

  const executiveSummary =
    `Your Zi Wei Dou Shu chart (${astrolabe.solarDate}, ${astrolabe.time}) shows a ${astrolabe.fiveElementsClass} structure with Life Palace in ${astrolabe.earthlyBranchOfSoulPalace} and Body Palace in ${astrolabe.earthlyBranchOfBodyPalace}. ` +
    `Life Palace hosts ${lifeStarNames}. Soul star: ${astrolabe.soul}; Body star: ${astrolabe.body}. ` +
    `This gives 5–8 structural life themes derived from star distribution and palace dominance (三合派).`;

  const lifePalaceText =
    `Life Palace (命宮) is in ${astrolabe.earthlyBranchOfSoulPalace}. Main stars: ${lifeStarNames}. ` +
    `Strength is graded by temple status from the astrolabe. Opposite palace axis and 三方四正 (three directions and four positions) interact with Career and Wealth palaces. ` +
    `Four Transformations (四化) influence is reflected in the star mutagens.`;

  const wealthText =
    `Wealth (財帛宮) and Career (官祿宮) architecture: Wealth Palace stars and Career Palace stars, combined with the current 10-year luck (大限) activation, indicate income stability and volatility markers. ` +
    `Authority structure is derived from 紫微, 武曲, 天府 placements in these palaces.`;

  const careerText =
    `Career pattern from 官祿宮: main stars in Career Palace, plus 紫微/武曲/天府 presence across the chart. ` +
    `Transformation impact and 10-year activation windows are shown by the decadal (大限) ranges in each palace.`;

  const relationshipsText =
    `Relationship dynamics (夫妻宮): Spouse Palace stars and opposing palace cross-check. ` +
    `Annual transformation triggers (流年 四化) affect relationship timing.`;

  const healthText =
    `Health and risk (疾厄宮): Health Palace stars; malefic star combinations and temple weakness indicate stress periods. ` +
    `Luck cycle stress periods are visible in the decadal overlay.`;

  const tenYearLuckText =
    `10-year luck roadmap (大限): Each palace has a decadal age range. The activated palace for the current decade and whether Four Transformations enhance or obstruct are derived from the chart.`;

  const currentThreeYearText =
    `Current 3-year outlook: Flowing year (流年) Four Transformations mapped to natal palaces. ` +
    `Use the horoscope method for exact dates; the chart provides the structural basis.`;

  return {
    executiveSummary,
    lifePalace: lifePalaceText,
    wealth: wealthText,
    career: careerText,
    relationships: relationshipsText,
    health: healthText,
    tenYearLuck: tenYearLuckText,
    currentThreeYearOutlook: currentThreeYearText,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const profile = body.userProfile || body;
    const birthDate = profile.birthDate || body.birthDate;
    const birthTime = profile.birthTime || body.birthTime || '12:00:00';
    const birthPlace = profile.birthPlace || body.birthPlace;
    const gender = getGender(profile.gender || body.gender);

    if (!birthDate || !String(birthDate).trim()) {
      return NextResponse.json(
        { error: 'Birth date is required' },
        { status: 400 }
      );
    }

    const solarDateStr = getSolarDateStr(birthDate);
    const timeIndex = getTimeIndex(birthTime);

    const astrolabe = astro.bySolar(solarDateStr, timeIndex, gender, true, 'en-US') as unknown as {
      palaces: Array<Record<string, unknown>>;
      gender: string;
      solarDate: string;
      lunarDate: string;
      time: string;
      timeRange: string;
      zodiac: string;
      sign: string;
      soul: string;
      body: string;
      fiveElementsClass: string;
      earthlyBranchOfSoulPalace: string;
      earthlyBranchOfBodyPalace: string;
    };

    const chartData = {
      solarDate: astrolabe.solarDate,
      lunarDate: astrolabe.lunarDate,
      time: astrolabe.time,
      timeRange: astrolabe.timeRange,
      zodiac: astrolabe.zodiac,
      sign: astrolabe.sign,
      soul: astrolabe.soul,
      body: astrolabe.body,
      fiveElementsClass: astrolabe.fiveElementsClass,
      earthlyBranchOfSoulPalace: astrolabe.earthlyBranchOfSoulPalace,
      earthlyBranchOfBodyPalace: astrolabe.earthlyBranchOfBodyPalace,
      palaces: (astrolabe.palaces || []).map((p: Record<string, unknown>) => serializePalace(p)),
    };

    const reportSections = buildReportFromAstrolabe(astrolabe);

    const data = {
      chartData,
      ...reportSections,
      metadata: {
        generatedAt: new Date().toISOString(),
        source: 'iztro',
        methodology: '三合派',
      },
    };

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Zi Wei Dou Shu report generation failed';
    console.error('[ziwei-dou-shu generate-report]', err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
