"use client"

import { ReactNode, useState, useEffect } from 'react'
import { 
  getPlanetIconConfig, 
  getZodiacIconPath, 
  getAspectIconPath,
  getNumberIconPath,
  getMasterNumberIconPath
} from '@/lib/utils/iconRegistry'

interface AstrologyIconProps {
  category: 'zodiac' | 'planet' | 'aspect' | 'number' | 'master-number'
  value: string | number
  size?: number | string
  className?: string
  fallback?: ReactNode
  onError?: () => void
}

/**
 * AstrologyIcon Component
 * 
 * Displays custom SVG icons for astrology, numerology, and occult symbols
 * with automatic fallback to lucide-react icons if custom icons are missing.
 * 
 * Handles:
 * - Double .svg.svg extensions
 * - Missing icons (uses fallback)
 * - Different icon categories (zodiac, planet, aspect, number, master-number)
 * 
 * Icon Attribution:
 * Zodiac Icons: krakkenkodex/astrology_icons (GPL-3.0)
 * Planetary Icons: Reshot (Free Commercial License)
 * Number Icons: Tabler Icons (MIT License)
 */
export function AstrologyIcon({
  category,
  value,
  size = 20,
  className = '',
  fallback,
  onError
}: AstrologyIconProps) {
  const [iconPath, setIconPath] = useState<string | null>(null)
  const [useFallback, setUseFallback] = useState(false)
  const [fallbackIcon, setFallbackIcon] = useState<ReactNode>(null)

  useEffect(() => {
    let path: string | null = null
    let fbIcon: ReactNode = null

    const valueStr = String(value).toLowerCase()

    switch (category) {
      case 'zodiac':
        path = getZodiacIconPath(valueStr)
        // Paths now use .svg extension (files renamed)
        break
      case 'planet':
        const planetConfig = getPlanetIconConfig(valueStr)
        path = planetConfig.path
        // Paths now use .svg extension (files renamed)
        fbIcon = planetConfig.fallback
        break
      case 'aspect':
        path = getAspectIconPath(valueStr)
        break
      case 'number':
        path = getNumberIconPath(value)
        break
      case 'master-number':
        path = getMasterNumberIconPath(value)
        // Folder name uses space ("master numbers") - path already correct
        break
    }

    setIconPath(path && path.length > 0 ? path : null)
    setFallbackIcon(fallback || fbIcon || null)
    setUseFallback(!path || path.length === 0) // Use fallback when no path (e.g. chart points without SVGs)
  }, [category, value, fallback])

  // Handle image load error - use fallback (no .svg.svg retry to avoid duplicate 404s)
  const handleImageError = () => {
    if (!iconPath) {
      setUseFallback(true)
      if (onError) onError()
      return
    }

    // For master numbers, try alternative folder name (hyphen vs space)
    if (category === 'master-number' && iconPath && iconPath.includes('master numbers')) {
      const altPath = iconPath.replace('master numbers', 'master-numbers')
      setIconPath(altPath)
      setUseFallback(false)
      return
    }

    // All attempts failed, use fallback
    setUseFallback(true)
    if (onError) onError()
  }

  // If using fallback (lucide-react icon)
  if (useFallback && fallbackIcon) {
    return (
      <span className={`inline-flex items-center justify-center ${className}`}>
        {fallbackIcon}
      </span>
    )
  }

  // Try to load custom SVG icon
  if (iconPath) {
    const sizeStyle: React.CSSProperties = typeof size === 'number' 
      ? { width: `${size}px`, height: `${size}px` }
      : {}
    
    return (
      <img
        src={iconPath}
        alt={`${category} ${value}`}
        className={className}
        style={sizeStyle}
        onError={handleImageError}
        onLoad={() => setUseFallback(false)}
      />
    )
  }

  // Final fallback
  return fallbackIcon ? (
    <span className={`inline-flex items-center justify-center ${className}`}>
      {fallbackIcon}
    </span>
  ) : null
}

/**
 * Helper component for zodiac sign icons
 */
export function ZodiacIcon({ 
  sign, 
  size = 20, 
  className = '' 
}: { sign: string; size?: number | string; className?: string }) {
  return (
    <AstrologyIcon
      category="zodiac"
      value={sign}
      size={size}
      className={className}
    />
  )
}

/**
 * Helper component for planet icons with fallback
 */
export function PlanetIcon({ 
  planet, 
  size = 20, 
  className = '' 
}: { planet: string; size?: number | string; className?: string }) {
  const planetConfig = getPlanetIconConfig(planet)
  
  return (
    <AstrologyIcon
      category="planet"
      value={planet}
      size={size}
      className={className}
      fallback={planetConfig.fallback}
    />
  )
}

/**
 * Helper component for number icons
 */
export function NumberIcon({ 
  number, 
  size = 20, 
  className = '',
  isMaster = false
}: { 
  number: number | string; 
  size?: number | string; 
  className?: string;
  isMaster?: boolean;
}) {
  return (
    <AstrologyIcon
      category={isMaster ? 'master-number' : 'number'}
      value={number}
      size={size}
      className={className}
      fallback={<span className="font-bold">{number}</span>}
    />
  )
}
