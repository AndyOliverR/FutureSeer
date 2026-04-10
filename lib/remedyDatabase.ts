// Comprehensive Remedy Database System
// Generates personalized remedies based on individual astrological and numerological profiles

import { Gem, Watch, Circle, Diamond, Palette, Clock, Heart, Shield, Zap, Star, Moon, Sun } from 'lucide-react'

export interface Remedy {
  id: string
  type: 'gemstone' | 'color' | 'metal' | 'timing' | 'action' | 'crystal' | 'accessory' | 'mantra' | 'mudra' | 'ritual' | 'diet' | 'lifestyle'
  title: string
  description: string
  icon: string
  priority: 'high' | 'medium' | 'low'
  instructions: string[]
  benefits: string[]
  contraindications?: string[]
  activationTime?: string
  duration?: string
  frequency?: string
  cost?: 'free' | 'low' | 'medium' | 'high'
  difficulty?: 'easy' | 'moderate' | 'advanced'
  astrologicalTriggers?: string[]
  numerologicalTriggers?: string[]
  elementalAssociations?: string[]
  planetaryRulers?: string[]
}

// Comprehensive Gemstone Database
export const GEMSTONE_DATABASE = {
  // Sun Sign Gemstones
  aries: [
    {
      name: 'Red Coral',
      description: 'Enhances courage, leadership, and Mars energy',
      instructions: ['Set in gold ring', 'Wear on ring finger', 'Activate on Tuesday'],
      benefits: ['Increases courage', 'Improves leadership', 'Enhances physical energy'],
      planetaryRuler: 'Mars',
      element: 'Fire'
    },
    {
      name: 'Bloodstone',
      description: 'Protects against negative energies and enhances vitality',
      instructions: ['Wear as pendant', 'Keep in pocket', 'Activate on Tuesday'],
      benefits: ['Protection', 'Vitality', 'Courage'],
      planetaryRuler: 'Mars',
      element: 'Fire'
    }
  ],
  taurus: [
    {
      name: 'Emerald',
      description: 'Enhances love, prosperity, and Venus energy',
      instructions: ['Set in silver ring', 'Wear on little finger', 'Activate on Friday'],
      benefits: ['Love and relationships', 'Financial prosperity', 'Harmony'],
      planetaryRuler: 'Venus',
      element: 'Earth'
    },
    {
      name: 'Rose Quartz',
      description: 'Promotes love, compassion, and emotional healing',
      instructions: ['Wear as pendant', 'Keep under pillow', 'Activate on Friday'],
      benefits: ['Emotional healing', 'Love attraction', 'Compassion'],
      planetaryRuler: 'Venus',
      element: 'Earth'
    }
  ],
  gemini: [
    {
      name: 'Yellow Sapphire',
      description: 'Enhances communication, wisdom, and Mercury energy',
      instructions: ['Set in gold ring', 'Wear on index finger', 'Activate on Wednesday'],
      benefits: ['Communication skills', 'Wisdom', 'Business success'],
      planetaryRuler: 'Mercury',
      element: 'Air'
    },
    {
      name: 'Citrine',
      description: 'Promotes optimism, creativity, and mental clarity',
      instructions: ['Wear as pendant', 'Keep on desk', 'Activate on Wednesday'],
      benefits: ['Optimism', 'Creativity', 'Mental clarity'],
      planetaryRuler: 'Mercury',
      element: 'Air'
    }
  ],
  cancer: [
    {
      name: 'Pearl',
      description: 'Enhances emotional balance and Moon energy',
      instructions: ['Set in silver ring', 'Wear on little finger', 'Activate on Monday'],
      benefits: ['Emotional balance', 'Intuition', 'Protection'],
      planetaryRuler: 'Moon',
      element: 'Water'
    },
    {
      name: 'Moonstone',
      description: 'Enhances intuition, psychic abilities, and emotional healing',
      instructions: ['Wear as pendant', 'Keep under pillow', 'Activate on Monday'],
      benefits: ['Intuition', 'Psychic abilities', 'Emotional healing'],
      planetaryRuler: 'Moon',
      element: 'Water'
    }
  ],
  leo: [
    {
      name: 'Ruby',
      description: 'Enhances leadership, creativity, and Sun energy',
      instructions: ['Set in gold ring', 'Wear on ring finger', 'Activate on Sunday'],
      benefits: ['Leadership', 'Creativity', 'Confidence'],
      planetaryRuler: 'Sun',
      element: 'Fire'
    },
    {
      name: 'Amber',
      description: 'Promotes vitality, protection, and positive energy',
      instructions: ['Wear as pendant', 'Keep in pocket', 'Activate on Sunday'],
      benefits: ['Vitality', 'Protection', 'Positive energy'],
      planetaryRuler: 'Sun',
      element: 'Fire'
    }
  ],
  virgo: [
    {
      name: 'Peridot',
      description: 'Enhances healing, purification, and Mercury energy',
      instructions: ['Set in silver ring', 'Wear on little finger', 'Activate on Wednesday'],
      benefits: ['Healing', 'Purification', 'Mental clarity'],
      planetaryRuler: 'Mercury',
      element: 'Earth'
    },
    {
      name: 'Green Aventurine',
      description: 'Promotes luck, abundance, and emotional healing',
      instructions: ['Wear as pendant', 'Keep in wallet', 'Activate on Wednesday'],
      benefits: ['Luck', 'Abundance', 'Emotional healing'],
      planetaryRuler: 'Mercury',
      element: 'Earth'
    }
  ],
  libra: [
    {
      name: 'Opal',
      description: 'Enhances balance, harmony, and Venus energy',
      instructions: ['Set in silver ring', 'Wear on ring finger', 'Activate on Friday'],
      benefits: ['Balance', 'Harmony', 'Creativity'],
      planetaryRuler: 'Venus',
      element: 'Air'
    },
    {
      name: 'Pink Tourmaline',
      description: 'Promotes love, compassion, and emotional healing',
      instructions: ['Wear as pendant', 'Keep near heart', 'Activate on Friday'],
      benefits: ['Love', 'Compassion', 'Emotional healing'],
      planetaryRuler: 'Venus',
      element: 'Air'
    }
  ],
  scorpio: [
    {
      name: 'Blue Sapphire',
      description: 'Enhances wisdom, protection, and Saturn energy',
      instructions: ['Set in silver ring', 'Wear on middle finger', 'Activate on Saturday'],
      benefits: ['Wisdom', 'Protection', 'Discipline'],
      planetaryRuler: 'Saturn',
      element: 'Water'
    },
    {
      name: 'Obsidian',
      description: 'Provides protection, grounding, and transformation',
      instructions: ['Wear as pendant', 'Keep in pocket', 'Activate on Saturday'],
      benefits: ['Protection', 'Grounding', 'Transformation'],
      planetaryRuler: 'Pluto',
      element: 'Water'
    }
  ],
  sagittarius: [
    {
      name: 'Yellow Sapphire',
      description: 'Enhances wisdom, spirituality, and Jupiter energy',
      instructions: ['Set in gold ring', 'Wear on index finger', 'Activate on Thursday'],
      benefits: ['Wisdom', 'Spirituality', 'Expansion'],
      planetaryRuler: 'Jupiter',
      element: 'Fire'
    },
    {
      name: 'Lapis Lazuli',
      description: 'Promotes wisdom, truth, and spiritual awareness',
      instructions: ['Wear as pendant', 'Keep on altar', 'Activate on Thursday'],
      benefits: ['Wisdom', 'Truth', 'Spiritual awareness'],
      planetaryRuler: 'Jupiter',
      element: 'Fire'
    }
  ],
  capricorn: [
    {
      name: 'Blue Sapphire',
      description: 'Enhances discipline, wisdom, and Saturn energy',
      instructions: ['Set in silver ring', 'Wear on middle finger', 'Activate on Saturday'],
      benefits: ['Discipline', 'Wisdom', 'Career success'],
      planetaryRuler: 'Saturn',
      element: 'Earth'
    },
    {
      name: 'Onyx',
      description: 'Provides protection, grounding, and strength',
      instructions: ['Wear as pendant', 'Keep in pocket', 'Activate on Saturday'],
      benefits: ['Protection', 'Grounding', 'Strength'],
      planetaryRuler: 'Saturn',
      element: 'Earth'
    }
  ],
  aquarius: [
    {
      name: 'Amethyst',
      description: 'Enhances spirituality, intuition, and Uranus energy',
      instructions: ['Set in silver ring', 'Wear on middle finger', 'Activate on Saturday'],
      benefits: ['Spirituality', 'Intuition', 'Innovation'],
      planetaryRuler: 'Uranus',
      element: 'Air'
    },
    {
      name: 'Aquamarine',
      description: 'Promotes communication, courage, and healing',
      instructions: ['Wear as pendant', 'Keep near throat', 'Activate on Saturday'],
      benefits: ['Communication', 'Courage', 'Healing'],
      planetaryRuler: 'Uranus',
      element: 'Air'
    }
  ],
  pisces: [
    {
      name: 'Aquamarine',
      description: 'Enhances intuition, spirituality, and Neptune energy',
      instructions: ['Set in silver ring', 'Wear on little finger', 'Activate on Monday'],
      benefits: ['Intuition', 'Spirituality', 'Healing'],
      planetaryRuler: 'Neptune',
      element: 'Water'
    },
    {
      name: 'Amethyst',
      description: 'Promotes spiritual awareness, protection, and peace',
      instructions: ['Wear as pendant', 'Keep under pillow', 'Activate on Monday'],
      benefits: ['Spiritual awareness', 'Protection', 'Peace'],
      planetaryRuler: 'Neptune',
      element: 'Water'
    }
  ]
}

