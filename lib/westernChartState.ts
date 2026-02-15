/**
 * Western Astrology Chart State Store and Slice Selector.
 * Builds a normalized chart object and returns only the slice relevant to the question type.
 * "The chatbot never knows astrology; it only knows how to reason from a chart."
 */

export interface PlanetPlacement {
  name: string;
  sign: string;
  house: number | null;
  degree?: number;
  isRetrograde?: boolean;
  aspects?: string[];
}

export interface HouseCusp {
  number: number;
  sign: string;
  degree?: number;
}

export interface AspectInfo {
  planet1: string;
  planet2: string;
  type: string;
  orb?: number;
}

export type TransitEntry = { name: string; sign: string; house?: number; degree?: number; isRetrograde?: boolean };

export interface WesternChartState {
  natal: {
    sun: PlanetPlacement;
    moon: PlanetPlacement;
    ascendant: string;
    planets: PlanetPlacement[];
    houses: HouseCusp[];
    aspects: AspectInfo[];
  };
  transits: {
    current: TransitEntry[];
    future?: TransitEntry[];
    futureByDate?: Array<{ date: string; transits: TransitEntry[] }>;
  };
  progressions: null | Record<string, unknown>;
}

function getSign(o: { sign?: { signName?: string }; signName?: string } | string | undefined): string {
  if (!o) return 'Unknown';
  if (typeof o === 'string') return o;
  return (o as { signName?: string }).signName || (o as { sign?: { signName?: string } }).sign?.signName || 'Unknown';
}

function getAspectsForPlanet(planetName: string, aspects: any[]): string[] {
  return (aspects || [])
    .filter((a: any) => (a.planet1 === planetName || a.planet2 === planetName) && (a.strength > 0.7 || (a.orb != null && a.orb < 3)))
    .map((a: any) => `${a.type || 'aspect'} ${a.planet1 === planetName ? a.planet2 : a.planet1}`);
}

/**
 * Build normalized chart state from raw westernChartData (planets, houses, aspects, transits).
 * When futureTransitsByDate is provided (e.g. quarterly dates for a year), transits.futureByDate is set.
 */
export function buildChartState(
  westernChartData: any,
  futureTransits?: any[] | null,
  futureTransitsByDate?: Array<{ date: string; transits: any[] }> | null
): WesternChartState {
  const planets = westernChartData?.planets || [];
  const houses = westernChartData?.houses || [];
  const aspects = westernChartData?.aspects || [];
  const currentTransits = westernChartData?.transits || [];

  const sunPlanet = planets.find((p: any) => p.name === 'Sun');
  const moonPlanet = planets.find((p: any) => p.name === 'Moon');
  const risingSign = getSign(houses[0]?.sign ?? houses[0]);

  const toPlacement = (p: any): PlanetPlacement => ({
    name: p.name,
    sign: getSign(p.sign),
    house: p.house != null ? Number(p.house) : null,
    degree: p.degree,
    isRetrograde: p.isRetrograde,
    aspects: getAspectsForPlanet(p.name, aspects)
  });

  const natalPlanets: PlanetPlacement[] = planets.map((p: any) => toPlacement(p));
  const natalHouses: HouseCusp[] = houses.slice(0, 12).map((h: any, i: number) => ({
    number: (h.number ?? i + 1) as number,
    sign: getSign(h.sign ?? h),
    degree: h.degree
  }));
  const natalAspects: AspectInfo[] = (aspects as any[])
    .filter((a: any) => (a.strength > 0.7 || (a.orb != null && a.orb < 3)))
    .slice(0, 15)
    .map((a: any) => ({
      planet1: a.planet1 || 'Planet1',
      planet2: a.planet2 || 'Planet2',
      type: a.type || 'aspect',
      orb: a.orb
    }));

  const toTransit = (t: any): TransitEntry => ({
    name: t.name || 'Planet',
    sign: getSign(t.sign ?? t),
    house: t.house,
    degree: t.degree,
    isRetrograde: t.isRetrograde
  });

  const futureByDate =
    futureTransitsByDate && futureTransitsByDate.length > 0
      ? futureTransitsByDate.map(({ date, transits: arr }) => ({
          date,
          transits: (arr as any[]).slice(0, 8).map(toTransit)
        }))
      : undefined;

  const futureSingle =
    futureTransits && futureTransits.length > 0
      ? (futureTransits as any[]).slice(0, 8).map(toTransit)
      : futureByDate?.[0]?.transits;

  return {
    natal: {
      sun: sunPlanet ? toPlacement(sunPlanet) : { name: 'Sun', sign: 'Unknown', house: null, aspects: [] },
      moon: moonPlanet ? toPlacement(moonPlanet) : { name: 'Moon', sign: 'Unknown', house: null, aspects: [] },
      ascendant: risingSign,
      planets: natalPlanets,
      houses: natalHouses,
      aspects: natalAspects
    },
    transits: {
      current: (currentTransits as any[]).slice(0, 8).map(toTransit),
      future: futureSingle,
      futureByDate
    },
    progressions: null
  };
}

