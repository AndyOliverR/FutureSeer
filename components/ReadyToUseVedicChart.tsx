// Ready-to-use Vedic Chart Component
// Integrates with Astronomia-based Vedic astrology calculations
// Shows both North Indian (diamond) and South Indian (square) layouts

import React, { useState, useEffect } from 'react'
import { devLog } from '@/lib/devLogger';
import { getChart } from '@/lib/astronomia-vedic'
import SouthIndianVedicChart from './SouthIndianVedicChart'

type PlanetPlacement = {
  house: number
  planets: string[]
  signs: string[]
}

type PlanetData = {
  name: string
  sign: number
  degreeInSign: number
  isRetrograde?: boolean
}

type ChartProps = {
  name: string
  birthDate: string
  birthTime: string
  birthPlace: string
  latitude: number
  longitude: number
  chartType?: string
  showBothStyles?: boolean
  chartStyle?: 'north' | 'south' | 'both'
}

// Planet symbols for display
const PLANET_SYMBOLS: { [key: string]: string } = {
  'Sun': '☉',
  'Moon': '☽',
  'Mars': '♂',
  'Mercury': '☿',
  'Jupiter': '♃',
  'Venus': '♀',
  'Saturn': '♄',
  'Rahu': '☊',
  'Ketu': '☋'
}

// Zodiac sign symbols
const SIGN_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓']

// ---------- NORTH INDIAN CHART (Diamond Layout) ----------
const NorthIndianChart: React.FC<{ placements: PlanetPlacement[], chartType: string }> = ({
  placements,
  chartType
}) => {
  // Diamond-style house coordinates
  const houseCoords = [
    { x: 200, y: 40 },   // 1 - Top
    { x: 310, y: 90 },   // 2 - Top-right
    { x: 360, y: 200 },  // 3 - Right
    { x: 310, y: 310 },  // 4 - Bottom-right
    { x: 200, y: 360 },  // 5 - Bottom
    { x: 90, y: 310 },   // 6 - Bottom-left
    { x: 40, y: 200 },   // 7 - Left
    { x: 90, y: 90 },    // 8 - Top-left
    { x: 200, y: 120 },  // 9 - Inner top
    { x: 280, y: 200 },  // 10 - Inner right
    { x: 200, y: 280 },  // 11 - Inner bottom
    { x: 120, y: 200 },  // 12 - Inner left
  ]

  return (
    <svg viewBox="0 0 400 400" className="border border-slate-600 w-80 h-80">
      {/* Background */}
      <rect width="400" height="400" fill="#1a1a2e" />
      
      {/* Diamond grid lines */}
      <line x1="200" y1="0" x2="200" y2="400" stroke="#ffd700" strokeWidth="2" />
      <line x1="0" y1="200" x2="400" y2="200" stroke="#ffd700" strokeWidth="2" />
      <line x1="0" y1="0" x2="400" y2="400" stroke="#ffd700" strokeWidth="2" />
      <line x1="0" y1="400" x2="400" y2="0" stroke="#ffd700" strokeWidth="2" />
      
      {/* House numbers and content */}
      {placements.map((placement, i) => {
        const coord = houseCoords[placement.house - 1]
        if (!coord) return null
        
        return (
          <g key={i}>
            {/* House number */}
            <text
              x={coord.x}
              y={coord.y - 15}
              textAnchor="middle"
              fill="#ffd700"
              fontSize="12"
              fontWeight="bold"
            >
              {placement.house}
            </text>
            
            {/* Sign symbol */}
            {placement.signs[0] && (
              <text
                x={coord.x}
                y={coord.y}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="16"
              >
                {SIGN_SYMBOLS[parseInt(placement.signs[0]) - 1] || '●'}
              </text>
            )}
            
            {/* Planets in house */}
            {placement.planets.map((planet, planetIndex) => (
              <text
                key={planetIndex}
                x={coord.x}
                y={coord.y + 15 + (planetIndex * 12)}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="10"
              >
                <title>{`${planet} in House ${placement.house}`}</title>
                {PLANET_SYMBOLS[planet] || planet}
              </text>
            ))}
          </g>
        )
      })}
      
      {/* Chart type label */}
      <text
        x="200"
        y="200"
        textAnchor="middle"
        fill="#ffd700"
        fontSize="14"
        fontWeight="bold"
      >
        {chartType}
      </text>
    </svg>
  )
}

