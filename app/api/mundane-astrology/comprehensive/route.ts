/**
 * POST /api/mundane-astrology/comprehensive
 * Generate mundane astrology report: Aries Ingress + national context + risk scores + narrative.
 * Chart is cast for the user's current residence when set, else birth place (geocoded), not a silent US default.
 */

import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import {
  inferCountryCodeFromPlace,
  inferCountryCodeFromGeocodedDisplayName,
  getNationalChart,
  getCapitalCoordinatesOrNull,
  timeZoneForCountryCode,
} from '@/lib/mundane/nationalCharts';
import { getAriesIngressUTC } from '@/lib/mundane/ingressEclipse';
import { buildMundaneChart } from '@/lib/mundane/mundaneChartService';
import { computeRiskScores } from '@/lib/mundane/riskScoring';
import { buildMundaneReport } from '@/lib/mundane/mundaneReportBuilder';
import { getCoordinatesWithMeta } from '@/lib/geocoding';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface RequestBody {
  userId?: string;
  userProfile?: {
    birthDate?: string;
    birthTime?: string;
    birthPlace?: string;
    birthLatitude?: number;
    birthLongitude?: number;
    currentLocation?: string;
  };
  birthData?: {
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    latitude?: number;
    longitude?: number;
  };
}

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

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const birthPlaceRaw =
      body.birthData?.birthPlace ?? body.userProfile?.birthPlace ?? '';
    const currentLocationRaw =
      typeof body.userProfile?.currentLocation === 'string'
        ? body.userProfile.currentLocation.trim()
        : '';

    const birthPlace = typeof birthPlaceRaw === 'string' ? birthPlaceRaw.trim() : '';
    const scopePlace =
      currentLocationRaw.length > 0 ? currentLocationRaw : birthPlace;

    if (!scopePlace) {
      return NextResponse.json(
        {
          error:
            'Current residence or birth place is required to generate a mundane report (used to locate the ingress chart).',
        },
        { status: 400 },
      );
    }

    const geo = await getCoordinatesWithMeta(scopePlace);

    let countryCode =
      inferCountryCodeFromPlace(scopePlace) ||
      (geo.displayName
        ? inferCountryCodeFromGeocodedDisplayName(geo.displayName)
        : null);
    if (!countryCode && birthPlace) {
      countryCode = inferCountryCodeFromPlace(birthPlace);
    }

    const nationalRecord = getNationalChart(countryCode);
    const nationalCapitalCoords = getCapitalCoordinatesOrNull(countryCode);

    const countryName =
      nationalRecord?.name ??
      (countryCode ? `Country (${countryCode})` : 'Regional context');

    const latFromBody = body.birthData?.latitude ?? body.userProfile?.birthLatitude;
    const lngFromBody = body.birthData?.longitude ?? body.userProfile?.birthLongitude;
    const hasFiniteLatLng =
      typeof latFromBody === 'number' &&
      typeof lngFromBody === 'number' &&
      Number.isFinite(latFromBody) &&
      Number.isFinite(lngFromBody);

    let chartLatFinal = geo.latitude;
    let chartLngFinal = geo.longitude;
    let chartLocationLabel =
      (geo.displayName && geo.displayName.trim()) || scopePlace;

    if (geo.resolution === 'ultimate_fallback') {
      if (hasFiniteLatLng) {
        chartLatFinal = latFromBody as number;
        chartLngFinal = lngFromBody as number;
        chartLocationLabel = (birthPlace || scopePlace).trim();
      } else if (nationalCapitalCoords) {
        chartLatFinal = nationalCapitalCoords.lat;
        chartLngFinal = nationalCapitalCoords.lng;
        chartLocationLabel = `${nationalCapitalCoords.name} (national capital; precise location unavailable for "${scopePlace}")`;
      } else {
        return NextResponse.json(
          {
            error:
              'Could not resolve coordinates for your location. Add a clearer current residence or birth place with country, or save birth latitude and longitude on your profile.',
          },
          { status: 400 },
        );
      }
    }

    if (!Number.isFinite(chartLatFinal) || !Number.isFinite(chartLngFinal)) {
      return NextResponse.json(
        { error: 'Invalid coordinates for mundane chart. Check your profile birth place and coordinates.' },
        { status: 400 },
      );
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

    devLog.debug(
      'Mundane report generated',
      { countryCode, countryName, chartLocationLabel, year },
      'mundane-astrology',
    );

    return NextResponse.json({
      success: true,
      data: {
        comprehensiveAnalysis: {
          ...comprehensiveAnalysis,
          riskBands: comprehensiveAnalysis.riskScores.bands,
        },
      },
    });
  } catch (err) {
    devLog.error('Mundane astrology comprehensive error', err, 'mundane-astrology');
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Mundane report generation failed' },
      { status: 500 },
    );
  }
}
