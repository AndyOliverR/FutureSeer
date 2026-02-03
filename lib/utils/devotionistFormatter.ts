/**
 * Utility functions to transform dense text into Devotionist-style structured data
 * These functions help parse AI-generated interpretations into bullet points, 
 * key insights, and structured formats for visual display.
 */

export interface StructuredItem {
  text: string
  highlight?: boolean
  type?: 'positive' | 'neutral' | 'challenge'
}

export interface ParsedPlanetaryAnalysis {
  keyTraits: string[]
  strengths: StructuredItem[]
  challenges: StructuredItem[]
  summary: string
}

export interface KeyInsight {
  title: string
  description: string
  highlight?: boolean
}

export interface TimelineEvent {
  id: string
  date: string
  title: string
  description?: string
  type?: 'positive' | 'neutral' | 'challenge' | 'milestone'
  details?: string[]
}

/**
 * Truncate text at word boundary to avoid cutting words in the middle
 */
function truncateAtWordBoundary(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  
  // Find the last space before maxLength
  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  // If we found a space and it's not too far from the end, use it
  if (lastSpace > maxLength * 0.7) {
    return truncated.substring(0, lastSpace).trim()
  }
  
  // Otherwise, try to find the last sentence boundary
  const lastPeriod = truncated.lastIndexOf('.')
  const lastExclamation = truncated.lastIndexOf('!')
  const lastQuestion = truncated.lastIndexOf('?')
  const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion)
  
  if (lastSentenceEnd > maxLength * 0.6) {
    return truncated.substring(0, lastSentenceEnd + 1).trim()
  }
  
  // Fallback: just truncate at maxLength (shouldn't happen often)
  return truncated.trim()
}

/**
 * Parse planetary analysis text into structured format
 * Extracts key traits, strengths, challenges, and summary
 */
export function parsePlanetaryAnalysis(text: string): ParsedPlanetaryAnalysis {
  if (!text) {
    return {
      keyTraits: [],
      strengths: [],
      challenges: [],
      summary: ''
    }
  }

  const lines = text.split('\n').filter(line => line.trim())
  
  // Extract summary (first paragraph or sentences)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20)
  const summary = sentences.slice(0, 2).join('. ').trim() || text.substring(0, 200)

  // Look for common patterns
  const keyTraits: string[] = []
  const strengths: StructuredItem[] = []
  const challenges: StructuredItem[] = []

  // Extract bullet points and lists
  const bulletPattern = /[•\-\*]\s*(.+?)(?:\n|$)/g
  let match
  
  while ((match = bulletPattern.exec(text)) !== null) {
    const item = match[1].trim()
    const lowerItem = item.toLowerCase()
    
    // Classify items based on keywords
    if (lowerItem.includes('strength') || lowerItem.includes('gift') || 
        lowerItem.includes('ability') || lowerItem.includes('talent') ||
        lowerItem.includes('positive') || lowerItem.includes('benefit')) {
      strengths.push({ text: item, type: 'positive' })
    } else if (lowerItem.includes('challenge') || lowerItem.includes('difficulty') ||
               lowerItem.includes('struggle') || lowerItem.includes('tendency') ||
               lowerItem.includes('caution') || lowerItem.includes('warning')) {
      challenges.push({ text: item, type: 'challenge' })
    } else {
      keyTraits.push(item)
    }
  }

  // If no bullets found, try to extract from sentences
  if (keyTraits.length === 0 && strengths.length === 0 && challenges.length === 0) {
    // Split by common separators
    const parts = text.split(/[;:]/)
    parts.slice(0, 5).forEach(part => {
      const trimmed = part.trim()
      if (trimmed.length > 10 && trimmed.length < 150) {
        const lower = trimmed.toLowerCase()
        if (lower.includes('strength') || lower.includes('gift') || lower.includes('positive')) {
          strengths.push({ text: trimmed, type: 'positive' })
        } else if (lower.includes('challenge') || lower.includes('struggle') || lower.includes('difficulty')) {
          challenges.push({ text: trimmed, type: 'challenge' })
        } else {
          keyTraits.push(trimmed)
        }
      }
    })
  }

  // Limit arrays to prevent UI overload
  return {
    keyTraits: keyTraits.slice(0, 5),
    strengths: strengths.slice(0, 4),
    challenges: challenges.slice(0, 3),
    summary: summary.length > 300 ? truncateAtWordBoundary(summary, 300) + '...' : summary
  }
}

