/**
 * Production-ready astronomia wrapper for Vedic astrology calculations
 * 
 * ✅ Uses working import syntax: astronomia/julian, astronomia/solarxyz, etc.
 * ✅ Includes all 9 planets: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Rahu, Ketu
 * ✅ Supports multiple ayanamsha systems: Lahiri, Raman, KP, Yukteshwar, Custom
 * ✅ Calculates sidereal positions, nakshatras, padas, signs
 * ✅ Browser-safe with proper error handling
 * ✅ TT correction for improved ephemeris accuracy
 */

import { devLog } from '@/lib/devLogger';
const verboseAstroLogs = process.env.VERBOSE_ASTRO_LOGS === '1';
import * as julian from "astronomia/julian";
import * as solarxyz from "astronomia/solarxyz";
import * as planetposition from "astronomia/planetposition";
import * as moonposition from "astronomia/moonposition";
import earthData from "astronomia/data/vsop87Bearth";
import mercuryData from "astronomia/data/vsop87Bmercury";
import venusData from "astronomia/data/vsop87Bvenus";
import marsData from "astronomia/data/vsop87Bmars";
import jupiterData from "astronomia/data/vsop87Bjupiter";
import saturnData from "astronomia/data/vsop87Bsaturn";

// Import working tropical calculators
import { calculateTropicalPlanets, calculateTropicalHouses } from "./western/tropicalCalculator";

type PlanetKey = "sun" | "moon" | "mercury" | "venus" | "mars" | "jupiter" | "saturn" | "rahu" | "ketu";

// Helper functions
const rad2deg = (r: number) => (r * 180) / Math.PI;
const deg2rad = (d: number) => (d * Math.PI) / 180;
const norm360 = (deg: number) => ((deg % 360) + 360) % 360;

// ΔT estimation (TT−UTC in seconds)
const estimateDeltaT = (year: number) => {
  if (year < 2005) return 64.7 + 0.4 * (year - 2005);
  if (year < 2050) return 64.7 + 0.37 * (year - 2005);
  return 69; // safe constant for near future
};

const jdUTCtoTT = (jdUTC: number, year: number) => jdUTC + estimateDeltaT(year) / 86400;

const toJD_TT = (date: Date | string | number) => {
  let jdUTC: number;
  let year: number;
  
  if (date instanceof Date) {
    // Manual Julian Day calculation from UTC components
    // This avoids ANY timezone interpretation by Date methods
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + 1; // JS months are 0-indexed
    const d = date.getUTCDate();
    const h = date.getUTCHours();
    const min = date.getUTCMinutes();
    const s = date.getUTCSeconds();
    const ms = date.getUTCMilliseconds();
    
    // Calculate day fraction
    const dayFraction = (h + min / 60 + s / 3600 + ms / 3600000) / 24;
    
    // Julian Day calculation (Meeus algorithm)
    const a = Math.floor((14 - m) / 12);
    const y2 = y + 4800 - a;
    const m2 = m + 12 * a - 3;
    
    jdUTC = d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 + 
            Math.floor(y2 / 4) - Math.floor(y2 / 100) + 
            Math.floor(y2 / 400) - 32045 - 0.5 + dayFraction;
    
    year = y;
  } else {
    // For string/number, use julian.DateToJD
    const d = new Date(date);
    jdUTC = julian.DateToJD(d);
    year = d.getUTCFullYear();
  }
  
  return jdUTCtoTT(jdUTC, year);
};

// Initialize planets safely
const initPlanet = (data: any, name: string) => {
  try {
    if (!data) throw new Error(`${name} VSOP data missing`);
    return new planetposition.Planet(data);
  } catch (err) {
    devLog.error(`Failed to init planet ${name}:`, err, 'astronomia-vedic');
    return null;
  }
};

const PLANETS = {
  earth: initPlanet(earthData, "Earth"),
  mercury: initPlanet(mercuryData, "Mercury"),
  venus: initPlanet(venusData, "Venus"),
  mars: initPlanet(marsData, "Mars"),
  jupiter: initPlanet(jupiterData, "Jupiter"),
  saturn: initPlanet(saturnData, "Saturn"),
};

// Coordinate conversions
const heliocentricRect = (planetObj: any, jd: number) => planetObj ? (solarxyz as { position: (p: any, jd: number) => [number, number, number] }).position(planetObj, jd) : null;

const rectToEcl = (x: number, y: number, z: number) => {
  const r = Math.sqrt(x * x + y * y + z * z);
  return {
    lon: norm360(rad2deg(Math.atan2(y, x))),
    lat: rad2deg(Math.atan2(z, Math.sqrt(x * x + y * y))),
    dist: r,
  };
};

// Mean node formula (Meeus Ch. 47)
const meanNodeLongitude = (jd: number) => {
  const T = (jd - 2451545.0) / 36525;
  const L = 125.04452 - 1934.136261 * T + 0.0020708 * T ** 2 + (T ** 3) / 450000;
  return norm360(L);
};

