/**
 * Feng Shui Service
 * Core calculations and mappings for Feng Shui analysis
 */

import { calcKuaNumber, getKuaResult } from '@/lib/numerology/kua'
import { devLog } from '@/lib/devLogger';
import { UserProfile } from '@/lib/firebase'

export interface BaguaArea {
  name: string
  nameChinese: string
  direction: string
  element: string
  color: string[]
  lifeAspect: string
  description: string
  enhancements: string[]
  trigram: string
}

export interface KuaAnalysis {
  number: number
  element: string
  attributes: string
  favorableDirections: {
    success: string
    health: string
    relationships: string
    wisdom: string
  }
  unfavorableDirections: string[]
}

export interface ElementAnalysis {
  primaryElement: string
  elementDescription: string
  generatingCycle: string[] // Elements that support this element
  destructiveCycle: string[] // Elements that weaken this element
  balancingRecommendations: string[]
  colors: string[]
  materials: string[]
  objects: string[]
}

export interface FengShuiAnalysis {
  kua: KuaAnalysis
  bagua: BaguaArea[]
  elementAnalysis: ElementAnalysis
  favorableDirections: string[]
  unfavorableDirections: string[]
}

// Bagua Map - 9 areas (8 directions + center)
export const BAGUA_AREAS: BaguaArea[] = [
  {
    name: 'Career',
    nameChinese: '事業',
    direction: 'North',
    element: 'Water',
    color: ['Black', 'Dark Blue', 'Navy'],
    lifeAspect: 'Career and Life Path',
    description: 'Represents your career, life journey, and professional growth',
    enhancements: ['Water features', 'Mirrors', 'Black or dark blue colors', 'Curved shapes'],
    trigram: 'Kan (Water)'
  },
  {
    name: 'Knowledge',
    nameChinese: '知識',
    direction: 'Northeast',
    element: 'Earth',
    color: ['Beige', 'Light Yellow', 'Terracotta'],
    lifeAspect: 'Wisdom and Learning',
    description: 'Represents knowledge, education, and spiritual growth',
    enhancements: ['Crystals', 'Books', 'Earth tones', 'Square shapes'],
    trigram: 'Gen (Mountain)'
  },
  {
    name: 'Family',
    nameChinese: '家庭',
    direction: 'East',
    element: 'Wood',
    color: ['Green', 'Teal', 'Forest Green'],
    lifeAspect: 'Family and Health',
    description: 'Represents family relationships, health, and ancestors',
    enhancements: ['Plants', 'Wood furniture', 'Green colors', 'Rectangular shapes'],
    trigram: 'Zhen (Thunder)'
  },
  {
    name: 'Wealth',
    nameChinese: '財富',
    direction: 'Southeast',
    element: 'Wood',
    color: ['Green', 'Purple', 'Red'],
    lifeAspect: 'Wealth and Abundance',
    description: 'Represents prosperity, abundance, and material wealth',
    enhancements: ['Plants', 'Water features', 'Purple or red accents', 'Living plants'],
    trigram: 'Xun (Wind)'
  },
  {
    name: 'Fame',
    nameChinese: '名聲',
    direction: 'South',
    element: 'Fire',
    color: ['Red', 'Orange', 'Pink'],
    lifeAspect: 'Reputation and Recognition',
    description: 'Represents fame, reputation, and how others see you',
    enhancements: ['Fire elements', 'Red colors', 'Triangular shapes', 'Lighting'],
    trigram: 'Li (Fire)'
  },
  {
    name: 'Relationships',
    nameChinese: '關係',
    direction: 'Southwest',
    element: 'Earth',
    color: ['Pink', 'Red', 'White'],
    lifeAspect: 'Love and Relationships',
    description: 'Represents romantic relationships, marriage, and partnerships',
    enhancements: ['Pairs of objects', 'Pink or red colors', 'Earth tones', 'Round shapes'],
    trigram: 'Kun (Earth)'
  },
  {
    name: 'Creativity',
    nameChinese: '創造力',
    direction: 'West',
    element: 'Metal',
    color: ['White', 'Silver', 'Gold', 'Gray'],
    lifeAspect: 'Creativity and Children',
    description: 'Represents creativity, children, and artistic expression',
    enhancements: ['Metal objects', 'White or metallic colors', 'Round shapes', 'Artwork'],
    trigram: 'Dui (Lake)'
  },
  {
    name: 'Helpful People',
    nameChinese: '貴人',
    direction: 'Northwest',
    element: 'Metal',
    color: ['White', 'Silver', 'Gray'],
    lifeAspect: 'Travel and Helpful People',
    description: 'Represents mentors, helpful people, and travel opportunities',
    enhancements: ['Metal objects', 'White colors', 'Round shapes', 'Mentor symbols'],
    trigram: 'Qian (Heaven)'
  },
  {
    name: 'Health',
    nameChinese: '健康',
    direction: 'Center',
    element: 'Earth',
    color: ['Yellow', 'Beige', 'Terracotta'],
    lifeAspect: 'Health and Well-being',
    description: 'The center represents overall health and balance',
    enhancements: ['Keep center open', 'Earth tones', 'Balanced elements', 'No clutter'],
    trigram: 'Tai Ji (Center)'
  }
]

