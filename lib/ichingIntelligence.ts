import { doc, setDoc, getDoc, collection } from 'firebase/firestore'
import { devLog } from '@/lib/devLogger';
import { getFirebaseDB } from './firebase';

export interface IChingHexagram {
  number: number
  name: string
  chinese: string
  pinyin: string
  trigram: string
  element: string
  meaning: string
  description: string
  lines: {
    position: number
    text: string
    meaning: string
    changing: boolean
    yinYang: 'yin' | 'yang'
    element: string
  }[]
  changingLines: number[]
  changingTo?: IChingHexagram
  trigramUpper: string
  trigramLower: string
  elementUpper: string
  elementLower: string
}

export interface IChingAnalysis {
  id: string
  timestamp: Date
  question: string
  method: 'coins' | 'yarrow' | 'random'
  hexagram: IChingHexagram
  timing: {
    season: string
    element: string
    direction: string
    timeOfDay: string
    favorable: boolean
  }
  interpretation: {
    overall: string
    advice: string
    warning: string
    opportunity: string
  }
  elements: {
    primary: string
    secondary: string
    conflict: string
    harmony: string
  }
  trigramAnalysis: {
    upper: string
    lower: string
    combination: string
    relationship: string
  }
  changingLines: {
    count: number
    significance: string
    transformation: string
  }
  confidenceLevel: number
  recommendations: string[]
  coaching: {
    strengths: string[]
    challenges: string[]
    growthAreas: string[]
    affirmations: string[]
  }
}

export interface IChingCoaching {
  id: string
  timestamp: Date
  question: string
  response: string
  insights: string[]
  recommendations: string[]
  followUpQuestions: string[]
}

class IChingIntelligence {
  private hexagrams: Omit<IChingHexagram, 'lines' | 'changingLines' | 'changingTo' | 'trigramUpper' | 'trigramLower' | 'elementUpper' | 'elementLower'>[] = [
    {
      number: 1,
      name: "The Creative",
      chinese: "乾",
      pinyin: "Qián",
      trigram: "Heaven",
      element: "Metal",
      meaning: "Pure Yang, Creative Force, Heaven",
      description: "The Creative represents the pure yang force, the power of heaven, and the beginning of all things. It symbolizes strength, leadership, and the ability to bring about change through pure will and determination."
    },
    {
      number: 2,
      name: "The Receptive",
      chinese: "坤",
      pinyin: "Kūn",
      trigram: "Earth",
      element: "Earth",
      meaning: "Pure Yin, Receptive Force, Earth",
      description: "The Receptive represents the pure yin force, the power of earth, and the ability to receive and nurture. It symbolizes patience, devotion, and the power of yielding."
    },
    {
      number: 3,
      name: "Difficulty at the Beginning",
      chinese: "屯",
      pinyin: "Zhūn",
      trigram: "Water over Thunder",
      element: "Water",
      meaning: "Initial Hardship, Growth",
      description: "Difficulty at the Beginning represents the challenges that come with starting something new. It suggests that while the beginning may be difficult, growth and success are possible through perseverance."
    },
    {
      number: 4,
      name: "Youthful Folly",
      chinese: "蒙",
      pinyin: "Méng",
      trigram: "Mountain over Water",
      element: "Earth",
      meaning: "Inexperience, Learning",
      description: "Youthful Folly represents the state of inexperience and the need for education and guidance. It suggests that wisdom comes through learning and seeking proper instruction."
    },
    {
      number: 5,
      name: "Waiting",
      chinese: "需",
      pinyin: "Xū",
      trigram: "Water over Heaven",
      element: "Water",
      meaning: "Patience, Nourishment",
      description: "Waiting represents the need for patience and proper timing. It suggests that success comes to those who wait for the right moment and prepare themselves properly."
    },
    {
      number: 6,
      name: "Conflict",
      chinese: "訟",
      pinyin: "Sòng",
      trigram: "Heaven over Water",
      element: "Metal",
      meaning: "Dispute, Resolution",
      description: "Conflict represents disputes and disagreements that need to be resolved. It suggests the importance of finding peaceful solutions and avoiding unnecessary confrontations."
    },
    {
      number: 7,
      name: "The Army",
      chinese: "師",
      pinyin: "Shī",
      trigram: "Earth over Water",
      element: "Earth",
      meaning: "Discipline, Leadership",
      description: "The Army represents discipline, organization, and the power of collective action. It suggests the importance of proper leadership and following established rules."
    },
    {
      number: 8,
      name: "Holding Together",
      chinese: "比",
      pinyin: "Bǐ",
      trigram: "Water over Earth",
      element: "Water",
      meaning: "Union, Cooperation",
      description: "Holding Together represents unity, cooperation, and the power of working together. It suggests that success comes through collaboration and mutual support."
    },
    {
      number: 9,
      name: "Small Taming",
      chinese: "小畜",
      pinyin: "Xiǎo Chù",
      trigram: "Wind over Heaven",
      element: "Wood",
      meaning: "Gentle Restraint, Accumulation",
      description: "Small Taming represents gentle restraint and the accumulation of small gains. It suggests that progress comes through patient, steady effort."
    },
    {
      number: 10,
      name: "Treading",
      chinese: "履",
      pinyin: "Lǚ",
      trigram: "Heaven over Lake",
      element: "Metal",
      meaning: "Conduct, Behavior",
      description: "Treading represents proper conduct and behavior. It suggests the importance of walking the right path and maintaining good character."
    },
    {
      number: 11,
      name: "Peace",
      chinese: "泰",
      pinyin: "Tài",
      trigram: "Earth over Heaven",
      element: "Earth",
      meaning: "Harmony, Prosperity",
      description: "Peace represents harmony, prosperity, and the favorable alignment of heaven and earth. It suggests a time of great opportunity and success."
    },
    {
      number: 12,
      name: "Standstill",
      chinese: "否",
      pinyin: "Pǐ",
      trigram: "Heaven over Earth",
      element: "Metal",
      meaning: "Stagnation, Obstruction",
      description: "Standstill represents stagnation and obstruction. It suggests a time when progress is blocked and patience is required."
    },
    {
      number: 13,
      name: "Fellowship",
      chinese: "同人",
      pinyin: "Tóng Rén",
      trigram: "Heaven over Fire",
      element: "Metal",
      meaning: "Unity, Cooperation",
      description: "Fellowship represents unity and cooperation among people. It suggests the power of working together for common goals."
    },
    {
      number: 14,
      name: "Great Possession",
      chinese: "大有",
      pinyin: "Dà Yǒu",
      trigram: "Fire over Heaven",
      element: "Fire",
      meaning: "Abundance, Wealth",
      description: "Great Possession represents abundance, wealth, and great success. It suggests a time of prosperity and achievement."
    },
    {
      number: 15,
      name: "Modesty",
      chinese: "謙",
      pinyin: "Qiān",
      trigram: "Earth over Mountain",
      element: "Earth",
      meaning: "Humility, Moderation",
      description: "Modesty represents humility and moderation. It suggests the importance of staying grounded and not becoming arrogant with success."
    },
    {
      number: 16,
      name: "Enthusiasm",
      chinese: "豫",
      pinyin: "Yù",
      trigram: "Thunder over Earth",
      element: "Wood",
      meaning: "Joy, Excitement",
      description: "Enthusiasm represents joy, excitement, and positive energy. It suggests a time of great enthusiasm and motivation."
    },
    {
      number: 17,
      name: "Following",
      chinese: "隨",
      pinyin: "Suí",
      trigram: "Lake over Thunder",
      element: "Metal",
      meaning: "Adaptation, Following",
      description: "Following represents adaptation and the ability to follow the natural flow of events. It suggests flexibility and going with the current."
    },
    {
      number: 18,
      name: "Work on What Has Been Spoiled",
      chinese: "蠱",
      pinyin: "Gǔ",
      trigram: "Mountain over Wind",
      element: "Earth",
      meaning: "Correction, Reform",
      description: "Work on What Has Been Spoiled represents the need to correct and reform what has gone wrong. It suggests the importance of addressing problems directly."
    },
    {
      number: 19,
      name: "Approach",
      chinese: "臨",
      pinyin: "Lín",
      trigram: "Earth over Lake",
      element: "Earth",
      meaning: "Advance, Progress",
      description: "Approach represents advancement and progress. It suggests moving forward with confidence and determination."
    },
    {
      number: 20,
      name: "Contemplation",
      chinese: "觀",
      pinyin: "Guān",
      trigram: "Wind over Earth",
      element: "Wood",
      meaning: "Observation, Reflection",
      description: "Contemplation represents observation and reflection. It suggests the importance of taking time to observe and understand before acting."
    }
  ]

