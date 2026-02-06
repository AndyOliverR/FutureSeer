// Unified sidereal Vedic engine for Vercel + Firebase
// - Uses production-ready astronomia wrapper (lib/astronomia-vedic.ts)
// - Accurate planetary positions with proper VSOP87B ephemeris
// - Rahu/Ketu via mean/true node calculations
// - Multiple ayanamsha systems (Lahiri, Raman, KP, Yukteshwar)
// - Returns formatted label AND raw numeric sign/degree for sorting/filtering

import { getPlanetCoords, getAllPlanetCoords, getHouseCusps } from "./astronomia-vedic";

export type NodeMode = "true" | "mean";

export type PlanetLabel = {
  name: string;
  longitude: number; // 0..360 sidereal
  signIndex: number; // 0..11 (0=Aries)
  degreeInSign: number; // 0..30
  label: string; // e.g., "Rahu 23.45° Aries (House 7)"
  // D9
  d9SignIndex?: number;
  d9DegreeInSign?: number;
  d9Label?: string; // e.g., "D9: 12.10° Sagittarius"
  d9House?: number; // 1..12
  // Nakshatra
  nakshatraIndex?: number; // 0..26
  nakshatraName?: string; // e.g., "Rohini"
  nakshatraLord?: string; // e.g., "Brahma"
  pada?: number; // 1..4
  nakshatraLabel?: string; // e.g., "Rohini 2"
};

export type HousePlacements = {
  house: number; // 1..12
  planets: PlanetLabel[];
  signIndex: number; // 0..11 (0=Aries)
  signName: string; // e.g., "Leo"
  degreeInSign: number; // 0..30
  cuspLongitude: number; // 0..360
};

export type Placements = HousePlacements[];

export type ChartData = VedicChart & {
  placements?: Placements;
  dasha?: unknown[];
  currentDasha?: unknown;
};

export type NavamsaPlacements = {
  navamsa: number; // 1..12
  planets: PlanetLabel[];
  signIndex: number; // 0..11
  signName: string;
  degreeInSign: number; // 0..30
  cuspLongitude: number; // 0..360
};

export type VedicChart = {
  planets: Array<{
    name: string;
    longitude: number;
    latitude: number;
    signIndex: number;
    signName: string;
    degreeInSign: number;
    house: number;
    nakshatra: string;
    nakshatraLord: string;
    pada: number;
  }>;
  houses: Array<{
    house: number;
    signIndex: number;
    signName: string;
    cuspLongitude: number;
  }>;
  ascendant: {
    longitude: number;
    signIndex: number;
    signName: string;
    degreeInSign: number;
  };
};

// Zodiac signs (0=Aries, 11=Pisces)
const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

// Nakshatras (27 lunar mansions)
const NAKSHATRAS = [
  { name: "Ashwini", lord: "Ketu", range: [0, 13.3333] },
  { name: "Bharani", lord: "Venus", range: [13.3333, 26.6667] },
  { name: "Krittika", lord: "Sun", range: [26.6667, 40] },
  { name: "Rohini", lord: "Moon", range: [40, 53.3333] },
  { name: "Mrigashira", lord: "Mars", range: [53.3333, 66.6667] },
  { name: "Ardra", lord: "Rahu", range: [66.6667, 80] },
  { name: "Punarvasu", lord: "Jupiter", range: [80, 93.3333] },
  { name: "Pushya", lord: "Saturn", range: [93.3333, 106.6667] },
  { name: "Ashlesha", lord: "Mercury", range: [106.6667, 120] },
  { name: "Magha", lord: "Ketu", range: [120, 133.3333] },
  { name: "Purva Phalguni", lord: "Venus", range: [133.3333, 146.6667] },
  { name: "Uttara Phalguni", lord: "Sun", range: [146.6667, 160] },
  { name: "Hasta", lord: "Moon", range: [160, 173.3333] },
  { name: "Chitra", lord: "Mars", range: [173.3333, 186.6667] },
  { name: "Swati", lord: "Rahu", range: [186.6667, 200] },
  { name: "Vishakha", lord: "Jupiter", range: [200, 213.3333] },
  { name: "Anuradha", lord: "Saturn", range: [213.3333, 226.6667] },
  { name: "Jyeshtha", lord: "Mercury", range: [226.6667, 240] },
  { name: "Mula", lord: "Ketu", range: [240, 253.3333] },
  { name: "Purva Ashadha", lord: "Venus", range: [253.3333, 266.6667] },
  { name: "Uttara Ashadha", lord: "Sun", range: [266.6667, 280] },
  { name: "Shravana", lord: "Moon", range: [280, 293.3333] },
  { name: "Dhanishtha", lord: "Mars", range: [293.3333, 306.6667] },
  { name: "Shatabhisha", lord: "Rahu", range: [306.6667, 320] },
  { name: "Purva Bhadrapada", lord: "Jupiter", range: [320, 333.3333] },
  { name: "Uttara Bhadrapada", lord: "Saturn", range: [333.3333, 346.6667] },
  { name: "Revati", lord: "Mercury", range: [346.6667, 360] }
];

