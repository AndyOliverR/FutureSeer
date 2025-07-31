"use client"

import React from 'react'
import { getSymbolById, SymbolData } from '@/lib/symbolSystem'
import { cn } from '@/lib/utils'

interface MysticalSymbolProps {
  symbolId: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'glow' | 'outline' | 'filled'
  className?: string
  showLabel?: boolean
  animated?: boolean
  onClick?: () => void
}

export function MysticalSymbol({
  symbolId,
  size = 'md',
  variant = 'default',
  className,
  showLabel = false,
  animated = false,
  onClick
}: MysticalSymbolProps) {
  const symbol = getSymbolById(symbolId)
  
  if (!symbol) {
    return (
      <div className={cn(
        'flex items-center justify-center text-gray-400',
        size === 'sm' && 'w-6 h-6 text-sm',
        size === 'md' && 'w-8 h-8 text-base',
        size === 'lg' && 'w-12 h-12 text-lg',
        size === 'xl' && 'w-16 h-16 text-xl',
        className
      )}>
        ?
      </div>
    )
  }

  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  }

  const variantClasses = {
    default: 'text-amber-400',
    glow: 'text-amber-400 drop-shadow-glow',
    outline: 'text-transparent stroke-amber-400 stroke-2',
    filled: 'text-amber-400 bg-amber-400/10 rounded-full'
  }

  const animationClasses = animated ? 'animate-pulse' : ''

  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center',
        onClick && 'cursor-pointer hover:scale-110 transition-transform',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : 'img'}
      aria-label={`${symbol.name} symbol`}
      title={symbol.description}
    >
      <div className={cn(
        'flex items-center justify-center',
        sizeClasses[size],
        variantClasses[variant],
        animationClasses
      )}>
        {symbol.unicode ? (
          <span className="font-mystical">{symbol.unicode}</span>
        ) : symbol.svgPath ? (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-full h-full"
            aria-hidden="true"
          >
            <path d={symbol.svgPath} />
          </svg>
        ) : (
          <span className="font-mystical text-2xl">✨</span>
        )}
      </div>
      
      {showLabel && (
        <span className="text-xs text-gray-400 mt-1 text-center max-w-full truncate">
          {symbol.name}
        </span>
      )}
    </div>
  )
}

// Tool Symbol Component
interface ToolSymbolProps {
  toolName: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'glow' | 'outline' | 'filled'
  className?: string
  showLabel?: boolean
  animated?: boolean
  onClick?: () => void
}

export function ToolSymbol({
  toolName,
  size = 'md',
  variant = 'default',
  className,
  showLabel = false,
  animated = false,
  onClick
}: ToolSymbolProps) {
  const toolSymbolMap: Record<string, string> = {
    'vedic': 'sun',
    'western-astrology': 'aries',
    'tarot': 'fool',
    'iching': 'qian',
    'lenormand': 'rider',
    'numerology': 'one',
    'palmistry': 'hand',
    'face-reading': 'eye',
    'runes': 'rune',
    'pendulum': 'crystal',
    'vastu': 'house',
    'synastry': 'heart',
    'horary': 'clock',
    'kabbalistic-numerology': 'keter',
    'medical-astrology': 'caduceus',
    'financial-astrology': 'dollar',
    'mundane-astrology': 'globe',
    'hellenistic-astrology': 'temple',
    'kp-astrology': 'star',
    'bazi': 'dragon',
    'angel-numbers': 'angel',
    'dream-symbols': 'moon',
    'name-analysis': 'scroll',
    'geomancy': 'earth',
    '13-signs-zodiac': 'ophiuchus'
  }

  const symbolId = toolSymbolMap[toolName] || 'default'
  
  return (
    <MysticalSymbol
      symbolId={symbolId}
      size={size}
      variant={variant}
      className={className}
      showLabel={showLabel}
      animated={animated}
      onClick={onClick}
    />
  )
}

// Element Symbol Component
interface ElementSymbolProps {
  element: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'glow' | 'outline' | 'filled'
  className?: string
  showLabel?: boolean
  animated?: boolean
  onClick?: () => void
}

export function ElementSymbol({
  element,
  size = 'md',
  variant = 'default',
  className,
  showLabel = false,
  animated = false,
  onClick
}: ElementSymbolProps) {
  const elementSymbolMap: Record<string, string> = {
    'fire': '🔥',
    'earth': '🌍',
    'air': '💨',
    'water': '💧',
    'spirit': '✨',
    'shadow': '🌑'
  }

  const symbolId = elementSymbolMap[element] || 'spirit'
  
  return (
    <MysticalSymbol
      symbolId={symbolId}
      size={size}
      variant={variant}
      className={className}
      showLabel={showLabel}
      animated={animated}
      onClick={onClick}
    />
  )
}

// Zodiac Symbol Component
interface ZodiacSymbolProps {
  sign: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'glow' | 'outline' | 'filled'
  className?: string
  showLabel?: boolean
  animated?: boolean
  onClick?: () => void
}

export function ZodiacSymbol({
  sign,
  size = 'md',
  variant = 'default',
  className,
  showLabel = false,
  animated = false,
  onClick
}: ZodiacSymbolProps) {
  const zodiacSymbolMap: Record<string, string> = {
    'aries': 'aries',
    'taurus': 'taurus',
    'gemini': 'gemini',
    'cancer': 'cancer',
    'leo': 'leo',
    'virgo': 'virgo',
    'libra': 'libra',
    'scorpio': 'scorpio',
    'sagittarius': 'sagittarius',
    'capricorn': 'capricorn',
    'aquarius': 'aquarius',
    'pisces': 'pisces'
  }

  const symbolId = zodiacSymbolMap[sign.toLowerCase()] || 'aries'
  
  return (
    <MysticalSymbol
      symbolId={symbolId}
      size={size}
      variant={variant}
      className={className}
      showLabel={showLabel}
      animated={animated}
      onClick={onClick}
    />
  )
}

// Symbol Grid Component
interface SymbolGridProps {
  symbols: SymbolData[]
  columns?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'glow' | 'outline' | 'filled'
  className?: string
  showLabels?: boolean
  animated?: boolean
  onSymbolClick?: (symbol: SymbolData) => void
}

export function SymbolGrid({
  symbols,
  columns = 4,
  size = 'md',
  variant = 'default',
  className,
  showLabels = true,
  animated = false,
  onSymbolClick
}: SymbolGridProps) {
  return (
    <div className={cn(
      'grid gap-4',
      columns === 2 && 'grid-cols-2',
      columns === 3 && 'grid-cols-3',
      columns === 4 && 'grid-cols-4',
      columns === 5 && 'grid-cols-5',
      columns === 6 && 'grid-cols-6',
      className
    )}>
      {symbols.map((symbol) => (
        <MysticalSymbol
          key={symbol.id}
          symbolId={symbol.id}
          size={size}
          variant={variant}
          showLabel={showLabels}
          animated={animated}
          onClick={onSymbolClick ? () => onSymbolClick(symbol) : undefined}
        />
      ))}
    </div>
  )
} 