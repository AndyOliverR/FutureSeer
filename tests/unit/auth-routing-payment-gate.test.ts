import {
  hasActiveSubscriptionAccess,
  shouldGateReturningUserForPaymentCommit,
  shouldRequireReturningPaymentCommit,
} from '@/lib/authRouting';

describe('authRouting payment gate parity', () => {
  it('requires active status plus payment method (or paid plan plus payment method)', () => {
    expect(
      hasActiveSubscriptionAccess({
        mysticalProfileGenerated: true,
        subscriptionStatus: 'active',
        paymentMethodId: '',
      }),
    ).toBe(false);

    expect(
      hasActiveSubscriptionAccess({
        mysticalProfileGenerated: true,
        subscriptionStatus: 'active',
        paymentMethodId: 'pm_123',
      }),
    ).toBe(true);

    expect(
      hasActiveSubscriptionAccess({
        mysticalProfileGenerated: true,
        selectedPlan: 'treat-me',
        paymentMethodId: 'pm_123',
      }),
    ).toBe(true);
  });

  it('does not hard-gate returning users (credit-first billing)', () => {
    expect(
      shouldGateReturningUserForPaymentCommit({
        mysticalProfileGenerated: true,
        subscriptionStatus: 'trial',
        selectedPlan: 'power-user-trial',
        paymentMethodId: '',
      }),
    ).toBe(false);
  });

  it('respects bypass/admin flags when requiring commit', () => {
    const profile = {
      mysticalProfileGenerated: true,
      subscriptionStatus: 'trial',
      selectedPlan: 'power-user-trial',
      paymentMethodId: '',
    };
    expect(
      shouldRequireReturningPaymentCommit({
        profile,
        isSuperadmin: false,
        isAdmin: false,
        isSpecialUser: false,
      }),
    ).toBe(false);
    expect(
      shouldRequireReturningPaymentCommit({
        profile,
        isSuperadmin: false,
        isAdmin: true,
        isSpecialUser: false,
      }),
    ).toBe(false);
  });
});
