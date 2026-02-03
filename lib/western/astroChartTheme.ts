/**
 * AstroChart Theme Configuration for FutureSeer
 * Customizes the AstroChart library to match our dark, mystical aesthetic
 */

export interface FutureSeerChartTheme {
  background: {
    color: string;
    opacity: number;
  };
  planets: {
    colors: Record<string, string>;
    size: number;
    strokeColor: string;
    strokeWidth: number;
  };
  aspects: {
    colors: Record<string, string>;
    strokeWidth: Record<string, number>;
    opacity: number;
  };
  houses: {
    color: string;
    strokeWidth: number;
    opacity: number;
    numbers: {
      color: string;
      fontSize: number;
      fontFamily: string;
    };
  };
  zodiac: {
    colors: string[];
    strokeColor: string;
    strokeWidth: number;
    symbols: {
      color: string;
      fontSize: number;
      fontFamily: string;
    };
  };
  text: {
    color: string;
    fontFamily: string;
    fontSize: number;
  };
  chart: {
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
  };
}

/**
 * Main FutureSeer theme configuration
 */
export const futureSeerTheme: FutureSeerChartTheme = {
  background: {
    color: '#0F172A', // slate-900 - matches our dark theme
    opacity: 1
  },
  planets: {
    colors: {
      Sun: '#FBBF24',      // amber-400 - warm gold
      Moon: '#F3F4F6',     // gray-100 - soft white
      Mercury: '#60A5FA',  // blue-400 - bright blue
      Venus: '#F472B6',    // pink-400 - rose pink
      Mars: '#F87171',     // red-400 - vibrant red
      Jupiter: '#A78BFA',  // violet-400 - royal purple
      Saturn: '#6B7280',   // gray-500 - muted gray
      Uranus: '#34D399',   // emerald-400 - bright green
      Neptune: '#22D3EE',  // cyan-400 - bright cyan
      Pluto: '#A855F7',    // purple-500 - deep purple
      'North Node': '#F59E0B', // amber-500 - golden
      'South Node': '#F59E0B', // amber-500 - golden
      Chiron: '#FB7185'    // rose-400 - soft rose
    },
    size: 12,
    strokeColor: 'rgba(255, 255, 255, 0.8)',
    strokeWidth: 1
  },
  aspects: {
    colors: {
      conjunction: '#FFFFFF',   // white - neutral
      opposition: '#EF4444',    // red-500 - challenging
      trine: '#3B82F6',         // blue-500 - harmonious
      square: '#F59E0B',        // amber-500 - challenging
      sextile: '#10B981',       // emerald-500 - harmonious
      quincunx: '#8B5CF6',      // violet-500 - neutral
      semisextile: '#6B7280'    // gray-500 - neutral
    },
    strokeWidth: {
      conjunction: 2,
      opposition: 3,
      trine: 2,
      square: 3,
      sextile: 2,
      quincunx: 1,
      semisextile: 1
    },
    opacity: 0.8
  },
  houses: {
    color: '#475569', // slate-600
    strokeWidth: 2,
    opacity: 0.8,
    numbers: {
      color: '#F8FAFC', // slate-50
      fontSize: 12,
      fontFamily: 'Inter, system-ui, sans-serif'
    }
  },
  zodiac: {
    colors: [
      '#EF4444', // Aries - red
      '#F97316', // Taurus - orange
      '#FBBF24', // Gemini - amber
      '#84CC16', // Cancer - lime
      '#22C55E', // Leo - green
      '#10B981', // Virgo - emerald
      '#14B8A6', // Libra - teal
      '#06B6D4', // Scorpio - cyan
      '#3B82F6', // Sagittarius - blue
      '#6366F1', // Capricorn - indigo
      '#8B5CF6', // Aquarius - violet
      '#EC4899'  // Pisces - pink
    ],
    strokeColor: 'rgba(0, 0, 0, 0.3)',
    strokeWidth: 0.5,
    symbols: {
      color: '#FFFFFF',
      fontSize: 14,
      fontFamily: 'Inter, system-ui, sans-serif'
    }
  },
  text: {
    color: '#F8FAFC', // slate-50
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 14
  },
  chart: {
    borderColor: 'rgba(148, 163, 184, 0.2)', // slate-400 with opacity
    borderWidth: 1,
    borderRadius: 16
  }
};

