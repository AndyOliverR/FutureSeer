/**
 * Mundane chart service: build tropical chart for a given moment and location.
 * Uses existing tropical calculator (planets, houses, aspects).
 */

import {
  calculateTropicalPlanets,
  calculateTropicalHouses,
  calculateTropicalAspects,
  getTropicalSign,
  getDegreeInSign,
} from '@/lib/western/tropicalCalculator';

const NORM360 = (d: number) => ((d % 360) + 360) % 360;

export interface PlanetInChart {
  name: string;
  longitude: number;
  sign: string;
  degree: number;
  house: number;
  isRetrograde?: boolean;
}

export interface HouseInChart {
  number: number;
  longitude: number;
  sign: string;
  degree: number;
}

export interface AspectInChart {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  strength?: number;
}

export interface MundaneChart {
  datetime: Date;
  latitude: number;
  longitude: number;
  planets: PlanetInChart[];
  houses: HouseInChart[];
  aspects: AspectInChart[];
  ascendant: { longitude: number; sign: string; degree: number };
  midheaven: { longitude: number; sign: string; degree: number };
}

function getHouseForLongitude(planetLongitude: number, houses: { number: number; longitude: number }[]): number {
  const sorted = [...houses].sort((a, b) => a.number - b.number);
  const lon = NORM360(planetLongitude);
  for (let i = 0; i < sorted.length; i++) {
    const cuspI = NORM360(sorted[i].longitude);
    const nextIdx = i + 1 < sorted.length ? i + 1 : 0;
    const cuspNext = NORM360(sorted[nextIdx].longitude);
    let arcStart = cuspI;
    let arcEnd = cuspNext;
    if (arcEnd <= arcStart) arcEnd += 360;
    const lonAdj = lon < arcStart ? lon + 360 : lon;
    if (lonAdj >= arcStart && lonAdj < arcEnd) return sorted[i].number;
  }
  return 1;
}

/**
 * Build a tropical chart for the given moment and location (e.g. Aries Ingress at capital).
 */
export function buildMundaneChart(datetime: Date, latitude: number, longitude: number): MundaneChart {
  const planetsRaw = calculateTropicalPlanets(datetime);
  const housesRaw = calculateTropicalHouses(datetime, latitude, longitude);
  const aspectsRaw = calculateTropicalAspects(planetsRaw);

  const houseList = housesRaw.map((h: { number: number; longitude: number; sign: string; degree: number }) => ({
    number: h.number,
    longitude: NORM360(h.longitude),
    sign: h.sign,
    degree: h.degree,
  }));

  const planetLabels: Record<string, string> = {
    sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
    jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto',
    northNode: 'North Node', southNode: 'South Node',
  };
  const planetKeys = Object.keys(planetLabels);
  const planets: PlanetInChart[] = planetKeys
    .filter((k) => planetsRaw[k as keyof typeof planetsRaw])
    .map((key) => {
      const p = planetsRaw[key as keyof typeof planetsRaw];
      const lon = NORM360(p.longitude);
      return {
        name: planetLabels[key],
        longitude: lon,
        sign: getTropicalSign(lon),
        degree: getDegreeInSign(lon),
        house: getHouseForLongitude(lon, houseList),
        isRetrograde: p.speed != null && p.speed < 0,
      };
    });

  const ascLong = houseList[0]?.longitude ?? 0;
  const mcHouse = houseList.find((h) => h.number === 10);
  const mcLong = mcHouse?.longitude ?? NORM360(ascLong + 90);

  const aspects: AspectInChart[] = aspectsRaw.map((a: { planet1: string; planet2: string; type: string; orb: number; strength?: number }) => ({
    planet1: a.planet1,
    planet2: a.planet2,
    type: a.type,
    orb: a.orb,
    strength: a.strength,
  }));

  return {
    datetime,
    latitude,
    longitude,
    planets,
    houses: houseList,
    aspects,
    ascendant: { longitude: ascLong, sign: getTropicalSign(ascLong), degree: getDegreeInSign(ascLong) },
    midheaven: { longitude: mcLong, sign: getTropicalSign(mcLong), degree: getDegreeInSign(mcLong) },
  };
}
