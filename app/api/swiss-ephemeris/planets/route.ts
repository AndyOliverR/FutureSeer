import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import {
  birthPayloadToUtcDate,
  tropicalSnapshotToPlanetRows
} from '@/lib/apiEphemerisTropical';
import { calculateTropicalPlanets } from '@/lib/western/tropicalCalculator';

export const dynamic = 'force-dynamic';

/** @deprecated Path name; uses in-app Astronomia/tropical pipeline, not Swiss Ephemeris binaries. */
export interface BirthData {
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
}

export async function POST(request: NextRequest) {
  try {
    const { birthData, date } = await request.json();

    if (!birthData) {
      return NextResponse.json(
        {
          error: 'Birth data is required',
          details: 'Please provide birthDate, birthTime, birthPlace, latitude, and longitude'
        },
        { status: 400 }
      );
    }

    const { birthDate, birthTime, birthPlace, latitude, longitude } = birthData;

    if (
      !birthDate ||
      !birthTime ||
      !birthPlace ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return NextResponse.json(
        {
          error: 'Incomplete birth data',
          details:
            'All birth data fields are required: birthDate, birthTime, birthPlace, latitude, longitude'
        },
        { status: 400 }
      );
    }

    const targetDate = date ? new Date(date) : birthPayloadToUtcDate(birthData);
    const startTime = Date.now();

    const tropical = calculateTropicalPlanets(targetDate);
    const planets = tropicalSnapshotToPlanetRows(tropical);

    const calculationTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      planets,
      metadata: {
        generatedAt: new Date().toISOString(),
        engine: 'FutureSeer tropical (Astronomia / VSOP-style; includes Chiron approximation)',
        version: '2.0.0',
        calculationTime,
        targetDate: targetDate.toISOString(),
        birthData: {
          birthDate,
          birthTime,
          birthPlace,
          latitude,
          longitude
        }
      }
    });
  } catch (error: unknown) {
    devLog.error('Ephemeris planets API error:', error, 'route');
    return NextResponse.json(
      {
        error: 'Failed to calculate planetary positions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'Tropical planets API (legacy path: /api/swiss-ephemeris/planets)',
    description:
      'Tropical planetary longitudes via the same in-app engine as Western tools (Astronomia). Not Swiss Ephemeris SE binary output.',
    version: '2.0.0',
    supportedPlanets: [
      'Sun',
      'Moon',
      'Mercury',
      'Venus',
      'Mars',
      'Jupiter',
      'Saturn',
      'Uranus',
      'Neptune',
      'Pluto',
      'Chiron',
      'North Node',
      'South Node'
    ],
    usage: {
      endpoint: '/api/swiss-ephemeris/planets',
      method: 'POST',
      body: {
        birthData: {
          birthDate: '1990-01-01',
          birthTime: '12:00:00',
          birthPlace: 'New York',
          latitude: 40.7128,
          longitude: -74.006
        },
        date: '2024-01-01T00:00:00.000Z'
      }
    }
  });
}
