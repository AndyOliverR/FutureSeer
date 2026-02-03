/**
 * Sortilege Seer State and Slice.
 * Rule: Sortilege reveals direction through chance, not certainty or causality.
 */

import type { SortilegeReading, CastResult, CastingMethod } from './sortilegeIntelligence';

export type SortilegeValidity = 'valid' | 'invalid';

export type SortilegeOrientation =
  | 'supportive'
  | 'obstructed'
  | 'conditional'
  | 'neutral';

/** Method-specific cast result for auditable state. */
export type SortilegeCastResult =
  | { dice: [number, number]; inside_circle: boolean }
  | { stones: Array<{ symbol: string }> }
  | { cards: Array<{ symbol: string; orientation: number }> }
  | { coins: Array<{ symbol: string }> }
  | { sticks: Array<{ symbol: string }> };

export interface SortilegeState {
  question: string;
  method: CastingMethod;
  validity: SortilegeValidity;
  cast_result: SortilegeCastResult;
  symbolic_value: number;
  orientation: SortilegeOrientation;
  interpretation_primary: string;
}

export type SortilegeQuestionType =
  | 'yes_no'
  | 'directional'
  | 'alignment'
  | 'conditional'
  | 'interpretation'
  | 'general'
  | 'refusal';

/** Refusal phrase for missing reading. */
export const SORTILEGE_REFUSAL_DATA_PHRASE =
  'Sortilege insights require a reading. Generate a sortilege reading first.';

/** Refusal phrase for unsafe questions. */
export const SORTILEGE_REFUSAL_SAFETY_PHRASE =
  'Sortilege is not designed to answer this safely or responsibly. Sortilege offers directional guidance through chance, not explanation or prediction.';

/** Refusal when cast does not meet validity conditions. */
export const SORTILEGE_REFUSAL_INVALID_CAST =
  'This cast does not meet validity conditions. Please recast later.';

/** Refusal when user asks to repeat for same question. */
export const SORTILEGE_REFUSAL_REPEAT =
  'Sortilege should not be repeated for the same question.';

/** Mandatory disclaimer for every response. */
export const SORTILEGE_MANDATORY_DISCLAIMER =
  'This guidance is directional only, drawn from the cast. It is not a prediction, certainty, or substitute for your own judgment.';

// --- Validity gates ---

function isDiceValid(cast: CastResult['cast']): boolean {
  return cast.insideCircle === 2;
}

function isStonesValid(cast: CastResult['cast']): boolean {
  return cast.objects.length >= 1;
}

function isCardsValid(cast: CastResult['cast']): boolean {
  const n = cast.objects.length;
  return n >= 1 && n <= 3;
}

function isCoinsValid(cast: CastResult['cast']): boolean {
  return cast.objects.length === 3;
}

function isSticksValid(cast: CastResult['cast']): boolean {
  return cast.objects.length >= 1;
}

export function getSortilegeValidity(reading: SortilegeReading): SortilegeValidity {
  const cast = reading.castResult?.cast;
  if (!cast || !reading.castResult) return 'invalid';
  const method = reading.method;
  switch (method) {
    case 'dice':
      return isDiceValid(cast) ? 'valid' : 'invalid';
    case 'stones':
      return isStonesValid(cast) ? 'valid' : 'invalid';
    case 'cards':
      return isCardsValid(cast) ? 'valid' : 'invalid';
    case 'coins':
      return isCoinsValid(cast) ? 'valid' : 'invalid';
    case 'sticks':
      return isSticksValid(cast) ? 'valid' : 'invalid';
    default:
      return 'invalid';
  }
}

// --- Orientation from cast/interpretation ---

function deriveOrientation(
  reading: SortilegeReading,
  validity: SortilegeValidity
): SortilegeOrientation {
  if (validity !== 'valid') return 'neutral';
  const cast = reading.castResult.cast;
  const primary = (reading.castResult.interpretation?.primary || '').toLowerCase();

  if (reading.method === 'dice') {
    const insideCircle = cast.insideCircle ?? 0;
    const total =
      typeof cast.totalValue === 'number'
        ? cast.totalValue
        : cast.objects.reduce(
            (s, o) => s + (typeof o.value === 'number' ? o.value : 0),
            0
          );
    if (insideCircle === 2 && total >= 7 && total <= 9) return 'supportive';
    if (insideCircle === 2 && total >= 4 && total <= 6) return 'conditional';
    if (insideCircle === 2) return 'supportive';
    if (insideCircle === 1) return 'conditional';
    return 'obstructed';
  }

  if (
    /\b(support|favorable|aligned|yes|proceed|positive|harmony|success)\b/.test(
      primary
    )
  ) {
    return 'supportive';
  }
  if (
    /\b(obstruct|unfavorable|challenge|no|restraint|caution|reconsider)\b/.test(
      primary
    )
  ) {
    return 'obstructed';
  }
  if (
    /\b(conditional|partial|adjust|depends|moderate|neutral|unclear)\b/.test(
      primary
    )
  ) {
    return 'conditional';
  }
  return 'neutral';
}

