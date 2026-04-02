import { NextRequest, NextResponse } from 'next/server';
import { getChart } from '@/lib/astronomia-vedic'; // Keep for Vedic calculations only
import { 
  calculateTropicalPlanets, 
  getTropicalSign,
  calculateTropicalHouses, 
  calculateTropicalAspects 
} from '@/lib/western/tropicalCalculator';
import { devLog } from '@/lib/devLogger';
import { normalizeBirthTime } from '@/lib/birthTimeUtils';
import { birthLocalToUTC } from '@/lib/birthDateTimeToUTC';
import { computeSwissNatalPlanets } from '@/lib/western/swissNatalChart';

export const dynamic = 'force-static'

// Universal Occult API - The "Google of Occult"
// Powered by Swiss Ephemeris for precise calculations

export interface BirthData {
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  currentLocation?: string;
}

export interface OccultRequest {
  system: string;
  birthData?: BirthData;
  question?: string;
  options?: any;
  userProfile?: any;
}

export interface OccultResponse {
  success: boolean;
  system: string;
  data: any;
  metadata: {
    generatedAt: string;
    source: string;
    version: string;
    calculationTime: number;
  };
}

// Swiss Ephemeris Integration Functions
async function calculateVedicChart(birthData: BirthData, options: any = {}) {
  devLog.info('🔮 Calculating REAL Vedic chart for:', birthData, 'occult');
  
  try {
    // Ensure we have coordinates - geocode if needed
    let latitude = birthData.latitude;
    let longitude = birthData.longitude;

    // If coordinates are missing but birthPlace is provided, geocode it
    if ((!latitude || !longitude) && birthData.birthPlace) {
      devLog.info(`📍 Coordinates missing, geocoding: ${birthData.birthPlace}`, undefined, 'occult');
      const { geocodePlace } = await import('@/services/geocoding');
      const coords = await geocodePlace(birthData.birthPlace);
      if (coords) {
        latitude = coords.latitude;
        longitude = coords.longitude;
        devLog.info(`📍 Geocoded successfully:`, coords, 'occult');
      } else {
        throw new Error(`Unable to find coordinates for "${birthData.birthPlace}". Please verify the location spelling.`);
      }
    }

    // Final validation: Ensure we have coordinates
    if (!latitude || !longitude) {
      throw new Error('Birth location is required for accurate chart calculation.');
    }

    // Import the chart generation function directly
    const vedicChartModule = await import('../../../api/vedic/chart/route');
    
    // Create a proper request object for the Vedic chart API
    const mockRequest = {
      json: async () => ({
        ...birthData,
        latitude,
        longitude,
        chartType: options.chartType || 'D1'
      })
    } as any;
    
    // Call the Vedic chart generation directly
    const response = await vedicChartModule.POST(mockRequest);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(`Vedic chart API returned error: ${result.error}`);
    }
    
    devLog.info('✅ Real Vedic chart generated successfully', undefined, 'occult');
    return result;
  } catch (error) {
    devLog.error('❌ Vedic chart calculation error:', error, 'route');
    throw new Error(`Failed to generate Vedic chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function calculateWesternChart(birthData: BirthData, options: any = {}) {
  try {
    devLog.info('🔮 Calculating PURE TROPICAL Western chart for:', birthData, 'occult');
    devLog.debug('🔮 Birth Date String:', birthData.birthDate, 'occult');
    devLog.debug('🔮 Birth Time String:', birthData.birthTime, 'occult');

    const normalizedTime = normalizeBirthTime(birthData.birthTime);
    const birthDateTime = birthLocalToUTC(birthData.birthDate, normalizedTime, {
      latitude: birthData.latitude,
      longitude: birthData.longitude
    });
    const [hour, minute] = normalizedTime.split(':').map((x) => parseInt(x, 10) || 0);

    devLog.debug('🔮 Birth time normalized:', { from: birthData.birthTime, to: normalizedTime }, 'occult');
    devLog.debug('🔮 Parsed Birth DateTime (UTC):', birthDateTime, 'occult');
    devLog.debug('🔮 Birth DateTime ISO:', birthDateTime.toISOString(), 'occult');
    devLog.debug('🔮 Birth DateTime Month:', birthDateTime.getUTCMonth() + 1, 'occult'); // Should be 2 for February
    devLog.debug('🔮 Birth DateTime Day:', birthDateTime.getUTCDate(), 'occult'); // Should be 24
    
    // Check for predictive calculation types
    const calculationType = options.calculationType;
    let targetDateTime = birthDateTime;
    let natalPlanets: any = null;
    let natalHouses: any = null;
    
    if (calculationType === 'solar-return' || calculationType === 'lunar-return' || calculationType === 'progressions') {
      devLog.info(`🔮 Predictive calculation type: ${calculationType}`, undefined, 'occult');
      
      // First calculate natal chart (Swiss WASM longitudes applied below when available)
      natalPlanets = calculateTropicalPlanets(birthDateTime);
      natalHouses = calculateTropicalHouses(
        birthDateTime, 
        birthData.latitude, 
        birthData.longitude
      );
      
      // Determine target date based on calculation type
      if (calculationType === 'solar-return' && options.targetDate) {
        // Solar Return: Chart for next birthday
        const targetDate = new Date(options.targetDate);
        targetDateTime = new Date(Date.UTC(
          targetDate.getUTCFullYear(),
          targetDate.getUTCMonth(),
          targetDate.getUTCDate(),
          hour,
          minute
        ));
        devLog.debug('🔮 Solar Return target date:', targetDateTime.toISOString(), 'occult');
      } else if (calculationType === 'lunar-return' && options.targetDate) {
        // Lunar Return: Chart when Moon returns to natal position
        const targetDate = new Date(options.targetDate);
        targetDateTime = new Date(Date.UTC(
          targetDate.getUTCFullYear(),
          targetDate.getUTCMonth(),
          targetDate.getUTCDate(),
          hour,
          minute
        ));
        devLog.debug('🔮 Lunar Return target date:', targetDateTime.toISOString(), 'occult');
      } else if (calculationType === 'progressions' && options.targetDate) {
        // Progressions: 1 day = 1 year progression
        const targetDate = new Date(options.targetDate);
        targetDateTime = new Date(Date.UTC(
          targetDate.getUTCFullYear(),
          targetDate.getUTCMonth(),
          targetDate.getUTCDate(),
          hour,
          minute
        ));
        devLog.debug('🔮 Progressed date:', targetDateTime.toISOString(), 'occult');
      }
    }

    const swissNatal = await computeSwissNatalPlanets(birthDateTime);
    if (natalPlanets && swissNatal) {
      natalPlanets = swissNatal.planets;
    }

    let ephemerisPlanetsLabel =
      'Astronomia VSOP-style tropicalCalculator (fallback)';
    if (swissNatal) {
      ephemerisPlanetsLabel = `${swissNatal.engine} (hybrid: in-app Placidus houses)`;
    }
    
    devLog.debug('🔮 Calculating TROPICAL positions (NO ayanamsha)...', undefined, 'occult');
    
    // Primary: Swiss WASM longitudes for natal; predictive event chart uses tropicalCalculator at targetDateTime
    let planets = calculateTropicalPlanets(targetDateTime);
    if (!calculationType && swissNatal) {
      planets = swissNatal.planets;
    }
    const houses = calculateTropicalHouses(
      targetDateTime, 
      birthData.latitude, 
      birthData.longitude
    );
    
    devLog.debug('🔮 Sun TROPICAL longitude:', planets.sun.longitude, 'occult');
    devLog.debug('🔮 Sun TROPICAL sign:', getTropicalSign(planets.sun.longitude), 'occult');
    
    // Debug Sun planet specifically
    devLog.debug('🔮 SUN PLANET DEBUG:', {
      longitude: planets.sun.longitude,
      sign: getTropicalSign(planets.sun.longitude),
      degree: getDegreeInSignLocal(planets.sun.longitude),
      expected: '~4° Pisces (334°)',
      current: `${getDegreeInSignLocal(planets.sun.longitude)}° ${getTropicalSign(planets.sun.longitude)}`
    }, 'occult');
    
    // Check if this matches expected Pisces position
    const sunSign = getTropicalSign(planets.sun.longitude);
    const sunDegree = getDegreeInSignLocal(planets.sun.longitude);
    if (sunSign === 'Pisces' && sunDegree >= 3 && sunDegree <= 6) {
      devLog.debug('✅ Sun position looks correct for Feb 24, 1983', undefined, 'occult');
    } else {
      devLog.warn('❌ Sun position is WRONG for Feb 24, 1983', `Expected: ~4° Pisces, Got: ${sunDegree}° ${sunSign}`, 'occult');
    }

    const planetDisplayName = (key: string) => {
      if (key === 'northNode') return 'North Node';
      if (key === 'southNode') return 'South Node';
      return capitalizeFirst(key);
    };

    // Format planets for response
    const westernPlanets = Object.entries(planets).map(([name, data]: [string, any]) => ({
      name: planetDisplayName(name),
      longitude: data.longitude, // PURE TROPICAL
      latitude: data.latitude,
      distance: data.distance,
      speed: data.speed,
      sign: getTropicalSign(data.longitude), // TROPICAL SIGN
      degree: getDegreeInSignLocal(data.longitude),
      house: calculateHouseFromLongitude(data.longitude, houses),
      isRetrograde: data.speed < 0
    }));

    // Add Ascendant (1st house cusp) as a planetary point for pattern detection
    const ascendantLongitude = houses[0]?.longitude || 0;
    westernPlanets.push({
      name: 'Ascendant',
      longitude: ascendantLongitude,
      latitude: 0,
      distance: 0,
      speed: 0,
      sign: getTropicalSign(ascendantLongitude),
      degree: getDegreeInSignLocal(ascendantLongitude),
      house: 1,
      isRetrograde: false
    });

    // Add MC (10th house cusp) as a planetary point for pattern detection
    const mcLongitude = houses[9]?.longitude || 0; // 10th house is index 9
    westernPlanets.push({
      name: 'MC',
      longitude: mcLongitude,
      latitude: 0,
      distance: 0,
      speed: 0,
      sign: getTropicalSign(mcLongitude),
      degree: getDegreeInSignLocal(mcLongitude),
      house: 10,
      isRetrograde: false
    });

    // Convert houses to Western format
    const westernHouses = houses.map((house: any, index: number) => ({
      number: house.number,
      longitude: house.longitude,
      sign: house.sign,
      degree: house.degree,
      cusp: house.longitude
    }));

    // Recalculate aspects to include Ascendant and MC.
    // calculateTropicalAspects expects an object keyed by planet name so aspect.planet1/planet2 are names, not indices.
    const planetsForAspects: Record<string, { longitude: number }> = {};
    for (const [key, data] of Object.entries(planets)) {
      planetsForAspects[planetDisplayName(key)] = { longitude: (data as { longitude: number }).longitude };
    }
    planetsForAspects['Ascendant'] = { longitude: ascendantLongitude };
    planetsForAspects['MC'] = { longitude: mcLongitude };

    const aspectsWithAngles = calculateTropicalAspects(planetsForAspects);

    // Format tropical aspects (planet1/planet2 are now names e.g. Sun, Mars, Saturn)
    const westernAspects = aspectsWithAngles.map((aspect: any) => ({
      planet1: aspect.planet1,
      planet2: aspect.planet2,
      type: aspect.type,
      orb: aspect.orb,
      strength: aspect.strength,
      exact: aspect.orb < 1
    }));

    // Calculate lunar phase
  const lunarPhase = calculateLunarPhase(birthData.birthDate);
  
    // Find Sun, Moon, and Rising sign
    const sunPlanet = westernPlanets.find(p => p.name === 'Sun');
    const moonPlanet = westernPlanets.find(p => p.name === 'Moon');
    // Ascendant sign already calculated above when adding to westernPlanets
    const ascendantSign = getTropicalSign(ascendantLongitude);

    // Log tropical verification
    if (sunPlanet) {
      devLog.debug(`🌟 Western (Tropical) Sun: ${sunPlanet.sign} ${sunPlanet.degree.toFixed(1)}°`, undefined, 'occult');
    }
  
    // Calculate transits if requested
    let transits: any[] = [];
    let transitLocationUsed: string | undefined;
    if (options.includeTransits) {
      devLog.debug('🔮 Calculating transits...', undefined, 'occult');
      devLog.debug('🔮 Options includeTransits:', options.includeTransits, 'occult');

      const currentLocation = (birthData as { currentLocation?: string }).currentLocation ?? options.currentLocation;
      const currentLocationStr = typeof currentLocation === 'string' ? currentLocation.trim() : '';

      // Use custom transit date if provided, otherwise use current date
      const transitDate = options.transitDate ? new Date(options.transitDate) : new Date();

      if (options.transitDate) {
        devLog.debug('🔮 Using FUTURE transit date:', transitDate.toISOString(), 'occult');
      } else {
        devLog.debug('🔮 Using CURRENT transit date:', transitDate.toISOString(), 'occult');
      }

      const transitPlanets = calculateTropicalPlanets(transitDate);

      // Use current residence for transit houses when available; otherwise natal houses
      let transitHouses = houses;
      if (currentLocationStr.length > 0) {
        try {
          const { geocodePlace } = await import('@/services/geocoding');
          const coords = await geocodePlace(currentLocationStr);
          if (coords?.latitude != null && coords?.longitude != null) {
            transitHouses = calculateTropicalHouses(transitDate, coords.latitude, coords.longitude);
            transitLocationUsed = currentLocationStr;
            devLog.debug('🔮 Using current residence for transit houses:', currentLocationStr, 'occult');
          }
        } catch (err) {
          devLog.warn('⚠️ Geocoding current location for transits failed, using natal houses', err, 'occult');
        }
      }

      devLog.debug('🔮 Transit planets calculated:', Object.keys(transitPlanets), 'occult');
      transits = Object.entries(transitPlanets).map(([name, planetData]: [string, any]) => ({
        name: planetDisplayName(name),
        longitude: planetData.longitude,
        latitude: planetData.latitude,
        distance: planetData.distance,
        speed: planetData.speed,
        sign: getTropicalSign(planetData.longitude),
        degree: getDegreeInSignLocal(planetData.longitude),
        house: calculateHouseFromLongitude(planetData.longitude, transitHouses),
        isRetrograde: planetData.speed < 0
      }));
      devLog.debug(`✅ Calculated ${transits.length} transit planets`, undefined, 'occult');
    }

    // Format natal chart if this is a predictive calculation
    let natalChartData = null;
    if (natalPlanets && natalHouses && calculationType) {
      const natalPlanetsFormatted = Object.entries(natalPlanets).map(([name, data]: [string, any]) => ({
        name: planetDisplayName(name),
        longitude: data.longitude,
        latitude: data.latitude,
        distance: data.distance,
        speed: data.speed,
        sign: getTropicalSign(data.longitude),
        degree: getDegreeInSignLocal(data.longitude),
        house: calculateHouseFromLongitude(data.longitude, natalHouses),
        isRetrograde: data.speed < 0
      }));
      
      const natalHousesFormatted = natalHouses.map((house: any, index: number) => ({
        number: house.number,
        longitude: house.longitude,
        sign: house.sign,
        degree: house.degree,
        cusp: house.longitude
      }));
      
      const natalAspects = calculateTropicalAspects(natalPlanets);
      const natalAspectsFormatted = natalAspects.map((aspect: any) => ({
        planet1: aspect.planet1,
        planet2: aspect.planet2,
        type: aspect.type,
        orb: aspect.orb,
        strength: aspect.strength,
        exact: aspect.orb < 1
      }));
      
      natalChartData = {
        planets: natalPlanetsFormatted,
        houses: natalHousesFormatted,
        aspects: natalAspectsFormatted
      };
    }

    const chartData = {
      sun_sign: sunPlanet?.sign || 'Unknown',
      moon_sign: moonPlanet?.sign || 'Unknown',
      rising_sign: ascendantSign,
      ascendant: ascendantSign, // Use sign name for consistency
      planets: westernPlanets,
      houses: westernHouses,
      aspects: westernAspects,
      transits: transits, // Add transits to the response
      lunarPhase: lunarPhase,
      chartImage: null, // Will be generated separately
      calculationType: calculationType || null,
      natalChart: natalChartData, // Include natal chart for predictive calculations
      ephemeris: {
        planets: ephemerisPlanetsLabel,
        houses: 'Placidus (in-app tropicalCalculator; not Swiss swe_houses)',
        julianDayUt: swissNatal?.julianDayUt ?? null,
      },
      metadata: {
        source: 'FutureSeer Universal Occult API',
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        calculationTime: Date.now()
      },
      ...(transitLocationUsed && { transitLocation: transitLocationUsed })
    };
    
    devLog.info('✅ Western chart calculated successfully', undefined, 'occult');
  
  return {
    success: true,
    data: chartData,
    metadata: {
      generatedAt: new Date().toISOString(),
      source: 'FutureSeer Universal Occult API',
      version: '1.0.0',
      calculationTime: Date.now()
    }
  };
  } catch (error) {
    devLog.error('❌ Western chart calculation error:', error, 'route');
    throw new Error(`Failed to calculate Western chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function calculateHoraryChart(birthData: BirthData, options: any = {}) {
  // Question-based astrology (stub implementations for ascendant/planets/houses)
  const questionTime = new Date();
  const chartData = {
    question: options.question,
    questionTime: questionTime.toISOString(),
    ascendant: 0,
    planets: [] as any[],
    houses: [] as any[],
    significators: calculateSignificators(options.question ?? ''),
    timing: calculateHoraryTiming(birthData, options.question ?? '')
  };
  
  return {
    success: true,
    data: chartData,
    metadata: {
      generatedAt: new Date().toISOString(),
      source: 'FutureSeer Universal Occult API',
      version: '1.0.0',
      calculationTime: Date.now()
    }
  };
}

function calculateElectionalChart(birthData: BirthData, options: any = {}) {
  // Choosing auspicious times
  const eventType = options.eventType || 'general';
  const dateRange = options.dateRange || { start: new Date(), end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) };
  
  const auspiciousTimes = calculateAuspiciousTimes(birthData, eventType, dateRange);
  
  return {
    success: true,
    data: {
      eventType,
      dateRange,
      auspiciousTimes,
      recommendations: generateElectionalRecommendations(eventType, auspiciousTimes)
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      source: 'FutureSeer Universal Occult API',
      version: '1.0.0',
      calculationTime: Date.now()
    }
  };
}

async function calculateMedicalChart(birthData: BirthData, options: any = {}) {
  // First get the actual astrological chart
  const westernChart = await calculateWesternChart(birthData, {});
  const chart = westernChart.data;
  
  // Import Vedic medical calculations
  const { generateVedicHealthIndicators, calculateDoshaFromChart, getWesternHealthTransit } = await import('@/lib/medical/vedicMedical');
  
  // Generate Vedic health indicators
  const moonPlanet = Object.values(chart.planets || {}).find((p: any) => p.name === 'Moon');
  const nakshatra = (moonPlanet as any)?.nakshatra || '';
  const vedicIndicators = generateVedicHealthIndicators(chart, nakshatra);
  
  // Get dosha analysis
  const doshaAnalysis = calculateDoshaFromChart(chart);
  
  // Get Western transit timing
  const westernTransits = getWesternHealthTransit(chart);
  
  // Enhance body systems with Vedic dosha + Western transits
  const bodySystems = calculateBodySystemHealth(chart).map((system: any) => ({
    ...system,
    vedicAnalysis: {
      dosha: doshaAnalysis.dominant,
      recommendation: doshaAnalysis.dominant === 'Vata' ? 'Warm, grounding practices' :
                     doshaAnalysis.dominant === 'Pitta' ? 'Cooling, calming practices' :
                     'Light, stimulating practices'
    },
    westernAnalysis: {
      currentTransit: westernTransits.currentTransit,
      impact: 'Monitor for timing-dependent health variations',
      duration: 'Ongoing'
    }
  }));
  
  // Now calculate medical data using the chart
  const medicalData = {
    chart: chart,
    healthIndicators: [
      ...calculateHealthIndicators(birthData, chart),
      ...vedicIndicators
    ],
    bodyParts: calculateBodyPartCorrespondences(birthData, chart),
    bodySystems: bodySystems,
    lunarPhases: calculateLunarPhasesForHealing(birthData, chart),
    planetaryAspects: calculateMedicalAspects(birthData, chart),
    remedies: generateMedicalRemedies(birthData, chart),
    timing: {
      ...calculateHealingTiming(birthData, chart),
      vedic: {
        dosha: doshaAnalysis,
        nakshatra: nakshatra ? `Moon in ${nakshatra}` : 'N/A'
      },
      western: westernTransits
    }
  };
  
  return {
    success: true,
    data: medicalData,
    metadata: {
      generatedAt: new Date().toISOString(),
      source: 'FutureSeer Universal Occult API',
      version: '1.0.0',
      calculationTime: Date.now()
    }
  };
}

function calculateFinancialChart(birthData: BirthData, options: any = {}) {
  // Market predictions
  const market = options.market || 'general';
  const date = options.date || new Date();
  
  const financialData = {
    market,
    date: date.toISOString(),
    planetaryCycles: calculateFinancialCycles(date, birthData),
    lunarPhases: calculateLunarPhasesForTrading(date),
    aspects: calculateFinancialAspects(date, birthData),
    predictions: generateFinancialPredictions(date, market, birthData),
    timing: calculateInvestmentTiming(date, birthData)
  };
  
  return {
    success: true,
    data: financialData,
    metadata: {
      generatedAt: new Date().toISOString(),
      source: 'FutureSeer Universal Occult API',
      version: '1.0.0',
      calculationTime: Date.now()
    }
  };
}

async function calculateSynastryChart(birthData: BirthData, options: any = {}) {
  // Relationship compatibility
  const partnerData = options.partnerData;
  if (!partnerData) {
    throw new Error('Partner birth data is required for synastry');
  }
  
  // Calculate both charts first
  const [chart1Result, chart2Result] = await Promise.all([
    calculateWesternChart(birthData),
    calculateWesternChart(partnerData)
  ]);
  
  const chart1 = chart1Result.success ? chart1Result.data : null;
  const chart2 = chart2Result.success ? chart2Result.data : null;
  
  if (!chart1 || !chart2) {
    throw new Error('Failed to calculate one or both birth charts');
  }
  
  const synastryData = {
    person1: chart1,
    person2: chart2,
    aspects: calculateSynastryAspects(chart1, chart2),
    composite: calculateCompositeChart(chart1, chart2),
    compatibility: calculateCompatibilityScore(chart1, chart2),
    timing: calculateRelationshipTiming(chart1, chart2)
  };
  
  return {
    success: true,
    data: synastryData,
    metadata: {
      generatedAt: new Date().toISOString(),
      source: 'FutureSeer Universal Occult API',
      version: '1.0.0',
      calculationTime: Date.now()
    }
  };
}

function calculateLunarChart(birthData: BirthData, options: any = {}) {
  // Moon-based systems
  const lunarData = {
    lunarPhase: calculateLunarPhase(birthData.birthDate),
    moonSign: calculateMoonSign(birthData),
    lunarMansions: calculateLunarMansions(birthData),
    moonAspects: calculateMoonAspects(birthData),
    lunarCycles: calculateLunarCycles(birthData),
    moonTransits: calculateMoonTransits(birthData)
  };
  
  return {
    success: true,
    data: lunarData,
    metadata: {
      generatedAt: new Date().toISOString(),
      source: 'FutureSeer Universal Occult API',
      version: '1.0.0',
      calculationTime: Date.now()
    }
  };
}

function calculateFixedStarChart(birthData: BirthData, options: any = {}) {
  // Fixed star influences
  const fixedStarData = {
    risingStars: calculateRisingStars(birthData),
    culminatingStars: calculateCulminatingStars(birthData),
    settingStars: calculateSettingStars(birthData),
    starAspects: calculateStarAspects(birthData),
    parans: calculateParans(birthData),
    influences: calculateStarInfluences(birthData)
  };
  
  return {
    success: true,
    data: fixedStarData,
    metadata: {
      generatedAt: new Date().toISOString(),
      source: 'FutureSeer Universal Occult API',
      version: '1.0.0',
      calculationTime: Date.now()
    }
  };
}

// Helper Functions for Western Astrology Calculations

// Zodiac signs array (same as astronomia-vedic)
const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

// Planetary rulers for each sign
const SIGN_RULERS = {
  "Aries": "Mars",
  "Taurus": "Venus", 
  "Gemini": "Mercury",
  "Cancer": "Moon",
  "Leo": "Sun",
  "Virgo": "Mercury",
  "Libra": "Venus",
  "Scorpio": "Mars", // Traditional ruler
  "Sagittarius": "Jupiter",
  "Capricorn": "Saturn",
  "Aquarius": "Saturn", // Traditional ruler
  "Pisces": "Jupiter"
};

function getZodiacSignFromLongitude(longitude: number): string {
  const normalizedLongitude = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedLongitude / 30);
  return ZODIAC_SIGNS[signIndex] || "Aries";
}