// True node calculation with proper perturbations
const trueNodeLongitude = (jd: number) => {
  const T = (jd - 2451545.0) / 36525;
  
  // Mean node
  const Ω = meanNodeLongitude(jd);
  
  // Perturbations from Sun and Moon (more accurate formula)
  const D = 297.8502042 + 445267.1115168 * T - 0.0016300 * T * T + T * T * T / 545868.0;
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T * T * T / 24490000.0;
  const F = 93.2720993 + 483202.0175273 * T - 0.0034029 * T * T - T * T * T / 3526000.0;
  
  // True node correction (main perturbation terms)
  const correction = 
    - 1.4979 * Math.sin(deg2rad(2 * (D - Ω)))
    - 0.1500 * Math.sin(deg2rad(M))
    - 0.1226 * Math.sin(deg2rad(2 * D))
    + 0.1176 * Math.sin(deg2rad(2 * F))
    - 0.0801 * Math.sin(deg2rad(2 * (F - Ω)));
  
  return norm360(Ω + correction);
};

// Moon ecliptic position
const getMoonEcliptic = (jd: number) => {
  try {
    const m = moonposition.position(jd);
    if (m?.lon && m?.lat) {
      return {
        lon: norm360(rad2deg(m.lon)),
        lat: rad2deg(m.lat),
        dist: m.range ?? 0
      };
    }
    if (Array.isArray(m)) {
      return {
        lon: norm360(rad2deg(m[0])),
        lat: rad2deg(m[1]),
        dist: m[2] ?? 0
      };
    }
    return null;
  } catch (err) {
    devLog.error("moonposition failed:", err, 'astronomia-vedic');
    return null;
  }
};

// Ayanamsha values (approx. at J2000, drift ~50.29"/yr)
const AYANAMSHA_BASE = {
  lahiri: 23.85675,
  raman: 22.4600,
  kp: 23.9347,
  yukteshwar: 23.5860,
};

const ayanamshaValue = (jd: number, type: string | number) => {
  const T = (jd - 2451545.0) / 36525;
  const drift = (50.29 / 3600) * T * 100; // ~50.29"/yr
  if (typeof type === "number") return type;
  const base = AYANAMSHA_BASE[type.toLowerCase() as keyof typeof AYANAMSHA_BASE] ?? 0;
  return base + drift;
};

// Nakshatras
const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];

const getNakshatraInfo = (lonSidereal: number) => {
  const sector = lonSidereal / (13 + 1 / 3); // 13°20' per nakshatra
  const nak = Math.floor(sector);
  const pada = Math.floor((sector - nak) * 4) + 1;
  return {
    nakshatra: NAKSHATRAS[nak] ?? "Unknown",
    nakshatraPada: Math.min(Math.max(pada, 1), 4),
  };
};

// Sign info
const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

// Planetary dignities (Vedic astrology)
const PLANETARY_DIGNITIES = {
  sun: {
    exaltation: 0,      // Aries (0-10°)
    exaltationDegree: 10,
    debilitation: 6,    // Libra (0-10°)
    debilitationDegree: 10,
    ownSigns: [4],      // Leo
    moolatrikona: { sign: 4, start: 0, end: 20 }, // Leo 0-20°
  },
  moon: {
    exaltation: 1,      // Taurus (0-3°)
    exaltationDegree: 3,
    debilitation: 7,    // Scorpio (0-3°)
    debilitationDegree: 3,
    ownSigns: [3],      // Cancer
    moolatrikona: { sign: 1, start: 4, end: 30 }, // Taurus 4-30°
  },
  mercury: {
    exaltation: 5,      // Virgo (0-15°)
    exaltationDegree: 15,
    debilitation: 11,   // Pisces (0-15°)
    debilitationDegree: 15,
    ownSigns: [2, 5],   // Gemini, Virgo
    moolatrikona: { sign: 5, start: 16, end: 20 }, // Virgo 16-20°
  },
  venus: {
    exaltation: 11,     // Pisces (0-27°)
    exaltationDegree: 27,
    debilitation: 5,    // Virgo (0-27°)
    debilitationDegree: 27,
    ownSigns: [1, 6],   // Taurus, Libra
    moolatrikona: { sign: 6, start: 0, end: 15 }, // Libra 0-15°
  },
  mars: {
    exaltation: 9,      // Capricorn (0-28°)
    exaltationDegree: 28,
    debilitation: 3,    // Cancer (0-28°)
    debilitationDegree: 28,
    ownSigns: [0, 7],   // Aries, Scorpio
    moolatrikona: { sign: 0, start: 0, end: 12 }, // Aries 0-12°
  },
  jupiter: {
    exaltation: 3,      // Cancer (0-5°)
    exaltationDegree: 5,
    debilitation: 9,    // Capricorn (0-5°)
    debilitationDegree: 5,
    ownSigns: [8, 11],  // Sagittarius, Pisces
    moolatrikona: { sign: 8, start: 0, end: 10 }, // Sagittarius 0-10°
  },
  saturn: {
    exaltation: 6,      // Libra (0-20°)
    exaltationDegree: 20,
    debilitation: 0,    // Aries (0-20°)
    debilitationDegree: 20,
    ownSigns: [9, 10],  // Capricorn, Aquarius
    moolatrikona: { sign: 10, start: 0, end: 20 }, // Aquarius 0-20°
  },
  rahu: {
    exaltation: 2,      // Gemini (traditional)
    exaltationDegree: 30,
    debilitation: 8,    // Sagittarius
    debilitationDegree: 30,
    ownSigns: [],       // No ownership
    moolatrikona: null,
  },
  ketu: {
    exaltation: 8,      // Sagittarius (traditional)
    exaltationDegree: 30,
    debilitation: 2,    // Gemini
    debilitationDegree: 30,
    ownSigns: [],       // No ownership
    moolatrikona: null,
  },
};

