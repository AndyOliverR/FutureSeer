/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyUserRequest = jest.fn();
const mockGetUserProfile = jest.fn();
const mockCalculateChart = jest.fn();
const mockGenerateReport = jest.fn();

jest.mock('@/lib/userApiAuth', () => ({
  verifyUserRequest: (...args: unknown[]) => mockVerifyUserRequest(...args),
  resolveOwnedUserId: jest.requireActual('@/lib/security/ownership').resolveOwnedUserId,
}));

jest.mock('@/lib/firebase', () => ({
  getUserProfile: (...args: unknown[]) => mockGetUserProfile(...args),
}));

jest.mock('@/lib/humanDesign/humanDesignCalculator', () => ({
  calculateHumanDesignChart: (...args: unknown[]) => mockCalculateChart(...args),
}));

jest.mock('@/lib/humanDesign/humanDesignReportGenerator', () => ({
  generateHumanDesignReport: (...args: unknown[]) => mockGenerateReport(...args),
}));

jest.mock('@/services/geocoding', () => ({
  geocodePlace: jest.fn(async () => ({ latitude: 19.076, longitude: 72.8777 })),
}));

jest.mock('@/lib/devLogger', () => ({
  devLog: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

describe('/api/tools/human-design/generate-report profile auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCalculateChart.mockResolvedValue({
      type: { name: 'Generator' },
      strategy: 'Wait',
      authority: { name: 'Sacral' },
      profile: { name: '1/3' },
      centers: { defined: [] },
      channels: [],
    });
    mockGenerateReport.mockResolvedValue({ overview: 'ok' });
  });

  async function post(body: Record<string, unknown>, authHeader?: string) {
    const { POST } = await import('@/app/api/tools/human-design/generate-report/route');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) headers.Authorization = authHeader;
    const req = new NextRequest('http://localhost:3000/api/tools/human-design/generate-report', {
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
    expect(mockCalculateChart).not.toHaveBeenCalled();
  });

  it('does not load another user profile when token uid differs', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: true, uid: 'attacker' });

    const res = await post({ userId: 'victim' }, 'Bearer token');

    expect(res.status).toBe(403);
    expect(mockGetUserProfile).not.toHaveBeenCalled();
  });

  it('still allows Stage B when birthData is provided without a token', async () => {
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
    expect(mockCalculateChart).toHaveBeenCalled();
    const json = await res.json();
    expect(json.data.birthData.birthDate).toBe('1990-01-15');
  });

  it('loads owned profile when authenticated owner omits body birth data', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: true, uid: 'owner' });
    mockGetUserProfile.mockResolvedValueOnce({
      birthDate: '1990-01-15',
      birthTime: '10:30:00',
      birthPlace: 'Mumbai',
      birthLatitude: 19.076,
      birthLongitude: 72.8777,
    });

    const res = await post({ userId: 'owner' }, 'Bearer token');

    expect(res.status).toBe(200);
    expect(mockGetUserProfile).toHaveBeenCalledWith('owner');
    expect(mockCalculateChart).toHaveBeenCalled();
  });
});
