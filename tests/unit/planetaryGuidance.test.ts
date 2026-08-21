import {
  GRAHA_NAMES,
  buildPlanetaryGuidance,
  buildVedicSeerHref,
  parseGrahaName,
  resolveGuidanceViewState,
  type GrahaName,
} from '@/lib/vedic/planetaryGuidance';
import type { NavaratnaAnalysis, PlanetaryAnalysis } from '@/lib/navaratnaIntelligence';

function planetAnalysis(overrides: Partial<PlanetaryAnalysis> & Pick<PlanetaryAnalysis, 'planet'>): PlanetaryAnalysis {
  return {
    strength: 'Neutral',
    isNaturalBenefic: false,
    isNaturalMalefic: false,
    isFunctionalBenefic: false,
    isFunctionalMalefic: false,
    isMaraka: false,
    house: 1,
    houseLord: false,
    isLagnesh: false,
    isDashaLord: false,
    dignity: {
      exalted: false,
      debilitated: false,
      ownSign: false,
      moolatrikona: false,
    },
    recommendation: 'caution',
    reason: 'default test reason',
    ...overrides,
  };
}

function navaratnaFixture(planets: PlanetaryAnalysis[], extra?: Partial<NavaratnaAnalysis>): NavaratnaAnalysis {
  return {
    userId: 'test-user',
    birthData: {
      birthDate: '1990-01-01',
      birthTime: '12:00',
      birthPlace: 'Delhi',
      latitude: 28.6,
      longitude: 77.2,
    },
    chartSummary: {
      ascendant: { sign: 'Cancer', degree: 10, lord: 'Moon' },
      lagnesh: 'Moon',
      currentDasha: {
        planet: 'Saturn',
        startDate: '2020-01-01',
        endDate: '2039-01-01',
        progress: 0.4,
      },
    },
    planetaryAnalysis: planets,
    recommendations: {
      lifeStone: null,
      beneficStones: [],
      dashaStone: null,
      avoidedStones: [],
    },
    weightRecommendation: { min: '1', ideal: '2', max: '3', note: '' },
    safetyWarnings: [],
    generatedAt: '2026-01-01T00:00:00.000Z',
    ...extra,
  };
}

const ninePlanetChart = {
  ascendant: { signName: 'Cancer' },
  currentDasha: { planet: 'Saturn', antardasha: 'Mercury' },
  planets: [
    { name: 'Sun', signName: 'Leo', house: 2, dignity: { strength: 'own sign' } },
    { name: 'Moon', signName: 'Taurus', house: 11 },
    { name: 'Mars', signName: 'Cancer', house: 1, dignity: { strength: 'debilitated' } },
    { name: 'Mercury', signName: 'Virgo', house: 3 },
    { name: 'Jupiter', signName: 'Sagittarius', house: 6 },
    { name: 'Venus', signName: 'Libra', house: 4 },
    { name: 'Saturn', signName: 'Capricorn', house: 7 },
    { name: 'Rahu', signName: 'Gemini', house: 12 },
    { name: 'Ketu', signName: 'Sagittarius', house: 6 },
  ],
};

describe('parseGrahaName', () => {
  it('accepts English and Sanskrit aliases', () => {
    expect(parseGrahaName('Shani')).toBe('Saturn');
    expect(parseGrahaName('chandra')).toBe('Moon');
    expect(parseGrahaName('Guru')).toBe('Jupiter');
    expect(parseGrahaName('not-a-planet')).toBeNull();
  });
});

describe('buildVedicSeerHref', () => {
  it('deep-links the Vedic Seer remedies context with a planet', () => {
    expect(buildVedicSeerHref('Saturn')).toBe('/tools/vedic?tab=ask-the-seer&planet=Saturn');
  });
});

