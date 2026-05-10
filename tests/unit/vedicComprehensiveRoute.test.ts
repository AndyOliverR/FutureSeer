/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

const mockCreateAICompletion = jest.fn();
const mockGetVedicReading = jest.fn();
const mockGeocodePlace = jest.fn();
const setCalls: Array<{ path: string; data: unknown }> = [];
let mockDocs: Record<string, unknown | undefined> = {};

function makeAdminDb() {
  const makeCollectionRef = (segments: string[]) => ({
    doc: (docId: string) => makeDocRef([...segments, docId]),
    get: jest.fn(),
  });
  const makeDocRef = (segments: string[]) => ({
    collection: (collectionId: string) => makeCollectionRef([...segments, collectionId]),
    get: async () => {
      const key = segments.join('/');
      const data = mockDocs[key];
      return {
        exists: data !== undefined,
        data: () => data,
      };
    },
    set: async (data: unknown) => {
      const key = segments.join('/');
      mockDocs[key] = data;
      setCalls.push({ path: key, data });
    },
  });
  return {
    collection: (collectionId: string) => makeCollectionRef([collectionId]),
  };
}

jest.mock('@/lib/firebase', () => ({
  getFirebaseDB: () => makeAdminDb(),
}));

jest.mock('@/lib/aiGateway', () => ({
  createAICompletion: (...args: unknown[]) => mockCreateAICompletion(...args),
}));

jest.mock('@/lib/vedicIntelligence', () => ({
  getVedicReading: (...args: unknown[]) => mockGetVedicReading(...args),
}));

jest.mock('@/services/geocoding', () => ({
  geocodePlace: (...args: unknown[]) => mockGeocodePlace(...args),
}));

import { POST } from '@/app/api/vedic/comprehensive/route';

function postVedic(body: Record<string, unknown>) {
  return POST(
    new NextRequest('http://localhost:3000/api/vedic/comprehensive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  ) as Promise<Response>;
}

describe('vedic comprehensive route persisted fast path', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDocs = {};
    setCalls.length = 0;
    mockGeocodePlace.mockResolvedValue({ latitude: 12.9716, longitude: 77.5946 });
    mockGetVedicReading.mockResolvedValue({
      chartData: {
        ascendant: { signName: 'Leo' },
        currentDasha: { planet: 'Moon' },
        planets: [{ name: 'Sun', sign: 'Aries', house: 9 }],
        houses: [{ sign: 'Aries', lord: 'Mars' }],
      },
    });
    mockCreateAICompletion.mockResolvedValue({
      content: JSON.stringify({
        chartOverview: 'New chart overview',
        ascendantAnalysis: 'New ascendant analysis',
        planetaryAnalysis: [{ planet: 'Sun', analysis: 'New Sun analysis' }],
        houseAnalysis: [{ house: 1, analysis: 'New first house analysis' }],
      }),
      usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
    });
  });

  it('does not reuse a persisted comprehensive analysis from a different birth context', async () => {
    mockDocs['comprehensiveMysticalProfiles/user-1'] = {
      birthDate: '1980-01-01',
      birthTime: '01:00:00',
      birthPlace: 'Old City',
      vedic: {
        comprehensiveAnalysis: {
          chartOverview: 'Old chart overview',
        },
      },
    };

    const res = await postVedic({
      userId: 'user-1',
      vedicChartData: { ascendant: { signName: 'Leo' } },
      userProfile: {
        birthDate: '1990-02-02',
        birthTime: '02:00:00',
        birthPlace: 'New City',
      },
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.comprehensiveAnalysis.chartOverview).toBe('New chart overview');
    expect(mockCreateAICompletion).toHaveBeenCalledTimes(1);
    expect(setCalls.some((call) => call.path === 'users/user-1/mysticalProfile/comprehensiveVedic')).toBe(true);
  });

  it('reuses a persisted comprehensive analysis when the birth context matches', async () => {
    mockDocs['comprehensiveMysticalProfiles/user-1'] = {
      birthDate: '1990-02-02',
      birthTime: '02:00:00',
      birthPlace: 'New City',
      vedic: {
        comprehensiveAnalysis: {
          chartOverview: 'Persisted chart overview',
        },
      },
    };

    const res = await postVedic({
      userId: 'user-1',
      vedicChartData: { ascendant: { signName: 'Leo' } },
      userProfile: {
        birthDate: '1990-02-02',
        birthTime: '02:00:00',
        birthPlace: 'New City',
      },
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.comprehensiveAnalysis.chartOverview).toBe('Persisted chart overview');
    expect(mockCreateAICompletion).not.toHaveBeenCalled();
  });
});
