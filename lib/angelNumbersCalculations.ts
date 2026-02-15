// Comprehensive Angel Numbers Calculation Engine
import { devLog } from '@/lib/devLogger';
// This provides all interpretations and insights needed for a self-reliant angel numbers system

interface AngelNumberInterpretation {
  number: number
  primaryMeaning: string
  spiritualMessage: string
  guidance: string
  keywords: string[]
  biblicalReference?: string
  chakraAssociation?: string
  element?: string
  frequency: number // How often this number appears
  timestamp: number
}

interface AngelNumbersProfile {
  userId: string
  fullName: string
  birthDate: string
  lastFetched: number
  
  // Personal Angel Numbers
  lifePathAngel: number
  destinyAngel: number
  soulAngel: number
  personalityAngel: number
  
  // Current Angel Numbers
  currentDateAngel: number
  personalYearAngel: number
  personalMonthAngel: number
  personalDayAngel: number
  
  // Angel Number Analysis
  frequentNumbers: AngelNumberInterpretation[]
  masterNumbers: AngelNumberInterpretation[]
  repeatingPatterns: string[]
  angelicGuidance: {
    primaryMessage: string
    secondaryMessages: string[]
    actionSteps: string[]
    affirmations: string[]
    warnings?: string[]
  }
  
  // Synchronicity Analysis
  synchronicities: {
    numberSequences: string[]
    timePatterns: string[]
    dateSignificance: string[]
    meaningfulCoincidences: string[]
  }
  
  metadata: {
    source: 'internal_calculations'
    version: string
    accuracy: string
    timestamp: number
  }
}

// Angel Number Meanings Database
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

// Calculate angel number from numerology number
function calculateAngelNumber(numerologyNumber: number): number {
  if (numerologyNumber >= 11 && numerologyNumber <= 33) return numerologyNumber
  if (numerologyNumber >= 111 && numerologyNumber <= 999) return numerologyNumber
  if (numerologyNumber >= 1111) return numerologyNumber
  
  // For single digits, create angel number patterns
  const patterns = [numerologyNumber, numerologyNumber * 11, numerologyNumber * 111]
  return patterns[Math.floor(Math.random() * patterns.length)]
}

// Get angel number interpretation
function getAngelNumberInterpretation(number: number): AngelNumberInterpretation {
  const meaning = ANGEL_NUMBER_MEANINGS[number] || ANGEL_NUMBER_MEANINGS[number % 10] || ANGEL_NUMBER_MEANINGS[0]
  
  return {
    number,
    primaryMeaning: meaning.primaryMeaning,
    spiritualMessage: meaning.spiritualMessage,
    guidance: meaning.guidance,
    keywords: meaning.keywords,
    biblicalReference: meaning.biblicalReference,
    chakraAssociation: meaning.chakraAssociation,
    element: meaning.element,
    frequency: 1,
    timestamp: Date.now()
  }
}

// Analyze repeating patterns
function analyzeRepeatingPatterns(numbers: number[]): string[] {
  const patterns: string[] = []
  const numberCounts: { [key: number]: number } = {}
  
  numbers.forEach(num => {
    numberCounts[num] = (numberCounts[num] || 0) + 1
  })
  
  // Find most frequent numbers
  const sortedNumbers = Object.entries(numberCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
  
  sortedNumbers.forEach(([num, count]) => {
    if (count > 1) {
      patterns.push(`Number ${num} appears ${count} times - strong angelic message`)
    }
  })
  
  // Check for sequential patterns
  const sorted = numbers.sort((a, b) => a - b)
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] - sorted[i] === 1) {
      patterns.push(`Sequential pattern: ${sorted[i]} → ${sorted[i + 1]}`)
    }
  }
  
  return patterns
}

