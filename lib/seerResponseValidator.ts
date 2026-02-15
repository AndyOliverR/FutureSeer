/**
 * Seer Response Contract Validator
 *
 * Enforces the required structure for every Seer answer:
 * 1. Direct answer (1–2 lines)
 * 2. Reason (from ONE primary system)
 * 3. Optional confirmation (1 short line)
 * STOP
 *
 * Blocks: tool lists, confidence dumps, "would you like to explore" spam.
 */

export interface ValidationResult {
  valid: boolean;
  /** Truncated/sanitized answer if original violated contract. */
  sanitized?: string;
  /** Reason for rejection. */
  violation?: string;
}

/** Patterns that indicate contract violation. */
const VIOLATION_PATTERNS = [
  { pattern: /would you like to explore|would you like to know more|shall i (explain|tell)/i, reason: 'exploration spam' },
  { pattern: /(?:^|\n)\s*-\s*(?:Vedic|Western|Numerology|Tarot|KP)\s*:/gm, reason: 'tool dump' },
  { pattern: /\b(confidence|reliability)\s*(?:score|band)?\s*:\s*\d+%?\s*(?:,|\.|$)/gi, reason: 'confidence dump' },
  { pattern: /(?:^|\n)\d+\.\s+[A-Z][^.\n]{50,}/gm, reason: 'numbered list dump' },
  { pattern: /\b(?:in (?:contrast|summary|conclusion)|additionally|furthermore)\s*[,:]/i, reason: 'meta-commentary' },
];

/** Max length for direct answer (first 1-2 lines). */
const DIRECT_ANSWER_MAX_CHARS = 400;

/** Max reasonable answer length before truncation. */
const MAX_ANSWER_LENGTH = 1200;

/**
 * Validate and optionally sanitize a Seer answer.
 * Returns valid: true if answer meets contract; false if violation detected.
 * When violation: sanitized may contain a truncated version.
 */
export function validateSeerResponse(answer: string): ValidationResult {
  if (!answer || typeof answer !== 'string') {
    return { valid: false, violation: 'empty or invalid answer' };
  }

  const trimmed = answer.trim();

  for (const { pattern, reason } of VIOLATION_PATTERNS) {
    if (pattern.test(trimmed)) {
      const sanitized = truncateToContract(trimmed);
      return { valid: false, violation: reason, sanitized };
    }
  }

  if (trimmed.length > MAX_ANSWER_LENGTH) {
    return { valid: false, violation: 'exceeds max length', sanitized: truncateToContract(trimmed) };
  }

  return { valid: true };
}

/**
 * Truncate answer to fit contract: direct answer + reason + optional confirmation.
 * Keeps first ~2 paragraphs, removes trailing meta.
 */
function truncateToContract(answer: string): string {
  const paragraphs = answer.split(/\n\n+/);
  const kept: string[] = [];
  let totalLen = 0;

  for (const p of paragraphs) {
    const pTrim = p.trim();
    if (!pTrim) continue;
    if (totalLen + pTrim.length > MAX_ANSWER_LENGTH) break;
    kept.push(pTrim);
    totalLen += pTrim.length;
    if (kept.length >= 3) break;
  }

  let out = kept.join('\n\n');

  // Remove trailing "Would you like to explore..." etc.
  out = out.replace(/\n*(?:would you like|shall i|do you want)[\s\S]*$/i, '').trim();

  return out;
}

/** Banned phrases in Seer output; replace with a short precise message. */
const BANNED_ERROR_PHRASES = [
  /I apologize,?\s*but I encountered an error[^.]*\.?\s*Please try again[^.]*\.?/gi,
  /I encountered an error[^.]*\.?\s*Please try again[^.]*\.?/gi,
  /As previously stated[,.]/gi,
  /This builds on what we just saw[^.]*\.?/gi,
  /Earlier I said[^.]*\.?/gi,
];

const INSUFFICIENT_DATA_MESSAGE = 'Your chart data is incomplete for this question.';

function replaceBannedPhrases(text: string): string {
  let out = text;
  for (const re of BANNED_ERROR_PHRASES) {
    out = out.replace(re, INSUFFICIENT_DATA_MESSAGE);
  }
  return out;
}

/**
 * Apply validator: if invalid, use sanitized version.
 * Replaces banned error phrases with a short precise message before validation.
 * Call this before returning the answer to the client.
 */
export function enforceResponseContract(answer: string): string {
  const cleaned = replaceBannedPhrases(answer);
  const result = validateSeerResponse(cleaned);
  if (result.valid) return cleaned;
  return result.sanitized ?? cleaned.slice(0, MAX_ANSWER_LENGTH);
}