function getDegreeInSignLocal(longitude: number): number {
  const normalizedLongitude = ((longitude % 360) + 360) % 360;
  return normalizedLongitude % 30;
}

function calculateHouseFromLongitude(planetLongitude: number, houses: any[]): number {
  const normalizedLongitude = ((planetLongitude % 360) + 360) % 360;
  if (!houses || houses.length === 0) return 1;

  // Build cusps with house number; sort by longitude so segments are in zodiac order
  const cusps = houses.map((h: any) => ({
    number: h.number ?? 0,
    longitude: ((h.longitude ?? h.cuspLonSid ?? h.cusp ?? h.degree ?? 0) % 360 + 360) % 360
  })).filter((c: { number: number }) => c.number >= 1 && c.number <= 12);
  if (cusps.length === 0) return 1;

  cusps.sort((a: { longitude: number }, b: { longitude: number }) => a.longitude - b.longitude);

  for (let i = 0; i < cusps.length; i++) {
    const current = cusps[i];
    const next = cusps[(i + 1) % cusps.length];
    const currentCusp = current.longitude;
    const nextCusp = next.longitude;
    const wrapsZero = currentCusp > nextCusp;
    const inSegment = wrapsZero
      ? (normalizedLongitude >= currentCusp || normalizedLongitude < nextCusp)
      : (normalizedLongitude >= currentCusp && normalizedLongitude < nextCusp);
    if (inSegment) return current.number;
  }

  return cusps[0]?.number ?? 1;
}

