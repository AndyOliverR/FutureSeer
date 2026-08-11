/**
 * Vedic interpretation routes must not be unauthenticated paid proxies
 * (Groq via VedicInterpretationEnhancer) or allow Admin cache / profile
 * IDOR via body userId.
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyIdToken = jest.fn();
const mockGenerateEnhancedOverview = jest.fn();
const mockGenerateDivisionalInsight = jest.fn();
const mockGetUserProfile = jest.fn();

jest.mock('@/lib/firebase-admin', () => ({
  getAuth: () => ({ verifyIdToken: mockVerifyIdToken }),
}));

jest.mock('@/lib/vedicInterpretationEnhancer', () => ({
  VedicInterpretationEnhancer: jest.fn().mockImplementation(() => ({
    generateEnhancedOverview: (...args: unknown[]) => mockGenerateEnhancedOverview(...args),
    generateDivisionalInsight: (...args: unknown[]) => mockGenerateDivisionalInsight(...args),
  })),
}));

jest.mock('@/lib/firebase', () => ({
  getUserProfile: (...args: unknown[]) => mockGetUserProfile(...args),
}));

jest.mock('@/lib/rateLimitFirestore', () => ({
  checkRateLimitWithOptionalFirestore: async (
    limiter: { check: (identifier: string) => { allowed: boolean; remaining: number; resetTime: number } },
    _logicalKey: string,
    identifier: string,
  ) => limiter.check(identifier),
}));

import { POST as postOverview } from '@/app/api/vedic-interpretations/overview/route';
import { POST as postDivisional } from '@/app/api/vedic-interpretations/divisional/route';
import { POST as postPlanets } from '@/app/api/vedic-interpretations/planets/route';
import { POST as postHouses } from '@/app/api/vedic-interpretations/houses/route';
import { POST as postDasha } from '@/app/api/vedic-interpretations/dasha/route';
import { POST as postTransits } from '@/app/api/vedic-interpretations/transits/route';
import { POST as postRemedies } from '@/app/api/vedic-interpretations/remedies/route';
import { POST as postPanchanga } from '@/app/api/vedic-interpretations/panchanga/route';

const sampleChart = {
  ascendant: { degree: 15.2, sign: 'Aries' },
  planets: { Moon: { sign: 'Taurus', house: 2 } },
};

function makeOverviewBody(overrides: Record<string, unknown> = {}) {
  return {
    userId: 'user-1',
    chartData: sampleChart,
    ...overrides,
  };
}

describe('POST /api/vedic-interpretations/* auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateEnhancedOverview.mockResolvedValue('Overview insight.');
    mockGenerateDivisionalInsight.mockResolvedValue('Divisional insight.');
    mockGetUserProfile.mockResolvedValue({ displayName: 'Seeker' });
  });

  it('rejects missing Authorization on overview without calling Groq enhancer', async () => {
    const req = new NextRequest('http://localhost/api/vedic-interpretations/overview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(makeOverviewBody()),
    });

    const res = await postOverview(req);
    expect(res.status).toBe(401);
    expect(mockGenerateEnhancedOverview).not.toHaveBeenCalled();
    expect(mockVerifyIdToken).not.toHaveBeenCalled();
  });

  it('rejects invalid token on overview without calling enhancer', async () => {
    mockVerifyIdToken.mockRejectedValueOnce(new Error('bad token'));
    const req = new NextRequest('http://localhost/api/vedic-interpretations/overview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer bad',
      },
      body: JSON.stringify(makeOverviewBody()),
    });

    const res = await postOverview(req);
    expect(res.status).toBe(401);
    expect(mockGenerateEnhancedOverview).not.toHaveBeenCalled();
  });

  it('rejects userId mismatch (cache IDOR) without calling enhancer', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'attacker', email: 'a@b.c' });
    const req = new NextRequest('http://localhost/api/vedic-interpretations/overview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer good',
      },
      body: JSON.stringify(makeOverviewBody({ userId: 'victim' })),
    });

    const res = await postOverview(req);
    expect(res.status).toBe(403);
    expect(mockGenerateEnhancedOverview).not.toHaveBeenCalled();
  });

  it('allows owned userId and generates overview', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'user-1', email: 'u@b.c' });
    const req = new NextRequest('http://localhost/api/vedic-interpretations/overview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer good',
      },
      body: JSON.stringify(makeOverviewBody()),
    });

    const res = await postOverview(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.interpretation).toBe('Overview insight.');
    expect(mockGenerateEnhancedOverview).toHaveBeenCalledWith(sampleChart, 'user-1');
  });

  it('rejects divisional userId mismatch without profile or Groq', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'attacker', email: 'a@b.c' });
    const req = new NextRequest('http://localhost/api/vedic-interpretations/divisional', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer good',
      },
      body: JSON.stringify({
        userId: 'victim',
        chartType: 'D9',
        chartData: sampleChart,
      }),
    });

    const res = await postDivisional(req);
    expect(res.status).toBe(403);
    expect(mockGetUserProfile).not.toHaveBeenCalled();
    expect(mockGenerateDivisionalInsight).not.toHaveBeenCalled();
  });

  it('allows owned divisional request and loads only owned profile', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'user-1', email: 'u@b.c' });
    const req = new NextRequest('http://localhost/api/vedic-interpretations/divisional', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer good',
      },
      body: JSON.stringify({
        userId: 'user-1',
        chartType: 'D9',
        chartData: sampleChart,
      }),
    });

    const res = await postDivisional(req);
    expect(res.status).toBe(200);
    expect(mockGetUserProfile).toHaveBeenCalledWith('user-1');
    expect(mockGenerateDivisionalInsight).toHaveBeenCalled();
  });

  it.each([
    ['planets', postPlanets, { userId: 'user-1', planet: 'Moon', chartData: sampleChart }],
    ['houses', postHouses, { userId: 'user-1', houseNumber: 1, chartData: sampleChart }],
    ['dasha', postDasha, { userId: 'user-1', dashaData: { maha: 'Venus' }, chartData: sampleChart }],
    ['transits', postTransits, { userId: 'user-1', transitData: { planet: 'Jupiter' }, chartData: sampleChart }],
    ['remedies', postRemedies, { userId: 'user-1', planet: 'Saturn', remedy: 'mantra', chartData: sampleChart }],
    ['panchanga', postPanchanga, { userId: 'user-1', panchangaData: { tithi: 'Shukla' }, chartData: sampleChart }],
  ])('rejects missing Authorization on %s without enhancer work', async (_name, post, body) => {
    const req = new NextRequest('http://localhost/api/vedic-interpretations/x', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const res = await post(req);
    expect(res.status).toBe(401);
    expect(mockVerifyIdToken).not.toHaveBeenCalled();
  });
});
