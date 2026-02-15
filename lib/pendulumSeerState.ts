/**
 * Pendulum Divination Seer State and Slice.
 * Rule: Pendulum Divination only confirms or denies a clearly defined proposition.
 * Pendulum divination answers alignment, not destiny.
 */

export type PendulumConfidence = 'clear' | 'weak' | 'inconclusive';

export interface PendulumState {
  calibration: {
    yes: string;
    no: string;
    neutral: string;
  };
  question: string;
  question_type: 'binary' | 'ternary';
  response: 'yes' | 'no' | 'neutral';
  confidence: PendulumConfidence;
}

export type PendulumQuestionType =
  | 'alignment'
  | 'preferability'
  | 'proceed'
  | 'supported'
  | 'general'
  | 'refusal';

export interface PendulumAnalysisForState {
  question: string;
  answer: 'yes' | 'no' | 'maybe';
  confidence: number;
  swingDirection?: string;
}

/** Mandatory refusal phrase (Tier 2: rephrase to yes/no). */
export const PENDULUM_REFUSAL_PHRASE =
  'Pendulum works with yes/no questions only. Please rephrase to a single decision.';

/** Dependency / repeated-question refusal. */
export const PENDULUM_DEPENDENCY_PHRASE =
  'Pendulum should not be used repeatedly for reassurance.';

/**
 * Classify Pendulum question. Valid: alignment, preferability, proceed, supported. Invalid: predictive, emotional dependency, medical/legal/financial outcome.
 */
export function classifyPendulumQuestion(question: string): PendulumQuestionType {
  const lower = question.toLowerCase().trim();

  // Refusal: predictive
  if (
    /\b(why (is|did) this (happen|happening)|what will happen|when will (it|this) happen|explain the outcome|predict|forecast|what's going to happen|will i (recover|win|get rich|succeed|fail))\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }

  // Refusal: emotional dependency / repeated
  if (
    /\b(tell me again|are you sure|one more time|same question|ask again|reassure|reassurance)\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }

  // Refusal: medical/legal/financial outcome reliance
  if (
    /\b(will i recover|will i win the case|will i get rich|will the (surgery|treatment) work|am i (cured|healed)|will (he|she|they) (die|survive))\b/.test(
      lower
    )
  ) {
    return 'refusal';
  }

  // Refusal: compound or vague (multiple subjects, "and" with distinct propositions)
  if (/\b(and |or |\?.*\?)\b/.test(lower) && lower.split(/\?/).filter(Boolean).length > 2) {
    return 'refusal';
  }

  // Valid types
  if (
    /\b(is (.+) aligned (for me )?(right )?now|is this aligned|aligned for me)\b/.test(
      lower
    )
  ) {
    return 'alignment';
  }
  if (
    /\b(is (this |that )?option preferable|prefer (a|b)|which (one |option )?(to choose|is better))\b/.test(
      lower
    )
  ) {
    return 'preferability';
  }
  if (
    /\b(should i proceed|proceed with this (today )?|go ahead (with |today )?)\b/.test(
      lower
    )
  ) {
    return 'proceed';
  }
  if (
    /\b(is (this |that )?decision supported|is (this |that )?supported)\b/.test(
      lower
    )
  ) {
    return 'supported';
  }

  // General: broad alignment-type phrasing
  if (
    /\b(aligned|alignment|proceed|support|prefer|yes or no|should i)\b/.test(
      lower
    )
  ) {
    return 'general';
  }

  return 'general';
}

/**
 * Sanitize question: one subject, one timeframe (usually now), no emotional wording, no future guarantees.
 */
export function sanitizePendulumQuestion(question: string): string {
  const trimmed = question.trim();
  if (!trimmed) return 'Is proceeding aligned at this time?';

  const lower = trimmed.toLowerCase();

  // Predictive/guarantee patterns → rewrite to alignment
  if (
    /\b(will this make me (successful|rich|happy)|will i (succeed|fail|win))\b/.test(
      lower
    )
  ) {
    return 'Is proceeding with this decision aligned at this time?';
  }
  if (/\b(what (will|would) happen|when will)\b/.test(lower)) {
    return 'Is proceeding with this matter aligned at this time?';
  }

  // Extract core subject from "Is X ...?" or "Should I X?"
  const isMatch = trimmed.match(/^is\s+(.+?)\s*(?:\?|$)/i);
  const shouldMatch = trimmed.match(/^should\s+i\s+(.+?)\s*(?:\?|$)/i);

  if (isMatch) {
    const subject = isMatch[1].trim();
    if (
      /\b(aligned|supported|preferable|okay|good|right)\b/i.test(subject) ||
      subject.endsWith('?')
    ) {
      return trimmed.endsWith('?') ? trimmed : `${trimmed}?`;
    }
    return `Is ${subject} aligned at this time?`;
  }
  if (shouldMatch) {
    const action = shouldMatch[1].trim();
    return `Is ${action} aligned at this time?`;
  }

  // Fallback: wrap as alignment
  const cleaned = trimmed.replace(/\?+$/, '').trim();
  if (cleaned.length > 10) {
    return `Is ${cleaned} aligned at this time?`;
  }
  return 'Is proceeding aligned at this time?';
}

/**
 * Build PendulumState from PendulumAnalysis (from pendulumIntelligence).
 */
export function buildPendulumState(
  analysis: PendulumAnalysisForState
): PendulumState {
  const answer = analysis.answer;
  const numConf = analysis.confidence ?? 75;

  const response: 'yes' | 'no' | 'neutral' =
    answer === 'maybe' ? 'neutral' : answer;

  let confidence: PendulumConfidence = 'clear';
  if (response === 'neutral' || numConf < 70) {
    confidence = 'inconclusive';
  } else if (numConf >= 85) {
    confidence = 'clear';
  } else {
    confidence = 'weak';
  }

  const calibration = {
    yes: 'front-back',
    no: 'side-side',
    neutral: 'still',
  };

  return {
    calibration,
    question: analysis.question,
    question_type: response === 'neutral' ? 'ternary' : 'binary',
    response,
    confidence,
  };
}

/**
 * Format templated response. No LLM—minimal, precise. Binary guidance only; no explanation.
 */
export function formatPendulumResponse(state: PendulumState): string {
  if (state.confidence === 'inconclusive' || state.response === 'neutral') {
    return 'Unclear. The energy is mixed at this moment.';
  }

  if (state.response === 'yes') {
    return 'Yes. The energy shows alignment at this moment.';
  }

  if (state.response === 'no') {
    return 'No. The energy does not show alignment at this time.';
  }

  return 'Unclear. The energy is mixed at this moment.';
}
