/**
 * Chinese Astrology Theme System
 * Authentic Chinese aesthetic for Zi Wei Dou Shu charts
 */

export interface ChineseTheme {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: {
      primary: string
      secondary: string
      gradient: string
    }
    elements: {
      wood: string
      fire: string
      earth: string
      metal: string
      water: string
    }
    zodiac: {
      rat: string
      ox: string
      tiger: string
      rabbit: string
      dragon: string
      snake: string
      horse: string
      goat: string
      monkey: string
      rooster: string
      dog: string
      pig: string
    }
    stars: {
      auspicious: string
      inauspicious: string
      neutral: string
      main: string
      supporting: string
    }
    palaces: {
      active: string
      inactive: string
      highlighted: string
      border: string
    }
  }
  typography: {
    chineseFont: string
    englishFont: string
    sizes: {
      small: number
      medium: number
      large: number
      xlarge: number
    }
  }
  effects: {
    shadows: {
      color: string
      blur: number
      offset: string
    }
    glows: {
      auspicious: string
      inauspicious: string
      neutral: string
    }
    animations: {
      duration: number
      easing: string
    }
  }
  decorations: {
    borders: {
      traditional: string
      modern: string
    }
    patterns: {
      dragon: string
      phoenix: string
      cloud: string
    }
  }
}

/**
 * Main Chinese Astrology Theme
 */
export const chineseAstrologyTheme: ChineseTheme = {
  colors: {
    primary: '#DC143C', // Imperial Red
    secondary: '#FFD700', // Gold
    accent: '#00A36C', // Jade Green
    
    background: {
      primary: '#0F172A', // Dark slate (FutureSeer base)
      secondary: '#1E293B', // Slate 800
      gradient: 'radial-gradient(circle at center, #1E293B 0%, #0F172A 100%)'
    },
    
    elements: {
      wood: '#228B22', // Forest Green
      fire: '#FF4500', // Flame Red
      earth: '#8B4513', // Earth Brown
      metal: '#C0C0C0', // Silver
      water: '#000080'  // Ocean Blue
    },
    
    zodiac: {
      rat: '#708090', // Slate Gray
      ox: '#8B4513', // Saddle Brown
      tiger: '#FF6347', // Tomato
      rabbit: '#DDA0DD', // Plum
      dragon: '#FFD700', // Gold
      snake: '#32CD32', // Lime Green
      horse: '#FF4500', // Orange Red
      goat: '#98FB98', // Pale Green
      monkey: '#DEB887', // Burlywood
      rooster: '#FFA500', // Orange
      dog: '#A0522D', // Sienna
      pig: '#FFB6C1'  // Light Pink
    },
    
    stars: {
      auspicious: '#FFD700', // Gold - Auspicious stars
      inauspicious: '#DC143C', // Imperial Red - Inauspicious stars
      neutral: '#87CEEB', // Sky Blue - Neutral stars
      main: '#FFFFFF', // White - Main stars
      supporting: '#D3D3D3' // Light Gray - Supporting stars
    },
    
    palaces: {
      active: '#FFD700', // Gold - Active palaces
      inactive: '#6B7280', // Gray - Inactive palaces
      highlighted: '#DC143C', // Imperial Red - Highlighted palaces
      border: '#475569' // Slate 600 - Palace borders
    }
  },
  
  typography: {
    chineseFont: '"Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
    englishFont: '"Inter", system-ui, sans-serif',
    sizes: {
      small: 12,
      medium: 14,
      large: 16,
      xlarge: 20
    }
  },
  
  effects: {
    shadows: {
      color: 'rgba(220, 20, 60, 0.3)',
      blur: 8,
      offset: '0 4px 12px'
    },
    glows: {
      auspicious: '#FFD700',
      inauspicious: '#DC143C',
      neutral: '#87CEEB'
    },
    animations: {
      duration: 300,
      easing: 'ease-in-out'
    }
  },
  
  decorations: {
    borders: {
      traditional: '2px solid #FFD700',
      modern: '1px solid #475569'
    },
    patterns: {
      dragon: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Cpath d=\'M10,50 Q30,20 50,50 Q70,80 90,50\' stroke=\'%23FFD700\' fill=\'none\' stroke-width=\'2\'/%3E%3C/svg%3E")',
      phoenix: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Cpath d=\'M20,80 Q40,20 60,80 Q80,40 90,60\' stroke=\'%23DC143C\' fill=\'none\' stroke-width=\'2\'/%3E%3C/svg%3E")',
      cloud: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Cellipse cx=\'50\' cy=\'50\' rx=\'40\' ry=\'20\' fill=\'%2300A36C\' opacity=\'0.2\'/%3E%3C/svg%3E")'
    }
  }
}

