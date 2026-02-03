// Simple Angel Numbers Lookup Utility
// Lightweight lookup function for instant number → message mapping

interface AngelNumberLookupResult {
  number: number
  originalInput: string | number
  primaryMeaning: string
  spiritualMessage: string
  guidance: string
  keywords: string[]
  biblicalReference?: string
  chakraAssociation?: string
  element?: string
  isExactMatch: boolean
  matchedNumber?: number
}

// Import ANGEL_NUMBER_MEANINGS from calculations
const ANGEL_NUMBER_MEANINGS: { [key: number]: any } = {
  0: {
    primaryMeaning: 'Divine guidance and spiritual awakening',
    spiritualMessage: 'You are connected to the divine source. Trust in the universe and your spiritual journey.',
    guidance: 'Focus on your spiritual development and trust in divine timing.',
    keywords: ['divine', 'spiritual', 'awakening', 'guidance', 'trust'],
    biblicalReference: 'Revelation 1:8 - "I am the Alpha and the Omega"',
    chakraAssociation: 'Crown',
    element: 'Spirit'
  },
  1: {
    primaryMeaning: 'New beginnings and manifestation',
    spiritualMessage: 'Your thoughts are creating your reality. Focus on positive intentions.',
    guidance: 'Take action on your goals and trust in your abilities.',
    keywords: ['new beginnings', 'manifestation', 'leadership', 'independence', 'creation'],
    biblicalReference: 'Genesis 1:1 - "In the beginning"',
    chakraAssociation: 'Root',
    element: 'Fire'
  },
  2: {
    primaryMeaning: 'Balance, harmony, and partnerships',
    spiritualMessage: 'Trust in divine timing and maintain balance in all areas of life.',
    guidance: 'Work on relationships and find harmony between different aspects of your life.',
    keywords: ['balance', 'harmony', 'partnerships', 'trust', 'faith'],
    biblicalReference: 'Matthew 18:20 - "Where two or three gather"',
    chakraAssociation: 'Sacral',
    element: 'Water'
  },
  3: {
    primaryMeaning: 'Creativity, joy, and divine protection',
    spiritualMessage: 'The ascended masters are guiding and protecting you.',
    guidance: 'Express your creativity and trust in divine protection.',
    keywords: ['creativity', 'joy', 'protection', 'masters', 'expression'],
    biblicalReference: 'Matthew 28:19 - Trinity',
    chakraAssociation: 'Solar Plexus',
    element: 'Air'
  },
  4: {
    primaryMeaning: 'Stability, foundation, and hard work',
    spiritualMessage: 'Your angels are supporting your efforts and building a strong foundation.',
    guidance: 'Focus on building solid foundations and trust in the process.',
    keywords: ['stability', 'foundation', 'hard work', 'support', 'structure'],
    biblicalReference: 'Four Gospels',
    chakraAssociation: 'Heart',
    element: 'Earth'
  },
  5: {
    primaryMeaning: 'Change, freedom, and adventure',
    spiritualMessage: 'Major life changes are coming. Embrace them with courage.',
    guidance: 'Be open to change and trust in the journey ahead.',
    keywords: ['change', 'freedom', 'adventure', 'courage', 'transformation'],
    biblicalReference: 'Five books of Moses',
    chakraAssociation: 'Throat',
    element: 'Ether'
  },
  6: {
    primaryMeaning: 'Love, family, and responsibility',
    spiritualMessage: 'Focus on love, family, and your responsibilities to others.',
    guidance: 'Balance material and spiritual needs, and care for your loved ones.',
    keywords: ['love', 'family', 'responsibility', 'nurturing', 'balance'],
    biblicalReference: 'Six days of creation',
    chakraAssociation: 'Third Eye',
    element: 'Water'
  },
  7: {
    primaryMeaning: 'Spiritual awakening and divine wisdom',
    spiritualMessage: 'You are on the right spiritual path. Trust your intuition.',
    guidance: 'Deepen your spiritual practice and trust in divine wisdom.',
    keywords: ['spiritual', 'wisdom', 'intuition', 'awakening', 'divine'],
    biblicalReference: 'Seven days of creation',
    chakraAssociation: 'Crown',
    element: 'Spirit'
  },
  8: {
    primaryMeaning: 'Abundance, prosperity, and infinite possibilities',
    spiritualMessage: 'Financial and material abundance is flowing to you.',
    guidance: 'Trust in abundance and maintain positive thoughts about money.',
    keywords: ['abundance', 'prosperity', 'infinity', 'wealth', 'possibilities'],
    biblicalReference: 'Eight beatitudes',
    chakraAssociation: 'Root',
    element: 'Earth'
  },
  9: {
    primaryMeaning: 'Completion, humanitarian service, and spiritual enlightenment',
    spiritualMessage: 'A cycle is ending. Prepare for new spiritual growth.',
    guidance: 'Complete unfinished business and serve others with love.',
    keywords: ['completion', 'service', 'enlightenment', 'compassion', 'endings'],
    biblicalReference: 'Nine fruits of the Spirit',
    chakraAssociation: 'Crown',
    element: 'Fire'
  },
  11: {
    primaryMeaning: 'Spiritual awakening and enlightenment',
    spiritualMessage: 'You are a lightworker. Share your spiritual gifts with others.',
    guidance: 'Trust your intuition and develop your spiritual abilities.',
    keywords: ['awakening', 'enlightenment', 'lightworker', 'intuition', 'spiritual'],
    biblicalReference: 'Master number of illumination',
    chakraAssociation: 'Crown',
    element: 'Spirit'
  },
  22: {
    primaryMeaning: 'Master builder and practical spirituality',
    spiritualMessage: 'You have the power to manifest your dreams into reality.',
    guidance: 'Use your spiritual gifts to build something meaningful in the world.',
    keywords: ['master builder', 'manifestation', 'practical', 'spiritual', 'power'],
    biblicalReference: 'Master number of the builder',
    chakraAssociation: 'All Chakras',
    element: 'All Elements'
  },
  33: {
    primaryMeaning: 'Christ consciousness and unconditional love',
    spiritualMessage: 'You are a master teacher and healer.',
    guidance: 'Serve others with unconditional love and compassion.',
    keywords: ['christ consciousness', 'master teacher', 'healing', 'love', 'compassion'],
    biblicalReference: 'Master number of the teacher',
    chakraAssociation: 'Heart',
    element: 'Love'
  },
  111: {
    primaryMeaning: 'Manifestation and spiritual awakening',
    spiritualMessage: 'Your thoughts are manifesting rapidly. Keep them positive.',
    guidance: 'Monitor your thoughts and focus on what you want to create.',
    keywords: ['manifestation', 'awakening', 'thoughts', 'creation', 'rapid'],
    biblicalReference: 'Trinity of manifestation',
    chakraAssociation: 'Crown',
    element: 'Spirit'
  },
  222: {
    primaryMeaning: 'Balance and divine timing',
    spiritualMessage: 'Everything is happening in divine timing. Trust the process.',
    guidance: 'Maintain balance and trust that everything is unfolding perfectly.',
    keywords: ['balance', 'timing', 'trust', 'harmony', 'divine'],
    biblicalReference: 'Double confirmation',
    chakraAssociation: 'Sacral',
    element: 'Water'
  },
  333: {
    primaryMeaning: 'Divine protection and ascended masters',
    spiritualMessage: 'The ascended masters are surrounding you with love and protection.',
    guidance: 'Call upon the ascended masters for guidance and protection.',
    keywords: ['protection', 'masters', 'divine', 'guidance', 'love'],
    biblicalReference: 'Trinity of protection',
    chakraAssociation: 'Solar Plexus',
    element: 'Fire'
  },
  444: {
    primaryMeaning: 'Angel presence and divine support',
    spiritualMessage: 'Your angels are with you, providing love and support.',
    guidance: 'Ask your angels for help and trust in their guidance.',
    keywords: ['angels', 'support', 'presence', 'guidance', 'love'],
    biblicalReference: 'Four corners of the earth',
    chakraAssociation: 'Heart',
    element: 'Air'
  },
  555: {
    primaryMeaning: 'Major life changes and transformation',
    spiritualMessage: 'Major changes are coming. Embrace them with courage.',
    guidance: 'Be open to change and trust in the transformation process.',
    keywords: ['change', 'transformation', 'courage', 'major', 'evolution'],
    biblicalReference: 'Five elements of change',
    chakraAssociation: 'Throat',
    element: 'Ether'
  },
  666: {
    primaryMeaning: 'Balance between material and spiritual',
    spiritualMessage: 'Focus on balancing your material and spiritual needs.',
    guidance: 'Don\'t neglect your spiritual growth while pursuing material goals.',
    keywords: ['balance', 'material', 'spiritual', 'harmony', 'integration'],
    biblicalReference: 'Number of man',
    chakraAssociation: 'Third Eye',
    element: 'Earth'
  },
  777: {
    primaryMeaning: 'Divine perfection and spiritual enlightenment',
    spiritualMessage: 'You are on the right path. Trust in divine perfection.',
    guidance: 'Continue your spiritual practice and trust in divine guidance.',
    keywords: ['perfection', 'enlightenment', 'divine', 'spiritual', 'right path'],
    biblicalReference: 'Divine perfection',
    chakraAssociation: 'Crown',
    element: 'Spirit'
  },
  888: {
    primaryMeaning: 'Abundance and infinite possibilities',
    spiritualMessage: 'Financial and spiritual abundance is flowing to you.',
    guidance: 'Trust in abundance and maintain positive thoughts about prosperity.',
    keywords: ['abundance', 'prosperity', 'infinite', 'wealth', 'possibilities'],
    biblicalReference: 'Double infinity',
    chakraAssociation: 'Root',
    element: 'Earth'
  },
  999: {
    primaryMeaning: 'Completion and spiritual service',
    spiritualMessage: 'A major cycle is ending. Prepare for new spiritual growth.',
    guidance: 'Complete unfinished business and prepare for new beginnings.',
    keywords: ['completion', 'service', 'endings', 'new beginnings', 'spiritual'],
    biblicalReference: 'Completion of cycles',
    chakraAssociation: 'Crown',
    element: 'Fire'
  },
  1111: {
    primaryMeaning: 'Spiritual awakening and manifestation',
    spiritualMessage: 'You are awakening to your spiritual purpose and power.',
    guidance: 'Pay attention to your thoughts and focus on your spiritual growth.',
    keywords: ['awakening', 'manifestation', 'spiritual', 'purpose', 'power'],
    biblicalReference: 'Gateway to manifestation',
    chakraAssociation: 'Crown',
    element: 'Spirit'
  }
}