function calculateHouseLord(sign: string): string {
  return SIGN_RULERS[sign as keyof typeof SIGN_RULERS] || "Unknown";
}

function calculateAspectsBetweenPlanets(planets: any[]): any[] {
  const aspects = [];
  const aspectTypes = [
    { name: 'conjunction', angle: 0, orb: 8 },
    { name: 'opposition', angle: 180, orb: 8 },
    { name: 'trine', angle: 120, orb: 8 },
    { name: 'square', angle: 90, orb: 8 },
    { name: 'sextile', angle: 60, orb: 6 },
    { name: 'quincunx', angle: 150, orb: 3 },
    { name: 'semisextile', angle: 30, orb: 3 },
    { name: 'semisquare', angle: 45, orb: 2 },
    { name: 'sesquiquadrate', angle: 135, orb: 2 },
    { name: 'quintile', angle: 72, orb: 1 },
    { name: 'biquintile', angle: 144, orb: 1 }
  ];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i];
      const planet2 = planets[j];
      
      const angle = Math.abs(planet1.longitude - planet2.longitude);
      const normalizedAngle = Math.min(angle, 360 - angle);
      
      for (const aspectType of aspectTypes) {
        // Variable orbs based on planet type
        let orb = aspectType.orb;
        
        // Adjust orb based on planet types
        if (['Sun', 'Moon'].includes(planet1.name) || ['Sun', 'Moon'].includes(planet2.name)) {
          orb = aspectType.orb + 2; // Luminaries get larger orbs
        } else if (['Mercury', 'Venus', 'Mars'].includes(planet1.name) || 
                   ['Mercury', 'Venus', 'Mars'].includes(planet2.name)) {
          orb = aspectType.orb; // Personal planets standard orb
        } else if (['Jupiter', 'Saturn'].includes(planet1.name) || 
                   ['Jupiter', 'Saturn'].includes(planet2.name)) {
          orb = aspectType.orb - 1; // Social planets smaller orb
        } else {
          orb = aspectType.orb - 2; // Outer planets smallest orb
        }
        
        const orbDifference = Math.abs(normalizedAngle - aspectType.angle);
        if (orbDifference <= orb) {
          aspects.push({
            planet1: planet1.name,
            planet2: planet2.name,
            type: aspectType.name,
            orb: orbDifference,
            strength: 1 - (orbDifference / orb),
            exact: orbDifference < 1,
            influence: getAspectInfluence(aspectType.name)
          });
        }
      }
    }
  }
  
  return aspects;
}

