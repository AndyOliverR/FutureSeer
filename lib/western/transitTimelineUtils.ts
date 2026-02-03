// Transit Timeline Utilities
// Formats and organizes transits for timeline visualization

export interface TimelineTransit {
  id: string
  planetName: string
  planetGlyph: string
  aspectType: string
  targetPlanet: string
  date: Date
  duration?: {
    start: Date
    end: Date
  }
  influence: 'harmonious' | 'challenging' | 'neutral'
  description: string
  impact: string[]
  strength: number // 0-1
}

interface Transit {
  name: string
  longitude: number
  sign?: string | { signName: string }
  house?: number
}

// Get planet glyph
function getPlanetGlyph(planetName: string): string {
  const glyphs: Record<string, string> = {
    'Sun': '☉',
    'Moon': '☽',
    'Mercury': '☿',
    'Venus': '♀',
    'Mars': '♂',
    'Jupiter': '♃',
    'Saturn': '♄',
    'Uranus': '♅',
    'Neptune': '♆',
    'Pluto': '♇'
  }
  return glyphs[planetName] || '●'
}

// Get aspect influence
function getAspectInfluence(aspectType: string): 'harmonious' | 'challenging' | 'neutral' {
  const aspectTypeLower = aspectType.toLowerCase()
  
  if (['trine', 'sextile'].includes(aspectTypeLower)) {
    return 'harmonious'
  } else if (['square', 'opposition'].includes(aspectTypeLower)) {
    return 'challenging'
  } else {
    return 'neutral'
  }
}

// Calculate aspect between two planets
function calculateAspect(long1: number, long2: number): { type: string; orb: number } | null {
  const diff = Math.abs(long1 - long2)
  const angle = diff > 180 ? 360 - diff : diff
  
  const aspects = [
    { name: 'Conjunction', angle: 0, orb: 8 },
    { name: 'Sextile', angle: 60, orb: 6 },
    { name: 'Square', angle: 90, orb: 7 },
    { name: 'Trine', angle: 120, orb: 8 },
    { name: 'Opposition', angle: 180, orb: 8 }
  ]
  
  for (const aspect of aspects) {
    const orb = Math.abs(angle - aspect.angle)
    if (orb <= aspect.orb) {
      return { type: aspect.name, orb }
    }
  }
  
  return null
}

// Generate transit description
function generateTransitDescription(
  transitPlanet: string,
  aspectType: string,
  natalPlanet: string,
  influence: 'harmonious' | 'challenging' | 'neutral'
): string {
  const descriptions: Record<string, Record<string, string>> = {
    harmonious: {
      'Sun': `Favorable energy and vitality boost through ${transitPlanet}`,
      'Moon': `Emotional harmony and intuitive clarity from ${transitPlanet}`,
      'Mercury': `Clear communication and mental agility via ${transitPlanet}`,
      'Venus': `Increased charm, love, and beauty through ${transitPlanet}`,
      'Mars': `Confident action and productive energy from ${transitPlanet}`,
      'Jupiter': `Expansion and opportunities brought by ${transitPlanet}`,
      'Saturn': `Structured growth and lasting achievements via ${transitPlanet}`,
      'Uranus': `Exciting innovations and breakthroughs from ${transitPlanet}`,
      'Neptune': `Spiritual inspiration and creative flow through ${transitPlanet}`,
      'Pluto': `Transformative power and deep renewal from ${transitPlanet}`
    },
    challenging: {
      'Sun': `Tension in self-expression requiring adjustment with ${transitPlanet}`,
      'Moon': `Emotional challenges and growth opportunities via ${transitPlanet}`,
      'Mercury': `Communication obstacles to overcome with ${transitPlanet}`,
      'Venus': `Relationship or value adjustments needed through ${transitPlanet}`,
      'Mars': `Dynamic tension driving action and change via ${transitPlanet}`,
      'Jupiter': `Over-expansion requiring moderation with ${transitPlanet}`,
      'Saturn': `Important lessons and structural changes from ${transitPlanet}`,
      'Uranus': `Disruptive changes bringing liberation via ${transitPlanet}`,
      'Neptune': `Confusion clearing into spiritual wisdom through ${transitPlanet}`,
      'Pluto': `Profound transformation and rebirth via ${transitPlanet}`
    },
    neutral: {
      'Sun': `Subtle shift in vitality and self-expression via ${transitPlanet}`,
      'Moon': `Minor emotional adjustment period with ${transitPlanet}`,
      'Mercury': `Mental recalibration and new perspectives from ${transitPlanet}`,
      'Venus': `Refinement of values and relationships through ${transitPlanet}`,
      'Mars': `Energy redirection and new initiatives with ${transitPlanet}`,
      'Jupiter': `Philosophical growth and expansion via ${transitPlanet}`,
      'Saturn': `Maturation and responsibility shift through ${transitPlanet}`,
      'Uranus': `Awakening to new possibilities from ${transitPlanet}`,
      'Neptune': `Spiritual sensitivity and intuition via ${transitPlanet}`,
      'Pluto': `Deep psychological evolution through ${transitPlanet}`
    }
  }
  
  return descriptions[influence]?.[natalPlanet] || 
    `${transitPlanet} ${aspectType} ${natalPlanet} - significant astrological influence`
}

