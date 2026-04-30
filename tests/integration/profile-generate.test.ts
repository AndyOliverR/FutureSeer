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
const mockTryResumeMysticalStageB = jest.fn();

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

jest.mock('@/lib/mysticalStageB', () => ({
  tryResumeMysticalStageB: (...args: unknown[]) => mockTryResumeMysticalStageB(...args),
}));

// Import route after mocks so it sees mocked dependencies
import { GET, POST } from '@/app/api/profile/generate-mystical/route';

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
    mockTryResumeMysticalStageB.mockResolvedValue({ started: true });
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

  async function callGenerationStatus(token = 'fake-token'): Promise<Response> {
    const req = new NextRequest('http://localhost:3000/api/profile/generate-mystical', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return GET(req) as Promise<Response>;
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
      expect(mockTryResumeMysticalStageB).toHaveBeenCalledWith(uid);
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

  describe('Generation status semantics (GET)', () => {
    it('returns running state when lock is active', async () => {
      mockGetDocument.mockImplementation((collection: string) => {
        if (collection === 'users') return Promise.resolve({ ...baseProfile, mysticalProfileGenerated: true });
        if (collection === 'generationLocks') return Promise.resolve({ status: 'running', phase: 'stageB', updatedAt: Date.now() });
        if (collection === 'comprehensiveMysticalProfiles') return Promise.resolve({ vedic: { placeholder: false } });
        return Promise.resolve(undefined);
      });

      const res = await callGenerationStatus();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.inProgress).toBe(true);
      expect(data.generationState).toBe('running');
      expect(data.partialReady).toBe(true);
      expect(data.completed).toBe(false);
    });

    it('returns completed state when all reports are ready', async () => {
      const allReadyProfile = Object.fromEntries(ALL_TOOL_SLUGS.map((slug) => [slug, { placeholder: false }]));
      mockGetDocument.mockImplementation((collection: string) => {
        if (collection === 'users') return Promise.resolve({ ...baseProfile, mysticalProfileGenerated: true, allReportsReady: true });
        if (collection === 'generationLocks') return Promise.resolve({ status: 'completed', phase: 'completed', updatedAt: Date.now() });
        if (collection === 'comprehensiveMysticalProfiles') return Promise.resolve(allReadyProfile);
        return Promise.resolve(undefined);
      });

      const res = await callGenerationStatus();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.inProgress).toBe(false);
      expect(data.completed).toBe(true);
      expect(data.partialReady).toBe(false);
      expect(data.generationState).toBe('completed');
      expect(data.allReportsReady).toBe(true);
    });

    it('returns partial_ready when some snippets exist but pipeline is not active', async () => {
      mockGetDocument.mockImplementation((collection: string) => {
        if (collection === 'users') return Promise.resolve({ ...baseProfile, mysticalProfileGenerated: true, allReportsReady: false });
        if (collection === 'generationLocks') return Promise.resolve({ status: 'failed', phase: 'failed', updatedAt: Date.now() });
        if (collection === 'comprehensiveMysticalProfiles') return Promise.resolve({ vedic: { placeholder: false } });
        return Promise.resolve(undefined);
      });

      const res = await callGenerationStatus();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.inProgress).toBe(false);
      expect(data.partialReady).toBe(true);
      expect(data.completed).toBe(false);
      expect(data.generationState).toBe('partial_ready');
      expect(data.readyToolsCount).toBeGreaterThan(0);
    });

    it('recovers stale running lock and returns partial_ready without endless inProgress', async () => {
      const staleTs = Date.now() - (120_000 + 90_000 + 60_000);
      mockGetDocument.mockImplementation((collection: string) => {
        if (collection === 'users') {
          return Promise.resolve({
            ...baseProfile,
            mysticalProfileGenerated: true,
            allReportsReady: false,
            pendingToolSlugs: ALL_TOOL_SLUGS,
          });
        }
        if (collection === 'generationLocks') {
          return Promise.resolve({
            status: 'running',
            phase: 'stageB',
            updatedAt: staleTs,
            lockedAt: staleTs,
          });
        }
        if (collection === 'comprehensiveMysticalProfiles') {
          return Promise.resolve({ vedic: { placeholder: false }, numerology: { placeholder: false } });
        }
        return Promise.resolve(undefined);
      });

      const res = await callGenerationStatus();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.inProgress).toBe(false);
      expect(data.partialReady).toBe(true);
      expect(data.generationState).toBe('partial_ready');
      expect(data.lockStaleRecovered).toBe(true);
      expect(mockSetDocument).toHaveBeenCalledWith(
        'generationLocks',
        uid,
        expect.objectContaining({
          staleRecovered: true,
          phase: 'stale_timeout',
        }),
      );
    });

    it('resumes queued stageB job from status polling', async () => {
      const profileSnapshot = {
        ...baseProfile,
        uid,
        isSubscribed: false,
        isTipped: false,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
      };
      mockGetDocument.mockImplementation((collection: string) => {
        if (collection === 'users') return Promise.resolve({ ...baseProfile, mysticalProfileGenerated: true, allReportsReady: false });
        if (collection === 'generationLocks') return Promise.resolve({ status: 'failed', phase: 'failed', updatedAt: Date.now() });
        if (collection === 'comprehensiveMysticalProfiles') return Promise.resolve({ vedic: { placeholder: false } });
        if (collection === 'generationJobs') {
          return Promise.resolve({
            status: 'queued',
            profileHash: 'queued-hash',
            profileSnapshot,
          });
        }
        return Promise.resolve(undefined);
      });

      const res = await callGenerationStatus();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.generationJobStatus).toBe('queued');
      expect(mockTryResumeMysticalStageB).toHaveBeenCalledWith(uid);
    });

    it('returns current tool slug and queue position for live progress UI', async () => {
      mockGetDocument.mockImplementation((collection: string) => {
        if (collection === 'users') return Promise.resolve({ ...baseProfile, mysticalProfileGenerated: true, allReportsReady: false });
        if (collection === 'generationLocks') {
          return Promise.resolve({ status: 'running', phase: 'stageB', updatedAt: Date.now(), currentToolSlug: 'financialAstrology' });
        }
        if (collection === 'comprehensiveMysticalProfiles') {
          return Promise.resolve({ vedic: { placeholder: false }, western: { placeholder: false } });
        }
        if (collection === 'generationJobs') {
          return Promise.resolve({
            status: 'running',
            currentToolSlug: 'financialAstrology',
            completedTools: 14,
            totalTools: ALL_TOOL_SLUGS.length,
          });
        }
        return Promise.resolve(undefined);
      });

      const res = await callGenerationStatus();
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.currentToolSlug).toBe('financialAstrology');
      expect(data.queuePosition).toEqual({
        completed: 14,
        total: ALL_TOOL_SLUGS.length,
      });
    });

    it('reconciles user allReportsReady false when profile shows all tools ready', async () => {
      const allReadyProfile = Object.fromEntries(ALL_TOOL_SLUGS.map((slug) => [slug, { placeholder: false }]));
      mockGetDocument.mockImplementation((collection: string) => {
        if (collection === 'users') {
          return Promise.resolve({
            ...baseProfile,
            mysticalProfileGenerated: true,
            allReportsReady: false,
            pendingToolSlugs: ALL_TOOL_SLUGS,
          });
        }
        if (collection === 'generationLocks') {
          return Promise.resolve({ status: 'completed', phase: 'completed', updatedAt: Date.now() });
        }
        if (collection === 'comprehensiveMysticalProfiles') {
          return Promise.resolve(allReadyProfile);
        }
        return Promise.resolve(undefined);
      });

      const res = await callGenerationStatus();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.inProgress).toBe(false);
      expect(data.completed).toBe(true);
      expect(data.allReportsReady).toBe(true);
      expect(mockSetDocument).toHaveBeenCalledWith(
        'users',
        uid,
        expect.objectContaining({
          allReportsReady: true,
          pendingToolSlugs: [],
          profileStatus: 'completed',
        }),
      );
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
