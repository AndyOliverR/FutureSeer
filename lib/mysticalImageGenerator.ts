import { getSymbolById, getToolSymbol } from './symbolSystem'
import { devLog } from '@/lib/devLogger';
import { fetchWithFirebaseAuthRequired } from '@/lib/clientFirebaseFetch';

// Mystical Image Generator using Stability AI
export interface MysticalImageRequest {
  type: 'background' | 'symbol' | 'avatar' | 'reading'
  tool?: string
  userProfile?: {
    sunSign?: string
    moonSign?: string
    risingSign?: string
    element?: string
  }
  theme?: string
  style?: 'ethereal' | 'cosmic' | 'mystical' | 'spiritual' | 'celestial'
  size?: 'small' | 'medium' | 'large'
}

export interface GeneratedImage {
  imageUrl: string
  prompt: string
  metadata: {
    tool: string
    type: string
    style: string
    timestamp: string
  }
}

// Prompt templates for different mystical themes
const PROMPT_TEMPLATES = {
  background: {
    ethereal: 'ethereal mystical background with floating cosmic particles, soft glowing orbs, and subtle energy waves, {element} colors, {tool_theme}, high quality, mystical atmosphere',
    cosmic: 'cosmic space background with swirling nebulas, distant stars, and celestial bodies, {element} color palette, {tool_theme}, deep space, mystical',
    spiritual: 'spiritual sanctuary background with sacred geometry, flowing energy patterns, and divine light rays, {element} tones, {tool_theme}, sacred space',
    celestial: 'celestial realm background with angelic light, floating clouds, and divine symbols, {element} hues, {tool_theme}, heavenly atmosphere'
  },
  symbol: {
    ethereal: 'mystical {symbol_name} symbol floating in ethereal light, {element} glow, sacred geometry, {tool_theme}, high detail, magical',
    cosmic: 'cosmic {symbol_name} symbol surrounded by stars and nebulas, {element} energy, {tool_theme}, space theme, mystical',
    spiritual: 'spiritual {symbol_name} symbol with sacred geometry and divine light, {element} aura, {tool_theme}, sacred art',
    celestial: 'celestial {symbol_name} symbol with angelic light and heavenly clouds, {element} radiance, {tool_theme}, divine'
  },
  avatar: {
    ethereal: 'mystical avatar portrait with {element} energy aura, {sun_sign} characteristics, ethereal beauty, cosmic background, {tool_theme}',
    cosmic: 'cosmic avatar with {element} star energy, {moon_sign} influence, space theme, celestial beauty, {tool_theme}',
    spiritual: 'spiritual avatar with {element} divine light, {rising_sign} essence, sacred geometry background, {tool_theme}',
    celestial: 'celestial avatar with {element} angelic glow, astrological harmony, heavenly beauty, {tool_theme}'
  },
  reading: {
    ethereal: 'mystical reading card with {element} energy, {tool_theme} symbols, ethereal background, sacred text, magical atmosphere',
    cosmic: 'cosmic reading card with {element} star energy, {tool_theme} symbols, space background, celestial wisdom',
    spiritual: 'spiritual reading card with {element} divine light, {tool_theme} symbols, sacred geometry, spiritual wisdom',
    celestial: 'celestial reading card with {element} angelic glow, {tool_theme} symbols, heavenly background, divine guidance'
  }
}

// Element color mappings
const ELEMENT_COLORS = {
  fire: 'warm reds, oranges, and golds',
  earth: 'rich browns, greens, and ochres',
  air: 'soft blues, whites, and silvers',
  water: 'deep blues, purples, and teals',
  spirit: 'iridescent whites, golds, and rainbow hues',
  shadow: 'deep purples, blacks, and mysterious tones'
}

// Tool theme mappings
const TOOL_THEMES = {
  'vedic': 'Vedic astrology symbols, planetary glyphs, cosmic wisdom',
  'western-astrology': 'zodiac symbols, celestial bodies, astrological charts',
  'tarot': 'tarot card imagery, mystical symbols, divination tools',
  'iching': 'I Ching hexagrams, yin-yang balance, ancient wisdom',
  'lenormand': 'Lenormand card symbols, everyday objects, practical wisdom',
  'numerology': 'sacred numbers, mathematical patterns, numerical symbolism',
  'palmistry': 'hand lines, palm symbols, life path imagery',
  'face-reading': 'facial features, character lines, personality symbols',
  'runes': 'ancient runic symbols, Norse mythology, mystical alphabets',
  'pendulum': 'crystal pendulums, energy fields, vibrational patterns',
  'vastu': 'sacred geometry, architectural harmony, space energy',
  'synastry': 'relationship symbols, heart energy, connection patterns',
  'horary': 'time symbols, clock imagery, moment of truth',
  'kabbalistic-numerology': 'Tree of Life, Hebrew letters, mystical numerology',
  'medical-astrology': 'healing symbols, medical astrology, wellness patterns',
  'kp-astrology': 'KP astrology symbols, sub-lord logic, precision astrology',
  'bazi': 'Chinese astrology, four pillars, destiny patterns',
  'angel-numbers': 'angelic symbols, divine messages, spiritual guidance',
  'dream-symbols': 'dream imagery, subconscious patterns, symbolic meanings',
  'name-analysis': 'letter symbolism, name energy, personal vibration',
  'geomancy': 'earth divination, geomantic figures, natural patterns',
  '13-signs-zodiac': 'Ophiuchus symbol, 13th sign, expanded zodiac',
  'vedastro': 'Vedic astrology symbols, AI astrologer, cosmic calculations',
  'kerykeion': 'data-driven astrology, Swiss Ephemeris, SVG charts',
  'astrochart': 'astrological charts, planetary positions, celestial data',
  'iztro': 'Purple Star Astrology, Chinese symbols, imperial wisdom',
  'sortilege': 'multiple divination tools, mystical symbols, ancient wisdom'
}

