/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyUserRequest = jest.fn();
const mockGetFirebaseDB = jest.fn();
const mockStoreVedicData = jest.fn();
const mockResolveAiReportWithFallback = jest.fn();
const mockCallStructuredAI = jest.fn();
const mockCallTextAI = jest.fn();
const mockReadAdminComprehensiveCache = jest.fn();
const mockWriteAdminComprehensiveCache = jest.fn();

jest.mock('@/lib/userApiAuth', () => ({
  verifyUserRequest: (...args: unknown[]) => mockVerifyUserRequest(...args),
  resolveOwnedUserId: jest.requireActual('@/lib/security/ownership').resolveOwnedUserId,
}));

jest.mock('@/lib/firebase', () => ({
  getFirebaseDB: (...args: unknown[]) => mockGetFirebaseDB(...args),
}));

jest.mock('@/lib/userDataStorage', () => ({
  userDataStorage: {
    storeVedicData: (...args: unknown[]) => mockStoreVedicData(...args),
  },
}));

jest.mock('@/lib/aiFallbackRouter', () => ({
  resolveAiReportWithFallback: (...args: unknown[]) => mockResolveAiReportWithFallback(...args),
  mapStructuredReportRun: jest.fn(),
}));

jest.mock('@/lib/aiStructuredOutput', () => ({
  callStructuredAI: (...args: unknown[]) => mockCallStructuredAI(...args),
  callTextAI: (...args: unknown[]) => mockCallTextAI(...args),
  runStructuredReportAI: jest.fn(),
  parseLlmJsonRecord: jest.fn(),
}));

jest.mock('@/lib/adminComprehensiveCache', () => ({
  readAdminComprehensiveCache: (...args: unknown[]) => mockReadAdminComprehensiveCache(...args),
  writeAdminComprehensiveCache: (...args: unknown[]) => mockWriteAdminComprehensiveCache(...args),
}));

jest.mock('@/lib/devLogger', () => ({
  devLog: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
  devWarn: jest.fn(),
}));

function makeAdminDb(docs: Record<string, Record<string, unknown>>) {
  return {
    collection(name: string) {
      const self = this as {
        _path: string[];
        collection: (n: string) => unknown;
        doc: (id: string) => unknown;
      };
      const path = [...(self._path || []), name];
      return {
        _path: path,
        collection(next: string) {
          return makeAdminDb(docs).collection.call({ _path: path }, next);
        },
        doc(id: string) {
          const docPath = [...path, id].join('/');
          return {
            collection(next: string) {
              return makeAdminDb(docs).collection.call({ _path: [...path, id] }, next);
            },
            async get() {
              const data = docs[docPath];
              return {
                exists: !!data,
                data: () => data ?? null,
              };
            },
            async set() {
              return undefined;
            },
          };
        },
        async get() {
          return { exists: false, data: () => null };
        },
      };
    },
  };
}

describe('report cache auth (remaining comprehensive + clear-cache)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    mockGetFirebaseDB.mockReturnValue(
      makeAdminDb({
        'users/victim/numerologyReports/comprehensive': {
          timestamp: Date.now(),
          schemaVersion: '1.0',
          data: {
            comprehensiveAnalysis: {
              profileOverview: 'SECRET_VICTIM_NUMEROLOGY',
            },
          },
        },
        'users/victim/baziReports/comprehensive': {
          timestamp: Date.now(),
          cacheKey: 'bazi_victim_1990-01-01_12:00',
          comprehensiveAnalysis: {
            overview: 'SECRET_VICTIM_BAZI',
          },
        },
      }),
    );
    mockStoreVedicData.mockResolvedValue(undefined);
  });

  async function postNumerology(userId: string) {
    const { POST } = await import('@/app/api/numerology/comprehensive/route');
    const req = new NextRequest('http://localhost:3000/api/numerology/comprehensive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({
        userId,
        numerologyData: {
          lifePathNumber: 7,
          expressionNumber: 5,
          soulUrgeNumber: 3,
          personalityNumber: 2,
          destinyNumber: 5,
        },
        userProfile: { birthDate: '1990-01-01', fullName: 'Victim' },
      }),
    });
    return POST(req);
  }

  async function postClearCache(userId: string, withAuthHeader = true) {
    const { POST } = await import('@/app/api/tools/vedic/clear-cache/route');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (withAuthHeader) headers.Authorization = 'Bearer test-token';
    const req = new NextRequest('http://localhost:3000/api/tools/vedic/clear-cache', {
      method: 'POST',
      headers,
      body: JSON.stringify({ userId }),
    });
    return POST(req);
  }

  it('does not return another user numerology cache when token uid differs', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: true, uid: 'attacker' });

    const res = await postNumerology('victim');
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(JSON.stringify(body)).not.toContain('SECRET_VICTIM');
  });

  it('does not read numerology cache without auth (stateless skips Firestore)', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: false, reason: 'missing_token' });
    const prevKey = process.env.GROQ_API_KEY;
    delete process.env.GROQ_API_KEY;

    const res = await postNumerology('victim');
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(JSON.stringify(body)).not.toContain('SECRET_VICTIM_NUMEROLOGY');
    if (prevKey !== undefined) process.env.GROQ_API_KEY = prevKey;
  });

  it('rejects Vedic clear-cache without auth and never writes', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: false, reason: 'missing_token' });

    const res = await postClearCache('victim', false);
    expect(res.status).toBe(401);
    expect(mockStoreVedicData).not.toHaveBeenCalled();
  });

  it('rejects Vedic clear-cache for mismatched UID and never writes', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: true, uid: 'attacker' });

    const res = await postClearCache('victim');
    expect(res.status).toBe(403);
    expect(mockStoreVedicData).not.toHaveBeenCalled();
  });

  it('allows Vedic clear-cache for owned UID', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: true, uid: 'victim' });

    const res = await postClearCache('victim');
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockStoreVedicData).toHaveBeenCalledWith('victim', null);
  });
});
