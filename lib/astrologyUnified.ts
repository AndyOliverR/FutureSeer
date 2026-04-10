// Unified Swiss Ephemeris Service
// WASM for Vercel/Firebase, Node fallback for local development
// Provides precise astronomical calculations for all occult systems

import * as julian from "astronomia/julian"
import { devLog } from '@/lib/devLogger';
import * as planetposition from "astronomia/planetposition"
import earthData from "astronomia/data/vsop87Bearth"
import mercuryData from "astronomia/data/vsop87Bmercury"
import venusData from "astronomia/data/vsop87Bvenus"
import marsData from "astronomia/data/vsop87Bmars"
import jupiterData from "astronomia/data/vsop87Bjupiter"
import saturnData from "astronomia/data/vsop87Bsaturn"
const data = { sun: earthData, moon: earthData, earth: earthData, mercury: mercuryData, venus: venusData, mars: marsData, jupiter: jupiterData, saturn: saturnData }

export interface BirthData {
  birthDate: string
  birthTime: string
  birthPlace: string
  latitude: number
  longitude: number
}

export interface PlanetPosition {
  name: string
  longitude: number
  latitude: number
  distance: number
  speed: number
  sign: string
  degree: number
  minute: number
  second: number
  house: number
  nakshatra: string
  pada: number
  isRetrograde: boolean
}

export interface HouseCusp {
  number: number
  longitude: number
  latitude: number
  sign: string
  degree: number
  minute: number
  second: number
}

export interface VedicChart {
  planets: PlanetPosition[]
  houses: HouseCusp[]
  ascendant: {
    longitude: number
    sign: string
    degree: number
    minute: number
  }
  chartType: string
  ayanamsha: number
}

// Vedic signs
const VEDIC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
]

// Nakshatras
const NAKSHATRAS = [
  { name: 'Ashwini', lord: 'Ketu', pada: 1 },
  { name: 'Bharani', lord: 'Venus', pada: 1 },
  { name: 'Krittika', lord: 'Sun', pada: 1 },
  { name: 'Rohini', lord: 'Moon', pada: 1 },
  { name: 'Mrigashira', lord: 'Mars', pada: 1 },
  { name: 'Ardra', lord: 'Rahu', pada: 1 },
  { name: 'Punarvasu', lord: 'Jupiter', pada: 1 },
  { name: 'Pushya', lord: 'Saturn', pada: 1 },
  { name: 'Ashlesha', lord: 'Mercury', pada: 1 },
  { name: 'Magha', lord: 'Ketu', pada: 1 },
  { name: 'Purva Phalguni', lord: 'Venus', pada: 1 },
  { name: 'Uttara Phalguni', lord: 'Sun', pada: 1 },
  { name: 'Hasta', lord: 'Moon', pada: 1 },
  { name: 'Chitra', lord: 'Mars', pada: 1 },
  { name: 'Swati', lord: 'Rahu', pada: 1 },
  { name: 'Vishakha', lord: 'Jupiter', pada: 1 },
  { name: 'Anuradha', lord: 'Saturn', pada: 1 },
  { name: 'Jyeshtha', lord: 'Mercury', pada: 1 },
  { name: 'Mula', lord: 'Ketu', pada: 1 },
  { name: 'Purva Ashadha', lord: 'Venus', pada: 1 },
  { name: 'Uttara Ashadha', lord: 'Sun', pada: 1 },
  { name: 'Shravana', lord: 'Moon', pada: 1 },
  { name: 'Dhanishtha', lord: 'Mars', pada: 1 },
  { name: 'Shatabhisha', lord: 'Rahu', pada: 1 },
  { name: 'Purva Bhadrapada', lord: 'Jupiter', pada: 1 },
  { name: 'Uttara Bhadrapada', lord: 'Saturn', pada: 1 },
  { name: 'Revati', lord: 'Mercury', pada: 1 }
]

// Planet data for Astronomia
const PLANETS = {
  Sun: data.sun,
  Moon: data.moon,
  Mars: data.mars,
  Mercury: data.mercury,
  Jupiter: data.jupiter,
  Venus: data.venus,
  Saturn: data.saturn,
}

// WASM Swiss Ephemeris (for Vercel/Firebase)
let wasmInitialized = false
let wasmSwe: any = null

