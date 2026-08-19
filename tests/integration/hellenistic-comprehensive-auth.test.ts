/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyUserRequest = jest.fn();
const mockGetIntelligentHellenisticAstrologyData = jest.fn();

jest.mock('@/lib/userApiAuth', () => ({
  verifyUserRequest: (...args: unknown[]) => mockVerifyUserRequest(...args),
  resolveOwnedUserId: jest.requireActual('@/lib/security/ownership').resolveOwnedUserId,
}));

jest.mock('@/lib/hellenisticAstrologyIntelligence', () => ({
  getIntelligentHellenisticAstrologyData: (...args: unknown[]) =>
    mockGetIntelligentHellenisticAstrologyData(...args),
}));

jest.mock('@/lib/devLogger', () => ({
  devLog: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
  devWarn: jest.fn(),
}));

const SECRET_OVERVIEW = 'SECRET_VICTIM_HELLENISTIC_OVERVIEW';

const FAKE_READING = {
  planets: [{ name: 'Sun' }],
  houses: [{ number: 1, sign: 'Aries', planets: [] }],
  interpretations: { personality: { overview: SECRET_OVERVIEW } },
};

describe('hellenistic comprehensive cache auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetIntelligentHellenisticAstrologyData.mockResolvedValue(FAKE_READING);
  });

  async function postHellenistic(userId: string, withAuthHeader = true) {
    const { POST } = await import('@/app/api/hellenistic/comprehensive/route');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (withAuthHeader) headers.Authorization = 'Bearer test-token';
    const req = new NextRequest('http://localhost:3000/api/hellenistic/comprehensive', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId,
        userProfile: {
          birthDate: '1990-01-01',
          birthTime: '12:00:00',
          birthPlace: 'Athens',
          birthLatitude: 37.98,
          birthLongitude: 23.72,
        },
      }),
    });
    return POST(req);
  }

  it('does not generate for another user when token uid differs', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: true, uid: 'attacker' });

    const res = await postHellenistic('victim');
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(JSON.stringify(body)).not.toContain(SECRET_OVERVIEW);
    expect(mockGetIntelligentHellenisticAstrologyData).not.toHaveBeenCalled();
  });

  it('skips Firestore cache without auth (Stage B stateless path)', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: false, reason: 'missing_token' });

    const res = await postHellenistic('victim', false);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockGetIntelligentHellenisticAstrologyData).toHaveBeenCalledTimes(1);
    const opts = mockGetIntelligentHellenisticAstrologyData.mock.calls[0][6] as { useCache?: boolean };
    expect(opts).toEqual({ useCache: false });
  });

  it('allows owned cache reads and writes', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: true, uid: 'victim' });

    const res = await postHellenistic('victim');
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(JSON.stringify(body)).toContain(SECRET_OVERVIEW);
    expect(mockGetIntelligentHellenisticAstrologyData).toHaveBeenCalledTimes(1);
    const opts = mockGetIntelligentHellenisticAstrologyData.mock.calls[0][6] as { useCache?: boolean };
    expect(opts).toEqual({ useCache: true });
    expect(mockGetIntelligentHellenisticAstrologyData.mock.calls[0][0]).toBe('victim');
  });

  it('rejects invalid tokens with 401 and never touches cache', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: false, reason: 'invalid_token' });

    const res = await postHellenistic('victim');
    expect(res.status).toBe(401);
    expect(mockGetIntelligentHellenisticAstrologyData).not.toHaveBeenCalled();
  });
});
