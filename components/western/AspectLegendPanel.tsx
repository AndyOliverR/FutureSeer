"use client"

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Circle,
  Square,
  Triangle,
  Hexagon,
  Minus,
  Info
} from 'lucide-react'

export interface AspectLegendPanelProps {
  aspects: any[]
  onFilterAspect?: (aspectType: string | null) => void
  activeFilter?: string | null
}

// Aspect type definitions
const ASPECT_TYPES = [
  {
    name: 'Conjunction',
    symbol: '☌',
    degree: '0°',
    orb: '±8°',
    color: 'blue',
    icon: Circle,
    influence: 'neutral',
    description: 'Blending and intensifying energies'
  },
  {
    name: 'Opposition',
    symbol: '☍',
    degree: '180°',
    orb: '±8°',
    color: 'red',
    icon: Minus,
    influence: 'challenging',
    description: 'Awareness through polarity and tension'
  },
  {
    name: 'Trine',
    symbol: '△',
    degree: '120°',
    orb: '±8°',
    color: 'green',
    icon: Triangle,
    influence: 'harmonious',
    description: 'Natural flow and ease'
  },
  {
    name: 'Square',
    symbol: '□',
    degree: '90°',
    orb: '±7°',
    color: 'orange',
    icon: Square,
    influence: 'challenging',
    description: 'Dynamic tension creating action'
  },
  {
    name: 'Sextile',
    symbol: '⚹',
    degree: '60°',
    orb: '±6°',
    color: 'cyan',
    icon: Hexagon,
    influence: 'harmonious',
    description: 'Opportunity and cooperation'
  }
]

// Get color classes for each aspect type
function getAspectColorClasses(color: string) {
  const colorMap: Record<string, any> = {
    blue: {
      bg: 'bg-blue-100',
      border: 'border-blue-300',
      text: 'text-blue-800',
      iconBg: 'bg-blue-200/60',
      iconColor: 'text-blue-700',
      badgeBg: 'bg-blue-200',
      badgeText: 'text-blue-900'
    },
    red: {
      bg: 'bg-red-100',
      border: 'border-red-300',
      text: 'text-red-800',
      iconBg: 'bg-red-200/60',
      iconColor: 'text-red-700',
      badgeBg: 'bg-red-200',
      badgeText: 'text-red-900'
    },
    green: {
      bg: 'bg-green-100',
      border: 'border-green-300',
      text: 'text-green-800',
      iconBg: 'bg-green-200/60',
      iconColor: 'text-green-700',
      badgeBg: 'bg-green-200',
      badgeText: 'text-green-900'
    },
    orange: {
      bg: 'bg-orange-100',
      border: 'border-orange-300',
      text: 'text-orange-800',
      iconBg: 'bg-orange-200/60',
      iconColor: 'text-orange-700',
      badgeBg: 'bg-orange-200',
      badgeText: 'text-orange-900'
    },
    cyan: {
      bg: 'bg-cyan-100',
      border: 'border-cyan-300',
      text: 'text-cyan-800',
      iconBg: 'bg-cyan-200/60',
      iconColor: 'text-cyan-700',
      badgeBg: 'bg-cyan-200',
      badgeText: 'text-cyan-900'
    }
  }
  return colorMap[color] || colorMap.blue
}

// Get influence badge color
function getInfluenceBadgeColor(influence: string) {
  const colors: Record<string, string> = {
    harmonious: 'bg-green-200 text-green-900',
    challenging: 'bg-orange-200 text-orange-900',
    neutral: 'bg-blue-200 text-blue-900'
  }
  return colors[influence] || colors.neutral
}

export function AspectLegendPanel({ aspects, onFilterAspect, activeFilter }: AspectLegendPanelProps) {
  // Count aspects by type
  const aspectCounts: Record<string, number> = {}
  for (const aspect of aspects) {
    const type = aspect.type
    aspectCounts[type] = (aspectCounts[type] || 0) + 1
  }
  
  return (
    <div className="space-y-6">
      {/* Legend Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Aspect Legend</h3>
        <p className="text-slate-700 text-sm">
          Understanding the geometric relationships between planets in your chart
        </p>
      </div>

      {/* Aspect Type Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ASPECT_TYPES.map((aspectType, index) => {
          const colors = getAspectColorClasses(aspectType.color)
          const count = aspectCounts[aspectType.name] || 0
          const isActive = activeFilter === aspectType.name
          const Icon = aspectType.icon
          
          return (
            <motion.div
              key={aspectType.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <Card 
                className={`border-2 ${colors.border} ${colors.bg} hover:shadow-lg transition-all duration-300 rounded-2xl ${onFilterAspect ? 'cursor-pointer' : ''} ${isActive ? 'ring-2 ring-offset-2 ring-purple-500' : ''}`}
                onClick={() => onFilterAspect && onFilterAspect(isActive ? null : aspectType.name)}
              >
                <CardContent className="p-4">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <div className={`${colors.iconBg} rounded-lg p-2`}>
                        <Icon className={`w-6 h-6 ${colors.iconColor}`} />
                      </div>
                      
                      {/* Name and Symbol */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`font-bold text-base ${colors.text}`}>
                            {aspectType.name}
                          </h4>
                          <span className={`text-2xl font-medium ${colors.iconColor}`} aria-hidden="true">
                            {aspectType.symbol}
                          </span>
                        </div>
                        <div className="text-xs text-slate-700">
                          {aspectType.degree} <span className="text-slate-500">({aspectType.orb})</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Count Badge */}
                    {count > 0 && (
                      <Badge className={`${colors.badgeBg} ${colors.badgeText} text-xs font-bold`}>
                        {count}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Influence Badge */}
                  <div className="mb-2">
                    <Badge 
                      variant="secondary" 
                      className={`${getInfluenceBadgeColor(aspectType.influence)} text-xs`}
                    >
                      {aspectType.influence.charAt(0).toUpperCase() + aspectType.influence.slice(1)}
                    </Badge>
                  </div>
                  
                  {/* Description */}
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {aspectType.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Summary Stats */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 shadow-lg rounded-3xl">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="bg-purple-200/60 rounded-lg p-2">
              <Info className="w-6 h-6 text-purple-700" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-purple-900 text-lg mb-2">
                Your Chart's Aspect Summary
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">
                    {aspects.length}
                  </div>
                  <div className="text-xs text-slate-700 mt-1">Total Aspects</div>
                </div>
                
                <div className="text-center p-3 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">
                    {(aspectCounts['Trine'] || 0) + (aspectCounts['Sextile'] || 0)}
                  </div>
                  <div className="text-xs text-slate-700 mt-1">Harmonious</div>
                </div>
                
                <div className="text-center p-3 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold text-orange-700">
                    {(aspectCounts['Square'] || 0) + (aspectCounts['Opposition'] || 0)}
                  </div>
                  <div className="text-xs text-slate-700 mt-1">Challenging</div>
                </div>
              </div>
              
              <p className="text-sm text-slate-700 mt-4 leading-relaxed">
                Your chart contains <strong>{aspects.length} significant aspects</strong> between planets. 
                Harmonious aspects indicate natural talents and ease, while challenging aspects represent 
                areas of growth and dynamic energy that drive achievement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {activeFilter && onFilterAspect && (
        <div className="text-center">
          <button
            onClick={() => onFilterAspect(null)}
            className="text-sm text-purple-600 hover:text-purple-800 underline"
          >
            Clear filter and show all aspects
          </button>
        </div>
      )}
    </div>
  )
}