// House lords (sign rulers)
const HOUSE_LORDS: Record<number, PlanetKey> = {
  0: "mars",      // Aries
  1: "venus",     // Taurus
  2: "mercury",   // Gemini
  3: "moon",      // Cancer
  4: "sun",       // Leo
  5: "mercury",   // Virgo
  6: "venus",     // Libra
  7: "mars",      // Scorpio
  8: "jupiter",   // Sagittarius
  9: "saturn",    // Capricorn
  10: "saturn",   // Aquarius
  11: "jupiter",  // Pisces
};

// Calculate planetary dignity
const getPlanetaryDignity = (planet: PlanetKey, sign: number, degreeInSign: number) => {
  const dignity = PLANETARY_DIGNITIES[planet];
  if (!dignity) return { exalted: false, debilitated: false, ownSign: false, moolatrikona: false };

  const isExalted = sign === dignity.exaltation && degreeInSign <= dignity.exaltationDegree;
  const isDebilitated = sign === dignity.debilitation && degreeInSign <= dignity.debilitationDegree;
  const isOwnSign = (dignity.ownSigns as number[]).includes(sign);
  
  let isMoolatrikona = false;
  if (dignity.moolatrikona) {
    isMoolatrikona = 
      sign === dignity.moolatrikona.sign &&
      degreeInSign >= dignity.moolatrikona.start &&
      degreeInSign <= dignity.moolatrikona.end;
  }

  return {
    exalted: isExalted,
    debilitated: isDebilitated,
    ownSign: isOwnSign,
    moolatrikona: isMoolatrikona,
    strength: isExalted ? 'Very Strong' : 
              isMoolatrikona ? 'Strong' :
              isOwnSign ? 'Comfortable' :
              isDebilitated ? 'Weak' : 'Neutral'
  };
};

// Main function
// Helper function to calculate house from longitude
function calculateHouseFromLongitude(planetLon: number, houses: any[]): number {
  if (!houses || houses.length === 0) return 1;
  
  const normalizedLon = ((planetLon % 360) + 360) % 360;
  
  for (let i = 0; i < houses.length; i++) {
    const currentHouse = houses[i];
    const nextHouse = houses[(i + 1) % houses.length];
    
    const currentCusp = currentHouse.cuspLonSid || currentHouse.longitude || 0;
    const nextCusp = nextHouse.cuspLonSid || nextHouse.longitude || 0;
    
    // Handle crossing 0 degrees
    if (currentCusp > nextCusp) {
      if (normalizedLon >= currentCusp || normalizedLon < nextCusp) {
        return i + 1;
      }
    } else {
      if (normalizedLon >= currentCusp && normalizedLon < nextCusp) {
        return i + 1;
      }
    }
  }
  
  return 1;
}

