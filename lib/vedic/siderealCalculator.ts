import { calculateTropicalPlanets, calculateTropicalHouses } from '@/lib/western/tropicalCalculator';
import { devLog } from '@/lib/devLogger';
const verboseAstroLogs = process.env.VERBOSE_ASTRO_LOGS === '1';
import * as julian from "astronomia/julian";
import {
  celestineHouses,
  celestineHousesToLegacyFormat,
  type CelestineHouseSystem,
  SUPPORTED_HOUSE_SYSTEMS,
} from '@/lib/celestine-bridge';

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
  if (verboseAstroLogs) {
    devLog.debug('🕉️ Calculating SIDEREAL positions for Vedic astrology');
  }
  const rawLongitude = longitude;
  const normalizedLongitude =
    Number.isFinite(longitude) && Math.abs(longitude) > 180
      ? ((longitude + 180) % 360 + 360) % 360 - 180
      : longitude;
  const latL = Number.isFinite(latitude) ? Number(latitude.toFixed(6)) : latitude;
  const lonL = Number.isFinite(normalizedLongitude) ? Number(normalizedLongitude.toFixed(6)) : normalizedLongitude;
  const rawL = Number.isFinite(rawLongitude) ? Number(rawLongitude.toFixed(6)) : rawLongitude;
  if (verboseAstroLogs) {
    devLog.debug('🕉️ DEBUG - Input coordinates:', { latitude: latL, longitude: lonL, rawLongitude: rawL });
  }
  if (Number.isFinite(longitude) && Math.abs(longitude) > 180) {
    devLog.warn(
      `Longitude out of range detected (${longitude}). Using normalized value ${normalizedLongitude} for diagnostics.`,
      undefined,
      'siderealCalculator',
    );
    if (process.env.NODE_ENV === 'development') {
      const stack = new Error('sidereal-coordinate-source').stack
        ?.split('\n')
        .slice(1, 5)
        .map((line) => line.trim())
        .join(' | ');
      devLog.warn(`Longitude source trace: ${stack ?? 'unavailable'}`, undefined, 'siderealCalculator');
    }
  }
  
  // Step 1: Get TROPICAL positions (verified working)
  const tropicalPlanets = calculateTropicalPlanets(date);
  
  // Step 2: Calculate Lahiri Ayanamsha
  const jd = toJD_TT(date);
  const ayanamsha = calculateLahiriAyanamsha(jd);
  
  if (verboseAstroLogs) {
    devLog.debug(`🕉️ Lahiri Ayanamsha: ${ayanamsha.toFixed(2)}°`);
  }
  
  // Step 3: Convert each planet from tropical to sidereal
  const siderealPlanets: any = {};
  
  Object.entries(tropicalPlanets).forEach(([name, data]: [string, any]) => {
    const tropicalLon = data.longitude;
    const siderealLon = norm360(tropicalLon - ayanamsha);
    
    if (verboseAstroLogs) {
      devLog.debug(`🕉️ ${name}: Tropical ${tropicalLon.toFixed(2)}° → Sidereal ${siderealLon.toFixed(2)}°`);
    }
    
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
  
  if (verboseAstroLogs) {
    devLog.debug(`🕉️ Ascendant: Tropical ${tropicalAsc.toFixed(2)}° → Sidereal ${siderealAsc.toFixed(2)}°`);
  }
  // Lagna diagnostic for 22 Apr 1959 22:00 IST Kushalnagar: expected sidereal Ascendant ~253° (Sagittarius ~13°)
  const isTestChart1959 = date.getUTCFullYear() === 1959 && date.getUTCMonth() === 3 && date.getUTCDate() === 22 && Math.abs(longitude - 75.96) < 2;
  if (isTestChart1959) {
    devLog.debug('🔮 Lagna diagnostic (22 Apr 1959 Kushalnagar):', { siderealAscendant: Math.round(siderealAsc * 100) / 100, expected: 'Sagittarius ~253° (~13°)' }, 'siderealCalculator');
    if (process.env.NODE_ENV === 'development' && (siderealAsc < 248 || siderealAsc > 258)) {
      devLog.warn(`Lagna fails reference: expected Sagittarius ~13° (248°–258°), got ${siderealAsc.toFixed(2)}°`, undefined, 'siderealCalculator');
    }
  }
  
  // Validate Feb 24, 1983
  if (date.getUTCFullYear() === 1983 && 
      date.getUTCMonth() === 1 && 
      date.getUTCDate() === 24) {
    
    if (verboseAstroLogs) {
      devLog.debug('🕉️ VEDIC VALIDATION for Feb 24, 1983:');
      devLog.debug('🕉️ Expected Sun: ~11° Aquarius (sidereal ~311°)');
      devLog.debug('🕉️ Expected Ascendant: ~7° Cancer (sidereal ~97°)');
    }
    
    const sunLon = siderealPlanets.sun.siderealLongitude;
    const ascLon = siderealAsc;
    
    const sunCorrect = Math.abs(sunLon - 311) < 5;
    const ascCorrect = Math.abs(ascLon - 97) < 5;
    
    if (sunCorrect && ascCorrect) {
      if (verboseAstroLogs) {
        devLog.debug('Feb 24, 1983 Vedic positions CORRECT', undefined, 'siderealCalculator');
      }
    } else {
      if (verboseAstroLogs) {
        devLog.warn('Feb 24, 1983 Vedic positions WRONG', { sunLon, ascLon, expectedSun: 311, expectedAsc: 97 }, 'siderealCalculator');
        devLog.warn(`  Sun: ${sunLon.toFixed(2)}° (expected ~311°)`, undefined, 'siderealCalculator');
        devLog.warn(`  Asc: ${ascLon.toFixed(2)}° (expected ~97°)`, undefined, 'siderealCalculator');
      }
    }
  }

  // Optional: Moon sign vs longitude consistency (dev-only warning)
  if (process.env.NODE_ENV === 'development' && siderealPlanets.moon) {
    const moonLon = siderealPlanets.moon.siderealLongitude;
    const moonSign = siderealPlanets.moon.sign;
    const expectedSign = getSignFromLongitude(moonLon);
    if (moonSign !== expectedSign) {
      devLog.warn(`Moon longitude ${moonLon.toFixed(2)}° implies sign ${expectedSign}, got ${moonSign}`, undefined, 'siderealCalculator');
    }
  }

  const ascendantSign = getSignFromLongitude(siderealAsc);
  // Dev-only: ensure Ascendant longitude falls within the range implied by the returned sign
  if (process.env.NODE_ENV === 'development') {
    const signIndex = Math.floor(siderealAsc / 30) % 12;
    const expectedMin = signIndex * 30;
    const expectedMax = expectedMin + 30;
    if (siderealAsc < expectedMin - 0.01 || siderealAsc >= expectedMax + 0.01) {
      devLog.warn(
        `Ascendant longitude ${siderealAsc.toFixed(2)}° outside range for ${ascendantSign} (${expectedMin}°–${expectedMax}°)`,
        undefined,
        'siderealCalculator'
      );
    }
  }

  return {
    planets: siderealPlanets,
    ascendant: {
      tropicalLongitude: tropicalAsc,
      siderealLongitude: siderealAsc,
      sign: ascendantSign,
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

/**
 * Calculate Vedic (sidereal) houses using any Celestine-supported house system.
 * Supported: placidus, koch, equal, whole-sign, porphyry, regiomontanus, campanus.
 *
 * Celestine computes tropical cusps; this function subtracts the Lahiri ayanamsha
 * to produce sidereal cusps, matching how sidereal planets are derived above.
 */
export function calculateVedicHousesMultiSystem(
  date: Date,
  latitude: number,
  longitude: number,
  system: CelestineHouseSystem = 'whole-sign',
) {
  if (system === 'whole-sign') {
    const { ascendant } = calculateSiderealPlanets(date, latitude, longitude);
    return {
      system,
      houses: calculateVedicHouses(ascendant.siderealLongitude),
      ascendant: ascendant.siderealLongitude,
    };
  }

  const jd = toJD_TT(date);
  const ayanamsha = calculateLahiriAyanamsha(jd);

  const tropicalResult = celestineHouses(
    { date, latitude, longitude, timezoneOffsetHours: 0 },
    system,
  );

  const tropicalLegacy = celestineHousesToLegacyFormat(tropicalResult);

  const siderealHouses = tropicalLegacy.map((h) => {
    const sLon = norm360(h.longitude - ayanamsha);
    return {
      number: h.number,
      sign: getSignFromLongitude(sLon),
      siderealLongitude: sLon,
      degree: sLon % 30,
    };
  });

  return {
    system,
    houses: siderealHouses,
    ascendant: norm360(tropicalResult.ascendant - ayanamsha),
  };
}

export { SUPPORTED_HOUSE_SYSTEMS };
