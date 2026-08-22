"use client"

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CosmicMetricCard } from './CosmicMetricCard'
import { ZodiacIcon } from '@/components/icons/AstrologyIcon'
import DualChartDisplay from './DualChartDisplay'
import {
  Sun,
  Moon,
  ArrowUp,
  Sparkles,
  Flame,
  Mountain,
  Wind,
  Droplets
} from 'lucide-react'
export interface WesternDashboardHeroProps {
  chartData: any
  userProfile: any
}

// Helper to get element icon
function getElementIcon(element: string) {
  const icons: Record<string, any> = {
    Fire: <Flame className="w-8 h-8" />,
    Earth: <Mountain className="w-8 h-8" />,
    Air: <Wind className="w-8 h-8" />,
    Water: <Droplets className="w-8 h-8" />
  }
  return icons[element] || <Sparkles className="w-8 h-8" />
}

// Helper to get modality name
function getModalityName(modality: string): string {
  const names: Record<string, string> = {
    cardinal: 'Cardinal (Initiative)',
    fixed: 'Fixed (Stability)',
    mutable: 'Mutable (Adaptability)'
  }
  return names[modality?.toLowerCase()] || modality
}

// Helper to calculate dominant element
function calculateDominantElement(planets: any[]): { element: string; count: number } {
  const elements: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 }
  
  const zodiacElements: Record<string, string> = {
    Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
    Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
    Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
    Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water'
  }
  
  for (const planet of planets) {
    const signName = planet.sign?.signName || planet.sign
    if (signName && zodiacElements[signName]) {
      elements[zodiacElements[signName]]++
    }
  }
  
  const dominant = Object.entries(elements).reduce((max, [elem, count]) => 
    count > max.count ? { element: elem, count } : max
  , { element: 'Fire', count: 0 })
  
  return dominant
}

// Helper to calculate dominant modality
function calculateDominantModality(planets: any[]): { modality: string; count: number } {
  const modalities: Record<string, number> = { cardinal: 0, fixed: 0, mutable: 0 }
  
  const zodiacModalities: Record<string, string> = {
    Aries: 'cardinal', Cancer: 'cardinal', Libra: 'cardinal', Capricorn: 'cardinal',
    Taurus: 'fixed', Leo: 'fixed', Scorpio: 'fixed', Aquarius: 'fixed',
    Gemini: 'mutable', Virgo: 'mutable', Sagittarius: 'mutable', Pisces: 'mutable'
  }
  
  for (const planet of planets) {
    const signName = planet.sign?.signName || planet.sign
    if (signName && zodiacModalities[signName]) {
      modalities[zodiacModalities[signName]]++
    }
  }
  
  const dominant = Object.entries(modalities).reduce((max, [mod, count]) => 
    count > max.count ? { modality: mod, count } : max
  , { modality: 'cardinal', count: 0 })
  
  return dominant
}

// Helper to detect chart ruler
function getChartRuler(ascendantSign: string): string {
  const rulers: Record<string, string> = {
    Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury',
    Cancer: 'Moon', Leo: 'Sun', Virgo: 'Mercury',
    Libra: 'Venus', Scorpio: 'Pluto', Sagittarius: 'Jupiter',
    Capricorn: 'Saturn', Aquarius: 'Uranus', Pisces: 'Neptune'
  }
  return rulers[ascendantSign] || 'Unknown'
}