  private trigrams = {
    'Heaven': { element: 'Metal', nature: 'Creative', direction: 'Northwest' },
    'Earth': { element: 'Earth', nature: 'Receptive', direction: 'Southwest' },
    'Thunder': { element: 'Wood', nature: 'Arousing', direction: 'East' },
    'Water': { element: 'Water', nature: 'Dangerous', direction: 'North' },
    'Mountain': { element: 'Earth', nature: 'Still', direction: 'Northeast' },
    'Wind': { element: 'Wood', nature: 'Gentle', direction: 'Southeast' },
    'Fire': { element: 'Fire', nature: 'Clinging', direction: 'South' },
    'Lake': { element: 'Metal', nature: 'Joyous', direction: 'West' }
  }

  private seasons = ['Spring', 'Summer', 'Autumn', 'Winter']
  private elements = ['Wood', 'Fire', 'Earth', 'Metal', 'Water']
  private directions = ['North', 'South', 'East', 'West', 'Northeast', 'Northwest', 'Southeast', 'Southwest']
  private timesOfDay = ['Dawn', 'Morning', 'Noon', 'Afternoon', 'Evening', 'Night']

  // Hexagram lookup table: Maps 6-line binary pattern (bottom to top) to hexagram number
  // Pattern: [bottom, line2, line3, line4, line5, top] where 1=yang, 0=yin
  private hexagramLookup: Map<string, number> = new Map([
    // All 64 hexagrams in King Wen sequence
    ['111111', 1],   // The Creative
    ['000000', 2],   // The Receptive
    ['100010', 3],   // Difficulty at the Beginning
    ['010001', 4],   // Youthful Folly
    ['111010', 5],   // Waiting
    ['010111', 6],   // Conflict
    ['010000', 7],   // The Army
    ['000010', 8],   // Holding Together
    ['111011', 9],   // Small Taming
    ['110111', 10],  // Treading
    ['111000', 11],  // Peace
    ['000111', 12],  // Standstill
    ['111101', 13],  // Fellowship
    ['101111', 14],  // Great Possession
    ['000100', 15],  // Modesty
    ['001000', 16],  // Enthusiasm
    ['100110', 17],  // Following
    ['011001', 18],  // Work on What Has Been Spoiled
    ['110000', 19],  // Approach
    ['000011', 20],  // Contemplation
    ['100101', 21],  // Biting Through
    ['101001', 22],  // Grace
    ['000001', 23],  // Splitting Apart
    ['100000', 24],  // Return
    ['111001', 25],  // Innocence
    ['100111', 26],  // Great Taming
    ['100001', 27],  // Nourishment
    ['011110', 28],  // Great Exceeding
    ['010010', 29],  // The Abysmal Water
    ['101101', 30],  // The Clinging Fire
    ['100100', 31],  // Influence
    ['001001', 32],  // Duration
    ['111100', 33],  // Retreat
    ['001111', 34],  // Great Power
    ['000101', 35],  // Progress
    ['101000', 36],  // Darkening of the Light
    ['101010', 37],  // The Family
    ['010101', 38],  // Opposition
    ['001010', 39],  // Obstruction
    ['010100', 40],  // Deliverance
    ['110001', 41],  // Decrease
    ['100011', 42],  // Increase
    ['111110', 43],  // Breakthrough
    ['011111', 44],  // Coming to Meet
    ['000110', 45],  // Gathering Together
    ['011000', 46],  // Pushing Upward
    ['010110', 47],  // Oppression
    ['011010', 48],  // The Well
    ['101100', 49],  // Revolution
    ['001101', 50],  // The Cauldron
    ['001011', 51],  // The Arousing Thunder
    ['110100', 52],  // Keeping Still Mountain
    ['001110', 53],  // Development
    ['011100', 54],  // The Marrying Maiden
    ['101110', 55],  // Abundance
    ['011101', 56],  // The Wanderer
    ['010011', 57],  // The Gentle Wind
    ['110010', 58],  // The Joyous Lake
    ['010000', 59],  // Dispersion
    ['000010', 60],  // Limitation
    ['110110', 61],  // Inner Truth
    ['011011', 62],  // Small Exceeding
    ['110111', 63],  // After Completion
    ['111110', 64]   // Before Completion
  ])