// Numerology-based Remedies
export const NUMEROLOGY_REMEDIES = {
  missingNumbers: {
    1: {
      title: 'Leadership Development',
      type: 'lifestyle',
      description: 'Enhance your leadership qualities and independence',
      instructions: [
        'Take initiative in daily activities',
        'Practice decision-making exercises',
        'Wear red clothing on Sundays',
        'Meditate on the Sun for 10 minutes daily'
      ],
      benefits: ['Increased confidence', 'Better leadership skills', 'Enhanced independence']
    },
    2: {
      title: 'Partnership Enhancement',
      type: 'lifestyle',
      description: 'Strengthen your cooperative and diplomatic abilities',
      instructions: [
        'Practice active listening',
        'Wear white clothing on Mondays',
        'Meditate on the Moon for 10 minutes daily',
        'Engage in collaborative activities'
      ],
      benefits: ['Better relationships', 'Enhanced diplomacy', 'Improved cooperation']
    },
    3: {
      title: 'Creative Expression',
      type: 'lifestyle',
      description: 'Develop your creative and expressive abilities',
      instructions: [
        'Engage in creative activities daily',
        'Wear yellow clothing on Thursdays',
        'Practice public speaking',
        'Express gratitude daily'
      ],
      benefits: ['Enhanced creativity', 'Better communication', 'Increased joy']
    },
    4: {
      title: 'Stability and Organization',
      type: 'lifestyle',
      description: 'Build strong foundations and organizational skills',
      instructions: [
        'Create daily routines',
        'Organize your living space',
        'Wear green clothing on Wednesdays',
        'Practice grounding exercises'
      ],
      benefits: ['Better organization', 'Increased stability', 'Enhanced discipline']
    },
    5: {
      title: 'Freedom and Adventure',
      type: 'lifestyle',
      description: 'Embrace change and develop adaptability',
      instructions: [
        'Try new experiences weekly',
        'Wear blue clothing on Wednesdays',
        'Practice flexibility exercises',
        'Travel to new places when possible'
      ],
      benefits: ['Enhanced adaptability', 'Increased freedom', 'Better communication']
    },
    6: {
      title: 'Responsibility and Nurturing',
      type: 'lifestyle',
      description: 'Develop your caring and responsible nature',
      instructions: [
        'Help others daily',
        'Wear pink clothing on Fridays',
        'Practice compassion meditation',
        'Take care of plants or pets'
      ],
      benefits: ['Enhanced compassion', 'Better relationships', 'Increased responsibility']
    },
    7: {
      title: 'Spiritual Development',
      type: 'lifestyle',
      description: 'Deepen your spiritual awareness and intuition',
      instructions: [
        'Practice meditation daily',
        'Wear purple clothing on Saturdays',
        'Study spiritual texts',
        'Spend time in nature'
      ],
      benefits: ['Enhanced intuition', 'Spiritual growth', 'Better wisdom']
    },
    8: {
      title: 'Material Success',
      type: 'lifestyle',
      description: 'Develop your business acumen and material success',
      instructions: [
        'Set financial goals',
        'Wear black clothing on Saturdays',
        'Practice abundance meditation',
        'Learn about investments'
      ],
      benefits: ['Financial success', 'Better business skills', 'Enhanced authority']
    },
    9: {
      title: 'Universal Love',
      type: 'lifestyle',
      description: 'Develop compassion and universal understanding',
      instructions: [
        'Practice forgiveness daily',
        'Wear white clothing on Sundays',
        'Help those in need',
        'Study world religions'
      ],
      benefits: ['Enhanced compassion', 'Universal understanding', 'Spiritual completion']
    }
  },
  lifePathNumbers: {
    1: {
      title: 'Natural Leadership',
      type: 'lifestyle',
      description: 'Embrace your natural leadership abilities',
      instructions: [
        'Take charge of situations',
        'Wear red or orange clothing',
        'Practice confidence-building exercises',
        'Lead group activities'
      ],
      benefits: ['Enhanced leadership', 'Increased confidence', 'Better independence']
    },
    2: {
      title: 'Diplomatic Harmony',
      type: 'lifestyle',
      description: 'Develop your natural diplomatic abilities',
      instructions: [
        'Practice active listening',
        'Wear white or cream clothing',
        'Meditate on peace and harmony',
        'Resolve conflicts diplomatically'
      ],
      benefits: ['Better relationships', 'Enhanced diplomacy', 'Increased harmony']
    }
    // ... continue for all life path numbers
  }
}