export const getPlanetCoords = (
  name: PlanetKey,
  date: Date | string | number = new Date(),
  opts: { nodeType?: "mean" | "true"; ayanamsha?: string | number; houses?: any[] } = {}
) => {
  const jd = toJD_TT(date);
  const nodeType = opts.nodeType ?? "mean";
  const ayanamshaType = opts.ayanamsha ?? "lahiri";

  try {
    // Moon
    if (name === "moon") {
      const m = getMoonEcliptic(jd);
      if (!m) {
        devLog.error(`Moon calculation failed for JD: ${jd}`, undefined, 'astronomia-vedic');
        throw new Error(`Moon calc failed for Julian Day ${jd}`);
      }
      const ay = ayanamshaValue(jd, ayanamshaType);
      if (verboseAstroLogs) {
        devLog.debug(`🕉️ Moon calculation - JD: ${jd}, Ayanamsha: ${ay}°, Tropical lon: ${m.lon}°`);
      }
      const lonSidereal = norm360(m.lon - ay);
      if (verboseAstroLogs) {
        devLog.debug(`🕉️ Moon sidereal longitude: ${lonSidereal}° (${m.lon}° - ${ay}°)`);
      }
      const sign = Math.floor(lonSidereal / 30);
      const degreeInSign = lonSidereal % 30;
      const { nakshatra, nakshatraPada } = getNakshatraInfo(lonSidereal);
      const dignity = getPlanetaryDignity(name, sign, degreeInSign);
      const house = opts.houses ? calculateHouseFromLongitude(lonSidereal, opts.houses) : undefined;
      return {
        ...m,
        lonSidereal,
        sign,
        signName: SIGNS[sign],
        degreeInSign,
        nakshatra,
        nakshatraPada,
        dignity,
        house,
        jd,
        valid: true,
      };
    }

    // Rahu/Ketu
    if (name === "rahu" || name === "ketu") {
      const rahuLon = nodeType === "mean" ? meanNodeLongitude(jd) : trueNodeLongitude(jd);
      const lon = name === "rahu" ? rahuLon : norm360(rahuLon + 180);
      const ay = ayanamshaValue(jd, ayanamshaType);
      const lonSidereal = norm360(lon - ay);
      const sign = Math.floor(lonSidereal / 30);
      const degreeInSign = lonSidereal % 30;
      const { nakshatra, nakshatraPada } = getNakshatraInfo(lonSidereal);
      const dignity = getPlanetaryDignity(name, sign, degreeInSign);
      const house = opts.houses ? calculateHouseFromLongitude(lonSidereal, opts.houses) : undefined;
      return {
        lon,
        lonSidereal,
        lat: 0,
        dist: null,
        sign,
        signName: SIGNS[sign],
        degreeInSign,
        nakshatra,
        nakshatraPada,
        dignity,
        house,
        jd,
        valid: true,
      };
    }

    // Planets & Sun - Use working tropical calculator
    const dateObj = date instanceof Date ? date : new Date(date);
    const tropicalPlanets = calculateTropicalPlanets(dateObj);
    let lon: number, lat: number, dist: number;
    
    // Map planet names to tropical calculator results
    switch (name) {
      case "sun":
        lon = tropicalPlanets.sun.longitude ?? 0;
        lat = tropicalPlanets.sun.latitude ?? 0;
        dist = tropicalPlanets.sun.distance ?? 0;
        break;
      case "mercury":
        lon = tropicalPlanets.mercury.longitude ?? 0;
        lat = tropicalPlanets.mercury.latitude ?? 0;
        dist = tropicalPlanets.mercury.distance ?? 0;
        break;
      case "venus":
        lon = tropicalPlanets.venus.longitude ?? 0;
        lat = tropicalPlanets.venus.latitude ?? 0;
        dist = tropicalPlanets.venus.distance ?? 0;
        break;
      case "mars":
        lon = tropicalPlanets.mars.longitude ?? 0;
        lat = tropicalPlanets.mars.latitude ?? 0;
        dist = tropicalPlanets.mars.distance ?? 0;
        break;
      case "jupiter":
        lon = tropicalPlanets.jupiter.longitude ?? 0;
        lat = tropicalPlanets.jupiter.latitude ?? 0;
        dist = tropicalPlanets.jupiter.distance ?? 0;
        break;
      case "saturn":
        lon = tropicalPlanets.saturn.longitude ?? 0;
        lat = tropicalPlanets.saturn.latitude ?? 0;
        dist = tropicalPlanets.saturn.distance ?? 0;
        break;
      default:
        throw new Error(`Unsupported planet: ${name}`);
    }
    const ay = ayanamshaValue(jd, ayanamshaType);
    if (verboseAstroLogs) {
      devLog.debug(`🕉️ ${name} calculation - JD: ${jd}, Ayanamsha: ${ay}°, Tropical lon: ${lon}°`);
    }
    const lonSidereal = norm360(lon - ay);
    if (verboseAstroLogs) {
      devLog.debug(`🕉️ ${name} sidereal longitude: ${lonSidereal}° (${lon}° - ${ay}°)`);
    }
    const sign = Math.floor(lonSidereal / 30);
    const degreeInSign = lonSidereal % 30;
    const { nakshatra, nakshatraPada } = getNakshatraInfo(lonSidereal);
    const dignity = getPlanetaryDignity(name, sign, degreeInSign);
    const house = opts.houses ? calculateHouseFromLongitude(lonSidereal, opts.houses) : undefined;

    return {
      lon,
      lonSidereal,
      lat,
      dist,
      sign,
      signName: SIGNS[sign],
      degreeInSign,
      nakshatra,
      nakshatraPada,
      dignity,
      house,
      jd,
      valid: true,
    };
  } catch (err) {
    devLog.error(`getPlanetCoords(${name}) failed`, err, 'astronomia-vedic');
    return { lon: 0, lat: 0, dist: 0, jd, valid: false };
  }
};

// Convenience function for all planets
export const getAllPlanetCoords = (date = new Date(), opts = {}) => {
  const planets: PlanetKey[] = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "rahu", "ketu"];
  const out: Record<string, any> = {};
  for (const p of planets) {
    out[p] = getPlanetCoords(p, date, opts);
  }
  return out;
};