/**
 * Extract key insights from paragraph text
 * Returns main takeaways as structured items
 */
export function extractKeyInsights(text: string): KeyInsight[] {
  if (!text) return []

  const insights: KeyInsight[] = []
  
  // Split into sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 30)
  
  // Look for key phrases that indicate important points
  const keyPhrases = [
    /(?:this means|this indicates|this suggests|this reveals|this shows)(.+?)(?:\.|$)/gi,
    /(?:key|important|significant|notable|essential|crucial)(.+?)(?:\.|$)/gi,
    /(?:remember|note|keep in mind|understand that)(.+?)(?:\.|$)/gi
  ]

  sentences.slice(0, 5).forEach((sentence, index) => {
    const trimmed = sentence.trim()
    if (trimmed.length > 40 && trimmed.length < 200) {
      // Check if sentence contains key phrases
      const hasKeyPhrase = keyPhrases.some(pattern => pattern.test(trimmed))
      
      insights.push({
        title: `Key Insight ${index + 1}`,
        description: trimmed,
        highlight: hasKeyPhrase
      })
    }
  })

  // If no structured insights found, create from first few sentences
  if (insights.length === 0 && sentences.length > 0) {
    sentences.slice(0, 3).forEach((sentence, index) => {
      insights.push({
        title: `Insight ${index + 1}`,
        description: sentence.trim()
      })
    })
  }

  return insights.slice(0, 4)
}

/**
 * Structure transit data into timeline format
 */
/**
 * Get house theme for transit interpretation
 */
function getHouseTheme(houseNumber: number): string {
  const themes: { [key: number]: string } = {
    1: 'your identity, self-image, and how you present yourself to the world',
    2: 'your values, resources, finances, and material security',
    3: 'your communication, learning, siblings, and short journeys',
    4: 'your home, family roots, emotional foundation, and inner security',
    5: 'your creativity, romance, children, self-expression, and joy',
    6: 'your health, daily routines, work environment, and service to others',
    7: 'your partnerships, relationships, marriage, and one-on-one connections',
    8: 'your transformation, shared resources, intimacy, and psychological depth',
    9: 'your beliefs, higher learning, philosophy, travel, and spiritual growth',
    10: 'your career, public reputation, achievements, and life direction',
    11: 'your friendships, groups, hopes, dreams, and future aspirations',
    12: 'your spirituality, subconscious patterns, hidden matters, and inner reflection'
  }
  return themes[houseNumber] || 'important life themes'
}

/**
 * Get planet transit interpretation
 */
