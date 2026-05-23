/**
 * Priority-ordered prompt token budgeting (chars/4 heuristic — no tiktoken dependency).
 * Lower priority number = kept first; lowest-priority chunks truncate or drop.
 */

export const APPROX_CHARS_PER_TOKEN = 4;

export interface BudgetedChunk {
  id: string;
  /** Lower number = higher priority (kept first). */
  priority: number;
  text: string;
}

export interface TokenBudgetAllocation {
  chunks: Array<{ id: string; text: string; truncated: boolean }>;
  estimatedTokensUsed: number;
  droppedIds: string[];
}

export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / APPROX_CHARS_PER_TOKEN);
}

export function truncateToTokenBudget(
  text: string,
  maxTokens: number,
  suffix = '\n\n[... truncated for context limits]',
): { text: string; truncated: boolean } {
  const maxChars = Math.max(0, maxTokens * APPROX_CHARS_PER_TOKEN);
  if (text.length <= maxChars) return { text, truncated: false };
  const body = text.slice(0, Math.max(0, maxChars - suffix.length));
  return { text: body + suffix, truncated: true };
}

/**
 * Fit chunks into `maxTokens` by priority. Never drops priority 0 chunks entirely —
 * they truncate instead.
 */
export function allocateTokenBudget(
  chunks: BudgetedChunk[],
  maxTokens: number,
): TokenBudgetAllocation {
  const sorted = [...chunks].sort((a, b) => a.priority - b.priority);
  let used = 0;
  const result: TokenBudgetAllocation['chunks'] = [];
  const droppedIds: string[] = [];

  for (const chunk of sorted) {
    const need = estimateTokens(chunk.text);
    if (need === 0) continue;

    if (used + need <= maxTokens) {
      result.push({ id: chunk.id, text: chunk.text, truncated: false });
      used += need;
      continue;
    }

    const remaining = maxTokens - used;
    if (remaining <= 0) {
      if (chunk.priority === 0) {
        const { text, truncated } = truncateToTokenBudget(chunk.text, Math.max(1, maxTokens));
        result.push({ id: chunk.id, text, truncated });
        used = estimateTokens(text);
      } else {
        droppedIds.push(chunk.id);
      }
      continue;
    }

    const { text, truncated } = truncateToTokenBudget(chunk.text, remaining);
    if (text.trim()) {
      result.push({ id: chunk.id, text, truncated });
      used += estimateTokens(text);
    } else {
      droppedIds.push(chunk.id);
    }
  }

  return { chunks: result, estimatedTokensUsed: used, droppedIds };
}
