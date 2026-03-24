/**
 * Shared tropical ephemeris for HTTP routes: same Astronomia/VSOP pipeline as the rest of the app.
 * Not Swiss Ephemeris binaries — aligns API output with `lib/western/tropicalCalculator.ts`.
 */

import { birthLocalToUTC } from '@/lib/birthDateTimeToUTC';
import {
  calculateTropicalPlanets,
  calculateTropicalHouses,
  getTropicalSign,
  getDegreeInSign
} from '@/lib/western/tropicalCalculator';

export interface BirthDataPayload {
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
}

export function birthPayloadToUtcDate(birthData: BirthDataPayload): Date {
  return birthLocalToUTC(birthData.birthDate, birthData.birthTime, {
    latitude: birthData.latitude,
    longitude: birthData.longitude,
    birthPlace: birthData.birthPlace
  });
}

export interface ApiPlanetRow {
  name: string;
  longitude: number;
  latitude: number;
  distance: number;
  speed: number;
  sign: string;
  degree: number;
  minute: number;
  second: number;
}

function rowFromLon(
  name: string,
  longitude: number,
  latitude: number,
  distance: number,
  speed: number
): ApiPlanetRow {
  const lon = ((longitude % 360) + 360) % 360;
  const degInSign = getDegreeInSign(lon);
  const degFloor = Math.floor(degInSign);
  const minFloat = (degInSign - degFloor) * 60;
  const minute = Math.floor(minFloat);
  const second = Math.floor((minFloat - minute) * 60);
  return {
    name,
    longitude: lon,
    latitude,
    distance,
    speed,
    sign: getTropicalSign(lon),
    degree: degFloor,
    minute,
    second
  };
}

/** Flatten `calculateTropicalPlanets` into API rows (includes Chiron when present). */
export function tropicalSnapshotToPlanetRows(
  tropical: ReturnType<typeof calculateTropicalPlanets>
): ApiPlanetRow[] {
  const pairs: [keyof typeof tropical, string][] = [
    ['sun', 'Sun'],
    ['moon', 'Moon'],
    ['mercury', 'Mercury'],
    ['venus', 'Venus'],
    ['mars', 'Mars'],
    ['jupiter', 'Jupiter'],
    ['saturn', 'Saturn'],
    ['uranus', 'Uranus'],
    ['neptune', 'Neptune'],
    ['pluto', 'Pluto'],
    ['chiron', 'Chiron'],
    ['northNode', 'North Node'],
    ['southNode', 'South Node']
  ];
  const out: ApiPlanetRow[] = [];
  for (const [key, label] of pairs) {
    const p = tropical[key];
    if (!p || typeof p.longitude !== 'number') continue;
    out.push(
      rowFromLon(label, p.longitude, p.latitude ?? 0, p.distance ?? 0, p.speed ?? 0)
    );
  }
  return out;
}

export interface ApiHouseRow {
  number: number;
  longitude: number;
  latitude: number;
  sign: string;
  degree: number;
  minute: number;
  second: number;
}

function houseRow(h: { number: number; longitude: number; sign: string; degree: number }): ApiHouseRow {
  const degInSign = getDegreeInSign(h.longitude);
  const degFloor = Math.floor(degInSign);
  const minFloat = (degInSign - degFloor) * 60;
  const minute = Math.floor(minFloat);
  const second = Math.floor((minFloat - minute) * 60);
  return {
    number: h.number,
    longitude: h.longitude,
    latitude: 0,
    sign: h.sign,
    degree: degFloor,
    minute,
    second
  };
}

/** Tropical Placidus from shared engine (same as Western tool). */
export function tropicalPlacidusHousesForApi(
  birthData: BirthDataPayload,
  eventDate: Date
): ApiHouseRow[] {
  const raw = calculateTropicalHouses(eventDate, birthData.latitude, birthData.longitude);
  return [...raw].sort((a, b) => a.number - b.number).map((h) => houseRow(h));
}

/** Equal houses from tropical Asc (first Placidus cusp). */
export function tropicalEqualHousesForApi(birthData: BirthDataPayload, eventDate: Date): ApiHouseRow[] {
  const placidus = calculateTropicalHouses(eventDate, birthData.latitude, birthData.longitude);
  const asc = placidus.find((x) => x.number === 1)?.longitude ?? 0;
  const rows: ApiHouseRow[] = [];
  for (let i = 1; i <= 12; i++) {
    const lon = ((asc + (i - 1) * 30) % 360 + 360) % 360;
    rows.push(
      houseRow({
        number: i,
        longitude: lon,
        sign: getTropicalSign(lon),
        degree: getDegreeInSign(lon)
      })
    );
  }
  return rows;
}

/** Whole-sign: cusp at 0° of each sign starting from Ascendant’s sign. */
export function tropicalWholeSignHousesForApi(birthData: BirthDataPayload, eventDate: Date): ApiHouseRow[] {
  const placidus = calculateTropicalHouses(eventDate, birthData.latitude, birthData.longitude);
  const asc = placidus.find((x) => x.number === 1)?.longitude ?? 0;
  const startSign = Math.floor(asc / 30);
  const rows: ApiHouseRow[] = [];
  for (let i = 0; i < 12; i++) {
    const signIndex = (startSign + i) % 12;
    const lon = signIndex * 30;
    rows.push(
      houseRow({
        number: i + 1,
        longitude: lon,
        sign: getTropicalSign(lon),
        degree: 0
      })
    );
  }
  return rows;
}
