import { calculateTropicalPlanets, calculateTropicalHouses } from '@/lib/western/tropicalCalculator';
import * as julian from "astronomia/julian";

// Helper to normalize degree
const norm360 = (deg: number) => ((deg % 360) + 360) % 360;

// ΔT estimation (TT−UTC in seconds)
const estimateDeltaT = (year: number) => {
  if (year < 2005) return 64.7 + 0.4 * (year - 2005);
  if (year < 2050) return 64.7 + 0.37 * (year - 2005);
  return 69;
};

// Convert Date to Julian Day (TT)
const toJD_TT = (date: Date) => {
  const jdUTC = julian.DateToJD(date);
  const year = date.getUTCFullYear();
  const deltaT = estimateDeltaT(year);
  return jdUTC + deltaT / 86400;
};

// Lahiri Ayanamsha calculation (same as astronomia-vedic)
function calculateLahiriAyanamsha(jd: number): number {
  const LAHIRI_BASE = 23.85675; // at J2000
  const T = (jd - 2451545.0) / 36525;
  const drift = (50.29 / 3600) * T * 100; // ~50.29"/yr
  return LAHIRI_BASE + drift;
}

// Get sign from longitude
function getSignFromLongitude(lon: number): string {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  return signs[Math.floor(lon / 30)];
}

// Convert tropical to sidereal
export function calculateSiderealPlanets(date: Date, latitude: number, longitude: number) {
  console.log('🕉️ Calculating SIDEREAL positions for Vedic astrology');
  console.log('🕉️ DEBUG - Input coordinates:', { latitude, longitude });
  
  // Step 1: Get TROPICAL positions (verified working)
  const tropicalPlanets = calculateTropicalPlanets(date);
  
  // Step 2: Calculate Lahiri Ayanamsha
  const jd = toJD_TT(date);
  const ayanamsha = calculateLahiriAyanamsha(jd);
  
  console.log(`🕉️ Lahiri Ayanamsha: ${ayanamsha.toFixed(2)}°`);
  
  // Step 3: Convert each planet from tropical to sidereal
  const siderealPlanets: any = {};
  
  Object.entries(tropicalPlanets).forEach(([name, data]: [string, any]) => {
    const tropicalLon = data.longitude;
    const siderealLon = norm360(tropicalLon - ayanamsha);
    
    console.log(`🕉️ ${name}: Tropical ${tropicalLon.toFixed(2)}° → Sidereal ${siderealLon.toFixed(2)}°`);
    
    siderealPlanets[name] = {
      ...data,
      tropicalLongitude: tropicalLon,
      siderealLongitude: siderealLon,
      sign: getSignFromLongitude(siderealLon),
      degree: siderealLon % 30,
      nakshatra: calculateNakshatra(siderealLon),
      pada: calculatePada(siderealLon)
    };
  });
  
  // Step 4: Calculate sidereal Ascendant
  const tropicalHouses = calculateTropicalHouses(date, latitude, longitude);
  const tropicalAsc = tropicalHouses[0].longitude;
  const siderealAsc = norm360(tropicalAsc - ayanamsha);
  
  console.log(`🕉️ Ascendant: Tropical ${tropicalAsc.toFixed(2)}° → Sidereal ${siderealAsc.toFixed(2)}°`);
  
  // Validate Feb 24, 1983
  if (date.getUTCFullYear() === 1983 && 
      date.getUTCMonth() === 1 && 
      date.getUTCDate() === 24) {
    
    console.log('🕉️ VEDIC VALIDATION for Feb 24, 1983:');
    console.log('🕉️ Expected Sun: ~11° Aquarius (sidereal ~311°)');
    console.log('🕉️ Expected Ascendant: ~7° Cancer (sidereal ~97°)');
    
    const sunLon = siderealPlanets.sun.siderealLongitude;
    const ascLon = siderealAsc;
    
    const sunCorrect = Math.abs(sunLon - 311) < 5;
    const ascCorrect = Math.abs(ascLon - 97) < 5;
    
    if (sunCorrect && ascCorrect) {
      console.log('✅ Feb 24, 1983 Vedic positions CORRECT');
    } else {
      console.error('❌ Feb 24, 1983 Vedic positions WRONG');
      console.error(`  Sun: ${sunLon.toFixed(2)}° (expected ~311°)`);
      console.error(`  Asc: ${ascLon.toFixed(2)}° (expected ~97°)`);
    }
  }
  
  return {
    planets: siderealPlanets,
    ascendant: {
      tropicalLongitude: tropicalAsc,
      siderealLongitude: siderealAsc,
      sign: getSignFromLongitude(siderealAsc),
      degree: siderealAsc % 30
    },
    ayanamsha: ayanamsha
  };
}

// Calculate Nakshatra from sidereal longitude
function calculateNakshatra(siderealLon: number): string {
  const nakshatras = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ];
  
  const nakshatraIndex = Math.floor(siderealLon / (360 / 27));
  return nakshatras[nakshatraIndex];
}

// Calculate Pada (1-4) from sidereal longitude
function calculatePada(siderealLon: number): number {
  const nakshatraSpan = 360 / 27; // 13.33°
  const positionInNakshatra = siderealLon % nakshatraSpan;
  return Math.floor(positionInNakshatra / (nakshatraSpan / 4)) + 1;
}

// Calculate Whole Sign Houses (Vedic style)
export function calculateVedicHouses(ascendantSidereal: number) {
  const ascSign = Math.floor(ascendantSidereal / 30);
  const houses = [];
  
  for (let i = 0; i < 12; i++) {
    const houseSign = (ascSign + i) % 12;
    houses.push({
      number: i + 1,
      sign: getSignFromLongitude(houseSign * 30),
      siderealLongitude: houseSign * 30,
      degree: 0 // Whole sign starts at 0°
    });
  }
  
  return houses;
}