/**
 * Format a slice as markdown for the reasoning prompt. Only includes data allowed for the question type.
 */
export function getChartSliceForQuestionType(questionType: string, chartState: WesternChartState): string {
  const { natal, transits, progressions } = chartState;
  const lines: string[] = [];

  const bigThree = `- **Sun**: ${natal.sun.sign}${natal.sun.house != null ? `, House ${natal.sun.house}` : ''}${natal.sun.aspects?.length ? ` (${natal.sun.aspects.join(', ')})` : ''}
- **Moon**: ${natal.moon.sign}${natal.moon.house != null ? `, House ${natal.moon.house}` : ''}${natal.moon.aspects?.length ? ` (${natal.moon.aspects.join(', ')})` : ''}
- **Ascendant**: ${natal.ascendant}`;

  const personalityTypes = ['sun_sign', 'moon_sign', 'rising_sign', 'general'];
  const needsPersonality = personalityTypes.includes(questionType);

  const careerTypes = ['career'];
  const needsCareer = careerTypes.includes(questionType);

  const relationshipTypes = ['relationships'];
  const needsRelationships = relationshipTypes.includes(questionType);

  const timingTypes = ['transits', 'timing', 'electional'];
  const needsTiming = timingTypes.includes(questionType) || questionType === 'career';

  const emotionalTypes = ['moon_sign', 'remedies'];
  const needsEmotional = emotionalTypes.includes(questionType) || questionType === 'remedies';

  const lifePurposeTypes = ['life_purpose'];
  const needsLifePurpose = lifePurposeTypes.includes(questionType);

  const houseTypes = ['houses'];
  const needsHouses = houseTypes.includes(questionType);

  const aspectTypes = ['aspects'];
  const needsAspects = aspectTypes.includes(questionType);

  const wealthTypes = ['wealth'];
  const needsWealth = wealthTypes.includes(questionType);

  const numerologyTypes = ['life_path_number', 'name_number', 'astro_numerology', 'combined_analysis'];
  const needsNumerologySlice = numerologyTypes.includes(questionType);

  lines.push('# Chart facts (use only these to answer)');
  lines.push('');

  if (needsPersonality || needsCareer || needsRelationships || needsEmotional || needsLifePurpose || needsNumerologySlice || needsTiming) {
    lines.push('## Core identity (Big Three)');
    lines.push(bigThree);
    lines.push('');
  }

  if (needsCareer) {
    const tenth = natal.houses.find(h => h.number === 10);
    const sun = natal.planets.find(p => p.name === 'Sun');
    const saturn = natal.planets.find(p => p.name === 'Saturn');
    lines.push('## Career-relevant');
    lines.push(`- 10th house cusp: ${tenth?.sign ?? 'Unknown'}`);
    if (sun) lines.push(`- Sun: ${sun.sign}, House ${sun.house ?? '?'}`);
    if (saturn) lines.push(`- Saturn: ${saturn.sign}, House ${saturn.house ?? '?'}`);
    lines.push('');
  }

  if (needsRelationships) {
    const seventh = natal.houses.find(h => h.number === 7);
    const venus = natal.planets.find(p => p.name === 'Venus');
    const moon = natal.moon;
    lines.push('## Relationship-relevant');
    lines.push(`- 7th house cusp: ${seventh?.sign ?? 'Unknown'}`);
    lines.push(`- Venus: ${venus?.sign ?? 'Unknown'}, House ${venus?.house ?? '?'}`);
    lines.push(`- Moon: ${moon.sign}, House ${moon.house ?? '?'}`);
    lines.push('');
  }

  if (needsEmotional) {
    const moon = natal.moon;
    const waterHouses = natal.houses.filter(h => [4, 8, 12].includes(h.number));
    const moonAspects = natal.aspects.filter(a => a.planet1 === 'Moon' || a.planet2 === 'Moon');
    lines.push('## Emotional-relevant');
    lines.push(`- Moon: ${moon.sign}, House ${moon.house ?? '?'}${moon.aspects?.length ? `; aspects: ${moon.aspects.join(', ')}` : ''}`);
    waterHouses.forEach(h => lines.push(`- House ${h.number}: ${h.sign}`));
    if (moonAspects.length) moonAspects.forEach(a => lines.push(`- ${a.planet1} ${a.type} ${a.planet2}`));
    lines.push('');
  }

  if (needsLifePurpose) {
    const sun = natal.sun;
    const tenth = natal.houses.find(h => h.number === 10);
    const northNode = natal.planets.find((p: any) => p.name === 'North Node' || p.name === 'True Node');
    lines.push('## Life purpose-relevant');
    lines.push(`- Sun: ${sun.sign}, House ${sun.house ?? '?'}`);
    lines.push(`- 10th house: ${tenth?.sign ?? 'Unknown'}`);
    if (northNode) lines.push(`- North Node: ${(northNode as PlanetPlacement).sign}, House ${(northNode as PlanetPlacement).house ?? '?'}`);
    lines.push('');
  }

  if (needsHouses) {
    lines.push('## Houses');
    natal.houses.forEach(h => lines.push(`- House ${h.number}: ${h.sign}`));
    lines.push('## Planets in houses');
    natal.planets.forEach(p => {
      if (p.house != null) lines.push(`- ${p.name}: ${p.sign}, House ${p.house}`);
    });
    lines.push('');
  }

  if (needsAspects) {
    lines.push('## Major aspects');
    natal.aspects.slice(0, 12).forEach(a => lines.push(`- ${a.planet1} ${a.type} ${a.planet2}${a.orb != null ? ` (${a.orb.toFixed(1)}° orb)` : ''}`));
    lines.push('');
  }

  if (needsWealth) {
    const h2 = natal.houses.find(h => h.number === 2);
    const h8 = natal.houses.find(h => h.number === 8);
    const jup = natal.planets.find(p => p.name === 'Jupiter');
    const sat = natal.planets.find(p => p.name === 'Saturn');
    lines.push('## Wealth-relevant');
    lines.push(`- 2nd house: ${h2?.sign ?? 'Unknown'}, 8th house: ${h8?.sign ?? 'Unknown'}`);
    if (jup) lines.push(`- Jupiter: ${jup.sign}, House ${jup.house ?? '?'}`);
    if (sat) lines.push(`- Saturn: ${sat.sign}, House ${sat.house ?? '?'}`);
    lines.push('');
  }

  if (needsTiming) {
    lines.push('## Current transits');
    if (transits.current.length > 0) {
      transits.current.forEach(t => lines.push(`- ${t.name} in ${t.sign}${t.house != null ? ` (House ${t.house})` : ''}${t.isRetrograde ? ' Rx' : ''}`));
    } else {
      lines.push('- (No current transit data in this slice)');
    }
    if (transits.futureByDate && transits.futureByDate.length > 0) {
      transits.futureByDate.forEach(({ date, transits: arr }) => {
        lines.push(`## Future transits for ${date}`);
        arr.forEach(t => lines.push(`- ${t.name} in ${t.sign}${t.house != null ? ` (House ${t.house})` : ''}${t.isRetrograde ? ' Rx' : ''}`));
        lines.push('');
      });
    } else if (transits.future && transits.future.length > 0) {
      lines.push('## Future transits (for asked date)');
      transits.future.forEach(t => lines.push(`- ${t.name} in ${t.sign}${t.house != null ? ` (House ${t.house})` : ''}${t.isRetrograde ? ' Rx' : ''}`));
    }
    if (!progressions) {
      lines.push('');
      lines.push('Progressions: not available. If the question requires progressions, say so.');
    }
    lines.push('');
  }

  if (needsPersonality && questionType !== 'general') {
    const rest = natal.planets.filter(p => !['Sun', 'Moon'].includes(p.name));
    if (rest.length > 0) {
      lines.push('## Other planets');
      rest.forEach(p => lines.push(`- ${p.name}: ${p.sign}, House ${p.house ?? '?'}`));
      lines.push('');
    }
  }

  if (questionType === 'general') {
    lines.push('## All natal planets');
    natal.planets.forEach(p => lines.push(`- ${p.name}: ${p.sign}, House ${p.house ?? '?'}`));
    lines.push('');
    lines.push('## Major aspects');
    natal.aspects.slice(0, 10).forEach(a => lines.push(`- ${a.planet1} ${a.type} ${a.planet2}`));
    if (transits.current.length > 0) {
      lines.push('## Current transits');
      transits.current.slice(0, 5).forEach(t => lines.push(`- ${t.name} in ${t.sign}`));
    }
  }

  return lines.join('\n').trim() || '# No chart slice available for this question type.';
}
