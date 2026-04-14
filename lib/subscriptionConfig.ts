/**
 * Subscription configuration: no-charge emails (god mode, mary mode, special test admin).
 * Used by create-subscription, admin cancel-user-subscription, and client access checks.
 */
import type { UserProfile } from './firebase';

const DEFAULT_NO_CHARGE_EMAILS = [
  'andyrozario@hotmail.com',
  'andyoliverrozario2@gmail.com',
  'andyrozario7@gmail.com',
];

/** Lowercase set for fast lookup. Override via env NO_CHARGE_SUBSCRIPTION_EMAILS (comma-separated). */
export function getNoChargeSubscriptionEmails(): Set<string> {
  const env = process.env.NO_CHARGE_SUBSCRIPTION_EMAILS;
  if (env && typeof env === 'string' && env.trim()) {
    const list = env.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
    return new Set(list);
  }
  return new Set(DEFAULT_NO_CHARGE_EMAILS.map((e) => e.toLowerCase()));
}

/** For client: same list so access checks can treat these emails as premium. Not secret. */
export const NO_CHARGE_SUBSCRIPTION_EMAILS_CLIENT = DEFAULT_NO_CHARGE_EMAILS.map((e) => e.toLowerCase());

/** Server-side: check against env-aware set. */
export function isNoChargeSubscriptionEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== 'string') return false;
  return getNoChargeSubscriptionEmails().has(email.trim().toLowerCase());
}

/** Client-side: check against static list (no process.env). */
export function isNoChargeSubscriptionEmailClient(email: string | null | undefined): boolean {
  if (!email || typeof email !== 'string') return false;
  return NO_CHARGE_SUBSCRIPTION_EMAILS_CLIENT.includes(email.trim().toLowerCase());
}

const FULL_REPORT_REQUIRED_FIELDS: Array<keyof UserProfile> = [
  'displayName',
  'fullName',
  'gender',
  'birthDate',
  'birthTime',
  'birthPlace',
  'currentLocation',
  'facePhotoUrl',
  'palmPhotoUrl',
];

export function isTrialActive(profile: Partial<UserProfile> | null | undefined): boolean {
  if (!profile) return false;
  const status = String(profile.subscriptionStatus ?? '').toLowerCase();
  if (status !== 'trial') return false;
  const trialEnd = Number(profile.trialEndDate ?? profile.trialEndTime ?? 0);
  if (!Number.isFinite(trialEnd) || trialEnd <= 0) return true;
  return trialEnd > Date.now();
}

export function isTrialExpired(profile: Partial<UserProfile> | null | undefined): boolean {
  if (!profile) return false;
  const status = String(profile.subscriptionStatus ?? '').toLowerCase();
  if (status === 'cancelled' || status === 'expired') return true;
  const trialEnd = Number(profile.trialEndDate ?? profile.trialEndTime ?? 0);
  if (!Number.isFinite(trialEnd) || trialEnd <= 0) return false;
  return trialEnd <= Date.now();
}

export function getMissingFullProfileFields(profile: Partial<UserProfile> | null | undefined): string[] {
  if (!profile) return [...FULL_REPORT_REQUIRED_FIELDS];
  const missing: string[] = [];
  for (const field of FULL_REPORT_REQUIRED_FIELDS) {
    const value = profile[field];
    if (typeof value === 'string') {
      if (!value.trim()) missing.push(field);
      continue;
    }
    if (value === null || value === undefined) {
      missing.push(field);
    }
  }
  return missing;
}

export function canRunFullPipeline(profile: Partial<UserProfile> | null | undefined): boolean {
  if (!profile) return false;
  if (getMissingFullProfileFields(profile).length > 0) return false;
  const email = typeof profile.email === 'string' ? profile.email : undefined;
  if (isNoChargeSubscriptionEmail(email)) return true;
  const selectedPlan = typeof profile.selectedPlan === 'string' ? profile.selectedPlan.trim().toLowerCase() : '';
  const paymentMethodId = typeof profile.paymentMethodId === 'string' ? profile.paymentMethodId.trim() : '';
  const subscriptionStatus = typeof profile.subscriptionStatus === 'string' ? profile.subscriptionStatus.trim().toLowerCase() : '';
  const hasPaidPlan = !!selectedPlan && selectedPlan !== 'power-user-trial' && selectedPlan !== 'trial';
  const hasActivePaidStatus = subscriptionStatus === 'active';
  return (hasPaidPlan || hasActivePaidStatus) && paymentMethodId.length > 0;
}
