/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyUserRequest = jest.fn();
const mockGetUserProfile = jest.fn();
const mockDrawCards = jest.fn();
const mockSaveReading = jest.fn();

jest.mock('@/lib/userApiAuth', () => ({
  verifyUserRequest: (...args: unknown[]) => mockVerifyUserRequest(...args),
  resolveOwnedUserId: jest.requireActual('@/lib/security/ownership').resolveOwnedUserId,
}));

jest.mock('@/lib/firebase', () => ({
  getUserProfile: (...args: unknown[]) => mockGetUserProfile(...args),
}));

jest.mock('@/lib/tarotIntelligence', () => ({
  tarotIntelligence: {
    drawCards: (...args: unknown[]) => mockDrawCards(...args),
    saveReading: (...args: unknown[]) => mockSaveReading(...args),
  },
}));

jest.mock('@/lib/devLogger', () => ({
  devLog: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

describe('/api/tools/tarot/reading ownership', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDrawCards.mockResolvedValue({
      id: 'reading-1',
      cards: [],
      timestamp: new Date('2026-08-06T00:00:00Z'),
    });
    mockSaveReading.mockResolvedValue(undefined);
  });

  async function post(body: Record<string, unknown>, authHeader?: string) {
    const { POST } = await import('@/app/api/tools/tarot/reading/route');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) headers.Authorization = authHeader;
    const req = new NextRequest('http://localhost:3000/api/tools/tarot/reading', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    return POST(req) as Promise<Response>;
  }

  it('does not load or save for another user without matching auth', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: false, reason: 'missing_token' });

    const res = await post({
      userId: 'victim',
      question: 'What should I focus on?',
      spreadType: 'three',
    });

    expect(res.status).toBe(200);
    expect(mockGetUserProfile).not.toHaveBeenCalled();
    expect(mockSaveReading).not.toHaveBeenCalled();
    expect(mockDrawCards).toHaveBeenCalled();
  });

  it('does not save when authenticated uid differs from userId', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: true, uid: 'attacker' });

    const res = await post(
      {
        userId: 'victim',
        question: 'What should I focus on?',
        spreadType: 'three',
      },
      'Bearer token',
    );

    expect(res.status).toBe(200);
    expect(mockGetUserProfile).not.toHaveBeenCalled();
    expect(mockSaveReading).not.toHaveBeenCalled();
  });

  it('saves when authenticated owner matches userId', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: true, uid: 'owner' });
    mockGetUserProfile.mockResolvedValueOnce({ displayName: 'Owner' });

    const res = await post(
      {
        userId: 'owner',
        question: 'What should I focus on?',
        spreadType: 'three',
      },
      'Bearer token',
    );

    expect(res.status).toBe(200);
    expect(mockGetUserProfile).toHaveBeenCalledWith('owner');
    expect(mockSaveReading).toHaveBeenCalledWith('owner', expect.any(Object));
  });
});
