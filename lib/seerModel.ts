import { isPaidPlan } from '@/lib/profileEditQuota';
import {
  GROQ_DEFAULT_FAST_TEXT_MODEL,
  GROQ_DEFAULT_TEXT_MODEL,
  normalizeGroqTextModel,
} from '@/lib/groqModels';

/**
 * Seer chat model selection: smaller GPT-OSS for free/trial, 120B for paid.
 * Override any tier with SEER_CHAT_MODEL (single model for all).
 */
export function getSeerChatModel(selectedPlan: string | undefined): string {
  const force = process.env.SEER_CHAT_MODEL?.trim();
  if (force) return normalizeGroqTextModel(force);

  const fast = process.env.SEER_CHAT_MODEL_FAST?.trim() || GROQ_DEFAULT_FAST_TEXT_MODEL;
  const full = process.env.SEER_CHAT_MODEL_FULL?.trim() || GROQ_DEFAULT_TEXT_MODEL;
  return normalizeGroqTextModel(isPaidPlan(selectedPlan) ? full : fast);
}

export function getSeerMaxTokens(isPaid: boolean): number {
  const paid = process.env.SEER_MAX_TOKENS_PAID?.trim();
  const free = process.env.SEER_MAX_TOKENS_FREE?.trim();
  if (isPaid && paid) {
    const n = Number.parseInt(paid, 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  if (!isPaid && free) {
    const n = Number.parseInt(free, 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return isPaid ? 500 : 400;
}