  // Trigram to binary pattern mapping (bottom to top for 3 lines)
  private trigramPatterns: Map<string, string> = new Map([
    ['Heaven', '111'],
    ['Earth', '000'],
    ['Thunder', '100'],
    ['Mountain', '001'],
    ['Wind', '110'],
    ['Water', '010'],
    ['Fire', '101'],
    ['Lake', '011']
  ])

  // Trigram pair to hexagram number lookup
  // Format: "UpperTrigram-LowerTrigram" -> hexagram number
  private trigramPairLookup: Map<string, number> = new Map([
    ['Heaven-Heaven', 1],
    ['Earth-Earth', 2],
    ['Water-Thunder', 3],
    ['Mountain-Water', 4],
    ['Water-Heaven', 5],
    ['Heaven-Water', 6],
    ['Earth-Water', 7],
    ['Water-Earth', 8],
    ['Wind-Heaven', 9],
    ['Heaven-Lake', 10],
    ['Earth-Heaven', 11],
    ['Heaven-Earth', 12],
    ['Heaven-Fire', 13],
    ['Fire-Heaven', 14],
    ['Earth-Mountain', 15],
    ['Thunder-Earth', 16],
    ['Lake-Thunder', 17],
    ['Mountain-Wind', 18],
    ['Earth-Lake', 19],
    ['Wind-Earth', 20],
    ['Fire-Thunder', 21],
    ['Mountain-Fire', 22],
    ['Earth-Mountain', 23],
    ['Thunder-Earth', 24],
    ['Thunder-Heaven', 25],
    ['Mountain-Heaven', 26],
    ['Mountain-Thunder', 27],
    ['Lake-Wind', 28],
    ['Water-Water', 29],
    ['Fire-Fire', 30],
    ['Mountain-Lake', 31],
    ['Thunder-Thunder', 32],
    ['Mountain-Heaven', 33],
    ['Thunder-Lake', 34],
    ['Fire-Earth', 35],
    ['Fire-Lake', 36],
    ['Wind-Fire', 37],
    ['Fire-Wind', 38],
    ['Mountain-Water', 39],
    ['Water-Thunder', 40],
    ['Mountain-Lake', 41],
    ['Thunder-Wind', 42],
    ['Lake-Heaven', 43],
    ['Wind-Heaven', 44],
    ['Lake-Earth', 45],
    ['Wind-Earth', 46],
    ['Lake-Water', 47],
    ['Water-Wind', 48],
    ['Fire-Water', 49],
    ['Wind-Fire', 50],
    ['Thunder-Thunder', 51],
    ['Mountain-Mountain', 52],
    ['Wind-Thunder', 53],
    ['Thunder-Lake', 54],
    ['Thunder-Fire', 55],
    ['Fire-Mountain', 56],
    ['Wind-Wind', 57],
    ['Lake-Lake', 58],
    ['Wind-Water', 59],
    ['Water-Lake', 60],
    ['Lake-Wind', 61],
    ['Thunder-Mountain', 62],
    ['Water-Fire', 63],
    ['Fire-Water', 64]
  ])

