/**
 * Integration tests: POST /api/profile/ensure-tool-report
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

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
  isOnDemandToolSlug: (slug: string) => slug === 'tarot' || slug === 'vedic',
  storedReportMatchesHash: (report: unknown, hash: string) =>
    Boolean(report && typeof report === 'object' && (report as { generationIdempotencyKey?: string }).generationIdempotencyKey === hash),
  generateAndPersistToolReports: (...args: unknown[]) => mockGenerateAndPersistToolReports(...args),
}));

jest.mock('@/lib/firebase', () => ({
  calculateProfileDataHash: () => 'hash-1',
}));

import { POST } from '@/app/api/profile/ensure-tool-report/route';

describe('ensure-tool-report API', () => {
  const uid = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
    mockEnsureAdminAvailable.mockReturnValue(true);
    mockVerifyUserRequest.mockResolvedValue({ ok: true, uid });
    mockGenerateAndPersistToolReports.mockResolvedValue({
      readySlugs: ['tarot'],
      failedSlugs: [],
      toolReports: { tarot: { status: 'success', data: { cards: [{ name: 'The Fool' }] } } },
    });
  });

  async function callEnsure(body: Record<string, unknown>): Promise<Response> {
    const req = new NextRequest('http://localhost:3000/api/profile/ensure-tool-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
      body: JSON.stringify(body),
    });
    return POST(req) as Promise<Response>;
  }

  it('returns 401 when auth fails', async () => {
    mockVerifyUserRequest.mockResolvedValue({ ok: false, reason: 'missing_token' });
    const res = await callEnsure({ toolSlug: 'tarot' });
    expect(res.status).toBe(401);
  });

  it('returns 400 for unknown slug', async () => {
    const res = await callEnsure({ toolSlug: 'not-a-tool' });
    expect(res.status).toBe(400);
  });

  it('returns 409 when profile is not generated', async () => {
    mockGetDocument.mockImplementation((collection: string) => {
      if (collection === 'users') return Promise.resolve({ uid, mysticalProfileGenerated: false });
      return Promise.resolve({});
    });
    const res = await callEnsure({ toolSlug: 'tarot' });
    expect(res.status).toBe(409);
    expect(mockGenerateAndPersistToolReports).not.toHaveBeenCalled();
  });

  it('returns stored report when already ready for this hash', async () => {
    const stored = { cards: [{ name: 'The Magician' }], generationIdempotencyKey: 'hash-1' };
    mockGetDocument.mockImplementation((collection: string) => {
      if (collection === 'users') return Promise.resolve({ uid, mysticalProfileGenerated: true });
      if (collection === 'comprehensiveMysticalProfiles') return Promise.resolve({ tarot: stored });
      return Promise.resolve({});
    });
    const res = await callEnsure({ toolSlug: 'tarot' });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.alreadyReady).toBe(true);
    expect(data.report).toEqual(stored);
    expect(mockGenerateAndPersistToolReports).not.toHaveBeenCalled();
  });

  it('generates and persists when the tool is missing', async () => {
    mockGetDocument.mockImplementation((collection: string) => {
      if (collection === 'users') return Promise.resolve({ uid, mysticalProfileGenerated: true });
      if (collection === 'comprehensiveMysticalProfiles') return Promise.resolve({});
      return Promise.resolve({});
    });
    const res = await callEnsure({ toolSlug: 'tarot' });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.alreadyReady).toBe(false);
    expect(data.success).toBe(true);
    expect(mockGenerateAndPersistToolReports).toHaveBeenCalledWith(
      expect.objectContaining({ uid, toolSlugs: ['tarot'] }),
    );
  });

  it('regenerates when extraInputs are present even if a report is already stored', async () => {
    const stored = { cards: [{ name: 'The Magician' }], generationIdempotencyKey: 'hash-1' };
    mockGetDocument.mockImplementation((collection: string) => {
      if (collection === 'users') return Promise.resolve({ uid, mysticalProfileGenerated: true });
      if (collection === 'comprehensiveMysticalProfiles') return Promise.resolve({ tarot: stored });
      return Promise.resolve({});
    });
    const res = await callEnsure({
      toolSlug: 'tarot',
      extraInputs: { question: 'What is my path this year?', spreadType: 'celtic-cross' },
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.alreadyReady).toBe(false);
    expect(mockGenerateAndPersistToolReports).toHaveBeenCalledWith(
      expect.objectContaining({
        extraInputs: expect.objectContaining({ question: 'What is my path this year?' }),
      }),
    );
  });
});
