'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface ZodiacSegment {
  id: string
  name: string
  symbol: string
  degree: number
  bodyParts: string[]
  rulingPlanet: string
  color: string
}

interface BodyZodiacProjectionProps {
  userChart?: {
    planets?: { [key: string]: { sign: string; house: number; longitude?: number } }
  }
  onSegmentClick?: (segment: ZodiacSegment) => void
  gender?: 'male' | 'female'
}

// Amber/slate palette per FutureSeer Finale (no #ff6b6b, #4ecdc4)
const AMBER_PALETTE = [
  '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706',
  '#b45309', '#92400e', '#facc15', '#eab308', '#ca8a04', '#a16207'
]

const zodiacSegments: ZodiacSegment[] = [
  { id: 'aries', name: 'Aries', symbol: '♈', degree: 0, bodyParts: ['Head', 'Face', 'Brain', 'Eyes', 'Adrenal Glands'], rulingPlanet: 'Mars', color: AMBER_PALETTE[0]! },
  { id: 'taurus', name: 'Taurus', symbol: '♉', degree: 30, bodyParts: ['Throat', 'Neck', 'Vocal Cords', 'Thyroid'], rulingPlanet: 'Venus', color: AMBER_PALETTE[1]! },
  { id: 'gemini', name: 'Gemini', symbol: '♊', degree: 60, bodyParts: ['Arms', 'Shoulders', 'Lungs', 'Nervous System'], rulingPlanet: 'Mercury', color: AMBER_PALETTE[2]! },
  { id: 'cancer', name: 'Cancer', symbol: '♋', degree: 90, bodyParts: ['Chest', 'Stomach', 'Breasts', 'Digestive System'], rulingPlanet: 'Moon', color: AMBER_PALETTE[3]! },
  { id: 'leo', name: 'Leo', symbol: '♌', degree: 120, bodyParts: ['Heart', 'Spine', 'Back', 'Circulatory System'], rulingPlanet: 'Sun', color: AMBER_PALETTE[4]! },
  { id: 'virgo', name: 'Virgo', symbol: '♍', degree: 150, bodyParts: ['Digestive System', 'Intestines', 'Abdomen', 'Spleen'], rulingPlanet: 'Mercury', color: AMBER_PALETTE[5]! },
  { id: 'libra', name: 'Libra', symbol: '♎', degree: 180, bodyParts: ['Kidneys', 'Lower Back', 'Buttocks', 'Adrenal Cortex'], rulingPlanet: 'Venus', color: AMBER_PALETTE[6]! },
  { id: 'scorpio', name: 'Scorpio', symbol: '♏', degree: 210, bodyParts: ['Reproductive Organs', 'Bladder', 'Rectum', 'Prostate'], rulingPlanet: 'Mars', color: AMBER_PALETTE[7]! },
  { id: 'sagittarius', name: 'Sagittarius', symbol: '♐', degree: 240, bodyParts: ['Hips', 'Thighs', 'Liver', 'Sciatic Nerve'], rulingPlanet: 'Jupiter', color: AMBER_PALETTE[8]! },
  { id: 'capricorn', name: 'Capricorn', symbol: '♑', degree: 270, bodyParts: ['Knees', 'Bones', 'Teeth', 'Skeletal System'], rulingPlanet: 'Saturn', color: AMBER_PALETTE[9]! },
  { id: 'aquarius', name: 'Aquarius', symbol: '♒', degree: 300, bodyParts: ['Ankles', 'Circulation', 'Calves', 'Cardiovascular'], rulingPlanet: 'Uranus', color: AMBER_PALETTE[10]! },
  { id: 'pisces', name: 'Pisces', symbol: '♓', degree: 330, bodyParts: ['Feet', 'Lymphatic System', 'Toes', 'Immune System'], rulingPlanet: 'Neptune', color: AMBER_PALETTE[11]! }
]

