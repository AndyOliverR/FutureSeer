/**
 * Vedic career/relationships routes must not be unauthenticated paid proxies
 * (Groq via generateVedicFocusedReport) or allow Admin cache / profile
 * IDOR via body userId.
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyIdToken = jest.fn();
const mockGetVedicReportDoc = jest.fn();
const mockGenerateVedicFocusedReport = jest.fn();

jest.mock('@/lib/firebase-admin', () => ({
  getAuth: () => ({ verifyIdToken: mockVerifyIdToken }),
}));

jest.mock('@/lib/vedic/vedicReportFirestore', () => {
  const actual = jest.requireActual('@/lib/vedic/vedicReportFirestore') as Record<string, unknown>;
  return {
    ...actual,
    getVedicReportDoc: (...args: unknown[]) => mockGetVedicReportDoc(...args),
  };
});

jest.mock('@/lib/vedic/generateVedicFocusedReport', () => ({
  generateVedicFocusedReport: (...args: unknown[]) => mockGenerateVedicFocusedReport(...args),
}));

jest.mock('@/lib/rateLimitFirestore', () => ({
  checkRateLimitWithOptionalFirestore: async (
    limiter: { check: (identifier: string) => { allowed: boolean; remaining: number; resetTime: number } },
    _logicalKey: string,
    identifier: string,
  ) => limiter.check(identifier),
}));

import { POST as postCareer } from '@/app/api/vedic/career/route';
import { POST as postRelationships } from '@/app/api/vedic/relationships/route';

const birthProfile = {
  birthDate: '1990-01-15',
  birthTime: '14:30:00',
  birthPlace: 'Mumbai',
};

function makeCareerBody(overrides: Record<string, unknown> = {}) {
  return {
    userId: 'user-1',
    userProfile: birthProfile,
    ...overrides,
  };
}

function makeRelationshipBody(overrides: Record<string, unknown> = {}) {
  return {
    userId: 'user-1',
    userProfile: birthProfile,
    ...overrides,
  };
}

describe('POST /api/vedic/career and /api/vedic/relationships auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetVedicReportDoc.mockResolvedValue({ exists: () => false, data: () => null });
    mockGenerateVedicFocusedReport.mockResolvedValue({
      analysis: { careerProfile: 'generated' },
      source: 'llm',
      cached: false,
    });
  });

  it('rejects missing Authorization on career without Admin read or Groq', async () => {
    const req = new NextRequest('http://localhost/api/vedic/career', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(makeCareerBody({ userId: 'victim' })),
    });

    const res = await postCareer(req);
    expect(res.status).toBe(401);
    expect(mockVerifyIdToken).not.toHaveBeenCalled();
    expect(mockGetVedicReportDoc).not.toHaveBeenCalled();
    expect(mockGenerateVedicFocusedReport).not.toHaveBeenCalled();
  });

  it('rejects invalid token on career without Admin read or Groq', async () => {
    mockVerifyIdToken.mockRejectedValueOnce(new Error('bad token'));
    const req = new NextRequest('http://localhost/api/vedic/career', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer bad',
      },
      body: JSON.stringify(makeCareerBody({ userId: 'victim' })),
    });

    const res = await postCareer(req);
    expect(res.status).toBe(401);
    expect(mockGetVedicReportDoc).not.toHaveBeenCalled();
    expect(mockGenerateVedicFocusedReport).not.toHaveBeenCalled();
  });

  it('rejects career userId mismatch (cache IDOR) without Admin read or Groq', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'attacker', email: 'a@b.c' });
    const req = new NextRequest('http://localhost/api/vedic/career', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer good',
      },
      body: JSON.stringify(makeCareerBody({ userId: 'victim' })),
    });

    const res = await postCareer(req);
    expect(res.status).toBe(403);
    expect(mockGetVedicReportDoc).not.toHaveBeenCalled();
    expect(mockGenerateVedicFocusedReport).not.toHaveBeenCalled();
  });

  it('allows owned career userId and returns inline analysis without Groq', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'user-1', email: 'u@b.c' });
    const req = new NextRequest('http://localhost/api/vedic/career', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer good',
      },
      body: JSON.stringify(
        makeCareerBody({
          vedicChartData: { careerAnalysis: { careerProfile: 'owned career' } },
        }),
      ),
    });

    const res = await postCareer(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.careerAnalysis.careerProfile).toBe('owned career');
    expect(mockGetVedicReportDoc).not.toHaveBeenCalled();
    expect(mockGenerateVedicFocusedReport).not.toHaveBeenCalled();
  });

  it('loads only the owned user profile document on career cache miss', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'user-1', email: 'u@b.c' });
    mockGetVedicReportDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ careerAnalysis: { careerProfile: 'persisted career' } }),
    });

    const req = new NextRequest('http://localhost/api/vedic/career', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer good',
      },
      body: JSON.stringify(makeCareerBody()),
    });

    const res = await postCareer(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.careerAnalysis.careerProfile).toBe('persisted career');
    expect(mockGetVedicReportDoc).toHaveBeenCalledWith(['users'], 'user-1');
    expect(mockGenerateVedicFocusedReport).not.toHaveBeenCalled();
  });

  it('rejects missing Authorization on relationships without Admin read or Groq', async () => {
    const req = new NextRequest('http://localhost/api/vedic/relationships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(makeRelationshipBody({ userId: 'victim' })),
    });

    const res = await postRelationships(req);
    expect(res.status).toBe(401);
    expect(mockGetVedicReportDoc).not.toHaveBeenCalled();
    expect(mockGenerateVedicFocusedReport).not.toHaveBeenCalled();
  });

  it('rejects relationships userId mismatch without Admin read or Groq', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'attacker', email: 'a@b.c' });
    const req = new NextRequest('http://localhost/api/vedic/relationships', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer good',
      },
      body: JSON.stringify(makeRelationshipBody({ userId: 'victim' })),
    });

    const res = await postRelationships(req);
    expect(res.status).toBe(403);
    expect(mockGetVedicReportDoc).not.toHaveBeenCalled();
    expect(mockGenerateVedicFocusedReport).not.toHaveBeenCalled();
  });

  it('allows owned relationships userId and returns inline analysis without Groq', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'user-1', email: 'u@b.c' });
    const req = new NextRequest('http://localhost/api/vedic/relationships', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer good',
      },
      body: JSON.stringify(
        makeRelationshipBody({
          vedicChartData: { relationshipAnalysis: { relationshipProfile: 'owned relationship' } },
        }),
      ),
    });

    const res = await postRelationships(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.relationshipAnalysis.relationshipProfile).toBe('owned relationship');
    expect(mockGenerateVedicFocusedReport).not.toHaveBeenCalled();
  });
});