async function initializeWasmSwissEphemeris() {
  if (wasmInitialized) return wasmSwe

  try {
    // Dynamic import for WASM (API may vary; use type-safe fallback)
    const swissephMod = await import('swisseph-wasm')
    const initFn = swissephMod.default as unknown as (opts: { locateFile?: (f: string) => string }) => Promise<{ swe_set_ephe_path?: (p: string) => void; swe_set_sid_mode?: (mode: number, a: number, b: number) => void } | void>
    const sweApi = await initFn({
      locateFile: (file: string) => `/ephe/${file}`,
    })
    const swe = (sweApi ?? (swissephMod as { swe?: unknown }).swe) as typeof wasmSwe
    if (swe && typeof swe.swe_set_ephe_path === 'function') {
      swe.swe_set_ephe_path('/ephe')
      if (typeof swe.swe_set_sid_mode === 'function') swe.swe_set_sid_mode((swe as { SIDM_LAHIRI?: number }).SIDM_LAHIRI ?? 1, 0, 0)
    }
    wasmInitialized = true
    wasmSwe = swe
    devLog.debug('✅ Swiss Ephemeris WASM initialized')
    return swe
  } catch (error) {
    devLog.warn('⚠️ Swiss Ephemeris WASM failed to initialize:', error, 'astrologyUnified')
    return null
  }
}

// Node Swiss Ephemeris (for local development)
let nodeSwe: any = null

async function initializeNodeSwissEphemeris() {
  if (nodeSwe) return nodeSwe

  try {
    // Dynamic import for Node
    const swe = await import('swisseph')
    nodeSwe = swe.default || swe
    devLog.debug('✅ Swiss Ephemeris Node initialized')
    return nodeSwe
  } catch (error) {
    devLog.warn('⚠️ Swiss Ephemeris Node failed to initialize:', error, 'astrologyUnified')
    return null
  }
}

// Unified Swiss Ephemeris initialization
async function getSwissEphemeris() {
  // Try WASM first (for Vercel/Firebase)
  const wasmSwe = await initializeWasmSwissEphemeris()
  if (wasmSwe) return wasmSwe

  // Fallback to Node (for local development)
  const nodeSwe = await initializeNodeSwissEphemeris()
  if (nodeSwe) return nodeSwe

  throw new Error('Swiss Ephemeris initialization failed')
}

// Calculate Lahiri ayanamsha
function calculateLahiriAyanamsha(jd: number): number {
  const year = 2000 + (jd - 2451545.0) / 365.25
  const base = 23.85 // Lahiri at J2000 (approx)
  const drift = (year - 2000) * 0.0139 // degrees per year
  return base + drift
}

// Convert tropical to sidereal longitude
function tropicalToSidereal(tropicalLongitude: number, jd: number): number {
  const ayanamsha = calculateLahiriAyanamsha(jd)
  let siderealLongitude = tropicalLongitude - ayanamsha
  if (siderealLongitude < 0) siderealLongitude += 360
  return siderealLongitude
}

// Calculate Greenwich Sidereal Time
function calculateGST(jd: number): number {
  const T = (jd - 2451545.0) / 36525
  const theta = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000
  return ((theta % 360) + 360) % 360
}

// Calculate ascendant (Lagna) using proper formula
function calculateAscendant(jd: number, latitude: number, longitude: number): number {
  try {
    // Obliquity of ecliptic (radians)
    const ε = (23.4393 * Math.PI) / 180
    
    // Local Sidereal Time (degrees)
    const lst = ((calculateGST(jd) + longitude) % 360 + 360) % 360
    const lstRad = (lst * Math.PI) / 180
    
    const latRad = (latitude * Math.PI) / 180
    
    // Calculate ascendant using the correct formula
    const asc = Math.atan2(
      -Math.cos(lstRad),
      Math.sin(lstRad) * Math.cos(ε) - Math.tan(latRad) * Math.sin(ε)
    ) * (180 / Math.PI)
    
    return ((asc % 360) + 360) % 360
  } catch (error) {
    devLog.error('Error calculating ascendant:', error, 'astrologyUnified')
    return 15.5
  }
}

