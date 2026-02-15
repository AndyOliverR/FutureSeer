/**
 * Western Astrology Report Chunks — queryable schema for retrieval-only Seer.
 * One structured report the Seer reads from; never recalculates.
 */

/** Single placement chunk (Sun, Moon, Ascendant). */
export interface WesternPlacementChunk {
  sign: string;
  house?: number;
  meaning: string;
}

/** Section chunk (career, relationships, etc.). */
export interface WesternSectionChunk {
  summary: string;
  indicators: string[];
}

/** Full chunked report — intent maps to these keys for retrieval. */
export interface WesternReportChunks {
  sun: WesternPlacementChunk;
  moon: WesternPlacementChunk;
  ascendant: WesternPlacementChunk;
  career: WesternSectionChunk;
  relationships: WesternSectionChunk;
  personality: WesternSectionChunk;
  health: WesternSectionChunk;
  timing: WesternSectionChunk;
  general: WesternSectionChunk & { chartOverview?: string };
}

export type WesternChunkKey = keyof WesternReportChunks;

/** Comprehensive Western API output shape (from western-astrology/comprehensive). */
export interface ComprehensiveWesternAnalysis {
  chartOverview?: string;
  planetaryAnalysis?: Array<{ planet: string; analysis: string }>;
  houseAnalysis?: Array<{ house: number; analysis: string }>;
  aspectAnalysis?: Array<{ aspect: string; analysis: string }>;
  transitAnalysis?: string;
  predictiveInsights?: {
    todaysQuickWin?: string;
    currentWeek?: string;
    currentMonth?: string;
    currentYear?: string;
    nextYearSneakPeek?: string;
    longerTermCycles?: string;
  } | string;
}

/** Raw chart data for sign/house extraction. */
export interface WesternChartDataForChunks {
  planets?: Array<{
    name?: string;
    sign?: { signName?: string } | string;
    house?: number;
  }>;
  houses?: Array<{
    number?: number;
    sign?: { signName?: string } | string;
  }>;
}

function getSign(o: { signName?: string } | { sign?: { signName?: string } } | string | undefined): string {
  if (!o) return 'Unknown';
  if (typeof o === 'string') return o;
  const obj = o as Record<string, unknown>;
  if (typeof (obj as { signName?: string }).signName === 'string') return (obj as { signName: string }).signName;
  const sign = (obj as { sign?: { signName?: string } }).sign;
  return sign?.signName ?? 'Unknown';
}

/**
 * Transforms comprehensive Western report + chart data into queryable chunks.
 * Call when saving the comprehensive report so the Seer can retrieve by intent.
 */
export function transformComprehensiveToChunks(
  comprehensive: ComprehensiveWesternAnalysis,
  chartData?: WesternChartDataForChunks
): WesternReportChunks {
  const planets = comprehensive.planetaryAnalysis ?? [];
  const houses = comprehensive.houseAnalysis ?? [];
  const aspects = comprehensive.aspectAnalysis ?? [];
  const rawPlanets = chartData?.planets ?? [];
  const rawHouses = chartData?.houses ?? [];

  const sunPlanet = rawPlanets.find((p) => (p.name || '').toLowerCase() === 'sun');
  const moonPlanet = rawPlanets.find((p) => (p.name || '').toLowerCase() === 'moon');
  const risingHouse = rawHouses[0] || rawHouses.find((h, i) => (h.number ?? i + 1) === 1);

  const sunAnalysis = planets.find((p) => p.planet?.toLowerCase() === 'sun')?.analysis ?? '';
  const moonAnalysis = planets.find((p) => p.planet?.toLowerCase() === 'moon')?.analysis ?? '';
  const house1 = houses.find((h) => h.house === 1)?.analysis ?? '';

  const house7 = houses.find((h) => h.house === 7)?.analysis ?? '';
  const house10 = houses.find((h) => h.house === 10)?.analysis ?? '';
  const house6 = houses.find((h) => h.house === 6)?.analysis ?? '';
  const house8 = houses.find((h) => h.house === 8)?.analysis ?? '';

  const predictive =
    typeof comprehensive.predictiveInsights === 'object' && comprehensive.predictiveInsights
      ? comprehensive.predictiveInsights
      : null;
  const timingParts: string[] = [];
  if (predictive?.todaysQuickWin) timingParts.push(predictive.todaysQuickWin);
  if (predictive?.currentWeek) timingParts.push(predictive.currentWeek);
  if (predictive?.currentMonth) timingParts.push(predictive.currentMonth);
  if (predictive?.currentYear) timingParts.push(predictive.currentYear);
  if (comprehensive.transitAnalysis) timingParts.push(comprehensive.transitAnalysis);

  const aspectIndicators = aspects.slice(0, 8).map((a) => a.aspect || '').filter(Boolean);

  const chartOverview = comprehensive.chartOverview ?? '';

  return {
    sun: {
      sign: getSign(sunPlanet?.sign),
      house: sunPlanet?.house != null ? Number(sunPlanet.house) : undefined,
      meaning: sunAnalysis || `Sun in ${getSign(sunPlanet?.sign)}${sunPlanet?.house != null ? `, House ${sunPlanet.house}` : ''}.`
    },
    moon: {
      sign: getSign(moonPlanet?.sign),
      house: moonPlanet?.house != null ? Number(moonPlanet.house) : undefined,
      meaning: moonAnalysis || `Moon in ${getSign(moonPlanet?.sign)}${moonPlanet?.house != null ? `, House ${moonPlanet.house}` : ''}.`
    },
    ascendant: {
      sign: getSign(risingHouse?.sign),
      meaning: house1 || `Ascendant in ${getSign(risingHouse?.sign)}.`
    },
    career: {
      summary: house10 || 'Career and public life themes from your 10th house.',
      indicators: [
        ...(sunPlanet?.house === 10 ? ['Sun in 10th house'] : []),
        ...aspectIndicators.filter((a) => /Sun|Saturn|10th|Midheaven/i.test(a))
      ].slice(0, 6)
    },
    relationships: {
      summary: house7 || 'Partnership and relationship themes from your 7th house.',
      indicators: [
        ...aspectIndicators.filter((a) => /Venus|Mars|Moon|7th/i.test(a)),
        '7th house'
      ].slice(0, 6)
    },
    personality: {
      summary: chartOverview || 'Overall character and identity from your chart.',
      indicators: ['Big Three', 'Sun', 'Moon', 'Ascendant', ...aspectIndicators.slice(0, 3)]
    },
    health: {
      summary: [house6, house8].filter(Boolean).join(' ') || 'Health and vitality themes from 6th and 8th houses.',
      indicators: ['6th house', '8th house', ...aspectIndicators.filter((a) => /Mars|Neptune|Saturn/i.test(a)).slice(0, 3)]
    },
    timing: {
      summary: timingParts.join(' ') || (comprehensive.transitAnalysis ?? 'Current transits and timing.'),
      indicators: ['current transits', 'predictive insights', predictive?.currentYear ? 'current year' : ''].filter(Boolean)
    },
    general: {
      summary: chartOverview,
      chartOverview,
      indicators: ['chart overview', 'planetary positions', 'house themes']
    }
  };
}
