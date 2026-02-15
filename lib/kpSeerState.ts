/**
 * KP Astrology Seer State and Slice.
 * Rule: In KP, the Sub-Lord decides. Always.
 * KP answers outcomes; Vedic answers periods; Tarot answers process.
 */

import type { KPAnalysis, KPCusp, KPPlanet } from '@/lib/kpAstrologyIntelligence';

export interface KPChartState {
  question: string;
  relevant_houses: number[];
  cusp_sub_lords: Record<string, string>;
  significators: Record<string, number[]>;
  dasha: { maha: string; antara: string };
}

export type KPQuestionType =
  | 'job'
  | 'marriage'
  | 'loan'
  | 'litigation_win'
  | 'litigation_loss'
  | 'venture'
  | 'property'
  | 'general'
  | 'clarification_timing'
  | 'refusal';

/** House clusters: favorable (support) vs denial (deny) for common matters */
const HOUSE_MAPPING: Record<
  string,
  { support: number[]; deny: number[] }
> = {
  marriage: { support: [2, 7, 11], deny: [6, 10, 12] },
  job: { support: [2, 6, 10, 11], deny: [] },
  loan: { support: [2, 8, 11], deny: [] },
  litigation_win: { support: [6, 10, 11], deny: [] },
  litigation_loss: { support: [6, 8, 12], deny: [] },
  venture: { support: [2, 6, 10, 11], deny: [] },
  property: { support: [2, 4, 11], deny: [6, 8, 12] },
};

const SIGN_LORDS: Record<string, string> = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Mercury',
  Libra: 'Venus',
  Scorpio: 'Mars',
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Saturn',
  Pisces: 'Jupiter',
};

/**
 * Build significators: planet -> list of houses it signifies.
 * Priority: (1) planet in house, (2) lord of house, (3) star-lord of planet in house.
 */
function buildSignificators(planets: KPPlanet[], cusps: KPCusp[]): Record<string, number[]> {
  const map: Record<string, number[]> = {};
  const add = (planet: string, house: number) => {
    if (!map[planet]) map[planet] = [];
    if (!map[planet].includes(house)) map[planet].push(house);
  };

  for (const p of planets) {
    add(p.name, p.house);
    add(p.starLord, p.house);
  }
  for (const c of cusps) {
    const lord = SIGN_LORDS[c.sign] || 'Sun';
    add(lord, c.house);
  }
  return map;
}

/**
 * Build KPChartState from KPAnalysis and question.
 * Requires cusps, planets, and timingAnalysis.
 */
export function buildKPChartState(
  analysis: KPAnalysis,
  question: string
): KPChartState {
  const cusps = analysis?.cusps ?? [];
  const planets = analysis?.planets ?? [];
  const timing = analysis?.timingAnalysis;

  if (!analysis || cusps.length === 0 || !timing) {
    throw new Error(
      'KP astrology requires a precise question and exact chart data (cusps and timing).'
    );
  }

  const cusp_sub_lords: Record<string, string> = {};
  for (const c of cusps) {
    cusp_sub_lords[String(c.house)] = c.subLord;
  }

  const significators = buildSignificators(planets, cusps);

  return {
    question: question.trim(),
    relevant_houses: [],
    cusp_sub_lords,
    significators,
    dasha: {
      maha: timing.dasha || 'Moon',
      antara: timing.antardasha || 'Sun',
    },
  };
}

/**
 * Classify KP question. Refuse non-binary, explanatory, remedy, or "when exactly" questions.
 * If question is timing-led but mentions no event, return clarification_timing so the route can ask for restatement.
 */
export function classifyKPQuestion(question: string): KPQuestionType {
  const lower = question.toLowerCase().trim();

  const timingLed =
    /^\s*when\b/.test(lower) ||
    /\b(when is the|when will|when can|which period|what timing|favorable period)\b/.test(lower);
  const hasExplicitEvent = /\b(job|marriage|loan|venture|business|relationship|app|offer|deal|property|court|case|succeed|approved|formalize|litigation|marry)\b/.test(
    lower
  );
  if (timingLed && !hasExplicitEvent) {
    return 'clarification_timing';
  }

  if (
    /\b(why is this|what should i do|describe my future|when exactly|remedy|remedies|what do i do)\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }
  if (
    /\b(will i get (this )?job|will (this )?job (come|happen)|job (approval|offer))\b/.test(
      lower
    )
  ) {
    return 'job';
  }
  if (
    /\b(will (this )?marriage happen|will (i|we) (get )?marry|marriage (take place|happen))\b/.test(
      lower
    )
  ) {
    return 'marriage';
  }
  if (
    /\b(will (the )?loan (be )?approved|loan (approval|sanction))\b/.test(
      lower
    )
  ) {
    return 'loan';
  }
  if (
    /\b(will (this )?court case (end in my favor|go in my favor)|litigation (win|success)|case (win|favor))\b/.test(
      lower
    )
  ) {
    return 'litigation_win';
  }
  if (
    /\b(will (this )?court case (end against|go against)|litigation (loss|defeat))\b/.test(
      lower
    )
  ) {
    return 'litigation_loss';
  }
  if (
    /\b(will (this )?(venture|business) (succeed|work|go through)|venture (succeed|work)|business (succeed|work))\b/.test(
      lower
    )
  ) {
    return 'venture';
  }
  if (
    /\b(will (the )?property (deal )?(go through|happen)|property (deal |purchase )?(go through|close)|deal (go through|close))\b/.test(
      lower
    )
  ) {
    return 'property';
  }
  if (
    /^\s*will\s+.+\s*\?\s*$/i.test(question) ||
    /\b(will\s+|will i |will the |will this )/.test(lower)
  ) {
    return 'general';
  }

  return 'refusal';
}

