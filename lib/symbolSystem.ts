// Symbol System for FutureSeer - Comprehensive mystical symbol mapping

export interface SymbolData {
  id: string
  name: string
  category: string
  svgPath?: string
  unicode?: string
  description: string
  keywords: string[]
  color?: string
  element?: string
}

// Vedic Astrology Symbols (Graha glyphs)
export const VEDIC_SYMBOLS: Record<string, SymbolData> = {
  sun: {
    id: 'sun',
    name: 'Surya (Sun)',
    category: 'vedic',
    unicode: '☉',
    svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z',
    description: 'The Sun represents the soul, ego, and father',
    keywords: ['soul', 'ego', 'father', 'authority', 'leadership', 'vitality'],
    color: '#FFD700',
    element: 'fire'
  },
  moon: {
    id: 'moon',
    name: 'Chandra (Moon)',
    category: 'vedic',
    unicode: '☽',
    svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z',
    description: 'The Moon represents the mind, emotions, and mother',
    keywords: ['mind', 'emotions', 'mother', 'intuition', 'nurturing', 'fluidity'],
    color: '#C0C0C0',
    element: 'water'
  },
  mars: {
    id: 'mars',
    name: 'Mangal (Mars)',
    category: 'vedic',
    unicode: '♂',
    svgPath: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z',
    description: 'Mars represents energy, courage, and brother',
    keywords: ['energy', 'courage', 'brother', 'action', 'aggression', 'strength'],
    color: '#FF4444',
    element: 'fire'
  },
  mercury: {
    id: 'mercury',
    name: 'Budh (Mercury)',
    category: 'vedic',
    unicode: '☿',
    svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z',
    description: 'Mercury represents communication, intelligence, and uncle',
    keywords: ['communication', 'intelligence', 'uncle', 'learning', 'adaptability', 'wit'],
    color: '#00FF00',
    element: 'earth'
  },
  jupiter: {
    id: 'jupiter',
    name: 'Guru (Jupiter)',
    category: 'vedic',
    unicode: '♃',
    svgPath: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z',
    description: 'Jupiter represents wisdom, teacher, and children',
    keywords: ['wisdom', 'teacher', 'children', 'expansion', 'philosophy', 'luck'],
    color: '#FFA500',
    element: 'ether'
  },
  venus: {
    id: 'venus',
    name: 'Shukra (Venus)',
    category: 'vedic',
    unicode: '♀',
    svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z',
    description: 'Venus represents love, beauty, and spouse',
    keywords: ['love', 'beauty', 'spouse', 'art', 'pleasure', 'harmony'],
    color: '#FF69B4',
    element: 'water'
  },
  saturn: {
    id: 'saturn',
    name: 'Shani (Saturn)',
    category: 'vedic',
    unicode: '♄',
    svgPath: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z',
    description: 'Saturn represents discipline, karma, and obstacles',
    keywords: ['discipline', 'karma', 'obstacles', 'patience', 'hardwork', 'justice'],
    color: '#808080',
    element: 'air'
  },
  rahu: {
    id: 'rahu',
    name: 'Rahu (North Node)',
    category: 'vedic',
    unicode: '☊',
    svgPath: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z',
    description: 'Rahu represents illusion, foreign lands, and technology',
    keywords: ['illusion', 'foreign', 'technology', 'innovation', 'disruption', 'mystery'],
    color: '#800080',
    element: 'shadow'
  },
  ketu: {
    id: 'ketu',
    name: 'Ketu (South Node)',
    category: 'vedic',
    unicode: '☋',
    svgPath: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z',
    description: 'Ketu represents spirituality, past life, and detachment',
    keywords: ['spirituality', 'past_life', 'detachment', 'moksha', 'intuition', 'mysticism'],
    color: '#4B0082',
    element: 'shadow'
  }
}

