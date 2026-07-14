/** @jest-environment node */

import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/payments/credits/verify/route';
import { addCreditsFromPack } from '@/lib/billingCreditsServer';
import { getOrder, getPayment } from '@/lib/razorpay';
import { verifyUserRequest } from '@/lib/userApiAuth';

jest.mock('@/lib/billingCreditsServer', () => ({
  addCreditsFromPack: jest.fn(),
}));
jest.mock('@/lib/razorpay', () => ({
  getOrder: jest.fn(),
  getPayment: jest.fn(),
}));
jest.mock('@/lib/userApiAuth', () => ({
  verifyUserRequest: jest.fn(),
}));

const mockedAddCredits = addCreditsFromPack as jest.MockedFunction<typeof addCreditsFromPack>;
const mockedGetOrder = getOrder as jest.MockedFunction<typeof getOrder>;
const mockedGetPayment = getPayment as jest.MockedFunction<typeof getPayment>;
const mockedVerifyUser = verifyUserRequest as jest.MockedFunction<typeof verifyUserRequest>;

function signedRequest(packId: string): NextRequest {
  const orderId = 'order_starter';
  const paymentId = 'payment_123';
  const signature = crypto
    .createHmac('sha256', 'test-secret')
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return new NextRequest('http://localhost/api/payments/credits/verify', {
    method: 'POST',
    body: JSON.stringify({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
      packId,
    }),
  });
}

describe('credit payment verification route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.RAZORPAY_KEY_SECRET = 'test-secret';
    mockedVerifyUser.mockResolvedValue({ ok: true, uid: 'user_123' });
    mockedGetOrder.mockResolvedValue({
      id: 'order_starter',
      amount: 4900,
      currency: 'INR',
      notes: {
        userId: 'user_123',
        packId: 'starter',
        credits: '15',
      },
    });
    mockedGetPayment.mockResolvedValue({
      id: 'payment_123',
      order_id: 'order_starter',
      amount: 4900,
      currency: 'INR',
      status: 'captured',
    });
    mockedAddCredits.mockResolvedValue({
      success: true,
      creditsAdded: 15,
      creditBalance: 15,
    });
  });

  afterAll(() => {
    delete process.env.RAZORPAY_KEY_SECRET;
  });

  it('ignores a client pack upgrade and credits the provider-recorded pack', async () => {
    const response = await POST(signedRequest('power'));

    expect(response.status).toBe(200);
    expect(mockedAddCredits).toHaveBeenCalledWith(
      'user_123',
      'starter',
      'order_starter',
      'payment_123',
    );
  });

  it('rejects an order belonging to another user', async () => {
    mockedGetOrder.mockResolvedValue({
      id: 'order_starter',
      amount: 4900,
      currency: 'INR',
      notes: {
        userId: 'different_user',
        packId: 'starter',
        credits: '15',
      },
    });

    const response = await POST(signedRequest('starter'));

    expect(response.status).toBe(400);
    expect(mockedAddCredits).not.toHaveBeenCalled();
  });
});