// Color Therapy Database
export const COLOR_THERAPY = {
  red: {
    title: 'Energy and Courage',
    description: 'Enhance physical energy and courage',
    instructions: [
      'Wear red clothing on Tuesdays',
      'Use red accessories',
      'Eat red foods (tomatoes, strawberries)',
      'Meditate on red light'
    ],
    benefits: ['Increased energy', 'Enhanced courage', 'Better physical vitality'],
    elementalAssociations: ['Fire'],
    planetaryRulers: ['Mars']
  },
  orange: {
    title: 'Creativity and Joy',
    description: 'Boost creativity and bring joy',
    instructions: [
      'Wear orange clothing on Sundays',
      'Use orange in your workspace',
      'Eat orange foods (oranges, carrots)',
      'Practice creative activities'
    ],
    benefits: ['Enhanced creativity', 'Increased joy', 'Better social skills'],
    elementalAssociations: ['Fire'],
    planetaryRulers: ['Sun']
  },
  yellow: {
    title: 'Intellect and Communication',
    description: 'Enhance mental clarity and communication',
    instructions: [
      'Wear yellow clothing on Wednesdays',
      'Use yellow in study areas',
      'Eat yellow foods (bananas, corn)',
      'Practice clear communication'
    ],
    benefits: ['Better communication', 'Enhanced intellect', 'Increased optimism'],
    elementalAssociations: ['Air'],
    planetaryRulers: ['Mercury']
  },
  green: {
    title: 'Growth and Healing',
    description: 'Promote growth and emotional healing',
    instructions: [
      'Wear green clothing on Wednesdays',
      'Spend time in nature',
      'Eat green vegetables',
      'Practice heart-opening meditation'
    ],
    benefits: ['Emotional healing', 'Personal growth', 'Better health'],
    elementalAssociations: ['Earth'],
    planetaryRulers: ['Venus']
  },
  blue: {
    title: 'Peace and Communication',
    description: 'Enhance peace and communication',
    instructions: [
      'Wear blue clothing on Wednesdays',
      'Use blue in meditation spaces',
      'Drink plenty of water',
      'Practice peaceful meditation'
    ],
    benefits: ['Enhanced peace', 'Better communication', 'Increased calmness'],
    elementalAssociations: ['Water'],
    planetaryRulers: ['Mercury']
  },
  purple: {
    title: 'Spirituality and Wisdom',
    description: 'Deepen spiritual awareness and wisdom',
    instructions: [
      'Wear purple clothing on Saturdays',
      'Use purple in spiritual spaces',
      'Practice spiritual meditation',
      'Study spiritual texts'
    ],
    benefits: ['Spiritual growth', 'Enhanced wisdom', 'Better intuition'],
    elementalAssociations: ['Water'],
    planetaryRulers: ['Saturn']
  },
  white: {
    title: 'Purity and Clarity',
    description: 'Promote purity and mental clarity',
    instructions: [
      'Wear white clothing on Mondays',
      'Use white in living spaces',
      'Practice purification rituals',
      'Meditate on white light'
    ],
    benefits: ['Mental clarity', 'Emotional purity', 'Better focus'],
    elementalAssociations: ['Air'],
    planetaryRulers: ['Moon']
  },
  black: {
    title: 'Protection and Mystery',
    description: 'Provide protection and enhance mystery',
    instructions: [
      'Wear black clothing on Saturdays',
      'Use black for protection rituals',
      'Practice grounding exercises',
      'Meditate on protection'
    ],
    benefits: ['Enhanced protection', 'Better grounding', 'Increased mystery'],
    elementalAssociations: ['Earth'],
    planetaryRulers: ['Saturn']
  }
}

