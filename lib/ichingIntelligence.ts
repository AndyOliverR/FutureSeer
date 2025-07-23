import { doc, setDoc, getDoc, collection } from 'firebase/firestore'
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

  async consultIChing(question: string, method: 'coins' | 'yarrow' | 'random'): Promise<IChingAnalysis> {
    // Generate hexagram with changing lines
    const hexagram = await this.generateHexagram(method)
    
    // Analyze timing
    const timing = this.analyzeTiming(hexagram)
    
    // Generate interpretation
    const interpretation = this.generateInterpretation(question, hexagram)
    
    // Analyze elements
    const elements = this.analyzeElements(hexagram)
    
    // Analyze trigrams
    const trigramAnalysis = this.analyzeTrigrams(hexagram)
    
    // Analyze changing lines
    const changingLines = this.analyzeChangingLines(hexagram)
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(hexagram, interpretation)
    
    // Generate coaching insights
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

    return analysis
  }

  private async generateHexagram(method: 'coins' | 'yarrow' | 'random'): Promise<IChingHexagram> {
    // Select random hexagram
    const baseHexagram = this.hexagrams[Math.floor(Math.random() * this.hexagrams.length)]
    
    // Generate lines with changing properties
    const lines = []
    const changingLines: number[] = []
    
    for (let i = 1; i <= 6; i++) {
      const isChanging = Math.random() < 0.3 // 30% chance of changing line
      const isYin = Math.random() < 0.5
      
      if (isChanging) {
        changingLines.push(i)
      }
      
      lines.push({
        position: i,
        text: this.generateLineText(baseHexagram.name, i, isYin),
        meaning: this.generateLineMeaning(baseHexagram.name, i, isYin),
        changing: isChanging,
        yinYang: isYin ? 'yin' : 'yang',
        element: this.getLineElement(baseHexagram.element, i)
      })
    }

    // Determine trigram components
    const trigramUpper = this.getTrigramFromLines(lines.slice(3, 6))
    const trigramLower = this.getTrigramFromLines(lines.slice(0, 3))
    const elementUpper = this.trigrams[trigramUpper as keyof typeof this.trigrams]?.element || 'Unknown'
    const elementLower = this.trigrams[trigramLower as keyof typeof this.trigrams]?.element || 'Unknown'

    // Generate changing hexagram if there are changing lines
    let changingTo: IChingHexagram | undefined
    if (changingLines.length > 0) {
      const changingHexagram = this.hexagrams[Math.floor(Math.random() * this.hexagrams.length)]
      changingTo = {
        ...changingHexagram,
        lines: lines.map(line => ({ ...line, changing: false })),
        changingLines: [],
        trigramUpper,
        trigramLower,
        elementUpper,
        elementLower
      }
    }

    return {
      ...baseHexagram,
      lines,
      changingLines,
      changingTo,
      trigramUpper,
      trigramLower,
      elementUpper,
      elementLower
    }
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