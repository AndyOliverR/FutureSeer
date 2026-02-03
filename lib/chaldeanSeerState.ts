/**
 * Chaldean Seer State Store and Slice Selector.
 * Builds normalized Chaldean numerology state and returns only the slice
 * relevant for expert reasoning: vibration-based, not outcome-based.
 */

import { calcPersonalYear } from '@/lib/numerology/personalYear';
import { calcDriver } from '@/lib/numerology/driverConductor';
import { getFavorables } from '@/lib/numerology/favorables';
import { detectKarmicDebtNumbers } from '@/lib/numerology/karmicDebt';

export type ChaldeanQuestionType =
  | 'name_branding'
  | 'compatibility'
  | 'cycle_year'
  | 'decision_alignment'
  | 'correction_remedy'
  | 'life_path'
  | 'expression'
  | 'soul_urge'
  | 'personality'
  | 'destiny'
  | 'personal_year'
  | 'general'
  | 'refusal';

export interface ChaldeanState {
  birth_number: number | null;
  life_path: number | null;
  destiny_number: number | null;
  name_vibration: number | null;
  soul_urge: number | null;
  personality: number | null;
  compound_meaning: string | null;
  personal_year: number | null;
  favorable_numbers: number[];
  challenging_numbers: number[];
  dominant_planet: string | null;
  favorable_days: string[];
}

const NUMBER_TO_PLANET: Record<number, string> = {
  1: 'Sun',
  2: 'Moon',
  3: 'Jupiter',
  4: 'Rahu',
  5: 'Mercury',
  6: 'Venus',
  7: 'Ketu',
  8: 'Saturn',
  9: 'Mars',
  11: 'Moon (master)',
  22: 'Saturn (master)',
};

type NumerologyDataInput = {
  lifePathNumber?: number;
  life_path_number?: number;
  life_path?: number;
  expressionNumber?: number;
  expression_number?: number;
  soulUrgeNumber?: number;
  soul_urge?: number;
  soul_number?: number;
  personalityNumber?: number;
  personality_number?: number;
  destinyNumber?: number;
  destiny_number?: number;
  birthdayNumber?: number;
  birthday_number?: number;
  maturityNumber?: number;
  maturity_number?: number;
  personalYearNumber?: number;
  personal_year_number?: number;
};

/**
 * Build Chaldean state from numerology data and user profile.
 * Uses only passed-in numbers; does not recompute core numbers silently.
 */
export function buildChaldeanState(
  numerologyData: NumerologyDataInput | null | undefined,
  userProfile: { birthDate?: string } | null | undefined,
  comprehensiveReport?: { profileOverview?: string } | null
): ChaldeanState {
  const birthDate = userProfile?.birthDate || '';

  const life_path =
    numerologyData?.lifePathNumber ??
    numerologyData?.life_path_number ??
    numerologyData?.life_path ??
    null;
  const name_vibration =
    numerologyData?.expressionNumber ??
    numerologyData?.expression_number ??
    null;
  const destiny_number =
    numerologyData?.destinyNumber ?? numerologyData?.destiny_number ?? null;
  const soul_urge =
    numerologyData?.soulUrgeNumber ??
    numerologyData?.soul_urge ??
    numerologyData?.soul_number ??
    null;
  const personality =
    numerologyData?.personalityNumber ?? numerologyData?.personality_number ?? null;
  const birth_number =
    numerologyData?.birthdayNumber ?? numerologyData?.birthday_number ?? null;
  const personal_year =
    numerologyData?.personalYearNumber ??
    numerologyData?.personal_year_number ??
    (birthDate ? calcPersonalYear(birthDate) : null);

  const driverResult = birthDate ? calcDriver(birthDate) : { reduced: null };
  const driverReduced = driverResult.reduced ?? life_path;
  const favorables = getFavorables(driverReduced);
  const favorable_numbers: number[] = [];
  if (driverReduced != null && driverReduced >= 1 && driverReduced <= 9) {
    favorable_numbers.push(driverReduced);
  }
  if (life_path != null && life_path !== driverReduced && (life_path <= 9 || life_path === 11 || life_path === 22)) {
    favorable_numbers.push(life_path);
  }
  if (favorable_numbers.length === 0 && life_path != null) {
    favorable_numbers.push(life_path);
  }

  const challenging_numbers = detectKarmicDebtNumbers([
    life_path ?? undefined,
    destiny_number ?? undefined,
    soul_urge ?? undefined,
    birth_number ?? undefined,
  ]);

  const dominant_planet =
    life_path != null ? NUMBER_TO_PLANET[life_path] ?? null : null;

  return {
    birth_number: birth_number ?? null,
    life_path: life_path ?? null,
    destiny_number: destiny_number ?? null,
    name_vibration: name_vibration ?? null,
    soul_urge: soul_urge ?? null,
    personality: personality ?? null,
    compound_meaning: comprehensiveReport?.profileOverview ?? null,
    personal_year: personal_year ?? null,
    favorable_numbers: [...new Set(favorable_numbers)],
    challenging_numbers,
    dominant_planet,
    favorable_days: favorables?.days ?? [],
  };
}

