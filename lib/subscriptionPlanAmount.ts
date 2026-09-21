import { getCountryPricingConfig } from '@/lib/pricingConfig';

export type SubscriptionPlanId =
  | 'buy-coffee'
  | 'treat-me'
  | 'festive-hamper'
  | 'power-user-trial';

export function isSubscriptionPlanId(plan: unknown): plan is SubscriptionPlanId {
  return (
    plan === 'buy-coffee' ||
    plan === 'treat-me' ||
    plan === 'festive-hamper' ||
    plan === 'power-user-trial'
  );
}

/**
 * Server-authoritative subscription plan amount in Razorpay smallest units.
 * Never trust a client-supplied amount for paid plans.
 */
export function getSubscriptionPlanAmountInSmallestUnit(
  plan: SubscriptionPlanId,
  countryCode: string,
): {
  amountInSmallestUnit: number;
  currency: string;
  majorUnits: number;
} {
  const config = getCountryPricingConfig(countryCode);
  const noSubUnit = config.currency === 'IDR' || config.currency === 'VND';
  const multiplier = noSubUnit ? 1 : 100;

  let majorUnits: number;
  if (plan === 'treat-me') {
    majorUnits = config.pricingTiers.quarterly;
  } else if (plan === 'festive-hamper') {
    majorUnits = config.pricingTiers.annual;
  } else {
    // buy-coffee and power-user-trial both price off monthly Coffee tier
    majorUnits = config.pricingTiers.allFeatures;
  }

  return {
    amountInSmallestUnit: Math.round(majorUnits * multiplier),
    currency: config.currency,
    majorUnits,
  };
}