// Helper function to generate grammatically correct action steps
function generateActionSteps(keywords: string[]): string[] {
  // Return fallback if no keywords
  if (!keywords || keywords.length === 0) {
    return [
      'Focus on your spiritual growth through daily practice',
      'Practice meditation and mindfulness regularly',
      'Trust in divine timing and guidance',
      'Express gratitude for your spiritual journey'
    ]
  }
  
  // Map keywords to proper action phrases
  const keywordActions: { [key: string]: string } = {
    'awakening': 'Focus on your spiritual awakening through daily mindfulness',
    'enlightenment': 'Seek enlightenment through meditation and self-reflection',
    'lightworker': 'Embrace your role as a lightworker and serve others',
    'intuition': 'Trust your intuition and inner guidance',
    'spiritual': 'Deepen your spiritual practice and connection',
    'manifestation': 'Practice conscious manifestation of your desires',
    'creation': 'Express your creative potential in all you do',
    'balance': 'Maintain balance between all areas of your life',
    'harmony': 'Create harmony in your relationships and environment',
    'partnerships': 'Nurture meaningful partnerships and connections',
    'trust': 'Cultivate trust in yourself and the divine plan',
    'faith': 'Strengthen your faith through daily spiritual practice',
    'creativity': 'Express your creativity in all aspects of life',
    'joy': 'Embrace joy and celebrate life\'s blessings',
    'protection': 'Call upon divine protection in your daily life',
    'masters': 'Connect with ascended masters through meditation',
    'expression': 'Express your authentic self with confidence',
    'stability': 'Build solid foundations for lasting success',
    'foundation': 'Establish strong foundations in all you do',
    'hard work': 'Commit to your goals with dedication and effort',
    'support': 'Accept support from the universe and others',
    'structure': 'Create structure and organization in your life',
    'change': 'Embrace change as an opportunity for growth',
    'freedom': 'Honor your need for freedom and independence',
    'adventure': 'Welcome new adventures and experiences',
    'courage': 'Act with courage in pursuing your dreams',
    'transformation': 'Trust in the transformation process',
    'love': 'Open your heart to giving and receiving love',
    'family': 'Nurture your family connections and bonds',
    'responsibility': 'Embrace your responsibilities with grace',
    'nurturing': 'Provide nurturing care to yourself and others',
    'wisdom': 'Seek wisdom through spiritual study and practice',
    'divine': 'Connect with the divine through prayer and meditation',
    'abundance': 'Open yourself to receiving divine abundance',
    'prosperity': 'Align with prosperity consciousness',
    'wealth': 'Cultivate a mindset of wealth and abundance',
    'possibilities': 'Explore infinite possibilities available to you',
    'infinity': 'Recognize the infinite nature of your potential',
    'completion': 'Complete unfinished projects and cycles',
    'service': 'Serve humanity with compassion and love',
    'compassion': 'Practice compassion for yourself and others',
    'endings': 'Release what no longer serves your highest good',
    'purpose': 'Align with your soul\'s purpose and mission',
    'power': 'Claim your personal power with integrity',
    'guidance': 'Ask for and receive divine guidance',
    'right path': 'Trust that you are on your divine path',
    'perfection': 'Recognize divine perfection in all situations',
    'rapid': 'Act swiftly on divine inspirations',
    'timing': 'Trust in perfect divine timing',
    'major': 'Prepare for major positive changes',
    'evolution': 'Embrace your spiritual evolution',
    'material': 'Balance material and spiritual needs',
    'integration': 'Integrate all aspects of yourself'
  }
  
  const steps: string[] = []
  
  // Use first 4 keywords with proper mappings
  for (let i = 0; i < Math.min(4, keywords.length); i++) {
    const keyword = keywords[i]
    const action = keywordActions[keyword] || `Cultivate ${keyword} in your daily spiritual practice`
    steps.push(action)
  }
  
  return steps
}

