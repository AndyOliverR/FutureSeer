/**
 * @jest-environment node
 */

const mockTransactionGet = jest.fn();
const mockTransactionSet = jest.fn();
const mockRunTransaction = jest.fn();
const mockGetDocument = jest.fn();

jest.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    runTransaction: (...args: unknown[]) => mockRunTransaction(...args),
    collection: (colName: string) => ({
      doc: (docId: string) => ({ path: `${colName}/${docId}` }),
    }),
  },
  getDocument: (...args: unknown[]) => mockGetDocument(...args),
}));

import {
  StageBClaimLostError,
  assertStageBClaimHeld,
  mergeGenerationJobIfClaimHeld,
} from '@/lib/mysticalStageBClaim';

describe('mergeGenerationJobIfClaimHeld', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRunTransaction.mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        get: mockTransactionGet,
        set: mockTransactionSet,
      };
      return callback(tx);
    });
  });

  it('merges patch when claim still owns a running job', async () => {
    mockTransactionGet.mockResolvedValue({
      data: () => ({ claimId: 'claim-a', status: 'running', toolTasks: {} }),
    });

    const ok = await mergeGenerationJobIfClaimHeld('uid1', 'claim-a', {
      toolTasks: { vedic: { status: 'ready' } },
      lastHeartbeatAt: 123,
    });

    expect(ok).toBe(true);
    expect(mockTransactionSet).toHaveBeenCalledWith(
      { path: 'generationJobs/uid1' },
      expect.objectContaining({
        claimId: 'claim-a',
        toolTasks: { vedic: { status: 'ready' } },
        lastHeartbeatAt: 123,
      }),
      { merge: true },
    );
  });

  it('refuses write when another worker reclaimed (claimId mismatch)', async () => {
    mockTransactionGet.mockResolvedValue({
      data: () => ({ claimId: 'claim-b', status: 'running' }),
    });

    const ok = await mergeGenerationJobIfClaimHeld('uid1', 'claim-a', {
      toolTasks: { vedic: { status: 'ready' } },
    });

    expect(ok).toBe(false);
    expect(mockTransactionSet).not.toHaveBeenCalled();
  });

  it('refuses write when job left running (completed/queued)', async () => {
    mockTransactionGet.mockResolvedValue({
      data: () => ({ claimId: 'claim-a', status: 'completed' }),
    });

    const ok = await mergeGenerationJobIfClaimHeld('uid1', 'claim-a', {
      status: 'completed',
    });

    expect(ok).toBe(false);
    expect(mockTransactionSet).not.toHaveBeenCalled();
  });
});

describe('assertStageBClaimHeld', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws StageBClaimLostError when claim was stolen', async () => {
    mockGetDocument.mockResolvedValue({ claimId: 'other', status: 'running' });
    await expect(assertStageBClaimHeld('uid1', 'mine')).rejects.toBeInstanceOf(StageBClaimLostError);
  });

  it('resolves when claim is active', async () => {
    mockGetDocument.mockResolvedValue({ claimId: 'mine', status: 'running' });
    await expect(assertStageBClaimHeld('uid1', 'mine')).resolves.toBeUndefined();
  });
});