/**
 * Alternative themes for different chart types
 */
export const chineseChartThemes = {
  default: chineseAstrologyTheme,
  
  // Traditional red and gold theme
  traditional: {
    ...chineseAstrologyTheme,
    colors: {
      ...chineseAstrologyTheme.colors,
      primary: '#DC143C', // Imperial Red
      secondary: '#FFD700', // Gold
      accent: '#FF4500', // Orange Red
      background: {
        primary: '#2C1810', // Dark red-brown
        secondary: '#4A2C17', // Medium red-brown
        gradient: 'radial-gradient(circle at center, #4A2C17 0%, #2C1810 100%)'
      }
    }
  },
  
  // Modern minimalist theme
  modern: {
    ...chineseAstrologyTheme,
    colors: {
      ...chineseAstrologyTheme.colors,
      primary: '#00A36C', // Jade Green
      secondary: '#FFD700', // Gold
      accent: '#87CEEB', // Sky Blue
      background: {
        primary: '#0F172A', // Dark slate
        secondary: '#1E293B', // Slate 800
        gradient: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)'
      }
    }
  },
  
  // High contrast for accessibility
  highContrast: {
    ...chineseAstrologyTheme,
    colors: {
      ...chineseAstrologyTheme.colors,
      primary: '#FF0000', // Bright Red
      secondary: '#FFFF00', // Bright Yellow
      accent: '#00FF00', // Bright Green
      background: {
        primary: '#000000', // Pure Black
        secondary: '#333333', // Dark Gray
        gradient: 'linear-gradient(135deg, #333333 0%, #000000 100%)'
      }
    }
  }
}

/**
 * Get theme for specific chart type
 */
export function getChineseThemeForChart(chartType: 'ziwei' | 'bazi' | 'zodiac' | 'fortune'): ChineseTheme {
  return chineseAstrologyTheme
}

/**
 * Get element color
 */
export function getElementColor(element: string): string {
  return chineseAstrologyTheme.colors.elements[element as keyof typeof chineseAstrologyTheme.colors.elements] || '#6B7280'
}

/**
 * Get zodiac animal color
 */
export function getZodiacColor(animal: string): string {
  const animalKey = animal.toLowerCase() as keyof typeof chineseAstrologyTheme.colors.zodiac
  return chineseAstrologyTheme.colors.zodiac[animalKey] || '#6B7280'
}

/**
 * Get star color based on nature
 */
export function getStarColor(nature: 'auspicious' | 'inauspicious' | 'neutral', type?: 'main' | 'supporting'): string {
  if (type === 'main') return chineseAstrologyTheme.colors.stars.main
  if (type === 'supporting') return chineseAstrologyTheme.colors.stars.supporting
  
  switch (nature) {
    case 'auspicious':
      return chineseAstrologyTheme.colors.stars.auspicious
    case 'inauspicious':
      return chineseAstrologyTheme.colors.stars.inauspicious
    case 'neutral':
      return chineseAstrologyTheme.colors.stars.neutral
    default:
      return '#6B7280'
  }
}

/**
 * Get palace color
 */
export function getPalaceColor(status: 'active' | 'inactive' | 'highlighted'): string {
  switch (status) {
    case 'active':
      return chineseAstrologyTheme.colors.palaces.active
    case 'inactive':
      return chineseAstrologyTheme.colors.palaces.inactive
    case 'highlighted':
      return chineseAstrologyTheme.colors.palaces.highlighted
    default:
      return '#6B7280'
  }
}

/**
 * Create CSS custom properties for the theme
 */