// ---------- SOUTH INDIAN CHART (Square Layout) ----------
const SouthIndianChart: React.FC<{ placements: PlanetPlacement[], chartType: string }> = ({
  placements,
  chartType
}) => {
  // Traditional South Indian house coordinates - 4x4 grid layout
  const houseCoords = [
    { x: 75, y: 50 },    // 1 - Pisces (top-left)
    { x: 225, y: 50 },   // 2 - Aries (top-middle)
    { x: 375, y: 50 },   // 3 - Taurus (top-right)
    { x: 525, y: 50 },   // 4 - Gemini (top-far-right)
    { x: 525, y: 150 },  // 5 - Cancer (right-top)
    { x: 525, y: 250 },  // 6 - Leo (right-bottom)
    { x: 525, y: 350 },  // 7 - Virgo (bottom-far-right)
    { x: 375, y: 350 },  // 8 - Libra (bottom-right)
    { x: 225, y: 350 },  // 9 - Scorpio (bottom-middle)
    { x: 75, y: 350 },   // 10 - Sagittarius (bottom-left)
    { x: 75, y: 250 },   // 11 - Capricorn (left-bottom)
    { x: 75, y: 150 },   // 12 - Aquarius (left-top)
  ]

  return (
    <svg viewBox="0 0 600 400" className="border border-slate-600 w-full max-w-4xl rounded-2xl shadow-2xl">
      {/* Background */}
      <rect width="600" height="400" fill="#1a1a2e" />
      
      {/* Square grid lines - proper South Indian layout with empty center */}
      <rect x="0" y="0" width="600" height="400" fill="none" stroke="#ffd700" strokeWidth="2" />
      {/* Vertical lines - full height for side box borders */}
      <line x1="150" y1="0" x2="150" y2="400" stroke="#ffd700" strokeWidth="1" />
      <line x1="450" y1="0" x2="450" y2="400" stroke="#ffd700" strokeWidth="1" />
      
      {/* Vertical lines - segmented to skip center area */}
      <line x1="300" y1="0" x2="300" y2="100" stroke="#ffd700" strokeWidth="1" />
      <line x1="300" y1="300" x2="300" y2="400" stroke="#ffd700" strokeWidth="1" />
      {/* Horizontal lines - skip center area */}
      <line x1="0" y1="100" x2="150" y2="100" stroke="#ffd700" strokeWidth="1" />
      <line x1="150" y1="100" x2="450" y2="100" stroke="#ffd700" strokeWidth="1" />
      <line x1="450" y1="100" x2="600" y2="100" stroke="#ffd700" strokeWidth="1" />
      <line x1="0" y1="200" x2="150" y2="200" stroke="#ffd700" strokeWidth="1" />
      <line x1="450" y1="200" x2="600" y2="200" stroke="#ffd700" strokeWidth="1" />
      <line x1="0" y1="300" x2="150" y2="300" stroke="#ffd700" strokeWidth="1" />
      <line x1="150" y1="300" x2="450" y2="300" stroke="#ffd700" strokeWidth="1" />
      <line x1="450" y1="300" x2="600" y2="300" stroke="#ffd700" strokeWidth="1" />
      
      {/* House numbers and content */}
      {placements.map((placement, i) => {
        const coord = houseCoords[placement.house - 1]
        if (!coord) return null
        
        return (
          <g key={i}>
            {/* House number */}
            <text
              x={coord.x}
              y={coord.y - 15}
              textAnchor="middle"
              fill="#ffd700"
              fontSize="12"
              fontWeight="bold"
            >
              {placement.house}
            </text>
            
            {/* Sign symbol */}
            {placement.signs[0] && (
              <text
                x={coord.x}
                y={coord.y}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="16"
              >
                {SIGN_SYMBOLS[parseInt(placement.signs[0]) - 1] || '●'}
              </text>
            )}
            
            {/* Planets in house */}
            {placement.planets.map((planet, planetIndex) => (
              <text
                key={planetIndex}
                x={coord.x}
                y={coord.y + 15 + (planetIndex * 12)}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="10"
              >
                <title>{`${planet} in House ${placement.house}`}</title>
                {PLANET_SYMBOLS[planet] || planet}
              </text>
            ))}
          </g>
        )
      })}
      
      {/* Chart type label */}
      <text
        x="200"
        y="200"
        textAnchor="middle"
        fill="#ffd700"
        fontSize="14"
        fontWeight="bold"
      >
        {chartType}
      </text>
    </svg>
  )
}