/**
 * Classify Chaldean question type. Returns 'refusal' for exact timing,
 * medical, legal, wealth certainty, marriage date, etc.
 */
export function classifyChaldeanQuestion(question: string): ChaldeanQuestionType {
  const lower = question.toLowerCase().trim();

  // Refusals: exact date, marriage date, medical, legal, wealth certainty, death, long-term fate
  if (
    /exact\s+date|when\s+exactly|precise\s+timing|when\s+will\s+i\s+(die|get\s+married|marry)|marriage\s+date|wedding\s+date|will\s+i\s+become\s+rich|when\s+will\s+i\s+be\s+rich|exact\s+marriage|life\s+(in|like|be)\s+\d+\s+years|in\s+\d+\s+years|long\s+term\s+fate|when\s+will\s+i\s+die|medical|legal\s+claim|guarantee|certainty|predict\s+exact/.test(
      lower
    )
  ) {
    return 'refusal';
  }

  // Name / branding
  if (
    /name\s+(vibration|spelling|change|branding|business\s+name|brand)|rename|spelling\s+adjustment/.test(
      lower
    )
  ) {
    return 'name_branding';
  }

  // Compatibility
  if (
    /compatibility|compatible|match|partner|person\s+and\s+product|business\s+partner|relationship\s+number/.test(
      lower
    )
  ) {
    return 'compatibility';
  }

  // Cycle / year
  if (
    /personal\s+year|current\s+year|this\s+year|year\s+cycle|cycle|current\s+cycle/.test(
      lower
    )
  ) {
    return 'cycle_year';
  }

  // Decision alignment (should I, launch, choose)
  if (
    /should\s+i|launch|choose|decision|whether\s+to|right\s+time\s+to|when\s+to\s+start|initiat/.test(
      lower
    )
  ) {
    return 'decision_alignment';
  }

  // Correction / remedy
  if (
    /remedy|remedies|solution|fix|improve|balance|alignment\s+action|correct|strengthen/.test(
      lower
    )
  ) {
    return 'correction_remedy';
  }

  // Life path
  if (
    /life\s*path|life\s+path\s+number|birth\s*number|date\s*number|core\s+vibration/.test(
      lower
    )
  ) {
    return 'life_path';
  }

  // Expression (name number)
  if (
    /expression|name\s+number|destiny\s+number|name\s+value|expression\s+number/.test(
      lower
    )
  ) {
    return 'expression';
  }

  // Soul urge
  if (
    /soul\s*urge|soul\s+urge|heart\s+desire|inner\s+desire|soul\s+number/.test(
      lower
    )
  ) {
    return 'soul_urge';
  }

  // Personality
  if (
    /personality|how\s+others\s+see|outer\s+self|personality\s+number/.test(
      lower
    )
  ) {
    return 'personality';
  }

  // Destiny
  if (
    /destiny|life\s+purpose|ultimate\s+purpose|destiny\s+number/.test(lower)
  ) {
    return 'destiny';
  }

  // Personal year (already cycle_year; keep for specificity)
  if (/personal\s+year\s+number|my\s+personal\s+year/.test(lower)) {
    return 'personal_year';
  }

  return 'general';
}

