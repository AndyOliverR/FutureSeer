/**
 * Celestine Bridge — MIT-licensed ephemeris engine wrapper
 *
 * Wraps the `celestine` npm package (validated against NASA/JPL Horizons & Swiss Ephemeris)
 * to provide FutureSeer with high-accuracy tropical planet positions, house cusps for
 * multiple house systems, aspects, dignities, and chart angles.
 *
 * This bridge does NOT replace the sidereal/Vedic pipeline (astronomia-vedic.ts), which
 * handles ayanamsha and nakshatra logic.  It augments it by:
 *   1. Offering Koch / Campanus / Regiomontanus / Porphyry houses (the existing code
 *      only supports Placidus + Whole-Sign + Equal).
 *   2. Providing a higher-accuracy tropical baseline that can be compared with the
 *      existing VSOP87-based tropicalCalculator for parity testing.
 *   3. Supplying retrograde detection, essential dignities, and aspect patterns
 *      out of the box.
 */

import {
  calculateChart,
  calculatePlanets,
  calculateHouseCusps,
  calculateAspects,
  type BirthData,
  type ChartOptions,
  type Chart,
  type ChartPlanet,
  type HouseSystem,
} from 'celestine';
import { devLog } from '@/lib/devLogger';

export type CelestineHouseSystem = HouseSystem;

export const SUPPORTED_HOUSE_SYSTEMS: CelestineHouseSystem[] = [
  'placidus',
  'koch',
  'equal',
  'whole-sign',
  'porphyry',
  'regiomontanus',
  'campanus',
];

export interface CelestineBirthInput {
  date: Date;
  latitude: number;
  longitude: number;
  timezoneOffsetHours?: number;
}

function dateToBirthData(input: CelestineBirthInput): BirthData {
  const d = input.date;
  const tz = input.timezoneOffsetHours ?? -(d.getTimezoneOffset() / 60);

  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    second: d.getUTCSeconds(),
    timezone: tz,
    latitude: input.latitude,
    longitude: input.longitude,
  };
}

/**
 * Calculate a full chart via Celestine.
 * Returns planets, houses, aspects, patterns, angles, dignities — everything.
 */
export function celestineFullChart(
  input: CelestineBirthInput,
  options?: ChartOptions
): Chart {
  const birth = dateToBirthData(input);
  const opts: ChartOptions = {
    houseSystem: 'placidus',
    includeChiron: true,
    includeAsteroids: false,
    includeNodes: 'true',
    includeLilith: 'mean',
    ...options,
  };

  try {
    return calculateChart(birth, opts);
  } catch (err) {
    devLog.error('celestineFullChart failed:', err, 'celestine-bridge');
    throw err;
  }
}

/**
 * Get tropical planet positions only (no houses/aspects).
 * Useful when you just need longitudes to apply your own ayanamsha.
 */
export function celestinePlanets(
  input: CelestineBirthInput,
  options?: Partial<ChartOptions>
): ChartPlanet[] {
  const birth = dateToBirthData(input);
  try {
    return calculatePlanets(birth, options);
  } catch (err) {
    devLog.error('celestinePlanets failed:', err, 'celestine-bridge');
    throw err;
  }
}

export interface CelestineHouseResult {
  system: CelestineHouseSystem;
  cusps: number[];
  ascendant: number;
  midheaven: number;
  descendant: number;
  imumCoeli: number;
}

/**
 * Calculate house cusps for a specific house system.
 * Returns an array of 12 cusp longitudes + angles.
 */
export function celestineHouses(
  input: CelestineBirthInput,
  system: CelestineHouseSystem = 'placidus'
): CelestineHouseResult {
  const birth = dateToBirthData(input);
  try {
    const result = calculateHouseCusps(birth, { houseSystem: system });

    const cusps = result.houses.cusps.map((c: { longitude: number }) => c.longitude);

    return {
      system,
      cusps,
      ascendant: result.angles.ascendant.longitude,
      midheaven: result.angles.midheaven.longitude,
      descendant: result.angles.descendant.longitude,
      imumCoeli: result.angles.imumCoeli.longitude,
    };
  } catch (err) {
    devLog.error(`celestineHouses (${system}) failed:`, err, 'celestine-bridge');
    throw err;
  }
}

/**
 * Calculate house cusps for ALL supported systems at once.
 * Useful for comparison views and the multi-system house display.
 */
export function celestineAllHouseSystems(
  input: CelestineBirthInput
): Record<CelestineHouseSystem, CelestineHouseResult> {
  const result = {} as Record<CelestineHouseSystem, CelestineHouseResult>;

  for (const system of SUPPORTED_HOUSE_SYSTEMS) {
    try {
      result[system] = celestineHouses(input, system);
    } catch {
      devLog.warn(`House system "${system}" failed for lat=${input.latitude}`, undefined, 'celestine-bridge');
    }
  }

  return result;
}

/**
 * Convert a Celestine ChartPlanet array to the format the existing
 * tropicalCalculator returns, so downstream code stays unchanged.
 */
export function celestinePlanetsToLegacyFormat(planets: ChartPlanet[]): Record<string, {
  longitude: number;
  latitude: number;
  distance: number;
  speed: number;
}> {
  const nameMap: Record<string, string> = {
    Sun: 'sun',
    Moon: 'moon',
    Mercury: 'mercury',
    Venus: 'venus',
    Mars: 'mars',
    Jupiter: 'jupiter',
    Saturn: 'saturn',
    Uranus: 'uranus',
    Neptune: 'neptune',
    Pluto: 'pluto',
    Chiron: 'chiron',
    'North Node': 'northNode',
    'South Node': 'southNode',
    'True Node': 'northNode',
    'Mean Node': 'northNode',
  };

  const legacy: Record<string, { longitude: number; latitude: number; distance: number; speed: number }> = {};

  for (const p of planets) {
    const key = nameMap[p.name];
    if (!key) continue;
    legacy[key] = {
      longitude: p.longitude,
      latitude: p.latitude,
      distance: p.distance,
      speed: p.longitudeSpeed,
    };
  }

  if (legacy.northNode && !legacy.southNode) {
    const norm360 = (deg: number) => ((deg % 360) + 360) % 360;
    legacy.southNode = {
      longitude: norm360(legacy.northNode.longitude + 180),
      latitude: -legacy.northNode.latitude,
      distance: legacy.northNode.distance,
      speed: legacy.northNode.speed,
    };
  }

  return legacy;
}

/**
 * Convert a Celestine house result to the format the existing
 * calculateTropicalHouses returns.
 */
export function celestineHousesToLegacyFormat(
  houses: CelestineHouseResult
): { number: number; longitude: number; sign: string; degree: number }[] {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
  ];

  const norm360 = (deg: number) => ((deg % 360) + 360) % 360;

  return houses.cusps.map((lon, i) => {
    const nLon = norm360(lon);
    return {
      number: i + 1,
      longitude: nLon,
      sign: signs[Math.floor(nLon / 30)],
      degree: nLon % 30,
    };
  });
}