/**
 * Alternative themes for different chart types
 */
export const chartTypeThemes = {
  natal: futureSeerTheme,
  transit: {
    ...futureSeerTheme,
    aspects: {
      ...futureSeerTheme.aspects,
      colors: {
        ...futureSeerTheme.aspects.colors,
        // Highlight transit aspects differently
        conjunction: '#FDE047', // yellow-300 - more visible
        opposition: '#DC2626',  // red-600 - stronger
        square: '#D97706'       // amber-600 - stronger
      }
    }
  },
  synastry: {
    ...futureSeerTheme,
    planets: {
      ...futureSeerTheme.planets,
      colors: {
        ...futureSeerTheme.planets.colors,
        // Slightly different colors for synastry
        Sun: '#FCD34D',    // amber-300
        Moon: '#E5E7EB',   // gray-200
        Venus: '#F9A8D4'   // pink-300
      }
    }
  }
};

/**
 * Get theme for specific chart type
 */
export function getThemeForChartType(chartType: 'natal' | 'transit' | 'synastry'): FutureSeerChartTheme {
  return chartTypeThemes[chartType] || futureSeerTheme;
}

/**
 * Create CSS custom properties for the theme
 */
export function createThemeCSSProperties(theme: FutureSeerChartTheme): Record<string, string> {
  return {
    '--astrochart-bg-color': theme.background.color,
    '--astrochart-bg-opacity': theme.background.opacity.toString(),
    '--astrochart-planet-sun': theme.planets.colors.Sun,
    '--astrochart-planet-moon': theme.planets.colors.Moon,
    '--astrochart-planet-mercury': theme.planets.colors.Mercury,
    '--astrochart-planet-venus': theme.planets.colors.Venus,
    '--astrochart-planet-mars': theme.planets.colors.Mars,
    '--astrochart-planet-jupiter': theme.planets.colors.Jupiter,
    '--astrochart-planet-saturn': theme.planets.colors.Saturn,
    '--astrochart-planet-uranus': theme.planets.colors.Uranus,
    '--astrochart-planet-neptune': theme.planets.colors.Neptune,
    '--astrochart-planet-pluto': theme.planets.colors.Pluto,
    '--astrochart-aspect-conjunction': theme.aspects.colors.conjunction,
    '--astrochart-aspect-opposition': theme.aspects.colors.opposition,
    '--astrochart-aspect-trine': theme.aspects.colors.trine,
    '--astrochart-aspect-square': theme.aspects.colors.square,
    '--astrochart-aspect-sextile': theme.aspects.colors.sextile,
    '--astrochart-text-color': theme.text.color,
    '--astrochart-text-font': theme.text.fontFamily,
    '--astrochart-text-size': `${theme.text.fontSize}px`
  };
}

/**
 * Apply theme to a DOM element
 */
export function applyThemeToElement(element: HTMLElement, theme: FutureSeerChartTheme): void {
  const cssProperties = createThemeCSSProperties(theme);
  
  Object.entries(cssProperties).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });
}

/**
 * Generate inline styles for AstroChart component
 */
export function getAstroChartInlineStyles(theme: FutureSeerChartTheme): React.CSSProperties {
  return {
    backgroundColor: theme.background.color,
    color: theme.text.color,
    fontFamily: theme.text.fontFamily,
    fontSize: theme.text.fontSize,
    border: `${theme.chart.borderWidth}px solid ${theme.chart.borderColor}`,
    borderRadius: theme.chart.borderRadius,
    padding: '16px'
  };
}
