import type { UnifiedChartData, ChartAspect, ChartHouse, ChartPoint } from './schema';

const ZODIAC = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

const toNumber = (value: unknown, fallback = 0): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const signNameFromLongitude = (lon: number): string => ZODIAC[Math.floor((((lon % 360) + 360) % 360) / 30)];

export function adaptWesternToUnified(input: {
  planets?: Array<Record<string, unknown>>;
  houses?: Array<Record<string, unknown>>;
  aspects?: Array<Record<string, unknown>>;
  title?: string;
}): UnifiedChartData {
  const points: ChartPoint[] = (input.planets ?? []).map((planet, index) => {
    const longitude = toNumber(planet.longitude ?? planet.lon, 0);
    const label = String(planet.name ?? `Planet ${index + 1}`);
    return {
      id: label.toLowerCase().replace(/\s+/g, '-'),
      label,
      shortLabel: label.slice(0, 2),
      longitude,
      signName: String(planet.sign ?? signNameFromLongitude(longitude)),
      degreeInSign: longitude % 30,
      house: toNumber(planet.house, 0),
      isRetrograde: Boolean(planet.isRetrograde),
      meta: planet,
    };
  });

  const houses: ChartHouse[] = (input.houses ?? []).map((house, index) => {
    const cuspLongitude = toNumber(house.longitude ?? house.cusp, index * 30);
    return {
      number: toNumber(house.number, index + 1),
      cuspLongitude,
      signName: String(house.sign ?? signNameFromLongitude(cuspLongitude)),
    };
  });

  const aspects: ChartAspect[] = (input.aspects ?? []).map((aspect) => ({
    fromId: String(aspect.planet1 ?? '').toLowerCase().replace(/\s+/g, '-'),
    toId: String(aspect.planet2 ?? '').toLowerCase().replace(/\s+/g, '-'),
    type: String(aspect.type ?? 'unknown'),
    orb: toNumber(aspect.orb, 0),
    strength: toNumber(aspect.strength, 0.5),
    influence: (aspect.influence as ChartAspect['influence']) ?? 'neutral',
  }));

  return {
    id: 'western-natal',
    title: input.title ?? 'Western Natal Chart',
    system: 'western',
    layout: 'western-wheel',
    points,
    houses,
    aspects,
    tokens: {
      background: '#ffffff',
      ringStroke: '#3b82f6',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      accent: '#dc2626',
    },
    metadata: { source: 'western-adapter' },
  };
}

export function adaptVedicToUnified(input: {
  houses?: Array<Record<string, unknown>>;
  planets?: Record<string, Record<string, unknown>>;
  title?: string;
  layout?: 'vedic-north' | 'vedic-south' | 'nakshatra-wheel';
}): UnifiedChartData {
  const houses: ChartHouse[] = (input.houses ?? []).map((house, index) => {
    const cuspLongitude = toNumber(house.lon ?? house.longitude, index * 30);
    return {
      number: toNumber(house.house, index + 1),
      cuspLongitude,
      signName: String(house.signName ?? signNameFromLongitude(cuspLongitude)),
    };
  });

  const points: ChartPoint[] = Object.entries(input.planets ?? {}).map(([name, data]) => {
    const longitude = toNumber(data.lonSidereal ?? data.lon, 0);
    return {
      id: name.toLowerCase(),
      label: name,
      shortLabel: name.slice(0, 2),
      longitude,
      signName: String(data.signName ?? signNameFromLongitude(longitude)),
      degreeInSign: toNumber(data.degreeInSign, longitude % 30),
      house: toNumber(data.house, 0),
      isRetrograde: Boolean(data.retrograde),
      meta: data,
    };
  });

  return {
    id: 'vedic-rasi',
    title: input.title ?? 'Vedic Chart',
    system: input.layout === 'nakshatra-wheel' ? 'nakshatra' : 'vedic',
    layout: input.layout ?? 'vedic-north',
    points,
    houses,
    tokens: {
      background: '#ffffff',
      ringStroke: '#3b82f6',
      textPrimary: '#0f172a',
      textSecondary: '#64748b',
      accent: '#2563eb',
    },
    metadata: { source: 'vedic-adapter' },
  };
}

