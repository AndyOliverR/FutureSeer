/**
 * @jest-environment node
 */

jest.mock('server-only', () => ({}), { virtual: true });

const mockState: {
  setCalls: Array<{ path: string; data: Record<string, unknown> }>;
  userData: Record<string, unknown>;
  claimData: Record<string, unknown> | null;
} = {
  setCalls: [],
  userData: { creditBalance: 5 },
  claimData: null,
};

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
              data: () => mockState.userData,
            };
          }
          if (ref.path.startsWith('_creditPaymentOrders/')) {
            return {
              exists: mockState.claimData !== null,
              data: () => mockState.claimData ?? undefined,
            };
          }
          return {
            exists: false,
            data: () => undefined,
          };
        }),
        set: jest.fn((ref: { path: string }, data: Record<string, unknown>) => {
          mockState.setCalls.push({ path: ref.path, data });
        }),
      };
      return callback(tx);
    }),
  },
}));

let addCreditsFromPack: typeof import('@/lib/billingCreditsServer').addCreditsFromPack;

describe('addCreditsFromPack', () => {
  beforeAll(async () => {
    ({ addCreditsFromPack } = await import('@/lib/billingCreditsServer'));
  });

  beforeEach(() => {
    mockState.setCalls.length = 0;
    mockState.userData = { creditBalance: 5 };
    mockState.claimData = null;
    jest.clearAllMocks();
  });

  it('records a global claim when applying a credit purchase', async () => {
    const result = await addCreditsFromPack('user-1', 'starter', 'order_123', 'pay_123');

    expect(result).toEqual({ success: true, creditsAdded: 15, creditBalance: 20 });
    expect(mockState.setCalls.some((call) => call.path === '_creditPaymentOrders/order_123')).toBe(true);
    expect(mockState.setCalls.find((call) => call.path === '_creditPaymentOrders/order_123')?.data).toMatchObject({
      orderId: 'order_123',
      userId: 'user-1',
      packId: 'starter',
      paymentId: 'pay_123',
      credits: 15,
    });
  });

  it('treats same-user replay as an idempotent duplicate', async () => {
    mockState.userData = { creditBalance: 20 };
    mockState.claimData = { userId: 'user-1', orderId: 'order_123' };

    await expect(addCreditsFromPack('user-1', 'starter', 'order_123', 'pay_123')).resolves.toEqual({
      success: true,
      creditsAdded: 0,
      creditBalance: 20,
      duplicate: true,
    });
    expect(mockState.setCalls).toEqual([]);
  });

  it('rejects replay of a paid order on another user account', async () => {
    mockState.claimData = { userId: 'user-2', orderId: 'order_123' };

    await expect(addCreditsFromPack('user-1', 'starter', 'order_123', 'pay_123')).rejects.toThrow(
      'Payment order already processed',
    );
    expect(mockState.setCalls).toEqual([]);
  });
});
