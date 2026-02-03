/**
 * SVG Planet Glyphs for Western Astrology Chart
 * Traditional astrological symbols
 */

export interface PlanetGlyph {
  symbol: string;
  unicode: string;
  description: string;
}

export const PLANET_GLYPHS: Record<string, PlanetGlyph> = {
  'Sun': {
    symbol: '☉',
    unicode: '\\u2609',
    description: 'Circle with dot in center'
  },
  'Moon': {
    symbol: '☽',
    unicode: '\\u263D',
    description: 'Crescent moon'
  },
  'Mercury': {
    symbol: '☿',
    unicode: '\\u263F',
    description: 'Circle with cross and horns'
  },
  'Venus': {
    symbol: '♀',
    unicode: '\\u2640',
    description: 'Circle with cross below'
  },
  'Mars': {
    symbol: '♂',
    unicode: '\\u2642',
    description: 'Circle with arrow pointing up-right'
  },
  'Jupiter': {
    symbol: '♃',
    unicode: '\\u2643',
    description: 'Number 4 with curved line'
  },
  'Saturn': {
    symbol: '♄',
    unicode: '\\u2644',
    description: 'Number 5 with curved line'
  },
  'Uranus': {
    symbol: '♅',
    unicode: '\\u2645',
    description: 'H with circle and dot'
  },
  'Neptune': {
    symbol: '♆',
    unicode: '\\u2646',
    description: 'Trident symbol'
  },
  'Pluto': {
    symbol: '♇',
    unicode: '\\u2647',
    description: 'P with circle and dot'
  },
  'North Node': {
    symbol: '☊',
    unicode: '\\u260A',
    description: 'Ascending node'
  },
  'South Node': {
    symbol: '☋',
    unicode: '\\u260B',
    description: 'Descending node'
  },
  'Chiron': {
    symbol: '⚷',
    unicode: '\\u26B7',
    description: 'K with circle'
  }
};

/**
 * Get planet glyph symbol
 */
export function getPlanetGlyph(planet: string): string {
  return PLANET_GLYPHS[planet]?.symbol || '?';
}

/**
 * Get planet glyph Unicode
 */
export function getPlanetGlyphUnicode(planet: string): string {
  return PLANET_GLYPHS[planet]?.unicode || '\\u003F';
}

/**
 * Zodiac sign symbols
 */
export const ZODIAC_SYMBOLS: Record<string, string> = {
  'Aries': '♈',
  'Taurus': '♉',
  'Gemini': '♊',
  'Cancer': '♋',
  'Leo': '♌',
  'Virgo': '♍',
  'Libra': '♎',
  'Scorpio': '♏',
  'Sagittarius': '♐',
  'Capricorn': '♑',
  'Aquarius': '♒',
  'Pisces': '♓'
};

/**
 * Get zodiac sign symbol
 */
export function getZodiacSymbol(sign: string): string {
  return ZODIAC_SYMBOLS[sign] || '?';
}

/**
 * Aspect symbols
 */
export const ASPECT_SYMBOLS: Record<string, string> = {
  'conjunction': '☌',
  'opposition': '☍',
  'trine': '△',
  'square': '□',
  'sextile': '⚹',
  'quincunx': '⚻',
  'semisextile': '⚺'
};

/**
 * Get aspect symbol
 */
export function getAspectSymbol(aspect: string): string {
  return ASPECT_SYMBOLS[aspect] || '?';
}