export function WesternDashboardHero({ chartData, userProfile }: WesternDashboardHeroProps) {
  const planets = chartData?.planets || []
  const houses = chartData?.houses || []
  const aspects = chartData?.aspects || []
  const transits = chartData?.transits || []
  
  // Get key cosmic data
  const sun = planets.find((p: any) => p.name === 'Sun')
  const moon = planets.find((p: any) => p.name === 'Moon')
  const ascendant = houses[0] // First house is ascendant
  
  const sunSign = sun?.sign?.signName || sun?.sign || 'Unknown'
  const moonSign = moon?.sign?.signName || moon?.sign || 'Unknown'
  const risingSign = ascendant?.sign?.signName || ascendant?.sign || 'Unknown'
  
  const chartRuler = getChartRuler(risingSign)
  const dominantElement = calculateDominantElement(planets)
  const dominantModality = calculateDominantModality(planets)
  
  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      {/* Chart Visualization */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="overflow-hidden rounded-2xl border border-sky-200 bg-white">
          <CardContent className="p-3 sm:p-6">
            <div className="mb-4 text-center sm:mb-6">
              <h2 className="mb-2 font-heading text-xl font-medium tracking-wide text-sky-900 sm:text-2xl">
                Your Birth Chart
              </h2>
              <p className="text-xs text-slate-500 sm:text-sm">
                {userProfile?.birthPlace && `Born in ${userProfile.birthPlace}`}
                {userProfile?.birthDate && ` • ${new Date(userProfile.birthDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
              </p>
            </div>
            
            {planets.length > 0 && houses.length > 0 ? (
              <DualChartDisplay
                natalPlanets={planets}
                natalHouses={houses}
                natalAspects={aspects}
                transitPlanets={transits.length > 0 ? transits : planets}
                transitHouses={houses}
                width={550}
                height={400}
                natalMetadata={{
                  eventType: "Natal Chart",
                  date: userProfile?.birthDate ? new Date(userProfile.birthDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    weekday: 'short'
                  }) : "Birth Chart",
                  time: userProfile?.birthTime || "Unknown",
                  timezone: "Local",
                  location: userProfile?.birthPlace || "Unknown",
                  houseSystem: "Placidus",
                  zodiacType: "Tropical"
                }}
                transitMetadata={{
                  eventType: "Transit Chart",
                  date: new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    weekday: 'short'
                  }),
                  time: new Date().toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                  }),
                  timezone: "Local",
                  location: userProfile?.currentLocation || userProfile?.birthPlace || "Unknown",
                  houseSystem: "Placidus",
                  zodiacType: "Tropical"
                }}
              />
            ) : (
              <div className="py-12 text-center text-[var(--m3-on-surface-variant)]">
                Loading chart visualization...
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
          {/* Sun Sign */}
          <CosmicMetricCard
            icon={<Sun className="w-8 h-8" />}
            label="Sun Sign"
            value={sunSign}
            subtitle={`House ${sun?.house || 'N/A'}`}
            colorScheme="amber"
            size="small"
          />

          {/* Moon Sign */}
          <CosmicMetricCard
            icon={<Moon className="w-8 h-8" />}
            label="Moon Sign"
            value={moonSign}
            subtitle={`House ${moon?.house || 'N/A'}`}
            colorScheme="blue"
            size="small"
          />

          {/* Rising Sign */}
          <CosmicMetricCard
            icon={<ArrowUp className="w-8 h-8" />}
            label="Rising Sign"
            value={risingSign}
            subtitle="Ascendant"
            colorScheme="purple"
            size="small"
          />

          {/* Chart Ruler */}
          <CosmicMetricCard
            icon={<Sparkles className="w-8 h-8" />}
            label="Chart Ruler"
            value={chartRuler}
            subtitle="Your Guide Planet"
            colorScheme="pink"
            size="small"
          />

          {/* Dominant Element */}
          <CosmicMetricCard
            icon={getElementIcon(dominantElement.element)}
            label="Dominant Element"
            value={dominantElement.element}
            badge={`${dominantElement.count}/10`}
            colorScheme="green"
            size="small"
          />

          {/* Dominant Modality */}
          <CosmicMetricCard
            icon={<Sparkles className="w-8 h-8" />}
            label="Mode"
            value={dominantModality.modality.charAt(0).toUpperCase() + dominantModality.modality.slice(1)}
            badge={`${dominantModality.count}/10`}
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
        <Card className="rounded-2xl border border-sky-200 bg-sky-50">
          <CardContent className="p-4">
            <div className="flex min-w-0 flex-wrap items-center justify-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-sky-600" />
                <span className="text-sm font-medium text-sky-900">Quick Insights:</span>
              </div>
              
              <Badge variant="secondary" className="border border-sky-200 bg-white font-medium text-sky-800">
                {planets.length} Planets
              </Badge>
              
              <Badge variant="secondary" className="border border-sky-200 bg-white font-medium text-sky-800">
                {aspects.length} Aspects
              </Badge>
              
              <Badge variant="secondary" className="border border-sky-200 bg-white font-medium text-sky-800">
                {dominantElement.element} Dominant
              </Badge>
              
              <Badge variant="secondary" className="border border-sky-200 bg-white font-medium text-sky-800">
                {getModalityName(dominantModality.modality)}
              </Badge>
              
              {transits.length > 0 && (
                <Badge variant="secondary" className="border border-sky-200 bg-white font-medium text-sky-800">
                  {transits.length} Active Transits
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
