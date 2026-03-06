/**
 * Currencies that Razorpay's subscription Plans API accepts.
 * Razorpay returns "Currency provided is not supported" for others (e.g. AED, GBP, BRL).
 * Add more codes here if Razorpay enables them for your account.
 */
export const RAZORPAY_PLAN_CURRENCIES: readonly string[] = ['INR', 'USD'];

export function isRazorpayPlanCurrency(currency: string): boolean {
  return RAZORPAY_PLAN_CURRENCIES.includes(currency.toUpperCase());
}
