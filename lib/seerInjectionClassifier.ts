/**
 * Heuristic semantic injection classifier (no LLM call).
 * Complements regex patterns in seerInputGuard for obfuscated / structural attacks.
 */

export type InjectionClassification = 'safe' | 'blocked';

/** Default score at or above blocks input (after regex pass). Override via `INJECTION_BLOCK_SCORE`. */
export const DEFAULT_INJECTION_BLOCK_SCORE = 4;

/** Resolved block threshold (env-tunable; see docs/AI_INJECTION_TUNING.md). */
export function getInjectionBlockScore(): number {
  const raw = process.env.INJECTION_BLOCK_SCORE;
  if (raw && /^\d+$/.test(raw)) {
    return Math.max(1, Math.min(20, parseInt(raw, 10)));
  }
  return DEFAULT_INJECTION_BLOCK_SCORE;
}

const ROLE_MARKER = /\b(system|assistant|user)\s*:\s*/gi;
const CHAT_TEMPLATE_MARKERS = [
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /\[INST\]/i,
  /<<SYS>>/i,
  /\[\/INST\]/i,
];

const INSTRUCTION_DENSITY = [
  /\byou\s+must\b/i,
  /\byour\s+task\s+is\b/i,
  /\boutput\s+only\b/i,
  /\bdo\s+not\s+mention\b/i,
  /\brespond\s+as\s+if\b/i,
  /\bnew\s+instructions?\b/i,
];

/** Strip zero-width and homoglyph-friendly noise before scoring. */
export function normalizeForInjectionScan(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function scoreInjectionRisk(text: string): { score: number; reasons: string[] } {
  const normalized = normalizeForInjectionScan(text);
  const lower = normalized.toLowerCase();
  let score = 0;
  const reasons: string[] = [];

  for (const pattern of CHAT_TEMPLATE_MARKERS) {
    if (pattern.test(normalized)) {
      score += 4;
      reasons.push('chat_template_marker');
      break;
    }
  }

  const roleHits = (normalized.match(ROLE_MARKER) ?? []).length;
  if (roleHits >= 2) {
    score += 3;
    reasons.push('multiple_role_markers');
  }

  let instructionHits = 0;
  for (const pattern of INSTRUCTION_DENSITY) {
    if (pattern.test(lower)) instructionHits += 1;
  }
  if (instructionHits >= 2) {
    score += 2;
    reasons.push('instruction_density');
  }

  if (/\bignore\b.{0,40}\b(instruction|rule|guideline)/i.test(lower)) {
    score += 3;
    reasons.push('ignore_rules_phrase');
  }

  if (/\b(base64|decode|eval)\b/i.test(lower) && /[A-Za-z0-9+/]{40,}={0,2}/.test(normalized)) {
    score += 3;
    reasons.push('encoded_payload');
  }

  if (normalized.length > 80 && (normalized.match(/[{}[\]<>|]/g) ?? []).length > 12) {
    score += 2;
    reasons.push('delimiter_noise');
  }

  return { score, reasons };
}

export function classifySeerInjection(text: string): InjectionClassification {
  const { score } = scoreInjectionRisk(text);
  return score >= getInjectionBlockScore() ? 'blocked' : 'safe';
}
