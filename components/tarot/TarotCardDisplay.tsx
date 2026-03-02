"use client"

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { TarotCard } from '@/lib/tarotIntelligence'

export interface TarotCardDisplayProps {
  card: TarotCard
  size?: 'small' | 'medium' | 'large'
  showMeaning?: boolean
  showOrientation?: boolean
  isUpright?: boolean
  onClick?: () => void
  className?: string
}

const sizeConfig = {
  small: {
    container: 'w-20 h-28',
    image: 'w-full h-full',
    text: 'text-xs',
    badge: 'text-xs px-2 py-0.5'
  },
  medium: {
    container: 'w-32 h-48',
    image: 'w-full h-full',
    text: 'text-sm',
    badge: 'text-xs px-2 py-1'
  },
  large: {
    container: 'w-48 h-72',
    image: 'w-full h-full',
    text: 'text-base',
    badge: 'text-sm px-3 py-1.5'
  }
}

export function TarotCardDisplay({
  card,
  size = 'medium',
  showMeaning = false,
  showOrientation = true,
  isUpright = true,
  onClick,
  className = ''
}: TarotCardDisplayProps) {
  const sizes = sizeConfig[size]
  const isClickable = !!onClick

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{}}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      } : undefined}
    >
      <div className={`${sizes.container} relative rounded-lg overflow-hidden border-2 border-purple-300 shadow-md bg-white ${isClickable ? 'cursor-pointer' : ''} ${!isUpright ? 'transform rotate-180' : ''}`}>
        <img
          src={card.image || '/tarot/major_00_the_fool.png.png'}
          alt={card.name}
          className={`${sizes.image} object-cover`}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/tarot/major_00_the_fool.png.png'
          }}
        />
        
        {showOrientation && (
          <div className="absolute top-2 right-2">
            <Badge 
              variant="secondary" 
              className={`${sizes.badge} font-semibold ${
                isUpright 
                  ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                  : 'bg-purple-100 text-purple-800 border border-purple-300'
              }`}
            >
              {isUpright ? '↑' : '↓'}
            </Badge>
          </div>
        )}
      </div>

      <div className={`text-center mt-2 ${sizes.text}`}>
        <div className="font-bold text-purple-900">
          {card.name}
        </div>
        
        {showMeaning && (
          <div className="text-slate-600 mt-1 leading-relaxed">
            {isUpright ? card.upright : card.reversed}
          </div>
        )}
        
        {card.arcana && (
          <div className="text-xs text-slate-500 mt-1">
            {card.arcana === 'major' ? 'Major Arcana' : `${card.suit || ''} - Minor Arcana`}
          </div>
        )}
      </div>
    </motion.div>
  )
}