// Utility functions
function norm360(deg: number): number {
  while (deg < 0) deg += 360;
  while (deg >= 360) deg -= 360;
  return deg;
}

function getSignIndex(longitude: number): number {
  return Math.floor(longitude / 30);
}

function toSignData(longitude: number): { signIndex: number; degreeInSign: number } {
  const signIndex = getSignIndex(longitude);
  const degreeInSign = longitude % 30;
  return { signIndex, degreeInSign };
}

function formatDegree(longitude: number): string {
  const { signIndex, degreeInSign } = toSignData(longitude);
  return `${degreeInSign.toFixed(2)}° ${SIGNS[signIndex]}`;
}

function getHouse(signIndex: number, ascendantSign: number): number {
  return ((signIndex - ascendantSign + 12) % 12) + 1;
}

function getNakshatraFromLongitude(longitude: number): {
  index: number;
  name: string;
  lord: string;
  pada: number;
} {
  const normLon = norm360(longitude);
  
  for (let i = 0; i < NAKSHATRAS.length; i++) {
    const nakshatra = NAKSHATRAS[i];
    if (normLon >= nakshatra.range[0] && normLon < nakshatra.range[1]) {
      const pada = Math.floor((normLon - nakshatra.range[0]) / 3.3333) + 1;
      return {
        index: i,
        name: nakshatra.name,
        lord: nakshatra.lord,
        pada: Math.min(pada, 4)
      };
    }
  }
  
  // Fallback to last nakshatra
  const lastNakshatra = NAKSHATRAS[NAKSHATRAS.length - 1];
  return {
    index: NAKSHATRAS.length - 1,
    name: lastNakshatra.name,
    lord: lastNakshatra.lord,
    pada: 4
  };
}

function navamsaSignIndex(signIndex: number, degreeInSign: number): number {
  const navamsaIndex = Math.floor(degreeInSign / 3.3333);
  return (signIndex * 9 + navamsaIndex) % 12;
}

function navamsaDegreeInSign(degreeInSign: number): number {
  return (degreeInSign % 3.3333) * 9;
}

