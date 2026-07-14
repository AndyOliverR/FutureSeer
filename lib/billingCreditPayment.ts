import { CREDIT_PACK_DEFS } from '@/lib/billingConfig';
import type { CreditPackId } from '@/lib/billingTypes';

const CREDIT_PACK_IDS = new Set<CreditPackId>(['starter', 'regular', 'power']);
const ACCEPTED_PAYMENT_STATUSES = new Set(['authorized', 'captured']);

export class CreditPaymentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CreditPaymentValidationError';
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new CreditPaymentValidationError('Invalid payment provider response');
  }
  return value as Record<string, unknown>;
}

function asNonEmptyString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asAmount(value: unknown): number {
  const amount = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

/**
 * Resolve the purchased pack exclusively from Razorpay's server-side records.
 * Request-body pack data is intentionally ignored because it is client-controlled.
 */
export function validateCreditPaymentRecords(params: {
  order: unknown;
  payment: unknown;
  orderId: string;
  paymentId: string;
  userId: string;
}): CreditPackId {
  const order = asRecord(params.order);
  const payment = asRecord(params.payment);
  const notes = asRecord(order.notes);

  if (asNonEmptyString(order.id) !== params.orderId) {
    throw new CreditPaymentValidationError('Payment order mismatch');
  }
  if (asNonEmptyString(payment.id) !== params.paymentId) {
    throw new CreditPaymentValidationError('Payment identifier mismatch');
  }
  if (asNonEmptyString(payment.order_id) !== params.orderId) {
    throw new CreditPaymentValidationError('Payment is not associated with this order');
  }
  if (asNonEmptyString(notes.userId) !== params.userId) {
    throw new CreditPaymentValidationError('Payment order does not belong to this user');
  }

  const packId = asNonEmptyString(notes.packId) as CreditPackId;
  if (!CREDIT_PACK_IDS.has(packId)) {
    throw new CreditPaymentValidationError('Payment order is not for a credit pack');
  }
  if (asNonEmptyString(notes.credits) !== String(CREDIT_PACK_DEFS[packId].credits)) {
    throw new CreditPaymentValidationError('Payment order credit amount mismatch');
  }

  const status = asNonEmptyString(payment.status);
  if (!ACCEPTED_PAYMENT_STATUSES.has(status)) {
    throw new CreditPaymentValidationError('Payment has not been authorized');
  }

  const orderAmount = asAmount(order.amount);
  const paymentAmount = asAmount(payment.amount);
  if (!orderAmount || orderAmount !== paymentAmount) {
    throw new CreditPaymentValidationError('Payment amount mismatch');
  }

  const orderCurrency = asNonEmptyString(order.currency).toUpperCase();
  const paymentCurrency = asNonEmptyString(payment.currency).toUpperCase();
  if (!orderCurrency || orderCurrency !== paymentCurrency) {
    throw new CreditPaymentValidationError('Payment currency mismatch');
  }

  return packId;
}
