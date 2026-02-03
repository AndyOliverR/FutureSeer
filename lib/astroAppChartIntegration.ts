// AstroApp Chart Integration
// Demonstrates how to integrate Western chart data from AstroApp with Vedic chart conversion

import { convertWesternToVedicCharts, generateStyledChartImage, WesternChartData } from './vedicChartConverter';

export interface AstroAppChartResponse {
  objects: Array<{
    id: number;
    lng: number;
    lat: number;
    speed: number;
  }>;
  houseCusps: Array<{
    number: number;
    longitude: number;
  }>;
  metadata: {
    ayanamsa?: number;
    houseSystem?: string;
    generatedAt?: string;
  };
}

/**
 * Convert AstroApp Western chart response to Vedic formats
 */
export async function convertAstroAppToVedicCharts(
  astroAppResponse: AstroAppChartResponse
): Promise<{
  northIndian: { svg: string; metadata: any };
  southIndian: { svg: string; metadata: any };
  nakshatraWheel: { svg: string; metadata: any };
}> {
  // Map AstroApp planet IDs to names
  const planetNames: { [key: number]: string } = {
    0: 'Sun', 1: 'Moon', 2: 'Mercury', 3: 'Venus', 4: 'Mars',
    5: 'Jupiter', 6: 'Saturn', 7: 'Uranus', 8: 'Neptune', 9: 'Pluto',
    10: 'Mean Node', 11: 'True Node', 12: 'Ceres', 13: 'Pallas', 14: 'Juno',
    15: 'Chiron', 16: 'Vesta', 17: 'Eros', 18: 'Sappho', 19: 'Amor',
    20: 'Psyche', 21: 'Hidalgo', 22: 'Hidalgo', 23: 'Hidalgo', 24: 'Ascendant',
    25: 'Midheaven', 26: 'Vertex', 27: 'East Point', 28: 'Part of Fortune',
    29: 'Black Moon Lilith', 30: 'White Moon Selena'
  };

  // Convert AstroApp data to our Western chart format
  const westernData: WesternChartData = {
    planets: astroAppResponse.objects.map(obj => ({
      name: planetNames[obj.id] || `Object ${obj.id}`,
      longitude: obj.lng,
      latitude: obj.lat,
      speed: obj.speed
    })),
    houses: astroAppResponse.houseCusps.map(house => ({
      number: house.number,
      longitude: house.longitude,
      sign: getSignFromLongitude(house.longitude)
    })),
    metadata: {
      ayanamsa: astroAppResponse.metadata.ayanamsa || 23.85,
      houseSystem: astroAppResponse.metadata.houseSystem || 'Placidus',
      generatedAt: astroAppResponse.metadata.generatedAt || new Date().toISOString()
    }
  };

  // Convert to Vedic formats
  const vedicCharts = convertWesternToVedicCharts(westernData);

  // Apply styling with high border radius
  return {
    northIndian: {
      svg: generateStyledChartImage(vedicCharts.northIndian.svg, 'North Indian'),
      metadata: vedicCharts.northIndian.metadata
    },
    southIndian: {
      svg: generateStyledChartImage(vedicCharts.southIndian.svg, 'South Indian'),
      metadata: vedicCharts.southIndian.metadata
    },
    nakshatraWheel: {
      svg: generateStyledChartImage(vedicCharts.nakshatraWheel.svg, 'Nakshatra Wheel'),
      metadata: vedicCharts.nakshatraWheel.metadata
    }
  };
}

/**
 * Get zodiac sign from longitude
 */
function getSignFromLongitude(longitude: number): string {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const signIndex = Math.floor(longitude / 30);
  return signs[signIndex % 12];
}

/**
 * Example usage with AstroApp API
 */
