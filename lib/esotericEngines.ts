/**
 * Esoteric astrology engines: Cross dominance, veiled planets, Vulcan, triangles.
 * Alice Bailey / Arcane School framework.
 */

import { getModality, type CrossLabel, EVOLUTIONARY_STAGE_BY_CROSS } from './esotericAstrologyData';

const CONJUNCTION_ORB_DEG = 8;

/** Planet position for engines (name, longitude, sign). */
export interface PlanetPosition {
  name: string;
  longitude?: number;
  sign?: { signName?: string } | string;
}

function getSignName(p: PlanetPosition): string {
  const s = p.sign;
  return (s && (typeof s === 'string' ? s : (s as { signName?: string }).signName)) || '';
}

/** Count planets in Cardinal / Fixed / Mutable; return dominant cross and evolutionary stage. */
export function computeCrossDominant(planets: PlanetPosition[]): {
  dominant: CrossLabel;
  counts: { Cardinal: number; Fixed: number; Mutable: number };
  evolutionaryStage: string;
} {
  const counts = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  for (const p of planets) {
    const sign = getSignName(p);
    const mod = getModality(sign);
    if (mod) counts[mod]++;
  }
  const max = Math.max(counts.Cardinal, counts.Fixed, counts.Mutable);
  let dominant: CrossLabel = 'Mutable';
  if (counts.Cardinal === max && max > 0) dominant = 'Cardinal';
  else if (counts.Fixed === max && max > 0) dominant = 'Fixed';
  else if (counts.Mutable === max && max > 0) dominant = 'Mutable';
  else if (counts.Cardinal >= counts.Fixed && counts.Cardinal >= counts.Mutable) dominant = 'Cardinal';
  else if (counts.Fixed >= counts.Mutable) dominant = 'Fixed';
  return {
    dominant,
    counts,
    evolutionaryStage: EVOLUTIONARY_STAGE_BY_CROSS[dominant],
  };
}

/** Normalize longitude to 0–360. */
function norm360(lon: number): number {
  return ((lon % 360) + 360) % 360;
}

/** Check if two longitudes are in conjunction within orb. */
function inConjunction(lon1: number, lon2: number, orbDeg: number = CONJUNCTION_ORB_DEG): boolean {
  const d = Math.abs(norm360(lon1) - norm360(lon2));
  return d <= orbDeg || d >= 360 - orbDeg;
}

/** Get longitude from planet data. */
function getLongitude(p: PlanetPosition): number | null {
  if (typeof p.longitude === 'number') return p.longitude;
  return null;
}

/** Detect planets veiled by Sun or Moon (conjunction within orb). */
export function computeVeiledPlanets(planets: PlanetPosition[], orbDeg: number = CONJUNCTION_ORB_DEG): {
  veiledBySun: string[];
  veiledByMoon: string[];
} {
  const sun = planets.find((p) => p.name === 'Sun');
  const moon = planets.find((p) => p.name === 'Moon');
  const sunLon = sun ? getLongitude(sun) : null;
  const moonLon = moon ? getLongitude(moon) : null;
  const veiledBySun: string[] = [];
  const veiledByMoon: string[] = [];
  const veilCandidates = ['Vulcan', 'Neptune', 'Uranus'];
  for (const p of planets) {
    const name = p.name;
    if (!name || name === 'Sun' || name === 'Moon') continue;
    const lon = getLongitude(p);
    if (lon == null) continue;
    if (sunLon != null && veilCandidates.includes(name) && inConjunction(lon, sunLon, orbDeg)) {
      veiledBySun.push(name);
    }
    if (moonLon != null && veilCandidates.includes(name) && inConjunction(lon, moonLon, orbDeg)) {
      veiledByMoon.push(name);
    }
  }
  return { veiledBySun, veiledByMoon };
}

/** Add Vulcan at Sun longitude (hypothetical; esoteric convention). */
export function addVulcanToPlanets(planets: PlanetPosition[]): PlanetPosition[] {
  const sun = planets.find((p) => p.name === 'Sun');
  if (!sun) return planets;
  const sunLon = getLongitude(sun);
  const hasVulcan = planets.some((p) => p.name === 'Vulcan');
  if (hasVulcan || sunLon == null) return planets;
  const vulcan: PlanetPosition = {
    name: 'Vulcan',
    longitude: sunLon,
    sign: sun.sign,
  };
  return [...planets, vulcan];
}

/** Triangles (cosmic centers / energy circuits) – Alice Bailey. Aries–Leo–Capricorn etc. */
const TRIANGLES: { name: string; signs: string[] }[] = [
  { name: 'Aries–Leo–Capricorn (1st Ray)', signs: ['Aries', 'Leo', 'Capricorn'] },
  { name: 'Gemini–Virgo–Pisces (2nd Ray)', signs: ['Gemini', 'Virgo', 'Pisces'] },
  { name: 'Cancer–Libra–Capricorn (3rd Ray)', signs: ['Cancer', 'Libra', 'Capricorn'] },
  { name: 'Taurus–Scorpio–Sagittarius (4th Ray)', signs: ['Taurus', 'Scorpio', 'Sagittarius'] },
  { name: 'Leo–Sagittarius–Aquarius (5th Ray)', signs: ['Leo', 'Sagittarius', 'Aquarius'] },
  { name: 'Virgo–Sagittarius–Pisces (6th Ray)', signs: ['Virgo', 'Sagittarius', 'Pisces'] },
  { name: 'Aries–Cancer–Capricorn (7th Ray)', signs: ['Aries', 'Cancer', 'Capricorn'] },
];

/** Count planets per triangle; return emphasis list (name + count). */
export function computeTriangleEmphasis(planets: PlanetPosition[]): { name: string; count: number }[] {
  const out: { name: string; count: number }[] = [];
  for (const tri of TRIANGLES) {
    let count = 0;
    for (const p of planets) {
      const sign = getSignName(p).trim();
      if (tri.signs.some((s) => s.toLowerCase() === sign.toLowerCase())) count++;
    }
    out.push({ name: tri.name, count });
  }
  return out.sort((a, b) => b.count - a.count);
}
