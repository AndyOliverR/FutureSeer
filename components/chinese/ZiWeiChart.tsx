/**
 * Zi Wei Dou Shu Chart Component
 * Professional rendering of Purple Star Astrology chart
 */

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  chineseAstrologyTheme,
  getChineseChartInlineStyles,
  getStarColor,
  getPalaceColor,
  getElementColor,
  getStarGlowEffect,
  getPalaceBorderStyle
} from '@/lib/chinese/chineseTheme'
import { Palace, Star } from '@/lib/chinese/chineseAstrologyService'

interface ZiWeiChartProps {
  palaces: Palace[]
  mainStars: Star[]
  supportingStars: Star[]
  width?: number
  height?: number
  showStars?: boolean
  showElements?: boolean
  onPalaceClick?: (palace: Palace) => void
  onStarClick?: (star: Star) => void
}

interface PalacePosition {
  id: number
  name: string
  nameChinese: string
  x: number
  y: number
  width: number
  height: number
}

interface StarPosition {
  star: Star
  x: number
  y: number
  palaceId: number
}

const PALACE_NAMES = [
  { english: 'Life Palace', chinese: '命宫', id: 0 },
  { english: 'Parents Palace', chinese: '父母宫', id: 1 },
  { english: 'Fortune Palace', chinese: '福德宫', id: 2 },
  { english: 'Property Palace', chinese: '田宅宫', id: 3 },
  { english: 'Career Palace', chinese: '官禄宫', id: 4 },
  { english: 'Friendship Palace', chinese: '奴仆宫', id: 5 },
  { english: 'Travel Palace', chinese: '迁移宫', id: 6 },
  { english: 'Health Palace', chinese: '疾厄宫', id: 7 },
  { english: 'Wealth Palace', chinese: '财帛宫', id: 8 },
  { english: 'Children Palace', chinese: '子女宫', id: 9 },
  { english: 'Marriage Palace', chinese: '夫妻宫', id: 10 },
  { english: 'Sibling Palace', chinese: '兄弟宫', id: 11 }
]