// Five Elements cycle relationships
const ELEMENT_GENERATING: Record<string, string[]> = {
  'Wood': ['Fire'], // Wood feeds Fire
  'Fire': ['Earth'], // Fire creates Earth (ash)
  'Earth': ['Metal'], // Earth contains Metal
  'Metal': ['Water'], // Metal conducts Water
  'Water': ['Wood'] // Water nourishes Wood
}

const ELEMENT_DESTRUCTIVE: Record<string, string[]> = {
  'Wood': ['Earth'], // Wood depletes Earth
  'Fire': ['Metal'], // Fire melts Metal
  'Earth': ['Water'], // Earth absorbs Water
  'Metal': ['Wood'], // Metal cuts Wood
  'Water': ['Fire'] // Water extinguishes Fire
}

const ELEMENT_COLORS: Record<string, string[]> = {
  'Wood': ['Green', 'Teal', 'Forest Green', 'Olive'],
  'Fire': ['Red', 'Orange', 'Pink', 'Coral'],
  'Earth': ['Yellow', 'Beige', 'Terracotta', 'Brown', 'Tan'],
  'Metal': ['White', 'Silver', 'Gold', 'Gray', 'Metallic'],
  'Water': ['Black', 'Dark Blue', 'Navy', 'Deep Purple']
}

const ELEMENT_MATERIALS: Record<string, string[]> = {
  'Wood': ['Wood furniture', 'Bamboo', 'Plants', 'Paper', 'Fabric'],
  'Fire': ['Candles', 'Lighting', 'Electronics', 'Red objects'],
  'Earth': ['Ceramics', 'Crystals', 'Stones', 'Clay', 'Terracotta'],
  'Metal': ['Metal objects', 'Coins', 'Jewelry', 'Mirrors', 'Metal frames'],
  'Water': ['Water features', 'Fountains', 'Aquariums', 'Mirrors', 'Glass']
}

const ELEMENT_OBJECTS: Record<string, string[]> = {
  'Wood': ['Plants', 'Wooden furniture', 'Bamboo', 'Green items'],
  'Fire': ['Candles', 'Lamps', 'Red decorations', 'Triangular shapes'],
  'Earth': ['Crystals', 'Stones', 'Ceramic items', 'Square shapes'],
  'Metal': ['Coins', 'Wind chimes', 'Metal art', 'Round shapes'],
  'Water': ['Fountains', 'Aquariums', 'Water features', 'Curved shapes']
}

/**
 * Calculate Kua number and analysis from user profile
 */
export function calculateKuaAnalysis(userProfile: UserProfile | null): KuaAnalysis | null {
  if (!userProfile || !userProfile.birthDate || userProfile.gender === undefined) {
    return null
  }

  try {
    const birthDate = new Date(userProfile.birthDate)
    const birthYear = birthDate.getFullYear()
    const isMale = userProfile.gender === 'male'
    
    const kuaResult = getKuaResult(birthYear, isMale)
    
    // Calculate unfavorable directions (opposite of favorable)
    const allDirections = ['North', 'South', 'East', 'West', 'Northeast', 'Northwest', 'Southeast', 'Southwest']
    const favorableDirs = Object.values(kuaResult.directions)
    const unfavorableDirections = allDirections.filter(dir => !favorableDirs.includes(dir))
    
    return {
      number: kuaResult.number,
      element: kuaResult.element,
      attributes: kuaResult.attributes,
      favorableDirections: kuaResult.directions,
      unfavorableDirections
    }
  } catch (error) {
    devLog.error('Error calculating Kua analysis:', error, 'fengShuiService')
    return null
  }
}

