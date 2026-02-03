/**
 * Bibliomancy Seer State and Slice.
 * Rule: Bibliomancy offers symbolic wisdom for reflection, not divine instruction or factual prediction.
 */

import type { BibliomancyReading, SacredTextType } from './bibliomancyIntelligence';

export interface BibliomancyState {
  selected_text: string;
  passage_reference: string;
  literal_theme: string;
  symbolic_theme: string;
  question_context?: string;
  tone: string;
}

export type BibliomancyQuestionType =
  | 'guidance'
  | 'wisdom'
  | 'perspective'
  | 'general'
  | 'refusal';

/** Refusal phrase for missing reading. */
export const BIBLIOMANCY_REFUSAL_DATA_PHRASE =
  'Bibliomancy insights require a reading. Generate your bibliomancy reading first.';

/** Refusal phrase for unsafe questions. */
export const BIBLIOMANCY_REFUSAL_SAFETY_PHRASE =
  'Bibliomancy is not designed to answer this safely or responsibly. Bibliomancy offers reflective guidance, not commands or predictions.';

/** Mandatory disclaimer for every response. */
export const BIBLIOMANCY_MANDATORY_DISCLAIMER =
  'This reflection is offered as symbolic spiritual guidance and is not a directive, prediction, or substitute for personal judgment.';

const TEXT_TYPE_NAMES: Record<string, string> = {
  bible: 'Bible',
  quran: 'Quran',
  'bhagavad-gita': 'Bhagavad Gita',
  torah: 'Torah',
  hafez: 'Hafez Poetry',
};

/**
 * Build BibliomancyState from BibliomancyReading.
 * Requires textType and at least one passage (selectedPassages[0] or questionReading.passage).
 */
export function buildBibliomancyState(
  reading: BibliomancyReading | null | undefined
): BibliomancyState {
  if (!reading) {
    throw new Error(BIBLIOMANCY_REFUSAL_DATA_PHRASE);
  }

  const passage =
    reading.selectedPassages?.[0] ?? reading.questionReading?.passage;
  if (!passage) {
    throw new Error(BIBLIOMANCY_REFUSAL_DATA_PHRASE);
  }

  const textType = reading.textType as SacredTextType | undefined;
  const selected_text =
    TEXT_TYPE_NAMES[textType || ''] || textType || 'Sacred Text';

  const passage_reference = passage.reference || 'Passage';

  const literal_theme =
    passage.interpretation ??
    reading.questionReading?.interpretation ??
    reading.divineMessage?.keyInsights?.[0] ??
    'wisdom for reflection';

  const symbolic_theme =
    reading.symbolicMeanings?.themes?.[0] ??
    (Array.isArray(passage.themes) && passage.themes[0]) ??
    'focus on effort, release outcome';

  const question_context =
    reading.questionReading?.question ??
    reading.divineMessage?.personalMessage?.slice(0, 150);

  return {
    selected_text,
    passage_reference,
    literal_theme,
    symbolic_theme,
    question_context: question_context || undefined,
    tone: 'guidance',
  };
}

/**
 * Classify Bibliomancy question.
 * Refuse: divine command, prediction, moral judgment, interfaith comparison.
 * Valid: guidance, wisdom, perspective.
 */
export function classifyBibliomancyQuestion(
  question: string
): BibliomancyQuestionType {
  const lower = question.toLowerCase().trim();

  // Refusal
  if (
    /\b(what will happen|is this (God'?s|Gods) will|who is right or wrong|what decision must I take)\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }
  if (
    /\b(divine command|predict|moral judgment|interfaith comparison|which religion (is |is better)|who is (correct|wrong))\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }

  // Valid question types
  if (
    /\b(what guidance can I reflect on|guidance (to )?reflect on)\b/.test(
      lower
    )
  ) {
    return 'guidance';
  }
  if (
    /\b(what wisdom applies to my situation|wisdom (for|applies to) (my )?situation)\b/.test(
      lower
    )
  ) {
    return 'wisdom';
  }
  if (
    /\b(what perspective may help me proceed|perspective (to )?help (me )?proceed)\b/.test(
      lower
    )
  ) {
    return 'perspective';
  }

  if (
    /\b(bibliomancy|passage|verse|sacred text|bible|quran|gita|torah|hafez|reflect|wisdom|guidance)\b/.test(
      lower
    )
  ) {
    return 'general';
  }

  return 'general';
}

/**
 * Build system prompt slice for Bibliomancy.
 * Enforces single-text integrity, symbolic interpretation, ethical neutrality, mandatory disclaimer.
 */
export function getBibliomancySliceForQuestionType(
  questionType: BibliomancyQuestionType,
  state: BibliomancyState
): string {
  if (questionType === 'refusal') {
    return `Refuse with: "${BIBLIOMANCY_REFUSAL_SAFETY_PHRASE}" Do not claim divine command, predict events, judge, or compare religions. Bibliomancy offers reflective guidance only.`;
  }

  const stateBlock = `
BIBLIOMANCY STATE (use this only):
- Selected text: ${state.selected_text}
- Passage reference: ${state.passage_reference}
- Literal theme: ${state.literal_theme}
- Symbolic theme: ${state.symbolic_theme}
${state.question_context ? `- Question context: ${state.question_context}` : ''}
- Tone: ${state.tone}
`.trim();

  const singleTextBlock = `
SINGLE-TEXT INTEGRITY (critical):
One session = one sacred text. No cross-religion synthesis in one answer.
Always state explicitly: "This reflection is drawn from ${state.selected_text}."
Respect that tradition's tone.
`.trim();

  const symbolicBlock = `
SYMBOLIC INTERPRETATION SUPREMACY (the spine):
Interpret principle, not prescription. Avoid literal commands.
Context > isolated verse. Theme > quotation.
Never say "This verse means you should do X." Instead: "This passage emphasizes…"
`.trim();

  const ethicalBlock = `
ETHICAL NEUTRALITY GATE:
Forbidden: moral condemnation, sin language, fear or punishment framing.
Allowed: reflection, encouragement, caution, perspective.
`.trim();

  const applicationBlock = `
APPLICATION LOGIC (present-life anchoring):
All insight must map to current situation. Past/future framing is metaphorical only. No destiny language.
Say "Applied to your situation, this suggests…"
`.trim();

  const framingBlock = `
ANSWER FRAMING:
Quiet, respectful. Example: "This passage invites reflection on acting with integrity while releasing attachment to results."
Never: "This is divine guidance telling you what to do."
`.trim();

  const disclaimerBlock = `
MANDATORY DISCLAIMER (include in every response):
"${BIBLIOMANCY_MANDATORY_DISCLAIMER}"
`.trim();

  const permanentRule = `
PERMANENT RULE:
Sacred texts are sources of wisdom for reflection, not instruments of authority or fate.
`.trim();

  return `${stateBlock}

${singleTextBlock}

${symbolicBlock}

${ethicalBlock}

${applicationBlock}

${framingBlock}

${disclaimerBlock}

${permanentRule}`;
}
