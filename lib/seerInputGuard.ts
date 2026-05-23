/**
 * Fast pre-LLM validation for user-facing Seer / structured-AI text inputs.
 * Blocks empty, oversized, regex injection patterns, and heuristic semantic injection.
 */

import {
  classifySeerInjection,
  normalizeForInjectionScan,
  scoreInjectionRisk,
} from '@/lib/seerInjectionClassifier';

export type InputGuardOutcome = 'passed' | 'blocked';

export interface InputGuardResult {
  outcome: InputGuardOutcome;
  reason?: string;
  /** Set when semantic classifier contributes to a block (for aiCallEvents tuning). */
  injectionScore?: number;
  injectionReasons?: string[];
}

/** Default max characters for a single user question (~2.5k chars in article benchmark). */
export const DEFAULT_MAX_INPUT_CHARS = 2500;

/** User-facing message when input guard blocks a Seer question. */
export const SEER_INPUT_BLOCKED_MESSAGE =
  "I can't process that request. Please rephrase your question and try again.";

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /disregard\s+(your\s+)?(system\s+)?prompt/i,
  /you\s+are\s+now\s+(a\s+)?different\s+(ai|assistant|bot)/i,
  /repeat\s+(your\s+)?system\s+prompt/i,
  /reveal\s+(your\s+)?(system\s+)?prompt/i,
  /pretend\s+you\s+have\s+no\s+restrictions/i,
  /jailbreak/i,
  /DAN\s+mode/i,
  /developer\s+mode\s+enabled/i,
  /\bact\s+as\s+if\s+you\s+have\s+no\s+(rules|restrictions|limits)\b/i,
  /override\s+(safety|security|guidelines)/i,
  /\[INST\]/i,
  /<\|im_start\|>/i,
];

export function validateSeerInput(
  text: string,
  options?: { maxChars?: number; skipSemanticClassifier?: boolean },
): InputGuardResult {
  const maxChars = options?.maxChars ?? DEFAULT_MAX_INPUT_CHARS;
  const trimmed = text.trim();

  if (!trimmed) {
    return { outcome: 'blocked', reason: 'Input is empty' };
  }

  if (trimmed.length > maxChars) {
    return { outcome: 'blocked', reason: 'Input exceeds maximum length' };
  }

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { outcome: 'blocked', reason: 'Input matched a disallowed pattern' };
    }
  }

  if (!options?.skipSemanticClassifier) {
    const normalized = normalizeForInjectionScan(trimmed);
    const { score, reasons } = scoreInjectionRisk(normalized);
    if (classifySeerInjection(normalized) === 'blocked') {
      return {
        outcome: 'blocked',
        reason: 'Input matched semantic injection heuristics',
        injectionScore: score,
        injectionReasons: reasons,
      };
    }
  }

  return { outcome: 'passed' };
}
