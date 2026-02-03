/**
 * Sample Chart Data for Chinese Astrology Testing
 * Test data for development and validation
 */

import { BirthInfo, ZiWeiChartData } from './chineseAstrologyService'

// Sample birth information
export const sampleBirthInfo: BirthInfo = {
  solarDate: '1990-05-15',
  solarTime: '14:30',
  gender: 'male',
  location: {
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: 'America/New_York'
  }
}

// Sample birth information for female
export const sampleBirthInfoFemale: BirthInfo = {
  solarDate: '1985-12-08',
  solarTime: '09:15',
  gender: 'female',
  location: {
    latitude: 34.0522,
    longitude: -118.2437,
    timezone: 'America/Los_Angeles'
  }
}

// Expected chart outputs for validation
export const expectedChartOutputs = {
  // Test solar to lunar conversion
  solarToLunar: {
    '1990-05-15': {
      year: 1990,
      month: 4,
      day: 21,
      isLeapMonth: false,
      lunarYear: 1990,
      lunarMonth: '四月',
      lunarDay: '廿一'
    }
  },
  
  // Test Chinese zodiac calculations
  zodiacAnimals: {
    1990: {
      animal: 'Horse',
      animalChinese: '马',
      element: 'metal',
      yinYang: 'yang'
    },
    1985: {
      animal: 'Ox',
      animalChinese: '牛',
      element: 'wood',
      yinYang: 'yang'
    }
  },
  
  // Test Four Pillars calculations
  fourPillars: {
    '1990-05-15': {
      year: {
        heavenlyStem: '庚',
        earthlyBranch: '午',
        element: 'metal'
      },
      month: {
        heavenlyStem: '辛',
        earthlyBranch: '巳',
        element: 'metal'
      },
      day: {
        heavenlyStem: '壬',
        earthlyBranch: '午',
        element: 'water'
      },
      hour: {
        heavenlyStem: '丁',
        earthlyBranch: '未',
        element: 'fire'
      }
    }
  }
}

// Sample palace analysis examples
export const samplePalaceAnalysis = {
  lifePalace: {
    name: 'Life Palace',
    nameChinese: '命宫',
    interpretation: 'Strong leadership qualities with natural charisma. The person has excellent communication skills and is well-suited for positions of authority.',
    keywords: ['leadership', 'charisma', 'communication', 'authority'],
    strength: 0.85,
    element: 'fire'
  },
  
  wealthPalace: {
    name: 'Wealth Palace',
    nameChinese: '财帛宫',
    interpretation: 'Good financial management abilities. The person can accumulate wealth through hard work and smart investments.',
    keywords: ['wealth', 'investment', 'financial', 'prosperity'],
    strength: 0.72,
    element: 'metal'
  },
  
  marriagePalace: {
    name: 'Marriage Palace',
    nameChinese: '夫妻宫',
    interpretation: 'Strong potential for harmonious relationships. The person values loyalty and commitment in partnerships.',
    keywords: ['marriage', 'partnership', 'loyalty', 'harmony'],
    strength: 0.68,
    element: 'water'
  }
}

// Sample star interpretations
export const sampleStarInterpretations = {
  purpleStar: {
    name: 'Purple Star',
    nameChinese: '紫微星',
    interpretation: 'The Emperor Star - represents natural leadership and authority. When strong, indicates potential for high social status.',
    nature: 'auspicious',
    element: 'earth',
    keywords: ['leadership', 'authority', 'status', 'power']
  },
  
  heavenlySecret: {
    name: 'Heavenly Secret',
    nameChinese: '天機星',
    interpretation: 'The Wisdom Star - represents intelligence, strategy, and adaptability. Strong analytical and problem-solving abilities.',
    nature: 'neutral',
    element: 'wood',
    keywords: ['intelligence', 'strategy', 'wisdom', 'adaptability']
  },
  
  sun: {
    name: 'Sun',
    nameChinese: '太陽星',
    interpretation: 'The Sun Star - represents vitality, creativity, and self-expression. Brings warmth and positive energy.',
    nature: 'auspicious',
    element: 'fire',
    keywords: ['vitality', 'creativity', 'expression', 'energy']
  }
}

// Sample fortune cycle predictions
export const sampleFortuneCycles = [
  {
    period: '0-10',
    startAge: 0,
    endAge: 10,
    element: 'wood',
    nature: 'good',
    description: 'Early childhood shows good health and family support. Natural curiosity and learning ability.',
    focus: ['education', 'family', 'health'],
    warnings: [],
    opportunities: ['learning', 'growth', 'stability']
  },
  {
    period: '10-20',
    startAge: 10,
    endAge: 20,
    element: 'fire',
    nature: 'excellent',
    description: 'Teenage years bring excellent academic achievements and social development. Strong friendships formed.',
    focus: ['education', 'friendships', 'social'],
    warnings: [],
    opportunities: ['academic success', 'leadership', 'creativity']
  },
  {
    period: '20-30',
    startAge: 20,
    endAge: 30,
    element: 'earth',
    nature: 'challenging',
    description: 'Early adulthood presents challenges in career and relationships. Requires patience and persistence.',
    focus: ['career', 'relationships', 'independence'],
    warnings: ['financial stress', 'relationship conflicts'],
    opportunities: ['skill development', 'networking']
  }
]