function getPlanetTransitInterpretation(planetName: string, sign: string, house: number, isRetrograde: boolean): string {
  const planetLower = planetName.toLowerCase()
  const houseTheme = getHouseTheme(house)
  const retrogradeNote = isRetrograde ? ' As this planet is retrograde, its energies are turned inward, prompting reflection and review in this area.' : ''
  
  const interpretations: { [key: string]: string } = {
    sun: `The Sun's transit through ${sign} in House ${house} illuminates ${houseTheme}. This brings vitality, confidence, and clarity to how you express yourself in this life area. You're likely to feel more energized and focused on ${houseTheme} during this transit.`,
    moon: `The Moon's transit through ${sign} in House ${house} activates your emotional responses related to ${houseTheme}. Your feelings and intuition are heightened in this area, bringing both sensitivity and emotional awareness. This is a time to tune into your emotional needs and nurture yourself through ${houseTheme}.`,
    mercury: `Mercury's transit through ${sign} in House ${house} enhances communication and mental activity around ${houseTheme}. You'll find yourself thinking, analyzing, and communicating more about matters related to this house. Ideas flow more easily, and you may have important conversations or decisions to make.${retrogradeNote}`,
    venus: `Venus's transit through ${sign} in House ${house} brings harmony, beauty, and pleasure to ${houseTheme}. Relationships, values, and aesthetics are highlighted. You may feel drawn to enhance or beautify this area of your life, seek more balance, or experience increased enjoyment and appreciation.`,
    mars: `Mars's transit through ${sign} in House ${house} energizes and motivates you regarding ${houseTheme}. You'll feel driven to take action, assert yourself, and pursue your desires in this area. This transit brings courage and determination, though be mindful of impatience or conflict.${retrogradeNote}`,
    jupiter: `Jupiter's transit through ${sign} in House ${house} expands opportunities and brings growth to ${houseTheme}. This is typically a beneficial period where you can experience abundance, learning, and positive developments. Jupiter's influence here can open doors and bring optimism and faith.`,
    saturn: `Saturn's transit through ${sign} in House ${house} brings structure, discipline, and responsibility to ${houseTheme}. This period may require you to work harder, face limitations, or take on more responsibility in this area. While challenging, it builds maturity and long-term stability.${retrogradeNote}`,
    uranus: `Uranus's transit through ${sign} in House ${house} brings sudden changes, innovation, and unexpected developments to ${houseTheme}. You may experience breakthroughs, surprises, or a desire for freedom and independence in this area. Expect the unexpected and be open to new ways of being.`,
    neptune: `Neptune's transit through ${sign} in House ${house} brings intuition, inspiration, and sometimes confusion to ${houseTheme}. This transit can enhance creativity and spiritual connection but may also bring illusions or unclear boundaries. Trust your intuition while staying grounded.`,
    pluto: `Pluto's transit through ${sign} in House ${house} brings deep transformation and power dynamics to ${houseTheme}. This is a period of profound change, letting go of what no longer serves you, and accessing deeper truth and empowerment. Intensity and regeneration are themes.${retrogradeNote}`
  }
  
  return interpretations[planetLower] || `${planetName}'s transit through ${sign} in House ${house} influences ${houseTheme}. This planetary movement brings its unique energy to this area of your life, creating opportunities for growth, insight, and development.${retrogradeNote}`
}

export function createTimelineFromTransits(transits: any[], natalPlanets?: any[], natalHouses?: any[]): TimelineEvent[] {
  if (!transits || !Array.isArray(transits)) return []

  return transits.slice(0, 10).map((transit, index) => {
    // Handle transit interpretation objects (with planet, aspect, interpretation)
    if (transit.interpretation || transit.description) {
      const type = transit.interpretation?.toLowerCase().includes('challenge') || 
                   transit.interpretation?.toLowerCase().includes('difficulty') ? 'challenge' :
                   transit.interpretation?.toLowerCase().includes('opportunity') ||
                   transit.interpretation?.toLowerCase().includes('positive') ? 'positive' :
                   'neutral'

      return {
        id: `transit-${index}`,
        date: transit.date || transit.timeframe || 'Current',
        title: `${transit.planet || 'Planet'} ${transit.aspect || 'transit'}`,
        description: transit.interpretation || transit.description,
        type: type as 'positive' | 'neutral' | 'challenge',
        details: transit.details ? (Array.isArray(transit.details) ? transit.details : [transit.details]) : undefined
      }
    }
    
    // Handle planet position objects (with name, sign, degree, house)
    const planetName = transit.name || transit.planet || 'Planet'
    const sign = transit.sign?.signName || transit.sign || transit.signName || ''
    const degree = typeof transit.degree === 'number' ? transit.degree.toFixed(1) : transit.degree || ''
    const house = transit.house || transit.houseNumber
    const isRetrograde = transit.isRetrograde || false
    
    // Create meaningful title
    const titleParts = [planetName, sign, `${degree}°`].filter(Boolean)
    const title = titleParts.join(' in ') + (house ? ` - House ${house}` : '') + (isRetrograde ? ' (Retrograde)' : '')
    
    // Generate meaningful interpretation
    const description = house && sign 
      ? getPlanetTransitInterpretation(planetName, sign, house, isRetrograde)
      : `${planetName} is currently transiting through ${sign}${degree ? ` at ${degree}°` : ''}. This transit influences your chart based on its position relative to your natal planets and houses, activating themes related to this planetary energy.`
    
    // Determine type based on planet
    let type: 'positive' | 'neutral' | 'challenge' = 'neutral'
    const planetLower = planetName.toLowerCase()
    if (planetLower.includes('jupiter') || planetLower.includes('venus') || planetLower.includes('sun')) {
      type = 'positive'
    } else if (planetLower.includes('saturn') || planetLower.includes('mars') || planetLower.includes('pluto')) {
      type = 'challenge'
    } else if (planetLower.includes('uranus') || planetLower.includes('neptune')) {
      type = 'milestone'
    }

    return {
      id: `transit-${index}`,
      date: transit.date || transit.timeframe || new Date().toLocaleDateString(),
      title: title,
      description: description,
      type: type,
      details: house ? [`Current position: ${sign} ${degree}°`, `House ${house}: ${getHouseTheme(house).replace('your ', '').replace(' and', ',')}`] : undefined
    }
  })
}