export default function ZiWeiChart({
  palaces,
  mainStars,
  supportingStars,
  width = 600,
  height = 600,
  showStars = true,
  showElements = true,
  onPalaceClick,
  onStarClick
}: ZiWeiChartProps) {
  const [hoveredPalace, setHoveredPalace] = useState<number | null>(null)
  const [hoveredStar, setHoveredStar] = useState<string | null>(null)
  const [selectedPalace, setSelectedPalace] = useState<number | null>(null)

  // Calculate palace positions in a 4x3 grid
  const palacePositions = useMemo((): PalacePosition[] => {
    const palaceWidth = width / 4
    const palaceHeight = height / 3
    
    return PALACE_NAMES.map((palace, index) => {
      const row = Math.floor(index / 4)
      const col = index % 4
      
      return {
        id: index,
        name: palace.english,
        nameChinese: palace.chinese,
        x: col * palaceWidth,
        y: row * palaceHeight,
        width: palaceWidth,
        height: palaceHeight
      }
    })
  }, [width, height])

  // Calculate star positions within palaces
  const starPositions = useMemo((): StarPosition[] => {
    const positions: StarPosition[] = []
    
    palaces.forEach((palace, palaceIndex) => {
      palace.stars.forEach((star, starIndex) => {
        const palacePos = palacePositions[palaceIndex]
        if (palacePos) {
          // Distribute stars within palace
          const starsPerRow = Math.ceil(Math.sqrt(palace.stars.length))
          const starSpacing = Math.min(palacePos.width / (starsPerRow + 1), palacePos.height / (starsPerRow + 1))
          
          const starRow = Math.floor(starIndex / starsPerRow)
          const starCol = starIndex % starsPerRow
          
          const x = palacePos.x + (starCol + 1) * starSpacing
          const y = palacePos.y + (starRow + 1) * starSpacing
          
          positions.push({
            star,
            x,
            y,
            palaceId: palaceIndex
          })
        }
      })
    })
    
    return positions
  }, [palaces, palacePositions])

  // Handle palace click
  const handlePalaceClick = (palaceIndex: number) => {
    setSelectedPalace(palaceIndex)
    const palace = palaces[palaceIndex]
    if (palace && onPalaceClick) {
      onPalaceClick(palace)
    }
  }

  // Handle star click
  const handleStarClick = (star: Star) => {
    if (onStarClick) {
      onStarClick(star)
    }
  }

  // Get palace status
  const getPalaceStatus = (palaceIndex: number): 'active' | 'inactive' | 'highlighted' => {
    if (selectedPalace === palaceIndex) return 'highlighted'
    if (hoveredPalace === palaceIndex) return 'active'
    return 'inactive'
  }

  return (
    <div 
      className="relative flex items-center justify-center"
    >
      <motion.svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="drop-shadow-xl"
      >
        {/* Gradient Definitions */}
        <defs>
          <radialGradient id="palaceGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(250, 245, 255, 0.3)" />
            <stop offset="50%" stopColor="rgba(253, 242, 248, 0.2)" />
            <stop offset="100%" stopColor="rgba(255, 251, 235, 0.1)" />
          </radialGradient>
          
          <linearGradient id="devotionistGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#faf5ff" />
            <stop offset="50%" stopColor="#fdf2f8" />
            <stop offset="100%" stopColor="#fffbeb" />
          </linearGradient>
          
          <linearGradient id="devotionistHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fef9c3" />
          </linearGradient>
          
          <linearGradient id="titleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#581c87" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          
          <filter id="starGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="palaceGlow">
            <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect 
          width={width} 
          height={height} 
          fill="url(#palaceGradient)" 
          rx="16"
        />

        {/* Palace Grid */}
        {palacePositions.map((position, index) => {
          const palace = palaces[index]
          const status = getPalaceStatus(index)
          const borderStyle = getPalaceBorderStyle(status)
          
          return (
            <motion.g
              key={`palace-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Palace Background */}
              <rect
                x={position.x + 2}
                y={position.y + 2}
                width={position.width - 4}
                height={position.height - 4}
                fill={status === 'highlighted' ? 'url(#devotionistHighlight)' : 'url(#devotionistGradient)'}
                stroke={status === 'highlighted' ? '#f59e0b' : '#e9d5ff'}
                strokeWidth="2"
                rx="8"
                style={{
                  cursor: 'pointer'
                }}
                onMouseEnter={() => setHoveredPalace(index)}
                onMouseLeave={() => setHoveredPalace(null)}
                onClick={() => handlePalaceClick(index)}
                filter={status === 'highlighted' ? 'url(#palaceGlow)' : 'none'}
              />

              {/* Palace Label - English */}
              <text
                x={position.x + position.width / 2}
                y={position.y + 20}
                textAnchor="middle"
                fontSize="12"
                fill="#581c87"
                fontWeight="bold"
                style={{ fontFamily: chineseAstrologyTheme.typography.englishFont }}
              >
                {position.name}
              </text>

              {/* Palace Label - Chinese */}
              <text
                x={position.x + position.width / 2}
                y={position.y + 35}
                textAnchor="middle"
                fontSize="14"
                fill="#581c87"
                fontWeight="bold"
                style={{ fontFamily: chineseAstrologyTheme.typography.chineseFont }}
              >
                {position.nameChinese}
              </text>

              {/* Element Indicator */}
              {showElements && palace && (
                <circle
                  cx={position.x + position.width - 15}
                  cy={position.y + 15}
                  r="8"
                  fill={getElementColor(palace.element)}
                  stroke="#e9d5ff"
                  strokeWidth="1.5"
                  opacity="0.9"
                />
              )}

              {/* Palace Strength Indicator */}
              {palace && (
                <rect
                  x={position.x + 5}
                  y={position.y + position.height - 15}
                  width={(position.width - 10) * palace.strength}
                  height="3"
                  fill="#7c3aed"
                  opacity="0.8"
                  rx="1"
                />
              )}
            </motion.g>
          )
        })}

        {/* Stars */}
        {showStars && starPositions.map((starPos, index) => {
          const starColor = getStarColor(starPos.star.nature, starPos.star.type)
          const isHovered = hoveredStar === starPos.star.name
          
          return (
            <motion.g
              key={`star-${index}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.05 }}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredStar(starPos.star.name)}
              onMouseLeave={() => setHoveredStar(null)}
              onClick={() => handleStarClick(starPos.star)}
            >
              {/* Star Glow Effect */}
              {isHovered && (
                <circle
                  cx={starPos.x}
                  cy={starPos.y}
                  r="15"
                  fill="none"
                  stroke={starColor}
                  strokeWidth="2"
                  opacity="0.5"
                  filter="url(#starGlow)"
                />
              )}

              {/* Star Symbol */}
              <circle
                cx={starPos.x}
                cy={starPos.y}
                r="6"
                fill={starColor}
                stroke="#e9d5ff"
                strokeWidth="1.5"
                filter={isHovered ? "url(#starGlow)" : "none"}
              />

              {/* Star Label */}
              <text
                x={starPos.x}
                y={starPos.y - 12}
                textAnchor="middle"
                fontSize="10"
                fill="#581c87"
                fontWeight="bold"
                style={{ fontFamily: chineseAstrologyTheme.typography.chineseFont }}
              >
                {starPos.star.nameChinese}
              </text>
            </motion.g>
          )
        })}

        {/* Central Title */}
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          fontSize="24"
          fill={chineseAstrologyTheme.colors.primary}
          fontWeight="bold"
          style={{ fontFamily: chineseAstrologyTheme.typography.chineseFont }}
        >
          紫微斗數
        </text>
        
        <text
          x={width / 2}
          y={height / 2 + 25}
          textAnchor="middle"
          fontSize="16"
          fill={chineseAstrologyTheme.colors.secondary}
          fontWeight="normal"
          style={{ fontFamily: chineseAstrologyTheme.typography.englishFont }}
        >
          Zi Wei Dou Shu
        </text>
      </motion.svg>

      {/* Palace Information Tooltip */}
      {hoveredPalace !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 rounded-lg p-3 shadow-xl max-w-xs"
        >
          <h4 className="text-purple-900 font-semibold mb-2">
            {PALACE_NAMES[hoveredPalace]?.english}
          </h4>
          <p className="text-slate-700 text-sm mb-2">
            {PALACE_NAMES[hoveredPalace]?.chinese}
          </p>
          {palaces[hoveredPalace] && (
            <>
              <p className="text-slate-700 text-xs mb-2">
                {palaces[hoveredPalace].interpretation}
              </p>
              <div className="flex flex-wrap gap-1">
                {palaces[hoveredPalace].keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-purple-100 text-purple-700 border border-purple-300 text-xs rounded"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Star Information Tooltip */}
      {hoveredStar && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 right-4 bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 rounded-lg p-3 shadow-xl max-w-xs"
        >
          {(() => {
            const star = starPositions.find(sp => sp.star.name === hoveredStar)?.star
            if (!star) return null
            
            return (
              <>
                <h4 className="text-purple-900 font-semibold mb-2">
                  {star.nameChinese}
                </h4>
                <p className="text-slate-700 text-sm mb-2">
                  {star.name}
                </p>
                <p className="text-slate-700 text-xs mb-2">
                  {star.interpretation}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs rounded border ${
                    star.nature === 'auspicious' ? 'bg-green-50 text-green-900 border-green-200' :
                    star.nature === 'inauspicious' ? 'bg-red-50 text-red-900 border-red-200' :
                    'bg-blue-50 text-blue-900 border-blue-200'
                  }`}>
                    {star.nature}
                  </span>
                  <span className="px-2 py-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs rounded">
                    {star.element}
                  </span>
                </div>
              </>
            )
          })()}
        </motion.div>
      )}
    </div>
  )
}
