/**
 * Zi Wei Dou Shu Seer State and Slice Selector.
 * Deterministic, hierarchical, palace-centric. Palace routing required.
 * Rule: Zi Wei answers must always state palace, star, and cycle.
 */

import type { ZiWeiChartData, Palace, Star } from './chinese/chineseAstrologyService';
import type { ZiWeiReport } from './chinese/ziweiReportGenerator';

export interface ZiWeiLifePalace {
  palace: string;
  main_stars: string[];
  supporting_stars: string[];
  brightness: string;
}

export interface ZiWeiPalaceSummary {
  palace: string;
  nameChinese: string;
  main_stars: string[];
  quality: string;
}

export interface ZiWeiTransformation {
  star: string;
  palace: string;
  meaning: string;
}

export interface ZiWeiChartState {
  life_palace: ZiWeiLifePalace;
  body_palace: string | null;
  palaces: Record<string, ZiWeiPalaceSummary>;
  four_transformations: {
    Hua_Lu: ZiWeiTransformation;
    Hua_Quan: ZiWeiTransformation;
    Hua_Ke: ZiWeiTransformation;
    Hua_Ji: ZiWeiTransformation;
  };
  fortune_cycles: {
    current_10yr: string;
    current_year: string | null;
  };
}

export type ZiWeiQuestionType =
  | 'career'
  | 'wealth'
  | 'relationship'
  | 'health'
  | 'life_direction'
  | 'property'
  | 'travel'
  | 'refusal'
  | 'general';

const PALACE_KEYS: Record<string, { index: number; chinese: string }> = {
  life_direction: { index: 0, chinese: '命宮' },
  career: { index: 8, chinese: '官祿宮' },
  wealth: { index: 4, chinese: '財帛宮' },
  relationship: { index: 2, chinese: '夫妻宮' },
  health: { index: 5, chinese: '疾厄宮' },
  property: { index: 9, chinese: '田宅宮' },
  travel: { index: 6, chinese: '遷移宮' },
};

function strengthToQuality(strength: number): string {
  if (strength >= 0.7) return 'strong';
  if (strength >= 0.4) return 'moderate';
  return 'weak';
}

function getMainStars(palace: Palace): string[] {
  return palace.stars.filter((s: Star) => s.type === 'main').map((s: Star) => s.name);
}

function getSupportingStars(palace: Palace): string[] {
  return palace.stars.filter((s: Star) => s.type === 'supporting').map((s: Star) => s.name);
}

/**
 * Build ZiWeiChartState from ZiWeiChartData and ZiWeiReport.
 */
export function buildZiWeiChartState(
  chartData: ZiWeiChartData,
  report: ZiWeiReport
): ZiWeiChartState {
  const palaces = chartData.palaces;
  const lifePalaceData = palaces[0];

  const life_palace: ZiWeiLifePalace = {
    palace: lifePalaceData?.englishName ?? 'Life Palace',
    main_stars: lifePalaceData ? getMainStars(lifePalaceData) : (report.lifePalace?.stars ?? []),
    supporting_stars: lifePalaceData ? getSupportingStars(lifePalaceData) : [],
    brightness: lifePalaceData?.strength >= 0.6 ? 'strong' : lifePalaceData?.strength >= 0.4 ? 'normal' : 'dim',
  };

  const palacesSummary: ZiWeiChartState['palaces'] = {};
  for (const [key, { index, chinese }] of Object.entries(PALACE_KEYS)) {
    const p = palaces[index];
    if (p) {
      palacesSummary[key] = {
        palace: p.englishName,
        nameChinese: chinese,
        main_stars: getMainStars(p),
        quality: strengthToQuality(p.strength),
      };
    }
  }

  const ft = report.fourTransformations;
  const four_transformations = {
    Hua_Lu: { star: ft.lu.star, palace: ft.lu.palace, meaning: ft.lu.meaning },
    Hua_Quan: { star: ft.quan.star, palace: ft.quan.palace, meaning: ft.quan.meaning },
    Hua_Ke: { star: ft.ke.star, palace: ft.ke.palace, meaning: ft.ke.meaning },
    Hua_Ji: { star: ft.ji.star, palace: ft.ji.palace, meaning: ft.ji.meaning },
  };

  const current = report.fortuneCycles?.current;
  const fortune_cycles = {
    current_10yr: current ? `${current.period}: ${current.focus?.join(', ') ?? current.description}` : '—',
    current_year: null,
  };

  return {
    life_palace,
    body_palace: null,
    palaces: palacesSummary,
    four_transformations,
    fortune_cycles,
  };
}

/**
 * Classify Zi Wei question. Returns refusal for daily timing, element balancing, psychological, guarantees.
 */
