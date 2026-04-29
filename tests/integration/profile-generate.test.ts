/**
 * Integration tests: profile generation API
 * Simulates: returning login (idempotent), new signup → generate, edit → regenerate.
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { calculateProfileDataHash } from '@/lib/firebase';
import { ALL_TOOL_SLUGS } from '@/lib/profileGenerationOrchestrator';

const mockVerifyIdToken = jest.fn();
const mockGetDocument = jest.fn();
const mockSetDocument = jest.fn();
const mockBatchSetDocuments = jest.fn();
const mockGenerateAllReports = jest.fn();
const mockGenerateCoreReportsStageA = jest.fn();
const mockClearCachedDivinationData = jest.fn();

jest.mock('firebase-admin/auth', () => ({
  getAuth: () => ({ verifyIdToken: mockVerifyIdToken }),
}));

jest.mock('@/lib/firebase-admin', () => {
  /** Firestore admin: generationLock uses runTransaction; route logs profileGenerationUsage. */
  const mockAdminDb = {
    runTransaction: jest.fn(async (callback: (tx: { get: jest.Mock; set: jest.Mock }) => Promise<unknown>) => {
      const tx = {
        get: jest.fn().mockResolvedValue({
          exists: false,
          data: () => undefined,
        }),
        set: jest.fn(),
      };
      return callback(tx);
    }),
    collection: jest.fn((colName: string) => ({
      add: jest.fn().mockResolvedValue({ id: 'mock-error-event-id' }),
      doc: jest.fn((docId: string) => {
        const ref: { path: string; collection?: jest.Mock } = {
          path: `${colName}/${docId}`,
        };
        if (colName === 'profileGenerationUsage') {
          ref.collection = jest.fn(() => ({
            doc: jest.fn(() => ({
              set: jest.fn().mockResolvedValue(undefined),
            })),
          }));
        }
        return ref;
      }),
    })),
  };
  return {
    getDocument: (...args: unknown[]) => mockGetDocument(...args),
    setDocument: (...args: unknown[]) => mockSetDocument(...args),
    batchSetDocuments: (...args: unknown[]) => mockBatchSetDocuments(...args),
    isAdminAvailable: () => true,
    adminDb: mockAdminDb,
  };
});

jest.mock('@/lib/reportGenerationService', () => ({
  generateAllReports: (...args: unknown[]) => mockGenerateAllReports(...args),
  generateCoreReportsStageA: (...args: unknown[]) => mockGenerateCoreReportsStageA(...args),
  getCoreStageToolCount: () => 10,
}));

jest.mock('@/lib/universalDataAggregator', () => ({
  clearCachedDivinationData: (...args: unknown[]) => mockClearCachedDivinationData(...args),
}));

// Import route after mocks so it sees mocked dependencies
import { POST } from '@/app/api/profile/generate-mystical/route';

