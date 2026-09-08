/**
 * Catalog / ensure-tool-report persist must not replace a real reading with a placeholder.
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

import {
  persistOnDemandToolReports,
  shouldKeepExistingReportOverPlaceholder,
} from '@/lib/onDemandToolReports';

describe('shouldKeepExistingReportOverPlaceholder', () => {
  const realPalmistry = {
    palmistryContext: { lines: { lifeLine: 'long' } },
    analysis: { overview: 'Strong life line' },
    generationIdempotencyKey: 'hash-1',
  };

  it('keeps a real stored report when the incoming payload is a placeholder', () => {
    expect(
      shouldKeepExistingReportOverPlaceholder(realPalmistry, {
        placeholder: true,
        reason: 'Palm analysis failed. Try re-uploading a clearer image.',
      }),
    ).toBe(true);
  });

  it('does not keep a placeholder over another placeholder', () => {
    expect(
      shouldKeepExistingReportOverPlaceholder(
        { placeholder: true, reason: 'Upload hand images' },
        { placeholder: true, reason: 'Palm analysis failed' },
      ),
    ).toBe(false);
  });

  it('does not keep when incoming is a real report', () => {
    expect(
      shouldKeepExistingReportOverPlaceholder(realPalmistry, {
        palmistryContext: { lines: { lifeLine: 'short' } },
        analysis: { overview: 'Updated' },
      }),
    ).toBe(false);
  });

  it('does not keep when nothing is stored yet', () => {
    expect(
      shouldKeepExistingReportOverPlaceholder(undefined, { placeholder: true, reason: 'unavailable' }),
    ).toBe(false);
  });
});

describe('persistOnDemandToolReports placeholder guard', () => {
  const uid = 'user-1';
  const profileHash = 'hash-1';
  const realPalmistry = {
    palmistryContext: { lines: { lifeLine: 'long' } },
    analysis: { overview: 'Strong life line' },
    generationIdempotencyKey: profileHash,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetDocument.mockResolvedValue(true);
  });

  it('does not overwrite a stored palmistry reading with a later placeholder persist', async () => {
    mockGetDocument.mockImplementation((collection: string) => {
      if (collection === 'comprehensiveMysticalProfiles') {
        return Promise.resolve({
          palmistry: realPalmistry,
          toolStatus: { palmistry: { state: 'ready', attempts: 1 } },
        });
      }
      return Promise.resolve({});
    });

    const result = await persistOnDemandToolReports({
      uid,
      profileHash,
      toolReports: {
        palmistry: {
          status: 'success',
          data: {
            placeholder: true,
            reason: 'Palm analysis failed. Try re-uploading a clearer image.',
          },
          generatedAt: new Date().toISOString(),
        },
      },
    });

    expect(result.failedSlugs).toContain('palmistry');
    expect(result.readySlugs).not.toContain('palmistry');

    const profileWrite = mockSetDocument.mock.calls.find(
      (call: unknown[]) => call[0] === 'comprehensiveMysticalProfiles',
    );
    expect(profileWrite).toBeDefined();
    const patch = profileWrite?.[2] as Record<string, unknown>;
    expect(patch.palmistry).toBeUndefined();
  });

  it('still writes a placeholder when the tool has no real report yet', async () => {
    mockGetDocument.mockResolvedValue({});

    await persistOnDemandToolReports({
      uid,
      profileHash,
      toolReports: {
        faceReading: {
          status: 'success',
          data: { placeholder: true, reason: 'Physiognomy needs a readable photo.' },
          generatedAt: new Date().toISOString(),
        },
      },
    });

    const profileWrite = mockSetDocument.mock.calls.find(
      (call: unknown[]) => call[0] === 'comprehensiveMysticalProfiles',
    );
    const patch = profileWrite?.[2] as Record<string, unknown>;
    expect(patch.faceReading).toEqual(
      expect.objectContaining({
        placeholder: true,
        generationIdempotencyKey: profileHash,
      }),
    );
  });

  it('still persists a sibling tool in the same batch when one slug is kept', async () => {
    mockGetDocument.mockImplementation((collection: string) => {
      if (collection === 'comprehensiveMysticalProfiles') {
        return Promise.resolve({ palmistry: realPalmistry });
      }
      return Promise.resolve({});
    });

    await persistOnDemandToolReports({
      uid,
      profileHash,
      toolReports: {
        palmistry: {
          status: 'success',
          data: { placeholder: true, reason: 'Palm analysis failed.' },
          generatedAt: new Date().toISOString(),
        },
        tarot: {
          status: 'success',
          data: { cards: [{ name: 'The Fool' }], profile: { birthCard: { name: 'The Fool' } } },
          generatedAt: new Date().toISOString(),
        },
      },
    });

    const profileWrite = mockSetDocument.mock.calls.find(
      (call: unknown[]) => call[0] === 'comprehensiveMysticalProfiles',
    );
    const patch = profileWrite?.[2] as Record<string, unknown>;
    expect(patch.palmistry).toBeUndefined();
    expect(patch.tarot).toEqual(
      expect.objectContaining({
        cards: [{ name: 'The Fool' }],
        generationIdempotencyKey: profileHash,
      }),
    );
  });
});
