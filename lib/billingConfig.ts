import { getCountryPricingConfig } from '@/lib/pricingConfig';
import type { BillingAction, CreditPackId } from '@/lib/billingTypes';

export const CREDIT_COSTS: Record<BillingAction, number> = {
  main_seer: 1,
  tool_seer: 1,
  profile_regen: 8,
};

export const CREDIT_PACK_DEFS: Record<
  CreditPackId,
  { credits: number; priceInInr: number; label: string; tagline: string }
> = {
  starter: {
    credits: 15,
    priceInInr: 49,
    label: 'Starter',
    tagline: 'Keep exploring after your free readings',
  },
  regular: {
    credits: 40,
    priceInInr: 99,
    label: 'Regular',
    tagline: 'Most popular — full app access',
  },
  power: {
    credits: 120,
    priceInInr: 249,
    label: 'Power',
    tagline: 'Deep dives across every tool',
  },
};

const INDIA_MONTHLY = 99;

/** Country-local pack price using the same PPP ratio as Coffee monthly. */
export function getCreditPackPrice(countryCode: string, packId: CreditPackId): number {
  const config = getCountryPricingConfig(countryCode);
  const def = CREDIT_PACK_DEFS[packId];
  const localMonthly = config.pricingTiers.allFeatures;
  const ratio = localMonthly / INDIA_MONTHLY;
  const raw = def.priceInInr * ratio;
  if (config.currency === 'INR' || config.currency === 'PKR' || config.currency === 'BDT') {
    return Math.round(raw);
  }
  return Math.round(raw * 100) / 100;
}

export function getCreditPackOffer(countryCode: string, packId: CreditPackId) {
  const config = getCountryPricingConfig(countryCode);
  const def = CREDIT_PACK_DEFS[packId];
  const price = getCreditPackPrice(countryCode, packId);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits:
      config.currency === 'INR' || config.currency === 'PKR' || config.currency === 'BDT' ? 0 : 2,
    maximumFractionDigits:
      config.currency === 'INR' || config.currency === 'PKR' || config.currency === 'BDT' ? 0 : 2,
  }).format(price);

  return {
    packId,
    credits: def.credits,
    price,
    currency: config.currency,
    currencySymbol: config.currencySymbol,
    formatted,
    label: def.label,
    tagline: def.tagline,
    perCredit:
      def.credits > 0
        ? new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: config.currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(price / def.credits)
        : formatted,
  };
}

export function listCreditPackOffers(countryCode: string) {
  return (['starter', 'regular', 'power'] as CreditPackId[]).map((id) =>
    getCreditPackOffer(countryCode, id),
  );
}

export function amountToSmallestUnit(amount: number, currency: string): number {
  if (currency === 'IDR' || currency === 'VND') return Math.round(amount);
  return Math.round(amount * 100);
}

export function toolSlugFromSeerRoute(routeKey: string): string {
  return routeKey.replace(/^ask-/, '').replace(/-seer$/, '');
}
