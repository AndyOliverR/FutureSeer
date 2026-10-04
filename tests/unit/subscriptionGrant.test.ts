import crypto from 'crypto';
import { hasUnlimitedBillingAccess } from '@/lib/billingAccess';
import { hasActiveSubscriptionAccess } from '@/lib/authRouting';
import { verifyWebhookSignature } from '@/lib/razorpay';
import {
  paidMembershipPatch,
  verifySubscriptionGrant,
} from '@/lib/subscriptionGrant';

describe('verifySubscriptionGrant', () => {
  const base = {
    authUid: 'uid-1',
    notesUserId: 'uid-1',
    notesPlan: 'buy-coffee',
    razorpayStatus: 'active',
    subscriptionId: 'sub_123',
    paymentId: 'pay_123',
  };

  it('grants unlimited billing only when the paid subscription is bound to the payer', () => {
    const grant = verifySubscriptionGrant(base);
    expect(grant.ok).toBe(true);
    if (!grant.ok) return;
    expect(grant.patch).toEqual({
      selectedPlan: 'buy-coffee',
      isSubscribed: true,
      subscriptionStatus: 'active',
      subscriptionId: 'sub_123',
      paymentMethodId: 'pay_123',
    });
    expect(hasActiveSubscriptionAccess(grant.patch)).toBe(true);
    expect(hasUnlimitedBillingAccess(grant.patch)).toBe(true);
  });

  it('does not grant when the subscription belongs to someone else', () => {
    expect(
      verifySubscriptionGrant({ ...base, notesUserId: 'uid-other' }),
    ).toEqual({ ok: false, reason: 'user_mismatch' });
  });

  it('does not treat an active status without a payment method as unlimited', () => {
    const partial = paidMembershipPatch({
      plan: 'treat-me',
      subscriptionId: 'sub_123',
    });
    expect(partial?.paymentMethodId).toBeUndefined();
    expect(
      hasUnlimitedBillingAccess({
        subscriptionStatus: 'active',
        selectedPlan: 'treat-me',
        paymentMethodId: '',
      }),
    ).toBe(false);
  });

  it('keeps trial checkout from unlocking a paid membership', () => {
    expect(
      verifySubscriptionGrant({ ...base, notesPlan: 'power-user-trial' }),
    ).toEqual({ ok: false, reason: 'trial_plan' });
  });

  it('refuses cancelled subscriptions', () => {
    expect(
      verifySubscriptionGrant({ ...base, razorpayStatus: 'cancelled' }),
    ).toEqual({ ok: false, reason: 'inactive_subscription' });
  });
});

describe('verifyWebhookSignature', () => {
  it('accepts the raw body and rejects a re-serialized body when slashes were escaped', () => {
    const secret = 'whsec_test';
    const raw = '{"short_url":"https:\\/\\/rzp.io\\/i\\/abc"}';
    const signature = crypto.createHmac('sha256', secret).update(raw).digest('hex');
    expect(verifyWebhookSignature(raw, signature, secret)).toBe(true);
    const reparsed = JSON.stringify(JSON.parse(raw));
    expect(reparsed).not.toBe(raw);
    expect(verifyWebhookSignature(reparsed, signature, secret)).toBe(false);
  });
});
