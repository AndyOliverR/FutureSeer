import {
  isFreeInstanceAvailable,
  markFreeInstanceConsumed,
  creditBalanceFromProfile,
} from '@/lib/billingFreeUse';
import { getCreditPackPrice, toolSlugFromSeerRoute } from '@/lib/billingConfig';
import { hasUnlimitedBillingAccess } from '@/lib/billingAccess';
import { verifyCreditOrderMetadata } from '@/lib/creditPaymentVerification';

describe('billingFreeUse', () => {
  it('tracks per-tool first free Seer use', () => {
    const empty = {};
    expect(isFreeInstanceAvailable('tool_seer', empty, 'vedic')).toBe(true);
    const after = markFreeInstanceConsumed('tool_seer', empty, 'vedic');
    expect(isFreeInstanceAvailable('tool_seer', after, 'vedic')).toBe(false);
    expect(isFreeInstanceAvailable('tool_seer', after, 'tarot')).toBe(true);
  });

  it('marks main seer and profile regen once', () => {
    let free = {};
    expect(isFreeInstanceAvailable('main_seer', free)).toBe(true);
    free = markFreeInstanceConsumed('main_seer', free);
    expect(isFreeInstanceAvailable('main_seer', free)).toBe(false);
    expect(isFreeInstanceAvailable('profile_regen', free)).toBe(true);
  });
});

describe('billingConfig', () => {
  it('derives tool slug from seer route key', () => {
    expect(toolSlugFromSeerRoute('ask-vedic-seer')).toBe('vedic');
    expect(toolSlugFromSeerRoute('ask-daily-decisions-seer')).toBe('daily-decisions');
  });

  it('prices starter pack for India and US', () => {
    expect(getCreditPackPrice('IN', 'starter')).toBe(49);
    expect(getCreditPackPrice('US', 'starter')).toBeGreaterThan(0);
  });
});

describe('billingAccess', () => {
  it('grants unlimited for active subscription', () => {
    expect(
      hasUnlimitedBillingAccess({
        subscriptionStatus: 'active',
        paymentMethodId: 'pay_123',
      }),
    ).toBe(true);
    expect(creditBalanceFromProfile({ creditBalance: 5 })).toBe(5);
  });
});

describe('creditPaymentVerification', () => {
  const baseOrder = {
    id: 'order_123',
    notes: {
      userId: 'user-1',
      packId: 'starter',
      credits: '15',
    },
  };

  it('accepts matching Razorpay order metadata', () => {
    expect(
      verifyCreditOrderMetadata({
        order: baseOrder,
        expectedOrderId: 'order_123',
        authUid: 'user-1',
        requestedPackId: 'starter',
      }),
    ).toEqual({ ok: true, packId: 'starter' });
  });

  it('rejects client-side credit pack inflation', () => {
    expect(
      verifyCreditOrderMetadata({
        order: baseOrder,
        expectedOrderId: 'order_123',
        authUid: 'user-1',
        requestedPackId: 'power',
      }),
    ).toEqual({ ok: false, error: 'Payment order pack mismatch' });
  });

  it('rejects orders created for a different user', () => {
    expect(
      verifyCreditOrderMetadata({
        order: baseOrder,
        expectedOrderId: 'order_123',
        authUid: 'user-2',
        requestedPackId: 'starter',
      }),
    ).toEqual({ ok: false, error: 'Payment order is not assigned to this user' });
  });
});
