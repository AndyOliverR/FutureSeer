/* eslint-disable security/detect-unsafe-regex */
/**
 * BaZi Seer State and Slice Selector.
 * Structural + timing system; Day Master gate, element function, Luck Cycle supremacy.
 * Rule: BaZi answers must always reference element balance and time phase.
 */

import type {
  BaziReading,
  BaziElements,
  LuckCycle,
  CareerAnalysis,
  WealthAnalysis,
  RelationshipAnalysis,
  HealthAnalysis,
} from './baziIntelligence';

export interface BaziPillarStemBranch {
  stem: string;
  branch: string;
}

export interface BaziChartState {
  four_pillars: {
    year: BaziPillarStemBranch;
    month: BaziPillarStemBranch;
    day: BaziPillarStemBranch;
    hour: BaziPillarStemBranch;
  };
  day_master: string;
  day_master_strength: 'weak' | 'strong';
  element_distribution: BaziElements;
  useful_elements: string[];
  unfavorable_elements: string[];
  luck_cycle: {
    current: string;
    element_focus: string[];
    period: string;
  } | null;
}

export type BaziQuestionType =
  | 'life_direction'
  | 'career'
  | 'wealth'
  | 'relationship'
  | 'health'
  | 'timing_period'
  | 'refusal'
  | 'general';

const DAY_MASTER_STRENGTH_THRESHOLD = 50;

/**
 * Build BaziChartState from BaziReading.
 */
export function buildBaziChartState(reading: BaziReading): BaziChartState {
  const { chart, elements, dayMaster, luckCycles } = reading;

  const four_pillars = {
    year: {
      stem: chart.yearPillar.heavenlyStem.name,
      branch: chart.yearPillar.earthlyBranch.name,
    },
    month: {
      stem: chart.monthPillar.heavenlyStem.name,
      branch: chart.monthPillar.earthlyBranch.name,
    },
    day: {
      stem: chart.dayPillar.heavenlyStem.name,
      branch: chart.dayPillar.earthlyBranch.name,
    },
    hour: {
      stem: chart.hourPillar.heavenlyStem.name,
      branch: chart.hourPillar.earthlyBranch.name,
    },
  };

  const day_master = `${dayMaster.name} ${dayMaster.element}`;
  const day_master_strength: 'weak' | 'strong' =
    dayMaster.strength < DAY_MASTER_STRENGTH_THRESHOLD ? 'weak' : 'strong';

  const currentAge = chart.currentAge ?? 0;
  let luck_cycle: BaziChartState['luck_cycle'] = null;
  if (luckCycles && luckCycles.length > 0) {
    const current = luckCycles.find(
      (c: LuckCycle) => currentAge >= c.startAge && currentAge < c.endAge
    );
    if (current) {
      luck_cycle = {
        current: `${current.heavenlyStem} ${current.earthlyBranch}`,
        element_focus: [current.element],
        period: `Age ${current.startAge}-${current.endAge}`,
      };
    } else {
      const first = luckCycles[0];
      luck_cycle = {
        current: `${first.heavenlyStem} ${first.earthlyBranch}`,
        element_focus: [first.element],
        period: `Age ${first.startAge}-${first.endAge}`,
      };
    }
  }

  return {
    four_pillars,
    day_master,
    day_master_strength,
    element_distribution: elements,
    useful_elements: dayMaster.favorableElements ?? [],
    unfavorable_elements: dayMaster.unfavorableElements ?? [],
    luck_cycle,
  };
}

/**
 * Classify BaZi question. Returns refusal for daily timing, exact date, psychological, medical.
 */
export function classifyBaziQuestion(question: string): BaziQuestionType {
  const lower = question.toLowerCase().trim();

  if (
    /what\s+should\s+i\s+do\s+today|will\s+this\s+happen\s+tomorrow|exact\s+date|when\s+exactly|give\s+me\s+(an\s+)?exact|guarantee|psychological|therapy|counseling|medical\s+diagnosis|doctor|diagnose|prescription/.test(
      lower
    )
  ) {
    return 'refusal';
  }

  if (
    /life\s+direction|destiny|life\s+path|purpose|direction\s+in\s+life/.test(
      lower
    )
  ) {
    return 'life_direction';
  }
  if (
    /career|job|work|business|profession|industry|employment/.test(lower)
  ) {
    return 'career';
  }
  if (
    /wealth|money|financial|income|investment|rich|finances/.test(lower)
  ) {
    return 'wealth';
  }
  if (
    /relationship|partner|love|marriage|compatibility|family|spouse/.test(
      lower
    )
  ) {
    return 'relationship';
  }
  if (
    /health|wellness|constitution|body|vulnerable|wellness/.test(lower)
  ) {
    return 'health';
  }
  if (
    /timing|when\s+to|luck\s+cycle|da\s+yun|period|decade|phase|favorable\s+time|best\s+time\s+for/.test(
      lower
    )
  ) {
    return 'timing_period';
  }

  return 'general';
}

function formatElementDistribution(el: BaziElements): string {
  return `wood: ${el.wood}, fire: ${el.fire}, earth: ${el.earth}, metal: ${el.metal}, water: ${el.water}`;
}