// Helper function to generate grammatically correct affirmations
function generateAffirmations(keywords: string[]): string[] {
  // Return fallback if no keywords
  if (!keywords || keywords.length === 0) {
    return [
      'I am divinely guided and protected',
      'I trust in my spiritual journey',
      'I am open to receiving divine messages',
      'I manifest my highest good with ease'
    ]
  }
  
  // Map keywords to proper affirmation phrases
  const keywordAffirmations: { [key: string]: string } = {
    'awakening': 'I am experiencing a profound spiritual awakening',
    'enlightenment': 'I am on the path to enlightenment and wisdom',
    'lightworker': 'I embrace my role as a lightworker with love',
    'intuition': 'I trust my intuition and inner wisdom',
    'spiritual': 'I am deepening my spiritual connection daily',
    'manifestation': 'I manifest my highest desires with ease',
    'creation': 'I am a powerful creator of my reality',
    'balance': 'I maintain perfect balance in all areas of life',
    'harmony': 'I create harmony wherever I go',
    'partnerships': 'I attract supportive partnerships into my life',
    'trust': 'I trust in the divine plan for my life',
    'faith': 'My faith grows stronger each day',
    'creativity': 'I express my creativity freely and joyfully',
    'joy': 'I am filled with divine joy and happiness',
    'protection': 'I am protected by divine forces at all times',
    'masters': 'I am guided by ascended masters and angels',
    'expression': 'I express my authentic self with confidence',
    'stability': 'I am grounded, stable, and secure',
    'foundation': 'I build strong foundations for lasting success',
    'hard work': 'I accomplish great things through dedicated effort',
    'support': 'I am supported by the universe in all I do',
    'structure': 'I create beneficial structure in my life',
    'change': 'I welcome positive change with open arms',
    'freedom': 'I am free to be my authentic self',
    'adventure': 'I embrace life\'s adventures with enthusiasm',
    'courage': 'I am courageous and confident',
    'transformation': 'I trust in my spiritual transformation',
    'love': 'I am surrounded by divine love and light',
    'family': 'I am blessed with loving family connections',
    'responsibility': 'I fulfill my responsibilities with grace',
    'nurturing': 'I nurture myself and others with compassion',
    'wisdom': 'I am growing in wisdom and understanding',
    'divine': 'I am connected to divine source energy',
    'abundance': 'I am open to receiving unlimited abundance',
    'prosperity': 'Prosperity flows to me effortlessly',
    'wealth': 'I am wealthy in all areas of my life',
    'possibilities': 'I am open to infinite possibilities',
    'infinity': 'My potential is infinite and unlimited',
    'completion': 'I complete all things with excellence',
    'service': 'I serve others with love and compassion',
    'compassion': 'I am a beacon of compassion and kindness',
    'endings': 'I release what no longer serves me',
    'new beginnings': 'I embrace new beginnings with excitement',
    'purpose': 'I am aligned with my divine purpose',
    'power': 'I claim my spiritual power with integrity',
    'guidance': 'I receive clear guidance from the universe',
    'right path': 'I am on my perfect spiritual path',
    'perfection': 'I recognize divine perfection in all things',
    'rapid': 'I act on divine inspiration immediately',
    'timing': 'I trust in perfect divine timing',
    'major': 'I am ready for major positive transformations',
    'evolution': 'I am evolving spiritually every day',
    'material': 'I balance my material and spiritual life',
    'integration': 'I integrate all aspects of my being',
    'leadership': 'I am a confident and inspiring leader',
    'independence': 'I honor my independence and autonomy'
  }
  
  const affirmations: string[] = []
  
  // Use first 4 keywords with proper mappings
  for (let i = 0; i < Math.min(4, keywords.length); i++) {
    const keyword = keywords[i]
    const affirmation = keywordAffirmations[keyword] || `I embody the energy of ${keyword} in my life`
    affirmations.push(affirmation)
  }
  
  return affirmations
}

// Generate angelic guidance
function generateAngelicGuidance(interpretations: AngelNumberInterpretation[]): AngelNumbersProfile['angelicGuidance'] {
  const primary = interpretations[0]
  const secondary = interpretations.slice(1, 3)
  
  const primaryMessage = primary.spiritualMessage
  const secondaryMessages = secondary.map(interp => interp.spiritualMessage)
  
  // Generate grammatically correct action steps
  const actionSteps = generateActionSteps(primary.keywords)
  
  // Generate grammatically correct affirmations
  const affirmations = generateAffirmations(primary.keywords)
  
  return {
    primaryMessage,
    secondaryMessages,
    actionSteps,
    affirmations
  }
}

// Analyze synchronicities
function analyzeSynchronicities(birthDate: string, fullName: string): AngelNumbersProfile['synchronicities'] {
  const date = new Date(birthDate)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  
  const numberSequences = [
    `${day}/${month}/${year}`,
    `${day}${month}${year}`,
    `${day + month + year}`
  ]
  
  const timePatterns = [
    `${day}:${month}`,
    `${month}:${day}`,
    `${year % 100}:${month}`
  ]
  
  const dateSignificance = [
    `Your birth date ${day}/${month} creates angel number ${day + month}`,
    `The year ${year} reduces to angel number ${year.toString().split('').reduce((a, b) => a + parseInt(b), 0)}`,
    `Your birth month ${month} is associated with angel number ${month * 11}`
  ]
  
  const meaningfulCoincidences = [
    `Your name has ${fullName.length} letters - angel number ${fullName.length * 11}`,
    `Your birth day ${day} appears in many angel number sequences`,
    `The combination of your birth numbers creates powerful angelic messages`
  ]
  
  return {
    numberSequences,
    timePatterns,
    dateSignificance,
    meaningfulCoincidences
  }
}