export function classifyZiWeiQuestion(question: string): ZiWeiQuestionType {
  const lower = question.toLowerCase().trim();

  if (
    /what\s+should\s+i\s+do\s+today|will\s+this\s+happen\s+tomorrow|one-day|one\s+day|daily\s+timing|exact\s+date|when\s+exactly|guarantee|element\s+balanc|balance\s+my\s+elements|psychological|therapy|counseling|grooming|lend\s+money|haircut\s+today|nails\s+today/.test(
      lower
    )
  ) {
    return 'refusal';
  }

  if (/career|job|work|business|status|profession|官祿/.test(lower)) return 'career';
  if (/wealth|money|financial|income|rich|財帛/.test(lower)) return 'wealth';
  if (/relationship|marriage|partner|spouse|love|夫妻/.test(lower)) return 'relationship';
  if (/health|wellness|constitution|疾厄/.test(lower)) return 'health';
  if (/life\s+direction|destiny|life\s+path|purpose|命宮/.test(lower)) return 'life_direction';
  if (/property|real\s+estate|home|田宅/.test(lower)) return 'property';
  if (/travel|migration|relocation|遷移/.test(lower)) return 'travel';

  return 'general';
}

function formatPalaceSummary(summary: ZiWeiPalaceSummary): string {
  return `${summary.palace} (${summary.nameChinese}): main_stars [${summary.main_stars.join(', ')}], quality: ${summary.quality}`;
}

/**
 * Build slice for system prompt. Palace routing; include relevant palace, Four Transformations, fortune cycles.
 */
export function getZiWeiSliceForQuestionType(
  questionType: ZiWeiQuestionType,
  state: ZiWeiChartState,
  report: ZiWeiReport
): string {
  if (questionType === 'refusal') {
    return 'Zi Wei Dou Shu cannot assess this without the relevant palace and fortune cycle. Refuse with: "Zi Wei Dou Shu evaluates life areas and fortune phases, not daily moments."';
  }

  const lifeBlock = `
life_palace: ${state.life_palace.palace} (命宮)
  main_stars: ${state.life_palace.main_stars.join(', ')}
  supporting_stars: ${state.life_palace.supporting_stars.join(', ')}
  brightness: ${state.life_palace.brightness}
body_palace: ${state.body_palace ?? '—'}
`.trim();

  const fourTransBlock = `
four_transformations (四化):
  Hua_Lu (化祿): ${state.four_transformations.Hua_Lu.star} in ${state.four_transformations.Hua_Lu.palace} — ${state.four_transformations.Hua_Lu.meaning}
  Hua_Quan (化權): ${state.four_transformations.Hua_Quan.star} in ${state.four_transformations.Hua_Quan.palace} — ${state.four_transformations.Hua_Quan.meaning}
  Hua_Ke (化科): ${state.four_transformations.Hua_Ke.star} in ${state.four_transformations.Hua_Ke.palace} — ${state.four_transformations.Hua_Ke.meaning}
  Hua_Ji (化忌): ${state.four_transformations.Hua_Ji.star} in ${state.four_transformations.Hua_Ji.palace} — ${state.four_transformations.Hua_Ji.meaning}
`.trim();

  const fortuneBlock = `
fortune_cycles:
  current_10yr (大限): ${state.fortune_cycles.current_10yr}
  current_year: ${state.fortune_cycles.current_year ?? '—'}
`.trim();

  const disciplineNote =
    'Every answer must state: palace, star, and cycle. Main stars dominate; supporting stars modify. Four Transformations are dynamic modifiers (Hua Lu = gain, Hua Quan = power, Hua Ke = reputation, Hua Ji = blockage). If palace is not activated by fortune cycle, outcomes remain latent.';

  const ziweiDataCaveat =
    state.fortune_cycles.current_10yr === '—'
      ? '\n\nPalace or fortune cycle data missing or incomplete. Do not give specific timing or phase predictions; reduce confidence or say timing cannot be concluded from current data.'
      : '';

  const relevantKey = questionType !== 'general' ? questionType : null;
  const relevantPalace = relevantKey ? state.palaces[relevantKey] : null;
  const palaceBlock = relevantPalace
    ? `\nRELEVANT PALACE for this question: ${formatPalaceSummary(relevantPalace)}`
    : '\nRelevant palace: determine from question (career → 官祿宮, wealth → 財帛宮, relationship → 夫妻宮, health → 疾厄宮, life direction → 命宮, property → 田宅宮, travel → 遷移宮).';

  const recommendationsBlock =
    relevantKey && report.recommendations?.[relevantKey as keyof typeof report.recommendations]
      ? `\nrecommendations for ${relevantKey}: ${(report.recommendations[relevantKey as keyof typeof report.recommendations] as string[]).slice(0, 3).join('; ')}`
      : '';

  return `${lifeBlock}
${fourTransBlock}
${fortuneBlock}
${palaceBlock}${recommendationsBlock}

${disciplineNote}${ziweiDataCaveat}`;
}