/**
 * Build slice for system prompt. Domain-specific; Day Master gate and Luck Cycle always included.
 */
export function getBaziSliceForQuestionType(
  questionType: BaziQuestionType,
  state: BaziChartState,
  reading: BaziReading
): string {
  if (questionType === 'refusal') {
    return 'BaZi does not operate at that time scale. Refuse with: "BaZi works in phases, not daily moments."';
  }

  const coreBlock = `
four_pillars:
  year: ${state.four_pillars.year.stem} ${state.four_pillars.year.branch}
  month: ${state.four_pillars.month.stem} ${state.four_pillars.month.branch}
  day: ${state.four_pillars.day.stem} ${state.four_pillars.day.branch}
  hour: ${state.four_pillars.hour.stem} ${state.four_pillars.hour.branch}
day_master: ${state.day_master}
day_master_strength: ${state.day_master_strength}
element_distribution: ${formatElementDistribution(state.element_distribution)}
useful_elements: ${state.useful_elements.join(', ')}
unfavorable_elements: ${state.unfavorable_elements.join(', ')}
luck_cycle: ${state.luck_cycle ? `${state.luck_cycle.current} (${state.luck_cycle.period}), element_focus: ${state.luck_cycle.element_focus.join(', ')}` : '—'}
`.trim();

  const disciplineNote =
    'Every answer must start from Day Master strength. Interpret elements by function (Resource, Companion, Output, Wealth, Power), not symbolism. Favor useful elements; reduce unfavorable. Luck Cycle is the primary timing axis.';

  const luckPillarsCaveat =
    !state.luck_cycle || !reading.luckCycles?.length
      ? '\n\nLuck pillars missing or incomplete. Do not give specific timing or phase predictions; say timing cannot be concluded from current data or reduce confidence.'
      : '';

  switch (questionType) {
    case 'life_direction': {
      const rec = reading.recommendations?.slice(0, 4).join('; ') ?? '—';
      return `${coreBlock}

DOMAIN: Life direction
recommendations: ${rec}
personality_career_summary: ${reading.personality?.career ?? '—'}

${disciplineNote}${luckPillarsCaveat}`;
    }
    case 'career': {
      const c = reading.career as CareerAnalysis;
      return `${coreBlock}

DOMAIN: Career
suitable_paths: ${c?.suitablePaths?.join(', ') ?? '—'}
favorable_industries: ${c?.favorableIndustries?.join(', ') ?? '—'}
career_timing: ${c?.careerTiming?.join(', ') ?? '—'}
challenges: ${c?.challenges?.join(', ') ?? '—'}

${disciplineNote}${luckPillarsCaveat}`;
    }
    case 'wealth': {
      const w = reading.wealth as WealthAnalysis;
      return `${coreBlock}

DOMAIN: Wealth
wealth_pattern: ${w?.wealthPattern ?? '—'}
income_sources: ${w?.incomeSources?.join(', ') ?? '—'}
favorable_periods: ${w?.favorablePeriods?.join(', ') ?? '—'}
cautionary_periods: ${w?.cautionaryPeriods?.join(', ') ?? '—'}

${disciplineNote}${luckPillarsCaveat}`;
    }
    case 'relationship': {
      const r = reading.relationships as RelationshipAnalysis;
      return `${coreBlock}

DOMAIN: Relationship
interpersonal_dynamics: ${r?.interpersonalDynamics ?? '—'}
best_elements: ${r?.compatibility?.bestElements?.join(', ') ?? '—'}
challenging_elements: ${r?.compatibility?.challengingElements?.join(', ') ?? '—'}

${disciplineNote}${luckPillarsCaveat}`;
    }
    case 'health': {
      const h = reading.health as HealthAnalysis;
      return `${coreBlock}

DOMAIN: Health (constitution only; not medical diagnosis)
constitution: ${h?.constitution ?? '—'}
favorable_practices: ${h?.favorablePractices?.join(', ') ?? '—'}
wellness_advice: ${h?.wellnessAdvice?.join(', ') ?? '—'}

${disciplineNote}${luckPillarsCaveat}`;
    }
    case 'timing_period': {
      const lc = state.luck_cycle;
      const cyclesSummary =
        reading.luckCycles
          ?.slice(0, 4)
          ?.map(
            (c) =>
              `Age ${c.startAge}-${c.endAge}: ${c.heavenlyStem} ${c.earthlyBranch} (${c.element}), ${c.overallInfluence}`
          )
          ?.join('; ') ?? '—';
      return `${coreBlock}

DOMAIN: Timing by period (Luck Cycle / Da Yun)
current_luck_cycle: ${lc ? `${lc.current} (${lc.period})` : '—'}
luck_cycles_summary: ${cyclesSummary}

${disciplineNote}${luckPillarsCaveat}`;
    }
    case 'general':
    default: {
      return `${coreBlock}

DOMAIN: General. If the user did not specify a domain, you may ask once: "Which area—life direction, career, wealth, relationships, health, or timing by period—would you like to focus on?"

${disciplineNote}${luckPillarsCaveat}`;
    }
  }
}