// Generate mystical image using Stability AI
export async function generateMysticalImage(request: MysticalImageRequest): Promise<GeneratedImage | null> {
  try {
    const prompt = buildMysticalPrompt(request)
    
    const response = await fetchWithFirebaseAuthRequired('/api/stability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        size: request.size || 'medium'
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate mystical image')
    }

    const data = await response.json()
    
    return {
      imageUrl: data.imageUrl,
      prompt,
      metadata: {
        tool: request.tool || 'general',
        type: request.type,
        style: request.style || 'ethereal',
        timestamp: new Date().toISOString()
      }
    }
  } catch (error) {
    devLog.error('Error generating mystical image:', error, 'mysticalImageGenerator')
    return null
  }
}

// Build mystical prompt based on request
function buildMysticalPrompt(request: MysticalImageRequest): string {
  const style = request.style || 'ethereal'
  const element = request.userProfile?.element || 'spirit'
  const tool = request.tool || 'general'
  
  // Get tool theme
  const toolTheme = TOOL_THEMES[tool as keyof typeof TOOL_THEMES] || 'mystical wisdom'
  
  // Get element colors
  const elementColors = ELEMENT_COLORS[element as keyof typeof ELEMENT_COLORS] || 'mystical colors'
  
  // Get symbol if available
  const symbol = getToolSymbol(tool)
  const symbolName = symbol?.name || 'mystical'
  
  // Build base prompt
  let basePrompt = PROMPT_TEMPLATES[request.type as keyof typeof PROMPT_TEMPLATES]?.[style as keyof typeof PROMPT_TEMPLATES.background] || 
                   PROMPT_TEMPLATES.background.ethereal
  
  // Replace placeholders
  basePrompt = basePrompt
    .replace('{element}', elementColors)
    .replace('{tool_theme}', toolTheme)
    .replace('{symbol_name}', symbolName)
    .replace('{sun_sign}', request.userProfile?.sunSign || 'cosmic')
    .replace('{moon_sign}', request.userProfile?.moonSign || 'mystical')
    .replace('{rising_sign}', request.userProfile?.risingSign || 'spiritual')
  
  // Add quality and style modifiers
  const modifiers = [
    'high quality',
    'detailed',
    'mystical atmosphere',
    'spiritual energy',
    'cosmic beauty',
    'ethereal glow',
    'sacred geometry',
    'divine light'
  ]
  
  return `${basePrompt}, ${modifiers.join(', ')}`
}

// Generate personalized background for user
export async function generatePersonalizedBackground(userProfile: any, tool?: string): Promise<string | null> {
  const request: MysticalImageRequest = {
    type: 'background',
    tool,
    userProfile: {
      sunSign: userProfile.sunSign,
      moonSign: userProfile.moonSign,
      risingSign: userProfile.risingSign,
      element: userProfile.element
    },
    style: 'ethereal',
    size: 'large'
  }
  
  const result = await generateMysticalImage(request)
  return result?.imageUrl || null
}

// Generate tool-specific symbol image
export async function generateToolSymbol(tool: string, style: string = 'ethereal'): Promise<string | null> {
  const request: MysticalImageRequest = {
    type: 'symbol',
    tool,
    style: style as any,
    size: 'medium'
  }
  
  const result = await generateMysticalImage(request)
  return result?.imageUrl || null
}

// Generate personalized avatar
export async function generateMysticalAvatar(userProfile: any): Promise<string | null> {
  const request: MysticalImageRequest = {
    type: 'avatar',
    userProfile: {
      sunSign: userProfile.sunSign,
      moonSign: userProfile.moonSign,
      risingSign: userProfile.risingSign,
      element: userProfile.element
    },
    style: 'ethereal',
    size: 'medium'
  }
  
  const result = await generateMysticalImage(request)
  return result?.imageUrl || null
}

// Generate reading background
export async function generateReadingBackground(tool: string, theme: string = 'general'): Promise<string | null> {
  const request: MysticalImageRequest = {
    type: 'reading',
    tool,
    theme,
    style: 'ethereal',
    size: 'large'
  }
  
  const result = await generateMysticalImage(request)
  return result?.imageUrl || null
}

// Batch generate images for tool showcase
export async function generateToolShowcaseImages(): Promise<Record<string, string>> {
  const tools = Object.keys(TOOL_THEMES)
  const images: Record<string, string> = {}
  
  for (const tool of tools) {
    try {
      const imageUrl = await generateToolSymbol(tool, 'ethereal')
      if (imageUrl) {
        images[tool] = imageUrl
      }
    } catch (error) {
      devLog.error(`Failed to generate image for ${tool}:`, error, 'mysticalImageGenerator')
    }
  }
  
  return images
}

// Generate cosmic insight visualization
export async function generateCosmicInsight(insight: string, userProfile: any): Promise<string | null> {
  const request: MysticalImageRequest = {
    type: 'reading',
    userProfile: {
      sunSign: userProfile.sunSign,
      moonSign: userProfile.moonSign,
      risingSign: userProfile.risingSign,
      element: userProfile.element
    },
    theme: insight,
    style: 'cosmic',
    size: 'large'
  }
  
  const result = await generateMysticalImage(request)
  return result?.imageUrl || null
} 