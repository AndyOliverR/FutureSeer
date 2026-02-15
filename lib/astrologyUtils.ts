// Astrology Utilities for Chart Component Integration
// Converts Astronomia calculations to placements[] format for React components

import { generateVedicChart, generateDivisionalChart, BirthData, VedicChart } from './vedicAstrology'
import { devLog } from '@/lib/devLogger';
import { generateVedicChart as generateVedicChartUnified } from './astrologyUnified'

export interface PlanetPlacement {
  house: number
  planets: string[]
  signs: string[]
}

// Convert Vedic chart to placements format for React components (using unified Swiss Ephemeris)
export async function generatePlacements(
  birthDate: string,
  birthTime: string,
  lat: number,
  lon: number,
  chartType: string = 'D1'
): Promise<PlanetPlacement[]> {
  try {
    const birthData: BirthData = {
      birthDate,
      birthTime,
      birthPlace: `${lat}, ${lon}`, // Placeholder
      latitude: lat,
      longitude: lon,
      timezone: 'Asia/Kolkata'
    }

    let chart: VedicChart

    // Try unified Swiss Ephemeris first for D1 charts
    if (chartType === 'D1') {
      try {
        chart = await generateVedicChartUnified(birthData, chartType) as unknown as import('@/lib/vedicAstrology').VedicChart
      } catch (error) {
        devLog.warn('Unified Swiss Ephemeris failed, falling back to Astronomia:', error, 'astrologyUtils')
        chart = generateVedicChart(birthData, chartType)
      }
    } else {
      // Use Astronomia for divisional charts
      chart = generateDivisionalChart(birthData, chartType)
    }

    // Initialize all 12 houses
    const placements: PlanetPlacement[] = Array.from(
      { length: 12 },
      (_, i) => ({ house: i + 1, planets: [], signs: [] })
    )

    // Add Ascendant marker to 1st house
    placements[0].planets.push('Asc')

    // Add planets to their respective houses
    chart.planets.forEach(planet => {
      const houseIndex = planet.house - 1
      if (houseIndex >= 0 && houseIndex < 12) {
        placements[houseIndex].planets.push(planet.name)
      }
    })

    // Add signs to houses
    chart.houses.forEach(house => {
      const houseIndex = house.number - 1
      if (houseIndex >= 0 && houseIndex < 12) {
        placements[houseIndex].signs.push(house.sign)
      }
    })

    return placements
  } catch (error) {
    devLog.error('Error generating placements:', error, 'astrologyUtils')
    // Return empty placements as fallback
    return Array.from(
      { length: 12 },
      (_, i) => ({ house: i + 1, planets: [], signs: [] })
    )
  }
}

// Generate multiple chart types
export async function generateMultiplePlacements(
  birthDate: string,
  birthTime: string,
  lat: number,
  lon: number
): Promise<{ [key: string]: PlanetPlacement[] }> {
  const chartTypes = ['D1', 'D9', 'D10', 'D12', 'D16']
  const results: { [key: string]: PlanetPlacement[] } = {}

  for (const chartType of chartTypes) {
    try {
      results[chartType] = await generatePlacements(birthDate, birthTime, lat, lon, chartType)
    } catch (error) {
      devLog.error(`Error generating ${chartType} placements:`, error, 'astrologyUtils')
      results[chartType] = Array.from(
        { length: 12 },
        (_, i) => ({ house: i + 1, planets: [], signs: [] })
      )
    }
  }

  return results
}

// Get chart summary for display
export function getChartSummary(
  birthDate: string,
  birthTime: string,
  lat: number,
  lon: number,
  chartType: string = 'D1'
): {
  ascendant: string
  sunSign: string
  moonSign: string
  risingSign: string
  planetsCount: number
  housesCount: number
} {
  try {
    const birthData: BirthData = {
      birthDate,
      birthTime,
      birthPlace: `${lat}, ${lon}`,
      latitude: lat,
      longitude: lon,
      timezone: 'Asia/Kolkata'
    }

    const chart = chartType === 'D1' 
      ? generateVedicChart(birthData, chartType)
      : generateDivisionalChart(birthData, chartType)

    const sun = chart.planets.find(p => p.name === 'Sun')
    const moon = chart.planets.find(p => p.name === 'Moon')
    const ascendant = chart.houses.find(h => h.number === 1)

    return {
      ascendant: ascendant?.sign || 'Unknown',
      sunSign: sun?.sign || 'Unknown',
      moonSign: moon?.sign || 'Unknown',
      risingSign: ascendant?.sign || 'Unknown',
      planetsCount: chart.planets.length,
      housesCount: chart.houses.length
    }
  } catch (error) {
    devLog.error('Error getting chart summary:', error, 'astrologyUtils')
    return {
      ascendant: 'Unknown',
      sunSign: 'Unknown',
      moonSign: 'Unknown',
      risingSign: 'Unknown',
      planetsCount: 0,
      housesCount: 0
    }
  }
}
