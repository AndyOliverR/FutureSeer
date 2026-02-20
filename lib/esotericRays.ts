/**
 * Seven Rays (Alice Bailey / Arcane School) – sign/planet mappings and Ray engine.
 * References: Esoteric Astrology (Bailey), EsotericAstrology.org, Astrolog Ray weights.
 */

import {
  type ZodiacSign,
  normalizeSign,
  getEsotericRuler,
  getExotericRuler,
} from './esotericAstrologyData';

export type RayNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const RAY_LABELS: Record<RayNumber, string> = {
  1: 'Will/Power',
  2: 'Love/Wisdom',
  3: 'Active Intelligence',
  4: 'Harmony through Conflict',
  5: 'Concrete Knowledge',
  6: 'Devotion/Idealism',
  7: 'Ceremonial Order',
};

/** Primary Ray of each sign (Alice Bailey – triangle/ruler alignment). */
export const RAY_BY_SIGN: Record<ZodiacSign, RayNumber> = {
  Aries: 1,
  Taurus: 4,
  Gemini: 2,
  Cancer: 3,
  Leo: 1,
  Virgo: 2,
  Libra: 3,
  Scorpio: 4,
  Sagittarius: 6,
  Capricorn: 1,
  Aquarius: 5,
  Pisces: 2,
};

/** Primary Ray of each planet (Alice Bailey). */
const RAY_BY_PLANET: Record<string, RayNumber> = {
  Sun: 2,
  Moon: 4,
  Mercury: 4,
  Venus: 5,
  Mars: 6,
  Jupiter: 2,
  Saturn: 3,
  Uranus: 7,
  Neptune: 6,
  Pluto: 1,
  Vulcan: 1,
  Earth: 3,
  'North Node': 3,
  'South Node': 3,
  'True North Node': 3,
  'True South Node': 3,
};

/** Normalize planet name for lookup. */
function normalizePlanet(name: string | undefined | null): string | null {
  if (!name || typeof name !== 'string') return null;
  const t = name.trim();
  if (/north\s*node/i.test(t)) return 'North Node';
  if (/south\s*node/i.test(t)) return 'South Node';
  return t;
}

/** Get primary Ray for a sign (1–7). */
export function getRayForSign(sign: string | undefined | null): RayNumber | null {
  const s = normalizeSign(sign);
  return s ? RAY_BY_SIGN[s] : null;
}

/** Get primary Ray for a planet. */
export function getRayForPlanet(planetName: string | undefined | null): RayNumber | null {
  const p = normalizePlanet(planetName);
  if (!p) return null;
  const ray = RAY_BY_PLANET[p];
  if (ray) return ray;
  const cap = p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
  return RAY_BY_PLANET[cap] ?? null;
}

/** Soul Ray: hypothesized from Sun sign (and optionally esoteric ruler of Sun). */
export function computeSoulRay(sunSign: string | undefined | null): { ray: RayNumber; label: string } {
  const ray = getRayForSign(sunSign) ?? 2;
  return { ray, label: `${ray} – ${RAY_LABELS[ray]}` };
}

/** Personality Ray: from Ascendant sign and/or orthodox ruler of Ascendant. */
export function computePersonalityRay(ascendantSign: string | undefined | null): {
  ray: RayNumber;
  label: string;
} {
  const signRay = getRayForSign(ascendantSign);
  const orthodoxRuler = getExotericRuler(ascendantSign);
  const rulerRay = getRayForPlanet(orthodoxRuler);
  const ray = signRay ?? rulerRay ?? 4;
  return { ray, label: `${ray} – ${RAY_LABELS[ray]}` };
}

/** Weighted Ray scores from Sun, Ascendant, esoteric ruler of Ascendant, Moon. */
export function computeRayWeights(params: {
  sunSign?: string | null;
  ascendantSign?: string | null;
  moonSign?: string | null;
}): { dominant: RayNumber; label: string; scores: Record<RayNumber, number> } {
  const scores: Record<RayNumber, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
  };
  const { sunSign, ascendantSign, moonSign } = params;
  const sunRay = getRayForSign(sunSign);
  const ascRay = getRayForSign(ascendantSign);
  const esotericRuler = getEsotericRuler(ascendantSign);
  const esotericRulerRay = getRayForPlanet(esotericRuler);
  const moonRay = getRayForSign(moonSign);
  if (sunRay) scores[sunRay] += 2;
  if (ascRay) scores[ascRay] += 2;
  if (esotericRulerRay) scores[esotericRulerRay] += 1.5;
  if (moonRay) scores[moonRay] += 1;
  let maxScore = 0;
  let dominant: RayNumber = 2;
  for (let r = 1; r <= 7; r++) {
    const rr = r as RayNumber;
    if (scores[rr] > maxScore) {
      maxScore = scores[rr];
      dominant = rr;
    }
  }
  return {
    dominant,
    label: `${dominant} – ${RAY_LABELS[dominant]}`,
    scores,
  };
}
