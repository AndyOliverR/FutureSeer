import { isPaidPlan } from '@/lib/profileEditQuota';
import {
  aliasDeprecatedGroqModel,
  getGroqFastTextModel,
  getGroqTextModel,
} from '@/lib/groqModels';

/**
 * Seer chat model selection: cheaper fast model for free/trial, full model for paid.
 * Override any tier with SEER_CHAT_MODEL (single model for all).
 */
export function getSeerChatModel(selectedPlan: string | undefined): string {
  const force = process.env.SEER_CHAT_MODEL?.trim();
  if (force) return aliasDeprecatedGroqModel(force);

  const fast = process.env.SEER_CHAT_MODEL_FAST?.trim() || getGroqFastTextModel();
  const full = process.env.SEER_CHAT_MODEL_FULL?.trim() || getGroqTextModel();
  return isPaidPlan(selectedPlan) ? aliasDeprecatedGroqModel(full) : aliasDeprecatedGroqModel(fast);
}

export function getSeerMaxTokens(isPaid: boolean, wantsDeep = false): number {
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
  if (wantsDeep) return isPaid ? 1500 : 1200;
  return isPaid ? 1000 : 800;
}