// Mantra Database
export const MANTRA_DATABASE = {
  om: {
    title: 'Universal Sound',
    description: 'The primordial sound that connects to universal consciousness',
    instructions: [
      'Chant "Om" 108 times daily',
      'Best time: Sunrise or sunset',
      'Sit in lotus position',
      'Focus on the third eye'
    ],
    benefits: ['Universal connection', 'Spiritual awakening', 'Inner peace'],
    difficulty: 'easy',
    duration: '10-30 minutes'
  },
  gayatri: {
    title: 'Gayatri Mantra',
    description: 'Sacred mantra for divine wisdom and enlightenment',
    instructions: [
      'Chant 108 times at sunrise',
      'Face east direction',
      'Use rudraksha mala',
      'Maintain pure thoughts'
    ],
    benefits: ['Divine wisdom', 'Spiritual enlightenment', 'Mental clarity'],
    difficulty: 'moderate',
    duration: '15-45 minutes'
  },
  mahaMrityunjaya: {
    title: 'Maha Mrityunjaya Mantra',
    description: 'Powerful mantra for health, longevity, and overcoming death',
    instructions: [
      'Chant 108 times daily',
      'Best time: Early morning',
      'Use crystal mala',
      'Focus on healing energy'
    ],
    benefits: ['Health and longevity', 'Protection from illness', 'Spiritual strength'],
    difficulty: 'moderate',
    duration: '20-40 minutes'
  }
}

