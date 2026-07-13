/**
 * Live sky positions from the in-app tropical ephemeris (Astronomia / VSOP).
 * Used for Western transit overlays — not mock sine-wave approximations.
 */

import {
  calculateTropicalPlanets,
  getDegreeInSign,
  getTropicalSign,
} from '@/lib/western/tropicalCalculator';

export interface SkyBodyPosition {
  name: string;
  longitude: number;
  latitude: number;
  speed: number;
  isRetrograde: boolean;
  sign: string;
  degree: number;
  house?: number;
}

const BODY_KEYS = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
] as const;

const DISPLAY_NAMES: Record<(typeof BODY_KEYS)[number], string> = {
  sun: 'Sun',
  moon: 'Moon',
  mercury: 'Mercury',
  venus: 'Venus',
  mars: 'Mars',
  jupiter: 'Jupiter',
  saturn: 'Saturn',
  uranus: 'Uranus',
  neptune: 'Neptune',
  pluto: 'Pluto',
};

type TropicalBody = {
  longitude: number;
  latitude?: number;
  speed?: number;
};

/** Current tropical longitudes for standard transit planets (UTC `date`). */
export function getTropicalSkyBodies(date: Date = new Date()): SkyBodyPosition[] {
  const raw = calculateTropicalPlanets(date);
  return BODY_KEYS.map((key) => {
    const body = raw[key] as TropicalBody;
    const longitude = body.longitude;
    const speed = typeof body.speed === 'number' ? body.speed : 0;
    return {
      name: DISPLAY_NAMES[key],
      longitude,
      latitude: body.latitude ?? 0,
      speed,
      isRetrograde: speed < 0,
      sign: getTropicalSign(longitude),
      degree: getDegreeInSign(longitude),
      house: 0,
    };
  });
}
