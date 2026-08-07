/**
 * update-palmistry must patch only the palmistry key (merge), never rewrite a
 * stale full comprehensive profile snapshot that could clobber Stage B tools.
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyIdToken = jest.fn();
const mockGetDocument = jest.fn();
const mockSetDocument = jest.fn();
const mockClearCachedDivinationData = jest.fn();
const mockFormatPalmistryData = jest.fn();
const mockFetch = jest.fn();

jest.mock('firebase-admin/auth', () => ({
  getAuth: () => ({ verifyIdToken: mockVerifyIdToken }),
}));

jest.mock('@/lib/firebase-admin', () => ({
  getDocument: (...args: unknown[]) => mockGetDocument(...args),
  setDocument: (...args: unknown[]) => mockSetDocument(...args),
  isAdminAvailable: () => true,
}));

jest.mock('@/lib/universalDataAggregator', () => ({
  clearCachedDivinationData: (...args: unknown[]) => mockClearCachedDivinationData(...args),
}));

jest.mock('@/lib/serverBaseUrl', () => ({
  getServerBaseUrl: () => 'http://localhost:3000',
}));

jest.mock('@/lib/palmistry/palmistryImageAnalyzer', () => ({
  palmistryImageAnalyzer: {
    formatPalmistryData: (...args: unknown[]) => mockFormatPalmistryData(...args),
  },
}));

import { POST } from '@/app/api/profile/update-palmistry/route';

describe('POST /api/profile/update-palmistry merge safety', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = mockFetch as unknown as typeof fetch;
    mockVerifyIdToken.mockResolvedValue({ uid: 'uid-1', email: 'u@example.com' });
    mockGetDocument.mockResolvedValue({
      palmPhotoUrl: 'https://example.com/palm.jpg',
      birthDate: '1990-01-01',
      gender: 'female',
    });
    mockSetDocument.mockResolvedValue(true);
    mockFormatPalmistryData.mockReturnValue({ lines: { life: 'strong' }, mounts: { venus: 'full' } });
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          lines: { life: 'strong' },
          mounts: { venus: 'full' },
        },
      }),
    });
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('writes only palmistry (no stale full-profile spread)', async () => {
    const req = new NextRequest('http://localhost/api/profile/update-palmistry', {
      method: 'POST',
      headers: { Authorization: 'Bearer good' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(mockSetDocument).toHaveBeenCalledTimes(1);
    const [collection, docId, payload] = mockSetDocument.mock.calls[0];
    expect(collection).toBe('comprehensiveMysticalProfiles');
    expect(docId).toBe('uid-1');
    expect(Object.keys(payload).sort()).toEqual(['palmistry']);
    expect(payload.palmistry).toEqual({
      palmistryContext: { lines: { life: 'strong' }, mounts: { venus: 'full' } },
      analysis: { lines: { life: 'strong' }, mounts: { venus: 'full' } },
    });
    // Must not read comprehensive profile for a rewrite snapshot
    expect(mockGetDocument).toHaveBeenCalledWith('users', 'uid-1');
    expect(mockGetDocument).not.toHaveBeenCalledWith('comprehensiveMysticalProfiles', 'uid-1');
  });
});
