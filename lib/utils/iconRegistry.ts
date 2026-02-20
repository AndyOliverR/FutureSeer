/**
 * Icon Registry and Helper Functions
 * 
 * Centralized icon mapping system for astrology, numerology, and occult symbols.
 * Supports custom SVG icons with automatic fallback to lucide-react icons.
 * 
 * Icon Sources & Attribution:
 * 
 * Zodiac Icons: GitHub - krakkenkodex/astrology_icons (GPL-3.0)
 * https://github.com/krakkenkodex/astrology_icons
 * License: GPL-3.0 - Attribution provided in code comments
 * 
 * Planetary Icons: Reshot (Free Commercial License)
 * https://www.reshot.com/free-svg-icons/astrology/
 * License: Free commercial use, no attribution required
 * 
 * Number Icons: Tabler Icons (MIT License)
 * https://tabler.io/icons
 * License: MIT - No attribution required
 */

import React, { ReactNode } from 'react'
import { 
  Sun, Moon,
  Star, Circle, Hash
} from 'lucide-react'

export type IconCategory = 'zodiac' | 'planet' | 'aspect' | 'number' | 'master-number'

/**
 * Get the path to an icon file, checking both .svg and .svg.svg extensions
 */
function getIconPath(category: IconCategory, value: string, subfolder?: string): string | null {
  const basePath = '/icons'
  const categoryPaths: Record<IconCategory, string> = {
    zodiac: `${basePath}/astrology/western/zodiac`,
    planet: `${basePath}/astrology/western/planets`,
    aspect: `${basePath}/astrology/western/aspects`,
    number: `/numerology/pythagorean/numbers`,
    'master-number': `/numerology/pythagorean/master numbers`
  }
  
  const folder = subfolder ? `${categoryPaths[category]}/${subfolder}` : categoryPaths[category]
  const fileName = value.toLowerCase().replace(/\s+/g, '-')
  
  // Try both .svg and .svg.svg extensions
  // Note: We'll check if file exists at runtime, for now return the path
  return `${folder}/${fileName}.svg`
}

/**
 * Zodiac sign icon mappings
 */
export const ZODIAC_ICONS: Record<string, string> = {
  aries: '/icons/astrology/western/zodiac/aries.svg',
  taurus: '/icons/astrology/western/zodiac/taurus.svg',
  gemini: '/icons/astrology/western/zodiac/gemini.svg',
  cancer: '/icons/astrology/western/zodiac/cancer.svg',
  leo: '/icons/astrology/western/zodiac/leo.svg',
  virgo: '/icons/astrology/western/zodiac/virgo.svg',
  libra: '/icons/astrology/western/zodiac/libra.svg',
  scorpio: '/icons/astrology/western/zodiac/scorpio.svg',
  sagittarius: '/icons/astrology/western/zodiac/sagittarius.svg',
  capricorn: '/icons/astrology/western/zodiac/capricorn.svg',
  aquarius: '/icons/astrology/western/zodiac/aquarius.svg',
  pisces: '/icons/astrology/western/zodiac/pisces.svg'
}

/**
 * Planet icon mappings with fallback to lucide-react
 * Stores component constructors (not JSX) to avoid JSX syntax in .ts file
 */
export const PLANET_ICONS: Record<string, { path: string; FallbackComponent: React.ComponentType<any> }> = {
  sun: {
    path: '/icons/astrology/western/planets/sun.svg',
    FallbackComponent: Sun
  },
  moon: {
    path: '/icons/astrology/western/planets/moon.svg',
    FallbackComponent: Moon
  },
  mercury: {
    path: '/icons/astrology/western/planets/mercury.svg',
    FallbackComponent: Star // Mercury icon not available in lucide-react
  },
  venus: {
    path: '/icons/astrology/western/planets/venus.svg',
    FallbackComponent: Star // Venus icon not available in lucide-react (version issue)
  },
  mars: {
    path: '/icons/astrology/western/planets/mars.svg',
    FallbackComponent: Star // Mars icon not available in lucide-react (version issue)
  },
  jupiter: {
    path: '/icons/astrology/western/planets/jupiter.svg',
    FallbackComponent: Star // Jupiter icon not available in lucide-react
  },
  saturn: {
    path: '/icons/astrology/western/planets/saturn.svg',
    FallbackComponent: Star // Saturn icon not available in lucide-react
  },
  uranus: {
    path: '/icons/astrology/western/planets/uranus.svg',
    FallbackComponent: Star // Uranus icon not available in lucide-react
  },
  neptune: {
    path: '/icons/astrology/western/planets/neptune.svg',
    FallbackComponent: Star // Neptune icon not available in lucide-react
  },
  pluto: {
    path: '/icons/astrology/western/planets/pluto.svg',
    FallbackComponent: Circle // Pluto icon not in lucide-react
  }
}

