/**
 * POST /api/payments/create-subscription must still open Razorpay checkout
 * when the user doc has freeMonthsRemaining (signup default and referrals).
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyUserRequest = jest.fn();
const mockGetDocument = jest.fn();
const mockGetUser = jest.fn();
const mockCreatePlan = jest.fn();
const mockCreateSubscription = jest.fn();
const mockUserUpdate = jest.fn();
const mockUserGet = jest.fn();

jest.mock('@/lib/userApiAuth', () => ({
  verifyUserRequest: (...args: unknown[]) => mockVerifyUserRequest(...args),
  resolveOwnedUserId: (requested: unknown, authUid: string) =>
    typeof requested === 'string' && requested === authUid ? authUid : null,
}));

jest.mock('@/lib/firebase-admin', () => ({
  getAuth: () => ({ getUser: (...args: unknown[]) => mockGetUser(...args) }),
  getDocument: (...args: unknown[]) => mockGetDocument(...args),
  setDocument: jest.fn().mockResolvedValue(true),
  isAdminAvailable: () => true,
}));

jest.mock('@/lib/firebase', () => ({
  getFirebaseDB: () => ({
    collection: () => ({
      doc: () => ({
        get: (...args: unknown[]) => mockUserGet(...args),
        update: (...args: unknown[]) => mockUserUpdate(...args),
      }),
    }),
  }),
}));

jest.mock('@/lib/razorpay', () => ({
  createPlan: (...args: unknown[]) => mockCreatePlan(...args),
  createSubscription: (...args: unknown[]) => mockCreateSubscription(...args),
}));

jest.mock('@/lib/painLogging', () => ({
  logApiPain: jest.fn().mockResolvedValue(undefined),
}));

import { POST } from '@/app/api/payments/create-subscription/route';

describe('create-subscription free months', () => {
  const uid = 'user-free-month';
  const email = 'member@example.com';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = 'rzp_test_key';
    mockVerifyUserRequest.mockResolvedValue({ ok: true, uid, email });
    mockGetUser.mockResolvedValue({ customClaims: {} });
    mockGetDocument.mockResolvedValue({
      freeMonthsRemaining: 2,
      specialUser: false,
      special_user: false,
      isSpecialUser: false,
    });
    mockUserGet.mockResolvedValue({
      exists: true,
      data: () => ({ freeMonthsRemaining: 2 }),
    });
    mockUserUpdate.mockResolvedValue(undefined);
    mockCreatePlan.mockResolvedValue({ id: 'plan_test' });
    mockCreateSubscription.mockResolvedValue({ id: 'sub_test' });
  });

  it('creates a Razorpay subscription without burning freeMonthsRemaining', async () => {
    const req = new NextRequest('http://localhost:3000/api/payments/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token',
      },
      body: JSON.stringify({
        plan: 'buy-coffee',
        amount: 9900,
        email,
        name: 'Member',
        country: 'IN',
        userId: uid,
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.subscriptionId).toBe('sub_test');
    expect(data.razorpayKeyId).toBe('rzp_test_key');
    expect(data.freeMonthApplied).toBeUndefined();
    expect(mockCreateSubscription).toHaveBeenCalledTimes(1);
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });
});