// Get sign from longitude
function getSignFromLongitude(longitude: number): string {
  const signIndex = Math.floor(longitude / 30)
  return VEDIC_SIGNS[signIndex % 12]
}

// Get degree in sign
function getDegreeInSign(longitude: number): number {
  return longitude % 30
}

// Get nakshatra from longitude
function getNakshatraFromLongitude(longitude: number): { name: string; pada: number } {
  const nakshatraIndex = Math.floor(longitude / 13.333333) // 360/27 = 13.333333
  const nakshatra = NAKSHATRAS[nakshatraIndex % 27]
  const pada = Math.floor((longitude % 13.333333) / 3.333333) + 1
  return { name: nakshatra.name, pada: Math.min(pada, 4) }
}

// Calculate house cusps
function calculateHouseCusps(ascendantLongitude: number): HouseCusp[] {
  const houses: HouseCusp[] = []
  
  for (let i = 0; i < 12; i++) {
    const houseLongitude = (ascendantLongitude + (i * 30)) % 360
    const sign = getSignFromLongitude(houseLongitude)
    const degree = getDegreeInSign(houseLongitude)
    
    houses.push({
      number: i + 1,
      longitude: houseLongitude,
      latitude: 0,
      sign,
      degree: Math.floor(degree),
      minute: Math.floor((degree % 1) * 60),
      second: Math.floor(((degree % 1) * 60 % 1) * 60)
    })
  }
  
  return houses
}

// Calculate planetary positions using Astronomia
function calculatePlanetaryPositions(birthData: BirthData, jd: number, houses: HouseCusp[]): PlanetPosition[] {
  const planets: PlanetPosition[] = []
  const ayanamsha = calculateLahiriAyanamsha(jd)
  
  Object.entries(PLANETS).forEach(([name, planetData]) => {
    try {
      const planet = new planetposition.Planet(planetData)
      const pos = planet.position2000(jd)
      const tropicalLongitude = pos.lon * (180 / Math.PI)
      const siderealLongitude = tropicalToSidereal(tropicalLongitude, jd)
      
      const sign = getSignFromLongitude(siderealLongitude)
      const degree = getDegreeInSign(siderealLongitude)
      const nakshatra = getNakshatraFromLongitude(siderealLongitude)
      
      // Find house
      const house = houses.find(h => {
        const nextHouse = houses[(h.number % 12)]
        const houseStart = h.longitude
        const houseEnd = nextHouse ? nextHouse.longitude : h.longitude + 30
        return siderealLongitude >= houseStart && siderealLongitude < houseEnd
      })
      
      planets.push({
        name,
        longitude: siderealLongitude,
        latitude: pos.lat * (180 / Math.PI),
        distance: (pos as { lon: number; lat: number; range?: number }).range ?? 0,
        speed: 0, // Would need additional calculation
        sign,
        degree: Math.floor(degree),
        minute: Math.floor((degree % 1) * 60),
        second: Math.floor(((degree % 1) * 60 % 1) * 60),
        house: house?.number || 1,
        nakshatra: nakshatra.name,
        pada: nakshatra.pada,
        isRetrograde: false // Would need additional calculation
      })
    } catch (error) {
      devLog.error(`Error calculating ${name}:`, error, 'astrologyUnified')
    }
  })
  
  return planets
}