// Zodiac Signs
export const ZODIAC_SYMBOLS: Record<string, SymbolData> = {
  aries: {
    id: 'aries',
    name: 'Aries',
    category: 'zodiac',
    unicode: '♈',
    svgPath: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z',
    description: 'The Ram - Cardinal Fire Sign',
    keywords: ['pioneer', 'courage', 'leadership', 'impulsive', 'energetic', 'competitive'],
    color: '#FF4444',
    element: 'fire'
  },
  taurus: {
    id: 'taurus',
    name: 'Taurus',
    category: 'zodiac',
    unicode: '♉',
    svgPath: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z',
    description: 'The Bull - Fixed Earth Sign',
    keywords: ['stable', 'patient', 'practical', 'loyal', 'sensual', 'determined'],
    color: '#8B4513',
    element: 'earth'
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    category: 'zodiac',
    unicode: '♊',
    svgPath: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z',
    description: 'The Twins - Mutable Air Sign',
    keywords: ['versatile', 'curious', 'communicative', 'adaptable', 'intellectual', 'social'],
    color: '#FFD700',
    element: 'air'
  },
  cancer: {
    id: 'cancer',
    name: 'Cancer',
    category: 'zodiac',
    unicode: '♋',
    svgPath: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z',
    description: 'The Crab - Cardinal Water Sign',
    keywords: ['nurturing', 'protective', 'emotional', 'intuitive', 'homebody', 'caring'],
    color: '#C0C0C0',
    element: 'water'
  },
  leo: {
    id: 'leo',
    name: 'Leo',
    category: 'zodiac',
    unicode: '♌',
    svgPath: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z',
    description: 'The Lion - Fixed Fire Sign',
    keywords: ['confident', 'generous', 'dramatic', 'loyal', 'creative', 'proud'],
    color: '#FFA500',
    element: 'fire'
  },
  virgo: {
    id: 'virgo',
    name: 'Virgo',
    category: 'zodiac',
    unicode: '♍',
    svgPath: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z',
    description: 'The Virgin - Mutable Earth Sign',
    keywords: ['analytical', 'practical', 'modest', 'hardworking', 'intelligent', 'perfectionist'],
    color: '#228B22',
    element: 'earth'
  },
  libra: {
    id: 'libra',
    name: 'Libra',
    category: 'zodiac',
    unicode: '♎',
    svgPath: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z',
    description: 'The Scales - Cardinal Air Sign',
    keywords: ['diplomatic', 'fair', 'peaceful', 'social', 'romantic', 'balanced'],
    color: '#FF69B4',
    element: 'air'
  },
  scorpio: {
    id: 'scorpio',
    name: 'Scorpio',
    category: 'zodiac',
    unicode: '♏',
    svgPath: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z',
    description: 'The Scorpion - Fixed Water Sign',
    keywords: ['passionate', 'mysterious', 'intense', 'loyal', 'determined', 'transformative'],
    color: '#800080',
    element: 'water'
  },
  sagittarius: {
    id: 'sagittarius',
    name: 'Sagittarius',
    category: 'zodiac',
    unicode: '♐',
    svgPath: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z',
    description: 'The Archer - Mutable Fire Sign',
    keywords: ['optimistic', 'adventurous', 'philosophical', 'honest', 'independent', 'enthusiastic'],
    color: '#FF4500',
    element: 'fire'
  },
  capricorn: {
    id: 'capricorn',
    name: 'Capricorn',
    category: 'zodiac',
    unicode: '♑',
    svgPath: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z',
    description: 'The Goat - Cardinal Earth Sign',
    keywords: ['ambitious', 'disciplined', 'responsible', 'patient', 'practical', 'determined'],
    color: '#2F4F4F',
    element: 'earth'
  },
  aquarius: {
    id: 'aquarius',
    name: 'Aquarius',
    category: 'zodiac',
    unicode: '♒',
    svgPath: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z',
    description: 'The Water Bearer - Fixed Air Sign',
    keywords: ['innovative', 'independent', 'humanitarian', 'intellectual', 'progressive', 'unique'],
    color: '#00CED1',
    element: 'air'
  },
  pisces: {
    id: 'pisces',
    name: 'Pisces',
    category: 'zodiac',
    unicode: '♓',
    svgPath: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z',
    description: 'The Fish - Mutable Water Sign',
    keywords: ['compassionate', 'artistic', 'intuitive', 'dreamy', 'spiritual', 'empathetic'],
    color: '#4169E1',
    element: 'water'
  }
}

// Tarot Major Arcana
export const TAROT_SYMBOLS: Record<string, SymbolData> = {
  fool: {
    id: 'fool',
    name: 'The Fool',
    category: 'tarot',
    unicode: '🃏',
    svgPath: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z',
    description: 'New beginnings, innocence, spontaneity',
    keywords: ['beginnings', 'innocence', 'spontaneity', 'adventure', 'freedom', 'potential'],
    color: '#FFD700',
    element: 'air'
  },
  magician: {
    id: 'magician',
    name: 'The Magician',
    category: 'tarot',
    unicode: '🪄',
    svgPath: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z',
    description: 'Manifestation, power, skill',
    keywords: ['manifestation', 'power', 'skill', 'willpower', 'creativity', 'action'],
    color: '#FF4500',
    element: 'fire'
  },
  high_priestess: {
    id: 'high_priestess',
    name: 'The High Priestess',
    category: 'tarot',
    unicode: '🌙',
    svgPath: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z',
    description: 'Intuition, mystery, inner knowledge',
    keywords: ['intuition', 'mystery', 'knowledge', 'wisdom', 'secrets', 'feminine'],
    color: '#C0C0C0',
    element: 'water'
  }
}

