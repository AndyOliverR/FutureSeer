/**
 * @jest-environment node
 */

jest.mock('server-only', () => ({}), { virtual: true });

const setCalls: Array<{ path: string; data: Record<string, unknown> }> = [];
let userData: Record<string, unknown> = { creditBalance: 5 };
let claimData: Record<string, unknown> | null = null;

function makeRef(path: string) {
  return {
    path,
    collection: jest.fn((subCol: string) => ({
      doc: jest.fn((docId = 'auto-id') => makeRef(`${path}/${subCol}/${docId}`)),
    })),
  };
}

const mockAdminDb = {
  collection: jest.fn((colName: string) => ({
    doc: jest.fn((docId: string) => makeRef(`${colName}/${docId}`)),
  })),
  runTransaction: jest.fn(async (callback: (tx: { get: jest.Mock; set: jest.Mock }) => unknown) => {
    const tx = {
      get: jest.fn(async (ref: { path: string }) => {
        if (ref.path.startsWith('users/')) {
          return {
            exists: true,
            data: () => userData,
          };
        }
        if (ref.path.startsWith('_creditPaymentOrders/')) {
          return {
            exists: claimData !== null,
            data: () => claimData ?? undefined,
          };
        }
        return {
          exists: false,
          data: () => undefined,
        };
      }),
      set: jest.fn((ref: { path: string }, data: Record<string, unknown>) => {
        setCalls.push({ path: ref.path, data });
      }),
    };
    return callback(tx);
  }),
};

jest.mock('@/lib/firebase-admin', () => ({
  adminDb: mockAdminDb,
}));

import { addCreditsFromPack } from '@/lib/billingCreditsServer';

describe('addCreditsFromPack', () => {
  beforeEach(() => {
    setCalls.length = 0;
    userData = { creditBalance: 5 };
    claimData = null;
    jest.clearAllMocks();
  });

  it('records a global claim when applying a credit purchase', async () => {
    const result = await addCreditsFromPack('user-1', 'starter', 'order_123', 'pay_123');

    expect(result).toEqual({ success: true, creditsAdded: 15, creditBalance: 20 });
    expect(setCalls.some((call) => call.path === '_creditPaymentOrders/order_123')).toBe(true);
    expect(setCalls.find((call) => call.path === '_creditPaymentOrders/order_123')?.data).toMatchObject({
      orderId: 'order_123',
      userId: 'user-1',
      packId: 'starter',
      paymentId: 'pay_123',
      credits: 15,
    });
  });

  it('treats same-user replay as an idempotent duplicate', async () => {
    userData = { creditBalance: 20 };
    claimData = { userId: 'user-1', orderId: 'order_123' };

    await expect(addCreditsFromPack('user-1', 'starter', 'order_123', 'pay_123')).resolves.toEqual({
      success: true,
      creditsAdded: 0,
      creditBalance: 20,
      duplicate: true,
    });
    expect(setCalls).toEqual([]);
  });

  it('rejects replay of a paid order on another user account', async () => {
    claimData = { userId: 'user-2', orderId: 'order_123' };

    await expect(addCreditsFromPack('user-1', 'starter', 'order_123', 'pay_123')).rejects.toThrow(
      'Payment order already processed',
    );
    expect(setCalls).toEqual([]);
  });
});