/**
 * Normalizes input to extract the core number
 * Handles formats like "11:11", "111", "2222", etc.
 */
function normalizeNumber(input: string | number): number | null {
  if (typeof input === 'number') {
    return input
  }

  // Remove all non-numeric characters except colons (for time format)
  let cleaned = input.toString().trim()

  // Handle time format (e.g., "11:11" -> "1111")
  if (cleaned.includes(':')) {
    cleaned = cleaned.replace(/:/g, '')
  }

  // Remove all non-numeric characters
  cleaned = cleaned.replace(/\D/g, '')

  if (!cleaned || cleaned.length === 0) {
    return null
  }

  // Handle leading zeros - strip them
  const num = parseInt(cleaned, 10)
  
  if (isNaN(num) || num < 0) {
    return null
  }

  return num
}

/**
 * Reduces a number to a single digit using numerology reduction
 * e.g., 123 -> 1+2+3 = 6
 */
function reduceToSingleDigit(num: number): number {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    const digits = num.toString().split('')
    num = digits.reduce((sum, digit) => sum + parseInt(digit, 10), 0)
  }
  return num
}

/**
 * Checks if a number has repeating patterns
 * e.g., 111, 222, 1234, etc.
 */
function extractRepeatingPattern(num: number): number | null {
  const numStr = num.toString()
  
  // Check for all same digits (111, 222, 333, etc.)
  if (/^(\d)\1+$/.test(numStr)) {
    return num
  }

  // Check for master numbers (11, 22, 33) even if part of larger number
  if (numStr.length >= 2) {
    const firstTwo = parseInt(numStr.substring(0, 2), 10)
    if ([11, 22, 33].includes(firstTwo)) {
      return firstTwo
    }
  }

  return null
}

