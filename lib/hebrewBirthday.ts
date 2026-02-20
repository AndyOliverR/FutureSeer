/**
 * Hebrew birthday conversion (Jewish day begins at sundown).
 * Uses @hebcal/core for Gregorian → Hebrew date and optional sunset at location.
 */

export interface HebrewBirthdayResult {
  hebrewDateString: string;
  hebrewMonthName: string;
  hebrewDay: number;
  hebrewYear: number;
  isLeapMonthAdar: boolean;
}

/**
 * Get Hebrew date for a birth moment. If latitude/longitude are provided and
 * birth time is after local sunset, the next Hebrew day is used (Jewish day starts at sundown).
 * Without timezone we use a longitude-based heuristic for "local" sunset.
 */
export async function getHebrewBirthday(
  birthDateStr: string,
  birthTimeStr: string,
  latitude?: number,
  longitude?: number
): Promise<HebrewBirthdayResult | null> {
  try {
    const hebcal = await import('@hebcal/core');
    const HDate = (hebcal as { HDate?: new (d: Date) => HDateLike }).HDate;
    if (!HDate) return null;

    const [y, m, d] = birthDateStr.split('-').map(Number);
    const timePart = (birthTimeStr || '12:00').split(':');
    const hour = parseInt(timePart[0], 10) || 0;
    const minute = parseInt(timePart[1], 10) || 0;

    let useDate = new Date(Date.UTC(y, m - 1, d));
    if (latitude != null && longitude != null && !isNaN(latitude) && !isNaN(longitude)) {
      const afterSunset = isAfterLocalSunset(y, m - 1, d, hour, minute, latitude, longitude);
      if (afterSunset) {
        useDate = new Date(Date.UTC(y, m - 1, d + 1));
      }
    }

    const hd = new HDate(useDate) as HDateLike;
    const day = hd.dd ?? hd.getDay?.() ?? 0;
    const month = hd.mm ?? hd.getMonth?.() ?? 0;
    const year = hd.yy ?? hd.getFullYear?.() ?? 0;
    const monthName = hd.getMonthName?.() ?? (hd as { monthName?: string }).monthName ?? String(month);
    const dateString = hd.toString?.() ?? `${day} ${monthName} ${year}`;

    const isLeapMonthAdar = month === 13 || /Adar/i.test(String(monthName));

    return {
      hebrewDateString: dateString,
      hebrewMonthName: monthName,
      hebrewDay: day,
      hebrewYear: year,
      isLeapMonthAdar,
    };
  } catch {
    return null;
  }
}

interface HDateLike {
  dd?: number;
  mm?: number;
  yy?: number;
  getDay?(): number;
  getMonth?(): number;
  getFullYear?(): number;
  getMonthName?(): string;
  toString?(): string;
  monthName?: string;
}

/**
 * Rough heuristic: is (hour, minute) after "sunset" for this date at (lat, lon)?
 * We don't have timezone; use longitude to approximate local solar time and assume sunset ~18:00 local.
 */
function isAfterLocalSunset(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  lat: number,
  lon: number
): boolean {
  const utcMinutes = hour * 60 + minute;
  const localSolarOffsetMinutes = (lon / 15) * 60;
  const localSolarMinutes = utcMinutes + localSolarOffsetMinutes;
  const localSolarHour = localSolarMinutes / 60;
  return localSolarHour >= 18;
}