// Generate impact areas
function generateImpactAreas(planetName: string): string[] {
  const impacts: Record<string, string[]> = {
    'Sun': ['Identity', 'Vitality', 'Purpose', 'Leadership'],
    'Moon': ['Emotions', 'Instincts', 'Home', 'Family'],
    'Mercury': ['Communication', 'Learning', 'Travel', 'Thinking'],
    'Venus': ['Love', 'Beauty', 'Values', 'Relationships'],
    'Mars': ['Action', 'Energy', 'Courage', 'Desire'],
    'Jupiter': ['Growth', 'Wisdom', 'Abundance', 'Faith'],
    'Saturn': ['Structure', 'Discipline', 'Career', 'Responsibility'],
    'Uranus': ['Innovation', 'Freedom', 'Change', 'Awakening'],
    'Neptune': ['Spirituality', 'Dreams', 'Intuition', 'Compassion'],
    'Pluto': ['Transformation', 'Power', 'Rebirth', 'Deep Psychology']
  }
  
  return impacts[planetName] || ['Personal Growth']
}

// Create timeline transits from transit and natal planets
export function createTimelineTransits(
  transitPlanets: Transit[],
  natalPlanets: Transit[],
  referenceDate: Date = new Date()
): TimelineTransit[] {
  const timelineTransits: TimelineTransit[] = []
  
  // Calculate aspects between each transit planet and natal planets
  for (const transit of transitPlanets) {
    for (const natal of natalPlanets) {
      const aspect = calculateAspect(transit.longitude, natal.longitude)
      
      if (aspect) {
        const influence = getAspectInfluence(aspect.type)
        const strength = 1 - (aspect.orb / 8) // Closer aspect = stronger
        
        timelineTransits.push({
          id: `${transit.name}-${aspect.type}-${natal.name}`,
          planetName: transit.name,
          planetGlyph: getPlanetGlyph(transit.name),
          aspectType: aspect.type,
          targetPlanet: natal.name,
          date: referenceDate,
          influence,
          description: generateTransitDescription(transit.name, aspect.type, natal.name, influence),
          impact: generateImpactAreas(natal.name),
          strength
        })
      }
    }
  }
  
  // Sort by strength (most significant first)
  return timelineTransits.sort((a, b) => b.strength - a.strength)
}

// Filter transits by time period
export function filterTransitsByPeriod(
  transits: TimelineTransit[],
  period: 'past-30' | 'past-7' | 'today' | 'future-7' | 'future-30'
): TimelineTransit[] {
  const now = new Date()
  const dayMs = 24 * 60 * 60 * 1000
  
  const ranges: Record<typeof period, { start: Date; end: Date }> = {
    'past-30': {
      start: new Date(now.getTime() - 30 * dayMs),
      end: now
    },
    'past-7': {
      start: new Date(now.getTime() - 7 * dayMs),
      end: now
    },
    'today': {
      start: new Date(now.setHours(0, 0, 0, 0)),
      end: new Date(now.setHours(23, 59, 59, 999))
    },
    'future-7': {
      start: now,
      end: new Date(now.getTime() + 7 * dayMs)
    },
    'future-30': {
      start: now,
      end: new Date(now.getTime() + 30 * dayMs)
    }
  }
  
  const range = ranges[period]
  return transits.filter(t => t.date >= range.start && t.date <= range.end)
}

// Get major transits only (strength >= 0.7)
export function getMajorTransits(transits: TimelineTransit[]): TimelineTransit[] {
  return transits.filter(t => t.strength >= 0.7)
}

// Group transits by planet
export function groupTransitsByPlanet(transits: TimelineTransit[]): Record<string, TimelineTransit[]> {
  const grouped: Record<string, TimelineTransit[]> = {}
  
  for (const transit of transits) {
    if (!grouped[transit.planetName]) {
      grouped[transit.planetName] = []
    }
    grouped[transit.planetName].push(transit)
  }
  
  return grouped
}

// Format date for display
export function formatTransitDate(date: Date): string {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  
  if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Tomorrow'
  } else if (diffDays === -1) {
    return 'Yesterday'
  } else if (diffDays > 0 && diffDays <= 7) {
    return `In ${diffDays} days`
  } else if (diffDays < 0 && diffDays >= -7) {
    return `${Math.abs(diffDays)} days ago`
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }
}
