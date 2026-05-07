"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PlanetIcon, ZodiacIcon } from '@/components/icons/AstrologyIcon'
import { ChevronDown, ChevronUp } from 'lucide-react'

export interface PlanetaryDashboardProps {
  planets: any[]
  planetaryAnalysis?: Array<{ planet: string; analysis: string }>
}

// Helper to get planet color
function getPlanetColor(planetName: string): string {
  const colors: Record<string, string> = {
    Sun: 'amber',
    Moon: 'blue',
    Mercury: 'cyan',
    Venus: 'pink',
    Mars: 'orange',
    Jupiter: 'purple',
    Saturn: 'purple',
    Uranus: 'cyan',
    Neptune: 'blue',
    Pluto: 'purple'
  }
  return colors[planetName] || 'amber'
}

// Helper to get dignity
function getPlanetDignity(planet: any): string | null {
  // This is a simplified dignity calculation
  // In a full implementation, this would check planetary positions against their rulerships
  const sign = planet.sign?.signName || planet.sign
  
  const dignities: Record<string, Record<string, string>> = {
    Sun: { Leo: 'Rulership', Aries: 'Exaltation' },
    Moon: { Cancer: 'Rulership', Taurus: 'Exaltation' },
    Mercury: { Gemini: 'Rulership', Virgo: 'Rulership' },
    Venus: { Taurus: 'Rulership', Libra: 'Rulership', Pisces: 'Exaltation' },
    Mars: { Aries: 'Rulership', Scorpio: 'Rulership', Capricorn: 'Exaltation' },
    Jupiter: { Sagittarius: 'Rulership', Pisces: 'Rulership', Cancer: 'Exaltation' },
    Saturn: { Capricorn: 'Rulership', Aquarius: 'Rulership', Libra: 'Exaltation' }
  }
  
  return dignities[planet.name]?.[sign] || null
}

// Helper to extract key traits from analysis
function extractKeyTraits(analysis: string): string {
  if (!analysis) return 'No analysis available'
  
  // Take first sentence or first 120 characters
  const sentences = analysis.split('. ')
  const firstSentence = sentences[0]
  
  if (firstSentence.length <= 120) {
    return firstSentence + (sentences.length > 1 ? '...' : '')
  }
  
  return firstSentence.substring(0, 120) + '...'
}

export function PlanetaryDashboard({ planets, planetaryAnalysis }: PlanetaryDashboardProps) {
  const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null)
  
  const toggleExpand = (planetName: string) => {
    setExpandedPlanet(expandedPlanet === planetName ? null : planetName)
  }
  
  return (
    <div className="space-y-4">
      {/* Dashboard Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Planetary Positions</h3>
        <p className="text-slate-700 text-sm">
          Detailed analysis of each planet's placement in your birth chart
        </p>
      </div>

      {/* Planetary Table/Grid */}
      <div className="space-y-3">
        {planets.map((planet, index) => {
          const analysis = planetaryAnalysis?.find(p => p.planet === planet.name)
          const dignity = getPlanetDignity(planet)
          const isExpanded = expandedPlanet === planet.name
          const color = getPlanetColor(planet.name)
          
          return (
            <motion.div
              key={planet.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Card className="border-2 border-slate-200 hover:border-slate-300 transition-all duration-300 rounded-2xl overflow-hidden">
                {/* Planet Row */}
                <div 
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 cursor-pointer hover:bg-slate-50 transition-colors min-w-0 gap-3 sm:gap-0"
                  onClick={() => analysis && toggleExpand(planet.name)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 flex-1 min-w-0">
                    {/* Planet Icon */}
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <PlanetIcon planet={planet.name} size={24} />
                    </div>
                    
                    {/* Planet Name */}
                    <div className="min-w-0 sm:min-w-[100px]">
                      <div className="font-bold text-slate-800 text-base sm:text-lg">{planet.name}</div>
                      {planet.isRetrograde && (
                        <Badge variant="secondary" className="bg-red-200 text-red-900 text-xs mt-1">
                          ℞ Retrograde
                        </Badge>
                      )}
                    </div>
                    
                    {/* Sign */}
                    <div className="flex items-center gap-2 min-w-0 sm:min-w-[140px]">
                      <ZodiacIcon sign={planet.sign?.signName || planet.sign} size={20} />
                      <span className="font-semibold text-slate-700 truncate">
                        {planet.sign?.signName || planet.sign}
                      </span>
                      <span className="text-slate-500 text-sm">
                        {planet.degree?.toFixed(1) || '0.0'}°
                      </span>
                    </div>
                    
                    {/* House */}
                    <div className="min-w-0 sm:min-w-[80px]">
                      <Badge variant="outline" className="text-slate-700">
                        House {planet.house || 'N/A'}
                      </Badge>
                    </div>
                    
                    {/* Dignity */}
                    <div className="min-w-0 sm:min-w-[120px]">
                      {dignity ? (
                        <Badge className="bg-purple-200 text-purple-900">
                          {dignity}
                        </Badge>
                      ) : (
                        <span className="text-slate-500 text-sm">—</span>
                      )}
                    </div>
                    
                    {/* Key Traits Summary */}
                    <div className="flex-1 min-w-0 sm:min-w-[200px]">
                      <p className="text-sm text-slate-700 line-clamp-1">
                        {analysis ? extractKeyTraits(analysis.analysis) : 'Analysis will appear once your full report is ready.'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Expand Icon */}
                  {analysis && (
                    <div className="ml-0 sm:ml-4 self-end sm:self-auto">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-700" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-700" />
                      )}
                    </div>
                  )}
                </div>
                
                {/* Expanded Analysis */}
                <AnimatePresence>
                  {isExpanded && analysis && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="bg-gradient-to-br from-slate-50 to-gray-50 border-t-2 border-slate-200 p-6">
                        <h4 className="font-bold text-slate-800 mb-3">Full Analysis</h4>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                          {analysis.analysis}
                        </p>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Stats */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-lg rounded-3xl mt-6">
        <CardContent className="p-6">
          <h4 className="font-bold text-blue-900 text-lg mb-4">Quick Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">{planets.length}</div>
              <div className="text-xs text-slate-700 mt-1">Total Planets</div>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-red-700">
                {planets.filter(p => p.isRetrograde).length}
              </div>
              <div className="text-xs text-slate-700 mt-1">Retrograde</div>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">
                {planets.filter(p => getPlanetDignity(p)).length}
              </div>
              <div className="text-xs text-slate-700 mt-1">In Dignity</div>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {planets.filter(p => (p.house || 0) <= 3).length}
              </div>
              <div className="text-xs text-slate-700 mt-1">Angular</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
