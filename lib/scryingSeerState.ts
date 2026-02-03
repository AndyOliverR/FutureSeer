/**
 * Scrying Seer State and Slice.
 * Rule: Scrying reveals symbolic patterns from perception; meaning comes from interpretation, not vision.
 */

export interface ScryingState {
  medium: string;
  visual_patterns: string[];
  movement: string;
  clarity: string;
  emotional_tone?: string;
  question_scope?: string;
}

export type ScryingQuestionType =
  | 'theme'
  | 'pattern'
  | 'attention'
  | 'emerging'
  | 'general'
  | 'refusal';

/** Refusal phrase for missing vision. */
export const SCRYING_REFUSAL_DATA_PHRASE =
  'Scrying insights require a vision. Perform a scrying session first.';

/** Refusal phrase for unsafe questions. */
export const SCRYING_REFUSAL_SAFETY_PHRASE =
  'Scrying is not suited for answering this safely.';

/**
 * Build ScryingState from ScryingVision.
 * Requires vision with at least primaryVision OR (symbols/shapes/images with content).
 */
export function buildScryingState(vision: any, method?: string): ScryingState {
  if (!vision) {
    throw new Error(SCRYING_REFUSAL_DATA_PHRASE);
  }

  const hasPrimary = !!vision.primaryVision?.trim();
  const shapes = vision.shapes || [];
  const images = vision.images || [];
  const symbols = vision.symbols || [];
  const symbolValues = symbols.map((s: any) => s?.value).filter(Boolean);
  const hasPatterns =
    shapes.length > 0 || images.length > 0 || symbolValues.length > 0;

  if (!hasPrimary && !hasPatterns) {
    throw new Error(SCRYING_REFUSAL_DATA_PHRASE);
  }

  const visionMethod = vision.method || method;
  const medium =
    visionMethod === 'mirror'
      ? 'mirror'
      : 'crystal_ball';

  const visual_patterns = [
    ...shapes,
    ...images,
    ...symbolValues,
  ].filter(Boolean);

  const movements = vision.movements || [];
  const movement = movements[0] || 'unknown';

  const energyLevel =
    typeof vision.energyLevel === 'number' ? vision.energyLevel : 50;
  let clarity = 'partial';
  if (energyLevel >= 70) clarity = 'clear';
  else if (energyLevel < 40) clarity = 'obscured';

  const emotional_tone = vision.emotional_tone || 'neutral';
  const question_scope = vision.question;

  return {
    medium,
    visual_patterns,
    movement,
    clarity,
    emotional_tone,
    question_scope,
  };
}

/**
 * Classify Scrying question.
 * Refuse: predictive, entity/spirit, mental health crisis.
 * Valid: theme, pattern, attention, emerging, energy.
 */
export function classifyScryingQuestion(question: string): ScryingQuestionType {
  const lower = question.toLowerCase().trim();

  // Refusal - predictive
  if (
    /\b(what will happen|when will|will I|will this (occur|happen)|predict|outcome|future)\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }

  // Refusal - entity/spirit
  if (
    /\b(who is influencing|message from|spirit|entity|ghost|deceased|angel|demon|guide (is|trying))\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }

  // Refusal - mental health
  if (
    /\b(crisis|suicid|emergency|self-harm|hurt myself|mental health|reality (testing|lost))\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }

  // Valid question types
  if (
    /\b(what theme (is )?emerging|emerging theme|theme (emerging|of (this )?situation))\b/.test(
      lower
    )
  ) {
    return 'theme';
  }
  if (
    /\b(what pattern|pattern wants attention|which pattern)\b/.test(lower)
  ) {
    return 'pattern';
  }
  if (
    /\b(what (am I|do I) (not )?consciously noticing|what (should I|to) notice)\b/.test(
      lower
    )
  ) {
    return 'attention';
  }
  if (
    /\b(what energy surrounds|energy (around|of) (this )?matter)\b/.test(lower)
  ) {
    return 'emerging';
  }

  // General scrying questions
  if (
    /\b(scrying|vision|symbol|pattern|theme|emerging|perception)\b/.test(lower)
  ) {
    return 'general';
  }

  return 'general';
}

/**
 * Build system prompt slice for Scrying.
 * Enforces pattern-priority, symbol classification, emotional gate, themes only.
 */
export function getScryingSliceForQuestionType(
  questionType: ScryingQuestionType,
  state: ScryingState
): string {
  if (questionType === 'refusal') {
    return `Refuse with: "${SCRYING_REFUSAL_SAFETY_PHRASE}" Do not predict events, attribute visions to entities, or provide timing. Scrying reflects symbolic perception, not external certainty.`;
  }

  const stateBlock = `
SCRYING STATE (use this only):
- Medium: ${state.medium}
- Visual patterns: ${state.visual_patterns.join(', ') || 'none recorded'}
- Movement: ${state.movement}
- Clarity: ${state.clarity}
${state.emotional_tone ? `- Emotional tone: ${state.emotional_tone}` : ''}
${state.question_scope ? `- Question scope: ${state.question_scope}` : ''}
`.trim();

  const patternBlock = `
PATTERN PRIORITY (this is the spine):
- Recurring shapes > single images
- Movement > static form
- Contrast > detail
- Emotion > symbol dictionary
Prioritize repetition and motion, not imagery aesthetics. Never force meaning.
`.trim();

  const symbolBlock = `
SYMBOL CLASSIFICATION (non-mystical):
Every observed symbol: Archetypal (universal), Personal (user memory), Situational (current stressor), Abstract (process/transition).
Never assume archetypal meaning without evidence. Classify tentatively.
`.trim();

  const emotionalBlock = `
EMOTIONAL RESONANCE GATE:
Calm emotion = neutral observation. Anxiety = internal projection. Curiosity = exploratory insight. Fear = distortion risk.
Always say: "This reflects perception filtered through emotional state."
`.trim();

  const translationBlock = `
TRANSLATION LAYER (themes only):
Allowed: emerging themes, tensions, transitions, attention points.
Forbidden: instructions, predictions, entity claims, absolute truth statements.
Translate into themes, not answers. No authority claims. No certainty inflation.
`.trim();

  const framingBlock = `
ANSWER FRAMING:
- Grounded, non-authoritarian. Example: "The recurring spiral and slow movement suggest a process unfolding gradually rather than a sudden shift."
- No "this vision means something is coming." No authority claims.
- Avoid dependency: no repeated scrying for reassurance, no escalation framing.
`.trim();

  const permanentRule = `
PERMANENT RULE:
Scrying reveals patterns of perception, not objective events or external commands.
`.trim();

  return `${stateBlock}

${patternBlock}

${symbolBlock}

${emotionalBlock}

${translationBlock}

${framingBlock}

${permanentRule}`;
}
