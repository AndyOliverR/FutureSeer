/**
 * Feng Shui Intelligence Service
 * Generates comprehensive Feng Shui readings and recommendations
 */

import { UserProfile } from '@/lib/firebase'
import {
  buildPersonalizedWealthLines,
  buildPracticalChecklistForReading,
} from '@/lib/fengshui/practicalGuides'
import { generateFengShuiAnalysis, FengShuiAnalysis, getBaguaAreaByDirection } from './fengShuiService'

export interface RoomGuidance {
  room: string
  description: string
  idealDirection: string
  commandingPosition: string
  colors: string[]
  furniturePlacement: string[]
  elementRecommendations: string[]
  avoid: string[]
  enhancements: string[]
  energyScore: number
  status: 'optimal' | 'good' | 'warning' | 'needs-attention'
}

export interface FengShuiCure {
  name: string
  type: 'mirror' | 'plant' | 'water' | 'crystal' | 'color' | 'lighting' | 'object' | 'arrangement'
  description: string
  purpose: string
  placement: string
  instructions: string[]
  benefits: string[]
}

export interface FengShuiReading {
  overview: string
  kuaSummary: string
  elementSummary: string
  roomGuidance: RoomGuidance[]
  cures: FengShuiCure[]
  baguaRecommendations: Record<string, string[]>
  generalRecommendations: string[]
  timingAdvice: string[]
  /** Personalized wealth-sector and Kua-aligned hints (no guarantees). */
  wealthTips: string[]
  /** Actionable home checklist derived from practical guides + analysis. */
  practicalChecklist: string[]
}

const CACHE_VERSION = '1.0'

/**
 * Generate comprehensive Feng Shui reading
 */
export async function generateFengShuiReading(
  userProfile: UserProfile | null,
  analysis: FengShuiAnalysis | null
): Promise<FengShuiReading> {
  if (!userProfile || !analysis) {
    return getDefaultReading()
  }

  const kua = analysis.kua
  const elementAnalysis = analysis.elementAnalysis

  // Generate overview
  const overview = generateOverview(userProfile, kua, elementAnalysis)
  
  // Generate Kua summary
  const kuaSummary = generateKuaSummary(kua)
  
  // Generate element summary
  const elementSummary = generateElementSummary(elementAnalysis)
  
  // Generate room guidance
  const roomGuidance = generateRoomGuidance(analysis)
  
  // Generate cures
  const cures = generateCures(analysis)
  
  // Generate Bagua recommendations
  const baguaRecommendations = generateBaguaRecommendations(analysis)
  
  // Generate general recommendations
  const generalRecommendations = generateGeneralRecommendations(analysis)
  
  // Generate timing advice
  const timingAdvice = generateTimingAdvice()

  const wealthTips = buildPersonalizedWealthLines(analysis)
  const practicalChecklist = buildPracticalChecklistForReading(analysis)

  return {
    overview,
    kuaSummary,
    elementSummary,
    roomGuidance,
    cures,
    baguaRecommendations,
    generalRecommendations,
    timingAdvice,
    wealthTips,
    practicalChecklist,
  }
}

function generateOverview(
  userProfile: UserProfile | null,
  kua: any,
  elementAnalysis: any
): string {
  return `Your Feng Shui analysis reveals a ${kua.element} element nature with Kua number ${kua.number}. This indicates ${kua.attributes.toLowerCase()}. Your favorable directions for success, health, relationships, and wisdom are ${Object.values(kua.favorableDirections).join(', ')}. By aligning your space with these directions and balancing the ${kua.element} element, you can enhance the flow of Qi (energy) in your environment and support your life goals.`
}

function generateKuaSummary(kua: any): string {
  return `Your Kua number ${kua.number} (${kua.element} element) reveals your personal energy pattern. Your most favorable directions are: Success (${kua.favorableDirections.success}), Health (${kua.favorableDirections.health}), Relationships (${kua.favorableDirections.relationships}), and Wisdom (${kua.favorableDirections.wisdom}). Avoid facing or sleeping with your head toward: ${kua.unfavorableDirections.join(', ')}.`
}