// Mudra Database
export const MUDRA_DATABASE = {
  gyan: {
    title: 'Gyan Mudra',
    description: 'Mudra of knowledge and wisdom',
    instructions: [
      'Join index finger tip to thumb tip',
      'Keep other fingers straight',
      'Hold for 15-30 minutes daily',
      'Best time: Morning meditation'
    ],
    benefits: ['Enhanced wisdom', 'Better concentration', 'Mental clarity'],
    elementalAssociations: ['Air'],
    planetaryRulers: ['Jupiter']
  },
  prithvi: {
    title: 'Prithvi Mudra',
    description: 'Mudra of earth element for grounding',
    instructions: [
      'Join ring finger tip to thumb tip',
      'Keep other fingers straight',
      'Hold for 15-30 minutes daily',
      'Best time: Evening'
    ],
    benefits: ['Better grounding', 'Increased stability', 'Physical strength'],
    elementalAssociations: ['Earth'],
    planetaryRulers: ['Venus']
  },
  varun: {
    title: 'Varun Mudra',
    description: 'Mudra of water element for emotional balance',
    instructions: [
      'Join little finger tip to thumb tip',
      'Keep other fingers straight',
      'Hold for 15-30 minutes daily',
      'Best time: Evening'
    ],
    benefits: ['Emotional balance', 'Better communication', 'Fluid thinking'],
    elementalAssociations: ['Water'],
    planetaryRulers: ['Moon']
  },
  agni: {
    title: 'Agni Mudra',
    description: 'Mudra of fire element for energy and transformation',
    instructions: [
      'Join ring finger tip to thumb tip',
      'Keep other fingers straight',
      'Hold for 15-30 minutes daily',
      'Best time: Morning'
    ],
    benefits: ['Increased energy', 'Better digestion', 'Transformation'],
    elementalAssociations: ['Fire'],
    planetaryRulers: ['Mars']
  }
}

