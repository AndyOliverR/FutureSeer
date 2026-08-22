"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { BaguaArea } from '@/lib/fengshui/fengShuiService'
import { Compass, Sparkles, TrendingUp, Heart, Home, BookOpen, Users, Briefcase, Star } from 'lucide-react'

interface BaguaMapProps {
  areas: BaguaArea[]
  favorableDirections?: string[]
  className?: string
}

const AREA_ICONS: Record<string, React.ComponentType<any>> = {
  'Career': Briefcase,
  'Knowledge': BookOpen,
  'Family': Home,
  'Wealth': TrendingUp,
  'Fame': Star,
  'Relationships': Heart,
  'Creativity': Sparkles,
  'Helpful People': Users,
  'Health': Compass
}

const ELEMENT_COLORS: Record<string, string> = {
  'Water': 'from-blue-900 to-blue-600',
  'Wood': 'from-green-700 to-green-500',
  'Fire': 'from-red-600 to-orange-500',
  'Earth': 'from-slate-200 to-sky-200',
  'Metal': 'from-slate-400 to-slate-200'
}

export default function BaguaMap({ areas, favorableDirections = [], className = '' }: BaguaMapProps) {
  // Organize areas in Bagua grid layout (3x3 with center)
  // Bagua layout: NE-N-NW / W-Center-E / SW-S-SE
  const gridAreas = [
    { area: areas.find(a => a.direction === 'Northeast'), row: 1, col: 1 }, // Knowledge (top-left)
    { area: areas.find(a => a.direction === 'North'), row: 1, col: 2 }, // Career (top-center)
    { area: areas.find(a => a.direction === 'Northwest'), row: 1, col: 3 }, // Helpful People (top-right)
    { area: areas.find(a => a.direction === 'West'), row: 2, col: 1 }, // Creativity (middle-left)
    { area: areas.find(a => a.direction === 'Center'), row: 2, col: 2 }, // Health (center)
    { area: areas.find(a => a.direction === 'East'), row: 2, col: 3 }, // Family (middle-right)
    { area: areas.find(a => a.direction === 'Southwest'), row: 3, col: 1 }, // Relationships (bottom-left)
    { area: areas.find(a => a.direction === 'South'), row: 3, col: 2 }, // Fame (bottom-center)
    { area: areas.find(a => a.direction === 'Southeast'), row: 3, col: 3 } // Wealth (bottom-right)
  ]

  const isFavorable = (direction: string) => favorableDirections.includes(direction)

  return (
    <div className={`relative ${className}`}>
      <div className="grid grid-cols-3 gap-2 max-w-2xl mx-auto">
        {gridAreas.map(({ area, row, col }, index) => {
          if (!area) return null

          const Icon = AREA_ICONS[area.name] || Compass
          const elementColor = ELEMENT_COLORS[area.element] || 'from-slate-600 to-slate-400'
          const isFav = isFavorable(area.direction)
          const isCenter = area.direction === 'Center'

          return (
            <motion.div
              key={area.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{}}
              className={`
                relative p-4 rounded-xl border-2 backdrop-blur-sm
                ${isFav 
                  ? 'border-yellow-400 shadow-lg shadow-yellow-500/30 bg-gradient-to-br ' + elementColor
                  : 'border-slate-600/50 bg-gradient-to-br ' + elementColor + ' bg-opacity-30'
                }
              `}
              style={{
                gridRow: row,
                gridColumn: col
              }}
            >
              {/* Favorable direction badge */}
              {isFav && !isCenter && (
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-slate-900 rounded-full p-1 shadow-lg">
                  <Sparkles className="w-3 h-3" />
                </div>
              )}

              <div className="flex flex-col items-center text-center space-y-2 rounded-xl bg-white/20 px-3 py-2">
                <div className="p-2 rounded-lg bg-white/30">
                  <Icon className="w-6 h-6 text-slate-700" />
                </div>
                
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {area.name}
                  </h3>
                  <p className="text-xs text-slate-700 mt-1">{area.direction}</p>
                </div>

                <div className="flex flex-wrap gap-1 justify-center">
                  {area.color.slice(0, 2).map((color, i) => (
                    <span
                      key={i}
                      className="text-xs px-1.5 py-0.5 rounded bg-white/95 text-slate-900 border border-slate-300"
                    >
                      {color}
                    </span>
                  ))}
                </div>

                {/* Element indicator */}
                <div className="text-xs text-slate-700 mt-1">
                  {area.element}
                </div>
              </div>

              {/* Tooltip on hover */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-20"
              >
                <div className="bg-slate-900 text-white text-xs rounded-lg p-2 shadow-xl border border-yellow-500/50 max-w-xs">
                  <p className="font-semibold mb-1">{area.lifeAspect}</p>
                  <p className="text-white/80">{area.description}</p>
                </div>
              </motion.div>
            </motion.div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-yellow-400 bg-gradient-to-br from-yellow-500 to-yellow-600"></div>
          <span className="text-white/80">Favorable Direction</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-slate-600 bg-slate-700"></div>
          <span className="text-white/80">Other Areas</span>
        </div>
      </div>
    </div>
  )
}