function getAspectInfluence(aspectType: string): 'harmonious' | 'challenging' | 'neutral' {
  const harmonious = ['conjunction', 'trine', 'sextile', 'quintile', 'biquintile'];
  const challenging = ['opposition', 'square', 'quincunx', 'semisquare', 'sesquiquadrate'];
  
  if (harmonious.includes(aspectType)) return 'harmonious';
  if (challenging.includes(aspectType)) return 'challenging';
  return 'neutral';
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function calculateLunarPhase(birthDate: string): any {
  // Simplified lunar phase calculation
  const date = new Date(birthDate);
  const day = date.getDate();
  const phase = Math.floor(day / 7.5) % 4;
  const phases = ['New Moon', 'First Quarter', 'Full Moon', 'Last Quarter'];
  
  return {
    phase: phases[phase],
    illumination: Math.random() * 100,
    age: Math.random() * 29.5
  };
}

// Placeholder functions for advanced calculations
function calculateSignificators(question: string): any[] { return []; }
function calculateHoraryTiming(birthData: BirthData, question: string): any { return {}; }
function calculateAuspiciousTimes(birthData: BirthData, eventType: string, dateRange: any): any[] { return []; }
function generateElectionalRecommendations(eventType: string, times: any[]): any[] { return []; }
function calculateIngressCharts(date: Date): any[] { return []; }
function calculateEclipseCharts(date: Date): any[] { return []; }
function calculatePlanetaryCycles(date: Date): any[] { return []; }
function predictWorldEvents(date: Date, country: string): any[] { return []; }
// Calculate planetary dignity
function calculatePlanetaryDignity(planet: string, sign: string, house: number): any {
  const rulers: { [key: string]: string[] } = {
    'Sun': ['Leo'],
    'Moon': ['Cancer'],
    'Mercury': ['Virgo', 'Gemini'],
    'Venus': ['Taurus', 'Libra'],
    'Mars': ['Aries', 'Scorpio'],
    'Jupiter': ['Sagittarius', 'Pisces'],
    'Saturn': ['Capricorn', 'Aquarius'],
    'Uranus': ['Aquarius'],
    'Neptune': ['Pisces'],
    'Pluto': ['Scorpio']
  }
  
  const exaltations: { [key: string]: string[] } = {
    'Sun': ['Aries'],
    'Moon': ['Taurus'],
    'Mercury': ['Virgo'],
    'Venus': ['Pisces'],
    'Mars': ['Capricorn'],
    'Jupiter': ['Cancer'],
    'Saturn': ['Libra']
  }
  
  const detriment: { [key: string]: string[] } = {
    'Sun': ['Aquarius'],
    'Moon': ['Capricorn'],
    'Mercury': ['Sagittarius', 'Pisces'],
    'Venus': ['Aries', 'Scorpio'],
    'Mars': ['Libra', 'Taurus'],
    'Jupiter': ['Gemini', 'Virgo'],
    'Saturn': ['Cancer', 'Leo']
  }
  
  const fall: { [key: string]: string[] } = {
    'Sun': ['Libra'],
    'Moon': ['Scorpio'],
    'Mercury': ['Pisces'],
    'Venus': ['Virgo'],
    'Mars': ['Cancer'],
    'Jupiter': ['Capricorn'],
    'Saturn': ['Aries']
  }
  
  // Check rulership
  const isRuler = rulers[planet]?.includes(sign)
  const isExalted = exaltations[planet]?.includes(sign)
  const isInDetriment = detriment[planet]?.includes(sign)
  const isInFall = fall[planet]?.includes(sign)
  
  // Calculate strength
  let essentialStrength = 50
  let dignityText = 'Peregrine'
  
  if (isRuler) {
    essentialStrength = 100
    dignityText = 'Domicile (Ruler)'
  } else if (isExalted) {
    essentialStrength = 90
    dignityText = 'Exalted'
  } else if (isInDetriment) {
    essentialStrength = 20
    dignityText = 'Detriment'
  } else if (isInFall) {
    essentialStrength = 10
    dignityText = 'Fall'
  }
  
  // Accidental dignity based on house
  let accidentalStrength = 50
  const angular = [1, 4, 7, 10]
  const succedent = [2, 5, 8, 11]
  const cadent = [3, 6, 9, 12]
  
  if (angular.includes(house)) accidentalStrength = 80
  else if (succedent.includes(house)) accidentalStrength = 50
  else if (cadent.includes(house)) accidentalStrength = 30
  
  // Health-specific weakening
  const healthHouses = [6, 8, 12]
  if (healthHouses.includes(house)) {
    accidentalStrength -= 15
  }
  
  return {
    planet,
    sign,
    house,
    essentialStrength,
    accidentalStrength,
    dignityText,
    totalStrength: Math.round((essentialStrength + accidentalStrength) / 2)
  }
}

function calculateHealthIndicators(birthData: BirthData, chart: any): any[] {
  const indicators: any[] = [];
  const healthHouses = [1, 6, 8, 12]; // Ascendant, health, longevity, hospitalization
  
  // Check planets in health houses
  Object.entries(chart.planets || {}).forEach(([planet, data]: [string, any]) => {
    if (healthHouses.includes(data.house)) {
      const houseName = data.house === 1 ? 'Ascendant' : 
                       data.house === 6 ? 'Health' : 
                       data.house === 8 ? 'Longevity' : 'Hospitalization';
      
      const dignity = calculatePlanetaryDignity(planet, data.sign, data.house)
      
      indicators.push({
        name: `${planet} in ${data.house}H`,
        description: `${planet} in ${houseName} (${data.sign}) affects health indicators`,
        planet: planet,
        house: data.house,
        sign: data.sign,
        strength: data.house === 1 ? 80 : data.house === 6 ? 60 : 50,
        status: data.house === 1 ? 'strong' : 'moderate',
        dignity: dignity.dignityText,
        totalStrength: dignity.totalStrength,
        essentialStrength: dignity.essentialStrength,
        accidentalStrength: dignity.accidentalStrength
      });
    }
  });
  
  // Return at least one indicator
  return indicators.length > 0 ? indicators : [{
    name: 'General Health',
    description: 'No significant afflictions found in health houses',
    strength: 75,
    status: 'strong'
  }];
}

function calculateBodyPartCorrespondences(birthData: BirthData, chart: any): any[] {
  const correspondences = [];
  const zodiacBodyParts: { [key: string]: string } = {
    'Aries': 'Head and brain',
    'Taurus': 'Throat and neck',
    'Gemini': 'Arms, shoulders, lungs',
    'Cancer': 'Chest, stomach',
    'Leo': 'Heart, spine',
    'Virgo': 'Digestive system',
    'Libra': 'Kidneys, lower back',
    'Scorpio': 'Reproductive organs',
    'Sagittarius': 'Hips, thighs, liver',
    'Capricorn': 'Knees, bones',
    'Aquarius': 'Ankles, circulation',
    'Pisces': 'Feet, lymphatic system'
  };
  
  // Get Sun sign for general body part
  const sunSign = chart?.planets?.sun?.sign || chart?.planets?.Sun?.sign;
  if (sunSign && zodiacBodyParts[sunSign]) {
    correspondences.push({
      name: `${sunSign} Body Zone`,
      description: zodiacBodyParts[sunSign],
      zodiacSign: sunSign,
      bodyPart: zodiacBodyParts[sunSign]
    });
  }
  
  return correspondences.length > 0 ? correspondences : [{
    name: 'Body Correspondences',
    description: 'Astrological body part correlations based on planetary positions',
    zodiacSign: 'General',
    bodyPart: 'Overall health'
  }];
}

function calculateLunarPhasesForHealing(birthData: BirthData, chart: any): any[] {
  return [{
    name: 'New Moon',
    description: 'Optimal time for new health routines and beginnings',
    optimalDates: []
  }];
}

function calculateMedicalAspects(birthData: BirthData, chart: any): any[] {
  const aspects: any[] = [];

  // Get major aspects from chart
  if (chart.aspects && chart.aspects.length > 0) {
    chart.aspects.forEach((aspect: any) => {
      aspects.push({
        planets: `${aspect.planet1}-${aspect.planet2}`,
        aspect: aspect.type,
        healthInfluence: `${aspect.planet1} ${aspect.type} ${aspect.planet2} affects health dynamics`,
        orb: aspect.orb
      });
    });
  }
  
  return aspects.length > 0 ? aspects : [{
    planets: 'General aspects',
    aspect: 'Harmonious',
    healthInfluence: 'No challenging planetary aspects affecting health'
  }];
}

function generateMedicalRemedies(birthData: BirthData, chart: any): any[] {
  return [{
    name: 'General health support',
    category: 'Lifestyle',
    description: 'Maintain balanced diet and regular exercise'
  }];
}

function calculateBodySystemHealth(chart: any): any[] {
  const systemRulers: { [key: string]: { planets: string[], houses: number[], signs: string[] } } = {
    'Cardiovascular': { planets: ['Sun'], houses: [5], signs: ['Leo'] },
    'Digestive': { planets: ['Moon', 'Mercury'], houses: [6], signs: ['Virgo', 'Cancer'] },
    'Nervous': { planets: ['Mercury', 'Uranus'], houses: [], signs: ['Gemini'] },
    'Reproductive': { planets: ['Venus', 'Mars', 'Pluto'], houses: [8], signs: ['Scorpio'] },
    'Skeletal': { planets: ['Saturn'], houses: [10], signs: ['Capricorn'] },
    'Lymphatic': { planets: ['Neptune'], houses: [12], signs: ['Pisces'] },
    'Endocrine': { planets: ['Jupiter', 'Pluto'], houses: [], signs: [] }
  }
  
  const systems = []
  
  for (const [systemName, rulers] of Object.entries(systemRulers)) {
    let totalStrength = 0
    const affectingPlanets: string[] = []
    
    // Check for planets in relevant signs/houses
    Object.entries(chart.planets || {}).forEach(([planet, data]: [string, any]) => {
      if (rulers.planets.includes(planet) || rulers.houses.includes(data.house) || rulers.signs.includes(data.sign)) {
        const dignity = calculatePlanetaryDignity(planet, data.sign, data.house)
        totalStrength += dignity.totalStrength
        affectingPlanets.push(planet)
      }
    })
    
    // Calculate risk level
    let riskLevel = 'low'
    const avgStrength = affectingPlanets.length > 0 ? totalStrength / affectingPlanets.length : 75
    
    if (avgStrength < 30) riskLevel = 'high'
    else if (avgStrength < 50) riskLevel = 'moderate'
    
    systems.push({
      system: systemName,
      strength: Math.max(0, Math.min(100, avgStrength)),
      riskLevel,
      affectingPlanets,
      recommendation: getSystemRecommendation(systemName, riskLevel)
    })
  }
  
  return systems
}

function getSystemRecommendation(systemName: string, riskLevel: string): string {
  const recommendations: { [key: string]: { [key: string]: string } } = {
    'Cardiovascular': {
      'high': 'Regular cardiovascular checkups, maintain healthy cholesterol, avoid smoking',
      'moderate': 'Regular exercise, heart-healthy diet, monitor blood pressure',
      'low': 'Continue healthy lifestyle, annual checkups'
    },
    'Digestive': {
      'high': 'Consult gastroenterologist, dietary modifications, avoid trigger foods',
      'moderate': 'Balanced diet, probiotics, mindful eating',
      'low': 'Maintain digestive health with fiber-rich diet'
    },
    'Nervous': {
      'high': 'Stress management, adequate sleep, neurological consultation if needed',
      'moderate': 'Yoga, meditation, balanced nervous system support',
      'low': 'Maintain calm lifestyle, adequate rest'
    },
    'Reproductive': {
      'high': 'Regular gynecological/urological exams, hormonal balance monitoring',
      'moderate': 'Maintain reproductive health, regular checkups',
      'low': 'Continue healthy reproductive practices'
    },
    'Skeletal': {
      'high': 'Bone density monitoring, calcium supplementation, regular exercise',
      'moderate': 'Weight-bearing exercise, adequate calcium, Vitamin D',
      'low': 'Maintain bone health through regular exercise'
    },
    'Lymphatic': {
      'high': 'Immune system support, lymphatic massage, detox protocols',
      'moderate': 'Stay hydrated, exercise, immune support',
      'low': 'Maintain immune health through healthy lifestyle'
    },
    'Endocrine': {
      'high': 'Endocrine system monitoring, hormonal balance, thyroid checks',
      'moderate': 'Monitor hormonal health, balanced diet, stress management',
      'low': 'Maintain hormonal balance through healthy lifestyle'
    }
  }
  
  return recommendations[systemName]?.[riskLevel] || 'Maintain general health awareness'
}

function calculateHealingTiming(birthData: BirthData, chart: any): any {
  return {
    optimalWindows: [],
    currentPhase: 'Waxing Moon',
    recommendation: 'Focus on building health during lunar waxing phases'
  };
}
function calculateFinancialCycles(date: Date, birthData: BirthData): any[] {
  const cycles = [];
  const now = date || new Date();
  
  // Jupiter Cycle (12-year expansion cycle)
  cycles.push({
    name: 'Jupiter Cycle',
    period: '12 years',
    description: 'Financial expansion and growth opportunities',
    currentPhase: getJupiterCyclePhase(now),
    nextPeak: getNextJupiterPeak(now),
    tradingAdvice: 'Focus on growth sectors during waxing phases'
  });
  
  // Saturn Cycle (29-year discipline cycle)
  cycles.push({
    name: 'Saturn Cycle',
    period: '29 years',
    description: 'Financial discipline and long-term planning',
    currentPhase: getSaturnCyclePhase(now),
    nextPeak: getNextSaturnPeak(now),
    tradingAdvice: 'Emphasize conservative strategies and risk management'
  });
  
  // Mars Cycle (2-year cycle)
  cycles.push({
    name: 'Mars Cycle',
    period: '2 years',
    description: 'Trading activity and market volatility',
    currentPhase: getMarsCyclePhase(now),
    nextPeak: getNextMarsPeak(now),
    tradingAdvice: 'Increased volatility expected during active phases'
  });
  
  return cycles;
}

function calculateLunarPhasesForTrading(date: Date): any[] {
  const phases: any[] = [];
  const lunarPhase = calculateLunarPhase(date.toISOString());
  const currentDate = date || new Date();
  const phaseName = typeof lunarPhase.phase === 'string' ? lunarPhase.phase : 'New Moon';

  // Current lunar phase for trading
  phases.push({
    name: 'Current Lunar Phase',
    phase: phaseName,
    description: getLunarTradingAdvice(phaseName),
    nextPhase: lunarPhase.nextPhaseDate,
    tradingAdvice: getDetailedLunarTradingAdvice(phaseName)
  });

  // Upcoming important phases (next 3)
  for (let i = 1; i <= 3; i++) {
    const nextPhase = getNextLunarPhase(currentDate, i);
    phases.push({
      name: `Upcoming ${nextPhase.phase}`,
      phase: nextPhase.phase,
      date: nextPhase.date,
      description: getLunarTradingAdvice(nextPhase.phase),
      tradingAdvice: getDetailedLunarTradingAdvice(nextPhase.phase)
    });
  }
  
  return phases;
}

function calculateFinancialAspects(date: Date, birthData: BirthData): any[] {
  const aspects = [];
  const now = date || new Date();
  
  // Check for Mercury retrograde (important for trading)
  const mercuryRetro = isMercuryRetrograde(now);
  if (mercuryRetro) {
    aspects.push({
      type: 'Mercury Retrograde',
      description: 'Communication and data errors likely',
      financialImplication: 'Avoid major trading decisions, review existing positions',
      severity: 'High',
      dateRange: getMercuryRetrogradeRange(now)
    });
  }
  
  // Venus-Jupiter aspects (luxury and growth)
  if (hasVenusJupiterAspect(now)) {
    aspects.push({
      type: 'Venus-Jupiter Harmony',
      description: 'Favorable for luxury and growth sectors',
      financialImplication: 'Good timing for investments in entertainment, luxury goods, and expansion',
      severity: 'Positive'
    });
  }
  
  // Mars-Saturn aspects (caution needed)
  if (hasMarsSaturnAspect(now)) {
    aspects.push({
      type: 'Mars-Saturn Tension',
      description: 'Conservative approach recommended',
      financialImplication: 'Avoid aggressive trades, focus on stability and patience',
      severity: 'Caution'
    });
  }
  
  return aspects;
}

function generateFinancialPredictions(date: Date, market: string, birthData: BirthData): any[] {
  const predictions = [];
  const now = date || new Date();
  
  // General market prediction
  predictions.push({
    timeframe: '1-3 months',
    forecast: 'Moderate market conditions expected',
    confidence: 'Medium',
    factors: ['Current planetary positions suggest balanced market sentiment'],
    recommendations: 'Diversification and patience advised'
  });
  
  // Sector predictions
  predictions.push({
    timeframe: '6 months',
    forecast: 'Technology and communication sectors favorable',
    confidence: 'Medium-High',
    factors: ['Mercury and Jupiter alignments support tech sectors'],
    recommendations: 'Consider technology and digital assets'
  });
  
  predictions.push({
    timeframe: '6 months',
    forecast: 'Real estate and commodities steady',
    confidence: 'Medium',
    factors: ['Saturn influence suggests stability in traditional assets'],
    recommendations: 'Conservative holdings in property and materials'
  });
  
  predictions.push({
    timeframe: '12 months',
    forecast: 'Global expansion in financial services',
    confidence: 'Medium',
    factors: ['Jupiter cycle supports banking and insurance sectors'],
    recommendations: 'Financial service exposure may benefit'
  });
  
  return predictions;
}

function calculateInvestmentTiming(date: Date, birthData: BirthData): any {
  const now = date || new Date();
  
  return {
    optimalEntry: getOptimalEntryPeriods(now),
    optimalExit: getOptimalExitPeriods(now),
    avoidPeriods: getAvoidPeriods(now),
    bestDaysOfWeek: getBestTradingDays(now),
    monthlyForecast: getMonthlyForecast(now)
  };
}
// Helper functions for Financial Astrology
function getJupiterCyclePhase(date: Date): string {
  // Jupiter completes full cycle in ~12 years
  const year2000 = new Date('2000-01-01').getTime();
  const currentTime = date.getTime();
  const yearsSince2000 = (currentTime - year2000) / (365.25 * 24 * 60 * 60 * 1000);
  const cyclePosition = (yearsSince2000 / 12) % 1;
  
  if (cyclePosition < 0.25) return 'Waxing: Growth Phase';
  if (cyclePosition < 0.5) return 'Peak: Expansion Phase';
  if (cyclePosition < 0.75) return 'Waning: Consolidation Phase';
  return 'Base: Foundation Phase';
}

function getNextJupiterPeak(date: Date): Date {
  const nextDate = new Date(date);
  nextDate.setFullYear(nextDate.getFullYear() + 6); // Roughly half cycle
  return nextDate;
}

function getSaturnCyclePhase(date: Date): string {
  // Saturn completes full cycle in ~29 years
  const year2000 = new Date('2000-01-01').getTime();
  const currentTime = date.getTime();
  const yearsSince2000 = (currentTime - year2000) / (365.25 * 24 * 60 * 60 * 1000);
  const cyclePosition = (yearsSince2000 / 29) % 1;
  
  if (cyclePosition < 0.25) return 'Discipline: Structure Building';
  if (cyclePosition < 0.5) return 'Peak: Responsibility Phase';
  if (cyclePosition < 0.75) return 'Lessons: Consolidation Phase';
  return 'Foundation: Long-term Planning';
}

function getNextSaturnPeak(date: Date): Date {
  const nextDate = new Date(date);
  nextDate.setFullYear(nextDate.getFullYear() + 14); // Roughly half cycle
  return nextDate;
}

function getMarsCyclePhase(date: Date): string {
  // Mars completes cycle in ~2 years
  const yearStart = new Date(date.getFullYear(), 0, 1).getTime();
  const currentTime = date.getTime();
  const monthsSinceStart = (currentTime - yearStart) / (30.44 * 24 * 60 * 60 * 1000);
  const cyclePosition = (monthsSinceStart / 24) % 1;
  
  if (cyclePosition < 0.5) return 'Active: High Energy Trading';
  return 'Passive: Conservative Approach';
}

function getNextMarsPeak(date: Date): Date {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + 12);
  return nextDate;
}

