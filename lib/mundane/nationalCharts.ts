/**
 * Static national chart data for mundane astrology.
 * Curated from Astro-Databank and historical sources; no runtime fetch.
 * Keyed by country code for lookup from user birth place.
 */

export interface NationalChartEvent {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM or HH:MM:SS (local or UTC as noted)
  place: string;
  latitude: number;
  longitude: number;
  note?: string; // e.g. "Independence", "Constitution", "Sibly"
}

export interface NationalChartRecord {
  countryCode: string;
  name: string;
  capital: string;
  capitalLat: number;
  capitalLng: number;
  /** Primary foundation chart used for mundane analysis */
  independence?: NationalChartEvent;
  /** Optional second chart (e.g. constitution) */
  constitution?: NationalChartEvent;
}

/** USA: Sibly Chart (Declaration of Independence) - Astro-Databank AA */
const USA_INDEPENDENCE: NationalChartEvent = {
  date: '1776-07-04',
  time: '17:10', // 5:10 PM LMT Philadelphia
  place: 'Philadelphia, PA, USA',
  latitude: 39.95,
  longitude: -75.15,
  note: 'Declaration of Independence (Sibly Chart)',
};

/** India: Independence at midnight - Astro-Databank AA */
const INDIA_INDEPENDENCE: NationalChartEvent = {
  date: '1947-08-15',
  time: '00:00',
  place: 'New Delhi, India',
  latitude: 28.6139,
  longitude: 77.209,
  note: 'Independence',
};

/** UK: No single "independence" chart; use Acts of Union or Magna Carta for historical. For annual ingress we use London. */
const UK_CAPITAL_ONLY: NationalChartRecord = {
  countryCode: 'GB',
  name: 'United Kingdom',
  capital: 'London',
  capitalLat: 51.5074,
  capitalLng: -0.1278,
};

/** Canada: Constitution Act / Confederation - Astro-Databank */
const CANADA_CONFEDERATION: NationalChartEvent = {
  date: '1867-07-01',
  time: '00:00',
  place: 'Ottawa, Canada',
  latitude: 45.4215,
  longitude: -75.6972,
  note: 'Confederation',
};

/** Australia: Federation - Astro-Databank */
const AUSTRALIA_FEDERATION: NationalChartEvent = {
  date: '1901-01-01',
  time: '00:00',
  place: 'Sydney, Australia',
  latitude: -33.8688,
  longitude: 151.2093,
  note: 'Federation',
};

const NATIONAL_CHARTS: NationalChartRecord[] = [
  {
    countryCode: 'US',
    name: 'United States',
    capital: 'Washington, D.C.',
    capitalLat: 38.9072,
    capitalLng: -77.0369,
    independence: USA_INDEPENDENCE,
  },
  {
    countryCode: 'USA',
    name: 'United States',
    capital: 'Washington, D.C.',
    capitalLat: 38.9072,
    capitalLng: -77.0369,
    independence: USA_INDEPENDENCE,
  },
  {
    countryCode: 'IN',
    name: 'India',
    capital: 'New Delhi',
    capitalLat: 28.6139,
    capitalLng: 77.209,
    independence: INDIA_INDEPENDENCE,
  },
  {
    countryCode: 'IND',
    name: 'India',
    capital: 'New Delhi',
    capitalLat: 28.6139,
    capitalLng: 77.209,
    independence: INDIA_INDEPENDENCE,
  },
  {
    ...UK_CAPITAL_ONLY,
  },
  {
    countryCode: 'CA',
    name: 'Canada',
    capital: 'Ottawa',
    capitalLat: 45.4215,
    capitalLng: -75.6972,
    independence: CANADA_CONFEDERATION,
  },
  {
    countryCode: 'CAN',
    name: 'Canada',
    capital: 'Ottawa',
    capitalLat: 45.4215,
    capitalLng: -75.6972,
    independence: CANADA_CONFEDERATION,
  },
  {
    countryCode: 'AU',
    name: 'Australia',
    capital: 'Canberra',
    capitalLat: -35.2809,
    capitalLng: 149.13,
    independence: AUSTRALIA_FEDERATION,
  },
  {
    countryCode: 'AUS',
    name: 'Australia',
    capital: 'Canberra',
    capitalLat: -35.2809,
    capitalLng: 149.13,
    independence: AUSTRALIA_FEDERATION,
  },
];

const BY_COUNTRY_CODE = new Map<string, NationalChartRecord>();
NATIONAL_CHARTS.forEach((r) => BY_COUNTRY_CODE.set(r.countryCode.toUpperCase(), r));

/**
 * Resolve country code from birth place string (simple heuristic).
 * Returns uppercase 2-letter or 3-letter code if detected, else null.
 */
export function inferCountryCodeFromPlace(place: string): string | null {
  if (!place || typeof place !== 'string') return null;
  const upper = place.trim().toUpperCase();
  // Direct country name -> code map for common cases
  const placeToCode: Record<string, string> = {
    'UNITED STATES': 'US',
    'USA': 'US',
    'U.S.': 'US',
    'US': 'US',
    'AMERICA': 'US',
    'INDIA': 'IN',
    'UNITED KINGDOM': 'GB',
    'UK': 'GB',
    'BRITAIN': 'GB',
    'ENGLAND': 'GB',
    'CANADA': 'CA',
    'AUSTRALIA': 'AU',
    'NEW DELHI': 'IN',
    'DELHI': 'IN',
    'MUMBAI': 'IN',
    'WASHINGTON': 'US',
    'NEW YORK': 'US',
    'LONDON': 'GB',
    'OTTAWA': 'CA',
    'CANBERRA': 'AU',
    'SYDNEY': 'AU',
  };
  for (const [key, code] of Object.entries(placeToCode)) {
    if (upper.includes(key) || upper === key) return code;
  }
  // Check if place ends with country name
  if (upper.endsWith(', USA') || upper.endsWith(', US')) return 'US';
  if (upper.endsWith(', INDIA') || upper.endsWith(', IN')) return 'IN';
  if (upper.endsWith(', UK') || upper.endsWith(', UNITED KINGDOM')) return 'GB';
  if (upper.endsWith(', CANADA') || upper.endsWith(', CA')) return 'CA';
  if (upper.endsWith(', AUSTRALIA') || upper.endsWith(', AU')) return 'AU';
  return null;
}

/**
 * Get national chart record by country code. Prefer 2-letter, then 3-letter.
 */
export function getNationalChart(countryCode: string | null): NationalChartRecord | null {
  if (!countryCode) return null;
  const upper = countryCode.trim().toUpperCase();
  return BY_COUNTRY_CODE.get(upper) ?? null;
}

/**
 * Get capital coordinates for a country (for casting ingress chart).
 * Falls back to Washington D.C. if unknown.
 */
export function getCapitalCoordinates(countryCode: string | null): { lat: number; lng: number; name: string } {
  const rec = getNationalChart(countryCode);
  if (rec) return { lat: rec.capitalLat, lng: rec.capitalLng, name: rec.capital };
  return { lat: 38.9072, lng: -77.0369, name: 'Washington, D.C.' };
}

export { NATIONAL_CHARTS };
