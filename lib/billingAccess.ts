import { hasActiveSubscriptionAccess } from '@/lib/authRouting';
import { isNoChargeSubscriptionEmail } from '@/lib/subscriptionConfig';
import type { BillingUserFields } from '@/lib/billingTypes';

/** Unlimited AI / regen — active membership or comp accounts. */
export function hasUnlimitedBillingAccess(profile: BillingUserFields | null | undefined): boolean {
  if (!profile) return false;
  if (profile.noChargeAccount === true) return true;
  const email = typeof profile.email === 'string' ? profile.email : undefined;
  if (isNoChargeSubscriptionEmail(email)) return true;
  return hasActiveSubscriptionAccess(profile);
}

export function resolveBillingMode(profile: BillingUserFields | null | undefined): 'payg' | 'subscription' {
  if (hasUnlimitedBillingAccess(profile)) return 'subscription';
  if (profile?.billingMode === 'subscription') return 'subscription';
  return 'payg';
}
