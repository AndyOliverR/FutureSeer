/**
 * Lenormand Seer State and Slice.
 * Rule: Lenormand describes events and situations, not feelings or fate.
 * Symbolic grammar — concrete, near-term, left-to-right combinations.
 */

export interface LenormandCardInState {
  name: string;
  position: string;
}

export interface LenormandState {
  question: string;
  spread_type: string;
  cards: LenormandCardInState[];
  focus_card: string;
}

export type LenormandQuestionType =
  | 'situational_outcome'
  | 'what_happening'
  | 'near_term'
  | 'blocked_forward'
  | 'general'
  | 'refusal';

/** Payload: from LenormandReading (question, spreadType, cards with name, positions). */
export interface LenormandReadingPayload {
  question?: string;
  spreadType?: string;
  cards?: Array<{ name: string; number?: number; keywords?: string[] }>;
  positions?: string[];
}

/**
 * Build LenormandState from a reading payload. Requires question and at least one card with position.
 */
export function buildLenormandState(payload: LenormandReadingPayload): LenormandState {
  const question = (payload.question ?? '').trim();
  const spread_type = payload.spreadType ?? 'three';
  const cardsRaw = payload.cards ?? [];
  const positions = payload.positions ?? [];
  if (!question || cardsRaw.length === 0) {
    throw new Error(
      'Lenormand requires a reading. Perform a reading first to use Ask the Seer.'
    );
  }
  const cards: LenormandCardInState[] = cardsRaw.map((c, i) => ({
    name: c.name ?? 'Unknown',
    position: positions[i] ?? `Position ${i + 1}`,
  }));
  const mid = Math.floor(cards.length / 2);
  const focus_card = cards[mid]?.name ?? cards[0]?.name ?? '';

  return {
    question,
    spread_type,
    cards,
    focus_card,
  };
}

/**
 * Classify Lenormand question. Refusal: psychological, destiny, long-term, multiple. Valid: concrete situation, outcome, what's happening, near-term, blocked/forward.
 */
export function classifyLenormandQuestion(question: string): LenormandQuestionType {
  const lower = question.toLowerCase().trim();

  if (
    /\b(why does this keep happening|what lesson should i learn|what is my destiny|long-term future|years from now|my life purpose|soul (lesson|path|purpose)|psychological|inner (state|feelings)|how do i feel)\b/.test(lower)
  ) {
    return 'refusal';
  }
  if (/\b(multiple questions|and also|what about.*and|several questions)\b/.test(lower)) {
    return 'refusal';
  }
  if (
    /\b(will i get (a )?response|hear back|get (an )?answer|get (a )?reply)\b/.test(lower)
  ) {
    return 'situational_outcome';
  }
  if (
    /\b(what is happening (with|in)|what('s| is) going on|what('s| is) the situation)\b/.test(lower)
  ) {
    return 'what_happening';
  }
  if (
    /\b(likely outcome|near term|short term|what will happen (next|soon)|outcome in the (near|short))\b/.test(lower)
  ) {
    return 'near_term';
  }
  if (
    /\b(is this moving forward|is it blocked|moving forward or blocked|progress or (stuck|delay))\b/.test(lower)
  ) {
    return 'blocked_forward';
  }
  if (
    /\b(what do (the|these) cards (say|mean|indicate)|(interpret|read) (this|these) (spread|cards)|combination of|left to right)\b/.test(lower)
  ) {
    return 'general';
  }

  return 'general';
}

/** Mandatory refusal phrase. */
export const LENORMAND_REFUSAL_PHRASE =
  'Lenormand is best suited for concrete, near-term situations.';

/**
 * Build slice for system prompt: state, directional grammar, card combinations, focus card, time discipline, refusal, permanent rule.
 */
export function getLenormandSliceForQuestionType(
  questionType: LenormandQuestionType,
  state: LenormandState
): string {
  if (questionType === 'refusal') {
    return `Refuse with: "${LENORMAND_REFUSAL_PHRASE}" Do not answer psychological, destiny, or long-term future questions. Lenormand focuses on practical developments only.`;
  }

  const stateBlock = `
LENORMAND STATE (use this only):
- Question: ${state.question}
- Spread: ${state.spread_type}
- Cards (left → right): ${state.cards.map((c) => `${c.name} (${c.position})`).join(' → ')}
- Focus card: ${state.focus_card}
`.trim();

  const directionalBlock = `
DIRECTIONAL GRAMMAR (critical):
- Read left → right only. No reversals.
- Left = cause / background. Middle = situation. Right = direction / outcome.
- Do not override with intuition; stick to literal combinations.
`.trim();

  const combinationBlock = `
CARD SUPREMACY:
- No card is read alone. Meaning comes from card pairs/chains.
- Adjacent cards modify each other; distance reduces influence.
- Combine cards explicitly (e.g. Letter + Clouds = confusing communication; Clouds + Sun = confusion clears).
`.trim();

  const focusBlock = `
FOCUS CARD:
- Focus card (${state.focus_card}) sets the topic. Other cards describe condition and outcome.
- If focus card is blocked by difficult cards → indicate delay or obstacle.
`.trim();

  const timeBlock = `
TIME DISCIPLINE:
- Near-term only. Fast cards → days; slow cards → weeks. Never months/years unless explicitly asked.
- If timing is unclear, say so.
`.trim();

  const allowedBlock = `
ALLOWED:
- Concrete situation, practical outcome, what is happening, near-term direction, blocked vs moving forward.
- Literal, short answers. Events and situations, not feelings or fate.
`.trim();

  const forbiddenBlock = `
FORBIDDEN:
- Psychological or destiny framing, long-term predictions, emotional elaboration, multiple questions at once.
`.trim();

  const permanentRule = `
PERMANENT RULE:
Lenormand describes events and situations, not feelings or fate.
`.trim();

  return `${stateBlock}

${directionalBlock}

${combinationBlock}

${focusBlock}

${timeBlock}

${allowedBlock}

${forbiddenBlock}

${permanentRule}`;
}
