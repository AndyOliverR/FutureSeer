/**
 * Risk scoring for mundane astrology: Economic Stress, Political Stability,
 * Conflict Risk, and Geopolitical Volatility Score.
 * Input: chart data (planets, houses, aspects). Output: bands for narrative.
 */

import type { MundaneChart } from './mundaneChartService';

const OUTER_PLANETS = new Set(['Saturn', 'Uranus', 'Neptune', 'Pluto']);
const HARD_ASPECTS = new Set(['square', 'opposition', 'conjunction']);
const ANGULAR_HOUSES = new Set([1, 4, 7, 10]);

function hasHardAspect(planet: string, aspects: { planet1: string; planet2: string; type: string }[]): boolean {
  const p = planet.toLowerCase();
  return aspects.some(
    (a) =>
      HARD_ASPECTS.has(a.type) &&
      (a.planet1.toLowerCase() === p || a.planet2.toLowerCase() === p)
  );
}

function isAngular(house: number): boolean {
  return ANGULAR_HOUSES.has(house);
}

function countOuterPlanetHardAspects(
  chart: MundaneChart
): number {
  let count = 0;
  for (const a of chart.aspects) {
    if (!HARD_ASPECTS.has(a.type)) continue;
  const p1 = a.planet1.charAt(0).toUpperCase() + a.planet1.slice(1).toLowerCase();
  const p2 = a.planet2.charAt(0).toUpperCase() + a.planet2.slice(1).toLowerCase();
  if (OUTER_PLANETS.has(p1) || OUTER_PLANETS.has(p2)) count += 1;
  }
  return count;
}

function countAngularActivations(chart: MundaneChart): number {
  let count = 0;
  for (const p of chart.planets) {
    if (isAngular(p.house)) count += 1;
    if (OUTER_PLANETS.has(p.name) && isAngular(p.house)) count += 1;
  }
  return count;
}

function getPlanetByName(chart: MundaneChart, name: string) {
  return chart.planets.find((p) => p.name.toLowerCase() === name.toLowerCase());
}

function getHouse(chart: MundaneChart, number: number) {
  return chart.houses.find((h) => h.number === number);
}

export interface RiskScores {
  economicStressIndex: number; // 0-100
  politicalStabilityIndex: number; // 0-100, higher = more stable
  conflictRiskScore: number; // 0-100
  geopoliticalVolatilityScore: number; // 0-100
  bands: {
    economic: 'low' | 'moderate' | 'elevated' | 'high';
    political: 'low' | 'moderate' | 'elevated' | 'high';
    conflict: 'low' | 'moderate' | 'elevated' | 'high';
  };
}

function toBand(score: number, invert = false): 'low' | 'moderate' | 'elevated' | 'high' {
  const s = invert ? 100 - score : score;
  if (s <= 25) return 'low';
  if (s <= 50) return 'moderate';
  if (s <= 75) return 'elevated';
  return 'high';
}

/**
 * Compute risk scores from a single primary chart (e.g. Aries Ingress).
 */
export function computeRiskScores(chart: MundaneChart, _eclipseProximity = 0): RiskScores {
  const outerHard = countOuterPlanetHardAspects(chart);
  const angular = countAngularActivations(chart);
  const eclipseFactor = Math.min(1, _eclipseProximity);

  // Economic: 2nd and 8th house emphasis, Saturn/Pluto/Jupiter
  const house2 = getHouse(chart, 2);
  const house8 = getHouse(chart, 8);
  const saturn = getPlanetByName(chart, 'Saturn');
  const pluto = getPlanetByName(chart, 'Pluto');
  const jupiter = getPlanetByName(chart, 'Jupiter');
  const planetsIn2 = chart.planets.filter((p) => p.house === 2).length;
  const planetsIn8 = chart.planets.filter((p) => p.house === 8).length;
  const saturnStress = saturn && hasHardAspect(saturn.name, chart.aspects) ? 25 : 0;
  const plutoStress = pluto && hasHardAspect(pluto.name, chart.aspects) ? 20 : 0;
  const economicStressIndex = Math.min(
    100,
    15 * (planetsIn2 + planetsIn8) + saturnStress + plutoStress + (jupiter && jupiter.house === 8 ? 15 : 0)
  );

  // Political stability: 10th house, Saturn/Uranus hard, Mars to angles
  const house10 = getHouse(chart, 10);
  const mars = getPlanetByName(chart, 'Mars');
  const uranus = getPlanetByName(chart, 'Uranus');
  const tenthStrength = house10 ? 30 : 0;
  const saturnUranusStress = (saturn && hasHardAspect(saturn.name, chart.aspects) ? 15 : 0) +
    (uranus && hasHardAspect(uranus.name, chart.aspects) ? 15 : 0);
  const marsAngular = mars && isAngular(mars.house) ? 25 : 0;
  const instability = Math.min(100, saturnUranusStress + marsAngular + (eclipseFactor * 20));
  const politicalStabilityIndex = Math.max(0, 100 - instability - (100 - tenthStrength) * 0.2);

  // Conflict risk: Mars-Uranus, Mars-Pluto, eclipses on 1/7
  const marsUranus = chart.aspects.some(
    (a) =>
      HARD_ASPECTS.has(a.type) &&
      ((a.planet1.toLowerCase() === 'mars' && a.planet2.toLowerCase() === 'uranus') ||
        (a.planet1.toLowerCase() === 'uranus' && a.planet2.toLowerCase() === 'mars'))
  );
  const marsPluto = chart.aspects.some(
    (a) =>
      HARD_ASPECTS.has(a.type) &&
      ((a.planet1.toLowerCase() === 'mars' && a.planet2.toLowerCase() === 'pluto') ||
        (a.planet1.toLowerCase() === 'pluto' && a.planet2.toLowerCase() === 'mars'))
  );
  const conflictRiskScore = Math.min(
    100,
    (marsUranus ? 35 : 0) + (marsPluto ? 35 : 0) + eclipseFactor * 30
  );

  // Geopolitical Volatility = outer planet hard aspects × angular activation × eclipse
  const volatilityRaw = (outerHard * 5 + angular * 3) * (1 + eclipseFactor);
  const geopoliticalVolatilityScore = Math.min(100, Math.round(volatilityRaw));

  return {
    economicStressIndex: Math.round(economicStressIndex),
    politicalStabilityIndex: Math.round(Math.max(0, politicalStabilityIndex)),
    conflictRiskScore: Math.round(conflictRiskScore),
    geopoliticalVolatilityScore,
    bands: {
      economic: toBand(economicStressIndex),
      political: toBand(politicalStabilityIndex, true),
      conflict: toBand(conflictRiskScore),
    },
  };
}
