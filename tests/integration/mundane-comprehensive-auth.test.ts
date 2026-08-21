/**
 * Auth gate for POST /api/mundane-astrology/comprehensive.
 * Unauthenticated callers must not reach Groq.
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyUserRequest = jest.fn();
const mockResolveOwnedUserId = jest.fn(
  (requested: unknown, authUid: string) =>
    typeof requested === 'string' && requested === authUid ? requested : null,
);
const mockGenerateMundaneComprehensive = jest.fn();

jest.mock('@/lib/userApiAuth', () => ({
  verifyUserRequest: (...args: unknown[]) => mockVerifyUserRequest(...args),
  resolveOwnedUserId: (...args: unknown[]) => mockResolveOwnedUserId(...args),
}));

jest.mock('@/lib/mundane/generateMundaneComprehensive', () => ({
  generateMundaneComprehensive: (...args: unknown[]) => mockGenerateMundaneComprehensive(...args),
}));

jest.mock('@/lib/rateLimit', () => ({
  rateLimiters: { ai: {} },
  withRateLimit: (handler: unknown) => handler,
}));

jest.mock('@/lib/devLogger', () => ({
  devLog: { error: jest.fn(), warn: jest.fn(), debug: jest.fn(), info: jest.fn() },
}));

function postMundane(body: Record<string, unknown>, headers?: Record<string, string>) {
  return import('@/app/api/mundane-astrology/comprehensive/route').then(({ POST }) => {
    const req = new NextRequest('http://localhost:3000/api/mundane-astrology/comprehensive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });
    return POST(req) as Promise<Response>;
  });
}

describe('POST /api/mundane-astrology/comprehensive auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateMundaneComprehensive.mockResolvedValue({
      ok: true,
      comprehensiveAnalysis: {
        countryName: 'India',
        sections: { executiveOverview: 'ok' },
        riskScores: { bands: { economic: 'moderate' } },
        riskBands: { economic: 'moderate' },
      },
    });
  });

  it('returns 401 and does not call Groq when Authorization is missing', async () => {
    mockVerifyUserRequest.mockResolvedValue({ ok: false, reason: 'missing_token' });

    const res = await postMundane({
      userId: 'anyone',
      userProfile: { birthDate: '1990-01-15', birthPlace: 'Mumbai' },
    });
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Authentication required');
    expect(mockGenerateMundaneComprehensive).not.toHaveBeenCalled();
  });

  it('returns 401 and does not call Groq when the token is invalid', async () => {
    mockVerifyUserRequest.mockResolvedValue({ ok: false, reason: 'invalid_token' });

    const res = await postMundane(
      { userProfile: { birthPlace: 'London' } },
      { Authorization: 'Bearer bad-token' },
    );
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Authentication required');
    expect(mockGenerateMundaneComprehensive).not.toHaveBeenCalled();
  });

  it('returns 403 when body userId does not match the authenticated uid', async () => {
    mockVerifyUserRequest.mockResolvedValue({ ok: true, uid: 'user-1' });

    const res = await postMundane(
      {
        userId: 'victim-uid',
        userProfile: { birthPlace: 'Athens' },
      },
      { Authorization: 'Bearer test-token' },
    );
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe('Forbidden');
    expect(mockGenerateMundaneComprehensive).not.toHaveBeenCalled();
  });

  it('generates for an authenticated owner', async () => {
    mockVerifyUserRequest.mockResolvedValue({ ok: true, uid: 'user-1' });

    const res = await postMundane(
      {
        userId: 'user-1',
        userProfile: { birthDate: '1990-01-15', birthPlace: 'Mumbai' },
      },
      { Authorization: 'Bearer test-token' },
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.comprehensiveAnalysis.countryName).toBe('India');
    expect(mockGenerateMundaneComprehensive).toHaveBeenCalledTimes(1);
  });
});
