import { NextRequest, NextResponse } from 'next/server';
import { universalOccultService, BirthData } from '@/lib/universalOccultService';
import { devLog } from '@/lib/devLogger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      person1Name,
      person1BirthDate,
      person1BirthTime,
      person1BirthLocation,
      person1Latitude,
      person1Longitude,
      person2Name,
      person2BirthDate,
      person2BirthTime,
      person2BirthLocation,
      person2Latitude,
      person2Longitude
    } = body;

    // Validate required fields
    if (!person1BirthDate || !person1BirthTime || !person1BirthLocation ||
        !person2BirthDate || !person2BirthTime || !person2BirthLocation) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required birth data. Please provide birth date, time, and location for both persons.' 
        },
        { status: 400 }
      );
    }

    devLog.info('💕 Generating Synastry analysis for:', {
      person1: person1Name || 'Person 1',
      person2: person2Name || 'Person 2'
    }, 'synastry');

    // Geocode birth locations if coordinates are missing
    let person1Lat = person1Latitude;
    let person1Lon = person1Longitude;
    let person2Lat = person2Latitude;
    let person2Lon = person2Longitude;

    if ((!person1Lat || !person1Lon) && person1BirthLocation) {
      try {
        const { geocodePlace } = await import('@/services/geocoding');
        const coords = await geocodePlace(person1BirthLocation);
        if (coords) {
          person1Lat = coords.latitude;
          person1Lon = coords.longitude;
          devLog.debug(`📍 Geocoded Person 1 location:`, person1BirthLocation, 'synastry');
        } else {
          devLog.warn(`⚠️ Failed to geocode Person 1 location: ${person1BirthLocation}`, undefined, 'synastry');
          // Use default fallback (Mumbai, India)
          person1Lat = 19.0760;
          person1Lon = 72.8777;
        }
      } catch (error) {
        devLog.error('❌ Geocoding error for Person 1:', error, 'route');
        // Use default fallback (Mumbai, India)
        person1Lat = 19.0760;
        person1Lon = 72.8777;
      }
    }

    if ((!person2Lat || !person2Lon) && person2BirthLocation) {
      try {
        const { geocodePlace } = await import('@/services/geocoding');
        const coords = await geocodePlace(person2BirthLocation);
        if (coords) {
          person2Lat = coords.latitude;
          person2Lon = coords.longitude;
          devLog.debug(`📍 Geocoded Person 2 location:`, person2BirthLocation, 'synastry');
        } else {
          devLog.warn(`⚠️ Failed to geocode Person 2 location: ${person2BirthLocation}`, undefined, 'synastry');
          // Use default fallback (Mumbai, India)
          person2Lat = 19.0760;
          person2Lon = 72.8777;
        }
      } catch (error) {
        devLog.error('❌ Geocoding error for Person 2:', error, 'route');
        // Use default fallback (Mumbai, India)
        person2Lat = 19.0760;
        person2Lon = 72.8777;
      }
    }

    // Prepare birth data
    const birthData1: BirthData = {
      birthDate: person1BirthDate,
      birthTime: person1BirthTime,
      birthPlace: person1BirthLocation,
      latitude: person1Lat || 19.0760,
      longitude: person1Lon || 72.8777
    };

    const birthData2: BirthData = {
      birthDate: person2BirthDate,
      birthTime: person2BirthTime,
      birthPlace: person2BirthLocation,
      latitude: person2Lat || 19.0760,
      longitude: person2Lon || 72.8777
    };

    // Calculate synastry chart
    const synastryResult = await universalOccultService.calculateSynastryChart(
      birthData1,
      birthData2,
      {
        houseSystem: 'placidus',
        includeAspects: true
      }
    );

    if (!synastryResult.success) {
      throw new Error('Failed to calculate synastry chart');
    }

    // Format response data
    const synastryData = synastryResult.data;

    return NextResponse.json({
      success: true,
      data: {
        person1: {
          name: person1Name || 'Person 1',
          chart: synastryData.person1
        },
        person2: {
          name: person2Name || 'Person 2',
          chart: synastryData.person2
        },
        aspects: synastryData.aspects || [],
        composite: synastryData.composite || {},
        compatibility: synastryData.compatibility || 50,
        timing: synastryData.timing || {}
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        source: 'FutureSeer Synastry Analysis',
        version: '1.0.0'
      }
    });
  } catch (error: any) {
    devLog.error('❌ Error generating synastry analysis:', error, 'route');
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate synastry analysis' 
      },
      { status: 500 }
    );
  }
}

