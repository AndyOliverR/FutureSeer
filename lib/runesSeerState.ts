/**
 * Rune Divination Seer State and Slice.
 * Runes reveal the nature of forces at play, not the certainty of results.
 * Rule: Runes describe forces and consequences, not guarantees or timelines.
 */

import type { RuneReading } from '@/lib/runesIntelligence';

export interface RuneStateRune {
  name: string;
  position: string;
  orientation: 'upright' | 'reversed';
}

export interface RuneState {
  question_context: string;
  spread_type: string;
  runes: RuneStateRune[];
}

export type RuneQuestionType =
  | 'energy_active'
  | 'cautious_about'
  | 'aligned_disruptive'
  | 'consequence_now'
  | 'general'
  | 'refusal';

/** Max runes for interpretation (expert: 1–3 runes). */
const MAX_RUNES_FOR_SLICE = 3;

/**
 * Build RuneState from RuneReading. Uses first 1–3 runes only.
 */
export function buildRuneState(reading: RuneReading): RuneState {
  const runes = reading?.runes ?? [];
  if (!reading || runes.length === 0) {
    throw new Error(
      'Rune divination requires a cast reading. Cast runes first to use Ask the Seer.'
    );
  }

  const runesSlice = runes.slice(0, MAX_RUNES_FOR_SLICE).map((r) => ({
    name: r.name,
    position: r.position ?? 'unknown',
    orientation: r.isReversed ? ('reversed' as const) : ('upright' as const),
  }));

  return {
    question_context: (reading.question ?? '').trim(),
    spread_type: reading.spreadType ?? reading.spreadName ?? 'unknown',
    runes: runesSlice,
  };
}

/**
 * Classify Rune question. Refuse timing, guarantees, "will I succeed", repeated casts.
 */
export function classifyRuneQuestion(question: string): RuneQuestionType {
  const lower = question.toLowerCase().trim();

  if (
    /\b(will i succeed|when will (this|it) happen|is this guaranteed|will (this|it) (definitely|certainly)|predict (the )?future|exact (date|time)|when exactly)\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }
  if (
    /\b(what energy (is )?(active|at play)|what (forces|energy) (surround|surrounds)|what (is )?the energy)\b/.test(
      lower
    )
  ) {
    return 'energy_active';
  }
  if (
    /\b(what should i (be )?(cautious|careful) about|what (to )?be (cautious|careful) about|what (to )?watch (out )?for)\b/.test(
      lower
    )
  ) {
    return 'cautious_about';
  }
  if (
    /\b(is (this )?(action|move) (aligned|disruptive)|(aligned|disruptive)|should i (proceed|act)|is this (aligned|disruptive))\b/.test(
      lower
    )
  ) {
    return 'aligned_disruptive';
  }
  if (
    /\b(what (is )?(the )?consequence (of )?(acting )?now|consequence of (acting )?now|likely consequence)\b/.test(
      lower
    )
  ) {
    return 'consequence_now';
  }
  if (
    /\b(what (does|do) (the )?rune|interpret|guidance|what (should|can) i (be )?mindful)\b/.test(
      lower
    )
  ) {
    return 'general';
  }

  return 'general';
}

/** Short function mapping (no mythology). */
const RUNE_FUNCTION: Record<string, string> = {
  Fehu: 'resources, gain, movement of value',
  Uruz: 'strength, vitality, raw power',
  Thurisaz: 'thorn, protection, boundary, gateway',
  Ansuz: 'communication, wisdom, divine message',
  Raidho: 'direction, alignment, journey',
  Kenaz: 'fire, knowledge, creativity',
  Gebo: 'gift, partnership, exchange',
  Wunjo: 'joy, harmony, fellowship',
  Hagalaz: 'disruption, unavoidable change',
  Naudhiz: 'need, necessity, constraint',
  Isa: 'pause, freeze, restraint',
  Jera: 'harvest, cycle, reward in time',
  Eihwaz: 'endurance, transformation, protection',
  Perthro: 'mystery, fate, hidden knowledge',
  Algiz: 'protection, sanctuary, defense',
  Sowilo: 'clarity, success through alignment',
  Tiwaz: 'justice, honor, sacrifice',
  Berkano: 'growth, nurture, new beginnings',
  Ehwaz: 'partnership, movement, trust',
  Mannaz: 'humanity, community, self',
  Laguz: 'flow, intuition, water',
  Ingwaz: 'potential, fertility, internal growth',
  Dagaz: 'breakthrough, day, transformation',
  Othala: 'heritage, legacy, home',
};

