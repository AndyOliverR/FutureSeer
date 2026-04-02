"use client"

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CosmicMetricCard } from '../western/CosmicMetricCard'
import NorthIndianVedicChart from '@/components/NorthIndianVedicChart'
import SouthIndianVedicChart from '@/components/SouthIndianVedicChart'
import {
  Sun,
  Moon,
  ArrowUp,
  Sparkles,
  Crown,
  Clock,
  Stars
} from 'lucide-react'
export interface VedicDashboardHeroProps {
  chartData: any
  userProfile: any
  chartStyle?: 'north-indian' | 'south-indian' | 'east-indian'
  vedicReading?: any
  /** Birth or current panchanga for Tithi display */
  panchanga?: { tithi?: { name?: string; number?: number; paksha?: string } } | null
}

// Helper to convert sign names to numbers (1-12)
function getSignNumber(signName: string | number): number {
  if (typeof signName === 'number') return signName
  
  const signMap: Record<string, number> = {
    'Aries': 1, 'Taurus': 2, 'Gemini': 3, 'Cancer': 4,
    'Leo': 5, 'Virgo': 6, 'Libra': 7, 'Scorpio': 8,
    'Sagittarius': 9, 'Capricorn': 10, 'Aquarius': 11, 'Pisces': 12
  }
  
  return signMap[signName] || 1  // Default to Aries if unknown
}

// Helper to get Lagna Lord
function getLagnaLord(ascendantSign: string): string {
  const rulers: Record<string, string> = {
    Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury',
    Cancer: 'Moon', Leo: 'Sun', Virgo: 'Mercury',
    Libra: 'Venus', Scorpio: 'Mars', Sagittarius: 'Jupiter',
    Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter'
  }
  return rulers[ascendantSign] || '—'
}

// Helper to format nakshatra display
function formatNakshatra(nakshatra: string, pada?: number): string {
  if (!nakshatra || nakshatra === 'Unknown') return '—'
  return pada ? `${nakshatra} (${pada})` : nakshatra
}

// Helper to get current Maha Dasha from chart (calculated) or vedicReading
function getCurrentDasha(chartData: any, vedicReading: any): { planet: string; endDate: string; hasData: boolean } {
  const fromChart = chartData?.currentDasha
  if (fromChart?.planet) {
    const endYear = fromChart.endDate ? new Date(fromChart.endDate).getFullYear().toString() : ''
    return {
      planet: fromChart.planet,
      endDate: endYear || '—',
      hasData: true
    }
  }
  const dasha = vedicReading?.dasha?.currentMahaDasha
  if (dasha?.planet) {
    return {
      planet: dasha.planet,
      endDate: dasha.endDate ? new Date(dasha.endDate).getFullYear().toString() : '—',
      hasData: true
    }
  }
  return { planet: '—', endDate: '—', hasData: false }
}

