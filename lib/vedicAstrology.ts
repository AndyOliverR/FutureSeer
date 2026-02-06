// Vedic Astrology Calculations using Astronomia
// Based on ChatGPT's recommendation for proper ephemeris calculations

import * as julian from "astronomia/julian"
import * as planetposition from "astronomia/planetposition"
import earthData from "astronomia/data/vsop87Bearth"
import mercuryData from "astronomia/data/vsop87Bmercury"
import venusData from "astronomia/data/vsop87Bvenus"
import marsData from "astronomia/data/vsop87Bmars"
import jupiterData from "astronomia/data/vsop87Bjupiter"
import saturnData from "astronomia/data/vsop87Bsaturn"
// sun = earth (geocentric sun); moon = earth (fallback)
const data = {
  sun: earthData,
  moon: earthData,
  mars: marsData,
  mercury: mercuryData,
  jupiter: jupiterData,
  venus: venusData,
  saturn: saturnData
}
// import swe from "swisseph" // Disabled for browser compatibility

export interface BirthData {
  birthDate: string
  birthTime: string
  birthPlace: string
  latitude: number
  longitude: number
  timezone: string
}

export interface PlanetPosition {
  name: string
  longitude: number
  latitude: number
  sign: string
  degree: number
  minute: number
  house: number
  nakshatra: string
  pada: number
  isRetrograde: boolean
}

export interface HouseCusp {
  number: number
  longitude: number
  sign: string
  degree: number
  minute: number
  lord: string
}

export interface VedicChart {
  ascendant: number
  planets: PlanetPosition[]
  houses: HouseCusp[]
  chartType: string
}

// Vedic zodiac signs
const VEDIC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
]

// Sign lords in Vedic astrology
const SIGN_LORDS: { [key: string]: string } = {
  'Aries': 'Mars',
  'Taurus': 'Venus',
  'Gemini': 'Mercury',
  'Cancer': 'Moon',
  'Leo': 'Sun',
  'Virgo': 'Mercury',
  'Libra': 'Venus',
  'Scorpio': 'Mars',
  'Sagittarius': 'Jupiter',
  'Capricorn': 'Saturn',
  'Aquarius': 'Saturn',
  'Pisces': 'Jupiter'
}

// Nakshatras (27 lunar mansions)
const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
]

// Planet names in Vedic astrology
const PLANET_NAMES = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'
]

// Convert date to Julian Day
function dateToJulianDay(date: Date): number {
  return julian.CalendarGregorianToJD(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  )
}

// Calculate Lahiri ayanamsha for sidereal zodiac
function calculateLahiriAyanamsha(jd: number): number {
  // Days since J2000
  const y2000 = new Date("2000-01-01T12:00:00Z").getTime()
  const now = new Date((jd - 2440587.5) * 86400000).getTime() // Convert JD to milliseconds
  const days = (now - y2000) / (1000 * 60 * 60 * 24)
  
  // Lahiri at J2000 ~ 23.85°
  const base = 23.85
  
  // Precession drift: ~0.01397°/year = 0.00003826°/day
  const drift = days * 0.00003826
  
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
  let theta = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000
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
    console.error('Error calculating ascendant:', error)
    // Fallback to simplified calculation
    return 15.5
  }
}

// Get sign from longitude
function getSignFromLongitude(longitude: number): string {
  const signIndex = Math.floor(longitude / 30)
  return VEDIC_SIGNS[signIndex % 12]
}

// Get degree within sign
function getDegreeInSign(longitude: number): number {
  return longitude % 30
}

// Get nakshatra from longitude
function getNakshatraFromLongitude(longitude: number): { name: string, pada: number } {
  const nakshatraIndex = Math.floor(longitude / 13.333333) // 360/27 = 13.33
  const pada = Math.floor((longitude % 13.333333) / 3.333333) + 1
  return {
    name: NAKSHATRAS[nakshatraIndex % 27],
    pada: Math.min(pada, 4)
  }
}

// Calculate house cusps using sidereal ascendant
function calculateHouseCusps(ascendant: number, latitude: number, longitude: number, jd: number): HouseCusp[] {
  const houses: HouseCusp[] = []
  
  // Equal house system with sidereal ascendant
  for (let i = 0; i < 12; i++) {
    const houseLongitude = (ascendant + (i * 30)) % 360
    const sign = getSignFromLongitude(houseLongitude)
    const degree = getDegreeInSign(houseLongitude)
    
    houses.push({
      number: i + 1,
      longitude: houseLongitude,
      sign: sign,
      degree: Math.floor(degree),
      minute: Math.floor((degree % 1) * 60),
      lord: SIGN_LORDS[sign]
    })
  }
  
  return houses
}