// ---------- MAIN WRAPPER COMPONENT ----------
const ReadyToUseVedicChart: React.FC<ChartProps> = ({
  name,
  birthDate,
  birthTime,
  birthPlace,
  latitude,
  longitude,
  chartType = 'D1',
  showBothStyles = true,
  chartStyle = 'both'
}) => {
  const [chart, setChart] = useState<any>(null)
  const [placements, setPlacements] = useState<PlanetPlacement[]>([])
  const [southIndianPlanets, setSouthIndianPlanets] = useState<PlanetData[]>([])
  const [ascendantSign, setAscendantSign] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const generateChart = async () => {
      try {
        setLoading(true)
        setError(null)

        // Generate chart using astronomia-vedic wrapper
        const birthDateTime = new Date(`${birthDate}T${birthTime}`);
        const chartResult = getChart({
          date: birthDateTime,
          latitude,
          longitude,
          name,
          place: birthPlace,
          birthDate: birthDateTime  // Add explicit birthDate
        }, {
          ayanamsha: "lahiri",
          nodeType: "mean"
        })

        setChart(chartResult)

        // Chart data loaded successfully

        // Convert chart data to placements format
        const newPlacements: PlanetPlacement[] = []
        
        // Initialize all 12 houses
        for (let i = 1; i <= 12; i++) {
          newPlacements.push({
            house: i,
            planets: [],
            signs: []
          })
        }

        // Get divisional chart data if not D1
        let planetsToUse = chartResult.planets
        if (chartType !== 'D1' && chartResult.divisionalCharts) {
          const divisionalKey = chartType.toLowerCase() as 'd9' | 'd10' | 'd12' | 'd30'
          if (chartResult.divisionalCharts[divisionalKey]) {
            planetsToUse = chartResult.divisionalCharts[divisionalKey]
          }
        }

        // Transform planets for South Indian chart (by SIGN, not house)
        const southIndianPlanetsData: PlanetData[] = []
        let ascendantSignIndex = 0

        // Extract ascendant sign
        if (chartResult.ascendant && typeof chartResult.ascendant.sign === 'number') {
          ascendantSignIndex = chartResult.ascendant.sign
          setAscendantSign(ascendantSignIndex)
        }

        // Transform planets data for South Indian chart
        Object.entries(planetsToUse).forEach(([planetName, planetData]: [string, any]) => {
          if (planetData && typeof planetData.sign === 'number') {
            const displayName = planetName.charAt(0).toUpperCase() + planetName.slice(1)
            southIndianPlanetsData.push({
              name: displayName,
              sign: planetData.sign,
              degreeInSign: planetData.degreeInSign || 0,
              isRetrograde: planetData.isRetrograde || false
            })
          }
        })
        setSouthIndianPlanets(southIndianPlanetsData)

        // Add planets to their respective houses (for North Indian chart)
        Object.entries(planetsToUse).forEach(([planetName, planetData]: [string, any]) => {
          if (planetData && typeof planetData.house === 'number') {
            const houseIndex = planetData.house - 1
            if (houseIndex >= 0 && houseIndex < 12) {
              // Capitalize planet name
              const displayName = planetName.charAt(0).toUpperCase() + planetName.slice(1)
              newPlacements[houseIndex].planets.push(displayName)
            }
          }
        })

        // Add signs to houses based on ascendant
        if (chartResult.houses && Array.isArray(chartResult.houses)) {
          chartResult.houses.forEach((house: any) => {
            if (house && typeof house.houseNumber === 'number' && house.signIndex !== undefined) {
              const houseIndex = house.houseNumber - 1
              if (houseIndex >= 0 && houseIndex < 12) {
                newPlacements[houseIndex].signs.push(String(house.signIndex + 1))
              }
            }
          })
        }

        setPlacements(newPlacements)
        setLoading(false)
      } catch (err) {
        devLog.error('Error generating chart:', err, 'ReadyToUseVedicChart')
        setError(err instanceof Error ? err.message : 'Failed to generate chart')
        setLoading(false)
      }
    }

    generateChart()
  }, [birthDate, birthTime, birthPlace, latitude, longitude, chartType, name])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Generating {chartType} chart...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-400 mb-4">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Chart display */}
      {(chartStyle as 'north' | 'south' | 'both') === 'both' || ((chartStyle as string) === 'both' && showBothStyles) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center">
            <NorthIndianChart placements={placements} chartType={chartType} />
          </div>
          <div className="text-center">
            <SouthIndianVedicChart 
              planets={southIndianPlanets}
              ascendantSign={ascendantSign}
              chartType={chartType}
            />
          </div>
        </div>
      ) : chartStyle === 'south' ? (
        <div className="text-center">
          <SouthIndianVedicChart 
            planets={southIndianPlanets}
            ascendantSign={ascendantSign}
            chartType={chartType}
          />
        </div>
      ) : (
        <div className="text-center">
          <NorthIndianChart placements={placements} chartType={chartType} />
        </div>
      )}
    </div>
  )
}

// ---------- DEMO COMPONENT WITH REAL DATA ----------
export default function VedicChartDemo() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-amber-400 text-center">Vedic Astrology Charts</h2>
      
      {/* Birth Chart (D1) */}
      <ReadyToUseVedicChart
        name="Birth Chart (D1)"
        birthDate="1983-02-24"
        birthTime="14:15"
        birthPlace="Mysore, Karnataka, India"
        latitude={19.076}
        longitude={72.8777}
        chartType="D1"
        showBothStyles={true}
      />

      {/* Divisional Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReadyToUseVedicChart
          name="Navamsha (D9)"
          birthDate="1983-02-24"
          birthTime="14:15"
          birthPlace="Mysore, Karnataka, India"
          latitude={19.076}
          longitude={72.8777}
          chartType="D9"
          showBothStyles={false}
        />
        
        <ReadyToUseVedicChart
          name="Dasamsha (D10)"
          birthDate="1983-02-24"
          birthTime="14:15"
          birthPlace="Mysore, Karnataka, India"
          latitude={19.076}
          longitude={72.8777}
          chartType="D10"
          showBothStyles={false}
        />
      </div>
    </div>
  )
}

// Export individual components for custom use
export { ReadyToUseVedicChart, NorthIndianChart, SouthIndianChart }
