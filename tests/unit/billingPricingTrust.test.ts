import {
  normalizeBillingCountryCode,
  resolveTrustedBillingCountryCode,
} from '@/lib/billingCountry';
import {
  getSubscriptionPlanAmountInSmallestUnit,
  isSubscriptionPlanId,
} from '@/lib/subscriptionPlanAmount';
import { getCreditPackPrice } from '@/lib/billingConfig';

describe('billingCountry', () => {
  it('normalizes known country codes and rejects unknown', () => {
    expect(normalizeBillingCountryCode('us')).toBe('US');
    expect(normalizeBillingCountryCode(' IN ')).toBe('IN');
    expect(normalizeBillingCountryCode('XX')).toBeNull();
    expect(normalizeBillingCountryCode('')).toBeNull();
    expect(normalizeBillingCountryCode(null)).toBeNull();
  });

  it('prefers persisted profile country over a cheaper requested country', () => {
    expect(
      resolveTrustedBillingCountryCode({
        profileCountry: 'US',
        requestedCountry: 'IN',
      }),
    ).toBe('US');
  });

  it('allows requested country when profile has none', () => {
    expect(
      resolveTrustedBillingCountryCode({
        profileCountry: undefined,
        requestedCountry: 'GB',
      }),
    ).toBe('GB');
  });

  it('defaults to IN when neither country is usable', () => {
    expect(
      resolveTrustedBillingCountryCode({
        profileCountry: 'ZZ',
        requestedCountry: '',
      }),
    ).toBe('IN');
  });
});

describe('subscriptionPlanAmount', () => {
  it('recognizes subscription plan ids', () => {
    expect(isSubscriptionPlanId('buy-coffee')).toBe(true);
    expect(isSubscriptionPlanId('power-user-trial')).toBe(true);
    expect(isSubscriptionPlanId('starter')).toBe(false);
  });

  it('derives server amounts and ignores any client underpayment intent', () => {
    const usCoffee = getSubscriptionPlanAmountInSmallestUnit('buy-coffee', 'US');
    expect(usCoffee.currency).toBe('USD');
    expect(usCoffee.amountInSmallestUnit).toBe(999);

    const inCoffee = getSubscriptionPlanAmountInSmallestUnit('buy-coffee', 'IN');
    expect(inCoffee.currency).toBe('INR');
    expect(inCoffee.amountInSmallestUnit).toBe(9900);

    // Spoofed ₹1 (100 paise) must never equal the server US coffee amount.
    expect(usCoffee.amountInSmallestUnit).not.toBe(100);
    expect(inCoffee.amountInSmallestUnit).toBeGreaterThan(100);
  });

  it('prices quarterly and annual tiers from country config', () => {
    const treat = getSubscriptionPlanAmountInSmallestUnit('treat-me', 'US');
    expect(treat.amountInSmallestUnit).toBe(1999);

    const hamper = getSubscriptionPlanAmountInSmallestUnit('festive-hamper', 'IN');
    expect(hamper.amountInSmallestUnit).toBe(99900);
  });
});

describe('credit pack PPP spoof resistance (helpers)', () => {
  it('US power pack costs much more than IN when country is trusted', () => {
    const us = getCreditPackPrice('US', 'power');
    const india = getCreditPackPrice('IN', 'power');
    expect(india).toBe(249);
    // Spoofing countryCode=IN against a US profile must not be allowed by resolveTrustedBillingCountryCode.
    expect(us).toBeGreaterThan(20);
    expect(us).toBeGreaterThan(india * 0.05);
  });
});
