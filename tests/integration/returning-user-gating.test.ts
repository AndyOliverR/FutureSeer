/**
 * Integration tests: returning user gate behavior.
 * @jest-environment node
 */

import {
  hasActiveSubscriptionAccess,
  shouldRequireReturningPaymentCommit,
  shouldGateReturningUserForPaymentCommit,
} from '@/lib/authRouting';

describe('Returning user payment gating', () => {
  it('gates returning user without active subscription', () => {
    expect(
      shouldGateReturningUserForPaymentCommit({
        mysticalProfileGenerated: true,
        subscriptionStatus: 'trial',
      }),
    ).toBe(true);
  });

  it('does not gate returning user with active subscription', () => {
    expect(
      shouldGateReturningUserForPaymentCommit({
        mysticalProfileGenerated: true,
        subscriptionStatus: 'active',
      }),
    ).toBe(false);
  });

  it('does not gate no-charge accounts', () => {
    expect(
      shouldGateReturningUserForPaymentCommit({
        mysticalProfileGenerated: true,
        noChargeAccount: true,
        subscriptionStatus: 'past_due',
      }),
    ).toBe(false);
  });

  it('treats past_due and incomplete as non-active', () => {
    expect(hasActiveSubscriptionAccess({ subscriptionStatus: 'past_due' })).toBe(false);
    expect(hasActiveSubscriptionAccess({ subscriptionStatus: 'incomplete' })).toBe(false);
  });

  it('does not require returning commit for special users', () => {
    expect(
      shouldRequireReturningPaymentCommit({
        profile: {
          mysticalProfileGenerated: true,
          subscriptionStatus: 'trial',
        },
        isSuperadmin: false,
        isAdmin: false,
        isSpecialUser: true,
      }),
    ).toBe(false);
  });
});
