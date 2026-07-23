/**
 * Subscription configuration: no-charge emails (god / mary / special test admin).
 * Used by create-subscription, admin cancel-user-subscription, and client access checks.
 * Emails come from env only — never hardcode personal addresses in source.
 */
import type { UserProfile } from './firebase';

function parseEmailList(raw: string | undefined): string[] {
  if (!raw || typeof raw !== 'string' || !raw.trim()) return [];
  return raw.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
}

/** Lowercase set for fast lookup. Set NO_CHARGE_SUBSCRIPTION_EMAILS (comma-separated) on the server. */
export function getNoChargeSubscriptionEmails(): Set<string> {
  return new Set(parseEmailList(process.env.NO_CHARGE_SUBSCRIPTION_EMAILS));
}

/**
 * Client allowlist (build-time public env). Prefer NEXT_PUBLIC_NO_CHARGE_SUBSCRIPTION_EMAILS;
 * otherwise unions role email envs used for UI gating.
 */
export function getNoChargeSubscriptionEmailsClient(): string[] {
  const explicit = parseEmailList(process.env.NEXT_PUBLIC_NO_CHARGE_SUBSCRIPTION_EMAILS);
  if (explicit.length > 0) return explicit;
  return [
    ...parseEmailList(process.env.NEXT_PUBLIC_SUPERADMIN_EMAILS),
    ...parseEmailList(process.env.NEXT_PUBLIC_ADMIN_EMAILS),
    ...parseEmailList(process.env.NEXT_PUBLIC_SPECIAL_USER_EMAILS),
  ];
}

/** @deprecated Use getNoChargeSubscriptionEmailsClient() — kept for older imports. */
export const NO_CHARGE_SUBSCRIPTION_EMAILS_CLIENT: string[] = [];

/** Server-side: check against env-aware set. */
export function isNoChargeSubscriptionEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== 'string') return false;
  return getNoChargeSubscriptionEmails().has(email.trim().toLowerCase());
}

/** Client-side: check against public env allowlists. */
export function isNoChargeSubscriptionEmailClient(email: string | null | undefined): boolean {
  if (!email || typeof email !== 'string') return false;
  return getNoChargeSubscriptionEmailsClient().includes(email.trim().toLowerCase());
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

type FirstGenerationFieldOptions = {
  allowUnknownBirthTime?: boolean;
};

export function getMissingFirstGenerationFields(
  profile: Partial<UserProfile> | null | undefined,
  options?: FirstGenerationFieldOptions,
): string[] {
  const missing = getMissingFullProfileFields(profile);
  if (!options?.allowUnknownBirthTime) return missing;

  // Birth time is considered complete when user explicitly marks it as unknown.
  if (missing.includes('birthTime') && profile?.birthTimeKnown === false) {
    return missing.filter((field) => field !== 'birthTime');
  }
  return missing;
}

export function canRunFullPipeline(profile: Partial<UserProfile> | null | undefined): boolean {
  if (!profile) return false;
  if (getMissingFullProfileFields(profile).length > 0) return false;
  if (profile.noChargeAccount === true) return true;
  const email = typeof profile.email === 'string' ? profile.email : undefined;
  if (isNoChargeSubscriptionEmail(email)) return true;
  const selectedPlan = typeof profile.selectedPlan === 'string' ? profile.selectedPlan.trim().toLowerCase() : '';
  const paymentMethodId = typeof profile.paymentMethodId === 'string' ? profile.paymentMethodId.trim() : '';
  const subscriptionStatus = typeof profile.subscriptionStatus === 'string' ? profile.subscriptionStatus.trim().toLowerCase() : '';
  const hasPaidPlan = !!selectedPlan && selectedPlan !== 'power-user-trial' && selectedPlan !== 'trial';
  const hasActivePaidStatus = subscriptionStatus === 'active';
  return (hasPaidPlan || hasActivePaidStatus) && paymentMethodId.length > 0;
}
