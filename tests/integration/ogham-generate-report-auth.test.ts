/**
 * Ogham generate-report must not be an unauthenticated Groq proxy
 * or allow Admin oghamReadings IDOR via body userId.
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyIdToken = jest.fn();
const mockGenerateReading = jest.fn();

jest.mock('@/lib/firebase-admin', () => ({
  getAuth: () => ({ verifyIdToken: mockVerifyIdToken }),
}));

jest.mock('@/lib/oghamIntelligence', () => ({
  oghamIntelligence: {
    generateReading: (...args: unknown[]) => mockGenerateReading(...args),
  },
}));

jest.mock('@/lib/rateLimitFirestore', () => ({
  checkRateLimitWithOptionalFirestore: async (
    limiter: { check: (identifier: string) => { allowed: boolean; remaining: number; resetTime: number } },
    _logicalKey: string,
    identifier: string,
  ) => limiter.check(identifier),
}));

import { POST } from '@/app/api/tools/ogham/generate-report/route';

const completeProfile = {
  birthDate: '1990-01-15',
  birthTime: '14:30:00',
  birthPlace: 'Dublin',
};

function makeBody(overrides: Record<string, unknown> = {}) {
  return {
    userId: 'user-1',
    userProfile: completeProfile,
    ...overrides,
  };
}

describe('POST /api/tools/ogham/generate-report auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateReading.mockResolvedValue({
      id: 'ogham_owned',
      overview: 'owned ogham report',
    });
  });

  it('rejects missing Authorization without Groq or Firestore', async () => {
    const req = new NextRequest('http://localhost/api/tools/ogham/generate-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(makeBody({ userId: 'victim' })),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockVerifyIdToken).not.toHaveBeenCalled();
    expect(mockGenerateReading).not.toHaveBeenCalled();
  });

  it('rejects invalid token without Groq or Firestore', async () => {
    mockVerifyIdToken.mockRejectedValueOnce(new Error('bad token'));
    const req = new NextRequest('http://localhost/api/tools/ogham/generate-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer bad',
      },
      body: JSON.stringify(makeBody({ userId: 'victim' })),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockGenerateReading).not.toHaveBeenCalled();
  });

  it('rejects userId mismatch (oghamReadings IDOR) without Groq', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'attacker', email: 'a@b.c' });
    const req = new NextRequest('http://localhost/api/tools/ogham/generate-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer good',
      },
      body: JSON.stringify(makeBody({ userId: 'victim' })),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    expect(mockGenerateReading).not.toHaveBeenCalled();
  });

  it('rejects missing userId without Groq', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'user-1', email: 'u@b.c' });
    const req = new NextRequest('http://localhost/api/tools/ogham/generate-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer good',
      },
      body: JSON.stringify({ userProfile: completeProfile }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    expect(mockGenerateReading).not.toHaveBeenCalled();
  });

  it('allows owned userId and generates without treating body userId as victim', async () => {
    mockVerifyIdToken.mockResolvedValueOnce({ uid: 'user-1', email: 'u@b.c' });
    const req = new NextRequest('http://localhost/api/tools/ogham/generate-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer good',
      },
      body: JSON.stringify(makeBody()),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.report.id).toBe('ogham_owned');
    expect(mockGenerateReading).toHaveBeenCalledTimes(1);
    expect(mockGenerateReading).toHaveBeenCalledWith('user-1', completeProfile);
  });
});