// --- Build auditable cast_result ---

function buildCastResult(reading: SortilegeReading): SortilegeCastResult {
  const cast = reading.castResult.cast;
  const objs = cast.objects;

  switch (reading.method) {
    case 'dice': {
      const values = objs
        .slice(0, 2)
        .map((o) => (typeof o.value === 'number' ? o.value : 0)) as [number, number];
      const inside_circle = (cast.insideCircle ?? 0) === 2;
      return { dice: values.length === 2 ? values : [0, 0], inside_circle };
    }
    case 'stones':
      return { stones: objs.map((o) => ({ symbol: String(o.symbol ?? o.value ?? '') })) };
    case 'cards':
      return {
        cards: objs.map((o) => ({
          symbol: String(o.symbol ?? o.value ?? ''),
          orientation: typeof o.orientation === 'number' ? o.orientation : 0,
        })),
      };
    case 'coins':
      return { coins: objs.map((o) => ({ symbol: String(o.symbol ?? o.value ?? '') })) };
    case 'sticks':
      return { sticks: objs.map((o) => ({ symbol: String(o.symbol ?? o.value ?? '') })) };
    default:
      return { stones: objs.map((o) => ({ symbol: String(o.symbol ?? o.value ?? '') })) };
  }
}

function getSymbolicValue(reading: SortilegeReading): number {
  const cast = reading.castResult?.cast;
  if (!cast) return 0;
  if (typeof cast.totalValue === 'number') return cast.totalValue;
  return cast.objects.reduce((s, o) => {
    const v = o.value;
    return s + (typeof v === 'number' ? v : 0);
  }, 0);
}

/**
 * Build SortilegeState from SortilegeReading.
 * Throws if reading or castResult is missing.
 */
export function buildSortilegeState(
  reading: SortilegeReading | null | undefined
): SortilegeState {
  if (!reading) {
    throw new Error(SORTILEGE_REFUSAL_DATA_PHRASE);
  }
  if (!reading.castResult) {
    throw new Error(SORTILEGE_REFUSAL_DATA_PHRASE);
  }
  const validity = getSortilegeValidity(reading);
  const orientation = deriveOrientation(reading, validity);
  const cast_result = buildCastResult(reading);
  const symbolic_value = getSymbolicValue(reading);
  const interpretation_primary = reading.castResult.interpretation?.primary ?? '';

  return {
    question: reading.question ?? '',
    method: reading.method,
    validity,
    cast_result,
    symbolic_value,
    orientation,
    interpretation_primary,
  };
}

/**
 * Classify Sortilege question.
 * Refuse: predictive, explanatory (why), timing (when), multi-part, medical/legal, repeated-casting.
 * Valid: yes/no, directional, alignment, conditional, interpretation, general.
 */