/**
 * Get relevant houses and support/deny for a question type.
 */
function getRelevantHousesForType(
  type: KPQuestionType
): { support: number[]; deny: number[] } {
  if (type === 'refusal' || type === 'clarification_timing') {
    return { support: [], deny: [] };
  }
  if (type === 'general') {
    return { support: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], deny: [] };
  }
  return HOUSE_MAPPING[type] ?? { support: [], deny: [] };
}

/**
 * Build slice for system prompt: chart state, house mapping, sub-lord judgment, significator priority, dasha, discipline.
 */
export function getKPSliceForQuestionType(
  questionType: KPQuestionType,
  state: KPChartState,
  _analysis: KPAnalysis
): string {
  if (questionType === 'refusal') {
    return 'Refuse with: "KP astrology requires a precise question and exact chart data." or "KP astrology answers outcome-based questions, not explanations."';
  }
  if (questionType === 'clarification_timing') {
    return 'Return the clarification message; do not invoke chart.';
  }

  const { support, deny } = getRelevantHousesForType(questionType);
  const relevantHouses = [...new Set([...support, ...deny])].sort((a, b) => a - b);
  const cuspSubLordsForRelevant = relevantHouses
    .map((h) => `${h}: ${state.cusp_sub_lords[String(h)] ?? '—'}`)
    .join(', ');

  const significatorLines = Object.entries(state.significators)
    .filter(([, houses]) => houses.some((h) => relevantHouses.includes(h)))
    .map(([planet, houses]) => `${planet}: [${houses.join(', ')}]`)
    .join('\n');

  const noDenyHouses = deny.length === 0;
  const matterRuleBlock = noDenyHouses
    ? `
MATTER RULE (this question has NO denial houses):
- Support houses ONLY: ${support.join(', ')}. There are no denial houses for this matter.
- A cusp sub-lord SUPPORTS the outcome if it signifies ANY of these support houses (check Significators: does that planet list any of ${support.join(', ')}?).
- Say YES if the relevant cusp sub-lords (listed above) signify one or more of the support houses. Say NO only if they do NOT signify any of the support houses.
- Do not invent "denial" or "neutral" houses for this question; only support houses count.
`.trim()
    : `
MATTER RULE (this question has both support and denial houses):
- Support houses: ${support.join(', ')}. Denial houses: ${deny.join(', ')}.
- A sub-lord supports if it signifies support houses; it denies if it signifies denial houses. Weigh the balance; do not default to denial.
`.trim();

  const stateBlock = `
KP CHART STATE (use this only):
- Question: ${state.question}
- Relevant houses: ${support.length ? `support ${support.join(', ')}` : ''}${deny.length ? `; deny ${deny.join(', ')}` : ''}
- Cusp sub-lords for relevant houses: ${cuspSubLordsForRelevant || '—'}
- Significators (planet -> houses): 
${significatorLines || '(none for this matter)'}
- Dasha: Maha ${state.dasha.maha}, Antar ${state.dasha.antara}
${matterRuleBlock}
`.trim();

  const subLordBlock = `
SUB-LORD JUDGMENT (decisive):
- Judge ONLY from the cusp sub-lords of the RELEVANT houses. Use the Significators map: a planet "signifies" the houses listed next to it.
- Follow the MATTER RULE above. Do not treat a house as "denial" for this question unless it is listed in the deny list for this matter.
- Do not default to NO. Say NO only when the rule clearly requires it (no support-house signification when there are no denial houses; or clear denial-house signification when denial houses exist).
- Cusp → Sub-Lord → Star-Lord → Houses. The Sub-Lord decides. Planet dignity, sign strength, yogas are irrelevant in KP.
`.trim();

  const significatorPriorityBlock = `
SIGNIFICATOR PRIORITY (rank, do not just list):
1. Planet in the house
2. Lord of the house
3. Star-lord of a planet in the house
`.trim();

  const dashaBlock = `
DASHA CONFIRMATION (support, not decision):
- Dasha must activate favorable significators.
- Dasha cannot override a denying sub-lord.
- Favorable sub-lord + wrong Dasha → delay, not denial.
- Phrase: "Outcome is promised, but timing depends on Dasha support."
`.trim();

  const disciplineBlock = `
DISCIPLINE (non-negotiable):
- Do not default to NO. Apply the MATTER RULE: for questions with no denial houses, say YES if the relevant cusp sub-lords signify any support house; say NO only when they do not.
- Prefer clear YES or NO. Use conditional only when support and denial are truly balanced (when denial houses exist).
- Answer yes / no / conditional (or delayed). Direct, traceable, non-emotional. State which houses support or deny the matter.
- Example YES: "Yes, the outcome is indicated; the relevant cusp sub-lords signify support houses (e.g. 6, 10, 11)."
- Example NO (only when rule is met): "No, the outcome is denied; the relevant cusp sub-lords do not signify the support houses." or "... signify denial houses."
- Permanent rule: KP answers outcomes; Vedic answers periods; Tarot answers process.
`.trim();

  const subLordCount = relevantHouses.filter(
    (h) => {
      const sl = state.cusp_sub_lords[String(h)];
      return sl != null && String(sl).trim() !== '' && String(sl).trim() !== '—';
    }
  ).length;
  const subLordIncomplete = relevantHouses.length > 0 && subLordCount < Math.ceil(relevantHouses.length / 2);
  const subLordCaveat = subLordIncomplete
    ? '\n\nSub-lord logic is missing or incomplete for key houses; reduce certainty and do not fabricate.'
    : '';

  return `${stateBlock}

${subLordBlock}

${significatorPriorityBlock}

${dashaBlock}

${disciplineBlock}${subLordCaveat}`;
}