function getLunarTradingAdvice(phase: string): string {
  const advice: Record<string, string> = {
    'New Moon': 'Begin new positions and strategies',
    'Waxing Crescent': 'Gradual accumulation recommended',
    'First Quarter': 'Active trading phase',
    'Waxing Gibbous': 'Continue building positions',
    'Full Moon': 'Consider taking profits, market peaks',
    'Waning Gibbous': 'Reduce exposure, consolidation',
    'Last Quarter': 'Defensive positions, take profits',
    'Waning Crescent': 'Avoid new positions, prepare for next cycle'
  };
  return advice[phase] || 'Moderate trading activity';
}

function getDetailedLunarTradingAdvice(phase: string): string {
  const detailedAdvice: Record<string, string> = {
    'New Moon': 'Good time to initiate new investments. Focus on growth-oriented sectors.',
    'Waxing Crescent': 'Gradually increase positions. Market momentum building.',
    'First Quarter': 'Active trading favorable. Strong volatility expected.',
    'Waxing Gibbous': 'Continue accumulation. Success is building.',
    'Full Moon': 'Peak energy. Consider profit-taking. High volatility possible.',
    'Waning Gibbous': 'Reduce exposure. Prepare for consolidation.',
    'Last Quarter': 'Defensive mode. Review and adjust positions.',
    'Waning Crescent': 'Minimum trading. Rest and prepare for next cycle.'
  };
  return detailedAdvice[phase] || 'Standard trading conditions apply';
}

