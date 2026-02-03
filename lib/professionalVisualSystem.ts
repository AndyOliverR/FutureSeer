// Professional Visual Design System for FutureSeer
// Inspired by Align27, Jothishi, CoStar Astrology, and Melooha
// High-definition, crisp, professional visual elements

export interface VisualConfig {
  // Color Palette - Professional Dark Theme with Golden Accents
  colors: {
    primary: string           // Golden Yellow - #fbbf24
    secondary: string         // Bright Gold - #ffd700
    accent: string           // Electric Yellow - #ffff00
    background: string       // Darkest Blue - #0f172a
    surface: string          // Dark Blue - #1e293b
    text: {
      primary: string         // Pure White - #ffffff
      secondary: string       // Light Gray - #e2e8f0
      muted: string          // Medium Gray - #94a3b8
    }
    chart: {
      lines: string          // Bright Gold - #ffd700
      circles: string        // Golden Yellow - #fbbf24
      planets: string         // Electric Yellow - #ffff00
      signs: string          // Bright Yellow - #ffff00
      houses: string         // Golden Yellow - #fbbf24
    }
  }
  
  // Typography - Professional, Clean, Readable
  typography: {
    fontFamily: string       // 'Inter', 'SF Pro Display', 'Arial'
    fontSize: {
      xs: string            // 10px
      sm: string            // 12px
      base: string          // 14px
      lg: string            // 16px
      xl: string            // 18px
      '2xl': string         // 20px
      '3xl': string         // 24px
    }
    fontWeight: {
      normal: string        // 400
      medium: string        // 500
      semibold: string      // 600
      bold: string          // 700
    }
  }
  
  // Spacing - Consistent, Professional
  spacing: {
    xs: string             // 4px
    sm: string             // 8px
    md: string             // 16px
    lg: string             // 24px
    xl: string             // 32px
    '2xl': string          // 48px
  }
  
  // Shadows and Effects - Subtle, Professional
  effects: {
    shadow: {
      sm: string           // Subtle shadow
      md: string           // Medium shadow
      lg: string           // Large shadow
      glow: string         // Glow effect
    }
    borderRadius: {
      sm: string           // 4px
      md: string           // 8px
      lg: string           // 12px
      full: string         // 50%
    }
  }
  
  // Chart-specific styling
  chart: {
    lineWidth: {
      thin: number         // 1px
      normal: number        // 2px
      thick: number         // 3px
    }
    iconSize: {
      sm: number           // 16px
      md: number           // 20px
      lg: number           // 24px
      xl: number           // 28px
    }
    opacity: {
      subtle: number       // 0.6
      normal: number       // 0.8
      strong: number       // 1.0
    }
  }
}

export const PROFESSIONAL_VISUAL_CONFIG: VisualConfig = {
  colors: {
    primary: '#fbbf24',        // Golden Yellow
    secondary: '#ffd700',      // Bright Gold
    accent: '#ffff00',         // Electric Yellow
    background: '#0f172a',      // Darkest Blue
    surface: '#1e293b',        // Dark Blue
    text: {
      primary: '#ffffff',      // Pure White
      secondary: '#e2e8f0',    // Light Gray
      muted: '#94a3b8'         // Medium Gray
    },
    chart: {
      lines: '#ffd700',        // Bright Gold
      circles: '#fbbf24',      // Golden Yellow
      planets: '#ffff00',      // Electric Yellow
      signs: '#ffff00',        // Bright Yellow
      houses: '#fbbf24'        // Golden Yellow
    }
  },
  
  typography: {
    fontFamily: "'Inter', 'SF Pro Display', 'Arial', sans-serif",
    fontSize: {
      xs: '10px',
      sm: '12px',
      base: '14px',
      lg: '16px',
      xl: '18px',
      '2xl': '20px',
      '3xl': '24px'
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px'
  },
  
  effects: {
    shadow: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
      md: '0 4px 6px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
      glow: '0 0 20px rgba(251, 191, 36, 0.5)'
    },
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      full: '50%'
    }
  },
  
  chart: {
    lineWidth: {
      thin: 1,
      normal: 2,
      thick: 3
    },
    iconSize: {
      sm: 16,
      md: 20,
      lg: 24,
      xl: 28
    },
    opacity: {
      subtle: 0.6,
      normal: 0.8,
      strong: 1.0
    }
  }
}

