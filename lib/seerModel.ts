import { isPaidPlan } from '@/lib/profileEditQuota';

/**
 * Seer chat model selection: cheaper 8B for free/trial plans, 70B for paid.
 * Override any tier with SEER_CHAT_MODEL (single model for all).
 */
export function getSeerChatModel(selectedPlan: string | undefined): string {
  const force = process.env.SEER_CHAT_MODEL?.trim();
  if (force) return force;

  const fast = process.env.SEER_CHAT_MODEL_FAST?.trim() || 'llama-3.1-8b-instant';
  const full = process.env.SEER_CHAT_MODEL_FULL?.trim() || 'llama-3.3-70b-versatile';
  return isPaidPlan(selectedPlan) ? full : fast;
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