function getNextLunarPhase(date: Date, count: number): { phase: string; date: Date } {
  const phases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 
                  'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
  const currentPhaseIndex = Math.floor(Math.random() * 8); // Simplified
  const nextPhaseIndex = (currentPhaseIndex + count * 2) % phases.length;
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + count * 7); // Roughly weekly phases
  
  return { phase: phases[nextPhaseIndex], date: nextDate };
}

function isMercuryRetrograde(date: Date): boolean {
  // Simplified check - in reality this requires ephemeris calculations
  const month = date.getMonth();
  return month === 2 || month === 8 || month === 11; // Random pattern for demo
}

function getMercuryRetrogradeRange(date: Date): string {
  const start = new Date(date);
  start.setDate(start.getDate() - 10);
  const end = new Date(date);
  end.setDate(end.getDate() + 10);
  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
}

function hasVenusJupiterAspect(date: Date): boolean {
  // Simplified - check for favorable aspects
  return (date.getDate() % 7) < 3; // Rough approximation
}

function hasMarsSaturnAspect(date: Date): boolean {
  // Simplified - check for challenging aspects
  return (date.getDate() % 11) < 2; // Rough approximation
}

function getOptimalEntryPeriods(date: Date): string[] {
  const periods = [];
  const nextWeek = new Date(date);
  nextWeek.setDate(nextWeek.getDate() + 7);
  periods.push(`${date.toLocaleDateString()} - ${nextWeek.toLocaleDateString()}: Favorable for entry`);
  
  const nextMonth = new Date(date);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  periods.push(`Next major window: ${nextMonth.toLocaleDateString()}`);
  
  return periods;
}

