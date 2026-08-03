/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyUserRequest = jest.fn();
const mockReadAdminComprehensiveCache = jest.fn();
const mockWriteAdminComprehensiveCache = jest.fn();
const mockResolveAiReportWithFallback = jest.fn();
const mockRunStructuredReportAI = jest.fn();
const mockCalculateWesternChart = jest.fn();

jest.mock('@/lib/userApiAuth', () => ({
  verifyUserRequest: (...args: unknown[]) => mockVerifyUserRequest(...args),
  resolveOwnedUserId: jest.requireActual('@/lib/security/ownership').resolveOwnedUserId,
}));

jest.mock('@/lib/adminComprehensiveCache', () => ({
  readAdminComprehensiveCache: (...args: unknown[]) => mockReadAdminComprehensiveCache(...args),
  writeAdminComprehensiveCache: (...args: unknown[]) => mockWriteAdminComprehensiveCache(...args),
}));

jest.mock('@/lib/aiFallbackRouter', () => ({
  resolveAiReportWithFallback: (...args: unknown[]) => mockResolveAiReportWithFallback(...args),
  mapStructuredReportRun: jest.fn(),
}));

jest.mock('@/lib/aiStructuredOutput', () => ({
  runStructuredReportAI: (...args: unknown[]) => mockRunStructuredReportAI(...args),
  callStructuredAI: jest.fn(),
}));

jest.mock('@/lib/universalOccultService', () => ({
  universalOccultService: {
    calculateWesternChart: (...args: unknown[]) => mockCalculateWesternChart(...args),
  },
}));

jest.mock('@/lib/devLogger', () => ({
  devLog: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
  devWarn: jest.fn(),
}));

const SECRET = 'SECRET_VICTIM_HERMETIC';

describe('remaining admin comprehensive cache auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    mockReadAdminComprehensiveCache.mockResolvedValue({
      sect_summary: SECRET,
    });
    mockWriteAdminComprehensiveCache.mockResolvedValue(undefined);
    mockResolveAiReportWithFallback.mockImplementation(async ({ buildDeterministic }: { buildDeterministic: () => unknown }) => ({
      data: buildDeterministic(),
      source: 'deterministic',
      degraded: true,
      parsingFailed: true,
    }));
    mockCalculateWesternChart.mockResolvedValue({
      data: {
        planets: [
          { name: 'Sun', sign: { signName: 'Aries' }, house: 1, degree: 10, longitude: 10 },
          { name: 'Moon', sign: { signName: 'Taurus' }, house: 2, degree: 5, longitude: 35 },
        ],
        houses: [{ number: 1, sign: { signName: 'Aries' }, longitude: 0 }],
        aspects: [],
      },
    });
  });

  async function postHermetic(userId: string, withAuthHeader = true) {
    const { POST } = await import('@/app/api/hermetic-astrology/comprehensive/route');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (withAuthHeader) headers.Authorization = 'Bearer test-token';
    const req = new NextRequest('http://localhost:3000/api/hermetic-astrology/comprehensive', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId,
        userProfile: {
          birthDate: '1990-01-01',
          birthTime: '12:00:00',
          birthPlace: 'Delhi',
          birthLatitude: 28.6,
          birthLongitude: 77.2,
        },
      }),
    });
    return POST(req);
  }

  async function postFinancial(userId: string) {
    const { POST } = await import('@/app/api/financial-astrology/comprehensive/route');
    const req = new NextRequest('http://localhost:3000/api/financial-astrology/comprehensive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({
        userId,
        userProfile: {
          birthDate: '1990-01-01',
          birthTime: '12:00:00',
          birthPlace: 'Delhi',
          birthLatitude: 28.6,
          birthLongitude: 77.2,
        },
      }),
    });
    return POST(req);
  }

  it('does not return another user Hermetic cache when token uid differs', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: true, uid: 'attacker' });

    const res = await postHermetic('victim');
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(JSON.stringify(body)).not.toContain(SECRET);
    expect(mockReadAdminComprehensiveCache).not.toHaveBeenCalled();
  });

  it('does not read Hermetic cache without auth (stateless skips Firestore)', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: false, reason: 'missing_token' });

    const res = await postHermetic('victim', false);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(JSON.stringify(body)).not.toContain(SECRET);
    expect(mockReadAdminComprehensiveCache).not.toHaveBeenCalled();
    expect(mockWriteAdminComprehensiveCache).not.toHaveBeenCalled();
  });

  it('allows owned Hermetic cache reads', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: true, uid: 'victim' });

    const res = await postHermetic('victim');
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(JSON.stringify(body)).toContain(SECRET);
    expect(mockReadAdminComprehensiveCache).toHaveBeenCalled();
  });

  it('rejects mismatched UID on financial comprehensive and never reads cache', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: true, uid: 'attacker' });

    const res = await postFinancial('victim');
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(JSON.stringify(body)).not.toContain(SECRET);
    expect(mockReadAdminComprehensiveCache).not.toHaveBeenCalled();
  });

  it('rejects invalid tokens with 401', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: false, reason: 'invalid_token' });

    const res = await postHermetic('victim');
    expect(res.status).toBe(401);
    expect(mockReadAdminComprehensiveCache).not.toHaveBeenCalled();
  });
});
