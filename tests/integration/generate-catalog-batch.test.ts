/**
 * Integration tests: POST /api/profile/generate-catalog-batch
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { ALL_TOOL_SLUGS } from '@/lib/toolReportReadiness';

function displayableReportForSlug(slug: string): Record<string, unknown> {
  switch (slug) {
    case 'vedic':
    case 'western':
    case 'hellenistic':
    case 'kp':
      return { planets: [{ name: 'Sun' }], placeholder: false };
    case 'tarot':
      return { profile: { birthCard: { name: 'The Fool' } }, placeholder: false };
    case 'numerology':
      return { lifePathNumber: 7, placeholder: false };
    case 'iching':
      return { hexagram: 1, placeholder: false };
    case 'runes':
      return { runes: [{ name: 'Fehu' }], placeholder: false };
    case 'bazi':
      return { pillars: { year: 'Jia Zi' }, placeholder: false };
    case 'humanDesign':
      return { type: 'Generator', placeholder: false };
    default:
      return { reading: 'ok', placeholder: false };
  }
}

function allToolsDisplayableProfile(): Record<string, unknown> {
  return Object.fromEntries(ALL_TOOL_SLUGS.map((slug) => [slug, displayableReportForSlug(slug)]));
}

const mockVerifyUserRequest = jest.fn();
const mockGetDocument = jest.fn();
const mockEnsureAdminAvailable = jest.fn();
const mockGenerateAndPersistToolReports = jest.fn();

jest.mock('@/lib/userApiAuth', () => ({
  verifyUserRequest: (...args: unknown[]) => mockVerifyUserRequest(...args),
}));

jest.mock('@/lib/firebase-admin', () => ({
  ensureAdminAvailable: (...args: unknown[]) => mockEnsureAdminAvailable(...args),
  getDocument: (...args: unknown[]) => mockGetDocument(...args),
  setDocument: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/lib/rateLimitFirestore', () => ({
  checkRateLimitWithOptionalFirestore: async (
    limiter: { check: (identifier: string) => { allowed: boolean; remaining: number; resetTime: number } },
    _logicalKey: string,
    identifier: string,
  ) => limiter.check(identifier),
}));

jest.mock('@/lib/onDemandToolReports', () => ({
  generateAndPersistToolReports: (...args: unknown[]) => mockGenerateAndPersistToolReports(...args),
}));

jest.mock('@/lib/firebase', () => ({
  calculateProfileDataHash: () => 'hash-1',
}));

import { POST } from '@/app/api/profile/generate-catalog-batch/route';

describe('generate-catalog-batch API', () => {
  const uid = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
    mockEnsureAdminAvailable.mockReturnValue(true);
    mockVerifyUserRequest.mockResolvedValue({ ok: true, uid });
    mockGenerateAndPersistToolReports.mockResolvedValue({
      readySlugs: ['hellenistic', 'esotericAstrology'],
      failedSlugs: [],
      toolReports: {},
    });
  });

  async function callBatch(): Promise<Response> {
    const req = new NextRequest('http://localhost:3000/api/profile/generate-catalog-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
    });
    return POST(req) as Promise<Response>;
  }

  it('returns 401 when auth fails', async () => {
    mockVerifyUserRequest.mockResolvedValue({ ok: false, reason: 'missing_token' });
    const res = await callBatch();
    expect(res.status).toBe(401);
  });

  it('returns 409 when profile is not generated', async () => {
    mockGetDocument.mockImplementation((collection: string) => {
      if (collection === 'users') return Promise.resolve({ uid, mysticalProfileGenerated: false });
      return Promise.resolve({});
    });
    const res = await callBatch();
    expect(res.status).toBe(409);
    expect(mockGenerateAndPersistToolReports).not.toHaveBeenCalled();
  });

  it('returns allReportsReady without generating when the catalog is complete', async () => {
    mockGetDocument.mockImplementation((collection: string) => {
      if (collection === 'users') return Promise.resolve({ uid, mysticalProfileGenerated: true });
      if (collection === 'comprehensiveMysticalProfiles') return Promise.resolve(allToolsDisplayableProfile());
      return Promise.resolve({});
    });
    const res = await callBatch();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.allReportsReady).toBe(true);
    expect(data.pendingToolSlugs).toEqual([]);
    expect(data.totalTools).toBe(ALL_TOOL_SLUGS.length);
    expect(mockGenerateAndPersistToolReports).not.toHaveBeenCalled();
  });

  it('generates the next two unfinished tools', async () => {
    mockGetDocument.mockImplementation((collection: string) => {
      if (collection === 'users') return Promise.resolve({ uid, mysticalProfileGenerated: true });
      if (collection === 'comprehensiveMysticalProfiles') {
        return Promise.resolve({
          vedic: displayableReportForSlug('vedic'),
          western: displayableReportForSlug('western'),
        });
      }
      return Promise.resolve({});
    });
    const res = await callBatch();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(mockGenerateAndPersistToolReports).toHaveBeenCalledWith(
      expect.objectContaining({
        uid,
        toolSlugs: ['hellenistic', 'esotericAstrology'],
      }),
    );
    expect(data.generatedSlugs).toEqual(['hellenistic', 'esotericAstrology']);
    expect(data.totalTools).toBe(ALL_TOOL_SLUGS.length);
    expect(data.allReportsReady).toBe(false);
  });

  it('skips exhausted failed slugs and generates the next runnable tools', async () => {
    mockGetDocument.mockImplementation((collection: string) => {
      if (collection === 'users') return Promise.resolve({ uid, mysticalProfileGenerated: true });
      if (collection === 'comprehensiveMysticalProfiles') {
        return Promise.resolve({
          vedic: displayableReportForSlug('vedic'),
          western: displayableReportForSlug('western'),
          toolStatus: {
            hellenistic: { state: 'failed', attempts: 3 },
          },
        });
      }
      return Promise.resolve({});
    });
    const res = await callBatch();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(mockGenerateAndPersistToolReports).toHaveBeenCalledWith(
      expect.objectContaining({
        toolSlugs: ['esotericAstrology', 'kabbalisticAstrology'],
      }),
    );
    expect(data.generatedSlugs).toEqual(['esotericAstrology', 'kabbalisticAstrology']);
  });
});
