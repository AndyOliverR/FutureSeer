/**
 * Stale on-demand persist must not clobber a newer profile hash.
 * @jest-environment node
 */

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

describe('persistOnDemandToolReports hash fence', () => {
  const uid = 'user-1';
  const tarotEntry = {
    status: 'success' as const,
    data: { cards: [{ name: 'The Fool' }] },
    generatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetDocument.mockResolvedValue(true);
    mockClearCachedDivinationData.mockReturnValue(undefined);
  });

  it('does not write reports or revert users.profileDataHash when the live hash moved', async () => {
    mockGetDocument.mockImplementation((collection: string) => {
      if (collection === 'users') {
        return Promise.resolve({ profileDataHash: 'hash-H2' });
      }
      if (collection === 'comprehensiveMysticalProfiles') {
        return Promise.resolve({
          vedic: { planets: [{ name: 'Sun' }], generationIdempotencyKey: 'hash-H2' },
          profileDataHash: 'hash-H2',
        });
      }
      return Promise.resolve({});
    });

    const result = await persistOnDemandToolReports({
      uid,
      profileHash: 'hash-H1',
      toolReports: { tarot: tarotEntry },
    });

    expect(result.skippedStaleHash).toBe(true);
    expect(result.readySlugs).toEqual([]);
    expect(result.failedSlugs).toEqual(['tarot']);
    expect(mockSetDocument).not.toHaveBeenCalled();
  });

  it('persists when the live hash still matches the request', async () => {
    mockGetDocument.mockImplementation((collection: string) => {
      if (collection === 'users') {
        return Promise.resolve({ profileDataHash: 'hash-H1' });
      }
      if (collection === 'comprehensiveMysticalProfiles') {
        return Promise.resolve({ profileDataHash: 'hash-H1' });
      }
      return Promise.resolve({});
    });

    const result = await persistOnDemandToolReports({
      uid,
      profileHash: 'hash-H1',
      toolReports: { tarot: tarotEntry },
    });

    expect(result.skippedStaleHash).toBe(false);
    expect(result.readySlugs).toEqual(['tarot']);
    expect(mockSetDocument).toHaveBeenCalled();
    const userWrite = mockSetDocument.mock.calls.find((call) => call[0] === 'users');
    expect(userWrite?.[2]).toEqual(expect.objectContaining({ profileDataHash: 'hash-H1' }));
  });
});