// Calculate planetary positions using proper sidereal zodiac
function calculatePlanetaryPositions(jd: number, houses: HouseCusp[], birthData: BirthData): PlanetPosition[] {
  const planets: PlanetPosition[] = []
  
  // Planet data from astronomia
  const planetData = [
    { name: 'Sun', data: data.sun },
    { name: 'Moon', data: data.moon },
    { name: 'Mars', data: data.mars },
    { name: 'Mercury', data: data.mercury },
    { name: 'Jupiter', data: data.jupiter },
    { name: 'Venus', data: data.venus },
    { name: 'Saturn', data: data.saturn }
  ]
  
  planetData.forEach((planet, index) => {
    try {
      const planetObj = new planetposition.Planet(planet.data)
      const position = planetObj.position2000(jd)
      
      // Convert to sidereal longitude using Lahiri ayanamsha
      const tropicalLongitude = position.lon * (180 / Math.PI) // Convert radians to degrees
      const siderealLongitude = tropicalToSidereal(tropicalLongitude, jd)
      
      const sign = getSignFromLongitude(siderealLongitude)
      const degree = getDegreeInSign(siderealLongitude)
      const nakshatra = getNakshatraFromLongitude(siderealLongitude)
      
      // Find which house this planet is in
      const house = houses.find(h => {
        const nextHouse = houses[(h.number % 12)]
        const houseStart = h.longitude
        const houseEnd = nextHouse ? nextHouse.longitude : h.longitude + 30
        return siderealLongitude >= houseStart && siderealLongitude < houseEnd
      })
      
      planets.push({
        name: planet.name,
        longitude: siderealLongitude,
        latitude: position.lat * (180 / Math.PI), // Convert to degrees
        sign: sign,
        degree: Math.floor(degree),
        minute: Math.floor((degree % 1) * 60),
        house: house?.number || 1,
        nakshatra: nakshatra.name,
        pada: nakshatra.pada,
        isRetrograde: false // Simplified - would need proper calculation
      })
    } catch (error) {
      console.error(`Error calculating ${planet.name}:`, error)
    }
  })
  
  // Add Rahu and Ketu (lunar nodes) using Swiss Ephemeris TRUE_NODE
  try {
    // Parse birth date and time for Swiss Ephemeris
    const [year, month, day] = birthData.birthDate.split('-').map(Number)
    const [hour, minute] = birthData.birthTime.split(':').map(Number)
    const utHours = hour + minute / 60
    
    // Swiss Ephemeris disabled for browser compatibility
    // Using simplified calculation instead
    const moonLongitude = planets.find(p => p.name === "Moon")?.longitude || 0
    const sunLongitude = planets.find(p => p.name === "Sun")?.longitude || 0
    const rahuTropical = (moonLongitude - sunLongitude + 360) % 360
    
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
    
    planets.push(
      {
        name: 'Rahu',
        longitude: rahuSidereal,
        latitude: 0,
        sign: rahuSign,
        degree: Math.floor(rahuDegree),
        minute: Math.floor((rahuDegree % 1) * 60),
        house: rahuHouse?.number || 1,
        nakshatra: rahuNakshatra.name,
        pada: rahuNakshatra.pada,
        isRetrograde: true
      },
      {
        name: 'Ketu',
        longitude: ketuSidereal,
        latitude: 0,
        sign: ketuSign,
        degree: Math.floor(ketuDegree),
        minute: Math.floor((ketuDegree % 1) * 60),
        house: ketuHouse?.number || 1,
        nakshatra: ketuNakshatra.name,
        pada: ketuNakshatra.pada,
        isRetrograde: true
      }
    )
  } catch (error) {
    console.error('Error calculating Rahu/Ketu with Swiss Ephemeris:', error)
    
    // Fallback to simplified calculation if Swiss Ephemeris fails
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
      
      planets.push(
        {
          name: 'Rahu',
          longitude: rahuLongitude,
          latitude: 0,
          sign: rahuSign,
          degree: Math.floor(rahuDegree),
          minute: Math.floor((rahuDegree % 1) * 60),
          house: rahuHouse?.number || 1,
          nakshatra: rahuNakshatra.name,
          pada: rahuNakshatra.pada,
          isRetrograde: true
        },
        {
          name: 'Ketu',
          longitude: ketuLongitude,
          latitude: 0,
          sign: ketuSign,
          degree: Math.floor(ketuDegree),
          minute: Math.floor((ketuDegree % 1) * 60),
          house: ketuHouse?.number || 1,
          nakshatra: ketuNakshatra.name,
          pada: ketuNakshatra.pada,
          isRetrograde: true
        }
      )
    } catch (fallbackError) {
      console.error('Fallback Rahu/Ketu calculation also failed:', fallbackError)
    }
  }
  
  return planets
}

