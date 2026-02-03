// TRICHAKRA REMEDY GENERATOR
// Organizes remedies into three chakras: Body, Mind, and Soul
// Integrates remedies from Astrology, Numerology, Vastu, and Lal Kitab

export interface TrichakraRemedy {
  id: string
  chakra: 'body' | 'mind' | 'soul'
  system: 'astrology' | 'numerology' | 'vastu' | 'lal-kitab'
  title: string
  description: string
  instructions: string[]
  priority: 'critical' | 'high' | 'medium' | 'low'
  timing?: string
  duration?: string
  frequency?: string
  cost?: 'free' | 'low' | 'medium' | 'high'
  materials?: string[]
  benefits: string[]
  sourcePlanet?: string
  sourceNumber?: number
  sourceDirection?: string
}

// Categorize remedy into chakra based on its nature
export function categorizeRemedyByChakra(
  remedy: any,
  system: 'astrology' | 'numerology' | 'vastu' | 'lal-kitab'
): 'body' | 'mind' | 'soul' {
  const title = remedy.title?.toLowerCase() || ''
  const description = remedy.description?.toLowerCase() || ''
  const instructions = (remedy.instructions || []).join(' ').toLowerCase()
  const combined = `${title} ${description} ${instructions}`

  // Body level indicators (physical actions, materials, gemstones, colors)
  const bodyKeywords = [
    'gemstone', 'wear', 'color', 'cloth', 'donate', 'feed', 'throw', 'place',
    'keep', 'material', 'physical', 'diet', 'food', 'bath', 'oil', 'coin',
    'item', 'object', 'structural', 'directional', 'room', 'space', 'placement'
  ]

  // Mind level indicators (mental practices, mantras, meditation, affirmations)
  const mindKeywords = [
    'mantra', 'chant', 'meditation', 'prayer', 'affirmation', 'visualization',
    'mental', 'mind', 'thought', 'intention', 'focus', 'concentration', 'breath',
    'yoga', 'mindfulness', 'awareness', 'positive', 'gratitude', 'journaling'
  ]

  // Soul level indicators (deep rituals, transformative work, spiritual practices)
  const soulKeywords = [
    'ritual', 'puja', 'ceremony', 'spiritual', 'karma', 'dharma', 'soul',
    'transformative', 'deep', 'sacred', 'divine', 'worship', 'devotion',
    'service', 'charity', 'selfless', 'enlightenment', 'liberation', 'moksha'
  ]

  // Count matches
  const bodyMatches = bodyKeywords.filter(kw => combined.includes(kw)).length
  const mindMatches = mindKeywords.filter(kw => combined.includes(kw)).length
  const soulMatches = soulKeywords.filter(kw => combined.includes(kw)).length

  // Determine chakra based on highest matches
  if (soulMatches > mindMatches && soulMatches > bodyMatches) {
    return 'soul'
  } else if (mindMatches > bodyMatches) {
    return 'mind'
  } else {
    return 'body'
  }
}

// Convert astrological remedy to Trichakra format
export function convertAstrologicalRemedy(
  remedy: any,
  sourcePlanet?: string
): TrichakraRemedy {
  const chakra = categorizeRemedyByChakra(remedy, 'astrology')
  
  return {
    id: `astro_${remedy.id || Date.now()}`,
    chakra,
    system: 'astrology',
    title: remedy.title || 'Astrological Remedy',
    description: remedy.description || '',
    instructions: remedy.instructions || [],
    priority: remedy.priority || 'medium',
    timing: remedy.activationTime || remedy.timing,
    duration: remedy.duration,
    frequency: remedy.frequency,
    cost: remedy.cost || 'medium',
    materials: remedy.materials,
    benefits: remedy.benefits || [],
    sourcePlanet
  }
}

// Convert numerology remedy to Trichakra format
export function convertNumerologyRemedy(
  remedy: any,
  sourceNumber?: number
): TrichakraRemedy {
  const chakra = categorizeRemedyByChakra(remedy, 'numerology')
  
  return {
    id: `num_${remedy.id || Date.now()}`,
    chakra,
    system: 'numerology',
    title: remedy.title || 'Numerology Remedy',
    description: remedy.description || '',
    instructions: remedy.instructions || [],
    priority: remedy.priority || 'medium',
    timing: remedy.timing,
    duration: remedy.duration,
    frequency: remedy.frequency,
    cost: remedy.cost || 'low',
    materials: remedy.materials,
    benefits: remedy.benefits || [],
    sourceNumber
  }
}

// Convert Vastu remedy to Trichakra format
export function convertVastuRemedy(
  remedy: any,
  sourceDirection?: string
): TrichakraRemedy {
  const chakra = categorizeRemedyByChakra(remedy, 'vastu')
  
  return {
    id: `vastu_${remedy.id || Date.now()}`,
    chakra,
    system: 'vastu',
    title: remedy.title || 'Vastu Remedy',
    description: remedy.description || '',
    instructions: remedy.instructions || [],
    priority: remedy.priority || 'medium',
    timing: remedy.timing,
    duration: remedy.duration,
    frequency: remedy.frequency,
    cost: remedy.cost || 'low',
    materials: remedy.materials,
    benefits: remedy.benefits || [],
    sourceDirection
  }
}

