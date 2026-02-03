/**
 * I Ching Seer State and Slice Selector.
 * State-transition system: primary hexagram → changing lines → resulting hexagram.
 * Rule: I Ching advises how to move, not what will happen.
 */

import type { IChingAnalysis, IChingHexagram } from '@/lib/ichingIntelligence';

export interface IChingState {
  question_context: string;
  primary_hexagram: number;
  changing_lines: number[];
  resulting_hexagram: number | null;
  timestamp: string;
  instability_warning: boolean;
}

export type IChingQuestionType =
  | 'nature_of_situation'
  | 'how_to_approach'
  | 'direction'
  | 'advance_or_wait'
  | 'general'
  | 'refusal';

/**
 * Build IChingState from IChingAnalysis.
 * Requires analysis.hexagram; throws if missing.
 * Sets instability_warning if more than 3 changing lines.
 */
export function buildIChingState(analysis: IChingAnalysis): IChingState {
  if (!analysis?.hexagram) {
    throw new Error(
      'Run an I Ching reading first to use Ask the Seer.'
    );
  }

  const hexagram = analysis.hexagram;
  const lines = hexagram.lines || [];
  const changingLines = lines
    .filter((line) => line.changing)
    .map((line) => line.position)
    .sort((a, b) => a - b);

  const timestamp =
    analysis.timestamp instanceof Date
      ? analysis.timestamp.toISOString()
      : typeof analysis.timestamp === 'string'
        ? analysis.timestamp
        : new Date().toISOString();

  return {
    question_context: analysis.question || '',
    primary_hexagram: hexagram.number,
    changing_lines: changingLines,
    resulting_hexagram: hexagram.changingTo?.number ?? null,
    timestamp,
    instability_warning: changingLines.length > 3,
  };
}

/**
 * Classify I Ching question. Refusal for timing, outcome prediction, medical/legal, multiple questions, dependency.
 */
export function classifyIChingQuestion(question: string): IChingQuestionType {
  const lower = question.toLowerCase().trim();

  if (
    /\b(when|date|time|timeline|schedule|deadline|how long|until)\b/.test(lower)
  ) {
    return 'refusal';
  }
  if (
    /\b(will i succeed|guaranteed|will it happen|will we|outcome|predict|result)\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }
  if (
    /\b(medical|legal|doctor|lawyer|diagnosis|treatment|court|lawsuit)\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }
  if (
    /\b(and also|second question|another question|multiple|also what)\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }
  if (
    /\b(same question|ask again|re-?ask|ask the same|without change)\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }

  if (
    /nature of (this )?situation|what is (the )?situation|situation (is|about)/.test(
      lower
    )
  ) {
    return 'nature_of_situation';
  }
  if (
    /how (should i |do i )?approach|how to approach|approach this/.test(
      lower
    )
  ) {
    return 'how_to_approach';
  }
  if (
    /direction|moving toward|where (is|does) (this|it) (go|lead)/.test(lower)
  ) {
    return 'direction';
  }
  if (
    /(should i |advance or wait|hold or act|act or wait|withdraw|hold position)/.test(
      lower
    )
  ) {
    return 'advance_or_wait';
  }

  return 'general';
}

/**
 * Build slice for system prompt: primary hexagram, only changing lines (bottom to top), resulting hexagram, trigrams, discipline note.
 */
export function getIChingSliceForQuestionType(
  questionType: IChingQuestionType,
  state: IChingState,
  analysis: IChingAnalysis
): string {
  if (questionType === 'refusal') {
    return 'I Ching does not predict outcomes; it advises on alignment. Refuse with: "I Ching does not predict outcomes; it advises on alignment." or for timing: "I Ching guidance applies to the current state and should not be re-queried without change."';
  }

  const hexagram = analysis.hexagram;
  const lines = hexagram.lines || [];
  const changingLineEntries = lines
    .filter((line) => line.changing)
    .sort((a, b) => a.position - b.position)
    .map(
      (line) =>
        `Line ${line.position} (${line.yinYang}): ${line.meaning || line.text || 'changing'}`
    );

  const primaryBlock = `
PRIMARY HEXAGRAM (current state):
Hexagram ${state.primary_hexagram}: ${hexagram.name} (${hexagram.chinese}, ${hexagram.pinyin})
Meaning: ${hexagram.meaning}
Description: ${hexagram.description}
`.trim();

  const changingBlock =
    state.changing_lines.length > 0
      ? `
CHANGING LINES (read bottom to top; interpret only these):
${changingLineEntries.join('\n')}
`.trim()
      : 'CHANGING LINES: None. Situation is stable; advice focuses on maintenance, not action.';

  const resultingBlock = state.resulting_hexagram
    ? `
RESULTING HEXAGRAM (emerging state):
Hexagram ${state.resulting_hexagram}: ${hexagram.changingTo?.name || 'Unknown'} — ${hexagram.changingTo?.meaning || ''}
`.trim()
    : 'RESULTING HEXAGRAM: None (no changing lines or single hexagram).';

  const trigramBlock = `
TRIGRAMS (inner readiness vs outer reality):
Upper trigram (external conditions): ${hexagram.trigramUpper} (${hexagram.elementUpper})
Lower trigram (internal condition): ${hexagram.trigramLower} (${hexagram.elementLower})
`.trim();

  const instabilityNote = state.instability_warning
    ? '\nMore than 3 changing lines: situation is highly unstable; acknowledge this in your response.'
    : '';

  const disciplineNote = `
DISCIPLINE (non-negotiable):
- I Ching advises how to move, not what will happen.
- Answer must end with one of: Advance (act deliberately), Hold (maintain position), or Withdraw (pause or disengage). No ambiguity.
- No timelines, no outcome predictions.
`.trim();

  return `${primaryBlock}

${changingBlock}

${resultingBlock}

${trigramBlock}
${instabilityNote}

${disciplineNote}`;
}