/**
 * Finds the closest matching angel number
 * Tries exact match, then repeating patterns, then reduction
 */
function findClosestMatch(num: number): { number: number; meaning: any; isExact: boolean } | null {
  // 1. Try exact match
  if (ANGEL_NUMBER_MEANINGS[num]) {
    return {
      number: num,
      meaning: ANGEL_NUMBER_MEANINGS[num],
      isExact: true
    }
  }

  // 2. Try repeating pattern extraction
  const repeatingPattern = extractRepeatingPattern(num)
  if (repeatingPattern && ANGEL_NUMBER_MEANINGS[repeatingPattern]) {
    return {
      number: repeatingPattern,
      meaning: ANGEL_NUMBER_MEANINGS[repeatingPattern],
      isExact: false
    }
  }

  // 3. Try reduction to master numbers first (11, 22, 33)
  let reduced = num
  while (reduced > 33 && reduced !== 11 && reduced !== 22 && reduced !== 33) {
    const digits = reduced.toString().split('')
    reduced = digits.reduce((sum, digit) => sum + parseInt(digit, 10), 0)
    if ([11, 22, 33].includes(reduced)) {
      break
    }
  }

  // Check if reduced number exists
  if (ANGEL_NUMBER_MEANINGS[reduced]) {
    return {
      number: reduced,
      meaning: ANGEL_NUMBER_MEANINGS[reduced],
      isExact: false
    }
  }

  // 4. Reduce to single digit (0-9)
  const singleDigit = reduceToSingleDigit(num)
  if (ANGEL_NUMBER_MEANINGS[singleDigit]) {
    return {
      number: singleDigit,
      meaning: ANGEL_NUMBER_MEANINGS[singleDigit],
      isExact: false
    }
  }

  // 5. Fallback to 0 (divine guidance)
  return {
    number: 0,
    meaning: ANGEL_NUMBER_MEANINGS[0],
    isExact: false
  }
}