/**
 * Analyze Five Elements based on Kua element
 */
export function analyzeElements(kuaElement: string): ElementAnalysis {
  const generatingCycle = ELEMENT_GENERATING[kuaElement] || []
  const destructiveCycle = ELEMENT_DESTRUCTIVE[kuaElement] || []
  
  // Elements that support this element (reverse of generating)
  const supportingElements = Object.entries(ELEMENT_GENERATING)
    .filter(([_, generates]) => generates.includes(kuaElement))
    .map(([element]) => element)
  
  // Elements that are weakened by this element (reverse of destructive)
  const weakenedElements = Object.entries(ELEMENT_DESTRUCTIVE)
    .filter(([_, destroys]) => destroys.includes(kuaElement))
    .map(([element]) => element)
  
  const balancingRecommendations: string[] = []
  
  // Add supporting elements to balance
  if (supportingElements.length > 0) {
    balancingRecommendations.push(`Add ${supportingElements.join(' or ')} elements to support your ${kuaElement} nature`)
  }
  
  // Avoid destructive elements
  if (destructiveCycle.length > 0) {
    balancingRecommendations.push(`Minimize ${destructiveCycle.join(' and ')} elements which can weaken your energy`)
  }
  
  // Use generating elements for growth
  if (generatingCycle.length > 0) {
    balancingRecommendations.push(`Incorporate ${generatingCycle.join(' and ')} elements to enhance your ${kuaElement} energy`)
  }
  
  return {
    primaryElement: kuaElement,
    elementDescription: getElementDescription(kuaElement),
    generatingCycle,
    destructiveCycle,
    balancingRecommendations,
    colors: ELEMENT_COLORS[kuaElement] || [],
    materials: ELEMENT_MATERIALS[kuaElement] || [],
    objects: ELEMENT_OBJECTS[kuaElement] || []
  }
}

function getElementDescription(element: string): string {
  const descriptions: Record<string, string> = {
    'Wood': 'Represents growth, flexibility, creativity, and expansion. Associated with spring, new beginnings, and upward movement.',
    'Fire': 'Represents passion, energy, transformation, and leadership. Associated with summer, brightness, and dynamic action.',
    'Earth': 'Represents stability, nurturing, practicality, and grounding. Associated with late summer, center, and balance.',
    'Metal': 'Represents precision, strength, discipline, and clarity. Associated with autumn, structure, and refinement.',
    'Water': 'Represents wisdom, flow, adaptability, and depth. Associated with winter, mystery, and downward movement.'
  }
  return descriptions[element] || 'Element of balance and harmony.'
}

/**
 * Get Bagua area by direction
 */
export function getBaguaAreaByDirection(direction: string): BaguaArea | null {
  return BAGUA_AREAS.find(area => area.direction === direction) || null
}

/**
 * Get all Bagua areas
 */
export function getAllBaguaAreas(): BaguaArea[] {
  return BAGUA_AREAS
}

/**
 * Generate complete Feng Shui analysis
 */
export function generateFengShuiAnalysis(userProfile: UserProfile | null): FengShuiAnalysis | null {
  const kua = calculateKuaAnalysis(userProfile)
  if (!kua) {
    return null
  }
  
  const elementAnalysis = analyzeElements(kua.element)
  const favorableDirections = Object.values(kua.favorableDirections)
  
  return {
    kua,
    bagua: BAGUA_AREAS,
    elementAnalysis,
    favorableDirections,
    unfavorableDirections: kua.unfavorableDirections
  }
}

/**
 * Get directions to avoid based on Kua
 */
export function getUnfavorableDirections(kuaNumber: number): string[] {
  const kuaDirections = getKuaResult(2000, true) // Dummy year, we only need structure
  const allDirections = ['North', 'South', 'East', 'West', 'Northeast', 'Northwest', 'Southeast', 'Southwest']
  // This is a simplified version - actual unfavorable directions depend on Kua group
  return allDirections
}

