/**
 * Main Seer regression assertion engine.
 * Validates structural expectations only (domain, intent, tool scope, forbidden content).
 * No subjective evaluation of wording.
 */

const BANNED_PHRASES = [
  'This builds on what we just saw',
  'Earlier I said',
  'As previously stated',
  'I apologize, but I encountered an error',
  'Please try again.',
];

const GENERIC_CLARIFY =
  /Could you clarify what you'd like to know\? For example: timing, career, relationships, remedies, life purpose, or health\?/i;

const PERSONALITY_DRIFT = /\b(10th house|Moon in \d|teaching.*career|career.*teaching)\b/i;

export interface SeerResult {
  answer?: string;
  response?: string;
  confidence?: number | null;
  domain?: string;
  intent?: string;
  activeIntent?: string;
  timing_window?: unknown;
  sessionState?: { activeIntent?: string; activeSubIntent?: string };
}

export interface ExpectedOutcome {
  domain?: string;
  domain_one_of?: string[];
  no_personality_dump?: boolean;
  no_banned_phrases?: boolean;
  no_error_phrase_in_answer?: boolean;
  no_generic_clarify?: boolean;
  no_generic_clarify_list?: boolean;
  clarification_targeted?: boolean;
  clarification_targeted_or_answer?: boolean;
  no_predictive_tools?: boolean;
  no_predictive_dump?: boolean;
  no_diagnosis?: boolean;
  no_timing_window?: boolean;
  no_wrong_timing_window?: boolean;
  not_purpose_answer?: boolean;
  disclaimer_or_lifestyle_only?: boolean;
  single_clean_message_if_low_data?: boolean;
  no_career_only_clarify?: boolean;
  no_dasha_plus_error?: boolean;
}

export interface AssertionResult {
  passed: boolean;
  errors: string[];
}

function getAnswer(result: SeerResult): string {
  return (result.answer ?? result.response ?? '').trim();
}

function getDomain(result: SeerResult): string {
  return (result.domain ?? result.activeIntent ?? result.sessionState?.activeIntent ?? '').trim().toLowerCase();
}

export function assertResult(result: SeerResult, expected: ExpectedOutcome): AssertionResult {
  const errors: string[] = [];
  const answer = getAnswer(result);
  const domain = getDomain(result);

  if (expected.domain && domain !== expected.domain) {
    errors.push(`Domain mismatch: expected "${expected.domain}", got "${domain || '(none)'}"`);
  }

  if (expected.domain_one_of?.length) {
    const match = expected.domain_one_of.some((d) => domain === d.trim().toLowerCase());
    if (!match && domain) {
      errors.push(`Domain not in allowed set: expected one of [${expected.domain_one_of.join(', ')}], got "${domain}"`);
    }
  }

  if (expected.no_personality_dump && PERSONALITY_DRIFT.test(answer)) {
    errors.push('Personality drift detected in answer (e.g. 10th house, teaching/career)');
  }

  if (expected.no_banned_phrases) {
    for (const phrase of BANNED_PHRASES) {
      if (answer.includes(phrase)) {
        errors.push(`Banned phrase found: "${phrase.slice(0, 40)}..."`);
        break;
      }
    }
  }

  if (expected.no_error_phrase_in_answer) {
    if (/I apologize,?\s*but I encountered an error/i.test(answer) || /cannot be concluded from your current chart data/i.test(answer)) {
      errors.push('Error phrase or "cannot be concluded" found in answer');
    }
  }

  if (expected.no_generic_clarify && GENERIC_CLARIFY.test(answer)) {
    errors.push('Generic clarification used instead of targeted');
  }

  if (expected.no_generic_clarify_list && GENERIC_CLARIFY.test(answer)) {
    errors.push('Generic "clarify what you\'d like to know" list used');
  }

  if (expected.clarification_targeted) {
    if (GENERIC_CLARIFY.test(answer)) {
      errors.push('Expected targeted clarification, got generic');
    }
  }

  if (expected.clarification_targeted_or_answer) {
    if (GENERIC_CLARIFY.test(answer) && answer.length < 200) {
      errors.push('Expected targeted clarification or substantive answer, got generic short clarify');
    }
  }

  if (expected.no_predictive_tools || expected.no_predictive_dump) {
    if (/\b\d{1,2}\/\d{1,2}\/\d{4}\s*[–-]\s*\d{1,2}\/\d{1,2}\/\d{4}\b/.test(answer) && /dasha|dasha period/i.test(answer)) {
      errors.push('Predictive timing/dasha used for psychological/reflective question');
    }
  }

  if (expected.no_diagnosis && /diagnos(is|e)|treatment for|medication for|you have [A-Za-z]+ disease/i.test(answer)) {
    errors.push('Diagnosis-like language in health answer');
  }

  if (expected.no_timing_window && result.timing_window && answer.length > 50) {
    errors.push('Timing window present when not requested (purpose-only question)');
  }

  if (expected.not_purpose_answer && domain === 'purpose') {
    errors.push('Expected relationship for soulmate/karmic, got purpose');
  }

  if (expected.no_dasha_plus_error) {
    if (/dasha|mahadasha|antardasha/i.test(answer) && /I apologize|Please try again|cannot be concluded/i.test(answer)) {
      errors.push('Dasha content mixed with error phrase');
    }
  }

  if (expected.no_career_only_clarify) {
    if (/Would you like insight on:.*career timing and opportunities/i.test(answer) && /marriage|relationship/i.test(answer) === false) {
      errors.push('Career-only clarification for cross-domain marriage+career question');
    }
  }

  return {
    passed: errors.length === 0,
    errors,
  };
}
