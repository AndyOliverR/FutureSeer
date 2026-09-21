/**
 * @jest-environment node
 */
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { CREDIT_PACK_DEFS } from '@/lib/billingConfig';

const USER = 'uid_buyer_1';
const ORDER_ID = 'order_starter_xyz';
const PAYMENT_ID = 'pay_starter_xyz';
const SECRET = 'test_razorpay_secret';

jest.mock('@/lib/userApiAuth', () => ({
  verifyUserRequest: jest.fn(async () => ({ ok: true, uid: USER })),
}));

const fetchOrder = jest.fn();
const fetchPayment = jest.fn();
jest.mock('@/lib/razorpay', () => ({
  fetchOrder: (...args: unknown[]) => fetchOrder(...args),
  fetchPayment: (...args: unknown[]) => fetchPayment(...args),
}));

const addCreditsFromPack = jest.fn();
jest.mock('@/lib/billingCreditsServer', () => ({
  addCreditsFromPack: (...args: unknown[]) => addCreditsFromPack(...args),
}));

import { POST } from '@/app/api/payments/credits/verify/route';

function sign(orderId: string, paymentId: string) {
  return crypto.createHmac('sha256', SECRET).update(`${orderId}|${paymentId}`).digest('hex');
}

describe('POST /api/payments/credits/verify', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.RAZORPAY_KEY_SECRET = SECRET;
    fetchOrder.mockResolvedValue({
      id: ORDER_ID,
      amount: 4900,
      currency: 'INR',
      status: 'paid',
      notes: {
        userId: USER,
        packId: 'starter',
        credits: String(CREDIT_PACK_DEFS.starter.credits),
      },
    });
    fetchPayment.mockResolvedValue({
      id: PAYMENT_ID,
      order_id: ORDER_ID,
      amount: 4900,
      currency: 'INR',
      status: 'captured',
    });
    addCreditsFromPack.mockResolvedValue({
      success: true,
      creditsAdded: CREDIT_PACK_DEFS.starter.credits,
      creditBalance: CREDIT_PACK_DEFS.starter.credits,
    });
  });

  it('credits the pack from Razorpay order notes even if client sends power packId', async () => {
    const req = new NextRequest('http://localhost:3000/api/payments/credits/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer tok' },
      body: JSON.stringify({
        razorpay_order_id: ORDER_ID,
        razorpay_payment_id: PAYMENT_ID,
        razorpay_signature: sign(ORDER_ID, PAYMENT_ID),
        packId: 'power',
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.packId).toBe('starter');
    expect(json.creditsAdded).toBe(CREDIT_PACK_DEFS.starter.credits);
    expect(addCreditsFromPack).toHaveBeenCalledWith(USER, 'starter', ORDER_ID, PAYMENT_ID);
    expect(addCreditsFromPack).not.toHaveBeenCalledWith(
      USER,
      'power',
      expect.anything(),
      expect.anything(),
    );
  });

  it('rejects when order notes belong to another user', async () => {
    fetchOrder.mockResolvedValue({
      id: ORDER_ID,
      amount: 4900,
      currency: 'INR',
      status: 'paid',
      notes: {
        userId: 'someone_else',
        packId: 'starter',
        credits: String(CREDIT_PACK_DEFS.starter.credits),
      },
    });

    const req = new NextRequest('http://localhost:3000/api/payments/credits/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer tok' },
      body: JSON.stringify({
        razorpay_order_id: ORDER_ID,
        razorpay_payment_id: PAYMENT_ID,
        razorpay_signature: sign(ORDER_ID, PAYMENT_ID),
      }),
    });

    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(403);
    expect(json.code).toBe('user_mismatch');
    expect(addCreditsFromPack).not.toHaveBeenCalled();
  });

  it('surfaces cross-account redemption conflicts as 409', async () => {
    addCreditsFromPack.mockRejectedValue(
      new Error('This payment was already redeemed by another account'),
    );

    const req = new NextRequest('http://localhost:3000/api/payments/credits/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer tok' },
      body: JSON.stringify({
        razorpay_order_id: ORDER_ID,
        razorpay_payment_id: PAYMENT_ID,
        razorpay_signature: sign(ORDER_ID, PAYMENT_ID),
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(409);
    expect(addCreditsFromPack).toHaveBeenCalled();
  });
});