/**
 * Simplify aspect descriptions into digestible chunks
 */
export function simplifyAspectDescription(aspect: string, description: string): StructuredItem[] {
  if (!description) return []

  const items: StructuredItem[] = []
  
  // Try to extract bullet points first
  const bulletPattern = /[•\-\*]\s*(.+?)(?:\n|$)/g
  let match
  
  while ((match = bulletPattern.exec(description)) !== null) {
    items.push({ text: match[1].trim(), type: 'neutral' })
  }

  // If no bullets, split by sentences and create items
  if (items.length === 0) {
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 20)
    sentences.slice(0, 4).forEach(sentence => {
      const trimmed = sentence.trim()
      if (trimmed.length > 30 && trimmed.length < 200) {
        items.push({ text: trimmed, type: 'neutral' })
      }
    })
  }

  return items.slice(0, 5)
}

/**
 * Extract challenges and opportunities from text
 */
export function extractChallengesAndOpportunities(text: string): {
  challenges: StructuredItem[]
  opportunities: StructuredItem[]
} {
  const challenges: StructuredItem[] = []
  const opportunities: StructuredItem[] = []

  if (!text) return { challenges, opportunities }

  // Look for challenge/opportunity sections
  const challengePattern = /(?:challenge|difficulty|struggle|obstacle|caution|warning)(?:s)?[:\-]?\s*(.+?)(?:\n\n|\n[A-Z]|$)/gi
  const opportunityPattern = /(?:opportunity|strength|gift|advantage|benefit|positive)(?:s)?[:\-]?\s*(.+?)(?:\n\n|\n[A-Z]|$)/gi

  let match
  while ((match = challengePattern.exec(text)) !== null) {
    const content = match[1].trim()
    if (content.length > 20 && content.length < 200) {
      challenges.push({ text: content, type: 'challenge' })
    }
  }

  while ((match = opportunityPattern.exec(text)) !== null) {
    const content = match[1].trim()
    if (content.length > 20 && content.length < 200) {
      opportunities.push({ text: content, type: 'positive' })
    }
  }

  // Fallback: extract from bullet points
  if (challenges.length === 0 && opportunities.length === 0) {
    const bulletPattern = /[•\-\*]\s*(.+?)(?:\n|$)/g
    while ((match = bulletPattern.exec(text)) !== null) {
      const item = match[1].trim()
      const lower = item.toLowerCase()
      if (lower.includes('challenge') || lower.includes('difficulty') || lower.includes('struggle')) {
        challenges.push({ text: item, type: 'challenge' })
      } else if (lower.includes('opportunity') || lower.includes('strength') || lower.includes('gift')) {
        opportunities.push({ text: item, type: 'positive' })
      }
    }
  }

  return {
    challenges: challenges.slice(0, 5),
    opportunities: opportunities.slice(0, 5)
  }
}

/**
 * Break down long text into structured bullet points
 */
export function textToBulletPoints(text: string, maxItems: number = 5): StructuredItem[] {
  if (!text) return []

  const items: StructuredItem[] = []
  
  // First try to find existing bullet points
  const bulletPattern = /[•\-\*]\s*(.+?)(?:\n|$)/g
  let match
  
  while ((match = bulletPattern.exec(text)) !== null && items.length < maxItems) {
    items.push({ text: match[1].trim(), type: 'neutral' })
  }

  // If no bullets found, split by sentences
  if (items.length === 0) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 30)
    sentences.slice(0, maxItems).forEach(sentence => {
      const trimmed = sentence.trim()
      if (trimmed.length > 30 && trimmed.length < 200) {
        items.push({ text: trimmed, type: 'neutral' })
      }
    })
  }

  return items.slice(0, maxItems)
}
