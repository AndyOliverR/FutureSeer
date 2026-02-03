/**
 * Conflict Classification Engine for Universal Ask the Seer.
 * Classifies how expert responses relate (same topic, different layer) to choose synthesis framing.
 * Never used to silence or overwrite—only to select reframe template.
 */

export type ConflictType =
  | 'A_domain_mismatch'
  | 'B_time_vs_expression'
  | 'C_structural_vs_situational'
  | 'D_symbolic_vs_literal'
  | 'none';

export interface ExpertResponseInput {
  tool: string;
  toolName?: string;
  answer: string;
  /** Optional short summary or first N chars for classification. */
  summary?: string;
}

/** Tools that speak to timing (when). */
const TIMING_TOOLS = new Set(['vedic', 'western', 'numerology', 'iching', 'financial', 'navaratna', 'kp']);

/** Tools that speak to expression/identity (how/who). */
const EXPRESSION_TOOLS = new Set(['numerology', 'kabbalistic', 'nameAnalysis', 'faceReading', 'humanDesign']);

/** Tools that are structural/mechanical. */
const STRUCTURAL_TOOLS = new Set(['vedic', 'western', 'geomancy', 'vastu', 'humanDesign', 'financial', 'medical', 'navaratna']);

/** Tools that are situational/event-based. */
const SITUATIONAL_TOOLS = new Set(['tarot', 'lenormand', 'iching', 'geomancy']);

/** Tools that are symbolic/process-oriented. */
const SYMBOLIC_TOOLS = new Set(['tarot', 'iching', 'dreamSymbols', 'bibliomancy', 'ogham', 'trichakra']);

/** Tools that are literal/outcome-oriented. */
const LITERAL_TOOLS = new Set(['lenormand', 'pendulum', 'sortilege']);

/**
 * Classifies conflict type from expert responses for synthesis framing.
 * - Type A: Same surface topic, different layer (e.g. number as timing vs number as expression).
 * - Type B: One system answers "when", another "how" (time vs expression).
 * - Type C: One mechanical/structural, another situational/event-based.
 * - Type D: One symbolic/process, another literal/outcome.
 */
export function classifyConflict(expertResponses: ExpertResponseInput[]): ConflictType {
  const valid = expertResponses.filter(r => r.tool && (r.answer?.trim() || r.summary?.trim()));
  if (valid.length <= 1) return 'none';

  const tools = new Set(valid.map(r => r.tool));

  // B: time vs expression (e.g. Vedic + Numerology → timing vs expression)
  const hasTiming = [...tools].some(t => TIMING_TOOLS.has(t));
  const hasExpression = [...tools].some(t => EXPRESSION_TOOLS.has(t));
  if (hasTiming && hasExpression && tools.size >= 2) return 'B_time_vs_expression';

  // C: structural vs situational (e.g. Tarot + KP, Vedic + Lenormand)
  const hasStructural = [...tools].some(t => STRUCTURAL_TOOLS.has(t));
  const hasSituational = [...tools].some(t => SITUATIONAL_TOOLS.has(t));
  if (hasStructural && hasSituational && tools.size >= 2) return 'C_structural_vs_situational';

  // D: symbolic vs literal
  const hasSymbolic = [...tools].some(t => SYMBOLIC_TOOLS.has(t));
  const hasLiteral = [...tools].some(t => LITERAL_TOOLS.has(t));
  if (hasSymbolic && hasLiteral && tools.size >= 2) return 'D_symbolic_vs_literal';

  // A: domain mismatch (different jurisdictions answering same question—generic)
  if (tools.size >= 2) return 'A_domain_mismatch';

  return 'none';
}