function generateElementSummary(elementAnalysis: any): string {
  return `As a ${elementAnalysis.primaryElement} element person, you naturally embody ${elementAnalysis.elementDescription.toLowerCase()}. To balance your energy, incorporate ${elementAnalysis.generatingCycle.join(' and ')} elements which enhance your ${elementAnalysis.primaryElement} nature. Use colors like ${elementAnalysis.colors.slice(0, 3).join(', ')} and materials such as ${elementAnalysis.materials.slice(0, 2).join(' and ')} to strengthen your elemental harmony.`
}

function generateRoomGuidance(analysis: FengShuiAnalysis): RoomGuidance[] {
  const kua = analysis.kua
  const rooms: RoomGuidance[] = []

  // Bedroom
  rooms.push({
    room: 'Bedroom',
    description: 'The bedroom is crucial for rest, relationships, and rejuvenation',
    idealDirection: kua.favorableDirections.relationships || 'Southwest',
    commandingPosition: `Position bed so you can see the door without being directly in line with it. Headboard should face ${kua.favorableDirections.health || 'East'}.`,
    colors: ['Pink', 'Red', 'White', 'Beige'],
    furniturePlacement: [
      'Place bed against solid wall for support',
      'Avoid bed directly facing door',
      'Keep nightstands balanced on both sides',
      'No mirrors facing the bed',
      'Store items under bed only if necessary (avoid sharp objects)'
    ],
    elementRecommendations: [
      'Use pairs of objects for relationships',
      'Incorporate Earth elements (Southwest)',
      'Add soft lighting for relaxation'
    ],
    avoid: [
      'Clutter under the bed',
      'Sharp corners pointing at bed',
      'Electronics near bed',
      'Water features in bedroom',
      'Overhead beams above bed'
    ],
    enhancements: [
      'Solid headboard for support',
      'Balanced lighting',
      'Calming colors',
      'Keep door closed at night'
    ],
    energyScore: 85,
    status: 'good'
  })

  // Kitchen
  rooms.push({
    room: 'Kitchen',
    description: 'Kitchen represents wealth and nourishment',
    idealDirection: 'Southeast (Wealth area)',
    commandingPosition: 'Cook should be able to see the door while cooking. Stove should not face water elements directly.',
    colors: ['Red', 'Orange', 'Yellow', 'White'],
    furniturePlacement: [
      'Stove should face favorable direction (avoid facing sink directly)',
      'Keep stove clean and in working order',
      'Store knives out of sight',
      'Keep refrigerator door closed',
      'Organize pantry for abundance energy'
    ],
    elementRecommendations: [
      'Balance Fire (stove) and Water (sink) elements',
      'Use red accents for prosperity',
      'Keep kitchen well-lit and clean'
    ],
    avoid: [
      'Stove directly facing sink (Fire vs Water conflict)',
      'Clutter and expired food',
      'Broken appliances',
      'Sharp knives visible',
      'Dirty dishes left out'
    ],
    enhancements: [
      'Fresh fruits and vegetables visible',
      'Red accents for wealth',
      'Good lighting',
      'Clean and organized space'
    ],
    energyScore: 80,
    status: 'good'
  })

  // Office/Study
  rooms.push({
    room: 'Office/Study',
    description: 'Office represents career and knowledge',
    idealDirection: kua.favorableDirections.success || 'North',
    commandingPosition: `Desk should face ${kua.favorableDirections.success || 'North'} with solid wall behind you. You should see the door without being directly in line with it.`,
    colors: ['Black', 'Dark Blue', 'Navy', 'White'],
    furniturePlacement: [
      `Desk facing ${kua.favorableDirections.success || 'North'} (Career direction)`,
      'Solid wall behind chair for support',
      'Keep desk organized and clutter-free',
      'Place important items in North area',
      'Avoid sitting with back to door'
    ],
    elementRecommendations: [
      'Water elements for career flow',
      'Metal elements for clarity and precision',
      'Blue or black accents'
    ],
    avoid: [
      'Sitting with back to door',
      'Clutter and disorganization',
      'Sharp objects pointing at desk',
      'Dead plants',
      'Broken items'
    ],
    enhancements: [
      'Water feature or image in North',
      'Career symbols (awards, certificates)',
      'Good lighting for productivity',
      'Plants for fresh energy'
    ],
    energyScore: 75,
    status: 'warning'
  })

  // Bathroom
  rooms.push({
    room: 'Bathroom',
    description: 'Bathroom can drain energy if not properly managed',
    idealDirection: 'Avoid center and main areas',
    commandingPosition: 'Keep toilet seat down and door closed. Bathroom should not be visible from main living areas.',
    colors: ['White', 'Light colors', 'Blue'],
    furniturePlacement: [
      'Keep bathroom door closed',
      'Toilet seat always down',
      'Keep drains covered when not in use',
      'Organize toiletries',
      'Good ventilation'
    ],
    elementRecommendations: [
      'Water elements (naturally present)',
      'Metal elements for cleanliness',
      'White colors for purity'
    ],
    avoid: [
      'Bathroom in center of home',
      'Bathroom door facing main entrance',
      'Leaks and water damage',
      'Clutter and mess',
      'Bathroom visible from bedroom or kitchen'
    ],
    enhancements: [
      'Keep door closed',
      'Good lighting',
      'Plants to absorb excess moisture',
      'Mirrors to reflect and expand space',
      'Clean and fresh environment'
    ],
    energyScore: 70,
    status: 'needs-attention'
  })

  // Living Room
  rooms.push({
    room: 'Living Room',
    description: 'Living room represents social connections and family harmony',
    idealDirection: 'Center and various areas',
    commandingPosition: 'Main seating should allow view of entrance. Furniture arranged to facilitate conversation flow.',
    colors: ['Green', 'Beige', 'Warm colors'],
    furniturePlacement: [
      'Seating arranged in conversation-friendly layout',
      'Main sofa against solid wall',
      'Coffee table at comfortable height',
      'Avoid blocking pathways',
      'Balance furniture sizes'
    ],
    elementRecommendations: [
      'Wood elements for growth and family',
      'Earth elements for stability',
      'Warm, inviting colors'
    ],
    avoid: [
      'Furniture blocking doorways',
      'Sharp corners pointing at seating',
      'Clutter and unused items',
      'Dead plants',
      'Broken or damaged furniture'
    ],
    enhancements: [
      'Healthy plants for Wood element',
      'Family photos in East area',
      'Comfortable, inviting atmosphere',
      'Good lighting for gatherings',
      'Round or curved shapes for harmony'
    ],
    energyScore: 82,
    status: 'good'
  })

  // Entry/Foyer
  rooms.push({
    room: 'Entry/Foyer',
    description: 'Entry represents first impressions and opportunities',
    idealDirection: 'Main entrance',
    commandingPosition: 'Entry should be welcoming, uncluttered, and well-lit. Door should open fully without obstruction.',
    colors: ['Bright colors', 'White', 'Light colors'],
    furniturePlacement: [
      'Keep entry clear and uncluttered',
      'Door opens fully (90+ degrees)',
      'Good lighting',
      'Welcome mat',
      'Organized storage for shoes/coats'
    ],
    elementRecommendations: [
      'Bright, welcoming energy',
      'Light colors to invite positive Qi',
      'Plants for fresh energy'
    ],
    avoid: [
      'Clutter blocking entrance',
      'Door that doesn\'t open fully',
      'Dark or dim entryway',
      'Broken items visible',
      'Mirror directly facing door (bounces energy out)'
    ],
    enhancements: [
      'Bright lighting',
      'Welcome mat',
      'Plants or flowers',
      'Clean and organized',
      'Artwork that uplifts'
    ],
    energyScore: 78,
    status: 'good'
  })

  return rooms
}

