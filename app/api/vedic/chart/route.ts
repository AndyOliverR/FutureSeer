import { NextRequest, NextResponse } from 'next/server';
import { calculateSiderealPlanets, calculateVedicHouses } from '@/lib/vedic/siderealCalculator';
import { calculateVimshottariDasha } from '@/lib/astronomia-vedic'; // Keep dasha calc
import { devLog } from '@/lib/devLogger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { birthDate, birthTime, birthPlace, latitude, longitude, chartType = 'D1' } = body;

    devLog.info('🕉️ Generating SIDEREAL Vedic chart for:', {
      birthDate, birthTime, birthPlace, latitude, longitude
    }, 'vedic');

    // Validate required fields
    if (!birthDate || !birthTime || !latitude || !longitude) {
      return NextResponse.json({
        success: false,
        error: 'Missing required birth data'
      }, { status: 400 });
    }

    // Parse date and time
    const [year, month, day] = birthDate.split('-').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);

    // For India (Mysore coordinates: lat 12.3, lon 76.65)
    // IST is UTC+5:30 regardless of coordinates
    const IST_OFFSET_HOURS = 5;
    const IST_OFFSET_MINUTES = 30;

    // Convert IST to UTC
    let utcHours = hour - IST_OFFSET_HOURS;
    let utcMinutes = minute - IST_OFFSET_MINUTES;
    let utcDay = day;

    // Handle minute wraparound
    if (utcMinutes < 0) {
      utcMinutes += 60;
      utcHours -= 1;
    }

    // Handle hour wraparound
    if (utcHours < 0) {
      utcHours += 24;
      utcDay -= 1;
    }

    const birthDateTime = new Date(Date.UTC(year, month - 1, utcDay, utcHours, utcMinutes));

    devLog.debug(`🕐 TIMEZONE CONVERSION: ${hour}:${minute} IST → ${utcHours}:${utcMinutes} UTC`, undefined, 'vedic');
    devLog.debug(`🕐 Birth DateTime (UTC): ${birthDateTime.toISOString()}`, undefined, 'vedic');

    devLog.debug('🕉️ Birth DateTime:', birthDateTime.toISOString(), 'vedic');
    devLog.debug('🕉️ Coordinates:', { latitude, longitude }, 'vedic');

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
    console.error('❌ Vedic chart error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}