// I Ching Hexagrams
export const ICHING_SYMBOLS: Record<string, SymbolData> = {
  qian: {
    id: 'qian',
    name: '乾 (Qian) - The Creative',
    category: 'iching',
    unicode: '☰',
    svgPath: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z',
    description: 'Heaven, creativity, strength',
    keywords: ['heaven', 'creativity', 'strength', 'leadership', 'inspiration', 'power'],
    color: '#FFD700',
    element: 'metal'
  },
  kun: {
    id: 'kun',
    name: '坤 (Kun) - The Receptive',
    category: 'iching',
    unicode: '☷',
    svgPath: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z',
    description: 'Earth, receptivity, devotion',
    keywords: ['earth', 'receptivity', 'devotion', 'nurturing', 'patience', 'service'],
    color: '#8B4513',
    element: 'earth'
  }
}

// Lenormand Cards
export const LENORMAND_SYMBOLS: Record<string, SymbolData> = {
  rider: {
    id: 'rider',
    name: 'The Rider',
    category: 'lenormand',
    unicode: '🏇',
    svgPath: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z',
    description: 'News, messages, arrival',
    keywords: ['news', 'messages', 'arrival', 'communication', 'speed', 'announcement'],
    color: '#4169E1',
    element: 'air'
  },
  clover: {
    id: 'clover',
    name: 'The Clover',
    category: 'lenormand',
    unicode: '☘️',
    svgPath: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z',
    description: 'Luck, opportunity, small joys',
    keywords: ['luck', 'opportunity', 'joy', 'fortune', 'chance', 'happiness'],
    color: '#228B22',
    element: 'earth'
  }
}

// Kabbalistic Tree of Life
export const KABBALAH_SYMBOLS: Record<string, SymbolData> = {
  keter: {
    id: 'keter',
    name: 'Keter (Crown)',
    category: 'kabbalah',
    unicode: '👑',
    svgPath: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z',
    description: 'Divine will, pure consciousness',
    keywords: ['divine_will', 'consciousness', 'unity', 'transcendence', 'spirit', 'crown'],
    color: '#FFD700',
    element: 'spirit'
  },
  chokmah: {
    id: 'chokmah',
    name: 'Chokmah (Wisdom)',
    category: 'kabbalah',
    unicode: '🧠',
    svgPath: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z',
    description: 'Active wisdom, dynamic force',
    keywords: ['wisdom', 'force', 'masculine', 'energy', 'inspiration', 'intellect'],
    color: '#4169E1',
    element: 'fire'
  }
}

// Numerology Numbers
export const NUMEROLOGY_SYMBOLS: Record<string, SymbolData> = {
  one: {
    id: 'one',
    name: 'Number 1',
    category: 'numerology',
    unicode: '1',
    svgPath: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z',
    description: 'Leadership, independence, originality',
    keywords: ['leadership', 'independence', 'originality', 'pioneer', 'ambition', 'individuality'],
    color: '#FF4500',
    element: 'fire'
  },
  seven: {
    id: 'seven',
    name: 'Number 7',
    category: 'numerology',
    unicode: '7',
    svgPath: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z',
    description: 'Spirituality, analysis, wisdom',
    keywords: ['spirituality', 'analysis', 'wisdom', 'introspection', 'mysticism', 'perfection'],
    color: '#800080',
    element: 'water'
  }
}

// Combined symbol system
export const SYMBOL_SYSTEM = {
  vedic: VEDIC_SYMBOLS,
  zodiac: ZODIAC_SYMBOLS,
  tarot: TAROT_SYMBOLS,
  iching: ICHING_SYMBOLS,
  lenormand: LENORMAND_SYMBOLS,
  kabbalah: KABBALAH_SYMBOLS,
  numerology: NUMEROLOGY_SYMBOLS
}

// Utility functions
export function getSymbolById(id: string): SymbolData | null {
  for (const category of Object.values(SYMBOL_SYSTEM)) {
    if (category[id]) {
      return category[id]
    }
  }
  return null
}

export function getSymbolsByCategory(category: string): SymbolData[] {
  return Object.values(SYMBOL_SYSTEM[category as keyof typeof SYMBOL_SYSTEM] || {})
}

export function getSymbolsByElement(element: string): SymbolData[] {
  const symbols: SymbolData[] = []
  for (const category of Object.values(SYMBOL_SYSTEM)) {
    for (const symbol of Object.values(category)) {
      if (symbol.element === element) {
        symbols.push(symbol)
      }
    }
  }
  return symbols
}

export function getSymbolsByKeyword(keyword: string): SymbolData[] {
  const symbols: SymbolData[] = []
  for (const category of Object.values(SYMBOL_SYSTEM)) {
    for (const symbol of Object.values(category)) {
      if (symbol.keywords.includes(keyword)) {
        symbols.push(symbol)
      }
    }
  }
  return symbols
}

// Symbol mapping for tools
export const TOOL_SYMBOL_MAP: Record<string, string> = {
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

// Get tool symbol
export function getToolSymbol(toolName: string): SymbolData | null {
  const symbolId = TOOL_SYMBOL_MAP[toolName]
  if (symbolId) {
    return getSymbolById(symbolId)
  }
  return null
} 