/**
 * Build slice for system prompt: only what's relevant to the question type.
 * Hierarchy: Life Path > Name vibration > Birth number > Personal year.
 */
export function getChaldeanSliceForQuestionType(
  questionType: ChaldeanQuestionType,
  state: ChaldeanState
): string {
  if (questionType === 'refusal') {
    return '';
  }

  const lines: string[] = [];
  lines.push('# Chaldean numerology state (use only these to answer)');
  lines.push('');
  lines.push(
    '## Number hierarchy (strict priority): Life Path > Name vibration > Birth number > Personal year. Resolve conflicts by this order.'
  );
  lines.push('');

  const hasCore =
    state.life_path != null ||
    state.name_vibration != null ||
    state.destiny_number != null;

  if (!hasCore) {
    lines.push('(Missing core numbers. User may need to generate their numerology report first.)');
    return lines.join('\n').trim();
  }

  // Core numbers (always include when present)
  lines.push('## Core numbers');
  if (state.life_path != null) {
    lines.push(
      `- Life Path: ${state.life_path}${state.life_path === 11 || state.life_path === 22 ? ' (Master)' : ''}`
    );
  }
  if (state.name_vibration != null) {
    lines.push(
      `- Name vibration (Expression): ${state.name_vibration}${state.name_vibration === 11 || state.name_vibration === 22 ? ' (Master)' : ''}`
    );
  }
  if (state.destiny_number != null) {
    lines.push(
      `- Destiny: ${state.destiny_number}${state.destiny_number === 11 || state.destiny_number === 22 ? ' (Master)' : ''}`
    );
  }
  if (state.soul_urge != null) {
    lines.push(
      `- Soul Urge: ${state.soul_urge}${state.soul_urge === 11 || state.soul_urge === 22 ? ' (Master)' : ''}`
    );
  }
  if (state.personality != null) {
    lines.push(
      `- Personality: ${state.personality}${state.personality === 11 || state.personality === 22 ? ' (Master)' : ''}`
    );
  }
  if (state.birth_number != null) {
    lines.push(`- Birth number: ${state.birth_number}`);
  }
  if (state.compound_meaning) {
    lines.push(`- Compound meaning: ${state.compound_meaning}`);
  }
  lines.push('');

  // Personal year (for cycle_year, decision_alignment)
  if (
    (questionType === 'cycle_year' ||
      questionType === 'decision_alignment' ||
      questionType === 'personal_year') &&
    state.personal_year != null
  ) {
    lines.push('## Current cycle');
    lines.push(
      `- Personal Year: ${state.personal_year}${state.personal_year === 11 || state.personal_year === 22 ? ' (Master)' : ''}`
    );
    lines.push('');
  }

  // Favorable / challenging (for correction_remedy, cycle_year)
  if (
    (questionType === 'correction_remedy' || questionType === 'cycle_year') &&
    (state.favorable_numbers.length > 0 ||
      state.challenging_numbers.length > 0 ||
      state.favorable_days.length > 0)
  ) {
    lines.push('## Alignment data');
    if (state.favorable_numbers.length > 0) {
      lines.push(`- Favorable numbers: ${state.favorable_numbers.join(', ')}`);
    }
    if (state.favorable_days.length > 0) {
      lines.push(`- Favorable days: ${state.favorable_days.join(', ')}`);
    }
    if (state.challenging_numbers.length > 0) {
      lines.push(
        `- Challenging (karmic) numbers: ${state.challenging_numbers.join(', ')}`
      );
    }
    if (state.dominant_planet) {
      lines.push(`- Dominant planet: ${state.dominant_planet}`);
    }
    lines.push('');
  }

  return lines.join('\n').trim();
}
