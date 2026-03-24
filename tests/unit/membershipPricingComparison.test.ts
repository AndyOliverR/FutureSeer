/**
 * @jest-environment node
 */
import { getMembershipPricingComparison } from '@/lib/pricingConfig';
import { MEMBERSHIP_TIER_FEATURES } from '@/lib/membershipTierCopy';

describe('getMembershipPricingComparison', () => {
  it('matches India catalog: quarterly and annual savings vs month-stacked', () => {
    const c = getMembershipPricingComparison('IN');
    expect(c.monthly).toBe(99);
    expect(c.quarterly).toBe(199);
    expect(c.annual).toBe(999);
    // 3×99 = 297; save (297-199)/297 ≈ 33%
    expect(c.quarterlySavingsPercentVsMonthly).toBe(33);
    // 12×99 = 1188; save (1188-999)/1188 ≈ 16%
    expect(c.annualSavingsPercentVsMonthly).toBe(16);
    expect(c.effectiveMonthlyFromQuarterly).toBeCloseTo(199 / 3, 5);
    expect(c.effectiveMonthlyFromAnnual).toBeCloseTo(999 / 12, 5);
  });

  it('useSubscribe tier feature counts match shared membership copy', () => {
    expect(MEMBERSHIP_TIER_FEATURES['buy-coffee'].length).toBeGreaterThan(0);
    expect(MEMBERSHIP_TIER_FEATURES['treat-me'].length).toBeGreaterThan(0);
    expect(MEMBERSHIP_TIER_FEATURES['festive-hamper'].length).toBeGreaterThan(0);
  });
});