describe('resolveGuidanceViewState', () => {
  it('returns loading, signed_out, no_profile, partial, and personalized', () => {
    expect(
      resolveGuidanceViewState({
        authLoading: true,
        reportsLoading: false,
        signedIn: false,
        hasVedicReport: false,
        hasNavaratnaReport: false,
        hasChartFacts: false,
      }),
    ).toBe('loading');
    expect(
      resolveGuidanceViewState({
        authLoading: false,
        reportsLoading: false,
        signedIn: false,
        hasVedicReport: false,
        hasNavaratnaReport: false,
        hasChartFacts: false,
      }),
    ).toBe('signed_out');
    expect(
      resolveGuidanceViewState({
        authLoading: false,
        reportsLoading: false,
        signedIn: true,
        hasVedicReport: false,
        hasNavaratnaReport: false,
        hasChartFacts: false,
      }),
    ).toBe('no_profile');
    expect(
      resolveGuidanceViewState({
        authLoading: false,
        reportsLoading: false,
        signedIn: true,
        hasVedicReport: true,
        hasNavaratnaReport: false,
        hasChartFacts: true,
      }),
    ).toBe('partial');
    expect(
      resolveGuidanceViewState({
        authLoading: false,
        reportsLoading: false,
        signedIn: true,
        hasVedicReport: true,
        hasNavaratnaReport: true,
        hasChartFacts: false,
      }),
    ).toBe('partial');
    expect(
      resolveGuidanceViewState({
        authLoading: false,
        reportsLoading: false,
        signedIn: true,
        hasVedicReport: true,
        hasNavaratnaReport: true,
        hasChartFacts: true,
      }),
    ).toBe('personalized');
  });
});