// Test data for element balance
export const sampleElementBalance = {
  wood: 2,
  fire: 3,
  earth: 1,
  metal: 2,
  water: 0,
  dominant: 'fire',
  weak: 'water',
  recommendations: [
    'Strengthen water element through meditation and reflection',
    'Balance fire dominance with cooling activities',
    'Develop emotional intelligence and intuition'
  ]
}

// Sample Chinese zodiac compatibility
export const sampleZodiacCompatibility = {
  horse: {
    excellent: ['Tiger', 'Dog', 'Goat'],
    good: ['Rabbit', 'Dragon', 'Snake'],
    neutral: ['Rat', 'Ox', 'Monkey', 'Rooster', 'Pig'],
    challenging: []
  },
  ox: {
    excellent: ['Snake', 'Rooster', 'Rat'],
    good: ['Tiger', 'Rabbit', 'Monkey'],
    neutral: ['Dragon', 'Horse', 'Goat', 'Pig'],
    challenging: ['Dog']
  }
}

// Validation test cases
export const validationTestCases = [
  {
    name: 'Solar to Lunar Conversion',
    input: '1990-05-15',
    expectedOutput: {
      lunarMonth: 4,
      lunarDay: 21,
      isLeapMonth: false
    },
    description: 'Test accurate solar to lunar calendar conversion'
  },
  {
    name: 'Chinese Zodiac Calculation',
    input: 1990,
    expectedOutput: {
      animal: 'Horse',
      element: 'metal'
    },
    description: 'Test Chinese zodiac animal and element calculation'
  },
  {
    name: 'Four Pillars Generation',
    input: {
      year: 1990,
      month: 5,
      day: 15,
      hour: 14
    },
    expectedOutput: {
      yearPillar: { heavenlyStem: '庚', earthlyBranch: '午' },
      monthPillar: { heavenlyStem: '辛', earthlyBranch: '巳' },
      dayPillar: { heavenlyStem: '壬', earthlyBranch: '午' },
      hourPillar: { heavenlyStem: '丁', earthlyBranch: '未' }
    },
    description: 'Test Four Pillars calculation accuracy'
  },
  {
    name: 'Element Balance Analysis',
    input: {
      year: 'metal',
      month: 'metal',
      day: 'water',
      hour: 'fire'
    },
    expectedOutput: {
      dominant: 'metal',
      weak: 'wood',
      earth: 0
    },
    description: 'Test element balance calculation'
  }
]

// Performance test data
export const performanceTestData = {
  // Large dataset for performance testing
  bulkBirthDates: Array.from({ length: 100 }, (_, i) => ({
    solarDate: `199${i % 10}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    solarTime: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    gender: Math.random() > 0.5 ? 'male' : 'female'
  })),
  
  // Stress test data
  stressTestBirthDates: [
    '1900-01-01', // Very old date
    '2100-12-31', // Future date
    '2000-02-29', // Leap year
    '2024-12-31', // Recent date
    '1950-06-15', // Mid-century
  ]
}

// Error test cases
export const errorTestCases = [
  {
    name: 'Invalid Date Format',
    input: 'invalid-date',
    expectedError: 'Invalid date format',
    description: 'Test handling of invalid date inputs'
  },
  {
    name: 'Missing Birth Time',
    input: {
      solarDate: '1990-05-15',
      solarTime: '',
      gender: 'male'
    },
    expectedError: 'Birth time is required',
    description: 'Test validation of required fields'
  },
  {
    name: 'Invalid Gender',
    input: {
      solarDate: '1990-05-15',
      solarTime: '14:30',
      gender: 'invalid'
    },
    expectedError: 'Gender must be male or female',
    description: 'Test gender validation'
  }
]

// Export all sample data
export const sampleData = {
  birthInfo: sampleBirthInfo,
  birthInfoFemale: sampleBirthInfoFemale,
  expectedOutputs: expectedChartOutputs,
  palaceAnalysis: samplePalaceAnalysis,
  starInterpretations: sampleStarInterpretations,
  fortuneCycles: sampleFortuneCycles,
  elementBalance: sampleElementBalance,
  zodiacCompatibility: sampleZodiacCompatibility,
  validationTestCases,
  performanceTestData,
  errorTestCases
}
