import { CREDIT_PACK_DEFS } from '@/lib/billingConfig';
import type { CreditPackId } from '@/lib/billingTypes';

const PACK_IDS: CreditPackId[] = ['starter', 'regular', 'power'];
const PAID_PAYMENT_STATUSES = new Set(['captured', 'authorized']);

export type CreditOrderNotes = {
  userId: string;
  packId: CreditPackId;
  credits: number;
};

export type RazorpayOrderLike = {
  id?: string;
  amount?: number | string;
  currency?: string;
  status?: string;
  notes?: Record<string, unknown> | null;
};

export type RazorpayPaymentLike = {
  id?: string;
  order_id?: string;
  amount?: number | string;
  currency?: string;
  status?: string;
};

export type CreditPaymentValidationOk = {
  ok: true;
  packId: CreditPackId;
  credits: number;
  amount: number;
  currency: string;
};

export type CreditPaymentValidationErr = {
  ok: false;
  error: string;
  code:
    | 'invalid_order'
    | 'invalid_payment'
    | 'user_mismatch'
    | 'pack_mismatch'
    | 'amount_mismatch'
    | 'unpaid';
};

function asPositiveInt(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.round(value);
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) return Math.round(n);
  }
  return null;
}

export function parseCreditOrderNotes(notes: Record<string, unknown> | null | undefined): CreditOrderNotes | null {
  if (!notes || typeof notes !== 'object') return null;
  const userId = typeof notes.userId === 'string' ? notes.userId.trim() : '';
  const packRaw = typeof notes.packId === 'string' ? notes.packId.trim() : '';
  if (!userId || !PACK_IDS.includes(packRaw as CreditPackId)) return null;
  const packId = packRaw as CreditPackId;
  const credits = asPositiveInt(notes.credits);
  if (credits == null || credits !== CREDIT_PACK_DEFS[packId].credits) return null;
  return { userId, packId, credits };
}

/**
 * Validate a paid credit pack against Razorpay order + payment records.
 * Never trust client-supplied packId for credit quantity.
 */
export function validateCreditPackPayment(args: {
  authenticatedUserId: string;
  orderId: string;
  paymentId: string;
  order: RazorpayOrderLike;
  payment: RazorpayPaymentLike;
}): CreditPaymentValidationOk | CreditPaymentValidationErr {
  const { authenticatedUserId, orderId, paymentId, order, payment } = args;

  if (!order?.id || order.id !== orderId) {
    return { ok: false, error: 'Order does not match payment', code: 'invalid_order' };
  }
  if (!payment?.id || payment.id !== paymentId) {
    return { ok: false, error: 'Payment record mismatch', code: 'invalid_payment' };
  }
  if (!payment.order_id || payment.order_id !== orderId) {
    return { ok: false, error: 'Payment is not for this order', code: 'invalid_payment' };
  }

  const paymentStatus = typeof payment.status === 'string' ? payment.status.toLowerCase() : '';
  if (!PAID_PAYMENT_STATUSES.has(paymentStatus)) {
    return { ok: false, error: 'Payment is not completed', code: 'unpaid' };
  }

  const notes = parseCreditOrderNotes(
    order.notes && typeof order.notes === 'object' ? (order.notes as Record<string, unknown>) : null,
  );
  if (!notes) {
    return { ok: false, error: 'Order is missing valid credit pack metadata', code: 'invalid_order' };
  }
  if (notes.userId !== authenticatedUserId) {
    return { ok: false, error: 'Order belongs to a different account', code: 'user_mismatch' };
  }

  const orderAmount = asPositiveInt(order.amount);
  const paymentAmount = asPositiveInt(payment.amount);
  const orderCurrency = typeof order.currency === 'string' ? order.currency.toUpperCase() : '';
  const paymentCurrency = typeof payment.currency === 'string' ? payment.currency.toUpperCase() : '';
  if (
    orderAmount == null ||
    paymentAmount == null ||
    !orderCurrency ||
    !paymentCurrency ||
    orderAmount !== paymentAmount ||
    orderCurrency !== paymentCurrency
  ) {
    return { ok: false, error: 'Payment amount or currency does not match order', code: 'amount_mismatch' };
  }

  return {
    ok: true,
    packId: notes.packId,
    credits: notes.credits,
    amount: orderAmount,
    currency: orderCurrency,
  };
}
