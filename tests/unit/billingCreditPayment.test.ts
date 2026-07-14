import {
  CreditPaymentValidationError,
  validateCreditPaymentRecords,
} from '@/lib/billingCreditPayment';

const order = {
  id: 'order_starter',
  amount: 4900,
  currency: 'INR',
  notes: {
    userId: 'user_123',
    packId: 'starter',
    credits: '15',
  },
};

const payment = {
  id: 'payment_123',
  order_id: 'order_starter',
  amount: 4900,
  currency: 'INR',
  status: 'captured',
};

describe('validateCreditPaymentRecords', () => {
  it('derives the credit pack from Razorpay order metadata', () => {
    expect(
      validateCreditPaymentRecords({
        order,
        payment,
        orderId: 'order_starter',
        paymentId: 'payment_123',
        userId: 'user_123',
      }),
    ).toBe('starter');
  });

  it('rejects replaying another user payment', () => {
    expect(() =>
      validateCreditPaymentRecords({
        order,
        payment,
        orderId: 'order_starter',
        paymentId: 'payment_123',
        userId: 'attacker_456',
      }),
    ).toThrow(new CreditPaymentValidationError('Payment order does not belong to this user'));
  });

  it('rejects a payment whose amount differs from the purchased order', () => {
    expect(() =>
      validateCreditPaymentRecords({
        order,
        payment: { ...payment, amount: 24900 },
        orderId: 'order_starter',
        paymentId: 'payment_123',
        userId: 'user_123',
      }),
    ).toThrow(new CreditPaymentValidationError('Payment amount mismatch'));
  });

  it('rejects unpaid payment records', () => {
    expect(() =>
      validateCreditPaymentRecords({
        order,
        payment: { ...payment, status: 'failed' },
        orderId: 'order_starter',
        paymentId: 'payment_123',
        userId: 'user_123',
      }),
    ).toThrow(new CreditPaymentValidationError('Payment has not been authorized'));
  });
});
