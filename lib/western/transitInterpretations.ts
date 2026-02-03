/**
 * Simple Transit Interpretations
 * Pre-written meaningful messages for common transit aspects
 */

export interface TransitInterpretation {
  planet: string;
  aspect: string;
  targetPlanet: string;
  message: string;
  action: string;
  duration: string;
}

export const TRANSIT_INTERPRETATIONS: Record<string, TransitInterpretation> = {
  // Jupiter Transits
  'jupiter-conjunct-sun': {
    planet: 'jupiter',
    aspect: 'conjunction',
    targetPlanet: 'sun',
    message: 'Major opportunity for personal growth and recognition',
    action: 'Take bold steps toward your goals',
    duration: '1 year'
  },
  'jupiter-conjunct-moon': {
    planet: 'jupiter',
    aspect: 'conjunction',
    targetPlanet: 'moon',
    message: 'Emotional expansion and increased intuition',
    action: 'Trust your feelings and inner wisdom',
    duration: '1 year'
  },
  'jupiter-conjunct-mercury': {
    planet: 'jupiter',
    aspect: 'conjunction',
    targetPlanet: 'mercury',
    message: 'Expanded thinking and communication opportunities',
    action: 'Share your knowledge and ideas',
    duration: '1 year'
  },
  'jupiter-conjunct-venus': {
    planet: 'jupiter',
    aspect: 'conjunction',
    targetPlanet: 'venus',
    message: 'Increased love, beauty, and abundance',
    action: 'Open your heart to new relationships',
    duration: '1 year'
  },
  'jupiter-conjunct-mars': {
    planet: 'jupiter',
    aspect: 'conjunction',
    targetPlanet: 'mars',
    message: 'Increased energy and motivation for action',
    action: 'Channel your energy into productive projects',
    duration: '1 year'
  },
  'jupiter-square-sun': {
    planet: 'jupiter',
    aspect: 'square',
    targetPlanet: 'sun',
    message: 'Challenges that lead to personal growth',
    action: 'Learn from setbacks and stay optimistic',
    duration: '1 year'
  },
  'jupiter-opposition-sun': {
    planet: 'jupiter',
    aspect: 'opposition',
    targetPlanet: 'sun',
    message: 'Need to balance expansion with moderation',
    action: 'Avoid overextending yourself',
    duration: '1 year'
  },

  // Saturn Transits
  'saturn-conjunct-sun': {
    planet: 'saturn',
    aspect: 'conjunction',
    targetPlanet: 'sun',
    message: 'Time for serious commitment and responsibility',
    action: 'Build solid foundations for your goals',
    duration: '2.5 years'
  },
  'saturn-conjunct-moon': {
    planet: 'saturn',
    aspect: 'conjunction',
    targetPlanet: 'moon',
    message: 'Time to strengthen emotional foundations',
    action: 'Develop emotional maturity and boundaries',
    duration: '2.5 years'
  },
  'saturn-conjunct-mercury': {
    planet: 'saturn',
    aspect: 'conjunction',
    targetPlanet: 'mercury',
    message: 'Serious thinking and disciplined communication',
    action: 'Focus on practical learning and clear communication',
    duration: '2.5 years'
  },
  'saturn-conjunct-venus': {
    planet: 'saturn',
    aspect: 'conjunction',
    targetPlanet: 'venus',
    message: 'Time for serious commitment in relationships',
    action: 'Build lasting, meaningful connections',
    duration: '2.5 years'
  },
  'saturn-conjunct-mars': {
    planet: 'saturn',
    aspect: 'conjunction',
    targetPlanet: 'mars',
    message: 'Disciplined action and controlled energy',
    action: 'Work systematically toward your goals',
    duration: '2.5 years'
  },
  'saturn-square-sun': {
    planet: 'saturn',
    aspect: 'square',
    targetPlanet: 'sun',
    message: 'Important tests and lessons in personal growth',
    action: 'Face challenges with patience and persistence',
    duration: '2.5 years'
  },
  'saturn-opposition-sun': {
    planet: 'saturn',
    aspect: 'opposition',
    targetPlanet: 'sun',
    message: 'Need to balance responsibility with personal freedom',
    action: 'Find healthy boundaries in your commitments',
    duration: '2.5 years'
  },

  // Uranus Transits
  'uranus-conjunct-sun': {
    planet: 'uranus',
    aspect: 'conjunction',
    targetPlanet: 'sun',
    message: 'Sudden changes and breakthroughs in identity',
    action: 'Embrace your unique self and innovative ideas',
    duration: '7 years'
  },
  'uranus-conjunct-moon': {
    planet: 'uranus',
    aspect: 'conjunction',
    targetPlanet: 'moon',
    message: 'Emotional liberation and sudden insights',
    action: 'Break free from limiting emotional patterns',
    duration: '7 years'
  },
  'uranus-conjunct-mercury': {
    planet: 'uranus',
    aspect: 'conjunction',
    targetPlanet: 'mercury',
    message: 'Revolutionary thinking and communication',
    action: 'Share innovative ideas and embrace change',
    duration: '7 years'
  },
  'uranus-conjunct-venus': {
    planet: 'uranus',
    aspect: 'conjunction',
    targetPlanet: 'venus',
    message: 'Unconventional relationships and sudden attractions',
    action: 'Be open to unexpected connections',
    duration: '7 years'
  },
  'uranus-conjunct-mars': {
    planet: 'uranus',
    aspect: 'conjunction',
    targetPlanet: 'mars',
    message: 'Sudden bursts of energy and revolutionary action',
    action: 'Channel your energy into innovative projects',
    duration: '7 years'
  },
  'uranus-square-sun': {
    planet: 'uranus',
    aspect: 'square',
    targetPlanet: 'sun',
    message: 'Disruptive changes that lead to freedom',
    action: 'Embrace necessary changes and new directions',
    duration: '7 years'
  },
  'uranus-opposition-sun': {
    planet: 'uranus',
    aspect: 'opposition',
    targetPlanet: 'sun',
    message: 'Need to balance innovation with stability',
    action: 'Integrate new ideas with existing foundations',
    duration: '7 years'
  },

  // Neptune Transits
  'neptune-conjunct-sun': {
    planet: 'neptune',
    aspect: 'conjunction',
    targetPlanet: 'sun',
    message: 'Spiritual awakening and inspiration',
    action: 'Connect with your higher purpose and creativity',
    duration: '14 years'
  },
  'neptune-conjunct-moon': {
    planet: 'neptune',
    aspect: 'conjunction',
    targetPlanet: 'moon',
    message: 'Deep emotional and spiritual connection',
    action: 'Trust your intuition and spiritual guidance',
    duration: '14 years'
  },
  'neptune-conjunct-mercury': {
    planet: 'neptune',
    aspect: 'conjunction',
    targetPlanet: 'mercury',
    message: 'Enhanced intuition and spiritual communication',
    action: 'Express your spiritual insights and creativity',
    duration: '14 years'
  },
  'neptune-conjunct-venus': {
    planet: 'neptune',
    aspect: 'conjunction',
    targetPlanet: 'venus',
    message: 'Spiritual love and artistic inspiration',
    action: 'Open your heart to unconditional love',
    duration: '14 years'
  },
  'neptune-conjunct-mars': {
    planet: 'neptune',
    aspect: 'conjunction',
    targetPlanet: 'mars',
    message: 'Spiritual action and compassionate service',
    action: 'Use your energy for healing and service',
    duration: '14 years'
  },
  'neptune-square-sun': {
    planet: 'neptune',
    aspect: 'square',
    targetPlanet: 'sun',
    message: 'Confusion that leads to spiritual clarity',
    action: 'Trust the process and seek spiritual guidance',
    duration: '14 years'
  },
  'neptune-opposition-sun': {
    planet: 'neptune',
    aspect: 'opposition',
    targetPlanet: 'sun',
    message: 'Need to balance dreams with reality',
    action: 'Ground your spiritual insights in practical action',
    duration: '14 years'
  },

  // Pluto Transits
  'pluto-conjunct-sun': {
    planet: 'pluto',
    aspect: 'conjunction',
    targetPlanet: 'sun',
    message: 'Deep transformation and empowerment',
    action: 'Embrace your authentic power and purpose',
    duration: '12-20 years'
  },
  'pluto-conjunct-moon': {
    planet: 'pluto',
    aspect: 'conjunction',
    targetPlanet: 'moon',
    message: 'Emotional transformation and deep healing',
    action: 'Release old emotional patterns and heal',
    duration: '12-20 years'
  },
  'pluto-conjunct-mercury': {
    planet: 'pluto',
    aspect: 'conjunction',
    targetPlanet: 'mercury',
    message: 'Transformative thinking and deep insights',
    action: 'Use your words to create positive change',
    duration: '12-20 years'
  },
  'pluto-conjunct-venus': {
    planet: 'pluto',
    aspect: 'conjunction',
    targetPlanet: 'venus',
    message: 'Transformative relationships and values',
    action: 'Deepen your connections and values',
    duration: '12-20 years'
  },
  'pluto-conjunct-mars': {
    planet: 'pluto',
    aspect: 'conjunction',
    targetPlanet: 'mars',
    message: 'Transformative action and personal power',
    action: 'Channel your energy into meaningful change',
    duration: '12-20 years'
  },
  'pluto-square-sun': {
    planet: 'pluto',
    aspect: 'square',
    targetPlanet: 'sun',
    message: 'Intense transformation and rebirth',
    action: 'Embrace necessary changes and transformation',
    duration: '12-20 years'
  },
  'pluto-opposition-sun': {
    planet: 'pluto',
    aspect: 'opposition',
    targetPlanet: 'sun',
    message: 'Power struggles that lead to transformation',
    action: 'Release control and embrace transformation',
    duration: '12-20 years'
  }
};

/**
 * Get interpretation for a specific transit
 */
export function getTransitInterpretation(planet: string, aspect: string, targetPlanet: string): TransitInterpretation | null {
  const key = `${planet}-${aspect}-${targetPlanet}`;
  return TRANSIT_INTERPRETATIONS[key] || null;
}

/**
 * Get default interpretation if specific one not found
 */
export function getDefaultTransitInterpretation(planet: string, aspect: string, targetPlanet: string): TransitInterpretation {
  const planetMeanings: Record<string, string> = {
    jupiter: 'growth and expansion',
    saturn: 'lessons and responsibility',
    uranus: 'change and innovation',
    neptune: 'spiritual awakening',
    pluto: 'transformation and power'
  };
  
  const aspectMeanings: Record<string, string> = {
    conjunction: 'intense influence',
    square: 'challenging growth',
    opposition: 'need for balance'
  };
  
  return {
    planet,
    aspect,
    targetPlanet,
    message: `Significant ${planetMeanings[planet] || 'influence'} in ${targetPlanet} area`,
    action: `Embrace the ${aspectMeanings[aspect] || 'influence'} and grow`,
    duration: planet === 'jupiter' ? '1 year' : planet === 'saturn' ? '2.5 years' : 'Long-term'
  };
}
