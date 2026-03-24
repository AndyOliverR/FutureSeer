import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import {
  birthPayloadToUtcDate,
  tropicalSnapshotToPlanetRows
} from '@/lib/apiEphemerisTropical';
import { calculateTropicalPlanets } from '@/lib/western/tropicalCalculator';

export const dynamic = 'force-dynamic';

export interface BirthData {
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  strength: number;
  exact: boolean;
}

function angularDistance(lon1: number, lon2: number): number {
  let d = Math.abs(lon1 - lon2);
  if (d > 180) d = 360 - d;
  return d;
}

function aspectBetween(
  planet1: { name: string; longitude: number },
  planet2: { name: string; longitude: number }
): Aspect | null {
  const angularDist = angularDistance(planet1.longitude, planet2.longitude);

  const aspectTypes = [
    { name: 'conjunction', angle: 0, orb: 8 },
    { name: 'sextile', angle: 60, orb: 6 },
    { name: 'square', angle: 90, orb: 8 },
    { name: 'trine', angle: 120, orb: 8 },
    { name: 'opposition', angle: 180, orb: 8 }
  ];

  for (const aspectType of aspectTypes) {
    const orb = Math.abs(angularDist - aspectType.angle);
    if (orb <= aspectType.orb) {
      const strength = 1 - orb / aspectType.orb;
      const exact = orb <= 1;
      return {
        planet1: planet1.name,
        planet2: planet2.name,
        type: aspectType.name,
        orb,
        strength,
        exact
      };
    }
  }
  return null;
}

function calculateAspectsFromRows(
  rows: { name: string; longitude: number }[]
): Aspect[] {
  const aspects: Aspect[] = [];
  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const a = aspectBetween(rows[i], rows[j]);
      if (a) aspects.push(a);
    }
  }
  return aspects;
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
    const rows = tropicalSnapshotToPlanetRows(tropical);
    const aspects = calculateAspectsFromRows(rows);

    const calculationTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      aspects,
      metadata: {
        generatedAt: new Date().toISOString(),
        engine: 'FutureSeer tropical aspects (from calculateTropicalPlanets longitudes)',
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
    devLog.error('Ephemeris aspects API error:', error, 'route');
    return NextResponse.json(
      {
        error: 'Failed to calculate aspects',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'Tropical aspects API (legacy path: /api/swiss-ephemeris/aspects)',
    description: 'Major aspects between bodies from the in-app tropical longitudes.',
    version: '2.0.0',
    supportedAspects: ['conjunction', 'sextile', 'square', 'trine', 'opposition']
  });
}