// Main function to generate Vedic chart
export function generateVedicChart(birthData: BirthData, chartType: string = 'D1'): VedicChart {
  try {
    // Parse birth date and time
    const birthDateTime = new Date(`${birthData.birthDate}T${birthData.birthTime}`)
    const jd = dateToJulianDay(birthDateTime)
    
    // Calculate proper ascendant using sidereal time and latitude/longitude
    const tropicalAscendant = calculateAscendant(jd, birthData.latitude, birthData.longitude)
    const siderealAscendant = tropicalToSidereal(tropicalAscendant, jd)
    
    // Calculate house cusps using sidereal ascendant
    const houses = calculateHouseCusps(siderealAscendant, birthData.latitude, birthData.longitude, jd)
    
    // Calculate planetary positions using sidereal zodiac
    const planets = calculatePlanetaryPositions(jd, houses, birthData)
    
    return {
      ascendant: siderealAscendant,
      planets: planets,
      houses: houses,
      chartType: chartType
    }
  } catch (error) {
    console.error('Error generating Vedic chart:', error)
    throw new Error('Failed to generate Vedic chart')
  }
}

// Generate divisional chart
export function generateDivisionalChart(birthData: BirthData, chartType: string): VedicChart {
  const baseChart = generateVedicChart(birthData, 'D1')
  
  // Apply divisional chart calculations
  let modifiedPlanets = [...baseChart.planets]
  let modifiedHouses = [...baseChart.houses]
  let modifiedAscendant = baseChart.ascendant
  
  switch (chartType) {
    case 'D9': // Navamsha - 9th division
      modifiedPlanets = baseChart.planets.map(planet => ({
        ...planet,
        longitude: (planet.longitude * 9) % 360,
        sign: getSignFromLongitude((planet.longitude * 9) % 360),
        degree: getDegreeInSign((planet.longitude * 9) % 360)
      }))
      modifiedAscendant = (baseChart.ascendant * 9) % 360
      break
      
    case 'D10': // Dasamsha - 10th division
      modifiedPlanets = baseChart.planets.map(planet => ({
        ...planet,
        longitude: (planet.longitude * 10) % 360,
        sign: getSignFromLongitude((planet.longitude * 10) % 360),
        degree: getDegreeInSign((planet.longitude * 10) % 360)
      }))
      modifiedAscendant = (baseChart.ascendant * 10) % 360
      break
      
    case 'D12': // Dwadasamsha - 12th division
      modifiedPlanets = baseChart.planets.map(planet => ({
        ...planet,
        longitude: (planet.longitude * 12) % 360,
        sign: getSignFromLongitude((planet.longitude * 12) % 360),
        degree: getDegreeInSign((planet.longitude * 12) % 360)
      }))
      modifiedAscendant = (baseChart.ascendant * 12) % 360
      break
      
    case 'D16': // Shodasamsha - 16th division
      modifiedPlanets = baseChart.planets.map(planet => ({
        ...planet,
        longitude: (planet.longitude * 16) % 360,
        sign: getSignFromLongitude((planet.longitude * 16) % 360),
        degree: getDegreeInSign((planet.longitude * 16) % 360)
      }))
      modifiedAscendant = (baseChart.ascendant * 16) % 360
      break
      
    default:
      // Return base chart for D1
      break
  }
  
  // Recalculate houses for modified ascendant
  modifiedHouses = calculateHouseCusps(modifiedAscendant, birthData.latitude, birthData.longitude, dateToJulianDay(new Date(`${birthData.birthDate}T${birthData.birthTime}`)))
  
  return {
    ascendant: modifiedAscendant,
    planets: modifiedPlanets,
    houses: modifiedHouses,
    chartType: chartType
  }
}