// ---------- Main API: generatePlacements ----------
export async function generatePlacements(
  birthDate: string,      // 'YYYY-MM-DD'
  birthTime: string,      // 'HH:mm' 24h
  lat: number,            // latitude (deg)
  lon: number,            // longitude (deg, East positive)
  nodeMode: NodeMode = "mean" // 'true' | 'mean' - default to mean for Vedic
): Promise<Placements> {
  console.log('🔮 Generating placements with NEW astronomia wrapper');
  console.log(`Birth data: ${birthDate} ${birthTime}, Lat: ${lat}, Lon: ${lon}, Node: ${nodeMode}`);
  
  // Validate inputs
  if (isNaN(lat) || isNaN(lon)) {
    console.error(`Invalid coordinates: lat=${lat}, lon=${lon}`);
    lat = 12.2958; // Default to Mysore coordinates
    lon = 76.6394;
  }

  try {
    // Create date object for astronomia wrapper
    const dateTimeString = `${birthDate}T${birthTime}:00`;
    const birthDateTime = new Date(dateTimeString);
    
    // Get all planet coordinates using the new astronomia wrapper
    const allPlanets = getAllPlanetCoords(birthDateTime, { nodeType: nodeMode });
    
    // Get house cusps using the new astronomia wrapper
    const houseData = getHouseCusps(birthDateTime, lat, lon, {
      system: "whole-sign",
      ayanamsha: "lahiri"
    });

    if (!houseData.ascendant) {
      throw new Error("Failed to calculate ascendant");
    }

    const ascSign = houseData.ascendant.sign;
    const placements: Placements = Array.from({ length: 12 }, (_, i) => ({
      house: i + 1,
      planets: [],
      signIndex: houseData.houses[i]?.sign || 0,
      signName: houseData.houses[i]?.signName || "",
      degreeInSign: 0,
      cuspLongitude: houseData.houses[i]?.cuspLonSid || 0
    }));

    // Add Ascendant to House 1
    const ascSignData = toSignData(houseData.ascendant.lonSidereal);
    const ascNakshatraData = getNakshatraFromLongitude(houseData.ascendant.lonSidereal);
    const ascD9SignIndex = navamsaSignIndex(ascSignData.signIndex, ascSignData.degreeInSign);
    const ascD9DegreeInSign = navamsaDegreeInSign(ascSignData.degreeInSign);
    
    placements[0].planets.push({
      name: "Asc",
      longitude: houseData.ascendant.lonSidereal,
      signIndex: ascSignData.signIndex,
      degreeInSign: ascSignData.degreeInSign,
      label: `Ascendant ${formatDegree(houseData.ascendant.lonSidereal)} (House 1)`,
      d9SignIndex: ascD9SignIndex,
      d9DegreeInSign: ascD9DegreeInSign,
      d9Label: `D9: ${ascD9DegreeInSign.toFixed(2)}° ${SIGNS[ascD9SignIndex]}`,
      d9House: getHouse(ascD9SignIndex, ascSign),
      nakshatraIndex: ascNakshatraData.index,
      nakshatraName: ascNakshatraData.name,
      nakshatraLord: ascNakshatraData.lord,
      pada: ascNakshatraData.pada,
      nakshatraLabel: `${ascNakshatraData.name} ${ascNakshatraData.pada}`
    });

    // Add all planets using the astronomia wrapper data
    const planetNames = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "rahu", "ketu"];
    
    for (const planetName of planetNames) {
      const planetData = allPlanets[planetName];
      if (!planetData || !planetData.valid) {
        console.warn(`Invalid data for ${planetName}:`, planetData);
        continue;
      }

      const siderealLon = planetData.lonSidereal || planetData.lon;
      const signIndex = getSignIndex(siderealLon);
      const house = getHouse(signIndex, ascSign);
      const signData = toSignData(siderealLon);
      const nakshatraData = getNakshatraFromLongitude(siderealLon);
      const d9SignIndex = navamsaSignIndex(signData.signIndex, signData.degreeInSign);
      const d9DegreeInSign = navamsaDegreeInSign(signData.degreeInSign);

      // Ensure the house index is valid
      if (house >= 1 && house <= 12 && placements[house - 1]) {
        const displayName = planetName === "rahu" ? (nodeMode === "mean" ? "Rahu (Mean)" : "Rahu") :
                           planetName === "ketu" ? (nodeMode === "mean" ? "Ketu (Mean)" : "Ketu") :
                           planetName.charAt(0).toUpperCase() + planetName.slice(1);
        
        placements[house - 1].planets.push({
          name: displayName,
          longitude: siderealLon,
          signIndex: signData.signIndex,
          degreeInSign: signData.degreeInSign,
          label: `${displayName} ${formatDegree(siderealLon)} (House ${house})`,
          d9SignIndex,
          d9DegreeInSign,
          d9Label: `D9: ${d9DegreeInSign.toFixed(2)}° ${SIGNS[d9SignIndex]}`,
          d9House: getHouse(d9SignIndex, ascSign),
          nakshatraIndex: nakshatraData.index,
          nakshatraName: nakshatraData.name,
          nakshatraLord: nakshatraData.lord,
          pada: nakshatraData.pada,
          nakshatraLabel: `${nakshatraData.name} ${nakshatraData.pada}`
        });
      } else {
        console.error(`Invalid house number ${house} for ${planetName}`);
      }
    }

    return placements;
    
  } catch (error) {
    console.error('Error generating placements:', error);
    // Return empty placements on error
    return Array.from({ length: 12 }, (_, i) => ({
      house: i + 1,
      planets: [],
      signIndex: 0,
      signName: "",
      degreeInSign: 0,
      cuspLongitude: 0
    }));
  }
}

