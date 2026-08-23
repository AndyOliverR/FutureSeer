/**
 * Vedic astro-numerology analysis must not be an unauthenticated paid proxy (Groq)
 * or an Admin-cache IDOR on users/{userId}/vedicAstroNumerologyReports.
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyIdToken = jest.fn();
const mockGenerateVedicAstroNumerologyAnalysis = jest.fn();

jest.mock('@/lib/firebase-admin', () => ({
  getAuth: () => ({ verifyIdToken: mockVerifyIdToken }),
}));

jest.mock('@/lib/vedicAstroNumerology/generateVedicAstroNumerologyAnalysis', () => ({
  generateVedicAstroNumerologyAnalysis: (...args: unknown[]) =>
    mockGenerateVedicAstroNumerologyAnalysis(...args),
}));

jest.mock('@/lib/rateLimitFirestore', () => ({
  checkRateLimitWithOptionalFirestore: async (
    limiter: { check: (identifier: string) => { allowed: boolean; remaining: number; resetTime: number } },
    _logicalKey: string,
    identifier: string,
  ) => limiter.check(identifier),
}));

import { POST } from '@/app/api/vedic-astro-numerology/analysis/route';

const numerologyProfile = {
  lifePathNumber: 3,
  destinyNumber: 6,
  soulNumber: 9,
  nameNumber: 6,
  birthDayNumber: 15,
  rulingPlanet: 'Jupiter',
  planetaryInfluences: {
    'Life Path': { planet: 'Jupiter', number: 3, significance: 'expansion' },
  },
  karmicLessons: [],
  dashaConnections: [],
};

describe('POST /api/vedic-astro-numerology/analysis auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateVedicAstroNumerologyAnalysis.mockResolvedValue({
      ok: true,
      data: {
        moonSign: 'Taurus',
        lagnaSign: 'Aries',
        sunSign: 'Pisces',
        lifePathNumber: 3,
        rulingPlanet: 'Jupiter',
        comprehensiveAnalysis: { personalitySynthesis: 'Owned report' },
        timestamp: Date.now(),
      },
    });
  });

  it('rejects missing Authorization without calling Groq', async () => {
    const req = new NextRequest('http://localhost/api/vedic-astro-numerology/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'victim-uid',
        birthDate: '1990-01-15',
        fullName: 'Victim',
        moonSign: 'Taurus',
        lagnaSign: 'Aries',
        sunSign: 'Pisces',
        numerologyProfile,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockGenerateVedicAstroNumerologyAnalysis).not.toHaveBeenCalled();
    expect(mockVerifyIdToken).not.toHaveBeenCalled();
  });

  it('rejects invalid token without calling Groq', async () => {
    mockVerifyIdToken.mockRejectedValueOnce(new Error('bad token'));
    const req = new NextRequest('http://localhost/api/vedic-astro-numerology/analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer bad',
      },
      body: JSON.stringify({
        userId: 'victim-uid',
        birthDate: '1990-01-15',
        fullName: 'Victim',
        moonSign: 'Taurus',
        numerologyProfile,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockGenerateVedicAstroNumerologyAnalysis).not.toHaveBeenCalled();
  });

  it('rejects mismatched userId without reading victim cache', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'attacker', email: 'a@b.c' });
    const req = new NextRequest('http://localhost/api/vedic-astro-numerology/analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer good',
      },
      body: JSON.stringify({
        userId: 'victim-uid',
        birthDate: '1990-01-15',
        fullName: 'Victim',
        moonSign: 'Taurus',
        numerologyProfile,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    expect(mockGenerateVedicAstroNumerologyAnalysis).not.toHaveBeenCalled();
  });

  it('allows owned auth and generates with the authenticated uid', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'user-1', email: 'a@b.c' });
    const req = new NextRequest('http://localhost/api/vedic-astro-numerology/analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer good',
      },
      body: JSON.stringify({
        userId: 'user-1',
        birthDate: '1990-01-15',
        fullName: 'Seeker',
        moonSign: 'Taurus',
        lagnaSign: 'Aries',
        sunSign: 'Pisces',
        numerologyProfile,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(mockGenerateVedicAstroNumerologyAnalysis).toHaveBeenCalledWith({
      userId: 'user-1',
      birthDate: '1990-01-15',
      fullName: 'Seeker',
      moonSign: 'Taurus',
      lagnaSign: 'Aries',
      sunSign: 'Pisces',
      numerologyProfile,
      useCache: true,
    });
  });
});