// Calculate Rahu and Ketu using Swiss Ephemeris
async function calculateLunarNodes(birthData: BirthData, jd: number, houses: HouseCusp[]): Promise<PlanetPosition[]> {
  try {
    const swe = await getSwissEphemeris()
    
    // Parse birth date and time
    const [year, month, day] = birthData.birthDate.split('-').map(Number)
    const [hour, minute] = birthData.birthTime.split(':').map(Number)
    const utHours = hour + minute / 60
    
    // Calculate Julian Day for Swiss Ephemeris
    const sweJd = swe.julday(year, month, day, utHours)
    
    // Calculate TRUE_NODE (Rahu) using Swiss Ephemeris
    const nodeResult = swe.calc_ut(sweJd, swe.TRUE_NODE)
    const rahuTropical = ((nodeResult && nodeResult[0]) || 0) % 360
    
    // Convert to sidereal by subtracting Lahiri ayanamsha
    const ayanamsha = calculateLahiriAyanamsha(jd)
    const rahuSidereal = ((rahuTropical - ayanamsha) % 360 + 360) % 360
    const ketuSidereal = (rahuSidereal + 180) % 360
    
    const rahuSign = getSignFromLongitude(rahuSidereal)
    const ketuSign = getSignFromLongitude(ketuSidereal)
    
    const rahuDegree = getDegreeInSign(rahuSidereal)
    const ketuDegree = getDegreeInSign(ketuSidereal)
    
    const rahuNakshatra = getNakshatraFromLongitude(rahuSidereal)
    const ketuNakshatra = getNakshatraFromLongitude(ketuSidereal)
    
    // Find houses for Rahu and Ketu
    const rahuHouse = houses.find(h => {
      const nextHouse = houses[(h.number % 12)]
      const houseStart = h.longitude
      const houseEnd = nextHouse ? nextHouse.longitude : h.longitude + 30
      return rahuSidereal >= houseStart && rahuSidereal < houseEnd
    })
    
    const ketuHouse = houses.find(h => {
      const nextHouse = houses[(h.number % 12)]
      const houseStart = h.longitude
      const houseEnd = nextHouse ? nextHouse.longitude : h.longitude + 30
      return ketuSidereal >= houseStart && ketuSidereal < houseEnd
    })
    
    return [
      {
        name: 'Rahu',
        longitude: rahuSidereal,
        latitude: 0,
        distance: 0,
        speed: 0,
        sign: rahuSign,
        degree: Math.floor(rahuDegree),
        minute: Math.floor((rahuDegree % 1) * 60),
        second: Math.floor(((rahuDegree % 1) * 60 % 1) * 60),
        house: rahuHouse?.number || 1,
        nakshatra: rahuNakshatra.name,
        pada: rahuNakshatra.pada,
        isRetrograde: true
      },
      {
        name: 'Ketu',
        longitude: ketuSidereal,
        latitude: 0,
        distance: 0,
        speed: 0,
        sign: ketuSign,
        degree: Math.floor(ketuDegree),
        minute: Math.floor((ketuDegree % 1) * 60),
        second: Math.floor(((ketuDegree % 1) * 60 % 1) * 60),
        house: ketuHouse?.number || 1,
        nakshatra: ketuNakshatra.name,
        pada: ketuNakshatra.pada,
        isRetrograde: true
      }
    ]
  } catch (error) {
    devLog.error('Error calculating Rahu/Ketu with Swiss Ephemeris:', error, 'astrologyUnified')
    
    // Fallback to simplified calculation
    try {
      const moon = new planetposition.Planet(data.moon)
      const sun = new planetposition.Planet(data.sun)
      const moonPos = moon.position2000(jd)
      const sunPos = sun.position2000(jd)
      
      const moonTropicalLongitude = moonPos.lon * (180 / Math.PI)
      const sunTropicalLongitude = sunPos.lon * (180 / Math.PI)
      
      const moonSiderealLongitude = tropicalToSidereal(moonTropicalLongitude, jd)
      const sunSiderealLongitude = tropicalToSidereal(sunTropicalLongitude, jd)
      
      const rahuLongitude = (moonSiderealLongitude - sunSiderealLongitude + 360) % 360
      const ketuLongitude = (rahuLongitude + 180) % 360
      
      const rahuSign = getSignFromLongitude(rahuLongitude)
      const ketuSign = getSignFromLongitude(ketuLongitude)
      
      const rahuDegree = getDegreeInSign(rahuLongitude)
      const ketuDegree = getDegreeInSign(ketuLongitude)
      
      const rahuNakshatra = getNakshatraFromLongitude(rahuLongitude)
      const ketuNakshatra = getNakshatraFromLongitude(ketuLongitude)
      
      const rahuHouse = houses.find(h => {
        const nextHouse = houses[(h.number % 12)]
        const houseStart = h.longitude
        const houseEnd = nextHouse ? nextHouse.longitude : h.longitude + 30
        return rahuLongitude >= houseStart && rahuLongitude < houseEnd
      })
      
      const ketuHouse = houses.find(h => {
        const nextHouse = houses[(h.number % 12)]
        const houseStart = h.longitude
        const houseEnd = nextHouse ? nextHouse.longitude : h.longitude + 30
        return ketuLongitude >= houseStart && ketuLongitude < houseEnd
      })
      
      return [
        {
          name: 'Rahu',
          longitude: rahuLongitude,
          latitude: 0,
          distance: 0,
          speed: 0,
          sign: rahuSign,
          degree: Math.floor(rahuDegree),
          minute: Math.floor((rahuDegree % 1) * 60),
          second: Math.floor(((rahuDegree % 1) * 60 % 1) * 60),
          house: rahuHouse?.number || 1,
          nakshatra: rahuNakshatra.name,
          pada: rahuNakshatra.pada,
          isRetrograde: true
        },
        {
          name: 'Ketu',
          longitude: ketuLongitude,
          latitude: 0,
          distance: 0,
          speed: 0,
          sign: ketuSign,
          degree: Math.floor(ketuDegree),
          minute: Math.floor((ketuDegree % 1) * 60),
          second: Math.floor(((ketuDegree % 1) * 60 % 1) * 60),
          house: ketuHouse?.number || 1,
          nakshatra: ketuNakshatra.name,
          pada: ketuNakshatra.pada,
          isRetrograde: true
        }
      ]
    } catch (fallbackError) {
      devLog.error('Fallback Rahu/Ketu calculation also failed:', fallbackError, 'astrologyUnified')
      return []
    }
  }
}