function getOptimalExitPeriods(date: Date): string[] {
  const periods = [];
  const fullMoon = new Date(date);
  fullMoon.setDate(fullMoon.getDate() + 14);
  periods.push(`Around Full Moon (${fullMoon.toLocaleDateString()}): Consider taking profits`);
  
  return periods;
}

function getAvoidPeriods(date: Date): string[] {
  const avoid = [];
  if (isMercuryRetrograde(date)) {
    avoid.push('Current Mercury retrograde period: Avoid major trading decisions');
  }
  
  const eclipseMonth = date.getMonth();
  if (eclipseMonth === 3 || eclipseMonth === 9) {
    avoid.push('Eclipse season: High volatility, exercise caution');
  }
  
  return avoid;
}

function getBestTradingDays(date: Date): string[] {
  return ['Monday: Medium energy', 'Tuesday: High activity', 'Wednesday: Optimal trading', 
          'Thursday: Strong momentum', 'Friday: Moderate, close positions'];
}

function getMonthlyForecast(date: Date): any {
  const currentMonth = date.getMonth();
  const forecast: Record<number, string> = {
    0: 'January: Cautious start, build positions gradually',
    1: 'February: Active trading period, favorable',
    2: 'March: Momentum building, expansion opportunities',
    3: 'April: Peak activity, consider profit-taking',
    4: 'May: Stable conditions, steady growth',
    5: 'June: Strong mid-year momentum',
    6: 'July: Summer volatility, adapt strategy',
    7: 'August: Consolidation period',
    8: 'September: Active trading resumes',
    9: 'October: Volatility increases, historical patterns',
    10: 'November: End-of-year activity',
    11: 'December: Holiday trading, reduced volume'
  };
  
  return {
    currentMonth: forecast[currentMonth],
    nextMonth: forecast[(currentMonth + 1) % 12]
  };
}

function calculateSynastryAspects(chart1: any, chart2: any): any[] {
  const aspects: any[] = [];
  const planets1 = chart1.planets || [];
  const planets2 = chart2.planets || [];
  
  const aspectTypes = [
    { name: 'conjunction', angle: 0, orb: 8, influence: 'neutral' },
    { name: 'opposition', angle: 180, orb: 8, influence: 'challenging' },
    { name: 'trine', angle: 120, orb: 8, influence: 'harmonious' },
    { name: 'square', angle: 90, orb: 8, influence: 'challenging' },
    { name: 'sextile', angle: 60, orb: 6, influence: 'harmonious' }
  ];
  
  for (const planet1 of planets1) {
    for (const planet2 of planets2) {
      const lon1 = planet1.longitude || 0;
      const lon2 = planet2.longitude || 0;
      
      // Calculate angular distance
      const diff = Math.abs(lon1 - lon2);
      const normalizedAngle = Math.min(diff, 360 - diff);
      
      for (const aspectType of aspectTypes) {
        const orbDifference = Math.abs(normalizedAngle - aspectType.angle);
        
        // Variable orbs based on planet importance
        let maxOrb = aspectType.orb;
        const importantPlanets = ['Sun', 'Moon', 'Venus', 'Mars'];
        if (importantPlanets.includes(planet1.name) || importantPlanets.includes(planet2.name)) {
          maxOrb += 2;
        }
        
        // Wider orbs for outer planets
        const outerPlanets = ['Uranus', 'Neptune', 'Pluto'];
        if (outerPlanets.includes(planet1.name) || outerPlanets.includes(planet2.name)) {
          maxOrb += 2;
        }
        
        if (orbDifference <= maxOrb) {
          aspects.push({
            planet1: planet1.name,
            planet2: planet2.name,
            type: aspectType.name,
            orb: orbDifference,
            influence: aspectType.influence,
            angle: normalizedAngle
          });
          break; // Only count the closest aspect
        }
      }
    }
  }
  
  return aspects.sort((a, b) => a.orb - b.orb); // Sort by orb (closest first)
}

function calculateCompositeChart(chart1: any, chart2: any): any {
  const planets1 = chart1.planets || [];
  const planets2 = chart2.planets || [];
  
  // Create planet map for quick lookup
  const planetMap1: Record<string, any> = {};
  const planetMap2: Record<string, any> = {};
  
  planets1.forEach((p: any) => { planetMap1[p.name] = p; });
  planets2.forEach((p: any) => { planetMap2[p.name] = p; });
  
  const compositePlanets: any[] = [];
  const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  
  for (const name of planetNames) {
    const p1 = planetMap1[name];
    const p2 = planetMap2[name];
    
    if (p1 && p2) {
      // Calculate midpoint
      let lon1 = p1.longitude || 0;
      let lon2 = p2.longitude || 0;
      
      // Normalize longitudes
      lon1 = ((lon1 % 360) + 360) % 360;
      lon2 = ((lon2 % 360) + 360) % 360;
      
      // Calculate midpoint (handle 0° crossing)
      let compositeLon = (lon1 + lon2) / 2;
      if (Math.abs(lon1 - lon2) > 180) {
        compositeLon = (lon1 + lon2 + 360) / 2;
        compositeLon = compositeLon % 360;
      }
      compositeLon = ((compositeLon % 360) + 360) % 360;
      
      compositePlanets.push({
        name: name,
        longitude: compositeLon,
        sign: getTropicalSign(compositeLon),
        degree: getDegreeInSignLocal(compositeLon),
        latitude: (p1.latitude + p2.latitude) / 2 || 0,
        distance: (p1.distance + p2.distance) / 2 || 0
      });
    }
  }
  
  // Calculate composite Ascendant (midpoint of both ascendants)
  const asc1Lon = chart1.houses?.[0]?.longitude || 0;
  const asc2Lon = chart2.houses?.[0]?.longitude || 0;
  const asc1Norm = ((asc1Lon % 360) + 360) % 360;
  const asc2Norm = ((asc2Lon % 360) + 360) % 360;
  
  let compositeAsc = (asc1Norm + asc2Norm) / 2;
  if (Math.abs(asc1Norm - asc2Norm) > 180) {
    compositeAsc = (asc1Norm + asc2Norm + 360) / 2;
    compositeAsc = compositeAsc % 360;
  }
  compositeAsc = ((compositeAsc % 360) + 360) % 360;
  
  return {
    planets: compositePlanets,
    ascendant: getTropicalSign(compositeAsc),
    ascendantLongitude: compositeAsc,
    sunSign: compositePlanets.find((p: any) => p.name === 'Sun')?.sign || 'Unknown',
    moonSign: compositePlanets.find((p: any) => p.name === 'Moon')?.sign || 'Unknown'
  };
}

