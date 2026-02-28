/**
 * Subscription configuration: no-charge emails (god mode, mary mode, special test admin).
 * Used by create-subscription, admin cancel-user-subscription, and client access checks.
 */

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
