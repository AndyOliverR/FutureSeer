/**
 * Integration tests: profile generation API
 * Simulates: returning login (idempotent), new signup → generate, edit → regenerate.
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { calculateProfileDataHash } from '@/lib/firebase';

const mockVerifyIdToken = jest.fn();
const mockGetDocument = jest.fn();
const mockSetDocument = jest.fn();
const mockGenerateAllReports = jest.fn();
const mockClearCachedDivinationData = jest.fn();

jest.mock('firebase-admin/auth', () => ({
  getAuth: () => ({ verifyIdToken: mockVerifyIdToken }),
}));

jest.mock('@/lib/firebase-admin', () => ({
  getDocument: (...args: unknown[]) => mockGetDocument(...args),
  setDocument: (...args: unknown[]) => mockSetDocument(...args),
  isAdminAvailable: () => true,
}));

jest.mock('@/lib/reportGenerationService', () => ({
  generateAllReports: (...args: unknown[]) => mockGenerateAllReports(...args),
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyIdToken.mockResolvedValue({ uid });
    mockSetDocument.mockResolvedValue(undefined);
    mockClearCachedDivinationData.mockReturnValue(undefined);
  });

  async function callGenerate(token = 'fake-token'): Promise<Response> {
    const req = new NextRequest('http://localhost:3000/api/profile/generate-mystical', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return POST(req) as Promise<Response>;
  }

  describe('Returning login (idempotent)', () => {
    it('returns alreadyGenerated when profile is generated and hash matches', async () => {
      const profile = { ...baseProfile };
      const hash = calculateProfileDataHash(profile);
      mockGetDocument.mockResolvedValue({
        ...profile,
        mysticalProfileGenerated: true,
        profileDataHash: hash,
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
      mockGetDocument.mockResolvedValue(profile);
      mockGenerateAllReports.mockResolvedValue({
        success: true,
        systemsUsed: ['vedic', 'numerology'],
        failedTools: [],
        comprehensiveProfile: { vedic: {}, numerology: {} },
        seerMaster: {},
        toolReports: {},
      });

      const res = await callGenerate();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.alreadyGenerated).not.toBe(true);
      expect(mockGenerateAllReports).toHaveBeenCalledWith(uid, expect.objectContaining({ uid, birthDate: profile.birthDate, birthPlace: profile.birthPlace }));
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
      mockGetDocument.mockResolvedValue(profile);
      mockGenerateAllReports.mockResolvedValue({
        success: true,
        systemsUsed: ['vedic', 'numerology'],
        failedTools: [],
        comprehensiveProfile: {},
        seerMaster: {},
        toolReports: {},
      });

      const res = await callGenerate();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.alreadyGenerated).not.toBe(true);
      expect(mockGenerateAllReports).toHaveBeenCalledWith(uid, expect.objectContaining({ birthDate: '1992-06-20' }));
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
  });
});
