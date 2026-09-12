import { hasActiveSubscriptionAccess } from '@/lib/authRouting';
import { isNoChargeSubscriptionEmail } from '@/lib/subscriptionConfig';
import type { BillingUserFields } from '@/lib/billingTypes';

/**
 * Email used for no-charge allowlist checks. Only Firebase Auth email is trusted.
 * Firestore `users.email` is client-writable and must not grant unlimited billing.
 */
export function trustedBillingEmail(
  authEmail: string | null | undefined,
): string | undefined {
  if (typeof authEmail !== 'string') return undefined;
  const trimmed = authEmail.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Replace any client-supplied email with the Auth token / Admin Auth email. */
export function withTrustedBillingEmail<T extends BillingUserFields>(
  profile: T,
  authEmail: string | null | undefined,
): T {
  return { ...profile, email: trustedBillingEmail(authEmail) };
}

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