/**
 * Main lookup function - accepts number or string and returns angel number meaning
 */
export function lookupAngelNumber(input: string | number): AngelNumberLookupResult | null {
  if (!input && input !== 0) {
    return null
  }

  const normalized = normalizeNumber(input)
  
  if (normalized === null) {
    return null
  }

  const match = findClosestMatch(normalized)

  if (!match) {
    return null
  }

  const result: AngelNumberLookupResult = {
    number: normalized,
    originalInput: input,
    primaryMeaning: match.meaning.primaryMeaning,
    spiritualMessage: match.meaning.spiritualMessage,
    guidance: match.meaning.guidance,
    keywords: match.meaning.keywords || [],
    isExactMatch: match.isExact,
    matchedNumber: match.number
  }

  // Add optional fields if available
  if (match.meaning.biblicalReference) {
    result.biblicalReference = match.meaning.biblicalReference
  }
  if (match.meaning.chakraAssociation) {
    result.chakraAssociation = match.meaning.chakraAssociation
  }
  if (match.meaning.element) {
    result.element = match.meaning.element
  }

  return result
}

/**
 * Validates if input can be processed as an angel number
 */
export function isValidAngelNumberInput(input: string | number): boolean {
  if (!input && input !== 0) {
    return false
  }

  const normalized = normalizeNumber(input)
  return normalized !== null
}