// High-Definition Astrological Symbols
export const PROFESSIONAL_SYMBOLS = {
  // Planetary Glyphs - High-quality Unicode
  planets: {
    Sun: '☉',
    Moon: '☽',
    Mercury: '☿',
    Venus: '♀',
    Mars: '♂',
    Jupiter: '♃',
    Saturn: '♄',
    Uranus: '♅',
    Neptune: '♆',
    Pluto: '♇',
    NorthNode: '☊',
    SouthNode: '☋'
  },
  
  // Zodiac Signs - Professional Unicode
  signs: {
    Aries: '♈',
    Taurus: '♉',
    Gemini: '♊',
    Cancer: '♋',
    Leo: '♌',
    Virgo: '♍',
    Libra: '♎',
    Scorpio: '♏',
    Sagittarius: '♐',
    Capricorn: '♑',
    Aquarius: '♒',
    Pisces: '♓'
  },
  
  // Aspect Symbols
  aspects: {
    conjunction: '☌',
    opposition: '☍',
    trine: '△',
    square: '□',
    sextile: '⚹',
    semisextile: '⚻',
    quincunx: '⚻',
    semisquare: '∠',
    sesquiquadrate: '⚼'
  },
  
  // Vedic Symbols
  vedic: {
    Sun: '☉',
    Moon: '☽',
    Mars: '♂',
    Mercury: '☿',
    Jupiter: '♃',
    Venus: '♀',
    Saturn: '♄',
    Rahu: '☊',
    Ketu: '☋'
  }
}

// Professional SVG Filters and Effects
export const PROFESSIONAL_SVG_FILTERS = `
  <defs>
    <!-- Professional Drop Shadow -->
    <filter id="professional-shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="2" dy="2" stdDeviation="4" flood-color="rgba(0,0,0,0.4)"/>
    </filter>
    
    <!-- Golden Glow Effect -->
    <filter id="golden-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <!-- Text Shadow -->
    <filter id="text-shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,0.8)"/>
    </filter>
    
    <!-- Professional Gradient -->
    <radialGradient id="professional-gradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:rgba(59, 130, 246, 0.1);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgba(15, 23, 42, 0.95);stop-opacity:1" />
    </radialGradient>
    
    <!-- Golden Gradient -->
    <linearGradient id="golden-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#ffd700;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ffff00;stop-opacity:1" />
    </linearGradient>
  </defs>
`

// Professional CSS Classes
export const PROFESSIONAL_CSS_CLASSES = `
  .professional-chart-bg { 
    fill: #0f172a; 
  }
  
  .professional-outer-circle { 
    fill: none; 
    stroke: #ffd700; 
    stroke-width: 3; 
    opacity: 1; 
    filter: url(#professional-shadow);
  }
  
  .professional-inner-circle { 
    fill: none; 
    stroke: #fbbf24; 
    stroke-width: 2; 
    opacity: 0.9; 
  }
  
  .professional-house-line { 
    stroke: #ffd700; 
    stroke-width: 1.5; 
    opacity: 0.8; 
  }
  
  .professional-house-number { 
    fill: #ffff00; 
    font-size: 16px; 
    font-weight: 700; 
    text-anchor: middle; 
    font-family: 'Inter', 'SF Pro Display', 'Arial', sans-serif; 
    text-shadow: 2px 2px 4px rgba(0,0,0,0.8); 
    filter: url(#golden-glow);
    opacity: 1; 
  }
  
  .professional-planet-glyph { 
    fill: #ffff00; 
    font-size: 24px; 
    text-anchor: middle; 
    font-weight: bold; 
    text-shadow: 3px 3px 6px rgba(0,0,0,1); 
    filter: url(#golden-glow);
    opacity: 1; 
  }
  
  .professional-planet-name { 
    fill: #e2e8f0; 
    font-size: 11px; 
    text-anchor: middle; 
    font-weight: 500; 
    font-family: 'Inter', 'SF Pro Display', 'Arial', sans-serif; 
    text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
  }
  
  .professional-planet-degree { 
    fill: #ffffff; 
    font-size: 10px; 
    text-anchor: middle; 
    font-weight: 700; 
    font-family: 'Inter', 'SF Pro Display', 'Arial', sans-serif; 
    opacity: 1; 
    text-shadow: 1px 1px 2px rgba(0,0,0,0.8); 
  }
  
  .professional-sign-glyph { 
    fill: #ffff00; 
    font-size: 22px; 
    text-anchor: middle; 
    opacity: 1; 
    text-shadow: 3px 3px 6px rgba(0,0,0,1); 
    font-weight: bold; 
    filter: url(#golden-glow);
  }
  
  .professional-sign-name { 
    fill: #ffff00; 
    font-size: 12px; 
    text-anchor: middle; 
    opacity: 1; 
    font-family: 'Inter', 'SF Pro Display', 'Arial', sans-serif; 
    text-shadow: 2px 2px 4px rgba(0,0,0,1); 
    font-weight: 600; 
    filter: url(#golden-glow);
  }
  
  .professional-aspect-line { 
    stroke-width: 2; 
    opacity: 0.9; 
  }
  
  .professional-conjunction { 
    stroke: #ff4444; 
    stroke-width: 2.5; 
  }
  
  .professional-sextile { 
    stroke: #00ffff; 
    stroke-width: 2; 
  }
  
  .professional-square { 
    stroke: #ff8800; 
    stroke-width: 2.5; 
  }
  
  .professional-trine { 
    stroke: #0088ff; 
    stroke-width: 2; 
  }
  
  .professional-opposition { 
    stroke: #ab47bc; 
    stroke-width: 2.5; 
  }
  
  .professional-center-dot { 
    fill: #fbbf24; 
  }
  
  .professional-retrograde { 
    fill: #ef4444; 
  }
  
  .professional-chart-title { 
    fill: #fbbf24; 
    font-size: 20px; 
    font-weight: 700; 
    text-anchor: middle; 
    font-family: 'Inter', 'SF Pro Display', 'Arial', sans-serif; 
    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
  }
  
  .professional-chart-subtitle { 
    fill: #e2e8f0; 
    font-size: 14px; 
    text-anchor: middle; 
    opacity: 0.8; 
    font-family: 'Inter', 'SF Pro Display', 'Arial', sans-serif; 
    text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
  }
`

