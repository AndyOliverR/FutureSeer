/**
 * POST /api/mundane-astrology/comprehensive
 * Generate mundane astrology report: Aries Ingress + national context + risk scores + narrative.
 * No external APIs; local ephemeris and static national data only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import {
  inferCountryCodeFromPlace,
  getNationalChart,
  getCapitalCoordinates,
} from '@/lib/mundane/nationalCharts';
import { getAriesIngressUTC } from '@/lib/mundane/ingressEclipse';
import { buildMundaneChart } from '@/lib/mundane/mundaneChartService';
import { computeRiskScores } from '@/lib/mundane/riskScoring';
import { buildMundaneReport } from '@/lib/mundane/mundaneReportBuilder';

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
  };
  birthData?: {
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    latitude?: number;
    longitude?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const birthPlace =
      body.birthData?.birthPlace ??
      body.userProfile?.birthPlace ??
      '';

    if (!birthPlace || typeof birthPlace !== 'string' || !birthPlace.trim()) {
      return NextResponse.json(
        { error: 'Birth place is required to generate a mundane report (country/capital derived from it).' },
        { status: 400 }
      );
    }

    const countryCode = inferCountryCodeFromPlace(birthPlace);
    const coords = getCapitalCoordinates(countryCode);
    const nationalRecord = getNationalChart(countryCode);
    const countryName = nationalRecord?.name ?? (countryCode ? `Country (${countryCode})` : 'Selected region');
    const capitalName = coords.name;

    const year = new Date().getUTCFullYear();
    const ingressUTC = getAriesIngressUTC(year);
    const chart = buildMundaneChart(ingressUTC, coords.lat, coords.lng);
    const riskScores = computeRiskScores(chart, 0);

    const nationalChartNote = nationalRecord?.independence
      ? `National foundation: ${nationalRecord.independence.note} (${nationalRecord.independence.date}, ${nationalRecord.independence.place}).`
      : undefined;

    const comprehensiveAnalysis = await buildMundaneReport({
      countryName,
      capitalName,
      chart,
      riskScores,
      nationalChartNote,
      year,
    });

    devLog.debug('Mundane report generated', { countryCode, countryName, year }, 'mundane-astrology');

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
      { status: 500 }
    );
  }
}
