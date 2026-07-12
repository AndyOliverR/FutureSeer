import type { BillingAction, BillingUserFields, FreeUseConsumed } from '@/lib/billingTypes';

export function normalizeFreeUseConsumed(raw: unknown): FreeUseConsumed {
  if (!raw || typeof raw !== 'object') return {};
  const rec = raw as FreeUseConsumed;
  const toolSeer =
    rec.toolSeer && typeof rec.toolSeer === 'object' ? { ...rec.toolSeer } : undefined;
  return {
    mainSeer: rec.mainSeer === true ? true : undefined,
    profileRegen: rec.profileRegen === true ? true : undefined,
    toolSeer,
  };
}

export function isFreeInstanceAvailable(
  action: BillingAction,
  freeUse: FreeUseConsumed,
  toolSlug?: string,
): boolean {
  if (action === 'main_seer') return freeUse.mainSeer !== true;
  if (action === 'profile_regen') return freeUse.profileRegen !== true;
  if (action === 'tool_seer') {
    const slug = toolSlug?.trim();
    if (!slug) return false;
    return freeUse.toolSeer?.[slug] !== true;
  }
  return false;
}

export function markFreeInstanceConsumed(
  action: BillingAction,
  freeUse: FreeUseConsumed,
  toolSlug?: string,
): FreeUseConsumed {
  const next = normalizeFreeUseConsumed(freeUse);
  if (action === 'main_seer') return { ...next, mainSeer: true };
  if (action === 'profile_regen') return { ...next, profileRegen: true };
  if (action === 'tool_seer' && toolSlug?.trim()) {
    return {
      ...next,
      toolSeer: { ...(next.toolSeer ?? {}), [toolSlug.trim()]: true },
    };
  }
  return next;
}

export function creditBalanceFromProfile(profile: BillingUserFields | null | undefined): number {
  const n = profile?.creditBalance;
  if (typeof n !== 'number' || !Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}