function generateCures(analysis: FengShuiAnalysis): FengShuiCure[] {
  const cures: FengShuiCure[] = []
  const kua = analysis.kua
  const elementAnalysis = analysis.elementAnalysis

  // Mirror cures
  cures.push({
    name: 'Bagua Mirror',
    type: 'mirror',
    description: 'Convex mirror used to deflect negative energy',
    purpose: 'Protect from negative energy, expand space, redirect Qi',
    placement: 'Outside front door (facing out), or inside to expand small spaces',
    instructions: [
      'Place convex mirror outside main entrance facing outward',
      'Use concave mirror inside to absorb negative energy',
      'Avoid mirrors directly facing bed or main door',
      'Use mirrors to reflect beautiful views'
    ],
    benefits: ['Protection from negative energy', 'Expands small spaces', 'Redirects Qi flow', 'Enhances light']
  })

  // Plant cures
  cures.push({
    name: 'Living Plants',
    type: 'plant',
    description: 'Healthy plants bring Wood element energy and life force',
    purpose: 'Enhance Wood element, purify air, bring growth energy',
    placement: `East (Family), Southeast (Wealth), or areas needing growth energy`,
    instructions: [
      'Use healthy, thriving plants (avoid dead or dying plants)',
      'Place in East or Southeast areas',
      'Use plants with rounded leaves (avoid sharp, spiky plants)',
      'Keep plants well-maintained',
      'Remove dead leaves immediately'
    ],
    benefits: ['Brings growth energy', 'Purifies air', 'Enhances Wood element', 'Adds life force']
  })

  // Water cures
  cures.push({
    name: 'Water Features',
    type: 'water',
    description: 'Moving water brings wealth and career energy',
    purpose: 'Enhance career (North) and wealth (Southeast), activate Water element',
    placement: `North (Career) or Southeast (Wealth) areas`,
    instructions: [
      'Place in North area for career enhancement',
      'Place in Southeast for wealth activation',
      'Use flowing, moving water (fountains, aquariums)',
      'Keep water clean and fresh',
      'Water should flow toward center of home (not out)'
    ],
    benefits: ['Enhances career opportunities', 'Activates wealth energy', 'Brings flow and movement', 'Strengthens Water element']
  })

  // Crystal cures
  cures.push({
    name: 'Crystals',
    type: 'crystal',
    description: 'Crystals enhance Earth element and provide grounding energy',
    purpose: 'Balance elements, provide protection, enhance specific areas',
    placement: 'Center, Northeast (Knowledge), or areas needing Earth element',
    instructions: [
      'Clear quartz for clarity and amplification',
      'Amethyst for spiritual growth',
      'Citrine for wealth (Southeast)',
      'Rose quartz for relationships (Southwest)',
      'Place in areas needing specific energy'
    ],
    benefits: ['Grounding energy', 'Element balance', 'Protection', 'Amplifies intentions']
  })

  // Color cures
  cures.push({
    name: 'Color Therapy',
    type: 'color',
    description: `Use ${elementAnalysis.colors.join(', ')} colors to enhance your ${elementAnalysis.primaryElement} element`,
    purpose: 'Balance elements, activate areas, enhance specific life aspects',
    placement: 'Apply colors to walls, accessories, or decor in specific Bagua areas',
    instructions: [
      `Use ${elementAnalysis.colors.slice(0, 2).join(' and ')} for your ${elementAnalysis.primaryElement} element`,
      'Red in South (Fame) for recognition',
      'Purple in Southeast (Wealth) for abundance',
      'Blue/Black in North (Career) for opportunities',
      'Green in East (Family) for health and growth'
    ],
    benefits: ['Element balance', 'Area activation', 'Visual harmony', 'Energy enhancement']
  })

  // Lighting cures
  cures.push({
    name: 'Lighting Enhancement',
    type: 'lighting',
    description: 'Proper lighting enhances Qi flow and activates areas',
    purpose: 'Brighten dark areas, enhance Fire element, improve energy flow',
    placement: 'Dark corners, entryways, areas needing activation',
    instructions: [
      'Use bright lighting in entryway',
      'Add lighting to dark corners',
      'Use warm lighting in living areas',
      'Avoid harsh, direct lighting',
      'Balance natural and artificial light'
    ],
    benefits: ['Improves Qi flow', 'Activates dark areas', 'Enhances Fire element', 'Creates welcoming atmosphere']
  })

  // Object cures
  cures.push({
    name: 'Symbolic Objects',
    type: 'object',
    description: 'Specific objects enhance different life aspects',
    purpose: 'Activate Bagua areas, enhance specific intentions',
    placement: 'Place in corresponding Bagua areas',
    instructions: [
      'Wealth: Coins, money tree, wealth symbols in Southeast',
      'Career: Water features, career symbols in North',
      'Relationships: Pairs of objects, rose quartz in Southwest',
      'Knowledge: Books, crystals, learning symbols in Northeast',
      'Fame: Red items, lighting, recognition symbols in South'
    ],
    benefits: ['Area activation', 'Intention setting', 'Visual reminders', 'Energy enhancement']
  })

  return cures
}

