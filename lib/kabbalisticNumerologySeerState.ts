/**
 * Kabbalistic Numerology Seer State and Slice.
 * Rule: Kabbalistic Numerology explains the inner reason behind life patterns, not the outer results.
 * Soul-path and correction system—inner alignment, not prediction.
 */

export type HarmonyStatus = 'aligned' | 'partially_aligned' | 'misaligned';

export interface KabbalisticState {
  full_name: string;
  hebrew_equivalent: string[];
  core_soul_number: number;
  correction_number: number;
  name_vibration: number;
  harmony_status: HarmonyStatus;
}

export type KabbalisticQuestionType =
  | 'soul_lesson'
  | 'pattern_repetition'
  | 'name_alignment'
  | 'inner_correction'
  | 'general'
  | 'refusal';

/** Payload: analysis with chart.nameAnalysis (soulNumber, destinyNumber, personalityNumber, totalValue, hebrewName, letters). */
export interface KabbalisticAnalysisPayload {
  chart?: {
    nameAnalysis?: {
      fullName?: string;
      hebrewName?: string;
      letters?: Array<{ name?: string; letter?: string }>;
      soulNumber?: number;
      destinyNumber?: number;
      personalityNumber?: number;
      totalValue?: number;
      reducedValue?: number;
    };
  };
  nameAnalysis?: {
    fullName?: string;
    hebrewName?: string;
    letters?: Array<{ name?: string; letter?: string }>;
    soulNumber?: number;
    destinyNumber?: number;
    personalityNumber?: number;
    totalValue?: number;
    reducedValue?: number;
  };
}

const MASTER_SOUL_NUMBERS = [11, 22, 33];
const MASTER_TO_CORRECTION: Record<number, number> = { 11: 2, 22: 4, 33: 6 };

function reduceToSingleDigit(n: number): number {
  if (n <= 0 || n > 9) return ((n - 1) % 9) + 1;
  return n;
}

/**
 * Build KabbalisticState from analysis payload. Requires chart.nameAnalysis.
 */
export function buildKabbalisticState(payload: KabbalisticAnalysisPayload): KabbalisticState {
  const chart = payload.chart;
  const nameAnalysis = chart?.nameAnalysis ?? payload.nameAnalysis;
  if (!chart?.nameAnalysis && !nameAnalysis) {
    throw new Error(
      'Kabbalistic Numerology requires name analysis. Generate your Kabbalistic analysis first to use Ask the Seer.'
    );
  }
  const na = nameAnalysis!;
  const full_name = na.fullName ?? '';
  const letters = na.letters ?? [];
  const hebrew_equivalent = letters.map((l) => l.name ?? l.letter ?? '').filter(Boolean);
  const core_soul_number = na.soulNumber ?? 0;
  const correction_number = MASTER_SOUL_NUMBERS.includes(core_soul_number)
    ? (MASTER_TO_CORRECTION[core_soul_number] ?? reduceToSingleDigit(core_soul_number))
    : core_soul_number;
  const name_vibration = na.totalValue ?? 0;

  // Harmony: compare soul number with reduced name vibration
  const reducedVibration = name_vibration > 0 ? reduceToSingleDigit(name_vibration) : 0;
  const soulReduced = core_soul_number > 9 ? reduceToSingleDigit(core_soul_number) : core_soul_number;
  const diff = Math.abs(soulReduced - reducedVibration);
  let harmony_status: HarmonyStatus = 'partially_aligned';
  if (diff === 0 || (soulReduced === reducedVibration)) {
    harmony_status = 'aligned';
  } else if (diff >= 3) {
    harmony_status = 'misaligned';
  }

  return {
    full_name,
    hebrew_equivalent,
    core_soul_number,
    correction_number,
    name_vibration,
    harmony_status,
  };
}

/**
 * Classify Kabbalistic question. Refusal: timing, prediction, external outcomes. Valid: soul lesson, pattern, name alignment, inner correction, general.
 */
