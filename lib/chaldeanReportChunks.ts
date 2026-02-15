/**
 * Chaldean report: mandatory shape for timing and validation (favorable_dates,
 * current_cycle, core_numbers, strengths, challenges). Used by Seer and Main Seer.
 */

import type { ChaldeanState } from './chaldeanSeerState';

/** Day-of-month (1–31) that reduce to this digit (1–9). */
const DATES_BY_DIGIT: Record<number, number[]> = {
  1: [1, 10, 19, 28],
  2: [2, 11, 20, 29],
  3: [3, 12, 21, 30],
  4: [4, 13, 22, 31],
  5: [5, 14, 23],
  6: [6, 15, 24],
  7: [7, 16, 25],
  8: [8, 17, 26],
  9: [9, 18, 27],
};

function reduceDayOfMonth(day: number): number {
  if (day >= 1 && day <= 9) return day;
  let n = day;
  while (n > 9) {
    n = String(n)
      .split('')
      .reduce((a, b) => a + parseInt(b, 10), 0);
  }
  return n;
}

/** Derive favorable day-of-month dates (e.g. 1, 5, 14, 23) from favorable single-digit numbers. */
export function deriveFavorableDates(favorableNumbers: number[]): number[] {
  const digits = new Set<number>();
  for (const n of favorableNumbers) {
    const d = n === 11 ? 2 : n === 22 ? 4 : n <= 9 ? n : reduceDayOfMonth(n);
    if (d >= 1 && d <= 9) digits.add(d);
  }
  const dates: number[] = [];
  for (const d of digits) {
    const list = DATES_BY_DIGIT[d];
    if (list) dates.push(...list);
  }
  return [...new Set(dates)].sort((a, b) => a - b);
}

export const PERSONAL_YEAR_THEMES: Record<number, string> = {
  1: 'New beginnings, independence, leadership',
  2: 'Partnership, cooperation, patience',
  3: 'Creativity, expression, joy',
  4: 'Structure, discipline, building',
  5: 'Change, freedom, expansion',
  6: 'Responsibility, family, harmony',
  7: 'Reflection, spirituality, analysis',
  8: 'Achievement, authority, material results',
  9: 'Completion, compassion, release',
  11: 'Inspiration, intuition, higher vision',
  22: 'Master builder, large-scale manifestation',
};

/** Personal years that support new beginnings (initiation, launch). */
export const SUPPORTS_NEW_BEGINNINGS_YEARS = new Set([1, 3, 5, 8]);

export function getCurrentCycleFromPersonalYear(personalYear: number | null): ChaldeanReportCurrentCycle {
  if (personalYear == null) {
    return { theme: 'Current cycle from your core numbers', supports_new_beginnings: false };
  }
  const reduced = personalYear <= 9 ? personalYear : reduceDayOfMonth(personalYear);
  const theme = PERSONAL_YEAR_THEMES[personalYear] ?? PERSONAL_YEAR_THEMES[reduced] ?? 'Current cycle from your core numbers';
  const supports_new_beginnings = SUPPORTS_NEW_BEGINNINGS_YEARS.has(reduced) || SUPPORTS_NEW_BEGINNINGS_YEARS.has(personalYear);
  return { theme, supports_new_beginnings };
}

export interface ChaldeanReportCoreNumbers {
  name_number: number | null;
  destiny_number: number | null;
  soul_number: number | null;
}

export interface ChaldeanReportCurrentCycle {
  theme: string;
  supports_new_beginnings: boolean;
}

export interface ChaldeanReport {
  core_numbers: ChaldeanReportCoreNumbers;
  strengths: string[];
  challenges: string[];
  favorable_numbers: number[];
  unfavorable_numbers: number[];
  favorable_days: string[];
  favorable_dates: number[];
  current_cycle: ChaldeanReportCurrentCycle;
}

/**
 * Build ChaldeanReport from ChaldeanState and optional comprehensive report.
 */
export function stateToChaldeanReport(
  state: ChaldeanState,
  comprehensiveReport?: { profileOverview?: string; challengesAndOpportunities?: { challenges?: string[]; opportunities?: string[] } } | null
): ChaldeanReport {
  const favorable_dates = deriveFavorableDates(state.favorable_numbers);
  const current_cycle = getCurrentCycleFromPersonalYear(state.personal_year ?? null);

  const strengths: string[] = [];
  const challenges: string[] = [];
  if (comprehensiveReport?.challengesAndOpportunities) {
    const co = comprehensiveReport.challengesAndOpportunities;
    if (co.opportunities?.length) strengths.push(...co.opportunities);
    if (co.challenges?.length) challenges.push(...co.challenges);
  }
  if (strengths.length === 0 && state.compound_meaning) {
    strengths.push(state.compound_meaning);
  }

  return {
    core_numbers: {
      name_number: state.name_vibration,
      destiny_number: state.destiny_number,
      soul_number: state.soul_urge,
    },
    strengths,
    challenges,
    favorable_numbers: state.favorable_numbers,
    unfavorable_numbers: state.challenging_numbers,
    favorable_days: state.favorable_days,
    favorable_dates,
    current_cycle,
  };
}
