/**
 * Profile edit quota by plan (internal only; not shown to users).
 * Free: 5 lifetime edits; Monthly: 6/month; Quarterly: 7/month; Annual: 8/month.
 */

export const EDIT_LIMIT_FREE = 5;
export const EDIT_LIMIT_MONTHLY = 6;
export const EDIT_LIMIT_QUARTERLY = 7;
export const EDIT_LIMIT_ANNUAL = 8;

/** Plan IDs that are treated as free (lifetime cap of 5). */
const FREE_PLANS = new Set(['power-user-trial', 'trial', '']);

/**
 * Returns the edit limit for the given selectedPlan.
 * power-user-trial, trial, or missing → 5 (free).
 * buy-coffee → 6 (monthly); treat-me → 7 (quarterly); festive-hamper → 8 (annual).
 */
export function getEditLimit(selectedPlan: string | undefined): number {
  if (!selectedPlan || typeof selectedPlan !== 'string') return EDIT_LIMIT_FREE;
  const plan = selectedPlan.trim().toLowerCase();
  if (FREE_PLANS.has(plan)) return EDIT_LIMIT_FREE;
  if (plan === 'buy-coffee') return EDIT_LIMIT_MONTHLY;
  if (plan === 'treat-me') return EDIT_LIMIT_QUARTERLY;
  if (plan === 'festive-hamper') return EDIT_LIMIT_ANNUAL;
  return EDIT_LIMIT_FREE;
}

/** Start of current UTC month as timestamp (ms). Used for paid monthly reset. */
export function getPeriodStartForReset(now: Date): number {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  return Date.UTC(y, m, 1, 0, 0, 0, 0);
}

/**
 * True if the user is on a paid plan and we're in a new month compared to periodStart.
 * Used to reset profileEditCount at the start of each month for paid users.
 */
export function shouldResetPeriod(
  periodStart: number | undefined,
  now: Date,
  isPaid: boolean
): boolean {
  if (!isPaid) return false;
  if (periodStart == null || typeof periodStart !== 'number') return true;
  const currentMonthStart = getPeriodStartForReset(now);
  return currentMonthStart > periodStart;
}

/** True if selectedPlan is a paid plan (monthly, quarterly, annual). */
export function isPaidPlan(selectedPlan: string | undefined): boolean {
  if (!selectedPlan || typeof selectedPlan !== 'string') return false;
  const plan = selectedPlan.trim().toLowerCase();
  return plan === 'buy-coffee' || plan === 'treat-me' || plan === 'festive-hamper';
}

/**
 * Returns user-facing over-quota message: upgrade to next tier, or contact for business.
 * Free → upgrade to paid; Monthly → Quarterly/Annual; Quarterly → Annual; Annual (999 tier) → contact for more.
 */
export function getOverQuotaMessage(selectedPlan: string | undefined): string {
  if (!selectedPlan || typeof selectedPlan !== 'string') {
    return 'Profile update limit reached for this period. Upgrade to a paid plan for more.';
  }
  const plan = selectedPlan.trim().toLowerCase();
  if (FREE_PLANS.has(plan)) {
    return 'Profile update limit reached for this period. Upgrade to a paid plan for more.';
  }
  if (plan === 'buy-coffee') {
    return 'Profile update limit reached for this period. Upgrade to Quarterly or Annual for more.';
  }
  if (plan === 'treat-me') {
    return 'Profile update limit reached for this period. Upgrade to Annual for more.';
  }
  if (plan === 'festive-hamper') {
    return 'Profile update limit reached for this period. Contact us for business or higher usage.';
  }
  return 'Profile update limit reached for this period. Upgrade your plan for more.';
}