// Legacy function for compatibility
export async function generatePlacementsLegacy(
  birthDate: string,
  birthTime: string,
  lat: number,
  lon: number
): Promise<{ house: number; planets: string[] }[]> {
  const placements = await generatePlacements(birthDate, birthTime, lat, lon, "mean");
  
  return placements.map(house => ({
    house: house.house,
    planets: house.planets.map(planet => planet.name)
  }));
}

// Utility functions for chart summary
export function getChartSummary(chart: VedicChart): {
  ascendant: string;
  sunSign: string;
  moonSign: string;
  planetsCount: number;
  housesCount: number;
} {
  const sun = chart.planets.find(p => p.name.toLowerCase() === "sun");
  const moon = chart.planets.find(p => p.name.toLowerCase() === "moon");
  
  return {
    ascendant: chart.ascendant.signName,
    sunSign: sun?.signName || "Unknown",
    moonSign: moon?.signName || "Unknown",
    planetsCount: chart.planets.length,
    housesCount: chart.houses.length
  };
}

// Generate chart data for the UI
export async function generateChartData(
  birthDate: string,
  birthTime: string,
  lat: number,
  lon: number,
  nodeMode: NodeMode = "mean"
): Promise<VedicChart> {
  console.log('🔮 Generating chart data with astronomia wrapper');
  
  try {
    // Create date object for astronomia wrapper
    const dateTimeString = `${birthDate}T${birthTime}:00`;
    const birthDateTime = new Date(dateTimeString);
    
    // Get all planet coordinates
    const allPlanets = getAllPlanetCoords(birthDateTime, { nodeType: nodeMode });
    
    // Get house cusps
    const houseData = getHouseCusps(birthDateTime, lat, lon, {
      system: "whole-sign",
      ayanamsha: "lahiri"
    });

    if (!houseData.ascendant) {
      throw new Error("Failed to calculate ascendant");
    }

    // Convert planet data to chart format
    const planets = Object.entries(allPlanets)
      .filter(([name, data]) => data.valid)
      .map(([name, data]) => {
        const siderealLon = data.lonSidereal || data.lon;
        const signIndex = getSignIndex(siderealLon);
        const signData = toSignData(siderealLon);
        const nakshatraData = getNakshatraFromLongitude(siderealLon);
        
        return {
          name: name.charAt(0).toUpperCase() + name.slice(1),
          longitude: siderealLon,
          latitude: data.lat || 0,
          signIndex,
          signName: SIGNS[signIndex],
          degreeInSign: signData.degreeInSign,
          house: getHouse(signIndex, houseData.ascendant.sign),
          nakshatra: nakshatraData.name,
          nakshatraLord: nakshatraData.lord,
          pada: nakshatraData.pada
        };
      });

    // Convert house data to chart format
    const houses = houseData.houses.map(house => ({
      house: house.house,
      signIndex: house.sign,
      signName: house.signName,
      cuspLongitude: house.cuspLonSid
    }));

    return {
      planets,
      houses,
      ascendant: {
        longitude: houseData.ascendant.lonSidereal,
        signIndex: houseData.ascendant.sign,
        signName: houseData.ascendant.signName,
        degreeInSign: houseData.ascendant.degreeInSign
      }
    };
    
  } catch (error) {
    console.error('Error generating chart data:', error);
    throw error;
  }
}

// Export all the utility functions that might be used elsewhere
export {
  SIGNS,
  NAKSHATRAS,
  norm360,
  getSignIndex,
  toSignData,
  formatDegree,
  getHouse,
  getNakshatraFromLongitude,
  navamsaSignIndex,
  navamsaDegreeInSign
};