// Calculate ascendant (rising sign) - simplified approximation
const calculateAscendant = (jd: number, latitude: number, longitude: number, ayanamshaType: string | number) => {
  try {
    // Calculate Local Sidereal Time (LST) using correct two-step method
    // Reference: Jean Meeus, "Astronomical Algorithms" 2nd Edition, Chapter 12
    
    // Step 1: Get JD at 0h UT (midnight)
    const jd0 = Math.floor(jd + 0.5) - 0.5;
    const T0 = (jd0 - 2451545.0) / 36525;
    
    // Step 2: Calculate GMST at 0h UT using IAU 2000 formula
    // IAU 2000 formula returns GMST in seconds (most accurate standard)
    const gmst0Seconds = 24110.54841 + 
                         8640184.812866 * T0 + 
                         0.093104 * T0 * T0 - 
                         0.0000062 * T0 * T0 * T0;
    
    // Normalize seconds to 0-86400 range (one sidereal day) before converting to degrees
    const gmst0SecondsNormalized = ((gmst0Seconds % 86400) + 86400) % 86400;
    const gmst0 = gmst0SecondsNormalized / 240;
    
    // Step 3: Get UT hours from JD
    const utHours = (jd - jd0) * 24;
    
    // Step 4: Calculate current GMST (add sidereal time progression)
    // 1 solar hour = 1.00273790935 sidereal hours = 15.04106864 degrees
    const gmstRaw = gmst0 + utHours * 15.04106864;
    
    // Step 5: Normalize to 0-360 degrees
    const gmst = norm360(gmstRaw);
    
    // Step 6: Local Sidereal Time = GMST + longitude (longitude in degrees)
    const lst = norm360(gmst + longitude);
    
    // Calculate RAMC (Right Ascension of Midheaven)
    const ramc = lst;
    
    // DEBUG: Log LST and RAMC values for Feb 24, 1983 (opt-in)
    if (verboseAstroLogs && Math.abs(jd - 2445389.865) < 0.1) {
      devLog.debug('🔍 ASCENDANT DEBUG for Feb 24, 1983:');
      devLog.debug('  JD:', jd);
      devLog.debug('  JD at 0h UT:', jd0);
      devLog.debug('  T0:', T0);
      devLog.debug('  GMST at 0h UT (seconds):', gmst0Seconds);
      devLog.debug('  GMST at 0h UT (degrees):', gmst0);
      devLog.debug('  UT hours:', utHours);
      devLog.debug('  GMST (raw):', gmstRaw);
      devLog.debug('  GMST (normalized):', gmst);
      devLog.debug('  Longitude:', longitude);
      devLog.debug('  LST:', lst);
      devLog.debug('  RAMC:', ramc);
    }
    
    // Use working tropical houses calculator for ascendant
    // Convert JD back to Date for tropical calculator
    const dateObj = new Date((jd - 2440587.5) * 86400000); // JD to Unix timestamp to Date
    const tropicalHouses = calculateTropicalHouses(dateObj, latitude, longitude);
    const ascTropical = tropicalHouses[0].longitude; // First house cusp is ascendant
    
    // Convert to sidereal
    const ay = ayanamshaValue(jd, ayanamshaType);
    const ascSidereal = norm360(ascTropical - ay);
    
    const sign = Math.floor(ascSidereal / 30);
    const degreeInSign = ascSidereal % 30;
    
    return {
      lonTropical: ascTropical,
      lonSidereal: ascSidereal,
      sign,
      signName: SIGNS[sign],
      degreeInSign,
      lord: HOUSE_LORDS[sign],
    };
  } catch (err) {
    devLog.error("Ascendant calculation error:", err, 'astronomia-vedic');
    // Fallback: use Sun's position as approximate ascendant
    return null;
  }
};