export function createChineseThemeCSSProperties(theme: ChineseTheme): Record<string, string> {
  return {
    '--chinese-primary': theme.colors.primary,
    '--chinese-secondary': theme.colors.secondary,
    '--chinese-accent': theme.colors.accent,
    '--chinese-bg-primary': theme.colors.background.primary,
    '--chinese-bg-secondary': theme.colors.background.secondary,
    '--chinese-element-wood': theme.colors.elements.wood,
    '--chinese-element-fire': theme.colors.elements.fire,
    '--chinese-element-earth': theme.colors.elements.earth,
    '--chinese-element-metal': theme.colors.elements.metal,
    '--chinese-element-water': theme.colors.elements.water,
    '--chinese-star-auspicious': theme.colors.stars.auspicious,
    '--chinese-star-inauspicious': theme.colors.stars.inauspicious,
    '--chinese-star-neutral': theme.colors.stars.neutral,
    '--chinese-palace-active': theme.colors.palaces.active,
    '--chinese-palace-inactive': theme.colors.palaces.inactive,
    '--chinese-palace-highlighted': theme.colors.palaces.highlighted,
    '--chinese-font-chinese': theme.typography.chineseFont,
    '--chinese-font-english': theme.typography.englishFont,
    '--chinese-shadow-color': theme.effects.shadows.color,
    '--chinese-glow-auspicious': theme.effects.glows.auspicious,
    '--chinese-glow-inauspicious': theme.effects.glows.inauspicious,
    '--chinese-glow-neutral': theme.effects.glows.neutral
  }
}

/**
 * Apply theme to a DOM element
 */
export function applyChineseThemeToElement(element: HTMLElement, theme: ChineseTheme): void {
  const cssProperties = createChineseThemeCSSProperties(theme)
  
  Object.entries(cssProperties).forEach(([property, value]) => {
    element.style.setProperty(property, value)
  })
}

/**
 * Generate inline styles for Chinese chart components
 */
export function getChineseChartInlineStyles(theme: ChineseTheme): React.CSSProperties {
  return {
    backgroundColor: theme.colors.background.primary,
    color: theme.colors.secondary,
    fontFamily: theme.typography.englishFont,
    fontSize: theme.typography.sizes.medium,
    background: theme.colors.background.gradient,
    boxShadow: `${theme.effects.shadows.offset} ${theme.effects.shadows.color}`,
    border: theme.decorations.borders.modern,
    borderRadius: '16px'
  }
}

/**
 * Get Chinese text styles
 */
export function getChineseTextStyles(theme: ChineseTheme): React.CSSProperties {
  return {
    fontFamily: theme.typography.chineseFont,
    fontSize: theme.typography.sizes.large,
    color: theme.colors.primary,
    fontWeight: 'bold'
  }
}

/**
 * Get star glow effect
 */
export function getStarGlowEffect(nature: 'auspicious' | 'inauspicious' | 'neutral'): string {
  const glowColor = chineseAstrologyTheme.effects.glows[nature]
  return `0 0 10px ${glowColor}, 0 0 20px ${glowColor}, 0 0 30px ${glowColor}`
}

/**
 * Get palace border style
 */
export function getPalaceBorderStyle(status: 'active' | 'inactive' | 'highlighted'): React.CSSProperties {
  const color = getPalaceColor(status)
  return {
    border: `2px solid ${color}`,
    boxShadow: status === 'highlighted' ? `0 0 15px ${color}` : 'none',
    borderRadius: '8px'
  }
}

/**
 * Utility functions for color manipulation
 */

/**
 * Adjust color brightness
 */
function adjustColorBrightness(color: string, amount: number): string {
  // Simple brightness adjustment
  const hex = color.replace('#', '')
  const num = parseInt(hex, 16)
  const r = (num >> 16) + amount * 255
  const g = ((num >> 8) & 0x00FF) + amount * 255
  const b = (num & 0x0000FF) + amount * 255
  
  return `#${Math.max(0, Math.min(255, Math.round(r))).toString(16).padStart(2, '0')}${Math.max(0, Math.min(255, Math.round(g))).toString(16).padStart(2, '0')}${Math.max(0, Math.min(255, Math.round(b))).toString(16).padStart(2, '0')}`
}

/**
 * Adjust color saturation
 */
function adjustColorSaturation(color: string, amount: number): string {
  return adjustColorBrightness(color, amount * 0.1)
}

/**
 * Get complementary color
 */
function getComplementaryColor(color: string): string {
  // Simple complementary color calculation
  const hex = color.replace('#', '')
  const num = parseInt(hex, 16)
  const r = 255 - (num >> 16)
  const g = 255 - ((num >> 8) & 0x00FF)
  const b = 255 - (num & 0x0000FF)
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/**
 * Create gradient background
 */
export function createChineseGradient(type: 'radial' | 'linear' = 'radial'): string {
  const { primary, secondary, accent } = chineseAstrologyTheme.colors
  
  if (type === 'radial') {
    return `radial-gradient(circle at center, ${secondary}20 0%, ${primary}10 50%, transparent 100%)`
  } else {
    return `linear-gradient(135deg, ${primary}20 0%, ${secondary}10 50%, ${accent}10 100%)`
  }
}