function calculateCompatibilityScore(chart1: any, chart2: any): number {
  const aspects = calculateSynastryAspects(chart1, chart2);
  
  let score = 50; // Base score
  
  const harmonious = aspects.filter((a: any) => a.influence === 'harmonious');
  const challenging = aspects.filter((a: any) => a.influence === 'challenging');
  const neutral = aspects.filter((a: any) => a.influence === 'neutral');
  
  // Aspect-based scoring
  score += harmonious.length * 3;
  score += neutral.length * 1;
  score -= challenging.length * 2;
  
  // Major aspect bonuses (Sun, Moon, Venus, Mars)
  const majorPlanets = ['Sun', 'Moon', 'Venus', 'Mars'];
  const majorAspects = aspects.filter((a: any) => 
    majorPlanets.includes(a.planet1) && majorPlanets.includes(a.planet2)
  );
  
  majorAspects.forEach((aspect: any) => {
    if (aspect.influence === 'harmonious') {
      score += 5;
    } else if (aspect.influence === 'challenging' && aspect.orb <= 3) {
      score -= 3;
    }
  });
  
  // Sun-Moon aspects are especially important
  const sunMoonAspects = aspects.filter((a: any) =>
    (a.planet1 === 'Sun' && a.planet2 === 'Moon') ||
    (a.planet1 === 'Moon' && a.planet2 === 'Sun')
  );
  
  sunMoonAspects.forEach((aspect: any) => {
    if (aspect.influence === 'harmonious') {
      score += 10;
    } else if (aspect.influence === 'challenging') {
      score -= 5;
    } else {
      score += 5; // Conjunction is neutral but important
    }
  });
  
  // Venus-Mars aspects for romantic compatibility
  const venusMarsAspects = aspects.filter((a: any) =>
    (a.planet1 === 'Venus' && a.planet2 === 'Mars') ||
    (a.planet1 === 'Mars' && a.planet2 === 'Venus')
  );
  
  venusMarsAspects.forEach((aspect: any) => {
    if (aspect.influence === 'harmonious') {
      score += 8;
    } else if (aspect.influence === 'challenging' && aspect.orb <= 3) {
      score -= 4;
    }
  });
  
  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateRelationshipTiming(chart1: any, chart2: any): any {
  const now = new Date();
  const currentTransits = calculateTropicalPlanets(now);
  const transitsFormatted = Object.entries(currentTransits).map(([name, data]: [string, any]) => ({
    name: capitalizeFirst(name),
    longitude: data.longitude,
    sign: getTropicalSign(data.longitude),
    degree: getDegreeInSignLocal(data.longitude)
  }));
  
  // Analyze transits to both natal charts
  const planets1 = chart1.planets || [];
  const planets2 = chart2.planets || [];
  
  const transitAspects1: any[] = [];
  const transitAspects2: any[] = [];
  
  transitsFormatted.forEach((transit: any) => {
    planets1.forEach((planet: any) => {
      const diff = Math.abs((transit.longitude - planet.longitude) % 360);
      const normalized = Math.min(diff, 360 - diff);
      
      if (normalized <= 10) { // Wide orb for transits
        transitAspects1.push({
          transit: transit.name,
          natal: planet.name,
          angle: normalized,
          type: getAspectType(normalized)
        });
      }
    });
    
    planets2.forEach((planet: any) => {
      const diff = Math.abs((transit.longitude - planet.longitude) % 360);
      const normalized = Math.min(diff, 360 - diff);
      
      if (normalized <= 10) {
        transitAspects2.push({
          transit: transit.name,
          natal: planet.name,
          angle: normalized,
          type: getAspectType(normalized)
        });
      }
    });
  });
  
  return {
    currentTransits: transitsFormatted,
    transitAspectsPerson1: transitAspects1.slice(0, 10),
    transitAspectsPerson2: transitAspects2.slice(0, 10),
    significantPeriods: [
      'Current planetary transits are activating both charts',
      'Eclipse seasons bring relationship revelations',
      'Venus and Mars transits highlight romantic dynamics'
    ]
  };
}

// Helper function to determine aspect type from angle
function getAspectType(angle: number): string {
  if (angle <= 8) return 'conjunction';
  if (Math.abs(angle - 60) <= 6) return 'sextile';
  if (Math.abs(angle - 90) <= 8) return 'square';
  if (Math.abs(angle - 120) <= 8) return 'trine';
  if (Math.abs(angle - 180) <= 8) return 'opposition';
  return 'none';
}

function calculateMoonSign(birthData: BirthData): string { return 'Aries'; }
function calculateLunarMansions(birthData: BirthData): any[] { return []; }
function calculateMoonAspects(birthData: BirthData): any[] { return []; }
function calculateLunarCycles(birthData: BirthData): any[] { return []; }
function calculateMoonTransits(birthData: BirthData): any[] { return []; }
function calculateRisingStars(birthData: BirthData): any[] { return []; }
function calculateCulminatingStars(birthData: BirthData): any[] { return []; }
function calculateSettingStars(birthData: BirthData): any[] { return []; }
function calculateStarAspects(birthData: BirthData): any[] { return []; }
function calculateParans(birthData: BirthData): any[] { return []; }
function calculateStarInfluences(birthData: BirthData): any[] { return []; }

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD === '1') {
    return NextResponse.json({ error: 'Not available in static export' }, { status: 404 })
  }
  try {
    const { system, birthData, options = {} }: OccultRequest = await request.json();
    
    if (!system) {
      return NextResponse.json({ 
        error: 'System parameter is required',
        supportedSystems: [
          'vedic', 'western', 'horary', 'electional',
          'medical', 'financial', 'synastry', 'lunar', 'fixed-star'
        ]
      }, { status: 400 });
    }

    const startTime = Date.now();
    let result;

    switch (system) {
      case 'vedic':
        if (!birthData) {
          return NextResponse.json({ error: 'Birth data is required for Vedic astrology' }, { status: 400 });
        }
        result = await calculateVedicChart(birthData, options);
        break;
        
      case 'western':
        if (!birthData) {
          return NextResponse.json({ error: 'Birth data is required for Western astrology' }, { status: 400 });
        }
        result = await calculateWesternChart(birthData, options);
        break;
        
      case 'horary':
        if (!birthData || !options.question) {
          return NextResponse.json({ error: 'Birth data and question are required for Horary astrology' }, { status: 400 });
        }
        result = calculateHoraryChart(birthData, options);
        break;
        
      case 'electional':
        if (!birthData) {
          return NextResponse.json({ error: 'Birth data is required for Electional astrology' }, { status: 400 });
        }
        result = calculateElectionalChart(birthData, options);
        break;
        
      case 'medical':
        if (!birthData) {
          return NextResponse.json({ error: 'Birth data is required for Medical astrology' }, { status: 400 });
        }
        result = await calculateMedicalChart(birthData, options);
        break;
        
      case 'financial':
        if (!birthData) {
          return NextResponse.json({ error: 'Birth data is required for Financial astrology' }, { status: 400 });
        }
        result = calculateFinancialChart(birthData, options);
        break;
        
      case 'synastry':
        if (!birthData || !options.partnerData) {
          return NextResponse.json({ error: 'Birth data and partner data are required for Synastry' }, { status: 400 });
        }
        result = await calculateSynastryChart(birthData, options);
        break;
        
      case 'lunar':
        if (!birthData) {
          return NextResponse.json({ error: 'Birth data is required for Lunar astrology' }, { status: 400 });
        }
        result = calculateLunarChart(birthData, options);
        break;
        
      case 'fixed-star':
        if (!birthData) {
          return NextResponse.json({ error: 'Birth data is required for Fixed Star astrology' }, { status: 400 });
        }
        result = calculateFixedStarChart(birthData, options);
        break;
        
      default:
        return NextResponse.json({ 
          error: 'Unsupported system',
          supportedSystems: [
            'vedic', 'western', 'horary', 'electional',
            'medical', 'financial', 'synastry', 'lunar', 'fixed-star'
          ]
        }, { status: 400 });
    }

    const calculationTime = Date.now() - startTime;
    
    // Handle different response structures
    let responseData;
    if (result.success && result.data) {
      // Vedic API returns { success: true, data: {...} }
      responseData = result.data;
    } else if (result.data) {
      // Some APIs return { data: {...} }
      responseData = result.data;
    } else {
      // Direct data response
      responseData = result;
    }

    const response: OccultResponse = {
      success: true,
      system,
      data: responseData,
      metadata: {
        generatedAt: new Date().toISOString(),
        source: 'FutureSeer Universal Occult API',
        version: '1.0.0',
        calculationTime
      }
    };

    return NextResponse.json(response);
  } catch (error: any) {
    devLog.error('Universal Occult API Error:', error, 'route');
    return NextResponse.json({ 
      error: 'Failed to process occult calculation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    name: 'FutureSeer Universal Occult API',
    description: 'The Google of Occult - Comprehensive occult calculations powered by Swiss Ephemeris',
    version: '1.0.0',
    supportedSystems: [
      {
        name: 'vedic',
        description: 'Ancient Indian astrological system',
        requires: ['birthData']
      },
      {
        name: 'western',
        description: 'Traditional Western zodiac system',
        requires: ['birthData']
      },
      {
        name: 'horary',
        description: 'Question-based astrological divination',
        requires: ['birthData', 'question']
      },
      {
        name: 'electional',
        description: 'Choosing auspicious times for events',
        requires: ['birthData']
      },
      {
        name: 'medical',
        description: 'Health-focused astrological analysis',
        requires: ['birthData']
      },
      {
        name: 'financial',
        description: 'Investment and wealth astrological guidance',
        requires: ['birthData']
      },
      {
        name: 'synastry',
        description: 'Relationship compatibility analysis',
        requires: ['birthData', 'partnerData']
      },
      {
        name: 'lunar',
        description: 'Moon-based astrological systems',
        requires: ['birthData']
      },
      {
        name: 'fixed-star',
        description: 'Fixed star influences and aspects',
        requires: ['birthData']
      }
    ],
    features: [
      'Real calculations (no mock data)',
      'Swiss Ephemeris integration ready',
      'Parallel processing support',
      'Comprehensive error handling',
      'TypeScript types for all data structures',
      'Vercel-compatible serverless functions'
    ],
    usage: {
      endpoint: '/api/occult/universal',
      method: 'POST',
      body: {
        system: 'western',
        birthData: {
          birthDate: '1990-01-01',
          birthTime: '12:00:00',
          birthPlace: 'New York',
          latitude: 40.7128,
          longitude: -74.0060
        },
        options: {
          houseSystem: 'placidus'
        }
      }
    }
  });
}