export function classifySortilegeQuestion(
  question: string
): SortilegeQuestionType {
  const lower = question.toLowerCase().trim();

  // Refusal: predictive
  if (
    /\b(what (exactly )?will happen|what (is|are) going to happen|when will (it|this)|when (do|does)|predict|prediction|future (hold|outcome)|destiny|fate (has|holds))\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }
  // Refusal: explanation as causality
  if (
    /\b(why (is|are|did|does|will)|why (is this|did this)|explain (why|the cause)|cause of|reason (why|for))\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }
  // Refusal: timing
  if (
    /\b(when (should|will|can) I|when (to |will )?it happen|what (date|time|day)|exact (date|time))\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }
  // Refusal: medical / legal
  if (
    /\b(medical|diagnos|treatment|doctor|lawyer|legal|court|sue|medication|health (diagnosis|outcome)|illness (cause|cure))\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }
  // Refusal: repeated casting / reassurance
  if (
    /\b(cast again|recast|try again|same question|ask again|reassure|confirm (again|my))\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }
  // Refusal: multi-part (simple heuristic: "and" with two questions)
  if (/\?.*\band\b.*\?/.test(question) || (lower.split(/\?/).length > 2 && lower.includes(' and '))) {
    return 'refusal';
  }

  // Valid: yes/no
  if (
    /\b(should I (proceed|go ahead|do it|take (this )?action)|is (it|this) (a good idea|wise)|can I (proceed|go ahead)|may I (proceed|go ahead))\b/.test(
      lower
    )
  ) {
    return 'yes_no';
  }
  if (/\b(yes or no|binary (answer|choice))\b/.test(lower)) {
    return 'yes_no';
  }
  // Valid: alignment
  if (
    /\b(is (this|it) (aligned|right|favorable|good (for|to)|supportive)|alignment|aligned (with|to)|favorable (for|to))\b/.test(
      lower
    )
  ) {
    return 'alignment';
  }
  // Valid: directional / action vs restraint
  if (
    /\b(action or restraint|proceed or wait|go or stay|act or (hold|wait)|direction|guidance (on|for) (action|next step)|what (should|do) I (do|next))\b/.test(
      lower
    )
  ) {
    return 'directional';
  }
  // Valid: conditional
  if (
    /\b(conditional|under (what )?condition|depends on|if (so|not)|adjust (approach|plan))\b/.test(
      lower
    )
  ) {
    return 'conditional';
  }
  // Valid: interpretation
  if (
    /\b(what does (this|the) (cast|draw|throw) mean|interpret(ation)?|meaning (of|behind)|symbol(s)?|explain (the|this) (cast|result))\b/.test(
      lower
    )
  ) {
    return 'interpretation';
  }
  // General sortilege
  if (
    /\b(sortilege|cast|dice|stone|card|coin|stick|lot(s)?|draw|throw|guidance|direction)\b/.test(
      lower
    )
  ) {
    return 'general';
  }

  return 'general';
}

/**
 * Build system prompt slice for Sortilege Seer.
 * Enforces chance-signal only, method isolation, validity, binary/directional output, disclaimer.
 */
export function getSortilegeSliceForQuestionType(
  questionType: SortilegeQuestionType,
  state: SortilegeState
): string {
  if (questionType === 'refusal') {
    return `Refuse with exactly: "${SORTILEGE_REFUSAL_SAFETY_PHRASE}" Do not predict, explain causality, or give timing. Sortilege offers directional guidance only.`;
  }

  const stateBlock = `
SORTILEGE STATE (use this only; mechanically auditable):
- Question: ${state.question}
- Method: ${state.method}
- Validity: ${state.validity}
- Cast result: ${JSON.stringify(state.cast_result)}
- Symbolic value: ${state.symbolic_value}
- Orientation: ${state.orientation}
- Interpretation (primary): ${state.interpretation_primary}
`.trim();

  const methodIsolationBlock = `
METHOD ISOLATION (critical):
One session = one method only. This reading used ${state.method}. Do not mix dice, stones, cards, coins, or sticks in the same answer. Do not suggest "try another method" for confirmation. If the user wants confirmation, they may use Pendulum or another tool separately.
`.trim();

  const binaryBlock = `
INTERPRETATION LOGIC (binary discipline):
Resolve answers to one of: Yes/Supportive | No/Obstructed | Conditional | Neutral/Unclear.
- Neutral = do not proceed; suggest recast later or clarify the question.
- Conditional = adjust approach; name the condition briefly.
- No hedging language. State the direction clearly from the cast.
`.trim();

  const permanentRule = `
PERMANENT RULE (every answer must obey):
Sortilege reveals direction through chance, not certainty or causality. Never say "this means success is coming" or "this predicts X." Say "The cast indicates support for proceeding, with awareness that effort is required" (or similar). No drama. No promise.
`.trim();

  const framingBlock = `
ANSWER FRAMING:
Minimal, authoritative. Example: "The cast indicates support for proceeding, with awareness that effort is required." Never: "This means success is coming" or "You will definitely..."
`.trim();

  const disclaimerBlock = `
MANDATORY DISCLAIMER (include in every response):
"${SORTILEGE_MANDATORY_DISCLAIMER}"
`.trim();

  const profileBlock = `
PROFILE INTEGRATION (strictly secondary):
You may modulate tone or briefly explain how the guidance fits the user's temperament. You must NOT override the cast result or predict outcomes based on profile. The sortilege result always wins.
`.trim();

  return `${stateBlock}

${methodIsolationBlock}

${binaryBlock}

${permanentRule}

${framingBlock}

${disclaimerBlock}

${profileBlock}`;
}
