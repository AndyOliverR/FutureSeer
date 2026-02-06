/**
 * Razorpay Server-Side Client
 * Handles server-side Razorpay operations (subscriptions, payments, webhooks)
 */

import Razorpay from 'razorpay';

let razorpayInstance: Razorpay | null = null;

/**
 * Initialize Razorpay client (server-side only)
 */
export function getRazorpayClient(): Razorpay {
  if (razorpayInstance) {
    return razorpayInstance;
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.');
  }

  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  return razorpayInstance;
}

/**
 * Extract a readable error message from Razorpay API errors.
 * Razorpay can return description in error.description, error.error?.description, etc.
 */
function getRazorpayErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Unknown error';
  const e = error as Record<string, unknown>;
  const msg =
    (e.description as string) ??
    (e.error && typeof e.error === 'object' && (e.error as Record<string, unknown>).description as string) ??
    (e.reason as string) ??
    (e.message as string);
  return typeof msg === 'string' && msg.length > 0 ? msg : 'Unknown error';
}

/**
 * Create a Razorpay order (one-time payment, e.g. Tip Jar)
 * Amount in smallest currency unit (paise for INR, cents for USD).
 */
export async function createOrder(params: {
  amount: number;
  currency: string;
  receipt?: string;
  notes?: Record<string, string>;
}) {
  const razorpay = getRazorpayClient();

  try {
    const order = await razorpay.orders.create({
      amount: params.amount,
      currency: params.currency,
      receipt: params.receipt,
      notes: params.notes,
    });
    return order;
  } catch (error: unknown) {
    console.error('Error creating Razorpay order:', error);
    throw new Error(`Failed to create order: ${getRazorpayErrorMessage(error)}`);
  }
}

/**
 * Create a Razorpay subscription.
 * - immediateStart: true → omit start_at; first charge = plan amount, charged now (checkout shows ₹99 etc.).
 * - startAt (future): first charge delayed; Razorpay may show a small auth amount (e.g. ₹5) now, full amount at start_at.
 */
export async function createSubscription(params: {
  planId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  totalCount: number; // Total billing cycles (e.g., 12 for annual)
  startAt?: number; // Unix timestamp for first charge (trial end date)
  immediateStart?: boolean; // If true, omit start_at so first charge is now (plan amount)
  notes?: Record<string, string>;
}) {
  const razorpay = getRazorpayClient();

  const subscriptionParams: any = {
    plan_id: params.planId,
    customer_notify: 1,
    total_count: params.totalCount,
    notes: {
      customer_id: params.customerId,
      ...params.notes,
    },
  };

  if (params.immediateStart) {
    // Omit start_at → subscription starts immediately, first charge = plan amount
  } else {
    subscriptionParams.start_at =
      params.startAt ?? Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
  }

  try {
    const subscription = await razorpay.subscriptions.create(subscriptionParams);
    return subscription;
  } catch (error: any) {
    console.error('Error creating Razorpay subscription:', error);
    throw new Error(`Failed to create subscription: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Create a Razorpay plan.
 * Razorpay SDK supports only period: daily | weekly | monthly | yearly.
 * For "quarterly" we use period 'monthly' + interval 3.
 */
export async function createPlan(params: {
  period: 'monthly' | 'quarterly' | 'yearly';
  amount: number; // Amount in smallest currency unit (paise for INR)
  currency: string;
  item: {
    name: string;
    description: string;
  };
}) {
  const razorpay = getRazorpayClient();

  // Map to SDK-supported period + interval (no 'quarterly' in API)
  const period = params.period === 'quarterly' ? 'monthly' : params.period;
  const interval = params.period === 'quarterly' ? 3 : params.period === 'yearly' ? 1 : 1;

  const planParams: any = {
    period,
    interval,
    item: { ...params.item },
    notes: {
      contribution_type: params.period,
    },
  };

  // Add amount if provided (0 for trial plans)
  if (params.amount !== undefined) {
    planParams.item.amount = params.amount;
    planParams.item.currency = params.currency;
  }

  try {
    const plan = await razorpay.plans.create(planParams);
    return plan;
  } catch (error: unknown) {
    console.error('Error creating Razorpay plan:', error);
    throw new Error(`Failed to create plan: ${getRazorpayErrorMessage(error)}`);
  }
}

/**
 * Refund a payment (full refund if amount omitted; amount in smallest currency unit for partial).
 */
export async function refundPayment(paymentId: string, amount?: number): Promise<unknown> {
  const razorpay = getRazorpayClient();

  try {
    const params: { amount?: number } = {};
    if (amount !== undefined && amount > 0) {
      params.amount = amount;
    }
    const refund = await razorpay.payments.refund(paymentId, params);
    return refund;
  } catch (error: unknown) {
    console.error('Error refunding payment:', error);
    throw new Error(`Failed to refund payment: ${getRazorpayErrorMessage(error)}`);
  }
}

/**
 * Cancel a Razorpay subscription
 */
export async function cancelSubscription(subscriptionId: string, cancelAtCycleEnd: boolean = false) {
  const razorpay = getRazorpayClient();

  try {
    const subscription = await razorpay.subscriptions.cancel(subscriptionId, cancelAtCycleEnd ? 1 : 0);
    return subscription;
  } catch (error: any) {
    console.error('Error cancelling Razorpay subscription:', error);
    throw new Error(`Failed to cancel subscription: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  const razorpay = getRazorpayClient();

  try {
    const subscription = await razorpay.subscriptions.fetch(subscriptionId);
    return subscription;
  } catch (error: any) {
    console.error('Error fetching Razorpay subscription:', error);
    throw new Error(`Failed to fetch subscription: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  webhookBody: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(webhookBody)
    .digest('hex');

  return expectedSignature === signature;
}