// Main Remedy Generation Function
export function generatePersonalizedRemedies(
  astroData: any,
  numerologyData: any,
  faceReadingData: any,
  palmReadingData: any,
  question: string,
  userProfile: any
): Remedy[] {
  const remedies: Remedy[] = []
  
  // 1. Sun Sign Gemstones
  if (astroData?.sun_sign) {
    const sunSign = astroData.sun_sign.toLowerCase()
    const gemstones = GEMSTONE_DATABASE[sunSign as keyof typeof GEMSTONE_DATABASE]
    
    if (gemstones && gemstones.length > 0) {
      const primaryGemstone = gemstones[0]
      remedies.push({
        id: `gemstone_${sunSign}_primary`,
        type: 'gemstone',
        title: primaryGemstone.name,
        description: primaryGemstone.description,
        icon: 'gem',
        priority: 'high',
        instructions: primaryGemstone.instructions,
        benefits: primaryGemstone.benefits,
        activationTime: `Activate on ${getPlanetaryDay(primaryGemstone.planetaryRuler)}`,
        duration: 'Wear daily',
        frequency: 'Daily',
        cost: 'medium',
        difficulty: 'easy',
        astrologicalTriggers: [astroData.sun_sign],
        planetaryRulers: [primaryGemstone.planetaryRuler],
        elementalAssociations: [primaryGemstone.element]
      })
    }
  }

  // 2. Numerology-based Remedies
  if (numerologyData?.missingNumbers && numerologyData.missingNumbers.length > 0) {
    numerologyData.missingNumbers.forEach((number: number) => {
      const remedy = NUMEROLOGY_REMEDIES.missingNumbers[number as keyof typeof NUMEROLOGY_REMEDIES.missingNumbers]
      if (remedy) {
        remedies.push({
          id: `numerology_${number}`,
          type: remedy.type as any,
          title: remedy.title,
          description: remedy.description,
          icon: 'star',
          priority: 'high',
          instructions: remedy.instructions,
          benefits: remedy.benefits,
          duration: 'Daily practice',
          frequency: 'Daily',
          cost: 'free',
          difficulty: 'easy',
          numerologicalTriggers: [`Missing number ${number}`]
        })
      }
    })
  }

  // 3. Life Path Number Remedies
  if (numerologyData?.lifePathNumber) {
    const lifePathRemedy = NUMEROLOGY_REMEDIES.lifePathNumbers[numerologyData.lifePathNumber as keyof typeof NUMEROLOGY_REMEDIES.lifePathNumbers]
    if (lifePathRemedy) {
      remedies.push({
        id: `lifepath_${numerologyData.lifePathNumber}`,
        type: lifePathRemedy.type as any,
        title: lifePathRemedy.title,
        description: lifePathRemedy.description,
        icon: 'heart',
        priority: 'medium',
        instructions: lifePathRemedy.instructions,
        benefits: lifePathRemedy.benefits,
        duration: 'Daily practice',
        frequency: 'Daily',
        cost: 'free',
        difficulty: 'easy',
        numerologicalTriggers: [`Life Path Number ${numerologyData.lifePathNumber}`]
      })
    }
  }

  // 4. Color Therapy based on dominant elements
  const dominantElement = getDominantElement(astroData)
  if (dominantElement) {
    const colorRemedy = getColorForElement(dominantElement)
    if (colorRemedy) {
      remedies.push({
        id: `color_${dominantElement}`,
        type: 'color',
        title: colorRemedy.title,
        description: colorRemedy.description,
        icon: 'palette',
        priority: 'medium',
        instructions: colorRemedy.instructions,
        benefits: colorRemedy.benefits,
        duration: 'Daily wear',
        frequency: 'Daily',
        cost: 'low',
        difficulty: 'easy',
        astrologicalTriggers: [dominantElement],
        elementalAssociations: [dominantElement]
      })
    }
  }

  // 5. Mantra based on spiritual needs
  if (question.toLowerCase().includes('spiritual') || question.toLowerCase().includes('peace')) {
    const mantra = MANTRA_DATABASE.om
    remedies.push({
      id: 'mantra_om',
      type: 'mantra',
      title: mantra.title,
      description: mantra.description,
      icon: 'circle',
      priority: 'medium',
      instructions: mantra.instructions,
      benefits: mantra.benefits,
      duration: mantra.duration,
      frequency: 'Daily',
      cost: 'free',
      difficulty: mantra.difficulty as any,
      activationTime: 'Sunrise or sunset'
    })
  }

  // 6. Mudra based on elemental balance
  const mudra = getBalancingMudra(astroData)
  if (mudra) {
    remedies.push({
      id: `mudra_${mudra.title.toLowerCase().replace(' ', '_')}`,
      type: 'mudra',
      title: mudra.title,
      description: mudra.description,
      icon: 'shield',
      priority: 'medium',
      instructions: mudra.instructions,
      benefits: mudra.benefits,
      duration: '15-30 minutes',
      frequency: 'Daily',
      cost: 'free',
      difficulty: 'easy',
      elementalAssociations: mudra.elementalAssociations,
      planetaryRulers: mudra.planetaryRulers
    })
  }

  // 7. Timing-based remedies
  const timingRemedy = generateTimingRemedy(astroData, numerologyData)
  if (timingRemedy) {
    remedies.push(timingRemedy)
  }

  // 8. Lifestyle remedies based on question analysis
  const lifestyleRemedies = generateLifestyleRemedies(question, astroData, numerologyData)
  remedies.push(...lifestyleRemedies)

  return remedies.slice(0, 8) // Return max 8 remedies
}