// Convert Lal Kitab remedy to Trichakra format
export function convertLalKitabRemedy(
  remedy: any
): TrichakraRemedy {
  const chakra = categorizeRemedyByChakra(remedy, 'lal-kitab')
  
  return {
    id: `lal_${remedy.id || Date.now()}`,
    chakra,
    system: 'lal-kitab',
    title: remedy.title || 'Lal Kitab Remedy',
    description: remedy.description || '',
    instructions: remedy.instructions || [],
    priority: remedy.priority || 'medium',
    timing: remedy.timing?.day ? `${remedy.timing.day} ${remedy.timing.time || ''}`.trim() : undefined,
    duration: remedy.duration,
    frequency: remedy.timing?.frequency || remedy.frequency,
    cost: remedy.cost || 'low',
    materials: remedy.materials,
    benefits: remedy.benefits || [],
    sourcePlanet: remedy.planet
  }
}

// Organize remedies by chakra
export function organizeRemediesByChakra(
  remedies: TrichakraRemedy[]
): {
  body: TrichakraRemedy[]
  mind: TrichakraRemedy[]
  soul: TrichakraRemedy[]
} {
  return {
    body: remedies.filter(r => r.chakra === 'body'),
    mind: remedies.filter(r => r.chakra === 'mind'),
    soul: remedies.filter(r => r.chakra === 'soul')
  }
}

// Generate prioritized action plan
export function generateActionPlan(
  organizedRemedies: {
    body: TrichakraRemedy[]
    mind: TrichakraRemedy[]
    soul: TrichakraRemedy[]
  }
): {
  immediate: TrichakraRemedy[]
  shortTerm: TrichakraRemedy[]
  longTerm: TrichakraRemedy[]
  allRemedies: TrichakraRemedy[]
} {
  const allRemedies = [
    ...organizedRemedies.body,
    ...organizedRemedies.mind,
    ...organizedRemedies.soul
  ]

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  allRemedies.sort((a, b) => {
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  // Categorize by timeline
  const immediate = allRemedies.filter(r => 
    r.priority === 'critical' || r.priority === 'high'
  ).slice(0, 5)

  const shortTerm = allRemedies.filter(r => 
    r.priority === 'high' || r.priority === 'medium'
  ).slice(0, 8)

  const longTerm = allRemedies.filter(r => 
    r.priority === 'medium' || r.priority === 'low'
  )

  return {
    immediate,
    shortTerm,
    longTerm,
    allRemedies
  }
}

// Find complementary remedies (remedies that work well together)
export function findComplementaryRemedies(
  remedy: TrichakraRemedy,
  allRemedies: TrichakraRemedy[]
): TrichakraRemedy[] {
  const complementary: TrichakraRemedy[] = []

  // If it's a gemstone remedy, find matching mantra
  if (remedy.title.toLowerCase().includes('gemstone') && remedy.sourcePlanet) {
    const mantra = allRemedies.find(r => 
      r.system === 'astrology' &&
      r.title.toLowerCase().includes('mantra') &&
      r.sourcePlanet === remedy.sourcePlanet
    )
    if (mantra) complementary.push(mantra)
  }

  // If it's a planet-based remedy, find Lal Kitab remedy for same planet
  if (remedy.sourcePlanet) {
    const lalKitab = allRemedies.find(r => 
      r.system === 'lal-kitab' &&
      r.sourcePlanet === remedy.sourcePlanet
    )
    if (lalKitab) complementary.push(lalKitab)
  }

  // If it's a number-based remedy, find color remedy for same number
  if (remedy.sourceNumber) {
    const color = allRemedies.find(r => 
      r.system === 'numerology' &&
      r.title.toLowerCase().includes('color') &&
      r.sourceNumber === remedy.sourceNumber
    )
    if (color) complementary.push(color)
  }

  return complementary
}

// Check for conflicting remedies
export function checkConflictingRemedies(
  remedy1: TrichakraRemedy,
  remedy2: TrichakraRemedy
): boolean {
  // Check if remedies are from conflicting systems
  if (remedy1.system === 'vastu' && remedy2.system === 'vastu') {
    // Check for conflicting directions
    if (remedy1.sourceDirection && remedy2.sourceDirection) {
      const conflictingDirections: Record<string, string[]> = {
        'north': ['south'],
        'south': ['north'],
        'east': ['west'],
        'west': ['east'],
        'northeast': ['southwest'],
        'southwest': ['northeast'],
        'northwest': ['southeast'],
        'southeast': ['northwest']
      }
      const conflicts = conflictingDirections[remedy1.sourceDirection.toLowerCase()]
      if (conflicts?.includes(remedy2.sourceDirection.toLowerCase())) {
        return true
      }
    }
  }

  // Check for conflicting planets (if applicable)
  if (remedy1.sourcePlanet && remedy2.sourcePlanet) {
    // Some planets are naturally conflicting (e.g., Sun and Moon)
    const conflictingPlanets: Record<string, string[]> = {
      'sun': ['moon'],
      'moon': ['sun'],
      'mars': ['venus'],
      'venus': ['mars']
    }
    const conflicts = conflictingPlanets[remedy1.sourcePlanet.toLowerCase()]
    if (conflicts?.includes(remedy2.sourcePlanet.toLowerCase())) {
      return true
    }
  }

  return false
}
