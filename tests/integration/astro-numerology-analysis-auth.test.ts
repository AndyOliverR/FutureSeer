/**
 * Astro-numerology analysis must not be an unauthenticated paid proxy (Groq)
 * or an Admin-cache IDOR on users/{userId}/astroNumerologyReports.
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyIdToken = jest.fn();
const mockGenerateAstroNumerologyAnalysis = jest.fn();

jest.mock('@/lib/firebase-admin', () => ({
  getAuth: () => ({ verifyIdToken: mockVerifyIdToken }),
}));

jest.mock('@/lib/astroNumerology/generateAstroNumerologyAnalysis', () => ({
  generateAstroNumerologyAnalysis: (...args: unknown[]) => mockGenerateAstroNumerologyAnalysis(...args),
}));

jest.mock('@/lib/rateLimitFirestore', () => ({
  checkRateLimitWithOptionalFirestore: async (
    limiter: { check: (identifier: string) => { allowed: boolean; remaining: number; resetTime: number } },
    _logicalKey: string,
    identifier: string,
  ) => limiter.check(identifier),
}));

import { POST } from '@/app/api/astro-numerology/analysis/route';

describe('POST /api/astro-numerology/analysis auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateAstroNumerologyAnalysis.mockResolvedValue({
      ok: true,
      data: {
        sunSign: 'Aries',
        lifePathNumber: 7,
        nameNumber: 3,
        comprehensiveAnalysis: { personalitySynthesis: 'Owned report' },
        timestamp: Date.now(),
      },
    });
  });

  it('rejects missing Authorization without calling Groq', async () => {
    const req = new NextRequest('http://localhost/api/astro-numerology/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'victim-uid',
        birthDate: '1990-01-15',
        fullName: 'Victim',
        sunSign: 'Aries',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockGenerateAstroNumerologyAnalysis).not.toHaveBeenCalled();
    expect(mockVerifyIdToken).not.toHaveBeenCalled();
  });

  it('rejects invalid token without calling Groq', async () => {
    mockVerifyIdToken.mockRejectedValueOnce(new Error('bad token'));
    const req = new NextRequest('http://localhost/api/astro-numerology/analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer bad',
      },
      body: JSON.stringify({
        userId: 'victim-uid',
        birthDate: '1990-01-15',
        fullName: 'Victim',
        sunSign: 'Aries',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockGenerateAstroNumerologyAnalysis).not.toHaveBeenCalled();
  });

  it('rejects mismatched userId without reading victim cache', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'attacker', email: 'a@b.c' });
    const req = new NextRequest('http://localhost/api/astro-numerology/analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer good',
      },
      body: JSON.stringify({
        userId: 'victim-uid',
        birthDate: '1990-01-15',
        fullName: 'Victim',
        sunSign: 'Aries',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    expect(mockGenerateAstroNumerologyAnalysis).not.toHaveBeenCalled();
  });

  it('allows owned auth and generates with the authenticated uid', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'user-1', email: 'a@b.c' });
    const req = new NextRequest('http://localhost/api/astro-numerology/analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer good',
      },
      body: JSON.stringify({
        userId: 'user-1',
        birthDate: '1990-01-15',
        fullName: 'Seeker',
        sunSign: 'Aries',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(mockGenerateAstroNumerologyAnalysis).toHaveBeenCalledWith({
      userId: 'user-1',
      birthDate: '1990-01-15',
      fullName: 'Seeker',
      sunSign: 'Aries',
      useCache: true,
    });
  });
});
