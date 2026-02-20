/**
 * Aries Ingress and cardinal ingress times for mundane astrology.
 * Uses existing tropical calculator; no external APIs.
 */

import { calculateTropicalPlanets } from '@/lib/western/tropicalCalculator';

const NORM360 = (d: number) => ((d % 360) + 360) % 360;

/**
 * Find the UTC moment when Sun enters Aries (tropical longitude 0) for a given year.
 * Searches hourly from March 19 00:00 to March 21 23:00 UTC.
 */
export function getAriesIngressUTC(year: number): Date {
  for (let day = 19; day <= 21; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const d = new Date(Date.UTC(year, 2, day, hour, 0, 0, 0)); // month 2 = March
      const planets = calculateTropicalPlanets(d);
      const sunLon = NORM360(planets.sun.longitude);
      // Sun enters Aries when longitude is in [0, 30)
      if (sunLon >= 0 && sunLon < 30) return d;
    }
  }
  // Fallback: March 20 06:00 UTC
  return new Date(Date.UTC(year, 2, 20, 6, 0, 0, 0));
}

/**
 * Get approximate UTC times for Sun entering Cancer, Libra, Capricorn for a given year.
 * Used for cardinal ingress charts (optional in v1).
 */
export function getCardinalIngressesUTC(year: number): {
  cancer: Date;
  libra: Date;
  capricorn: Date;
} {
  // Approximate dates: June 21, Sept 22/23, Dec 21/22
  const cancer = new Date(Date.UTC(year, 5, 21, 6, 0, 0, 0));
  const libra = new Date(Date.UTC(year, 8, 22, 6, 0, 0, 0));
  const capricorn = new Date(Date.UTC(year, 11, 21, 6, 0, 0, 0));
  return { cancer, libra, capricorn };
}

/**
 * Placeholder: eclipse dates for the year (simplified).
 * Full implementation would use Swiss Ephemeris swe_sol_eclipse_when_glob etc.
 * Returns empty array for now; narrative can still mention "eclipse seasons" generically.
 */
export function getEclipseDatesForYear(_year: number): { date: string; type: 'solar' | 'lunar' }[] {
  return [];
}