function generateBaguaRecommendations(analysis: FengShuiAnalysis): Record<string, string[]> {
  const recommendations: Record<string, string[]> = {}
  const kua = analysis.kua

  analysis.bagua.forEach(area => {
    const areaRecommendations: string[] = []
    
    // Add element-specific recommendations
    areaRecommendations.push(`Use ${area.color.join(', ')} colors`)
    areaRecommendations.push(`Incorporate ${area.element} element objects`)
    
    // Add direction-specific recommendations
    if (kua.favorableDirections.success === area.direction) {
      areaRecommendations.push('This is your Success direction - activate with career symbols')
    }
    if (kua.favorableDirections.health === area.direction) {
      areaRecommendations.push('This is your Health direction - keep clean and organized')
    }
    if (kua.favorableDirections.relationships === area.direction) {
      areaRecommendations.push('This is your Relationships direction - use pairs of objects')
    }
    if (kua.favorableDirections.wisdom === area.direction) {
      areaRecommendations.push('This is your Wisdom direction - place books or learning items')
    }
    
    // Add general enhancements
    areaRecommendations.push(...area.enhancements)
    
    recommendations[area.name] = areaRecommendations
  })

  return recommendations
}

function generateGeneralRecommendations(analysis: FengShuiAnalysis): string[] {
  const recommendations: string[] = []
  const kua = analysis.kua

  recommendations.push(`Sleep with your head toward ${kua.favorableDirections.health} for better health and rest`)
  recommendations.push(`Face ${kua.favorableDirections.success} when working for career enhancement`)
  recommendations.push(`Place important items in your ${kua.favorableDirections.success} direction`)
  recommendations.push('Keep all areas clean and clutter-free to allow Qi to flow freely')
  recommendations.push('Ensure doors open fully (90+ degrees) to welcome opportunities')
  recommendations.push('Use commanding position for bed and desk (see door without being in direct line)')
  recommendations.push(`Incorporate ${analysis.elementAnalysis.colors.slice(0, 2).join(' and ')} colors to balance your ${analysis.elementAnalysis.primaryElement} element`)
  recommendations.push('Keep center of home open and uncluttered for overall balance')
  recommendations.push('Remove broken items, dead plants, and clutter immediately')
  recommendations.push('Balance all five elements throughout your space')

  return recommendations
}

