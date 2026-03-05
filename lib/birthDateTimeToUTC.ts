/**
 * Convert local birth date+time to UTC for chart calculations.
 * Reuses normalizeBirthTime and coordinates-based or timezone offset.
 */

import { normalizeBirthTime } from './birthTimeUtils';

/** Hours ahead of UTC (e.g. IST = 5.5). */
function getTimezoneOffsetHours(latitude: number, longitude: number): number {
  if (latitude >= 6 && latitude <= 37 && longitude >= 68 && longitude <= 97) {
    return 5.5; // IST
  }
  return longitude / 15;
}

export interface BirthLocalToUTCOptions {
  latitude?: number;
  longitude?: number;
  timezone?: string;
  birthPlace?: string;
}

/**
 * Convert local birth date and time to a UTC Date.
 * - If timezone (e.g. "Asia/Kolkata") is provided, uses it for offset (async path not used in sync version; use lat/lon for sync).
 * - If latitude and longitude are provided, uses coordinate-based offset (IST for Indian bounds, else longitude/15).
 * - Otherwise treats input as UTC (no shift).
 */
export function birthLocalToUTC(
  birthDate: string,
  birthTime: string,
  options: BirthLocalToUTCOptions = {}
): Date {
  const normalized = normalizeBirthTime(birthTime);
  const [yStr, mStr, dStr] = birthDate.split('-').map((x) => parseInt(x, 10));
  const timeParts = normalized.split(':');
  const h = parseInt(timeParts[0], 10) || 0;
  const min = parseInt(timeParts[1], 10) || 0;
  const sec = parseInt(timeParts[2], 10) || 0;
  if (Number.isNaN(yStr) || Number.isNaN(mStr) || Number.isNaN(dStr)) {
    return new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  }
  const year = yStr;
  const month = Math.max(0, Math.min(11, mStr - 1));
  const day = Math.max(1, Math.min(31, dStr));

  let offsetHours = 0;
  if (options.latitude != null && options.longitude != null) {
    offsetHours = getTimezoneOffsetHours(options.latitude, options.longitude);
  }
  // If only timezone string were provided we'd need async; plan uses lat/lon for sync path

  const localAsUtcMs = Date.UTC(year, month, day, h, min, sec);
  const utcMs = localAsUtcMs - offsetHours * 60 * 60 * 1000;
  return new Date(utcMs);
}
