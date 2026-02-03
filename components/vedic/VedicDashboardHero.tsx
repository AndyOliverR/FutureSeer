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
import { AffiliateLink } from '@/components/AffiliateLink'
import { getBirthChartUrl } from '@/lib/affiliateConfig'

export interface VedicDashboardHeroProps {
  chartData: any
  userProfile: any
  chartStyle?: 'north-indian' | 'south-indian' | 'east-indian'
  vedicReading?: any
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
  return rulers[ascendantSign] || 'Unknown'
}

// Helper to format nakshatra display
function formatNakshatra(nakshatra: string, pada?: number): string {
  if (!nakshatra) return 'Unknown'
  return pada ? `${nakshatra} (${pada})` : nakshatra
}

// Helper to get current Maha Dasha
function getCurrentDasha(vedicReading: any): { planet: string; endDate: string } {
  const dasha = vedicReading?.dasha?.currentMahaDasha
  if (dasha) {
    return {
      planet: dasha.planet || 'Unknown',
      endDate: dasha.endDate ? new Date(dasha.endDate).getFullYear().toString() : 'Unknown'
    }
  }
  return { planet: 'Unknown', endDate: 'Unknown' }
}

export function VedicDashboardHero({ 
  chartData, 
  userProfile, 
  chartStyle = 'north-indian',
  vedicReading 
}: VedicDashboardHeroProps) {
  const planets = chartData?.planets || []
  
  // Extract ascendant sign and convert to number for chart components
  const ascendantSignName = chartData?.ascendant?.sign || chartData?.ascendant?.signName || chartData?.lagna?.sign || 'Aries'
  const ascendantSignNumber = getSignNumber(ascendantSignName)
  const ascendantDegree = chartData?.ascendant?.degree || chartData?.ascendant?.degreeInSign || chartData?.lagna?.degree || 0
  const ayanamsha = chartData?.ayanamsha || chartData?.metadata?.ayanamsha || 'Lahiri'
  
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
  
  const sunSign = sun?.signName || sun?.sign || 'Unknown'
  const sunNakshatra = sun?.nakshatra || 'Unknown'
  const moonSign = moon?.signName || moon?.sign || 'Unknown'
  const moonNakshatra = moon?.nakshatra || 'Unknown'
  const moonPada = moon?.pada
  
  const lagnaLord = getLagnaLord(ascendantSignName)
  const currentDasha = getCurrentDasha(vedicReading)
  
  // Get tithi from chart data or vedicReading
  const tithi = chartData?.tithi || vedicReading?.panchanga?.tithi || 'Unknown'
  
  return (
    <div className="space-y-6">
      {/* Chart Visualization */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="glass-card border-white/10 rounded-2xl text-white overflow-hidden">
          <CardContent className="p-6 text-white">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 mb-2">
                Your Vedic Birth Chart
              </h2>
              <p className="text-slate-300 text-sm">
                {userProfile?.birthPlace && `Born in ${userProfile.birthPlace}`}
                {userProfile?.birthDate && ` • ${new Date(userProfile.birthDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
              </p>
              <p className="text-slate-400 text-xs mt-1">
                Sidereal Zodiac • {ayanamsha} Ayanamsha
              </p>
              <p className="text-slate-500 text-xs mt-2">
                <AffiliateLink href={getBirthChartUrl()} label="Calculate your free natal chart at Astro-Charts" className="text-amber-500/80 hover:text-amber-400" />
              </p>
            </div>
            
            {planets.length > 0 && ascendantSignNumber > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Birth Chart (D1) */}
                <div className="flex flex-col items-center">
                  <p className="text-amber-300 text-sm font-semibold mb-3">Birth Chart (D1)</p>
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
                    <p className="text-purple-300 text-sm font-semibold mb-3">Navamsa Chart (D9)</p>
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
              <div className="text-center py-12 text-slate-300">
                <p>Loading chart visualization...</p>
                <p className="text-xs text-slate-400 mt-2">
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

          {/* Current Dasha */}
          <CosmicMetricCard
            icon={<Clock className="w-8 h-8" />}
            label="Maha Dasha"
            value={currentDasha.planet}
            subtitle={`Until ${currentDasha.endDate}`}
            colorScheme="orange"
            size="small"
          />

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
              
              <Badge variant="secondary" className="bg-purple-200/50 text-purple-900">
                {currentDasha.planet} Dasha
              </Badge>
              
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
