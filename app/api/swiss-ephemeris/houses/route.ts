import { NextRequest, NextResponse } from 'next/server';
import { devLog } from '@/lib/devLogger';
import {
  birthPayloadToUtcDate,
  tropicalPlacidusHousesForApi,
  tropicalEqualHousesForApi,
  tropicalWholeSignHousesForApi,
  type BirthDataPayload
} from '@/lib/apiEphemerisTropical';

export const dynamic = 'force-dynamic';

export interface BirthData {
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
}

export async function POST(request: NextRequest) {
  try {
    const { birthData, houseSystem = 'placidus' } = await request.json();

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

    const bd = birthData as BirthDataPayload;
    const eventDate = birthPayloadToUtcDate(bd);
    const startTime = Date.now();

    const sys = String(houseSystem).toLowerCase();
    let houses;
    let note: string | undefined;

    switch (sys) {
      case 'equal':
        houses = tropicalEqualHousesForApi(bd, eventDate);
        break;
      case 'whole':
      case 'whole-sign':
        houses = tropicalWholeSignHousesForApi(bd, eventDate);
        break;
      case 'koch':
        houses = tropicalPlacidusHousesForApi(bd, eventDate);
        note =
          'Koch is not implemented; returned tropical Placidus cusps from the shared engine (same as Western default).';
        break;
      case 'placidus':
      default:
        houses = tropicalPlacidusHousesForApi(bd, eventDate);
        break;
    }

    const calculationTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      houses,
      houseSystem: sys === 'koch' ? 'koch' : sys,
      metadata: {
        generatedAt: new Date().toISOString(),
        engine: 'FutureSeer tropical houses (Placidus from lib/western/tropicalCalculator)',
        version: '2.0.0',
        calculationTime,
        note,
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
    devLog.error('Ephemeris houses API error:', error, 'route');
    return NextResponse.json(
      {
        error: 'Failed to calculate house cusps',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'Tropical houses API (legacy path: /api/swiss-ephemeris/houses)',
    description:
      'House cusps from the in-app tropical engine. Placidus / equal / whole-sign; Koch returns Placidus with a note.',
    version: '2.0.0',
    supportedHouseSystems: ['placidus', 'equal', 'whole', 'whole-sign', 'koch']
  });
}