// Helper Functions
function getPlanetaryDay(planet: string): string {
  const planetaryDays: { [key: string]: string } = {
    'Sun': 'Sunday',
    'Moon': 'Monday',
    'Mars': 'Tuesday',
    'Mercury': 'Wednesday',
    'Jupiter': 'Thursday',
    'Venus': 'Friday',
    'Saturn': 'Saturday'
  }
  return planetaryDays[planet] || 'Daily'
}

function getDominantElement(astroData: any): string | null {
  if (!astroData?.elements) return null
  
  const elements = astroData.elements
  const maxElement = Math.max(elements.fire || 0, elements.earth || 0, elements.air || 0, elements.water || 0)
  
  if (elements.fire === maxElement) return 'Fire'
  if (elements.earth === maxElement) return 'Earth'
  if (elements.air === maxElement) return 'Air'
  if (elements.water === maxElement) return 'Water'
  
  return null
}

function getColorForElement(element: string) {
  const elementColors: { [key: string]: any } = {
    'Fire': COLOR_THERAPY.red,
    'Earth': COLOR_THERAPY.green,
    'Air': COLOR_THERAPY.yellow,
    'Water': COLOR_THERAPY.blue
  }
  return elementColors[element]
}

function getBalancingMudra(astroData: any) {
  const dominantElement = getDominantElement(astroData)
  const balancingMudras: { [key: string]: any } = {
    'Fire': MUDRA_DATABASE.varun, // Water mudra to balance fire
    'Earth': MUDRA_DATABASE.gyan, // Air mudra to balance earth
    'Air': MUDRA_DATABASE.prithvi, // Earth mudra to balance air
    'Water': MUDRA_DATABASE.agni // Fire mudra to balance water
  }
  return balancingMudras[dominantElement || '']
}

