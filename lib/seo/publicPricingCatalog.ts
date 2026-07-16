/**
 * Crawlable pricing facts for AI citation and JSON-LD.
 * Mirrors live tiers in lib/pricingConfig (IN base + US market) and membershipTier.
 */

import { COUNTRY_PRICING_CONFIG } from '@/lib/pricingConfig';
import { MEMBERSHIP_TIER_FEATURES } from '@/lib/membershipTierCopy';

export type PublicPricingOffer = {
  id: string;
  name: string;
  billingPeriod: 'Trial' | 'Month' | 'Quarter' | 'Year';
  description: string;
  features: readonly string[];
  /** Display prices by market for SSR tables. */
  prices: Array<{
    countryCode: string;
    currency: string;
    currencySymbol: string;
    amount: number | null;
    priceLabel: string;
  }>;
};

function moneyLabel(symbol: string, amount: number, period: string): string {
  const rounded = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  return `${symbol}${rounded}/${period}`;
}

const inCfg = COUNTRY_PRICING_CONFIG.IN;
const usCfg = COUNTRY_PRICING_CONFIG.US;

export const PUBLIC_PRICING_OFFERS: PublicPricingOffer[] = [
  {
    id: 'power-user-trial',
    name: 'Power User Trial',
    billingPeriod: 'Trial',
    description: '30-day trial with teaser previews across tools. Full reports unlock with a paid membership.',
    features: MEMBERSHIP_TIER_FEATURES['power-user-trial'],
    prices: [
      {
        countryCode: 'IN',
        currency: inCfg.currency,
        currencySymbol: inCfg.currencySymbol,
        amount: 0,
        priceLabel: 'Free for 30 days',
      },
      {
        countryCode: 'US',
        currency: usCfg.currency,
        currencySymbol: usCfg.currencySymbol,
        amount: 0,
        priceLabel: 'Free for 30 days',
      },
    ],
  },
  {
    id: 'buy-coffee',
    name: 'Coffee (Monthly)',
    billingPeriod: 'Month',
    description: 'Full access to 60+ divination tools and Ask the Seer, billed monthly.',
    features: MEMBERSHIP_TIER_FEATURES['buy-coffee'],
    prices: [
      {
        countryCode: 'IN',
        currency: inCfg.currency,
        currencySymbol: inCfg.currencySymbol,
        amount: inCfg.pricingTiers.allFeatures,
        priceLabel: moneyLabel(inCfg.currencySymbol, inCfg.pricingTiers.allFeatures, 'month'),
      },
      {
        countryCode: 'US',
        currency: usCfg.currency,
        currencySymbol: usCfg.currencySymbol,
        amount: usCfg.pricingTiers.allFeatures,
        priceLabel: moneyLabel(usCfg.currencySymbol, usCfg.pricingTiers.allFeatures, 'month'),
      },
    ],
  },
  {
    id: 'treat-me',
    name: 'Treat (Quarterly)',
    billingPeriod: 'Quarter',
    description: 'Same full access as monthly, billed every 3 months for better value.',
    features: MEMBERSHIP_TIER_FEATURES['treat-me'],
    prices: [
      {
        countryCode: 'IN',
        currency: inCfg.currency,
        currencySymbol: inCfg.currencySymbol,
        amount: inCfg.pricingTiers.quarterly,
        priceLabel: moneyLabel(inCfg.currencySymbol, inCfg.pricingTiers.quarterly, 'quarter'),
      },
      {
        countryCode: 'US',
        currency: usCfg.currency,
        currencySymbol: usCfg.currencySymbol,
        amount: usCfg.pricingTiers.quarterly,
        priceLabel: moneyLabel(usCfg.currencySymbol, usCfg.pricingTiers.quarterly, 'quarter'),
      },
    ],
  },
  {
    id: 'festive-hamper',
    name: 'Hamper (Annual)',
    billingPeriod: 'Year',
    description: 'Best value: full year of access in one payment.',
    features: MEMBERSHIP_TIER_FEATURES['festive-hamper'],
    prices: [
      {
        countryCode: 'IN',
        currency: inCfg.currency,
        currencySymbol: inCfg.currencySymbol,
        amount: inCfg.pricingTiers.annual,
        priceLabel: moneyLabel(inCfg.currencySymbol, inCfg.pricingTiers.annual, 'year'),
      },
      {
        countryCode: 'US',
        currency: usCfg.currency,
        currencySymbol: usCfg.currencySymbol,
        amount: usCfg.pricingTiers.annual,
        priceLabel: moneyLabel(usCfg.currencySymbol, usCfg.pricingTiers.annual, 'year'),
      },
    ],
  },
];

/** Schema.org Offer list using USD (international) + free trial. */
export function buildSoftwareApplicationOffers(): Record<string, unknown>[] {
  return PUBLIC_PRICING_OFFERS.map((offer) => {
    const us = offer.prices.find((p) => p.countryCode === 'US');
    const amount = us?.amount ?? 0;
    return {
      '@type': 'Offer',
      name: offer.name,
      description: offer.description,
      url: 'https://futureseer.app/pricing',
      price: String(amount),
      priceCurrency: us?.currency ?? 'USD',
      availability: 'https://schema.org/InStock',
      category: offer.billingPeriod,
    };
  });
}
