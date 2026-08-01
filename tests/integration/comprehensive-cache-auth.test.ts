/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockVerifyUserRequest = jest.fn();
const mockGetFirebaseDB = jest.fn();
const mockGetVedicReading = jest.fn();
const mockGeocodePlace = jest.fn();
const mockResolveAiReportWithFallback = jest.fn();
const mockCallStructuredAI = jest.fn();

jest.mock('@/lib/userApiAuth', () => ({
  verifyUserRequest: (...args: unknown[]) => mockVerifyUserRequest(...args),
  resolveOwnedUserId: jest.requireActual('@/lib/security/ownership').resolveOwnedUserId,
}));

jest.mock('@/lib/firebase', () => ({
  getFirebaseDB: (...args: unknown[]) => mockGetFirebaseDB(...args),
}));

jest.mock('@/lib/vedicIntelligence', () => ({
  getVedicReading: (...args: unknown[]) => mockGetVedicReading(...args),
}));

jest.mock('@/services/geocoding', () => ({
  geocodePlace: (...args: unknown[]) => mockGeocodePlace(...args),
}));

jest.mock('@/lib/aiFallbackRouter', () => ({
  resolveAiReportWithFallback: (...args: unknown[]) => mockResolveAiReportWithFallback(...args),
}));

jest.mock('@/lib/aiStructuredOutput', () => ({
  callStructuredAI: (...args: unknown[]) => mockCallStructuredAI(...args),
  parseLlmJsonRecord: jest.fn(),
}));

jest.mock('@/lib/devLogger', () => ({
  devLog: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
  devWarn: jest.fn(),
}));

jest.mock('@/lib/westernReportChunks', () => ({
  transformComprehensiveToChunks: jest.fn(() => []),
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

describe('comprehensive report cache auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    mockGetFirebaseDB.mockReturnValue(
      makeAdminDb({
        'users/victim': {
          mysticalProfile: {
            comprehensiveAnalysis: {
              chartOverview: 'SECRET_VICTIM_VEDIC',
              ascendantAnalysis: 'asc',
            },
          },
        },
        'users/victim/mysticalProfile/comprehensiveVedic': {
          schemaVersion: '1.0',
          birthDate: '1990-01-01',
          birthTime: '12:00:00',
          birthPlace: 'Delhi',
          timestamp: Date.now(),
          comprehensiveAnalysis: {
            chartOverview: 'SECRET_VICTIM_VEDIC_CACHE',
            ascendantAnalysis: 'asc',
          },
        },
        'users/victim/westernAstrologyReports/comprehensive': {
          timestamp: Date.now(),
          schemaVersion: '2.0',
          data: {
            comprehensiveAnalysis: {
              chartOverview: 'SECRET_VICTIM_WESTERN',
              planetaryAnalysis: [],
              houseAnalysis: [],
              aspectAnalysis: [],
              transitAnalysis: 't',
              predictiveInsights: {
                todaysQuickWin: 'a',
                currentWeek: 'b',
                currentMonth: 'c',
                currentYear: 'd',
                nextYearSneakPeek: 'e',
                longerTermCycles: 'f',
              },
            },
          },
        },
      }),
    );
  });

  async function postVedic(userId: string, withAuthHeader = true) {
    const { POST } = await import('@/app/api/vedic/comprehensive/route');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (withAuthHeader) headers.Authorization = 'Bearer test-token';
    const req = new NextRequest('http://localhost:3000/api/vedic/comprehensive', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId,
        vedicChartData: {},
        userProfile: {
          birthDate: '1990-01-01',
          birthTime: '12:00:00',
          birthPlace: 'Delhi',
        },
      }),
    });
    return POST(req);
  }

  async function postWestern(userId: string, withAuthHeader = true) {
    const { POST } = await import('@/app/api/western-astrology/comprehensive/route');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (withAuthHeader) headers.Authorization = 'Bearer test-token';
    const req = new NextRequest('http://localhost:3000/api/western-astrology/comprehensive', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId,
        chartData: {
          planets: [{ name: 'Sun', sign: { signName: 'Aries' }, house: 1, degree: 10 }],
          houses: [],
          aspects: [],
          transits: [],
        },
      }),
    });
    return POST(req);
  }

  it('does not return another user Vedic cache when token uid differs', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: true, uid: 'attacker' });

    const res = await postVedic('victim');
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(JSON.stringify(body)).not.toContain('SECRET_VICTIM');
  });

  it('does not return Vedic profile/cache without auth (stateless path skips Firestore)', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: false, reason: 'missing_token' });
    mockGeocodePlace.mockResolvedValueOnce({ latitude: 28.6, longitude: 77.2 });
    mockGetVedicReading.mockResolvedValueOnce({ chartData: { planets: [] } });
    mockResolveAiReportWithFallback.mockImplementationOnce(async (args: {
      readFirestoreCache: () => Promise<unknown>;
      buildDeterministic: () => unknown;
    }) => {
      const cached = await args.readFirestoreCache();
      expect(cached).toBeNull();
      return {
        data: args.buildDeterministic(),
        source: 'deterministic',
        degraded: true,
        parsingFailed: true,
      };
    });

    const res = await postVedic('victim', false);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(JSON.stringify(body)).not.toContain('SECRET_VICTIM');
    expect(mockResolveAiReportWithFallback).toHaveBeenCalled();
  });

  it('returns owned Vedic cache for matching authenticated uid', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: true, uid: 'victim' });

    const res = await postVedic('victim');
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(JSON.stringify(body)).toContain('SECRET_VICTIM');
  });

  it('does not return another user Western cache when token uid differs', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: true, uid: 'attacker' });

    const res = await postWestern('victim');
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(JSON.stringify(body)).not.toContain('SECRET_VICTIM_WESTERN');
  });

  it('does not return Western cache without auth', async () => {
    mockVerifyUserRequest.mockResolvedValueOnce({ ok: false, reason: 'missing_token' });
    process.env.GROQ_API_KEY = 'test-key';
    mockResolveAiReportWithFallback.mockImplementationOnce(async (args: {
      readFirestoreCache: () => Promise<unknown>;
      buildDeterministic: () => unknown;
    }) => {
      const cached = await args.readFirestoreCache();
      expect(cached).toBeNull();
      return {
        data: args.buildDeterministic(),
        source: 'deterministic',
        degraded: true,
        parsingFailed: true,
      };
    });

    const res = await postWestern('victim', false);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(JSON.stringify(body)).not.toContain('SECRET_VICTIM_WESTERN');
  });
});