export function BodyZodiacProjection({ userChart, onSegmentClick, gender = 'female' }: BodyZodiacProjectionProps) {
  const [selectedSegment, setSelectedSegment] = useState<ZodiacSegment | null>(null)
  const [hoveredSegment, setHoveredSegment] = useState<ZodiacSegment | null>(null)

  const handleSegmentClick = (segment: ZodiacSegment) => {
    setSelectedSegment(segment)
    if (onSegmentClick) {
      onSegmentClick(segment)
    }
  }

  // Calculate planetary positions on the wheel
  const getPlanetaryPositions = () => {
    if (!userChart?.planets) return []
    
    const positions: Array<{ planet: string; x: number; y: number; longitude: number }> = []
    
    Object.entries(userChart.planets).forEach(([planet, data]) => {
      if (data.longitude !== undefined) {
        // Convert longitude to position on circle (radius = 180, center = 200, 200)
        const angle = (data.longitude - 90) * (Math.PI / 180) // -90 to start at top
        const radius = 180
        const x = 200 + radius * Math.cos(angle)
        const y = 200 + radius * Math.sin(angle)
        
        positions.push({
          planet,
          x,
          y,
          longitude: data.longitude
        })
      }
    })
    
    return positions
  }

  const planetaryPositions = getPlanetaryPositions()
  const radius = 180
  const centerX = 200
  const centerY = 200

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="relative rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 p-8 shadow-lg">
        {/* Title */}
        <div className="mb-6 text-center">
          <p className="text-amber-900 font-medium text-lg">
            Interactive Zodiac Health Wheel
          </p>
          <p className="text-slate-700 text-sm mt-2">
            Click a zodiac segment to explore body part correlations
          </p>
        </div>

        {/* Zodiac Wheel + Info Panel - Horizontal Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-8">
          {/* Zodiac Wheel - Left Side */}
          <div className="relative flex justify-center items-center min-h-[600px]">
          <svg viewBox="0 0 400 400" className="w-full h-auto max-w-md">
            <defs>
              <linearGradient id="wheelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(251, 191, 36, 0.3)" />
                <stop offset="100%" stopColor="rgba(251, 191, 36, 0.1)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Outer circle background */}
            <circle cx={centerX} cy={centerY} r={radius} fill="url(#wheelGradient)" stroke="rgba(251, 191, 36, 0.3)" strokeWidth="2" />

            {/* Draw 12 zodiac segments */}
            {zodiacSegments.map((segment, index) => {
              const startAngle = segment.degree - 90 // Convert to SVG coordinates
              const endAngle = startAngle + 30
              const startAngleRad = (startAngle * Math.PI) / 180
              const endAngleRad = (endAngle * Math.PI) / 180
              
              // Large arc flag for pie slice
              const largeArc = 30 > 180 ? 1 : 0
              
              const x1 = centerX + radius * Math.cos(startAngleRad)
              const y1 = centerY + radius * Math.sin(startAngleRad)
              const x2 = centerX + radius * Math.cos(endAngleRad)
              const y2 = centerY + radius * Math.sin(endAngleRad)
              
              const isHovered = hoveredSegment?.id === segment.id
              const isSelected = selectedSegment?.id === segment.id
              
              return (
                <g key={segment.id}>
                  {/* Zodiac segment */}
                  <path
                    d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={isHovered || isSelected ? segment.color : `${segment.color}40`}
                    fillOpacity={isHovered || isSelected ? 0.4 : 0.15}
                    stroke={isHovered || isSelected ? segment.color : "rgba(251, 191, 36, 0.5)"}
                    strokeWidth={isSelected ? 3 : 1}
                    className="cursor-pointer transition-all hover:opacity-70"
                    onClick={() => handleSegmentClick(segment)}
                    onMouseEnter={() => setHoveredSegment(segment)}
                    onMouseLeave={() => setHoveredSegment(null)}
                  />
                  
                  {/* Zodiac symbol text */}
                  <text
                    x={centerX + (radius * 0.7) * Math.cos(((startAngle + 15) * Math.PI) / 180)}
                    y={centerY + (radius * 0.7) * Math.sin(((startAngle + 15) * Math.PI) / 180)}
                    textAnchor="middle"
                    fill="#78350f"
                    fontSize="32"
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    {segment.symbol}
                  </text>
                </g>
              )
            })}

            {/* Center circle with title */}
            <circle cx={centerX} cy={centerY} r={80} fill="rgba(15, 23, 42, 0.95)" stroke="rgba(251, 191, 36, 0.5)" strokeWidth="2" />
            <text x={centerX} y={centerY - 10} textAnchor="middle" fill="rgba(251, 191, 36, 1)" fontSize="16" fontWeight="bold">
              Health
            </text>
            <text x={centerX} y={centerY + 15} textAnchor="middle" fill="rgba(251, 191, 36, 0.8)" fontSize="12">
              Zodiac Wheel
            </text>

            {/* Planetary positions as glowing dots */}
            {planetaryPositions.map((position) => {
              const planet = position.planet
              const isSunOrMoon = planet === 'Sun' || planet === 'Moon'
              const glowRadius = isSunOrMoon ? 10 : 7
              
              return (
                <g key={planet}>
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={glowRadius}
                    fill="rgba(251, 191, 36, 0.8)"
                    filter="url(#glow)"
                    className="pointer-events-none"
                  />
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={glowRadius - 2}
                    fill={isSunOrMoon ? "rgba(251, 191, 36, 1)" : "rgba(251, 191, 36, 0.6)"}
                    className="pointer-events-none"
                  />
                </g>
              )
            })}
          </svg>
        </div>

          {/* Selected Segment Information - Right Side */}
          {selectedSegment || hoveredSegment ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-xl border-2 border-amber-300 bg-amber-50/80 h-fit sticky top-8"
            >
            {(() => {
              const segment = selectedSegment || hoveredSegment

              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{segment!.symbol}</div>
                    <div>
                      <h3 className="text-2xl font-bold text-amber-900">{segment!.name}</h3>
                      <p className="text-slate-700">Ruling Planet: {segment!.rulingPlanet}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-amber-900 mb-2">Body Parts Governed:</h4>
                    <div className="flex flex-wrap gap-2">
                      {segment!.bodyParts.map((part, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-amber-200/80 text-amber-900 rounded-lg text-sm border border-amber-300"
                        >
                          {part}
                        </span>
                      ))}
                    </div>
                  </div>

                  {userChart?.planets && (
                    <div className="mt-4 pt-4 border-t border-amber-200">
                      <p className="text-sm text-slate-700 font-medium mb-2">Planetary Influences:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(userChart.planets)
                          .filter(([_, position]) => position.sign === segment!.name)
                          .map(([planet, position]) => (
                            <span
                              key={planet}
                              className="px-3 py-1 bg-amber-200/80 text-amber-900 rounded-lg text-sm border border-amber-300"
                            >
                              {planet} in {position.house}H
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
            </motion.div>
          ) : (
            <div className="p-6 rounded-xl border-2 border-amber-300 bg-amber-50/80 h-fit sticky top-8 flex items-center justify-center">
              <p className="text-slate-700 text-center">
                Click or hover over a zodiac segment to see detailed body part correlations
              </p>
            </div>
          )}
        </div>

        {/* Zodiac Legend Grid */}
        <div className="mt-6 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {zodiacSegments.map((segment) => (
            <button
              key={segment.id}
              onClick={() => handleSegmentClick(segment)}
              className={`p-3 rounded-xl transition-all text-center border-2 ${
                selectedSegment?.id === segment.id
                  ? 'bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-900 border-amber-400 shadow-md'
                  : 'bg-amber-50/80 text-slate-700 border-amber-200 hover:border-amber-300 hover:bg-amber-100/80'
              }`}
            >
              <div className="text-2xl mb-1">{segment.symbol}</div>
              <div className="text-xs font-medium">{segment.name}</div>
              <div className="text-xs text-slate-600">{segment.rulingPlanet}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}