function generateTimingRemedy(astroData: any, numerologyData: any): Remedy | null {
  const currentHour = new Date().getHours()
  const currentDay = new Date().getDay()
  
  return {
    id: 'timing_optimization',
    type: 'timing',
    title: 'Optimal Timing for Activities',
    description: 'Align your activities with cosmic timing for maximum effectiveness',
            icon: 'clock',
    priority: 'medium',
    instructions: [
      'Schedule important meetings during Mercury hours (6-8 AM, 2-4 PM)',
      'Practice spiritual activities during Jupiter hours (6-8 PM)',
      'Exercise during Mars hours (6-8 AM)',
      'Creative work during Venus hours (2-4 PM)'
    ],
    benefits: ['Better timing', 'Enhanced effectiveness', 'Cosmic alignment'],
    duration: 'Daily practice',
    frequency: 'Daily',
    cost: 'free',
    difficulty: 'easy'
  }
}

function generateLifestyleRemedies(question: string, astroData: any, numerologyData: any): Remedy[] {
  const remedies: Remedy[] = []
  
  // Analyze question keywords
  const questionLower = question.toLowerCase()
  
  if (questionLower.includes('career') || questionLower.includes('job') || questionLower.includes('work')) {
    remedies.push({
      id: 'career_enhancement',
      type: 'lifestyle',
      title: 'Career Enhancement Practices',
      description: 'Boost your professional success and career growth',
      icon: 'zap',
      priority: 'high',
      instructions: [
        'Dress professionally in your power colors',
        'Practice confidence-building exercises',
        'Network actively in your field',
        'Set clear career goals and timelines'
      ],
      benefits: ['Career advancement', 'Professional success', 'Better opportunities'],
      duration: 'Daily practice',
      frequency: 'Daily',
      cost: 'low',
      difficulty: 'easy'
    })
  }
  
  if (questionLower.includes('love') || questionLower.includes('relationship') || questionLower.includes('romance')) {
    remedies.push({
      id: 'love_enhancement',
      type: 'lifestyle',
      title: 'Love and Relationship Enhancement',
      description: 'Attract and nurture loving relationships',
              icon: 'heart',
      priority: 'high',
      instructions: [
        'Wear pink or rose-colored clothing',
        'Practice self-love and self-care',
        'Open your heart to new possibilities',
        'Express love and gratitude daily'
      ],
      benefits: ['Better relationships', 'Increased love', 'Enhanced compassion'],
      duration: 'Daily practice',
      frequency: 'Daily',
      cost: 'free',
      difficulty: 'easy'
    })
  }
  
  if (questionLower.includes('health') || questionLower.includes('wellness') || questionLower.includes('healing')) {
    remedies.push({
      id: 'health_optimization',
      type: 'lifestyle',
      title: 'Health and Wellness Optimization',
      description: 'Enhance your physical and mental well-being',
              icon: 'shield',
      priority: 'high',
      instructions: [
        'Practice daily exercise or yoga',
        'Eat a balanced, nutritious diet',
        'Get adequate sleep (7-9 hours)',
        'Practice stress-reduction techniques'
      ],
      benefits: ['Better health', 'Increased energy', 'Enhanced well-being'],
      duration: 'Daily practice',
      frequency: 'Daily',
      cost: 'low',
      difficulty: 'easy'
    })
  }
  
  return remedies
}

const remedyDatabase = {
  generatePersonalizedRemedies,
  GEMSTONE_DATABASE,
  NUMEROLOGY_REMEDIES,
  COLOR_THERAPY,
  MANTRA_DATABASE,
  MUDRA_DATABASE
}

export default remedyDatabase