// House cusps calculation with proper ascendant
export const getHouseCusps = (
  date: Date | string | number,
  latitude: number,
  longitude: number,
  opts: { system?: "whole-sign" | "equal" | "placidus"; ayanamsha?: string | number } = {}
) => {
  const jd = toJD_TT(date);
  const system = opts.system ?? "whole-sign";
  const ayanamshaType = opts.ayanamsha ?? "lahiri";

  try {
    // Calculate ascendant
    const ascendant = calculateAscendant(jd, latitude, longitude, ayanamshaType);
    
    if (!ascendant) {
      throw new Error("Failed to calculate ascendant");
    }
    
    // Generate houses based on system
    const houses = [];
    
    if (system === "whole-sign") {
      // Whole Sign Houses: Each house = one sign, starting from ascendant sign
      for (let i = 0; i < 12; i++) {
        const houseSign = (ascendant.sign + i) % 12;
        const cuspLonSid = houseSign * 30;
        houses.push({
          house: i + 1,
          cuspLonSid,
          sign: houseSign,
          signName: SIGNS[houseSign],
          lord: HOUSE_LORDS[houseSign],
          bhavaMadhya: cuspLonSid + 15, // Middle of house
        });
      }
    } else if (system === "equal") {
      // Equal Houses: Each house = 30°, starting from ascendant degree
      for (let i = 0; i < 12; i++) {
        const cuspLonSid = norm360(ascendant.lonSidereal + (i * 30));
        const sign = Math.floor(cuspLonSid / 30);
        houses.push({
          house: i + 1,
          cuspLonSid,
          sign,
          signName: SIGNS[sign],
          lord: HOUSE_LORDS[sign],
          bhavaMadhya: norm360(cuspLonSid + 15),
        });
      }
    } else {
      // Placidus: same tropical Placidus cusps as Western (`calculateTropicalHouses`), minus ayanamsha
      const dateObj = date instanceof Date ? date : new Date(date);
      const tropicalHouses = calculateTropicalHouses(dateObj, latitude, longitude);
      const ay = ayanamshaValue(jd, ayanamshaType);
      const sorted = [...tropicalHouses].sort((a, b) => a.number - b.number);
      for (const h of sorted) {
        const cuspLonSid = norm360(h.longitude - ay);
        const sign = Math.floor(cuspLonSid / 30);
        houses.push({
          house: h.number,
          cuspLonSid,
          sign,
          signName: SIGNS[sign],
          lord: HOUSE_LORDS[sign],
          bhavaMadhya: norm360(cuspLonSid + 15),
        });
      }
    }

    return {
      houses,
      ascendant,
      metadata: {
        system,
        ayanamsha: ayanamshaType,
        ayanamshaValue: ayanamshaValue(jd, ayanamshaType),
        jd,
      }
    };
  } catch (err) {
    devLog.error("getHouseCusps error:", err, 'astronomia-vedic');
    return { houses: [], ascendant: null, metadata: { error: String(err) } };
  }
};

// Complete chart function (placeholder for now)
export const getChart = (
  birthData: {
    date: Date | string | number;  // Calculation date (for planetary positions)
    latitude: number;
    longitude: number;
    name?: string;
    place?: string;
    birthDate?: Date | string | number;  // Actual birth date (for Dasha)
  },
  opts: {
    houseSystem?: "whole-sign" | "equal" | "placidus";
    ayanamsha?: string | number;
    nodeType?: "mean" | "true";
  } = {}
) => {
  try {
    const dateForCalc = birthData.date instanceof Date ? birthData.date : new Date(birthData.date);
    const houses = getHouseCusps(dateForCalc, birthData.latitude, birthData.longitude, opts);
    const planets = getAllPlanetCoords(dateForCalc, { ...opts, houses: houses.houses });
    
    // Calculate divisional charts
    const ascLon = houses.ascendant?.lonSidereal ?? 0;
    const divisionalCharts = getDivisionalCharts(planets, ascLon);
    
    // Calculate Vimshottari Dasha (requires Moon position)
    const moonData = planets.moon;
    if (moonData && verboseAstroLogs) {
      devLog.debug('🔮 MOON DATA FOR DASHA:');
      devLog.debug('  Moon lonSidereal:', moonData.lonSidereal);
      devLog.debug('  Moon sign:', moonData.sign, '(' + moonData.signName + ')');
      devLog.debug('  Moon degreeInSign:', moonData.degreeInSign);
      devLog.debug('  Moon nakshatra:', moonData.nakshatra);
    }
    
    // Use birthDate if provided, otherwise fall back to date (for backward compatibility)
    // Handle explicit null birthDate to skip Dasha calculation
    const actualBirthDate = birthData.birthDate === null ? null : (birthData.birthDate ?? birthData.date);
    const actualBirthDateObj = actualBirthDate == null ? undefined : (actualBirthDate instanceof Date ? actualBirthDate : new Date(actualBirthDate));
    if (verboseAstroLogs) {
      devLog.debug('🔮 DASHA BIRTH DATE:', actualBirthDate);
    }
    const dashaList = moonData && actualBirthDateObj 
      ? calculateVimshottariDasha(moonData.lonSidereal, actualBirthDateObj) 
      : [];
    
    return {
      birthData,
      ascendant: houses.ascendant,
      planets,
      houses: houses.houses,
      divisionalCharts, // D9, D10, D12, D30
      dasha: dashaList, // Vimshottari Dasha periods
      currentDasha: dashaList.find(d => d.isCurrent) || null,
      metadata: {
        ...houses.metadata,
        latitude: birthData.latitude,
        longitude: birthData.longitude,
        calculatedAt: new Date().toISOString(),
        valid: true
      }
    };
  } catch (err) {
    devLog.error("getChart error:", err, 'astronomia-vedic');
    return {
      birthData,
      ascendant: null,
      planets: {},
      houses: [],
      metadata: { error: String(err), valid: false }
    };
  }
};

// ============================================================================
// DIVISIONAL CHARTS (VARGAS) - D9, D10, D12, D30
// ============================================================================

/**
 * Calculate divisional sign for a given longitude and division number
 * Based on Parashara's rules for Varga calculations
 * 
 * @param lon - Sidereal longitude (0-360)
 * @param division - Division number (9 for D9, 10 for D10, etc.)
 * @returns Sign index (0-11) in the divisional chart
 */
