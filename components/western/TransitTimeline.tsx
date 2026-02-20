"use client"

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createTimelineTransits, formatTransitDate, getMajorTransits, TimelineTransit } from '@/lib/western/transitTimelineUtils'
import { Calendar, TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react'

export interface TransitTimelineProps {
  transits: any[]
  natalPlanets: any[]
}

// Get influence icon
function getInfluenceIcon(influence: string) {
  const icons: Record<string, any> = {
    harmonious: TrendingUp,
    challenging: TrendingDown,
    neutral: Minus
  }
  const Icon = icons[influence] || Minus
  return <Icon className="w-4 h-4" />
}

// Get influence color
function getInfluenceColor(influence: string) {
  const colors: Record<string, any> = {
    harmonious: {
      bg: 'bg-green-100',
      border: 'border-green-300',
      text: 'text-green-800',
      badge: 'bg-green-300 text-green-900 border border-green-500 font-bold'
    },
    challenging: {
      bg: 'bg-orange-100',
      border: 'border-orange-300',
      text: 'text-orange-800',
      badge: 'bg-orange-300 text-orange-900 border border-orange-500 font-bold'
    },
    neutral: {
      bg: 'bg-blue-100',
      border: 'border-blue-300',
      text: 'text-blue-800',
      badge: 'bg-blue-300 text-blue-900 border border-blue-500 font-bold'
    }
  }
  return colors[influence] || colors.neutral
}

// Planet glyph text colour (dark, visible on light influence circles)
function getPlanetGlyphColor(planetName: string): string {
  const colors: Record<string, string> = {
    Sun: 'text-amber-800',
    Moon: 'text-slate-700',
    Mercury: 'text-cyan-800',
    Venus: 'text-pink-800',
    Mars: 'text-orange-800',
    Jupiter: 'text-purple-800',
    Saturn: 'text-slate-800',
    Uranus: 'text-cyan-800',
    Neptune: 'text-blue-800',
    Pluto: 'text-violet-800'
  }
  return colors[planetName] || 'text-slate-800'
}

export function TransitTimeline({ transits, natalPlanets }: TransitTimelineProps) {
  // Create timeline transits
  const timelineTransits = useMemo(() => {
    if (!transits || transits.length === 0 || !natalPlanets || natalPlanets.length === 0) {
      return []
    }
    
    const allTransits = createTimelineTransits(transits, natalPlanets)
    return getMajorTransits(allTransits).slice(0, 10) // Show top 10 most significant
  }, [transits, natalPlanets])
  
  if (timelineTransits.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-slate-200 shadow-lg rounded-3xl">
        <CardContent className="p-8 text-center">
          <Calendar className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-slate-800 mb-2">No Active Transits</h4>
          <p className="text-slate-700 text-sm">
            Current transits will appear here when available. Your predictive insights above include transit timing.
          </p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Current Transits</h3>
        <p className="text-slate-600 text-sm">
          Active planetary transits affecting your natal chart right now
        </p>
      </div>

      {/* Timeline Visualization */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 via-pink-300 to-amber-300" />
        
        {/* Transit Events */}
        <div className="space-y-6">
          {timelineTransits.map((transit, index) => {
            const colors = getInfluenceColor(transit.influence)
            const Icon = getInfluenceIcon(transit.influence)
            
            return (
              <motion.div
                key={transit.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="relative pl-16"
              >
                {/* Timeline marker - glyph and % use dark colours for contrast on light bg */}
                <div className={`absolute left-0 top-2 w-12 h-12 ${colors.bg} border-2 ${colors.border} rounded-full flex items-center justify-center shadow-lg z-10`}>
                  <span className={`text-2xl font-medium ${getPlanetGlyphColor(transit.planetName)}`}>
                    {transit.planetGlyph}
                  </span>
                </div>
                
                {/* Transit card */}
                <Card className={`border-2 ${colors.border} ${colors.bg} rounded-2xl shadow-md hover:shadow-lg transition-all duration-300`}>
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-bold text-lg ${colors.text}`}>
                            {transit.planetName} {transit.aspectType} {transit.targetPlanet}
                          </h4>
                          {Icon}
                        </div>
                        <div className="text-xs text-slate-600 flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {formatTransitDate(transit.date)}
                        </div>
                      </div>
                      
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold shrink-0 ${colors.badge}`}>
                        {(transit.strength * 100).toFixed(0)}%
                      </span>
                    </div>
                    
                    {/* Description */}
                    <p className="text-slate-700 text-sm leading-relaxed mb-3">
                      {transit.description}
                    </p>
                    
                    {/* Impact areas */}
                    {transit.impact && transit.impact.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {transit.impact.map((area, areaIndex) => (
                          <Badge 
                            key={areaIndex}
                            variant="secondary"
                            className="text-xs bg-slate-200/90 text-slate-900 border border-slate-400 font-medium"
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            {area}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 shadow-lg rounded-3xl">
        <CardContent className="p-6">
          <h4 className="font-bold text-purple-900 text-lg mb-4">Transit Summary</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {timelineTransits.filter(t => t.influence === 'harmonious').length}
              </div>
              <div className="text-xs text-slate-600 mt-1">Harmonious</div>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">
                {timelineTransits.filter(t => t.influence === 'challenging').length}
              </div>
              <div className="text-xs text-slate-600 mt-1">Challenging</div>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {timelineTransits.filter(t => t.influence === 'neutral').length}
              </div>
              <div className="text-xs text-slate-600 mt-1">Neutral</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
