/**
 * Dream Symbols Seer State and Slice Selector.
 * Subconscious signal system: inner state and processing, not external fate.
 * Rule: Dream interpretation translates subconscious signals into awareness, not destiny.
 */

import type { DreamAnalysis, DreamData } from '@/lib/dreamSymbolsIntelligence';

export type DreamUserRole =
  | 'observer'
  | 'participant'
  | 'victim'
  | 'controller';

export interface DreamState {
  dream_symbols: string[];
  emotional_tone: string;
  user_role: DreamUserRole;
  recurrence: boolean;
  recent_context: string;
  sleep_state: string;
}

export type DreamSymbolsQuestionType =
  | 'what_does_reflect'
  | 'why_symbol'
  | 'repeating_theme'
  | 'what_reflect_on'
  | 'general'
  | 'refusal';

/**
 * Build DreamState from DreamAnalysis and optional DreamData.
 * Requires analysis with at least one of: dreamDescription (non-empty) or symbols.length > 0.
 */
export function buildDreamState(
  analysis: DreamAnalysis,
  dreamData?: DreamData | null
): DreamState {
  const hasDescription =
    typeof analysis?.dreamDescription === 'string' &&
    analysis.dreamDescription.trim().length > 0;
  const hasSymbols =
    Array.isArray(analysis?.symbols) && analysis.symbols.length > 0;

  if (!analysis || (!hasDescription && !hasSymbols)) {
    throw new Error(
      'Dream interpretation requires analysis with dream description or symbols.'
    );
  }

  const dream_symbols =
    analysis.symbols?.map((s) => s.symbol).filter(Boolean) ?? [];
  const emotional_tone = (analysis.emotionalTone ?? 'neutral').trim() || 'neutral';
  const recurrence = dreamData?.dreamType === 'recurring' || false;
  const recent_context = (dreamData?.context ?? '').trim();
  const sleep_state = 'normal';

  return {
    dream_symbols,
    emotional_tone,
    user_role: 'participant',
    recurrence,
    recent_context,
    sleep_state,
  };
}

/**
 * Classify Dream Symbols question. Refusal for event prediction, warnings, literal meanings (death/marriage/money), medical/mental health, fatalistic.
 */
export function classifyDreamSymbolsQuestion(
  question: string
): DreamSymbolsQuestionType {
  const lower = question.toLowerCase().trim();

  if (
    /\b(will this happen|is this a warning|does this mean (death|marriage|money|divorce|illness)|when will|predict|forecast|prophecy|fatalistic)\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }
  if (
    /\b(diagnos|medical|mental health|therapy|disease|disorder|treatment)\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }
  if (
    /\b(will i (die|marry|get rich)|am i (going to|about to)|something bad will happen)\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }

  if (
    /\b(what does this dream reflect|what is this dream (reflecting|saying)|what does the dream (reflect|mean|show))\b/.test(
      lower
    )
  ) {
    return 'what_does_reflect';
  }
  if (
    /\b(why am i seeing (this )?symbol|why (these|this) symbols?|what does (this|that) symbol mean)\b/.test(
      lower
    )
  ) {
    return 'why_symbol';
  }
  if (
    /\b(what theme is repeating|repeating (dream|theme)|recurring (symbol|theme)|why do i keep (dreaming|seeing))\b/.test(
      lower
    )
  ) {
    return 'repeating_theme';
  }
  if (
    /\b(what should i reflect on|what (to )?reflect on|what (to )?pay attention to|what (is )?my mind processing|what theme is unresolved)\b/.test(
      lower
    )
  ) {
    return 'what_reflect_on';
  }

  return 'general';
}

/**
 * Build slice for system prompt: dream state, emotional tone supremacy, role logic, recurrence gate, symbol types, integration framing, permanent rule.
 */
export function getDreamSymbolsSliceForQuestionType(
  questionType: DreamSymbolsQuestionType,
  state: DreamState,
  analysis: DreamAnalysis
): string {
  if (questionType === 'refusal') {
    return 'Refuse with: "Dream symbols cannot determine external outcomes." or "Dreams symbolize internal processing, not literal events."';
  }

  const dreamDesc =
    analysis.dreamDescription?.trim() || '(no description provided)';
  const symbolList =
    state.dream_symbols.length > 0
      ? state.dream_symbols.join(', ')
      : '(symbols derived from description)';

  const stateBlock = `
DREAM STATE (use this only):
- Dream description: ${dreamDesc}
- Dream symbols: ${symbolList}
- Emotional tone: ${state.emotional_tone}
- User role in dream: ${state.user_role}
- Recurrence: ${state.recurrence ? 'repeating' : 'one-time'}
- Recent context: ${state.recent_context || '(none)'}
- Sleep state: ${state.sleep_state}
`.trim();

  const emotionalBlock = `
EMOTIONAL TONE SUPREMACY (critical):
- Emotion overrides symbol dictionary. Same symbol + different emotion = different meaning.
- Example: falling + fear → loss of control; falling + calm → surrender or transition.
- Always anchor interpretation to the emotional tone above.
`.trim();

  const roleBlock = `
ROLE LOGIC:
- Participant → active inner conflict
- Observer → awareness, detachment
- Victim → overwhelm or pressure
- Controller → responsibility, dominance
`.trim();

  const recurrenceBlock = `
RECURRENCE GATE:
- One-time dream → transient processing; do not dramatize.
- Repeating dream → unresolved issue; suggest reflection or integration.
- Intensifying recurrence → urgency for reflection, not prediction.
`.trim();

  const symbolTypesBlock = `
SYMBOL TYPES (do not assume universality without context):
- Universal: fear, change, control, loss
- Personal: user-specific memory or trauma
- Cultural: learned imagery
- Situational: current-life stressor
- Archetypal: transformation, shadow, growth
`.trim();

  const integrationBlock = `
INTEGRATION FRAMING (required):
- End with integration guidance: reflect, journal, address conflict, slow down, set boundaries.
- Forbidden: predictive action, fear-based advice, external blame.
`.trim();

  const disciplineNote = `
DISCIPLINE (non-negotiable):
- Dream symbols describe inner state and processing, not external fate.
- Speak in themes and psychological meaning, not events or predictions.
- Refuse event prediction, medical/mental health diagnosis, fatalistic interpretations.
- Permanent rule: Dream interpretation translates subconscious signals into awareness, not destiny.
`.trim();

  return `${stateBlock}

${emotionalBlock}

${roleBlock}

${recurrenceBlock}

${symbolTypesBlock}

${integrationBlock}

${disciplineNote}`;
}
