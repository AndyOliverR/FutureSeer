import {
  parseCreditOrderNotes,
  validateCreditPackPayment,
} from '@/lib/creditPaymentVerification';
import { CREDIT_PACK_DEFS } from '@/lib/billingConfig';

const USER = 'user_abc';
const ORDER_ID = 'order_starter_1';
const PAYMENT_ID = 'pay_starter_1';

function starterOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: ORDER_ID,
    amount: 4900,
    currency: 'INR',
    status: 'paid',
    notes: {
      userId: USER,
      packId: 'starter',
      credits: String(CREDIT_PACK_DEFS.starter.credits),
    },
    ...overrides,
  };
}

function starterPayment(overrides: Record<string, unknown> = {}) {
  return {
    id: PAYMENT_ID,
    order_id: ORDER_ID,
    amount: 4900,
    currency: 'INR',
    status: 'captured',
    ...overrides,
  };
}

describe('parseCreditOrderNotes', () => {
  it('accepts catalog-aligned notes', () => {
    expect(
      parseCreditOrderNotes({
        userId: USER,
        packId: 'power',
        credits: CREDIT_PACK_DEFS.power.credits,
      }),
    ).toEqual({
      userId: USER,
      packId: 'power',
      credits: CREDIT_PACK_DEFS.power.credits,
    });
  });

  it('rejects inflated credits for a cheaper pack id', () => {
    expect(
      parseCreditOrderNotes({
        userId: USER,
        packId: 'starter',
        credits: CREDIT_PACK_DEFS.power.credits,
      }),
    ).toBeNull();
  });
});

describe('validateCreditPackPayment', () => {
  it('derives starter pack from order notes (client packId not consulted)', () => {
    const result = validateCreditPackPayment({
      authenticatedUserId: USER,
      orderId: ORDER_ID,
      paymentId: PAYMENT_ID,
      order: starterOrder(),
      payment: starterPayment(),
    });
    expect(result).toEqual({
      ok: true,
      packId: 'starter',
      credits: CREDIT_PACK_DEFS.starter.credits,
      amount: 4900,
      currency: 'INR',
    });
  });

  it('rejects when authenticated user does not own the order', () => {
    const result = validateCreditPackPayment({
      authenticatedUserId: 'other_user',
      orderId: ORDER_ID,
      paymentId: PAYMENT_ID,
      order: starterOrder(),
      payment: starterPayment(),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('user_mismatch');
  });

  it('rejects unpaid payment status', () => {
    const result = validateCreditPackPayment({
      authenticatedUserId: USER,
      orderId: ORDER_ID,
      paymentId: PAYMENT_ID,
      order: starterOrder(),
      payment: starterPayment({ status: 'failed' }),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('unpaid');
  });

  it('rejects amount mismatch between order and payment', () => {
    const result = validateCreditPackPayment({
      authenticatedUserId: USER,
      orderId: ORDER_ID,
      paymentId: PAYMENT_ID,
      order: starterOrder(),
      payment: starterPayment({ amount: 24900 }),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('amount_mismatch');
  });

  it('rejects payment bound to a different order id', () => {
    const result = validateCreditPackPayment({
      authenticatedUserId: USER,
      orderId: ORDER_ID,
      paymentId: PAYMENT_ID,
      order: starterOrder(),
      payment: starterPayment({ order_id: 'order_other' }),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('invalid_payment');
  });
});
