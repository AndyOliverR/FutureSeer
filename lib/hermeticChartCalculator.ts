/**
 * Hermetic Chart Calculator
 * Computes Sect (Day/Night), Lot of Fortune, Lot of Spirit, Chart Ruler
 * Uses Whole Sign houses and Sect-aware Lot formulas.
 */

import { getTropicalSign, getDegreeInSign } from '@/lib/western/tropicalCalculator';

const norm360 = (deg: number) => ((deg % 360) + 360) % 360;

const SIGNS = [
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
] as const;

const PLANETARY_RULERS: Record<string, string> = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Mercury',
  Libra: 'Venus',
  Scorpio: 'Mars',
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Saturn',
  Pisces: 'Jupiter',
};

export interface SectResult {
  type: 'day' | 'night';
  sectLeader: string;
  benefic: string;
  malefic: string;
}

export interface LotResult {
  sign: string;
  degree: number;
  longitude: number;
  house: number;
}

/**
 * Determine planetary sect (Day vs Night chart)
 * Day: Sun in houses 7–12 (above horizon). Night: Sun in houses 1–6 (below horizon)
 */
export function determineSect(
  sunLongitude: number,
  ascendantLongitude: number,
  _latitude?: number,
  _birthDate?: Date
): SectResult {
  const ascSign = getTropicalSign(ascendantLongitude);
  const sunSign = getTropicalSign(sunLongitude);
  const ascIndex = SIGNS.indexOf(ascSign as (typeof SIGNS)[number]);
  const sunIndex = SIGNS.indexOf(sunSign as (typeof SIGNS)[number]);
  const sunHouse = ((sunIndex - ascIndex + 12) % 12) + 1;
  const isDayChart = sunHouse >= 7;

  if (isDayChart) {
    return {
      type: 'day',
      sectLeader: 'Sun',
      benefic: 'Jupiter',
      malefic: 'Mars',
    };
  }
  return {
    type: 'night',
    sectLeader: 'Moon',
    benefic: 'Venus',
    malefic: 'Saturn',
  };
}

/**
 * Lot of Fortune (Your Body & Fate)
 * Day: Asc + Moon - Sun. Night: Asc + Sun - Moon
 */
export function calculateLotOfFortune(
  sunLongitude: number,
  moonLongitude: number,
  ascendantLongitude: number,
  isDayChart: boolean
): LotResult {
  let partLongitude: number;
  if (isDayChart) {
    partLongitude = ascendantLongitude + moonLongitude - sunLongitude;
  } else {
    partLongitude = ascendantLongitude + sunLongitude - moonLongitude;
  }
  partLongitude = norm360(partLongitude);
  const sign = getTropicalSign(partLongitude);
  const degree = getDegreeInSign(partLongitude);
  const house = getWholeSignHouse(partLongitude, ascendantLongitude);
  return { sign, degree, longitude: partLongitude, house };
}

/**
 * Lot of Spirit (Your Will & Career)
 * Day: Asc + Sun - Moon. Night: Asc + Moon - Sun
 */
export function calculateLotOfSpirit(
  sunLongitude: number,
  moonLongitude: number,
  ascendantLongitude: number,
  isDayChart: boolean
): LotResult {
  let partLongitude: number;
  if (isDayChart) {
    partLongitude = ascendantLongitude + sunLongitude - moonLongitude;
  } else {
    partLongitude = ascendantLongitude + moonLongitude - sunLongitude;
  }
  partLongitude = norm360(partLongitude);
  const sign = getTropicalSign(partLongitude);
  const degree = getDegreeInSign(partLongitude);
  const house = getWholeSignHouse(partLongitude, ascendantLongitude);
  return { sign, degree, longitude: partLongitude, house };
}

/**
 * Chart Ruler (The Helmsman) — planet ruling the Ascendant sign
 */
export function getChartRuler(ascendantSign: string): string {
  const sign = ascendantSign.trim();
  return PLANETARY_RULERS[sign] ?? 'Unknown';
}

/**
 * Whole Sign house for a longitude (Ascendant = House 1)
 */
export function getWholeSignHouse(longitude: number, ascendantLongitude: number): number {
  const ascSign = getTropicalSign(ascendantLongitude);
  const pointSign = getTropicalSign(longitude);
  const ascIndex = SIGNS.indexOf(ascSign as (typeof SIGNS)[number]);
  const pointIndex = SIGNS.indexOf(pointSign as (typeof SIGNS)[number]);
  return ((pointIndex - ascIndex + 12) % 12) + 1;
}