function generateTimingAdvice(): string[] {
  return [
    'Spring (Wood): Best time for new beginnings, planting, and growth-oriented changes',
    'Summer (Fire): Ideal for activating fame area, lighting enhancements, and passion projects',
    'Late Summer (Earth): Perfect for stability, grounding, and center area work',
    'Autumn (Metal): Good for decluttering, organization, and precision work',
    'Winter (Water): Best for career planning, water features, and introspection',
    'Chinese New Year: Excellent time for major Feng Shui adjustments and space clearing',
    'Monthly: Clean and organize one Bagua area each month for continuous improvement'
  ]
}

function getDefaultReading(): FengShuiReading {
  return {
    overview: 'Complete your profile with birth date, gender, and birth place to receive personalized Feng Shui analysis.',
    kuaSummary: 'Kua number calculation requires birth year and gender information.',
    elementSummary: 'Element analysis requires complete profile information.',
    roomGuidance: [],
    cures: [],
    baguaRecommendations: {},
    generalRecommendations: [
      'Keep all areas clean and clutter-free',
      'Ensure doors open fully',
      'Use commanding position for furniture',
      'Balance the five elements',
      'Remove broken items and dead plants'
    ],
    timingAdvice: [],
    wealthTips: [],
    practicalChecklist: buildPracticalChecklistForReading(null),
  }
}