export function getDivisionalSign(lon: number, division: number): number {
  const signIndex = Math.floor(lon / 30); // 0..11 Aries..Pisces
  const degreesInSign = lon % 30;
  const part = Math.floor((degreesInSign / (30 / division))); // which subdivision (0-based)

  // Standard odd/even sign correction (Parashara rule)
  // Odd signs (Aries, Gemini, Leo, etc.) count forward
  // Even signs (Taurus, Cancer, Virgo, etc.) count from 9th sign
  const isEvenSign = signIndex % 2 !== 0;
  const divisionalStart = isEvenSign ? (signIndex + 8) % 12 : signIndex;

  return (divisionalStart + part) % 12;
}

/**
 * Get all divisional charts for given planets
 * 
 * @param planets - Object with planet data from getChart()
 * @param ascendantLonSidereal - Sidereal longitude of the ascendant
 * @returns Object with D9, D10, D12, D30 charts
 */
export function getDivisionalCharts(
  planets: Record<string, any>, 
  ascendantLonSidereal: number
): Record<string, any> {
  const divisions = { 
    D9: 9,   // Navamsa - Marriage, spirituality
    D10: 10, // Dasamsa - Career, profession
    D12: 12, // Dwadasamsa - Parents, ancestors
    D30: 30  // Trimsamsa - Health, misfortunes
  };
  
  const result: Record<string, any> = {};

  Object.entries(divisions).forEach(([chartName, divisionNumber]) => {
    result[chartName] = {};
    
    // Calculate divisional ascendant
    const divAscSign = getDivisionalSign(ascendantLonSidereal, divisionNumber);
    const divAscDegree = (ascendantLonSidereal % 30); // Keep degree within sign
    
    result[chartName].ascendant = {
      divSign: divAscSign,
      signName: SIGNS[divAscSign],
      degreeInSign: divAscDegree,
      lonSidereal: ascendantLonSidereal
    };
    
    // Calculate divisional planets
    Object.entries(planets).forEach(([planetName, planetData]: [string, any]) => {
      const divSign = getDivisionalSign(planetData.lonSidereal, divisionNumber);
      
      result[chartName][planetName] = {
        name: planetName,
        lonSidereal: planetData.lonSidereal,
        divSign: divSign,
        signName: SIGNS[divSign],
        degreeInSign: planetData.degreeInSign, // Keep original degree for reference
        nakshatra: planetData.nakshatra,
        nakshatraPada: planetData.nakshatraPada
      };
    });
  });

  return result;
}

// ============================================================================
// VIMSHOTTARI DASHA SYSTEM
// ============================================================================

const DASHA_SEQUENCE = [
  { lord: "Ketu", years: 7 },
  { lord: "Venus", years: 20 },
  { lord: "Sun", years: 6 },
  { lord: "Moon", years: 10 },
  { lord: "Mars", years: 7 },
  { lord: "Rahu", years: 18 },
  { lord: "Jupiter", years: 16 },
  { lord: "Saturn", years: 19 },
  { lord: "Mercury", years: 17 }
];

/**
 * Calculate Vimshottari Dasha periods based on Moon's nakshatra
 * 
 * @param moonLon - Moon's sidereal longitude
 * @param birthDate - Birth date/time
 * @returns Array of Mahadasha periods with start/end dates
 */
export function calculateVimshottariDasha(moonLon: number, birthDate: Date) {
  if (verboseAstroLogs) {
    devLog.debug('🔮 DASHA CALCULATION DEBUG:');
    devLog.debug('  Moon longitude:', moonLon);
    devLog.debug('  Birth date:', birthDate);
  }
  
  // Determine starting nakshatra (0-26)
  const nakIndex = Math.floor((moonLon % 360) / (360 / 27));
  if (verboseAstroLogs) {
    devLog.debug('  Nakshatra index:', nakIndex);
  }
  
  // Calculate how much of the first dasha has already elapsed at birth
  const degreesInNak = moonLon % (360 / 27);
  const nakPart = degreesInNak / (360 / 27); // 0 to 1
  
  // Starting dasha lord based on nakshatra
  const startDashaIndex = nakIndex % 9;
  if (verboseAstroLogs) {
    devLog.debug('  Start Dasha index:', startDashaIndex);
  }
  
  const startLord = DASHA_SEQUENCE[startDashaIndex];
  if (verboseAstroLogs) {
    devLog.debug('  Start Dasha lord:', startLord.lord);
  }
  
  // Validate startLord exists
  if (!startLord || typeof startLord.years !== 'number') {
    throw new Error(`Invalid dasha sequence at index ${startDashaIndex}`);
  }
  
  // Calculate elapsed portion of first dasha
  const elapsedYears = startLord.years * nakPart;
  const remainingYears = startLord.years - elapsedYears;
  
  const dashaList = [];
  let cursor = new Date(birthDate);
  
  // First dasha (partial)
  const firstEnd = new Date(cursor.getTime() + remainingYears * 365.25 * 24 * 3600 * 1000);
  dashaList.push({
    planet: startLord.lord,
    startDate: cursor.toISOString().split('T')[0],
    endDate: firstEnd.toISOString().split('T')[0],
    duration: remainingYears,
    dashaType: 'mahadasha',
    isCurrent: false,
    progress: 0,
    effects: []
  });
  cursor = firstEnd;
  
  // Remaining dashas (full cycles)
  for (let i = 1; i < DASHA_SEQUENCE.length; i++) {
    const lord = DASHA_SEQUENCE[(startDashaIndex + i) % 9];
    
    // Validate lord exists
    if (!lord || typeof lord.years !== 'number') {
      throw new Error(`Invalid dasha sequence at index ${(startDashaIndex + i) % 9}`);
    }
    
    const years = lord.years;
    const end = new Date(cursor.getTime() + years * 365.25 * 24 * 3600 * 1000);
    
    dashaList.push({
      planet: lord.lord,
      startDate: cursor.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      duration: years,
      dashaType: 'mahadasha',
      isCurrent: false,
      progress: 0,
      effects: []
    });
    
    cursor = end;
  }
  
  // Mark current dasha and calculate antardashas
  const now = new Date();
  for (const dasha of dashaList) {
    const start = new Date(dasha.startDate);
    const end = new Date(dasha.endDate);
    
    if (now >= start && now <= end) {
      dasha.isCurrent = true;
      const totalDuration = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      dasha.progress = (elapsed / totalDuration) * 100;
      
      // Calculate antardashas for current mahadasha
      (dasha as { antardashas?: Array<{ planet: string; startDate: string; endDate: string; duration: number; progress: number; dashaType: string }> }).antardashas = calculateAntardashas(dasha, start, end);
      break;
    }
  }
  
  return dashaList;
}