describe('buildPlanetaryGuidance', () => {
  it('returns all nine grahas with deterministic ranking', () => {
    const first = buildPlanetaryGuidance(ninePlanetChart, null);
    const second = buildPlanetaryGuidance(ninePlanetChart, null);
    expect(Object.keys(first.grahas)).toEqual([...GRAHA_NAMES]);
    expect(first.rankedPlanets).toEqual(second.rankedPlanets);
    expect(first.rankedPlanets).toHaveLength(9);
    expect(first.hasVedicChart).toBe(true);
    expect(first.hasNavaratna).toBe(false);
  });

  it('covers Sun through Ketu including nodes', () => {
    const result = buildPlanetaryGuidance(ninePlanetChart, null);
    for (const graha of GRAHA_NAMES) {
      expect(result.grahas[graha].planet).toBe(graha);
      expect(result.grahas[graha].startHere.length).toBeGreaterThan(0);
      expect(result.grahas[graha].teaching.length).toBeGreaterThan(0);
      expect(result.grahas[graha].wants.length).toBeGreaterThan(0);
      expect(result.grahas[graha].whenIgnored.length).toBeGreaterThan(0);
    }
    expect(result.grahas.Rahu.placement.house).toBe(12);
    expect(result.grahas.Ketu.placement.house).toBe(6);
  });

  it('frames Sun, Moon, and Mars as clear weekly demands', () => {
    const result = buildPlanetaryGuidance(ninePlanetChart, null);
    expect(result.grahas.Sun.wants).toMatch(/lead|own|name/i);
    expect(result.grahas.Sun.whenIgnored).toMatch(/shrink|approval|confidence/i);
    expect(result.grahas.Sun.startHere[0]?.title).toMatch(/own/i);
    expect(result.grahas.Moon.wants).toMatch(/feel|sleep|rhythm/i);
    expect(result.grahas.Moon.whenIgnored).toMatch(/anxiety|mood|sleep/i);
    expect(result.grahas.Moon.startHere[0]?.title).toMatch(/rhythm|feel/i);
    expect(result.grahas.Mars.wants).toMatch(/finish/i);
    expect(result.grahas.Mars.whenIgnored).toMatch(/abandon|irritab|heat/i);
    expect(result.grahas.Mars.startHere[0]?.title).toMatch(/finish/i);
  });

  it('does not invent signs or houses when fields are missing', () => {
    const result = buildPlanetaryGuidance(
      {
        currentDasha: { planet: 'Moon' },
        planets: [{ name: 'Moon' }],
      },
      null,
    );
    expect(result.grahas.Moon.placement.sign).toBeNull();
    expect(result.grahas.Moon.placement.house).toBeNull();
    expect(result.grahas.Sun.placement.sign).toBeNull();
    expect(result.grahas.Sun.evidence.every((item) => item.code !== 'difficult_house')).toBe(true);
    expect(result.currentDashaPlanet).toBe('Moon');
    expect(result.grahas.Moon.evidence.some((item) => item.code === 'current_dasha')).toBe(true);
  });

  it('prioritizes current dasha over a merely weak planet', () => {
    const result = buildPlanetaryGuidance(
      {
        currentDasha: { planet: 'Jupiter' },
        planets: [
          { name: 'Jupiter', signName: 'Cancer', house: 1, dignity: { strength: 'exalted' } },
          { name: 'Mars', signName: 'Cancer', house: 10, dignity: { strength: 'debilitated' } },
        ],
      },
      null,
    );
    expect(result.topPlanets[0]).toBe('Jupiter');
    expect(result.topPlanets).toContain('Mars');
    expect(result.grahas.Jupiter.attentionScore).toBeGreaterThan(result.grahas.Mars.attentionScore);
  });

  it('keeps functional benefic/malefic context instead of treating weak as simply bad', () => {
    const nav = navaratnaFixture([
      planetAnalysis({
        planet: 'Saturn',
        strength: 'Weak',
        isNaturalMalefic: true,
        isFunctionalBenefic: true,
        isFunctionalMalefic: false,
        isDashaLord: true,
        house: 10,
        recommendation: 'caution',
        reason: 'Functional benefic Saturn still needs care during dasha.',
      }),
      planetAnalysis({
        planet: 'Venus',
        strength: 'Very Weak',
        isNaturalBenefic: true,
        isFunctionalMalefic: true,
        house: 6,
        recommendation: 'avoid',
        reason: 'Functional malefic Venus in a dusthana.',
      }),
    ]);
    const result = buildPlanetaryGuidance(
      {
        currentDasha: { planet: 'Saturn' },
        planets: [
          { name: 'Saturn', signName: 'Libra', house: 10 },
          { name: 'Venus', signName: 'Scorpio', house: 6 },
        ],
      },
      nav,
    );
    expect(result.grahas.Saturn.placement.functionalRole).toBe('functional_benefic');
    expect(result.grahas.Venus.placement.functionalRole).toBe('functional_malefic');
    expect(result.grahas.Saturn.evidence.some((item) => item.code === 'functional_benefic')).toBe(true);
    expect(result.grahas.Venus.evidence.some((item) => item.code === 'functional_malefic')).toBe(true);
    expect(result.topPlanets).toContain('Saturn');
  });

  it('never recommends a gemstone from generic planet correspondence', () => {
    const result = buildPlanetaryGuidance(ninePlanetChart, null);
    for (const graha of GRAHA_NAMES) {
      expect(result.grahas[graha].gemstoneGuidance?.gemstoneStance).toBe('none');
      expect(result.grahas[graha].gemstoneGuidance?.description).toMatch(/does not infer/i);
    }
  });

  it('preserves Navaratna avoid and consult rules, including Rahu and Ketu', () => {
    const nav = navaratnaFixture(
      [
        planetAnalysis({
          planet: 'Rahu',
          isNaturalMalefic: true,
          isFunctionalMalefic: true,
          house: 12,
          recommendation: 'avoid',
          reason: 'Do not wear a Rahu stone.',
        }),
        planetAnalysis({
          planet: 'Ketu',
          isNaturalMalefic: true,
          house: 6,
          recommendation: 'caution',
          reason: 'Ketu gem needs a living astrologer.',
        }),
        planetAnalysis({
          planet: 'Moon',
          isNaturalBenefic: true,
          isFunctionalBenefic: true,
          isLagnesh: true,
          house: 11,
          recommendation: 'recommended',
          reason: 'Pearl is the life stone.',
          dignity: { exalted: false, debilitated: false, ownSign: false, moolatrikona: false },
        }),
      ],
      {
        recommendations: {
          lifeStone: {
            planet: 'Moon',
            gemstone: { english: 'Pearl', sanskrit: 'Moti', alternativeNames: [] },
            type: 'life_stone',
            priority: 'high',
            reason: 'Lagnesh Moon is a functional benefic.',
            analysis: planetAnalysis({
              planet: 'Moon',
              recommendation: 'recommended',
              isFunctionalBenefic: true,
              isLagnesh: true,
            }),
            wearingInstructions: {
              day: 'Monday',
              time: 'morning',
              metal: 'silver',
              finger: 'little',
              hand: 'right',
              pendant: false,
              skinContact: 'yes',
              purification: 'milk',
              mantra: 'Om Chandraya Namah',
              chanting: '108',
            },
            weight: { min: '2', ideal: '4', max: '6', note: '' },
            benefits: ['Calm'],
            warnings: ['Consult if allergic.'],
          },
          beneficStones: [],
          dashaStone: null,
          avoidedStones: [{ planet: 'Rahu', gemstone: 'Hessonite', reason: 'Do not wear a Rahu stone.' }],
        },
      },
    );

    const result = buildPlanetaryGuidance(ninePlanetChart, nav);
    expect(result.grahas.Rahu.gemstoneGuidance?.gemstoneStance).toBe('avoid');
    expect(result.grahas.Ketu.gemstoneGuidance?.gemstoneStance).toBe('consult');
    expect(result.grahas.Moon.gemstoneGuidance?.gemstoneStance).toBe('recommended');
    expect(result.grahas.Moon.gemstoneGuidance?.title).toMatch(/Pearl/i);
    expect(result.grahas.Saturn.gemstoneGuidance?.gemstoneStance).toBe('none');
  });

  it('does not recommend a malefic gem unless the persisted Navaratna report explicitly does', () => {
    const nav = navaratnaFixture([
      planetAnalysis({
        planet: 'Saturn',
        isNaturalMalefic: true,
        isFunctionalMalefic: true,
        isDashaLord: true,
        house: 8,
        recommendation: 'avoid',
        reason: 'Blue sapphire is not suitable.',
      }),
    ], {
      recommendations: {
        lifeStone: null,
        beneficStones: [],
        dashaStone: {
          planet: 'Saturn',
          gemstone: { english: 'Blue Sapphire', sanskrit: 'Neelam', alternativeNames: [] },
          type: 'dasha_stone',
          priority: 'high',
          reason: 'Should never be used when analysis says avoid.',
          analysis: planetAnalysis({ planet: 'Saturn', recommendation: 'avoid' }),
          wearingInstructions: {
            day: 'Saturday',
            time: 'evening',
            metal: 'silver',
            finger: 'middle',
            hand: 'right',
            pendant: false,
            skinContact: 'yes',
            purification: 'water',
            mantra: 'Om Shanaye Namah',
            chanting: '108',
          },
          weight: { min: '3', ideal: '5', max: '7', note: '' },
          benefits: [],
          warnings: ['Avoid unless an astrologer approves.'],
        },
        avoidedStones: [{ planet: 'Saturn', gemstone: 'Blue Sapphire', reason: 'Blue sapphire is not suitable.' }],
      },
    });
    const result = buildPlanetaryGuidance({ currentDasha: { planet: 'Saturn' }, planets: [{ name: 'Saturn', house: 8 }] }, nav);
    expect(result.grahas.Saturn.gemstoneGuidance?.gemstoneStance).toBe('avoid');
  });

  it('unwraps nested vedic and navaratna report shapes', () => {
    const result = buildPlanetaryGuidance(
      { data: { chartData: { planets: [{ planet: 'Shani', sign: 'Capricorn', house: 8 }], currentDasha: { mahadasha: 'Saturn' } } } },
      { data: navaratnaFixture([planetAnalysis({ planet: 'Saturn', house: 8, recommendation: 'caution' })]) },
    );
    expect(result.currentDashaPlanet).toBe('Saturn');
    expect(result.grahas.Saturn.placement.house).toBe(8);
    expect(result.hasNavaratna).toBe(true);
  });

  it('caps top planets at three and uses graha order as a tiebreaker', () => {
    const result = buildPlanetaryGuidance({ planets: GRAHA_NAMES.map((name) => ({ name, house: 1 })) }, null);
    expect(result.topPlanets.length).toBeLessThanOrEqual(3);
    const tied = buildPlanetaryGuidance(null, null);
    expect(tied.rankedPlanets).toEqual([...GRAHA_NAMES]);
    expect(tied.topPlanets).toEqual([]);
    expect(tied.hasVedicChart).toBe(false);
  });
});

describe('guidance view helpers used by UI tests', () => {
  it('exposes a stable planet list for selectors', () => {
    const grahas: GrahaName[] = [...GRAHA_NAMES];
    expect(grahas).toContain('Rahu');
    expect(grahas).toContain('Ketu');
  });
});
