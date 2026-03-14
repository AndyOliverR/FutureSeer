"use client"

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { detectChartPatterns, getPatternIcon, getPatternColor, AspectPattern } from '@/lib/western/chartPatternDetection'
import { Sparkles, Info, Triangle, Square, Plus } from 'lucide-react'

export interface AspectPatternDiagramProps {
  chartData: any
}

// Get pattern color classes
function getPatternColorClasses(influence: AspectPattern['influence']) {
  const colors: Record<AspectPattern['influence'], any> = {
    harmonious: {
      bg: 'bg-green-100',
      border: 'border-green-300',
      text: 'text-green-800',
      badge: 'bg-green-200 text-green-900',
      iconBg: 'bg-green-200/60'
    },
    challenging: {
      bg: 'bg-orange-100',
      border: 'border-orange-300',
      text: 'text-orange-800',
      badge: 'bg-orange-200 text-orange-900',
      iconBg: 'bg-orange-200/60'
    },
    mixed: {
      bg: 'bg-blue-100',
      border: 'border-blue-300',
      text: 'text-blue-800',
      badge: 'bg-blue-200 text-blue-900',
      iconBg: 'bg-blue-200/60'
    }
  }
  return colors[influence]
}

// Get pattern icon component
function getPatternIconComponent(patternType: AspectPattern['type']) {
  const icons: Record<AspectPattern['type'], any> = {
    'grand-trine': Triangle,
    't-square': Square,
    'grand-cross': Plus,
    'yod': Sparkles,
    'kite': Sparkles,
    'stellium': Sparkles,
    'mystic-rectangle': Square
  }
  return icons[patternType] || Sparkles
}

export function AspectPatternDiagram({ chartData }: AspectPatternDiagramProps) {
  const patterns = useMemo(() => {
    if (!chartData?.planets || !chartData?.aspects) {
      return []
    }
    
    return detectChartPatterns(chartData.planets, chartData.aspects)
  }, [chartData])
  
  if (patterns.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-slate-200 shadow-lg rounded-3xl">
        <CardContent className="p-8 text-center">
          <Sparkles className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-slate-700 mb-2">No Major Patterns Detected</h4>
          <p className="text-slate-600 text-sm leading-relaxed">
            Your chart doesn't contain the major aspect patterns like Grand Trine, T-Square, or Stellium. 
            This is perfectly normal - most charts don't have these rare configurations. 
            Your individual planetary aspects and placements are still highly significant!
          </p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Chart Patterns</h3>
        <p className="text-slate-700 text-sm">
          Rare geometric configurations in your birth chart with special significance
        </p>
      </div>

      {/* Pattern Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patterns.map((pattern, index) => {
          const colors = getPatternColorClasses(pattern.influence)
          const IconComponent = getPatternIconComponent(pattern.type)
          const patternSymbol = getPatternIcon(pattern.type)
          
          return (
            <motion.div
              key={`${pattern.type}-${index}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.15, duration: 0.4 }}
            >
              <Card className={`border-2 ${colors.border} ${colors.bg} rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 h-full`}>
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`${colors.iconBg} rounded-lg p-3 flex-shrink-0`}>
                      <IconComponent className={`w-8 h-8 ${colors.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-bold text-xl ${colors.text}`}>
                          {pattern.name}
                        </h4>
                        <span className="text-2xl text-slate-800">{patternSymbol}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 gap-y-1">
                        <Badge className={`${colors.badge} font-medium`}>
                          {pattern.influence.charAt(0).toUpperCase() + pattern.influence.slice(1)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs bg-slate-200 text-slate-900 border border-slate-400">
                          {(pattern.strength * 100).toFixed(0)}% Strength
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Planets Involved */}
                  <div className="mb-4">
                    <div className="text-xs text-slate-700 mb-2 font-semibold">Planets Involved:</div>
                    <div className="flex flex-wrap gap-2">
                      {pattern.planets.map((planet, planetIndex) => (
                        <Badge 
                          key={planetIndex}
                          variant="outline"
                          className="text-sm border-slate-400 text-slate-800 bg-slate-50"
                        >
                          {planet}
                        </Badge>
                      ))}
                    </div>
                    {pattern.element && (
                      <div className="mt-2">
                        <Badge variant="secondary" className="text-xs bg-slate-200 text-slate-900 border border-slate-400">
                          {pattern.element} Element
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {/* Description */}
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {pattern.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Information Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 shadow-lg rounded-3xl">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="bg-purple-200/60 rounded-lg p-2">
              <Info className="w-6 h-6 text-purple-700" />
            </div>
            <div>
              <h4 className="font-bold text-purple-900 text-lg mb-2">
                Understanding Chart Patterns
              </h4>
              <div className="text-sm text-slate-700 space-y-2">
                <p>
                  <strong>Chart patterns</strong> are rare geometric configurations formed by multiple planets 
                  in specific aspect relationships. They indicate concentrated energy and talent in certain areas.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="font-semibold text-green-800 mb-1">Harmonious Patterns</div>
                    <div className="text-xs text-slate-600">
                      Indicate natural talents, ease, and flow. Examples: Grand Trine, Kite
                    </div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="font-semibold text-orange-800 mb-1">Challenging Patterns</div>
                    <div className="text-xs text-slate-600">
                      Create dynamic tension that drives achievement. Examples: T-Square, Grand Cross
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
