/**
 * @jest-environment node
 */

jest.mock('server-only', () => ({}), { virtual: true });

var mockSetCalls: Array<{ path: string; data: Record<string, unknown> }> = [];
var mockUserData: Record<string, unknown> = { creditBalance: 5 };
var mockClaimData: Record<string, unknown> | null = null;

function makeRef(path: string) {
  return {
    path,
    collection: jest.fn((subCol: string) => ({
      doc: jest.fn((docId = 'auto-id') => makeRef(`${path}/${subCol}/${docId}`)),
    })),
  };
}

jest.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: jest.fn((colName: string) => ({
      doc: jest.fn((docId: string) => makeRef(`${colName}/${docId}`)),
    })),
    runTransaction: jest.fn(async (callback: (tx: { get: jest.Mock; set: jest.Mock }) => unknown) => {
      const tx = {
        get: jest.fn(async (ref: { path: string }) => {
          if (ref.path.startsWith('users/')) {
            return {
              exists: true,
              data: () => mockUserData,
            };
          }
          if (ref.path.startsWith('_creditPaymentOrders/')) {
            return {
              exists: mockClaimData !== null,
              data: () => mockClaimData ?? undefined,
            };
          }
          return {
            exists: false,
            data: () => undefined,
          };
        }),
        set: jest.fn((ref: { path: string }, data: Record<string, unknown>) => {
          mockSetCalls.push({ path: ref.path, data });
        }),
      };
      return callback(tx);
    }),
  },
}));

import { addCreditsFromPack } from '@/lib/billingCreditsServer';

describe('addCreditsFromPack', () => {
  beforeEach(() => {
    mockSetCalls.length = 0;
    mockUserData = { creditBalance: 5 };
    mockClaimData = null;
    jest.clearAllMocks();
  });

  it('records a global claim when applying a credit purchase', async () => {
    const result = await addCreditsFromPack('user-1', 'starter', 'order_123', 'pay_123');

    expect(result).toEqual({ success: true, creditsAdded: 15, creditBalance: 20 });
    expect(mockSetCalls.some((call) => call.path === '_creditPaymentOrders/order_123')).toBe(true);
    expect(mockSetCalls.find((call) => call.path === '_creditPaymentOrders/order_123')?.data).toMatchObject({
      orderId: 'order_123',
      userId: 'user-1',
      packId: 'starter',
      paymentId: 'pay_123',
      credits: 15,
    });
  });

  it('treats same-user replay as an idempotent duplicate', async () => {
    mockUserData = { creditBalance: 20 };
    mockClaimData = { userId: 'user-1', orderId: 'order_123' };

    await expect(addCreditsFromPack('user-1', 'starter', 'order_123', 'pay_123')).resolves.toEqual({
      success: true,
      creditsAdded: 0,
      creditBalance: 20,
      duplicate: true,
    });
    expect(mockSetCalls).toEqual([]);
  });

  it('rejects replay of a paid order on another user account', async () => {
    mockClaimData = { userId: 'user-2', orderId: 'order_123' };

    await expect(addCreditsFromPack('user-1', 'starter', 'order_123', 'pay_123')).rejects.toThrow(
      'Payment order already processed',
    );
    expect(mockSetCalls).toEqual([]);
  });
});
