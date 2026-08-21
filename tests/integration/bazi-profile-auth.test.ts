/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyUserRequest = jest.fn();
const mockGetUserProfile = jest.fn();
const mockGetBaziReading = jest.fn();

jest.mock('@/lib/userApiAuth', () => ({
  verifyUserRequest: (...args: unknown[]) => mockVerifyUserRequest(...args),
  resolveOwnedUserId: jest.requireActual('@/lib/security/ownership').resolveOwnedUserId,
}));

jest.mock('@/lib/firebase', () => ({
  getUserProfile: (...args: unknown[]) => mockGetUserProfile(...args),
}));

jest.mock('@/lib/baziIntelligence', () => ({
  baziIntelligence: {
    getBaziReading: (...args: unknown[]) => mockGetBaziReading(...args),
  },
}));

jest.mock('@/lib/devLogger', () => ({
  devLog: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

describe('/api/tools/bazi/analysis profile auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBaziReading.mockResolvedValue({
      pillars: {},
      metadata: { lastUpdated: new Date('2026-08-06T00:00:00Z') },
    });
  });

  async function post(body: Record<string, unknown>, authHeader?: string) {
    const { POST } = await import('@/app/api/tools/bazi/analysis/route');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) headers.Authorization = authHeader;
    const req = new NextRequest('http://localhost:3000/api/tools/bazi/analysis', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    return POST(req) as Promise<Response>;
  }

  async function get(userId: string, authHeader?: string) {
    const { GET } = await import('@/app/api/tools/bazi/analysis/route');
    const headers: Record<string, string> = {};
    if (authHeader) headers.Authorization = authHeader;
    const req = new NextRequest(
      `http://localhost:3000/api/tools/bazi/analysis?userId=${encodeURIComponent(userId)}`,
      { method: 'GET', headers },
    );
    return GET(req) as Promise<Response>;
  }

  it('does not load Firestore profile without auth when only userId is sent', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: false, reason: 'missing_token' });

    const res = await post({ userId: 'victim' });

    expect(res.status).toBe(401);
    expect(mockGetUserProfile).not.toHaveBeenCalled();
    expect(mockGetBaziReading).not.toHaveBeenCalled();
  });

  it('still allows Stage B when userProfile is provided without a token', async () => {
    const res = await post({
      userId: 'stage-b-user',
      userProfile: {
        birthDate: '1990-01-15',
        birthTime: '10:30:00',
        birthPlace: 'Mumbai',
      },
    });

    expect(res.status).toBe(200);
    expect(mockVerifyUserRequest).not.toHaveBeenCalled();
    expect(mockGetUserProfile).not.toHaveBeenCalled();
    expect(mockGetBaziReading).toHaveBeenCalled();
  });

  it('rejects unauthenticated GET profile loads', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: false, reason: 'missing_token' });

    const res = await get('victim');

    expect(res.status).toBe(401);
    expect(mockGetUserProfile).not.toHaveBeenCalled();
  });
});