// Main function to generate Vedic chart
export async function generateVedicChart(birthData: BirthData, chartType: string = 'D1'): Promise<VedicChart> {
  try {
    // Parse birth date and time
    const [year, month, day] = birthData.birthDate.split('-').map(Number)
    const [hour, minute] = birthData.birthTime.split(':').map(Number)
    
    // Calculate Julian Day
    const jd = julian.CalendarGregorianToJD(year, month, day) + (hour + minute / 60) / 24
    
    // Calculate ascendant
    const ascendantTropical = calculateAscendant(jd, birthData.latitude, birthData.longitude)
    const ayanamsha = calculateLahiriAyanamsha(jd)
    const ascendantSidereal = ((ascendantTropical - ayanamsha) % 360 + 360) % 360
    
    const ascendantSign = getSignFromLongitude(ascendantSidereal)
    const ascendantDegree = getDegreeInSign(ascendantSidereal)
    
    // Calculate house cusps
    const houses = calculateHouseCusps(ascendantSidereal)
    
    // Calculate planetary positions
    const planets = calculatePlanetaryPositions(birthData, jd, houses)
    
    // Calculate Rahu and Ketu using Swiss Ephemeris
    const lunarNodes = await calculateLunarNodes(birthData, jd, houses)
    
    // Combine all planets
    const allPlanets = [...planets, ...lunarNodes]
    
    return {
      planets: allPlanets,
      houses,
      ascendant: {
        longitude: ascendantSidereal,
        sign: ascendantSign,
        degree: Math.floor(ascendantDegree),
        minute: Math.floor((ascendantDegree % 1) * 60)
      },
      chartType,
      ayanamsha
    }
  } catch (error) {
    devLog.error('Error generating Vedic chart:', error, 'astrologyUnified')
    throw error
  }
}

// Generate placements for React components
export async function generatePlacements(
  birthDate: string,
  birthTime: string,
  lat: number,
  lon: number
): Promise<{ house: number; planets: string[] }[]> {
  const birthData: BirthData = {
    birthDate,
    birthTime,
    birthPlace: 'Unknown',
    latitude: lat,
    longitude: lon
  }
  
  const chart = await generateVedicChart(birthData)
  
  // Convert to placements format
  const placements: { house: number; planets: string[] }[] = Array.from(
    { length: 12 },
    (_, i) => ({ house: i + 1, planets: [] })
  )
  
  // Add ascendant
  placements[0].planets.push('Asc')
  
  // Add planets to their houses
  chart.planets.forEach(planet => {
    if (planet.house >= 1 && planet.house <= 12) {
      placements[planet.house - 1].planets.push(planet.name)
    }
  })
  
  return placements
}

// Export for compatibility
export { getSwissEphemeris, calculateLahiriAyanamsha, tropicalToSidereal }
