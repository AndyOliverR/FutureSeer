/** Server-side membership fields written after a verified Razorpay subscription payment. */

export const PAID_MEMBERSHIP_PLANS = ['buy-coffee', 'treat-me', 'festive-hamper'] as const;

export type PaidMembershipPlan = (typeof PAID_MEMBERSHIP_PLANS)[number];

export type PaidMembershipPatch = {
  selectedPlan: PaidMembershipPlan;
  isSubscribed: true;
  subscriptionStatus: 'active';
  subscriptionId: string;
  paymentMethodId?: string;
};

const BLOCKED_SUBSCRIPTION_STATUSES = new Set(['cancelled', 'canceled', 'expired']);

export function isPaidMembershipPlan(plan: unknown): plan is PaidMembershipPlan {
  return typeof plan === 'string' && (PAID_MEMBERSHIP_PLANS as readonly string[]).includes(plan);
}

export function classifySubscriptionPlan(plan: unknown): 'paid' | 'trial' | 'unknown' {
  if (isPaidMembershipPlan(plan)) return 'paid';
  if (plan === 'power-user-trial' || plan === 'trial') return 'trial';
  return 'unknown';
}

/**
 * Fields that satisfy hasActiveSubscriptionAccess / hasUnlimitedBillingAccess.
 * paymentMethodId is omitted when absent so a later webhook cannot wipe a real id.
 */
export function paidMembershipPatch(input: {
  plan: unknown;
  subscriptionId: string;
  paymentId?: string | null;
}): PaidMembershipPatch | null {
  if (!isPaidMembershipPlan(input.plan)) return null;
  const subscriptionId = input.subscriptionId.trim();
  if (!subscriptionId) return null;
  const patch: PaidMembershipPatch = {
    selectedPlan: input.plan,
    isSubscribed: true,
    subscriptionStatus: 'active',
    subscriptionId,
  };
  const paymentId = typeof input.paymentId === 'string' ? input.paymentId.trim() : '';
  if (!paymentId) return patch;
  return { ...patch, paymentMethodId: paymentId };
}

export type VerifySubscriptionGrantFailure =
  | 'unbound_subscription'
  | 'user_mismatch'
  | 'trial_plan'
  | 'unknown_plan'
  | 'inactive_subscription'
  | 'missing_payment';

export function verifySubscriptionGrant(input: {
  authUid: string;
  notesUserId: unknown;
  notesPlan: unknown;
  razorpayStatus: unknown;
  subscriptionId: string;
  paymentId: string;
}):
  | { ok: true; userId: string; patch: PaidMembershipPatch & { paymentMethodId: string } }
  | { ok: false; reason: VerifySubscriptionGrantFailure } {
  const notesUserId = typeof input.notesUserId === 'string' ? input.notesUserId.trim() : '';
  if (!notesUserId) return { ok: false, reason: 'unbound_subscription' };
  if (notesUserId !== input.authUid) return { ok: false, reason: 'user_mismatch' };

  const status =
    typeof input.razorpayStatus === 'string' ? input.razorpayStatus.trim().toLowerCase() : '';
  if (status && BLOCKED_SUBSCRIPTION_STATUSES.has(status)) {
    return { ok: false, reason: 'inactive_subscription' };
  }

  const planKind = classifySubscriptionPlan(input.notesPlan);
  if (planKind === 'trial') return { ok: false, reason: 'trial_plan' };
  if (planKind === 'unknown') return { ok: false, reason: 'unknown_plan' };

  const patch = paidMembershipPatch({
    plan: input.notesPlan,
    subscriptionId: input.subscriptionId,
    paymentId: input.paymentId,
  });
  if (!patch?.paymentMethodId) return { ok: false, reason: 'missing_payment' };
  return { ok: true, userId: notesUserId, patch: { ...patch, paymentMethodId: patch.paymentMethodId } };
}
