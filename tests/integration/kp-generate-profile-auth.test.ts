/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyUserRequest = jest.fn();
const mockGetUserProfile = jest.fn();
const mockAnalyzeChart = jest.fn();

jest.mock('@/lib/userApiAuth', () => ({
  verifyUserRequest: (...args: unknown[]) => mockVerifyUserRequest(...args),
  resolveOwnedUserId: jest.requireActual('@/lib/security/ownership').resolveOwnedUserId,
}));

jest.mock('@/lib/firebase', () => ({
  getUserProfile: (...args: unknown[]) => mockGetUserProfile(...args),
}));

jest.mock('@/lib/kpAstrologyIntelligence', () => ({
  kpAstrologyIntelligence: {
    analyzeChart: (...args: unknown[]) => mockAnalyzeChart(...args),
  },
}));

jest.mock('@/services/geocoding', () => ({
  geocodePlace: jest.fn(async () => ({ latitude: 19.076, longitude: 72.8777 })),
}));

jest.mock('@/lib/devLogger', () => ({
  devLog: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

describe('/api/tools/kp-astrology/generate-real profile auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAnalyzeChart.mockResolvedValue({
      cusps: [{ house: 1 }],
      timingAnalysis: { summary: 'ok' },
    });
  });

  async function post(body: Record<string, unknown>, authHeader?: string) {
    const { POST } = await import('@/app/api/tools/kp-astrology/generate-real/route');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) headers.Authorization = authHeader;
    const req = new NextRequest('http://localhost:3000/api/tools/kp-astrology/generate-real', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    return POST(req) as Promise<Response>;
  }

  it('blocks unauthenticated profile fetch by userId alone', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: false, reason: 'missing_token' });

    const res = await post({ userId: 'victim' });

    expect(res.status).toBe(401);
    expect(mockGetUserProfile).not.toHaveBeenCalled();
  });

  it('allows Stage B when complete birthData is provided without auth', async () => {
    const res = await post({
      userId: 'stage-b-user',
      birthData: {
        birthDate: '1990-01-15',
        birthTime: '10:30:00',
        birthPlace: 'Mumbai',
        latitude: 19.076,
        longitude: 72.8777,
      },
    });

    expect(res.status).toBe(200);
    expect(mockVerifyUserRequest).not.toHaveBeenCalled();
    expect(mockGetUserProfile).not.toHaveBeenCalled();
    expect(mockAnalyzeChart).toHaveBeenCalled();
  });
});