/** Warning vs support (disruptive runes = caution, not "bad"). */
const RUNE_WEIGHT: Record<string, 'supportive' | 'neutral' | 'disruptive'> = {
  Hagalaz: 'disruptive',
  Naudhiz: 'disruptive',
  Isa: 'disruptive',
  Thurisaz: 'disruptive',
  Fehu: 'supportive',
  Sowilo: 'supportive',
  Wunjo: 'supportive',
  Gebo: 'supportive',
  Jera: 'supportive',
  Berkano: 'supportive',
  Ansuz: 'neutral',
  Raidho: 'neutral',
  Kenaz: 'neutral',
  Eihwaz: 'neutral',
  Perthro: 'neutral',
  Algiz: 'neutral',
  Tiwaz: 'neutral',
  Ehwaz: 'neutral',
  Mannaz: 'neutral',
  Laguz: 'neutral',
  Ingwaz: 'neutral',
  Dagaz: 'neutral',
  Othala: 'neutral',
  Uruz: 'neutral',
};

/**
 * Build slice for system prompt: rune state, primary→position→orientation, warning vs support, action framing, permanent rule.
 */
export function getRunesSliceForQuestionType(
  questionType: RuneQuestionType,
  state: RuneState,
  _reading: RuneReading
): string {
  if (questionType === 'refusal') {
    return 'Refuse with: "Runes indicate forces and consequences, not fixed outcomes." or "Runes should not be repeatedly cast for the same question without a change in circumstances."';
  }

  const runeLines = state.runes
    .map((r) => {
      const func = RUNE_FUNCTION[r.name] ?? 'guidance, transformation';
      const weight = RUNE_WEIGHT[r.name] ?? 'neutral';
      return `- ${r.name}: position ${r.position}, ${r.orientation}; function: ${func}; tone: ${weight}`;
    })
    .join('\n');

  const stateBlock = `
RUNE STATE (use this only):
- Question context: ${state.question_context}
- Spread type: ${state.spread_type}
- Runes (1–3; primary first):
${runeLines}
`.trim();

  const priorityBlock = `
RUNES PRIORITY (strict order):
1. Primary rune (first listed) → dominant force.
2. Position meaning → role of the force (e.g. present, challenge, outcome).
3. Orientation → upright = flow; reversed = blockage or caution.
4. Supporting runes → modifiers. Do not stack meanings; keep interpretation focused.
`.trim();

  const warningBlock = `
WARNING VS SUPPORT (critical):
- Supportive runes = aligned energy, proceed with awareness.
- Disruptive runes = caution / disruption / correction; they do NOT mean "bad"—they mean "do not proceed blindly."
- Neutral runes = context-dependent. State explicitly: "This rune signals caution / disruption / correction" when relevant.
`.trim();

  const actionBlock = `
ACTION FRAMING (required; one clear stance):
- Proceed → aligned energy.
- Proceed with caution → mixed forces.
- Pause / wait → obstruction or disruption.
- Adjust approach → misalignment, not denial.
End with one clear stance. No ambiguity.
`.trim();

  const disciplineBlock = `
DISCIPLINE (non-negotiable):
- Focus on function + context, not myth or long stories.
- No timing, no guarantees, no "when will this happen."
- Answer direct, grounded, non-mystical. Example: "Raidho suggests movement and direction, but Hagalaz as the challenge warns that disruption may force an unexpected adjustment before progress stabilizes."
- Permanent rule: Runes reveal the nature of forces at play, not the certainty of results.
`.trim();

  const fewRunes = state.runes.length < 2;
  const unclearPosition = state.runes.some(
    (r) => !r.position || r.position.trim() === '' || r.position.toLowerCase() === 'unknown'
  );
  const fewOrUnclear = fewRunes || unclearPosition;
  const caveat = fewOrUnclear
    ? '\n\nRunes or positions are few or unclear; keep guidance general, not absolute.'
    : '';

  return `${stateBlock}

${priorityBlock}

${warningBlock}

${actionBlock}

${disciplineBlock}${caveat}`;
}
