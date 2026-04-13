/**
 * Approximate currency-to-USD rates for Razorpay plan fallback.
 * Used when display currency is not supported by Razorpay Plans API (e.g. AED, GBP).
 * Rates are approximate; settlement is in INR by Razorpay based on their conversion.
 */

/** 1 unit of currency = this many USD. Updated periodically. */
export const CURRENCY_TO_USD_RATE: Record<string, number> = {
  GBP: 1.27,
  CAD: 0.73,
  AUD: 0.65,
  EUR: 1.08,
  SGD: 0.74,
  AED: 0.27,
  BRL: 0.18,
  MXN: 0.058,
  PKR: 0.0036,
  BDT: 0.0085,
  IDR: 0.000063,
  PHP: 0.017,
  THB: 0.029,
  VND: 0.00004,
  MYR: 0.22,
  ZAR: 0.055,
};

/** Currencies that have no subunit (amount is in whole units). */
const NO_SUBUNIT_CURRENCIES = new Set(['IDR', 'VND']);

/**
 * Convert amount in smallest unit of fromCurrency to USD cents for Razorpay plan.
 * - Most currencies: amount is in hundredths (e.g. AED 39.99 → 3999).
 * - IDR, VND: amount is in whole units.
 */
export function convertToUsdCents(
  amountInSmallestUnit: number,
  fromCurrency: string
): number {
  const currency = fromCurrency.toUpperCase();
  const rate = CURRENCY_TO_USD_RATE[currency];
  if (rate == null) {
    return Math.max(100, amountInSmallestUnit);
  }
  let usdMajor: number;
  if (NO_SUBUNIT_CURRENCIES.has(currency)) {
    usdMajor = amountInSmallestUnit * rate;
  } else {
    usdMajor = (amountInSmallestUnit / 100) * rate;
  }
  const cents = Math.round(usdMajor * 100);
  return Math.max(100, cents);
}

/** Approximate USD→INR for plan-internal amounts (Razorpay India merchants often accept INR plans only). */
const USD_TO_INR = 83;

/**
 * Convert amount in smallest unit of fromCurrency to INR paise for Razorpay Plans API.
 * Reuses {@link convertToUsdCents} so rates stay consistent, then maps USD → INR.
 */
export function convertSmallestUnitToInrPaise(
  amountInSmallestUnit: number,
  fromCurrency: string
): number {
  const usdCents = convertToUsdCents(amountInSmallestUnit, fromCurrency);
  const usdMajor = usdCents / 100;
  const inrPaise = Math.round(usdMajor * USD_TO_INR * 100);
  return Math.max(100, inrPaise);
}