export function VedicDashboardHero({ 
  chartData, 
  userProfile, 
  chartStyle = 'north-indian',
  vedicReading,
  panchanga 
}: VedicDashboardHeroProps) {
  const planets = chartData?.planets || []
  
  // Extract ascendant sign and convert to number for chart components
  const ascendantSignName = chartData?.ascendant?.sign || chartData?.ascendant?.signName || chartData?.lagna?.sign || 'Aries'
  const ascendantSignNumber = getSignNumber(ascendantSignName)
  const ascendantDegree = chartData?.ascendant?.degree || chartData?.ascendant?.degreeInSign || chartData?.lagna?.degree || 0
  const ayanamsha = chartData?.ayanamsha ?? chartData?.metadata?.ayanamsha ?? 'Lahiri'
  
  // Transform planets to ensure they have numeric sign property for chart components
  const transformedPlanets = planets.map((p: any) => ({
    name: p.name,
    sign: getSignNumber(p.sign || p.signName || p.signNumber),
    degreeInSign: p.degreeInSign || p.degree || 0,
    isRetrograde: p.isRetrograde || p.retrograde || false
  }))
  
  // Get key Vedic data for display
  const sun = planets.find((p: any) => p.name?.toLowerCase() === 'sun' || p.name?.toLowerCase() === 'surya')
  const moon = planets.find((p: any) => p.name?.toLowerCase() === 'moon' || p.name?.toLowerCase() === 'chandra')
  
  const sunSign = sun?.signName || sun?.sign || '—'
  const sunNakshatra = sun?.nakshatra || '—'
  const moonSign = moon?.signName || moon?.sign || '—'
  const moonNakshatra = moon?.nakshatra || '—'
  const moonPada = moon?.pada
  
  const lagnaLord = getLagnaLord(ascendantSignName)
  const currentDasha = getCurrentDasha(chartData, vedicReading)
  
  // Tithi from panchanga (birth or current), then chart/vedicReading
  const tithiRaw = panchanga?.tithi?.name ?? chartData?.tithi ?? (vedicReading?.panchanga?.tithi as string) ?? ''
  const tithi = tithiRaw && tithiRaw !== 'Unknown' ? tithiRaw : (panchanga?.tithi?.number ? `Tithi ${panchanga.tithi.number}` : '—')
  
  return (
    <div className="space-y-6">
      {/* Chart Visualization */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="rounded-2xl overflow-hidden border-2 border-amber-200/80 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 mb-2">
                Your Vedic Birth Chart
              </h2>
              <p className="text-slate-600 text-sm">
                {userProfile?.birthPlace && `Born in ${userProfile.birthPlace}`}
                {userProfile?.birthDate && ` • ${new Date(userProfile.birthDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Sidereal Zodiac • {ayanamsha} Ayanamsha
              </p>
            </div>
            
            {planets.length > 0 && ascendantSignNumber > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Birth Chart (D1) */}
                <div className="flex flex-col items-center">
                  <p className="text-amber-700 text-sm font-semibold mb-3">Birth Chart (D1)</p>
                  {chartStyle === 'north-indian' ? (
                    <NorthIndianVedicChart
                      planets={transformedPlanets}
                      ascendantSign={ascendantSignNumber}
                      ascendantDegree={ascendantDegree}
                      chartType="D1"
                    />
                  ) : (
                    <SouthIndianVedicChart
                      planets={transformedPlanets}
                      ascendantSign={ascendantSignNumber}
                      ascendantDegree={ascendantDegree}
                      chartType="D1"
                    />
                  )}
                </div>
                
                {/* Navamsa Chart (D9) - if available */}
                {chartData?.navamsa && chartData.navamsa.planets && (
                  <div className="flex flex-col items-center">
                    <p className="text-purple-700 text-sm font-semibold mb-3">Navamsa Chart (D9)</p>
                    {(() => {
                      const navamsaAscSign = getSignNumber(chartData.navamsa.ascendant?.sign || chartData.navamsa.ascendant?.signName || ascendantSignName)
                      const navamsaPlanets = chartData.navamsa.planets.map((p: any) => ({
                        name: p.name,
                        sign: getSignNumber(p.sign || p.signName || p.signNumber),
                        degreeInSign: p.degreeInSign || p.degree || 0,
                        isRetrograde: p.isRetrograde || p.retrograde || false
                      }))
                      
                      return chartStyle === 'north-indian' ? (
                        <NorthIndianVedicChart
                          planets={navamsaPlanets}
                          ascendantSign={navamsaAscSign}
                          ascendantDegree={chartData.navamsa.ascendant?.degree || 0}
                          chartType="D9"
                        />
                      ) : (
                        <SouthIndianVedicChart
                          planets={navamsaPlanets}
                          ascendantSign={navamsaAscSign}
                          ascendantDegree={chartData.navamsa.ascendant?.degree || 0}
                          chartType="D9"
                        />
                      )
                    })()}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-600">
                <p>Loading chart visualization...</p>
                <p className="text-xs text-slate-500 mt-2">
                  {planets.length === 0 && 'Waiting for planetary data...'}
                  {planets.length > 0 && ascendantSignNumber === 0 && 'Calculating ascendant position...'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Cosmic Metrics Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Sun/Surya */}
          <CosmicMetricCard
            icon={<Sun className="w-8 h-8" />}
            label="Surya (Sun)"
            value={sunSign}
            subtitle={formatNakshatra(sunNakshatra)}
            colorScheme="amber"
            size="small"
          />

          {/* Moon/Chandra */}
          <CosmicMetricCard
            icon={<Moon className="w-8 h-8" />}
            label="Chandra (Moon)"
            value={moonSign}
            subtitle={formatNakshatra(moonNakshatra, moonPada)}
            colorScheme="blue"
            size="small"
          />

          {/* Rising/Lagna */}
          <CosmicMetricCard
            icon={<ArrowUp className="w-8 h-8" />}
            label="Lagna (Rising)"
            value={ascendantSignName}
            subtitle={`${ascendantDegree.toFixed(2)}°`}
            colorScheme="purple"
            size="small"
          />

          {/* Chart Lord/Lagna Lord */}
          <CosmicMetricCard
            icon={<Crown className="w-8 h-8" />}
            label="Lagna Lord"
            value={lagnaLord}
            subtitle="Chart Ruler"
            colorScheme="pink"
            size="small"
          />

          {/* Current Dasha - only when we have calculated dasha data */}
          {currentDasha.hasData && (
            <CosmicMetricCard
              icon={<Clock className="w-8 h-8" />}
              label="Maha Dasha"
              value={currentDasha.planet}
              subtitle={`Until ${currentDasha.endDate}`}
              colorScheme="orange"
              size="small"
            />
          )}

          {/* Ayanamsha */}
          <CosmicMetricCard
            icon={<Stars className="w-8 h-8" />}
            label="Ayanamsha"
            value={ayanamsha}
            subtitle="Calculation System"
            colorScheme="cyan"
            size="small"
          />
        </div>
      </motion.div>

      {/* Quick Insights Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="bg-gradient-to-r from-amber-100/80 to-orange-100/80 border-2 border-amber-200 shadow-lg rounded-3xl">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4 justify-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-semibold text-amber-900">Quick Insights:</span>
              </div>
              
              <Badge variant="secondary" className="bg-amber-200/50 text-amber-900">
                {planets.length} Grahas (Planets)
              </Badge>
              
              <Badge variant="secondary" className="bg-orange-200/50 text-orange-900">
                Moon: {formatNakshatra(moonNakshatra)}
              </Badge>
              
              <Badge variant="secondary" className="bg-yellow-200/50 text-yellow-900">
                Tithi: {tithi}
              </Badge>
              
              {currentDasha.hasData && (
                <Badge variant="secondary" className="bg-purple-200/50 text-purple-900">
                  {currentDasha.planet} Dasha
                </Badge>
              )}
              
              {vedicReading?.yogas && vedicReading.yogas.length > 0 && (
                <Badge variant="secondary" className="bg-pink-200/50 text-pink-900">
                  {vedicReading.yogas.length} Yogas
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
