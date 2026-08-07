/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyUserRequest = jest.fn();
const mockGetUserProfile = jest.fn();
const mockGetRecommendations = jest.fn();

jest.mock('@/lib/userApiAuth', () => ({
  verifyUserRequest: (...args: unknown[]) => mockVerifyUserRequest(...args),
  resolveOwnedUserId: jest.requireActual('@/lib/security/ownership').resolveOwnedUserId,
}));

jest.mock('@/lib/firebase', () => ({
  getUserProfile: (...args: unknown[]) => mockGetUserProfile(...args),
  isProfileComplete: () => true,
}));

jest.mock('@/lib/dailyDecisionsIntelligence', () => ({
  dailyDecisionsIntelligence: {
    getRecommendations: (...args: unknown[]) => mockGetRecommendations(...args),
  },
}));

jest.mock('@/services/geocoding', () => ({
  geocodePlace: jest.fn(async () => ({ latitude: 19.076, longitude: 72.8777 })),
}));

jest.mock('@/lib/devLogger', () => ({
  devLog: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

describe('/api/tools/daily-decisions/analysis profile auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRecommendations.mockResolvedValue({
      date: '2026-08-05',
      recommendations: [],
      rahuKaal: { formatted: 'x' },
      gulikaKaal: { formatted: 'y' },
    });
  });

  async function post(body: Record<string, unknown>, authHeader?: string) {
    const { POST } = await import('@/app/api/tools/daily-decisions/analysis/route');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) headers.Authorization = authHeader;
    const req = new NextRequest('http://localhost:3000/api/tools/daily-decisions/analysis', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    return POST(req) as Promise<Response>;
  }

  it('does not load Firestore profile without auth when only userId is sent', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: false, reason: 'missing_token' });

    const res = await post({ userId: 'victim' });

    expect(res.status).toBe(401);
    expect(mockGetUserProfile).not.toHaveBeenCalled();
    expect(mockGetRecommendations).not.toHaveBeenCalled();
  });

  it('does not load another user profile when token uid differs', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: true, uid: 'attacker' });

    const res = await post({ userId: 'victim' }, 'Bearer token');

    expect(res.status).toBe(403);
    expect(mockGetUserProfile).not.toHaveBeenCalled();
  });

  it('still allows Stage B when userProfile is provided without a token', async () => {
    const res = await post({
      userId: 'stage-b-user',
      userProfile: {
        birthDate: '1990-01-15',
        birthTime: '10:30:00',
        birthPlace: 'Mumbai',
      },
      date: '2026-08-05',
    });

    expect(res.status).toBe(200);
    expect(mockVerifyUserRequest).not.toHaveBeenCalled();
    expect(mockGetUserProfile).not.toHaveBeenCalled();
    expect(mockGetRecommendations).toHaveBeenCalled();
  });

  it('loads owned profile when authenticated owner omits body profile', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: true, uid: 'owner' });
    mockGetUserProfile.mockResolvedValueOnce({
      birthDate: '1990-01-15',
      birthTime: '10:30:00',
      birthPlace: 'Mumbai',
    });

    const res = await post({ userId: 'owner' }, 'Bearer token');

    expect(res.status).toBe(200);
    expect(mockGetUserProfile).toHaveBeenCalledWith('owner');
    expect(mockGetRecommendations).toHaveBeenCalled();
  });
});
