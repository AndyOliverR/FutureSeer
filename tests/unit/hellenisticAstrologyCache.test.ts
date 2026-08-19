const mockUserSubdocGet = jest.fn();
const mockUserSubdocSet = jest.fn();
const mockGetFirebaseDB = jest.fn();

jest.mock('@/lib/userSubcollectionFirestore', () => ({
  userSubdocGet: (...args: unknown[]) => mockUserSubdocGet(...args),
  userSubdocSet: (...args: unknown[]) => mockUserSubdocSet(...args),
}));

jest.mock('@/lib/firebase', () => ({
  getFirebaseDB: () => mockGetFirebaseDB(),
}));

jest.mock('@/lib/devLogger', () => ({
  devLog: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
  devWarn: jest.fn(),
}));

jest.mock('@/lib/western/tropicalCalculator', () => ({
  calculateTropicalPlanets: () => ({
    sun: { longitude: 10 },
    moon: { longitude: 40 },
    mercury: { longitude: 20 },
    venus: { longitude: 30 },
    mars: { longitude: 80 },
    jupiter: { longitude: 120 },
    saturn: { longitude: 200 },
  }),
  calculateTropicalHouses: () => [{ longitude: 0 }],
  getTropicalSign: () => 'Aries',
  getDegreeInSign: (lon: number) => lon,
  calculateTropicalAspects: () => [],
}));

import { getIntelligentHellenisticAstrologyData } from '@/lib/hellenisticAstrologyIntelligence';

describe('hellenistic astrology cache skip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFirebaseDB.mockReturnValue({ collection: jest.fn() });
    mockUserSubdocGet.mockResolvedValue({
      birthDate: '1990-01-01',
      birthTime: '12:00:00',
      birthPlace: 'Athens',
      metadata: { version: '2.1.0', lastUpdated: new Date() },
      interpretations: { personality: { overview: 'CACHED_VICTIM' } },
    });
    mockUserSubdocSet.mockResolvedValue(undefined);
  });

  it('does not read or write Firestore when useCache is false', async () => {
    const reading = await getIntelligentHellenisticAstrologyData(
      'victim',
      '1990-01-01',
      '12:00:00',
      'Athens',
      37.98,
      23.72,
      { useCache: false },
    );

    expect(mockUserSubdocGet).not.toHaveBeenCalled();
    expect(mockUserSubdocSet).not.toHaveBeenCalled();
    expect(JSON.stringify(reading)).not.toContain('CACHED_VICTIM');
    expect(reading.userId).toBe('victim');
  });

  it('reads Firestore cache when useCache is allowed', async () => {
    const reading = await getIntelligentHellenisticAstrologyData(
      'victim',
      '1990-01-01',
      '12:00:00',
      'Athens',
      37.98,
      23.72,
      { useCache: true },
    );

    expect(mockUserSubdocGet).toHaveBeenCalledWith('victim', 'hellenistic-astrology', 'current');
    expect(JSON.stringify(reading)).toContain('CACHED_VICTIM');
  });
});
