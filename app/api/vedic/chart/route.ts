import { NextRequest, NextResponse } from 'next/server';
import { calculateSiderealPlanets, calculateVedicHouses } from '@/lib/vedic/siderealCalculator';
import { calculateVimshottariDasha } from '@/lib/astronomia-vedic'; // Keep dasha calc
import { devLog } from '@/lib/devLogger';
import { normalizeBirthTime } from '@/lib/birthTimeUtils';
import { birthLocalToUTC } from '@/lib/birthDateTimeToUTC';

/** Stable rounding for logs (avoids float noise / interleaved-request confusion in dev consoles). */
function coordForLog(n: number): number {
  return Number.isFinite(n) ? Number(n.toFixed(6)) : n;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { birthDate, birthTime, birthPlace, latitude, longitude, chartType = 'D1' } = body;

    devLog.info('🕉️ Generating SIDEREAL Vedic chart for:', {
      birthDate,
      birthTime,
      birthPlace,
      latitude: coordForLog(latitude),
      longitude: coordForLog(longitude),
    }, 'vedic');

    const hasValidCoordinate = (value: unknown): value is number =>
      typeof value === 'number' && Number.isFinite(value);

    // Validate required fields
    if (!birthDate || !birthTime || !hasValidCoordinate(latitude) || !hasValidCoordinate(longitude)) {
      return NextResponse.json({
        success: false,
        error: 'Missing required birth data'
      }, { status: 400 });
    }

    const normalizedTime = normalizeBirthTime(birthTime);
    const birthDateTime = birthLocalToUTC(birthDate, normalizedTime, { latitude, longitude });

    devLog.debug(`🕐 Birth time normalized: ${birthTime} → ${normalizedTime}`, undefined, 'vedic');
    devLog.debug(`🕐 Birth DateTime (UTC): ${birthDateTime.toISOString()}`, undefined, 'vedic');

    devLog.debug('🕉️ Birth DateTime:', birthDateTime.toISOString(), 'vedic');
    devLog.debug('🕉️ Coordinates:', { latitude: coordForLog(latitude), longitude: coordForLog(longitude) }, 'vedic');

    // Calculate SIDEREAL positions
    const vedicData = calculateSiderealPlanets(birthDateTime, latitude, longitude);
    
    // Calculate Vedic houses
    const houses = calculateVedicHouses(vedicData.ascendant.siderealLongitude);
    
    // Calculate Dasha (use moon sidereal position)
    const moonSidereal = vedicData.planets.moon.siderealLongitude;
    const dasha = calculateVimshottariDasha(moonSidereal, birthDateTime);

    // Format response
    const response = {
      success: true,
      data: {
        planets: Object.entries(vedicData.planets).map(([name, data]: [string, any]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          longitude: data.siderealLongitude,
          sign: data.sign,
          degree: data.degree,
          nakshatra: data.nakshatra,
          nakshatraPada: data.pada,
          isRetrograde: data.speed < 0
        })),
        houses: houses,
        ascendant: {
          longitude: vedicData.ascendant.siderealLongitude,
          sign: vedicData.ascendant.sign,
          degree: vedicData.ascendant.degree
        },
        ayanamsha: vedicData.ayanamsha,
        dasha: dasha,
        currentDasha: dasha.find((d: { isCurrent?: boolean }) => d.isCurrent === true) ?? null,
        chartType
      },
      metadata: {
        system: 'vedic',
        zodiacType: 'sidereal',
        ayanamshaType: 'lahiri',
        generatedAt: new Date().toISOString()
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    devLog.error('❌ Vedic chart error:', error, 'route');
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}