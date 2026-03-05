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
import { AffiliateLink } from '@/components/AffiliateLink'
import { getBirthChartUrl } from '@/lib/affiliateConfig'

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
    <div className="space-y-6">
      {/* Chart Visualization */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-amber-900 mb-2">
                Your Birth Chart
              </h2>
              <p className="text-slate-700 text-sm">
                {userProfile?.birthPlace && `Born in ${userProfile.birthPlace}`}
                {userProfile?.birthDate && ` • ${new Date(userProfile.birthDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
              </p>
              <p className="text-slate-600 text-xs mt-2">
                <AffiliateLink href={getBirthChartUrl()} label="Calculate your free natal chart at Astro-Charts" className="text-amber-700 hover:text-amber-800 font-medium" />
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
              <div className="text-center py-12 text-slate-600">
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
        <Card className="bg-gradient-to-r from-slate-100 to-slate-50 border-2 border-slate-300 shadow-lg rounded-3xl">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4 justify-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-slate-700" />
                <span className="text-sm font-semibold text-slate-900">Quick Insights:</span>
              </div>
              
              <Badge variant="secondary" className="bg-purple-300 text-purple-900 border border-purple-500 font-medium">
                {planets.length} Planets
              </Badge>
              
              <Badge variant="secondary" className="bg-pink-300 text-pink-900 border border-pink-500 font-medium">
                {aspects.length} Aspects
              </Badge>
              
              <Badge variant="secondary" className="bg-blue-300 text-blue-900 border border-blue-500 font-medium">
                {dominantElement.element} Dominant
              </Badge>
              
              <Badge variant="secondary" className="bg-emerald-300 text-emerald-900 border border-emerald-500 font-medium">
                {getModalityName(dominantModality.modality)}
              </Badge>
              
              {transits.length > 0 && (
                <Badge variant="secondary" className="bg-amber-300 text-amber-900 border border-amber-500 font-medium">
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
