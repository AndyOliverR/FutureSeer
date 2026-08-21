/**
 * Trusted-server mundane comprehensive generation.
 * Used by the authenticated public route and Stage B (in-process, no HTTP loopback).
 */

import { getCoordinatesWithMeta } from '@/lib/geocoding';
import { getAriesIngressUTC } from '@/lib/mundane/ingressEclipse';
import { buildMundaneChart } from '@/lib/mundane/mundaneChartService';
import { buildMundaneReport, type MundaneComprehensiveAnalysis } from '@/lib/mundane/mundaneReportBuilder';
import {
  getCapitalCoordinatesOrNull,
  getNationalChart,
  inferCountryCodeFromGeocodedDisplayName,
  inferCountryCodeFromPlace,
  timeZoneForCountryCode,
} from '@/lib/mundane/nationalCharts';
import { computeRiskScores } from '@/lib/mundane/riskScoring';

export type MundaneProfileInput = {
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  birthLatitude?: number;
  birthLongitude?: number;
  currentLocation?: string;
};

export type MundaneBirthDataInput = {
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  latitude?: number;
  longitude?: number;
};

export type GenerateMundaneComprehensiveInput = {
  userProfile?: MundaneProfileInput;
  birthData?: MundaneBirthDataInput;
};

export type MundaneComprehensivePayload = MundaneComprehensiveAnalysis & {
  riskBands: MundaneComprehensiveAnalysis['riskScores']['bands'];
};

export type GenerateMundaneComprehensiveResult =
  | { ok: true; comprehensiveAnalysis: MundaneComprehensivePayload }
  | { ok: false; status: 400; error: string };

function formatIngressLocal(ingressUtc: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone,
    }).format(ingressUtc);
  } catch {
    return ingressUtc.toISOString();
  }
}

export async function generateMundaneComprehensive(
  input: GenerateMundaneComprehensiveInput,
): Promise<GenerateMundaneComprehensiveResult> {
  const birthPlaceRaw = input.birthData?.birthPlace ?? input.userProfile?.birthPlace ?? '';
  const currentLocationRaw =
    typeof input.userProfile?.currentLocation === 'string'
      ? input.userProfile.currentLocation.trim()
      : '';

  const birthPlace = typeof birthPlaceRaw === 'string' ? birthPlaceRaw.trim() : '';
  const scopePlace = currentLocationRaw.length > 0 ? currentLocationRaw : birthPlace;

  if (!scopePlace) {
    return {
      ok: false,
      status: 400,
      error:
        'Current residence or birth place is required to generate a mundane report (used to locate the ingress chart).',
    };
  }

  const geo = await getCoordinatesWithMeta(scopePlace);

  let countryCode =
    inferCountryCodeFromPlace(scopePlace) ||
    (geo.displayName ? inferCountryCodeFromGeocodedDisplayName(geo.displayName) : null);
  if (!countryCode && birthPlace) {
    countryCode = inferCountryCodeFromPlace(birthPlace);
  }

  const nationalRecord = getNationalChart(countryCode);
  const nationalCapitalCoords = getCapitalCoordinatesOrNull(countryCode);

  const countryName =
    nationalRecord?.name ?? (countryCode ? `Country (${countryCode})` : 'Regional context');

  const latFromBody = input.birthData?.latitude ?? input.userProfile?.birthLatitude;
  const lngFromBody = input.birthData?.longitude ?? input.userProfile?.birthLongitude;
  const hasFiniteLatLng =
    typeof latFromBody === 'number' &&
    typeof lngFromBody === 'number' &&
    Number.isFinite(latFromBody) &&
    Number.isFinite(lngFromBody);

  let chartLatFinal = geo.latitude;
  let chartLngFinal = geo.longitude;
  let chartLocationLabel = (geo.displayName && geo.displayName.trim()) || scopePlace;

  if (geo.resolution === 'ultimate_fallback') {
    if (hasFiniteLatLng) {
      chartLatFinal = latFromBody;
      chartLngFinal = lngFromBody;
      chartLocationLabel = (birthPlace || scopePlace).trim();
    } else if (nationalCapitalCoords) {
      chartLatFinal = nationalCapitalCoords.lat;
      chartLngFinal = nationalCapitalCoords.lng;
      chartLocationLabel = `${nationalCapitalCoords.name} (national capital; precise location unavailable for "${scopePlace}")`;
    } else {
      return {
        ok: false,
        status: 400,
        error:
          'Could not resolve coordinates for your location. Add a clearer current residence or birth place with country, or save birth latitude and longitude on your profile.',
      };
    }
  }

  if (!Number.isFinite(chartLatFinal) || !Number.isFinite(chartLngFinal)) {
    return {
      ok: false,
      status: 400,
      error: 'Invalid coordinates for mundane chart. Check your profile birth place and coordinates.',
    };
  }

  const year = new Date().getUTCFullYear();
  const ingressUTC = getAriesIngressUTC(year);
  const chart = buildMundaneChart(ingressUTC, chartLatFinal, chartLngFinal);
  const riskScores = computeRiskScores(chart, 0);

  const nationalChartNote = nationalRecord?.independence
    ? `National foundation: ${nationalRecord.independence.note} (${nationalRecord.independence.date}, ${nationalRecord.independence.place}).`
    : undefined;

  const tz = timeZoneForCountryCode(countryCode);
  const ingressDisplayLocal = formatIngressLocal(ingressUTC, tz);
  const nationalCapitalName = nationalCapitalCoords?.name ?? null;

  const comprehensiveAnalysis = await buildMundaneReport({
    countryName,
    nationalCapitalName,
    chartLocationName: chartLocationLabel,
    chart,
    riskScores,
    nationalChartNote,
    year,
    ingressDisplayLocal,
  });

  return {
    ok: true,
    comprehensiveAnalysis: {
      ...comprehensiveAnalysis,
      riskBands: comprehensiveAnalysis.riskScores.bands,
    },
  };
}
