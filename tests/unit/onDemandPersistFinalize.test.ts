/**
 * @jest-environment node
 */

jest.mock('server-only', () => ({}));

const mockGetDocument = jest.fn();
const mockSetDocument = jest.fn();
const mockClearCachedDivinationData = jest.fn();

jest.mock('@/lib/firebase-admin', () => ({
  getDocument: (...args: unknown[]) => mockGetDocument(...args),
  setDocument: (...args: unknown[]) => mockSetDocument(...args),
}));

jest.mock('@/lib/universalDataAggregator', () => ({
  clearCachedDivinationData: (...args: unknown[]) => mockClearCachedDivinationData(...args),
}));

import { persistOnDemandToolReports } from '@/lib/onDemandToolReports';

describe('persistOnDemandToolReports generation finalization', () => {
  const uid = 'user-1';
  const profileHash = 'hash-natal';

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDocument.mockResolvedValue({
      vedic: { chart: { lagna: 'Aries' }, generationIdempotencyKey: profileHash },
    });
    mockSetDocument.mockResolvedValue(true);
  });

  it('does not complete generationLocks or revert user hash when persisting a single on-demand tool', async () => {
    await persistOnDemandToolReports({
      uid,
      profileHash,
      toolReports: {
        tarot: {
          status: 'success',
          data: { cards: [{ name: 'The Fool' }] },
          generatedAt: new Date().toISOString(),
        },
      },
    });

    const lockWrites = mockSetDocument.mock.calls.filter((call) => call[0] === 'generationLocks');
    const jobWrites = mockSetDocument.mock.calls.filter((call) => call[0] === 'generationJobs');
    const userWrites = mockSetDocument.mock.calls.filter((call) => call[0] === 'users');
    const profileWrites = mockSetDocument.mock.calls.filter(
      (call) => call[0] === 'comprehensiveMysticalProfiles',
    );

    expect(lockWrites).toHaveLength(0);
    expect(jobWrites).toHaveLength(0);
    expect(userWrites).toHaveLength(0);
    expect(profileWrites[0][2]).toEqual(
      expect.objectContaining({
        tarot: expect.objectContaining({
          cards: [{ name: 'The Fool' }],
          generationIdempotencyKey: profileHash,
        }),
      }),
    );
    expect(profileWrites[0][2].profileDataHash).toBeUndefined();
  });

  it('finalizes lock, job, and user hash when natal generate commits', async () => {
    await persistOnDemandToolReports({
      uid,
      profileHash,
      finalizeGeneration: true,
      toolReports: {
        vedic: {
          status: 'success',
          data: { chart: { lagna: 'Aries' } },
          generatedAt: new Date().toISOString(),
        },
        western: {
          status: 'success',
          data: { chart: { sun: 'Leo' } },
          generatedAt: new Date().toISOString(),
        },
      },
    });

    expect(mockSetDocument).toHaveBeenCalledWith(
      'generationLocks',
      uid,
      expect.objectContaining({ status: 'completed', lockedAt: null, allReportsReady: true }),
    );
    expect(mockSetDocument).toHaveBeenCalledWith(
      'generationJobs',
      uid,
      expect.objectContaining({ status: 'completed', pipelineMode: 'on_demand' }),
    );
    expect(mockSetDocument).toHaveBeenCalledWith(
      'users',
      uid,
      expect.objectContaining({
        profileDataHash: profileHash,
        profileStatus: 'completed',
        allReportsReady: true,
      }),
    );
  });
});