// Professional Table Styling
export const PROFESSIONAL_TABLE_STYLES = `
  .professional-table {
    font-family: 'Inter', 'SF Pro Display', 'Arial', sans-serif;
    background: rgba(15, 23, 42, 0.95);
    color: #e2e8f0;
    padding: 24px;
    border-radius: 12px;
    border: 1px solid rgba(251, 191, 36, 0.3);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  }
  
  .professional-table h3 {
    color: #fbbf24;
    margin-bottom: 24px;
    text-align: center;
    font-size: 18px;
    font-weight: 700;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
  }
  
  .professional-table h4 {
    color: #fbbf24;
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 600;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
  }
  
  .professional-table table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    margin-bottom: 32px;
  }
  
  .professional-table th {
    padding: 12px 8px;
    border: 1px solid rgba(251, 191, 36, 0.3);
    text-align: left;
    background: rgba(251, 191, 36, 0.1);
    color: #fbbf24;
    font-weight: 600;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
  }
  
  .professional-table td {
    padding: 12px 8px;
    border: 1px solid rgba(251, 191, 36, 0.3);
    color: #e2e8f0;
  }
  
  .professional-table tr:nth-child(even) {
    background: rgba(251, 191, 36, 0.05);
  }
  
  .professional-table tr:hover {
    background: rgba(251, 191, 36, 0.1);
    transition: background-color 0.2s ease;
  }
`

export class ProfessionalVisualSystem {
  private config: VisualConfig
  
  constructor(config: VisualConfig = PROFESSIONAL_VISUAL_CONFIG) {
    this.config = config
    console.log('🎨 Initializing Professional Visual System')
  }
  
  // Generate professional SVG with enhanced styling
  generateProfessionalSVG(content: string): string {
    return `
      <svg xmlns="http://www.w3.org/2000/svg">
        ${PROFESSIONAL_SVG_FILTERS}
        <style>
          ${PROFESSIONAL_CSS_CLASSES}
        </style>
        ${content}
      </svg>
    `
  }
  
  // Generate professional table HTML
  generateProfessionalTable(content: string): string {
    return `
      <div class="professional-table">
        <style>
          ${PROFESSIONAL_TABLE_STYLES}
        </style>
        ${content}
      </div>
    `
  }
  
  // Get professional symbol
  getSymbol(category: 'planets' | 'signs' | 'aspects' | 'vedic', name: string): string {
    const symbols = PROFESSIONAL_SYMBOLS[category] as any
    return symbols[name] || name.charAt(0)
  }
  
  // Apply professional styling to any element
  applyProfessionalStyling(element: string, className: string): string {
    return `<span class="professional-${className}">${element}</span>`
  }
}