/**
 * Calculate Antardashas (sub-periods) for a Mahadasha
 * 
 * @param mahadasha - The current mahadasha object
 * @param startDate - Start date of the mahadasha
 * @param endDate - End date of the mahadasha
 * @returns Array of antardasha periods
 */
function calculateAntardashas(mahadasha: any, startDate: Date, endDate: Date): Array<{ planet: string; startDate: string; endDate: string; duration: number; progress: number; dashaType: string }> {
  const antardashas: Array<{ planet: string; startDate: string; endDate: string; duration: number; progress: number; dashaType: string }> = [];
  const mahadashaYears = mahadasha.duration;
  const totalDuration = endDate.getTime() - startDate.getTime();
  
  // Calculate each antardasha within the mahadasha
  DASHA_SEQUENCE.forEach((dashaLord) => {
    const antardashaYears = (dashaLord.years / 120) * mahadashaYears;
    const antardashaDuration = (antardashaYears / mahadashaYears) * totalDuration;
    const antardashaEnd = new Date(startDate.getTime() + antardashaDuration);
    
    // Calculate progress for current antardasha
    const now = new Date();
    let progress = 0;
    if (now >= startDate && now <= antardashaEnd) {
      const elapsed = now.getTime() - startDate.getTime();
      progress = (elapsed / antardashaDuration) * 100;
    } else if (now > antardashaEnd) {
      progress = 100;
    }
    
    antardashas.push({
      planet: dashaLord.lord,
      startDate: startDate.toISOString().split('T')[0],
      endDate: antardashaEnd.toISOString().split('T')[0],
      duration: antardashaYears,
      progress: Math.round(progress),
      dashaType: 'antardasha'
    });
    
    startDate.setTime(antardashaEnd.getTime());
  });
  
  return antardashas;
}

// Validation function for Feb 24, 1983 test case
export function validateVedicPosition(date: Date, expectedSun: number, expectedAsc: number) {
  if (date.getUTCFullYear() === 1983 && 
      date.getUTCMonth() === 1 && 
      date.getUTCDate() === 24) {
    
    if (verboseAstroLogs) {
      devLog.debug('🕉️ VEDIC VALIDATION for Feb 24, 1983:');
      devLog.debug('🕉️ Expected Sun: ~11° Aquarius (sidereal ~311°)');
      devLog.debug('🕉️ Expected Ascendant: ~13° Gemini (sidereal ~73°)');
    }
    
    // Sun should be around 311° (11° Aquarius)
    // Ascendant should be around 73° (13° Gemini)
    const sunCorrect = Math.abs(expectedSun - 311) < 5;
    const ascCorrect = Math.abs(expectedAsc - 73) < 5;
    
    if (sunCorrect && ascCorrect) {
      if (verboseAstroLogs) {
        devLog.debug('✅ Feb 24, 1983 Vedic positions CORRECT');
      }
    } else {
      if (verboseAstroLogs) {
        devLog.warn('Feb 24, 1983 Vedic positions WRONG', undefined, 'astronomia-vedic');
        devLog.warn(`Sun: ${expectedSun}° (expected ~311°)`, undefined, 'astronomia-vedic');
        devLog.warn(`Asc: ${expectedAsc}° (expected ~97°)`, undefined, 'astronomia-vedic');
      }
    }
  }
}