// Main function to generate complete angel numbers profile
export function generateAngelNumbersProfile(
  userId: string,
  fullName: string,
  birthDate: string
): AngelNumbersProfile {
  try {
    devLog.debug('Generating comprehensive angel numbers profile')
    
    // Validate input
    if (!fullName || !birthDate) {
      throw new Error('Full name and birth date are required')
    }
    
    // Calculate personal angel numbers from numerology
    const { generateNumerologyProfile } = require('./numerologyCalculations')
    const numerologyProfile = generateNumerologyProfile(fullName, birthDate)
    
    // Calculate angel numbers
    const lifePathAngel = calculateAngelNumber(numerologyProfile.lifePathNumber)
    const destinyAngel = calculateAngelNumber(numerologyProfile.destinyNumber)
    const soulAngel = calculateAngelNumber(numerologyProfile.soulNumber)
    const personalityAngel = calculateAngelNumber(numerologyProfile.personalityNumber)
    
    // Calculate current angel numbers
    const currentDate = new Date()
    const currentDateAngel = calculateAngelNumber(currentDate.getDate() + currentDate.getMonth() + 1)
    const personalYearAngel = calculateAngelNumber(numerologyProfile.personalYearNumber)
    const personalMonthAngel = calculateAngelNumber(numerologyProfile.personalMonthNumber)
    const personalDayAngel = calculateAngelNumber(numerologyProfile.personalDayNumber)
    
    // Get interpretations for all numbers
    const allNumbers = [
      lifePathAngel, destinyAngel, soulAngel, personalityAngel,
      currentDateAngel, personalYearAngel, personalMonthAngel, personalDayAngel
    ]
    
    const interpretations = allNumbers.map(num => getAngelNumberInterpretation(num))
    
    // Find frequent numbers
    const frequentNumbers = interpretations
      .filter(interp => interp.number >= 11)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5)
    
    // Find master numbers
    const masterNumbers = interpretations.filter(interp => 
      [11, 22, 33, 111, 222, 333, 444, 555, 666, 777, 888, 999, 1111].includes(interp.number)
    )
    
    // Analyze patterns
    const repeatingPatterns = analyzeRepeatingPatterns(allNumbers)
    
    // Generate guidance
    const angelicGuidance = generateAngelicGuidance(interpretations)
    
    // Analyze synchronicities
    const synchronicities = analyzeSynchronicities(birthDate, fullName)
    
    // Create profile
    const profile: AngelNumbersProfile = {
      userId,
      fullName,
      birthDate,
      lastFetched: Date.now(),
      
      lifePathAngel,
      destinyAngel,
      soulAngel,
      personalityAngel,
      
      currentDateAngel,
      personalYearAngel,
      personalMonthAngel,
      personalDayAngel,
      
      frequentNumbers,
      masterNumbers,
      repeatingPatterns,
      angelicGuidance,
      synchronicities,
      
      metadata: {
        source: 'internal_calculations',
        version: '1.0',
        accuracy: 'high',
        timestamp: Date.now()
      }
    }
    
    devLog.debug('Successfully generated angel numbers profile')
    return profile
    
  } catch (error) {
    devLog.error('Error generating angel numbers profile:', error, 'angelNumbersCalculations')
    throw new Error(`Failed to generate angel numbers profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Validate angel numbers input data
export function validateAngelNumbersData(fullName: string, birthDate: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!fullName || fullName.trim().length === 0) {
    errors.push('Full name is required')
  }
  
  if (!birthDate) {
    errors.push('Birth date is required')
  } else {
    const date = new Date(birthDate)
    if (isNaN(date.getTime())) {
      errors.push('Invalid birth date format')
    }
    if (date > new Date()) {
      errors.push('Birth date cannot be in the future')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Get angel number meaning for display
export function getAngelNumberMeaning(number: number): string {
  const meaning = ANGEL_NUMBER_MEANINGS[number]
  return meaning ? meaning.primaryMeaning : 'Divine guidance and spiritual message'
} 