export async function generateVedicChartsFromAstroApp(
  birthDate: string,
  birthTime: string,
  birthPlace: string
): Promise<any> {
  try {
    // This would be your actual AstroApp API call
    // const astroAppResponse = await fetchAstroAppChart(birthDate, birthTime, birthPlace);
    
    // For demonstration, using mock data structure
    const mockAstroAppResponse: AstroAppChartResponse = {
      objects: [
        { id: 0, lng: 45.2, lat: 0, speed: 1.0 }, // Sun
        { id: 1, lng: 120.5, lat: 0, speed: 13.2 }, // Moon
        { id: 2, lng: 30.8, lat: 0, speed: 1.4 }, // Mercury
        { id: 3, lng: 75.3, lat: 0, speed: 1.2 }, // Venus
        { id: 4, lng: 200.1, lat: 0, speed: 0.5 }, // Mars
        { id: 5, lng: 280.7, lat: 0, speed: 0.1 }, // Jupiter
        { id: 6, lng: 150.9, lat: 0, speed: 0.05 }, // Saturn
        { id: 7, lng: 45.6, lat: 0, speed: 0.04 }, // Uranus
        { id: 8, lng: 320.2, lat: 0, speed: 0.01 }, // Neptune
        { id: 9, lng: 250.4, lat: 0, speed: 0.01 }, // Pluto
        { id: 10, lng: 180.0, lat: 0, speed: -0.05 }, // North Node
        { id: 24, lng: 15.3, lat: 0, speed: 0 }, // Ascendant
        { id: 25, lng: 105.8, lat: 0, speed: 0 } // Midheaven
      ],
      houseCusps: [
        { number: 1, longitude: 15.3 },
        { number: 2, longitude: 45.2 },
        { number: 3, longitude: 75.1 },
        { number: 4, longitude: 105.8 },
        { number: 5, longitude: 135.5 },
        { number: 6, longitude: 165.2 },
        { number: 7, longitude: 195.3 },
        { number: 8, longitude: 225.2 },
        { number: 9, longitude: 255.1 },
        { number: 10, longitude: 285.8 },
        { number: 11, longitude: 315.5 },
        { number: 12, longitude: 345.2 }
      ],
      metadata: {
        ayanamsa: 23.85,
        houseSystem: 'Placidus',
        generatedAt: new Date().toISOString()
      }
    };

    // Convert to Vedic charts
    const vedicCharts = await convertAstroAppToVedicCharts(mockAstroAppResponse);

    return {
      success: true,
      charts: vedicCharts,
      metadata: {
        source: 'AstroApp Western Chart',
        convertedAt: new Date().toISOString(),
        originalData: mockAstroAppResponse
      }
    };

  } catch (error) {
    console.error('Error generating Vedic charts from AstroApp:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Integration with existing Vedic astrology API
 */
export async function enhanceVedicReportWithConvertedCharts(
  existingVedicData: any,
  astroAppData?: AstroAppChartResponse
): Promise<any> {
  try {
    let convertedCharts = null;

    // If AstroApp data is available, convert it
    if (astroAppData) {
      convertedCharts = await convertAstroAppToVedicCharts(astroAppData);
    }

    // Enhance the existing Vedic data
    const enhancedData = {
      ...existingVedicData,
      convertedCharts: convertedCharts ? {
        northIndian: {
          svg: convertedCharts.northIndian.svg,
          metadata: convertedCharts.northIndian.metadata,
          type: 'North Indian Chart',
          description: 'Traditional North Indian square format chart converted from Western data'
        },
        southIndian: {
          svg: convertedCharts.southIndian.svg,
          metadata: convertedCharts.southIndian.metadata,
          type: 'South Indian Chart',
          description: 'Traditional South Indian diamond format chart converted from Western data'
        },
        nakshatraWheel: {
          svg: convertedCharts.nakshatraWheel.svg,
          metadata: convertedCharts.nakshatraWheel.metadata,
          type: 'Nakshatra Wheel',
          description: 'Nakshatra wheel with 27 lunar mansions converted from Western data'
        }
      } : null,
      metadata: {
        ...existingVedicData.metadata,
        hasConvertedCharts: !!convertedCharts,
        conversionSource: astroAppData ? 'AstroApp' : 'None'
      }
    };

    return enhancedData;

  } catch (error) {
    console.error('Error enhancing Vedic report:', error);
    return existingVedicData; // Return original data if enhancement fails
  }
}