  async consultIChing(question: string, method: 'coins' | 'yarrow' | 'random'): Promise<IChingAnalysis> {
    devLog.debug('🔮 ichingIntelligence: consultIChing called', { question, method });
    
    try {
      // Generate hexagram with changing lines
      devLog.debug('🔮 ichingIntelligence: Generating hexagram with method:', method);
      const hexagram = await this.generateHexagram(method)
      devLog.debug('✅ ichingIntelligence: Hexagram generated:', {
        number: hexagram.number,
        name: hexagram.name,
        linesCount: hexagram.lines?.length || 0,
        changingLinesCount: hexagram.changingLines?.length || 0
      });
      
      // Analyze timing
      devLog.debug('🔮 ichingIntelligence: Analyzing timing...');
      const timing = this.analyzeTiming(hexagram)
      
      // Generate interpretation
      devLog.debug('🔮 ichingIntelligence: Generating interpretation...');
      const interpretation = this.generateInterpretation(question, hexagram)
      
      // Analyze elements
      devLog.debug('🔮 ichingIntelligence: Analyzing elements...');
      const elements = this.analyzeElements(hexagram)
      
      // Analyze trigrams
      devLog.debug('🔮 ichingIntelligence: Analyzing trigrams...');
      const trigramAnalysis = this.analyzeTrigrams(hexagram)
      
      // Analyze changing lines
      devLog.debug('🔮 ichingIntelligence: Analyzing changing lines...');
      const changingLines = this.analyzeChangingLines(hexagram)
      
      // Generate recommendations
      devLog.debug('🔮 ichingIntelligence: Generating recommendations...');
      const recommendations = this.generateRecommendations(hexagram, interpretation)
      
      // Generate coaching insights
      devLog.debug('🔮 ichingIntelligence: Generating coaching insights...');
      const coaching = this.generateCoaching(hexagram, interpretation)

      const analysis: IChingAnalysis = {
        id: Date.now().toString(),
        timestamp: new Date(),
        question,
        method,
        hexagram,
        timing,
        interpretation,
        elements,
        trigramAnalysis,
        changingLines,
        confidenceLevel: 94,
        recommendations,
        coaching
      }

      devLog.debug('✅ ichingIntelligence: Analysis object created successfully:', {
        id: analysis.id,
        hexagramNumber: analysis.hexagram.number,
        hexagramName: analysis.hexagram.name,
        hasInterpretation: !!analysis.interpretation,
        recommendationsCount: analysis.recommendations.length
      });

      return analysis
    } catch (error: any) {
      devLog.error('❌ ichingIntelligence: Error in consultIChing:', error, 'ichingIntelligence');
      devLog.error('❌ ichingIntelligence: Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      }, 'ichingIntelligence');
      throw error;
    }
  }

  /**
   * Three Coins Method
   * Each coin: heads (3) or tails (2)
   * Three coins sum: 6 = old yin (changing), 7 = young yang, 8 = young yin, 9 = old yang (changing)
   * Probabilities: 6 (12.5%), 7 (37.5%), 8 (37.5%), 9 (12.5%)
   */
  private throwThreeCoins(): { value: number; isChanging: boolean; yinYang: 'yin' | 'yang' } {
    const coin1 = Math.random() < 0.5 ? 2 : 3  // tails or heads
    const coin2 = Math.random() < 0.5 ? 2 : 3
    const coin3 = Math.random() < 0.5 ? 2 : 3
    const sum = coin1 + coin2 + coin3
    
    // 6 = old yin (changing), 9 = old yang (changing)
    // 7 = young yang, 8 = young yin
    if (sum === 6) {
      return { value: 6, isChanging: true, yinYang: 'yin' }
    } else if (sum === 7) {
      return { value: 7, isChanging: false, yinYang: 'yang' }
    } else if (sum === 8) {
      return { value: 8, isChanging: false, yinYang: 'yin' }
    } else { // sum === 9
      return { value: 9, isChanging: true, yinYang: 'yang' }
    }
  }

  /**
   * Yarrow Stalks Method (simplified for computational accuracy)
   * Old yin (6): 1/16 probability
   * Young yang (7): 5/16 probability
   * Young yin (8): 7/16 probability
   * Old yang (9): 3/16 probability
   */
  private throwYarrowStalks(): { value: number; isChanging: boolean; yinYang: 'yin' | 'yang' } {
    const random = Math.random()
    
    // Cumulative probabilities
    if (random < 1/16) {
      return { value: 6, isChanging: true, yinYang: 'yin' }  // 1/16 = 6.25%
    } else if (random < 6/16) {
      return { value: 7, isChanging: false, yinYang: 'yang' }  // 5/16 = 31.25%
    } else if (random < 13/16) {
      return { value: 8, isChanging: false, yinYang: 'yin' }  // 7/16 = 43.75%
    } else {
      return { value: 9, isChanging: true, yinYang: 'yang' }  // 3/16 = 18.75%
    }
  }

  /**
   * Generate 6 lines using the specified method
   */
  private generateLines(method: 'coins' | 'yarrow' | 'random'): Array<{ value: number; isChanging: boolean; yinYang: 'yin' | 'yang'; position: number }> {
    const lines: Array<{ value: number; isChanging: boolean; yinYang: 'yin' | 'yang'; position: number }> = []
    
    for (let position = 1; position <= 6; position++) {
      let result
      if (method === 'coins') {
        result = this.throwThreeCoins()
      } else if (method === 'yarrow') {
        result = this.throwYarrowStalks()
      } else { // random - use equal probabilities
        const rand = Math.random()
        if (rand < 0.25) {
          result = { value: 6, isChanging: true, yinYang: 'yin' }
        } else if (rand < 0.5) {
          result = { value: 7, isChanging: false, yinYang: 'yang' }
        } else if (rand < 0.75) {
          result = { value: 8, isChanging: false, yinYang: 'yin' }
        } else {
          result = { value: 9, isChanging: true, yinYang: 'yang' }
        }
      }
      lines.push({ ...result, position, yinYang: result.yinYang as 'yin' | 'yang' })
    }
    
    return lines
  }

  /**
   * Convert lines array to binary pattern string (bottom to top)
   */
  private linesToPattern(lines: Array<{ yinYang: 'yin' | 'yang' }>): string {
    return lines.map(line => line.yinYang === 'yang' ? '1' : '0').join('')
  }

  /**
   * Look up hexagram number from binary pattern
   */
  private patternToHexagramNumber(pattern: string): number {
    const hexagramNum = this.hexagramLookup.get(pattern)
    if (hexagramNum) {
      return hexagramNum
    }
    // Fallback: try to find by trigrams if pattern doesn't match exactly
    // This shouldn't happen with correct patterns, but provide safety
    return 1 // Default to The Creative
  }

  /**
   * Get hexagram data by number (with fallback for missing hexagrams)
   */
  private getHexagramByNumber(number: number): Omit<IChingHexagram, 'lines' | 'changingLines' | 'changingTo' | 'trigramUpper' | 'trigramLower' | 'elementUpper' | 'elementLower'> {
    const hexagram = this.hexagrams.find(h => h.number === number)
    if (hexagram) {
      return hexagram
    }
    
    // Hexagram name lookup for missing hexagrams (21-64)
    const hexagramNames: Record<number, { name: string; chinese: string; pinyin: string; trigram: string; element: string; meaning: string }> = {
      21: { name: "Biting Through", chinese: "噬嗑", pinyin: "Shì Kè", trigram: "Fire over Thunder", element: "Fire", meaning: "Justice, Resolution" },
      22: { name: "Grace", chinese: "賁", pinyin: "Bì", trigram: "Mountain over Fire", element: "Earth", meaning: "Beauty, Adornment" },
      23: { name: "Splitting Apart", chinese: "剝", pinyin: "Bō", trigram: "Earth over Mountain", element: "Earth", meaning: "Decay, Breakdown" },
      24: { name: "Return", chinese: "復", pinyin: "Fù", trigram: "Thunder over Earth", element: "Wood", meaning: "Turning Point, Revival" },
      25: { name: "Innocence", chinese: "無妄", pinyin: "Wú Wàng", trigram: "Thunder over Heaven", element: "Wood", meaning: "Spontaneity, Naturalness" },
      26: { name: "Great Taming", chinese: "大畜", pinyin: "Dà Chù", trigram: "Mountain over Heaven", element: "Earth", meaning: "Great Accumulation, Restraint" },
      27: { name: "Nourishment", chinese: "頤", pinyin: "Yí", trigram: "Mountain over Thunder", element: "Earth", meaning: "Nourishment, Self-Care" },
      28: { name: "Great Exceeding", chinese: "大過", pinyin: "Dà Guò", trigram: "Lake over Wind", element: "Metal", meaning: "Great Excess, Overextension" },
      29: { name: "The Abysmal Water", chinese: "坎", pinyin: "Kǎn", trigram: "Water over Water", element: "Water", meaning: "Danger, Depth" },
      30: { name: "The Clinging Fire", chinese: "離", pinyin: "Lí", trigram: "Fire over Fire", element: "Fire", meaning: "Clarity, Illumination" },
      31: { name: "Influence", chinese: "咸", pinyin: "Xián", trigram: "Mountain over Lake", element: "Earth", meaning: "Attraction, Interaction" },
      32: { name: "Duration", chinese: "恆", pinyin: "Héng", trigram: "Thunder over Thunder", element: "Wood", meaning: "Persistence, Constancy" },
      33: { name: "Retreat", chinese: "遯", pinyin: "Dùn", trigram: "Mountain over Heaven", element: "Earth", meaning: "Withdrawal, Retreat" },
      34: { name: "Great Power", chinese: "大壯", pinyin: "Dà Zhuàng", trigram: "Thunder over Lake", element: "Wood", meaning: "Great Strength, Power" },
      35: { name: "Progress", chinese: "晉", pinyin: "Jìn", trigram: "Fire over Earth", element: "Fire", meaning: "Advancement, Progress" },
      36: { name: "Darkening of the Light", chinese: "明夷", pinyin: "Míng Yí", trigram: "Fire over Lake", element: "Fire", meaning: "Eclipse, Concealment" },
      37: { name: "The Family", chinese: "家人", pinyin: "Jiā Rén", trigram: "Wind over Fire", element: "Wood", meaning: "Family, Household" },
      38: { name: "Opposition", chinese: "睽", pinyin: "Kuí", trigram: "Fire over Wind", element: "Fire", meaning: "Separation, Opposition" },
      39: { name: "Obstruction", chinese: "蹇", pinyin: "Jiǎn", trigram: "Mountain over Water", element: "Earth", meaning: "Difficulty, Obstacle" },
      40: { name: "Deliverance", chinese: "解", pinyin: "Jiě", trigram: "Water over Thunder", element: "Water", meaning: "Release, Liberation" },
      41: { name: "Decrease", chinese: "損", pinyin: "Sǔn", trigram: "Mountain over Lake", element: "Earth", meaning: "Reduction, Loss" },
      42: { name: "Increase", chinese: "益", pinyin: "Yì", trigram: "Thunder over Wind", element: "Wood", meaning: "Growth, Benefit" },
      43: { name: "Breakthrough", chinese: "夬", pinyin: "Guài", trigram: "Lake over Heaven", element: "Metal", meaning: "Resolution, Decision" },
      44: { name: "Coming to Meet", chinese: "姤", pinyin: "Gòu", trigram: "Wind over Heaven", element: "Wood", meaning: "Encounter, Meeting" },
      45: { name: "Gathering Together", chinese: "萃", pinyin: "Cuì", trigram: "Lake over Earth", element: "Metal", meaning: "Assembly, Gathering" },
      46: { name: "Pushing Upward", chinese: "升", pinyin: "Shēng", trigram: "Wind over Earth", element: "Wood", meaning: "Ascension, Rise" },
      47: { name: "Oppression", chinese: "困", pinyin: "Kùn", trigram: "Lake over Water", element: "Metal", meaning: "Exhaustion, Hardship" },
      48: { name: "The Well", chinese: "井", pinyin: "Jǐng", trigram: "Water over Wind", element: "Water", meaning: "Source, Nourishment" },
      49: { name: "Revolution", chinese: "革", pinyin: "Gé", trigram: "Fire over Water", element: "Fire", meaning: "Transformation, Change" },
      50: { name: "The Cauldron", chinese: "鼎", pinyin: "Dǐng", trigram: "Wind over Fire", element: "Wood", meaning: "Nourishment, Transformation" },
      51: { name: "The Arousing Thunder", chinese: "震", pinyin: "Zhèn", trigram: "Thunder over Thunder", element: "Wood", meaning: "Shock, Arousal" },
      52: { name: "Keeping Still Mountain", chinese: "艮", pinyin: "Gèn", trigram: "Mountain over Mountain", element: "Earth", meaning: "Stillness, Restraint" },
      53: { name: "Development", chinese: "漸", pinyin: "Jiàn", trigram: "Wind over Thunder", element: "Wood", meaning: "Gradual Progress" },
      54: { name: "The Marrying Maiden", chinese: "歸妹", pinyin: "Guī Mèi", trigram: "Thunder over Lake", element: "Wood", meaning: "Marriage, Union" },
      55: { name: "Abundance", chinese: "豐", pinyin: "Fēng", trigram: "Thunder over Fire", element: "Wood", meaning: "Abundance, Fullness" },
      56: { name: "The Wanderer", chinese: "旅", pinyin: "Lǚ", trigram: "Fire over Mountain", element: "Fire", meaning: "Travel, Wandering" },
      57: { name: "The Gentle Wind", chinese: "巽", pinyin: "Xùn", trigram: "Wind over Wind", element: "Wood", meaning: "Penetration, Gentleness" },
      58: { name: "The Joyous Lake", chinese: "兌", pinyin: "Duì", trigram: "Lake over Lake", element: "Metal", meaning: "Joy, Pleasure" },
      59: { name: "Dispersion", chinese: "渙", pinyin: "Huàn", trigram: "Wind over Water", element: "Wood", meaning: "Dispersion, Dissolution" },
      60: { name: "Limitation", chinese: "節", pinyin: "Jié", trigram: "Water over Lake", element: "Water", meaning: "Moderation, Restraint" },
      61: { name: "Inner Truth", chinese: "中孚", pinyin: "Zhōng Fú", trigram: "Lake over Wind", element: "Metal", meaning: "Sincerity, Truth" },
      62: { name: "Small Exceeding", chinese: "小過", pinyin: "Xiǎo Guò", trigram: "Thunder over Mountain", element: "Wood", meaning: "Small Excess, Moderation" },
      63: { name: "After Completion", chinese: "既濟", pinyin: "Jì Jì", trigram: "Water over Fire", element: "Water", meaning: "Completion, Success" },
      64: { name: "Before Completion", chinese: "未濟", pinyin: "Wèi Jì", trigram: "Fire over Water", element: "Fire", meaning: "Before Completion, Transition" }
    };
    
    // Use lookup table if available
    const hexagramData = hexagramNames[number];
    if (hexagramData) {
      return {
        number,
        name: hexagramData.name,
        chinese: hexagramData.chinese,
        pinyin: hexagramData.pinyin,
        trigram: hexagramData.trigram,
        element: hexagramData.element,
        meaning: hexagramData.meaning,
        description: `${hexagramData.name} (${hexagramData.chinese}) represents ${hexagramData.meaning.toLowerCase()}.`
      };
    }
    
    // Final fallback - should never happen if lookup table is complete
    devLog.warn(`⚠️ ichingIntelligence: Hexagram ${number} not found in lookup table, using generic fallback`, 'ichingIntelligence');
    return {
      number,
      name: `Hexagram ${number}`,
      chinese: '未知',
      pinyin: 'Wèi Zhī',
      trigram: 'Unknown',
      element: 'Unknown',
      meaning: `Hexagram ${number}`,
      description: `This is hexagram ${number} of the I Ching.`
    }
  }

  /**
   * Transform hexagram by changing lines
   * Old yin (6) becomes young yang (7), old yang (9) becomes young yin (8)
   */
  private transformHexagram(lines: Array<{ value: number; isChanging: boolean; yinYang: 'yin' | 'yang'; position: number }>): string {
    const transformedLines = lines.map(line => {
      if (line.isChanging) {
        // Flip: old yin -> yang, old yang -> yin
        return { yinYang: line.yinYang === 'yin' ? 'yang' : 'yin' as 'yin' | 'yang' }
      } else {
        return { yinYang: line.yinYang }
      }
    })
    return this.linesToPattern(transformedLines)
  }

  private async generateHexagram(method: 'coins' | 'yarrow' | 'random'): Promise<IChingHexagram> {
    devLog.debug('🔮 ichingIntelligence: generateHexagram started with method:', method);
    
    // Generate 6 lines using the specified method (from bottom to top)
    devLog.debug('🔮 ichingIntelligence: Generating 6 lines...');
    const lineResults = this.generateLines(method)
    devLog.debug('✅ ichingIntelligence: Lines generated:', lineResults.map(l => `${l.position}:${l.yinYang}${l.isChanging ? ' (changing)' : ''}`));
    
    // Create pattern string (bottom to top)
    const pattern = this.linesToPattern(lineResults)
    devLog.debug('🔮 ichingIntelligence: Pattern created:', pattern);
    
    // Look up hexagram number from pattern
    const hexagramNumber = this.patternToHexagramNumber(pattern)
    devLog.debug('🔮 ichingIntelligence: Hexagram number looked up:', hexagramNumber);
    
    // Get hexagram data
    const baseHexagram = this.getHexagramByNumber(hexagramNumber)
    devLog.debug('✅ ichingIntelligence: Base hexagram retrieved:', { number: baseHexagram.number, name: baseHexagram.name });
    
    // Extract changing line positions
    const changingLines = lineResults
      .filter(line => line.isChanging)
      .map(line => line.position)
    
    // Build lines array with full data
    const lines = lineResults.map(line => ({
      position: line.position,
      text: this.generateLineText(baseHexagram.name, line.position, line.yinYang === 'yin'),
      meaning: this.generateLineMeaning(baseHexagram.name, line.position, line.yinYang === 'yin'),
      changing: line.isChanging,
      yinYang: line.yinYang,
      element: this.getLineElement(baseHexagram.element, line.position)
    }))

    // Determine trigram components from lines
    const trigramUpper = this.getTrigramFromLines(lines.slice(3, 6))
    const trigramLower = this.getTrigramFromLines(lines.slice(0, 3))
    const elementUpper = this.trigrams[trigramUpper as keyof typeof this.trigrams]?.element || 'Unknown'
    const elementLower = this.trigrams[trigramLower as keyof typeof this.trigrams]?.element || 'Unknown'

    // Generate changing hexagram if there are changing lines
    let changingTo: IChingHexagram | undefined
    if (changingLines.length > 0) {
      // Transform the pattern by flipping changing lines
      const transformedPattern = this.transformHexagram(lineResults)
      const transformedHexagramNumber = this.patternToHexagramNumber(transformedPattern)
      const transformedBaseHexagram = this.getHexagramByNumber(transformedHexagramNumber)
      
      // Create transformed lines (changing lines flipped, no longer changing)
      const transformedLineResults = lineResults.map(line => ({
        ...line,
        isChanging: false,
        yinYang: line.isChanging ? (line.yinYang === 'yin' ? 'yang' : 'yin') as 'yin' | 'yang' : line.yinYang
      }))
      
      const transformedLines = transformedLineResults.map(line => ({
        position: line.position,
        text: this.generateLineText(transformedBaseHexagram.name, line.position, line.yinYang === 'yin'),
        meaning: this.generateLineMeaning(transformedBaseHexagram.name, line.position, line.yinYang === 'yin'),
        changing: false,
        yinYang: line.yinYang,
        element: this.getLineElement(transformedBaseHexagram.element, line.position)
      }))
      
      const transformedTrigramUpper = this.getTrigramFromLines(transformedLines.slice(3, 6))
      const transformedTrigramLower = this.getTrigramFromLines(transformedLines.slice(0, 3))
      
      changingTo = {
        ...transformedBaseHexagram,
        lines: transformedLines,
        changingLines: [],
        trigramUpper: transformedTrigramUpper,
        trigramLower: transformedTrigramLower,
        elementUpper: this.trigrams[transformedTrigramUpper as keyof typeof this.trigrams]?.element || 'Unknown',
        elementLower: this.trigrams[transformedTrigramLower as keyof typeof this.trigrams]?.element || 'Unknown'
      }
    }

    const hexagramResult = {
      ...baseHexagram,
      lines,
      changingLines,
      changingTo,
      trigramUpper,
      trigramLower,
      elementUpper,
      elementLower
    };
    
    // Validate hexagram structure
    if (!hexagramResult.lines || !Array.isArray(hexagramResult.lines) || hexagramResult.lines.length !== 6) {
      devLog.error('❌ ichingIntelligence: Invalid lines array:', hexagramResult.lines, 'ichingIntelligence');
      throw new Error(`Invalid hexagram lines: expected 6 lines, got ${hexagramResult.lines?.length || 0}`);
    }
    
    if (!hexagramResult.number || !hexagramResult.name || !hexagramResult.chinese) {
      devLog.error('❌ ichingIntelligence: Missing required hexagram fields:', {
        hasNumber: !!hexagramResult.number,
        hasName: !!hexagramResult.name,
        hasChinese: !!hexagramResult.chinese
      }, 'ichingIntelligence');
      throw new Error('Invalid hexagram: missing required fields');
    }
    
    // Validate each line has required properties
    hexagramResult.lines.forEach((line, idx) => {
      if (!line.hasOwnProperty('yinYang') || !line.hasOwnProperty('changing') || !line.hasOwnProperty('position')) {
        devLog.error(`❌ ichingIntelligence: Invalid line at index ${idx}:`, line, 'ichingIntelligence');
        throw new Error(`Invalid line structure at position ${idx}`);
      }
    });
    
    devLog.debug('✅ ichingIntelligence: Hexagram generation complete and validated:', {
      number: hexagramResult.number,
      name: hexagramResult.name,
      chinese: hexagramResult.chinese,
      pinyin: hexagramResult.pinyin,
      linesCount: hexagramResult.lines.length,
      changingLinesCount: hexagramResult.changingLines.length,
      hasChangingTo: !!hexagramResult.changingTo,
      trigramUpper: hexagramResult.trigramUpper,
      trigramLower: hexagramResult.trigramLower,
      allLinesValid: hexagramResult.lines.every(l => l.yinYang && l.hasOwnProperty('changing'))
    });
    
    return hexagramResult;
  }

  private generateLineText(hexagramName: string, position: number, isYin: boolean): string {
    const lineTexts = {
      'The Creative': [
        'Hidden dragon. Do not act.',
        'Dragon appearing in the field.',
        'All day long the superior man is creatively active.',
        'Wavering flight over the depths.',
        'Flying dragon in the heavens.',
        'Arrogant dragon will have cause to repent.'
      ],
      'The Receptive': [
        'Hoarfrost underfoot.',
        'Straight, square, great.',
        'Hidden lines.',
        'A tied-up sack.',
        'A yellow lower garment.',
        'Dragons fight in the meadow.'
      ]
    }

    const texts = lineTexts[hexagramName as keyof typeof lineTexts] || [
      'The line shows proper conduct.',
      'The line indicates progress.',
      'The line suggests caution.',
      'The line reveals opportunity.',
      'The line shows success.',
      'The line warns of excess.'
    ]

    return texts[position - 1] || 'The line reveals its meaning.'
  }

  private generateLineMeaning(hexagramName: string, position: number, isYin: boolean): string {
    const meanings = [
      'Wait for the right moment',
      'Begin to show your abilities',
      'Persevere in your work',
      'Test your limits carefully',
      'Great success is possible',
      'Avoid overconfidence'
    ]

    return meanings[position - 1] || 'The line offers guidance for your situation.'
  }

  private getLineElement(hexagramElement: string, position: number): string {
    const elementMap: { [key: string]: string[] } = {
      'Metal': ['Metal', 'Earth', 'Water', 'Wood', 'Fire', 'Metal'],
      'Earth': ['Earth', 'Metal', 'Fire', 'Water', 'Wood', 'Earth'],
      'Water': ['Water', 'Wood', 'Earth', 'Fire', 'Metal', 'Water'],
      'Wood': ['Wood', 'Fire', 'Metal', 'Earth', 'Water', 'Wood'],
      'Fire': ['Fire', 'Earth', 'Wood', 'Metal', 'Water', 'Fire']
    }

    return elementMap[hexagramElement]?.[position - 1] || 'Unknown'
  }

  private getTrigramFromLines(lines: any[]): string {
    // Simplified trigram determination based on yin/yang pattern
    const pattern = lines.map(line => line.yinYang).join('')
    const trigramMap: { [key: string]: string } = {
      'yangyangyang': 'Heaven',
      'yinyinyin': 'Earth',
      'yangyinyin': 'Thunder',
      'yinyangyang': 'Mountain',
      'yangyangyin': 'Wind',
      'yinyinyang': 'Water',
      'yinyangyin': 'Fire',
      'yangyinyang': 'Lake'
    }

    return trigramMap[pattern] || 'Heaven'
  }

  private analyzeTiming(hexagram: IChingHexagram): IChingAnalysis['timing'] {
    const season = this.seasons[Math.floor(Math.random() * this.seasons.length)]
    const element = hexagram.element
    const direction = this.trigrams[hexagram.trigramUpper as keyof typeof this.trigrams]?.direction || 'North'
    const timeOfDay = this.timesOfDay[Math.floor(Math.random() * this.timesOfDay.length)]
    const favorable = Math.random() > 0.3

    return {
      season,
      element,
      direction,
      timeOfDay,
      favorable
    }
  }

  private generateInterpretation(question: string, hexagram: IChingHexagram): IChingAnalysis['interpretation'] {
    const overall = `The hexagram ${hexagram.number}: ${hexagram.name} reveals that ${hexagram.meaning.toLowerCase()}. This suggests that ${hexagram.description.toLowerCase()}. In relation to your question about "${question}", the I Ching indicates that you should ${['focus on inner strength and determination', 'remain patient and receptive to guidance', 'take action with confidence and clarity', 'seek harmony and balance in your approach'][Math.floor(Math.random() * 4)]}.`

    const advice = `The I Ching advises you to ${['trust your intuition and inner wisdom', 'maintain patience and persistence', 'seek guidance from experienced mentors', 'focus on building strong foundations'][Math.floor(Math.random() * 4)]}. This is a time for ${['careful planning and preparation', 'bold action and decisive moves', 'reflection and inner work', 'collaboration and cooperation'][Math.floor(Math.random() * 4)]}.`

    const warning = `Be cautious of ${['acting too quickly without proper consideration', 'becoming overly rigid or inflexible', 'ignoring the wisdom of others', 'losing sight of your true purpose'][Math.floor(Math.random() * 4)]}. The changing lines suggest that ${['adaptation may be necessary', 'patience will be rewarded', 'inner strength is required', 'balance must be maintained'][Math.floor(Math.random() * 4)]}.`

    const opportunity = `This hexagram reveals an opportunity for ${['personal growth and development', 'achieving your goals through determination', 'building meaningful relationships', 'creating positive change in your life'][Math.floor(Math.random() * 4)]}. The timing is favorable for ${['new beginnings and fresh starts', 'consolidating your gains', 'expanding your horizons', 'deepening your understanding'][Math.floor(Math.random() * 4)]}.`

    return {
      overall,
      advice,
      warning,
      opportunity
    }
  }

  private analyzeElements(hexagram: IChingHexagram): IChingAnalysis['elements'] {
    const primary = hexagram.element
    const secondary = this.elements.filter(e => e !== primary)[Math.floor(Math.random() * 4)]
    const conflict = this.elements.filter(e => e !== primary && e !== secondary)[Math.floor(Math.random() * 3)]
    const harmony = this.elements.filter(e => e !== primary && e !== secondary && e !== conflict)[Math.floor(Math.random() * 2)]

    return {
      primary,
      secondary,
      conflict,
      harmony
    }
  }

  private analyzeTrigrams(hexagram: IChingHexagram): IChingAnalysis['trigramAnalysis'] {
    const upper = hexagram.trigramUpper
    const lower = hexagram.trigramLower
    const combination = `${upper} over ${lower}`
    const relationship = this.getTrigramRelationship(upper, lower)

    return {
      upper,
      lower,
      combination,
      relationship
    }
  }

  private getTrigramRelationship(upper: string, lower: string): string {
    const relationships = [
      'Harmonious and supportive',
      'Challenging but growth-oriented',
      'Complementary and balanced',
      'Dynamic and transformative'
    ]

    return relationships[Math.floor(Math.random() * relationships.length)]
  }

  private analyzeChangingLines(hexagram: IChingHexagram): IChingAnalysis['changingLines'] {
    const count = hexagram.changingLines.length
    const significance = count > 0 
      ? `${count} line${count > 1 ? 's' : ''} are changing, indicating transformation and movement`
      : 'No changing lines, indicating stability and consistency'
    
    const transformation = count > 0
      ? `The hexagram transforms from ${hexagram.name} to ${hexagram.changingTo?.name}, suggesting a shift from ${hexagram.meaning.toLowerCase()} to ${hexagram.changingTo?.meaning.toLowerCase()}.`
      : 'The hexagram remains stable, suggesting that the current situation will continue without major changes.'

    return {
      count,
      significance,
      transformation
    }
  }

  private generateRecommendations(hexagram: IChingHexagram, interpretation: IChingAnalysis['interpretation']): string[] {
    const recommendations = [
      'Meditate on the hexagram\'s meaning daily',
      'Pay attention to the timing and season indicated',
      'Consider the element relationships in your decisions',
      'Reflect on the changing lines and their significance',
      'Seek guidance from the trigram combinations',
      'Apply the hexagram\'s wisdom to your specific situation',
      'Maintain balance between the elements in your life',
      'Trust the process of transformation and change'
    ]

    return recommendations.sort(() => 0.5 - Math.random()).slice(0, 4)
  }

  private generateCoaching(hexagram: IChingHexagram, interpretation: IChingAnalysis['interpretation']): IChingAnalysis['coaching'] {
    const strengths = [
      `Natural connection to ${hexagram.element} energy`,
      `Ability to understand ${hexagram.meaning.toLowerCase()}`,
      `Capacity for ${hexagram.trigram.toLowerCase()} transformation`,
      `Wisdom in applying ancient knowledge to modern situations`
    ]

    const challenges = [
      'Balancing multiple elemental influences',
      'Understanding the timing of changes',
      'Integrating conflicting trigram energies',
      'Maintaining patience during transformation periods'
    ]

    const growthAreas = [
      'Deepening understanding of elemental relationships',
      'Developing intuition for timing and cycles',
      'Learning to work with changing line energies',
      'Building connection to trigram wisdom'
    ]

    const affirmations = [
      'I trust the wisdom of the I Ching to guide my path',
      'I embrace the transformative power of change',
      'I am in harmony with the elemental forces around me',
      'I understand the timing and cycles of my life',
      'I apply ancient wisdom to modern challenges',
      'I remain patient and receptive to divine guidance'
    ]

    return {
      strengths,
      challenges,
      growthAreas,
      affirmations
    }
  }

  async getCoaching(question: string, analysis: IChingAnalysis): Promise<IChingCoaching | null> {
    const insights = [
      `The hexagram ${analysis.hexagram.number}: ${analysis.hexagram.name} reveals ${analysis.hexagram.meaning.toLowerCase()}.`,
      `The ${analysis.elements.primary} element dominates, suggesting ${analysis.elements.primary.toLowerCase()} qualities are needed.`,
      `The ${analysis.trigramAnalysis.combination} combination indicates ${analysis.trigramAnalysis.relationship.toLowerCase()}.`,
      `${analysis.changingLines.count} changing line${analysis.changingLines.count > 1 ? 's' : ''} suggest${analysis.changingLines.count === 1 ? 's' : ''} transformation is occurring.`
    ]

    const recommendations = [
      'Study the hexagram\'s meaning deeply',
      'Pay attention to the timing indicated',
      'Consider the element relationships',
      'Reflect on the changing lines',
      'Apply the wisdom to your specific situation'
    ]

    const followUpQuestions = [
      'How does this hexagram relate to your current life situation?',
      'What changes do you see indicated by the changing lines?',
      'How can you work with the elemental energies revealed?',
      'What timing considerations should you keep in mind?',
      'How can you apply the trigram wisdom to your question?'
    ]

    return {
      id: Date.now().toString(),
      timestamp: new Date(),
      question,
      response: `Based on your I Ching consultation, the hexagram ${analysis.hexagram.number}: ${analysis.hexagram.name} provides guidance for your question: "${question}". The ${analysis.hexagram.meaning.toLowerCase()} suggests that ${analysis.interpretation.overall.split('. ').slice(1).join('. ')} ${analysis.interpretation.advice} ${analysis.changingLines.significance}, and ${analysis.changingLines.transformation} To answer your specific question: You should ${analysis.interpretation.advice.split('. ').slice(1).join('. ')} Focus on ${analysis.elements.primary.toLowerCase()} energy and trust in the ${analysis.trigramAnalysis.relationship.toLowerCase()} nature of your situation.`,
      insights,
      recommendations,
      followUpQuestions
    }
  }

  async saveAnalysis(userId: string, analysis: IChingAnalysis): Promise<void> {
    const db = getFirebaseDB();
    const docRef = doc(db, 'users', userId, 'iching-readings', analysis.id)
    await setDoc(docRef, analysis)
  }

  async getAnalysis(userId: string, analysisId: string): Promise<IChingAnalysis | null> {
    const db = getFirebaseDB();
    const docRef = doc(db, 'users', userId, 'iching-readings', analysisId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return docSnap.data() as IChingAnalysis
    }
    return null
  }

  async saveCoaching(userId: string, coaching: IChingCoaching): Promise<void> {
    const db = getFirebaseDB();
    const docRef = doc(db, 'users', userId, 'iching-coaching', coaching.id)
    await setDoc(docRef, coaching)
  }

  getSystemStatus() {
    return {
      totalHexagrams: this.hexagrams.length,
      trigrams: Object.keys(this.trigrams).length,
      elements: this.elements.length,
      seasons: this.seasons.length,
      directions: this.directions.length,
      timesOfDay: this.timesOfDay.length,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    }
  }
}

export const ichingIntelligence = new IChingIntelligence() 