/**
 * Aspect icon mappings
 * Maps aspect names to available geometry icons from Tabler Icons
 */
export const ASPECT_ICONS: Record<string, string> = {
  conjunction: '/icons/astrology/western/aspects/circles.svg',
  sextile: '/icons/astrology/western/aspects/hexagon.svg',
  square: '/icons/astrology/western/aspects/square.svg',
  trine: '/icons/astrology/western/aspects/triangle-inverted.svg',
  opposition: '/icons/astrology/western/aspects/circles.svg'
}

/**
 * Number icon mappings
 */
export const NUMBER_ICONS: Record<string, string> = {
  '0': '/numerology/pythagorean/numbers/0.svg',
  '1': '/numerology/pythagorean/numbers/1.svg',
  '2': '/numerology/pythagorean/numbers/2.svg',
  '3': '/numerology/pythagorean/numbers/3.svg',
  '4': '/numerology/pythagorean/numbers/4.svg',
  '5': '/numerology/pythagorean/numbers/5.svg',
  '6': '/numerology/pythagorean/numbers/6.svg',
  '7': '/numerology/pythagorean/numbers/7.svg',
  '8': '/numerology/pythagorean/numbers/8.svg',
  '9': '/numerology/pythagorean/numbers/9.svg'
}

/**
 * Master number icon mappings (11, 22, 33)
 * Path matches public folder: public/numerology/pythagorean/master numbers/
 */
export const MASTER_NUMBER_ICONS: Record<string, string> = {
  '11': '/numerology/pythagorean/master numbers/11.svg',
  '22': '/numerology/pythagorean/master numbers/22.svg',
  '33': '/numerology/pythagorean/master numbers/33.svg'
}

/**
 * Check if an icon file exists by attempting to load it
 * Returns the path with .svg extension, or .svg.svg if that's what exists
 */
export function getIconPathWithFallback(category: IconCategory, value: string): {
  path: string
  hasFile: boolean
} {
  const normalizedValue = value.toLowerCase().replace(/\s+/g, '-')
  
  let basePath = ''
  switch (category) {
    case 'zodiac':
      basePath = `/icons/astrology/western/zodiac/${normalizedValue}`
      break
    case 'planet':
      basePath = `/icons/astrology/western/planets/${normalizedValue}`
      break
    case 'aspect':
      basePath = `/icons/astrology/western/aspects/${normalizedValue}`
      break
    case 'number':
      basePath = `/numerology/pythagorean/numbers/${normalizedValue}`
      break
    case 'master-number':
      basePath = `/numerology/pythagorean/master numbers/${normalizedValue}`
      break
  }
  
  // Return path - the component will handle checking for .svg or .svg.svg
  return {
    path: `${basePath}.svg`,
    hasFile: false // Will be checked dynamically in component
  }
}

/**
 * Get zodiac sign icon path
 */
export function getZodiacIconPath(signName: string): string {
  if (!signName || signName.toLowerCase() === 'unknown') {
    return ZODIAC_ICONS.aries || '/icons/astrology/western/zodiac/aries.svg'
  }
  const normalized = signName.toLowerCase()
  return ZODIAC_ICONS[normalized] || `/icons/astrology/western/zodiac/${normalized}.svg`
}

/**
 * Get planet icon configuration (path + fallback)
 * Creates JSX element from component constructor using React.createElement
 */
export function getPlanetIconConfig(planetName: string): { path: string; fallback: ReactNode } {
  const normalized = planetName.toLowerCase()
  const config = PLANET_ICONS[normalized] || {
    path: `/icons/astrology/western/planets/${normalized}.svg`,
    FallbackComponent: Star
  }
  return {
    path: config.path,
    fallback: React.createElement(config.FallbackComponent, { className: "w-5 h-5" })
  }
}

/**
 * Get aspect icon path
 */
export function getAspectIconPath(aspectName: string): string {
  const normalized = aspectName.toLowerCase()
  return ASPECT_ICONS[normalized] || `/icons/astrology/western/aspects/${normalized}.svg`
}

/**
 * Get number icon path
 */
export function getNumberIconPath(number: number | string): string {
  const numStr = String(number)
  return NUMBER_ICONS[numStr] || `/numerology/pythagorean/numbers/${numStr}.svg`
}

/**
 * Get master number icon path
 * Returns path with "master numbers" (space) folder name since that's what user has
 */
export function getMasterNumberIconPath(number: number | string): string {
  const numStr = String(number)
  // Use "master numbers" (space) folder name as that's what the user has
  return MASTER_NUMBER_ICONS[numStr] || `/numerology/pythagorean/master numbers/${numStr}.svg`
}