describe('Profile generate-mystical API', () => {
  const uid = 'test-uid-123';

  const baseProfile = {
    uid,
    birthDate: '1990-01-15',
    birthTime: '10:30',
    birthPlace: 'New York, NY',
    displayName: 'Test User',
    selectedPlan: 'buy-coffee',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyIdToken.mockResolvedValue({ uid });
    mockSetDocument.mockResolvedValue(undefined);
    mockBatchSetDocuments.mockResolvedValue(true);
    mockClearCachedDivinationData.mockReturnValue(undefined);
    mockGenerateCoreReportsStageA.mockResolvedValue({
      success: true,
      systemsUsed: ['vedic', 'numerology'],
      failedTools: [],
      comprehensiveProfile: { vedic: {}, numerology: {} },
      seerMaster: {},
      toolReports: {},
      aggregateUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    });
    mockGenerateAllReports.mockResolvedValue({
      success: true,
      systemsUsed: ['vedic', 'numerology'],
      failedTools: [],
      comprehensiveProfile: { vedic: {}, numerology: {} },
      seerMaster: {},
      toolReports: {},
      aggregateUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    });
  });

  async function callGenerate(
    token = 'fake-token',
    body?: Record<string, unknown>,
  ): Promise<Response> {
    const req = new NextRequest('http://localhost:3000/api/profile/generate-mystical', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return POST(req) as Promise<Response>;
  }

  describe('Returning login (idempotent)', () => {
    it('returns alreadyGenerated when profile is generated and hash matches', async () => {
      const profile = { ...baseProfile };
      const hash = calculateProfileDataHash(profile);
      const storedProfileWithAllTools = Object.fromEntries(
        ALL_TOOL_SLUGS.map((slug) => [slug, { placeholder: false }])
      );
      mockGetDocument.mockImplementation((collection: string) => {
        if (collection === 'users') {
          return Promise.resolve({
            ...profile,
            mysticalProfileGenerated: true,
            profileDataHash: hash,
          });
        }
        if (collection === 'comprehensiveMysticalProfiles') {
          return Promise.resolve(storedProfileWithAllTools);
        }
        return Promise.resolve(undefined);
      });

      const res = await callGenerate();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.alreadyGenerated).toBe(true);
      expect(mockGenerateAllReports).not.toHaveBeenCalled();
    });
  });

  describe('New signup → generate', () => {
    it('runs generation and returns success when profile is complete and not yet generated', async () => {
      const profile = { ...baseProfile };
      mockGetDocument.mockImplementation((collection: string) => {
        if (collection === 'users') return Promise.resolve(profile);
        if (collection === 'generationLocks') return Promise.resolve(null);
        if (collection === 'comprehensiveMysticalProfiles') return Promise.resolve({});
        return Promise.resolve(undefined);
      });
      const res = await callGenerate();
      const data = await res.json();

      expect(res.status).toBe(202);
      expect(data.success).toBe(true);
      expect(data.alreadyGenerated).not.toBe(true);
      expect(data.allReportsReady).toBe(false);
      expect(Array.isArray(data.pendingToolSlugs)).toBe(true);
      expect(mockGenerateCoreReportsStageA).toHaveBeenCalledWith(uid, expect.objectContaining({ uid, birthDate: profile.birthDate, birthPlace: profile.birthPlace }));
    });
  });

  describe('Edit → regenerate', () => {
    it('runs generation when profileDataHash differs from current profile hash', async () => {
      const profile = {
        ...baseProfile,
        birthDate: '1992-06-20',
        mysticalProfileGenerated: true,
        profileDataHash: 'old-hash-different-from-current',
      };
      mockGetDocument.mockImplementation((collection: string) => {
        if (collection === 'users') return Promise.resolve(profile);
        if (collection === 'generationLocks') return Promise.resolve(null);
        if (collection === 'comprehensiveMysticalProfiles') return Promise.resolve({});
        return Promise.resolve(undefined);
      });
      const res = await callGenerate();
      const data = await res.json();

      expect(res.status).toBe(202);
      expect(data.success).toBe(true);
      expect(data.alreadyGenerated).not.toBe(true);
      expect(mockGenerateCoreReportsStageA).toHaveBeenCalledWith(uid, expect.objectContaining({ birthDate: '1992-06-20' }));
    });
  });

  describe('Auth and validation', () => {
    it('returns 401 when Authorization header is missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/profile/generate-mystical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const res = await POST(req);
      const data = await res.json();
      expect(res.status).toBe(401);
      expect(data.error).toContain('Missing');
    });

    it('returns 401 when token is invalid', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));
      const res = await callGenerate();
      const data = await res.json();
      expect(res.status).toBe(401);
      expect(data.error).toContain('Invalid');
    });

    it('returns 400 when profile missing birth date or place', async () => {
      mockGetDocument.mockResolvedValue({ uid, birthPlace: 'NYC' });
      const res = await callGenerate();
      const data = await res.json();
      expect(res.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('returns payment_method_update_required for full mode when status is past_due', async () => {
      mockGetDocument.mockResolvedValue({
        ...baseProfile,
        mysticalProfileGenerated: true,
        fullName: 'Test User',
        gender: 'male',
        currentLocation: 'New York, NY',
        facePhotoUrl: 'https://example.com/face.jpg',
        palmPhotoUrl: 'https://example.com/palm.jpg',
        selectedPlan: 'premium',
        subscriptionStatus: 'past_due',
        paymentMethodId: '',
      });

      const res = await callGenerate('fake-token', { mode: 'full' });
      const data = await res.json();
      expect(res.status).toBe(403);
      expect(data.blockReason).toBe('payment_method_update_required');
      expect(data.subscriptionStatus).toBe('past_due');
    });

    it('allows first onboarding full generation without payment setup', async () => {
      mockGetDocument.mockResolvedValue({
        ...baseProfile,
        mysticalProfileGenerated: false,
        fullName: 'Test User',
        gender: 'male',
        currentLocation: 'New York, NY',
        facePhotoUrl: 'https://example.com/face.jpg',
        palmPhotoUrl: 'https://example.com/palm.jpg',
        selectedPlan: 'power-user-trial',
        subscriptionStatus: 'trial',
        paymentMethodId: '',
      });

      const res = await callGenerate('fake-token', { mode: 'full' });
      const data = await res.json();
      expect(res.status).toBe(202);
      expect(data.success).toBe(true);
      expect(data.blockReason).toBeUndefined();
      expect(mockGenerateCoreReportsStageA).toHaveBeenCalled();
    });
  });

  describe('Vedic failure resilience', () => {
    it('returns graceful partial response when Stage A has no successful systems', async () => {
      const profile = { ...baseProfile };
      mockGetDocument.mockImplementation((collection: string) => {
        if (collection === 'users') return Promise.resolve(profile);
        if (collection === 'generationLocks') return Promise.resolve(null);
        if (collection === 'comprehensiveMysticalProfiles') return Promise.resolve({});
        return Promise.resolve(undefined);
      });
      mockGenerateCoreReportsStageA.mockResolvedValueOnce({
        success: false,
        systemsUsed: [],
        failedTools: ['vedic'],
        comprehensiveProfile: {},
        seerMaster: {},
        toolReports: {
          vedic: { status: 'failed', error: 'Vedic API: 500', generatedAt: new Date().toISOString() },
        },
        aggregateUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      });

      const res = await callGenerate();
      const data = await res.json();

      expect(res.status).toBe(202);
      expect(data.success).toBe(true);
      expect(data.partial).toBe(true);
      expect(data.generationState).toBe('stageA_failed');
      expect(data.failedTools).toContain('vedic');
    });

    it('preserves zero-value coordinates in overrides (0 is valid)', async () => {
      const profile = { ...baseProfile };
      mockGetDocument.mockImplementation((collection: string) => {
        if (collection === 'users') return Promise.resolve(profile);
        if (collection === 'generationLocks') return Promise.resolve(null);
        if (collection === 'comprehensiveMysticalProfiles') return Promise.resolve({});
        return Promise.resolve(undefined);
      });

      const req = new NextRequest('http://localhost:3000/api/profile/generate-mystical', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer fake-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileOverrides: {
            birthLatitude: 0,
            birthLongitude: 0,
          },
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(202);
      expect(mockGenerateCoreReportsStageA).toHaveBeenCalledWith(
        uid,
        expect.objectContaining({
          birthLatitude: 0,
          birthLongitude: 0,
        }),
      );
    });
  });
});