export function classifyKabbalisticQuestion(question: string): KabbalisticQuestionType {
  const lower = question.toLowerCase().trim();

  if (
    /\b(when will|what date|how long|when (should|can)|by when|until when)\b/.test(lower)
  ) {
    return 'refusal';
  }
  if (
    /\b(will i succeed|will this happen|is this lucky|will i get|will (he|she|they)|predict|outcome|result)\b/.test(lower)
  ) {
    return 'refusal';
  }
  if (
    /\b(should i do .* tomorrow|will i get the job|will (we|they) (agree|accept)|will it work out)\b/.test(lower)
  ) {
    return 'refusal';
  }

  if (
    /\b(soul (lesson|number|path|purpose)|why (do i|does (my )?life)|inner (lesson|meaning)|spiritual (lesson|path))\b/.test(lower)
  ) {
    return 'soul_lesson';
  }
  if (
    /\b(pattern|repetition|why (do i keep|does (this|it) repeat)|same (thing|situation)|cycle)\b/.test(lower)
  ) {
    return 'pattern_repetition';
  }
  if (
    /\b(name (alignment|vibration|harmony|match)|(my )?name (and|with) (soul|number)|hebrew (name|letters))\b/.test(lower)
  ) {
    return 'name_alignment';
  }
  if (
    /\b(inner (correction|work|alignment)|(how to )?align|balance (my )?(soul|name)|correction number|master number)\b/.test(lower)
  ) {
    return 'inner_correction';
  }
  if (
    /\b(kabbalah|gematria|soul|destiny|personality|number|hebrew|tree of life|sephira)\b/.test(lower)
  ) {
    return 'general';
  }

  return 'general';
}

/** Mandatory refusal phrase. */
export const KABBALISTIC_REFUSAL_PHRASE =
  'This system addresses inner alignment, not external outcomes.';

/**
 * Build slice for system prompt: state, soul supremacy, name harmony, repetition framing, allowed/forbidden, permanent rule.
 */
export function getKabbalisticSliceForQuestionType(
  questionType: KabbalisticQuestionType,
  state: KabbalisticState
): string {
  if (questionType === 'refusal') {
    return `Refuse with: "${KABBALISTIC_REFUSAL_PHRASE}" Do not give timing, predictions, or external outcome guarantees. Kabbalistic Numerology explains inner cause, not outer events.`;
  }

  const stateBlock = `
KABBALISTIC STATE (use this only):
- Full name: ${state.full_name}
- Hebrew equivalent (letter names): ${state.hebrew_equivalent.length ? state.hebrew_equivalent.join(', ') : 'n/a'}
- Core soul number: ${state.core_soul_number}
- Correction number: ${state.correction_number}
- Name vibration (total gematria): ${state.name_vibration}
- Harmony status: ${state.harmony_status}
`.trim();

  const soulSupremacyBlock = `
SOUL NUMBER SUPREMACY:
- Your soul number overrides all other numbers. Anchor every answer to the soul number.
- Master numbers (11, 22, 33) are demanding; the correction number (${state.correction_number}) defines the inner work.
`.trim();

  const harmonyLine =
    state.harmony_status === 'aligned'
      ? 'Name vibration supports the soul number; acknowledge this support in your answer.'
      : state.harmony_status === 'misaligned'
        ? 'Name and soul show inner friction; frame this as an area for awareness and integration, not bad luck.'
        : 'Name and soul are partially aligned; speak to both support and areas of integration.';
  const nameHarmonyBlock = `
NAME-TO-SOUL HARMONY:
- ${harmonyLine}
`.trim();

  const repetitionBlock = `
REPETITION PATTERN FRAMING:
- Repetition = unintegrated lesson, not bad luck. Do not predict when it will stop; focus on what the soul is learning.
`.trim();

  const allowedBlock = `
ALLOWED OUTPUTS:
- Awareness focus, inner discipline, balance themes, reflection prompts.
- Soul lesson, pattern meaning, name-soul relationship, correction work.
`.trim();

  const forbiddenBlock = `
FORBIDDEN:
- Behavioral commands ("do X tomorrow"), predictions, external guarantees, timing.
- "You will succeed", "This will happen", "When it will change".
`.trim();

  const disciplineBlock = `
PERMANENT RULE:
Kabbalistic Numerology explains the inner reason behind life patterns, not the outer results.
`.trim();

  return `${stateBlock}

${soulSupremacyBlock}

${nameHarmonyBlock}

${repetitionBlock}

${allowedBlock}

${forbiddenBlock}

${disciplineBlock}`;
}
