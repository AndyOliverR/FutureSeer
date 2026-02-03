import { GeomanticAnalysis, GeomanticFigure, GeomanticHouse } from '@/hooks/useGeomancy'
import { doc, setDoc, getDoc, collection } from 'firebase/firestore'
import { getFirebaseDB } from './firebase';

class GeomancyIntelligence {
  private geomanticFigures: GeomanticFigure[] = [
    {
      name: "Via",
      symbol: "⚡",
      element: "Fire",
      planet: "Mars",
      zodiac: "Aries",
      meaning: "Road, journey, movement, change",
      interpretation: "Indicates travel, progress, and forward movement. Suggests taking action and embracing change."
    },
    {
      name: "Populus",
      symbol: "👥",
      element: "Water",
      planet: "Moon",
      zodiac: "Cancer",
      meaning: "People, community, gatherings",
      interpretation: "Represents social connections, groups, and collective energy. Suggests collaboration and community involvement."
    },
    {
      name: "Conjunctio",
      symbol: "🔗",
      element: "Air",
      planet: "Mercury",
      zodiac: "Gemini",
      meaning: "Union, connection, partnership",
      interpretation: "Indicates coming together, agreements, and partnerships. Suggests successful collaborations and connections."
    },
    {
      name: "Carcer",
      symbol: "🔒",
      element: "Earth",
      planet: "Saturn",
      zodiac: "Capricorn",
      meaning: "Restriction, limitation, imprisonment",
      interpretation: "Suggests obstacles, delays, and restrictions. Indicates need for patience and careful planning."
    },
    {
      name: "Fortuna Major",
      symbol: "⭐",
      element: "Fire",
      planet: "Sun",
      zodiac: "Leo",
      meaning: "Great fortune, success, abundance",
      interpretation: "Indicates great success, prosperity, and positive outcomes. Suggests favorable circumstances and good luck."
    },
    {
      name: "Fortuna Minor",
      symbol: "✨",
      element: "Air",
      planet: "Venus",
      zodiac: "Libra",
      meaning: "Small fortune, minor success",
      interpretation: "Suggests moderate success and positive developments. Indicates steady progress and favorable conditions."
    },
    {
      name: "Amissio",
      symbol: "📉",
      element: "Water",
      planet: "Venus",
      zodiac: "Taurus",
      meaning: "Loss, decrease, decline",
      interpretation: "Indicates losses, setbacks, or decreases. Suggests letting go and accepting necessary changes."
    },
    {
      name: "Acquisitio",
      symbol: "📈",
      element: "Air",
      planet: "Jupiter",
      zodiac: "Sagittarius",
      meaning: "Gain, increase, acquisition",
      interpretation: "Suggests gains, increases, and acquisitions. Indicates positive growth and expansion."
    },
    {
      name: "Laetitia",
      symbol: "😊",
      element: "Fire",
      planet: "Jupiter",
      zodiac: "Pisces",
      meaning: "Joy, happiness, celebration",
      interpretation: "Indicates joy, happiness, and positive emotions. Suggests celebration and good times ahead."
    },
    {
      name: "Tristitia",
      symbol: "😔",
      element: "Earth",
      planet: "Saturn",
      zodiac: "Aquarius",
      meaning: "Sadness, grief, sorrow",
      interpretation: "Suggests sadness, grief, or difficult emotions. Indicates need for healing and emotional processing."
    },
    {
      name: "Albus",
      symbol: "⚪",
      element: "Air",
      planet: "Mercury",
      zodiac: "Virgo",
      meaning: "White, purity, clarity",
      interpretation: "Indicates clarity, purity, and intellectual understanding. Suggests clear thinking and honest communication."
    },
    {
      name: "Rubeus",
      symbol: "🔴",
      element: "Fire",
      planet: "Mars",
      zodiac: "Scorpio",
      meaning: "Red, passion, conflict",
      interpretation: "Suggests passion, conflict, and intense emotions. Indicates need for careful handling of volatile situations."
    },
    {
      name: "Puella",
      symbol: "👧",
      element: "Water",
      planet: "Venus",
      zodiac: "Libra",
      meaning: "Girl, beauty, grace",
      interpretation: "Indicates beauty, grace, and feminine energy. Suggests harmony, diplomacy, and aesthetic appreciation."
    },
    {
      name: "Puer",
      symbol: "👦",
      element: "Fire",
      planet: "Mars",
      zodiac: "Aries",
      meaning: "Boy, energy, action",
      interpretation: "Suggests energy, action, and masculine drive. Indicates taking initiative and bold action."
    },
    {
      name: "Caput Draconis",
      symbol: "🐉",
      element: "Earth",
      planet: "North Node",
      zodiac: "Capricorn",
      meaning: "Dragon's head, beginning, opportunity",
      interpretation: "Indicates new beginnings, opportunities, and positive karma. Suggests favorable new starts and growth."
    },
    {
      name: "Cauda Draconis",
      symbol: "🐍",
      element: "Water",
      planet: "South Node",
      zodiac: "Cancer",
      meaning: "Dragon's tail, ending, release",
      interpretation: "Suggests endings, releases, and letting go of the past. Indicates completion and moving forward."
    }
  ]

  async performGeomancy(question: string, questionType: string): Promise<GeomanticAnalysis> {
    try {
      // Generate geomantic figures based on question
      const figures = this.generateFigures(question, questionType)
      
      // Create houses from figures
      const houses = this.createHouses(figures)
      
      // Generate interpretation
      const interpretation = this.interpretFigures(figures, houses, question, questionType)
      
      // Generate overview
      const overview = this.generateOverview(figures, houses, questionType)
      
      // Generate timing
      const timing = this.generateTiming(figures, houses)
      
      // Generate advice
      const advice = this.generateAdvice(figures, houses, questionType)

      return {
        overview,
        figures,
        houses,
        interpretation,
        timing,
        advice
      }
    } catch (error) {
      console.error('Geomancy analysis error:', error)
      throw new Error('Failed to perform geomancy')
    }
  }

  private generateFigures(question: string, questionType: string): GeomanticFigure[] {
    const figures: GeomanticFigure[] = []
    
    // Create a deterministic seed from question text
    const seed = this.hashString(question + questionType)
    
    // Generate 4 Mothers based on question content and type
    for (let i = 0; i < 4; i++) {
      const figure = this.selectFigureForQuestion(question, questionType, i, seed)
      figures.push(figure)
    }
    
    // Generate 4 Daughters from Mothers (reversed order)
    for (let i = 0; i < 4; i++) {
      const motherIndex = 3 - i // Reverse order
      const figure = this.selectFigureForQuestion(question, questionType, motherIndex + 4, seed)
      figures.push(figure)
    }
    
    // Generate 4 Nephews from Mothers and Daughters (combining pairs)
    for (let i = 0; i < 4; i++) {
      const motherIndex = i
      const daughterIndex = i + 4
      const combinedSeed = (seed + motherIndex + daughterIndex) % 16
      const figure = this.geomanticFigures[combinedSeed] || this.geomanticFigures[0]
      figures.push({ ...figure })
    }
    
    // Generate 2 Witnesses from Nephews (combining first two and last two)
    // Ensure we have at least 12 figures before accessing indices 8-11
    if (figures.length < 12) {
      throw new Error(`Insufficient figures for Witness generation: ${figures.length} instead of 12`)
    }
    const witness1Seed = (seed + figures[8].name.charCodeAt(0) + figures[9].name.charCodeAt(0)) % 16
    const witness2Seed = (seed + figures[10].name.charCodeAt(0) + figures[11].name.charCodeAt(0)) % 16
    figures.push({ ...this.geomanticFigures[witness1Seed] })
    figures.push({ ...this.geomanticFigures[witness2Seed] })
    
    // Generate Judge from Witnesses (combining the two witnesses at indices 12 and 13)
    // Ensure we have at least 14 figures before accessing indices 12-13
    if (figures.length < 14) {
      throw new Error(`Insufficient figures for Judge generation: ${figures.length} instead of 14`)
    }
    const judgeSeed = (seed + figures[12].name.charCodeAt(0) + figures[13].name.charCodeAt(0)) % 16
    figures.push({ ...this.geomanticFigures[judgeSeed] })
    
    // Validate: Should have exactly 15 figures (4 Mothers + 4 Daughters + 4 Nephews + 2 Witnesses + 1 Judge)
    if (figures.length !== 15) {
      console.error(`Geomancy figure generation error: Expected 15 figures, got ${figures.length}`)
      throw new Error(`Invalid figure count: ${figures.length} instead of 15`)
    }
    
    return figures
  }
  
  // Simple hash function for deterministic seeding
  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }

  private selectFigureForQuestion(question: string, questionType: string, position: number, seed: number): GeomanticFigure {
    const questionLower = question.toLowerCase()
    const questionWords = questionLower.split(/\s+/)
    
    // Enhanced keyword matching for better figure selection
    const keywordMatches: Record<string, number> = {}
    
    // Analyze question keywords
    const positiveKeywords = ['yes', 'success', 'gain', 'happy', 'good', 'love', 'joy', 'win', 'achieve', 'growth']
    const negativeKeywords = ['no', 'loss', 'sad', 'bad', 'fear', 'worry', 'fail', 'problem', 'difficulty', 'challenge']
    const actionKeywords = ['move', 'go', 'change', 'travel', 'journey', 'action', 'start', 'begin']
    const relationshipKeywords = ['relationship', 'partner', 'friend', 'together', 'connect', 'meet', 'social']
    
    let positiveScore = 0
    let negativeScore = 0
    let actionScore = 0
    let relationshipScore = 0
    
    questionWords.forEach(word => {
      if (positiveKeywords.some(k => word.includes(k))) positiveScore++
      if (negativeKeywords.some(k => word.includes(k))) negativeScore++
      if (actionKeywords.some(k => word.includes(k))) actionScore++
      if (relationshipKeywords.some(k => word.includes(k))) relationshipScore++
    })
    
    // Select figures based on question type and content analysis
    let candidateFigures: string[] = []
    
    if (questionType === 'love') {
      if (positiveScore > negativeScore) {
        candidateFigures = ['Conjunctio', 'Puella', 'Fortuna Major', 'Laetitia', 'Acquisitio']
      } else {
        candidateFigures = ['Puella', 'Puer', 'Conjunctio', 'Populus', 'Via']
      }
    } else if (questionType === 'career') {
      if (positiveScore > negativeScore) {
        candidateFigures = ['Acquisitio', 'Fortuna Major', 'Caput Draconis', 'Via', 'Albus']
      } else {
        candidateFigures = ['Via', 'Albus', 'Acquisitio', 'Fortuna Minor', 'Conjunctio']
      }
    } else if (questionType === 'money') {
      if (positiveScore > negativeScore) {
        candidateFigures = ['Acquisitio', 'Fortuna Major', 'Fortuna Minor', 'Populus', 'Laetitia']
      } else {
        candidateFigures = ['Amissio', 'Populus', 'Tristitia', 'Carcer', 'Acquisitio']
      }
    } else if (questionType === 'health') {
      if (positiveScore > negativeScore) {
        candidateFigures = ['Laetitia', 'Fortuna Major', 'Via', 'Albus', 'Caput Draconis']
      } else {
        candidateFigures = ['Tristitia', 'Carcer', 'Via', 'Laetitia', 'Albus']
      }
    } else {
      // General questions - use content analysis
      if (actionScore > 0) {
        candidateFigures = ['Via', 'Puer', 'Caput Draconis', 'Conjunctio', 'Albus']
      } else if (relationshipScore > 0) {
        candidateFigures = ['Conjunctio', 'Populus', 'Puella', 'Puer', 'Laetitia']
      } else if (positiveScore > negativeScore) {
        candidateFigures = ['Fortuna Major', 'Laetitia', 'Acquisitio', 'Caput Draconis', 'Conjunctio']
      } else {
        candidateFigures = ['Albus', 'Via', 'Populus', 'Conjunctio', 'Fortuna Minor']
      }
    }
    
    // Select figure based on position and seed for deterministic but varied results
    const index = (seed + position) % candidateFigures.length
    const figureName = candidateFigures[index]
    return this.geomanticFigures.find(f => f.name === figureName) || this.geomanticFigures[Math.abs(seed + position) % this.geomanticFigures.length]
  }

  private createHouses(figures: GeomanticFigure[]): GeomanticHouse[] {
    const houses: GeomanticHouse[] = []
    const houseMeanings = [
      "The querent's general state and personality",
      "Money, possessions, and material wealth",
      "Communication, siblings, and short journeys",
      "Home, family, and emotional foundation",
      "Children, creativity, and romance",
      "Health, work, and daily routines",
      "Partnerships, marriage, and open enemies",
      "Death, transformation, and shared resources",
      "Long journeys, higher education, and philosophy",
      "Career, reputation, and public image",
      "Friends, groups, and hopes and wishes",
      "Hidden matters, spirituality, and subconscious"
    ]
    
    for (let i = 0; i < 12; i++) {
      const figure = figures[i] || figures[0]
      houses.push({
        house: i + 1,
        figure,
        meaning: houseMeanings[i],
        relevance: this.getHouseRelevance(figure, i + 1)
      })
    }
    
    return houses
  }

  private getHouseRelevance(figure: GeomanticFigure, house: number): string {
    const relevanceMap: Record<number, string[]> = {
      1: ["Personal identity", "Self-expression", "Physical appearance"],
      2: ["Financial matters", "Material possessions", "Values"],
      3: ["Communication", "Learning", "Local travel"],
      4: ["Home life", "Family", "Emotional security"],
      5: ["Romance", "Creativity", "Children"],
      6: ["Health", "Work", "Daily routines"],
      7: ["Relationships", "Partnerships", "Open enemies"],
      8: ["Transformation", "Shared resources", "Mystery"],
      9: ["Higher learning", "Long journeys", "Philosophy"],
      10: ["Career", "Public image", "Authority"],
      11: ["Friends", "Groups", "Hopes and dreams"],
      12: ["Spirituality", "Hidden matters", "Subconscious"]
    }
    
    const relevantAreas = relevanceMap[house] || ["General life area"]
    return `${figure.name} in the ${house}${this.getOrdinalSuffix(house)} house affects ${relevantAreas.join(', ')}`
  }

  private interpretFigures(figures: GeomanticFigure[], houses: GeomanticHouse[], question: string, questionType: string) {
    const positiveFigures = figures.filter(f => 
      ['Fortuna Major', 'Fortuna Minor', 'Acquisitio', 'Laetitia', 'Conjunctio', 'Caput Draconis'].includes(f.name)
    )
    
    const negativeFigures = figures.filter(f => 
      ['Amissio', 'Tristitia', 'Carcer', 'Cauda Draconis'].includes(f.name)
    )
    
    let mainAnswer = ''
    let detailedExplanation = ''
    
    if (positiveFigures.length > negativeFigures.length) {
      mainAnswer = 'The geomantic figures suggest a positive outcome to your question.'
      detailedExplanation = `With ${positiveFigures.length} favorable figures and ${negativeFigures.length} challenging ones, the overall energy is positive. The presence of ${positiveFigures.map(f => f.name).join(', ')} indicates favorable conditions and potential success.`
    } else if (negativeFigures.length > positiveFigures.length) {
      mainAnswer = 'The geomantic figures suggest challenges or delays in your situation.'
      detailedExplanation = `With ${negativeFigures.length} challenging figures and ${positiveFigures.length} favorable ones, there may be obstacles to overcome. The presence of ${negativeFigures.map(f => f.name).join(', ')} suggests patience and careful planning are needed.`
    } else {
      mainAnswer = 'The geomantic figures suggest a balanced outcome with both opportunities and challenges.'
      detailedExplanation = `With equal numbers of favorable and challenging figures, the situation is complex. Success is possible but will require effort and wisdom to navigate the mixed energies.`
    }
    
    const supportingFactors = positiveFigures.map(f => `${f.name}: ${f.meaning}`)
    const challengingFactors = negativeFigures.map(f => `${f.name}: ${f.meaning}`)
    
    return {
      mainAnswer,
      detailedExplanation,
      supportingFactors,
      challengingFactors
    }
  }

  private generateOverview(figures: GeomanticFigure[], houses: GeomanticHouse[], questionType: string) {
    const positiveFigures = figures.filter(f => 
      ['Fortuna Major', 'Fortuna Minor', 'Acquisitio', 'Laetitia', 'Conjunctio', 'Caput Draconis'].includes(f.name)
    )
    
    const negativeFigures = figures.filter(f => 
      ['Amissio', 'Tristitia', 'Carcer', 'Cauda Draconis'].includes(f.name)
    )
    
    const confidence = Math.round((positiveFigures.length / figures.length) * 100)
    
    let overallAnswer: 'yes' | 'no' | 'maybe' | 'delayed' = 'maybe'
    if (confidence >= 70) overallAnswer = 'yes'
    else if (confidence <= 30) overallAnswer = 'no'
    else if (negativeFigures.some(f => f.name === 'Carcer')) overallAnswer = 'delayed'
    
    let summary = ''
    if (overallAnswer === 'yes') {
      summary = 'The geomantic figures strongly support a positive outcome to your question.'
    } else if (overallAnswer === 'no') {
      summary = 'The geomantic figures suggest this may not be the right time or approach.'
    } else if (overallAnswer === 'delayed') {
      summary = 'The geomantic figures indicate delays and suggest patience is needed.'
    } else {
      summary = 'The geomantic figures show mixed energies requiring careful consideration.'
    }
    
    const keyInsights = [
      `Primary figure: ${figures[0]?.name} - ${figures[0]?.meaning}`,
      `Elemental influence: ${figures[0]?.element} energy is prominent`,
      `Planetary ruler: ${figures[0]?.planet} is guiding this situation`
    ]
    
    const warnings = negativeFigures.map(f => `Be aware of ${f.meaning} indicated by ${f.name}`)
    
    return {
      summary,
      overallAnswer,
      confidence,
      keyInsights,
      warnings
    }
  }

  private generateTiming(figures: GeomanticFigure[], houses: GeomanticHouse[]) {
    const fireFigures = figures.filter(f => f.element === 'Fire')
    const earthFigures = figures.filter(f => f.element === 'Earth')
    const airFigures = figures.filter(f => f.element === 'Air')
    const waterFigures = figures.filter(f => f.element === 'Water')
    
    let timeframe = ''
    if (fireFigures.length > 2) timeframe = 'Quick action needed - within days to weeks'
    else if (earthFigures.length > 2) timeframe = 'Slow and steady progress - weeks to months'
    else if (airFigures.length > 2) timeframe = 'Intellectual approach - immediate to short-term'
    else if (waterFigures.length > 2) timeframe = 'Emotional processing - months to longer term'
    else timeframe = 'Balanced timing - varies by situation'
    
    const optimalPeriods = [
      'When the Moon is waxing (growing)',
      'During favorable planetary aspects',
      'On days ruled by beneficial planets'
    ]
    
    const avoidPeriods = [
      'During Mercury retrograde',
      'On eclipse days',
      'When planets are in challenging aspects'
    ]
    
    const keyDates = [
      'New Moon periods for new beginnings',
      'Full Moon for culmination',
      'Planetary ingress into new signs'
    ]
    
    return {
      timeframe,
      optimalPeriods,
      avoidPeriods,
      keyDates
    }
  }

  private generateAdvice(figures: GeomanticFigure[], houses: GeomanticHouse[], questionType: string) {
    const immediate: string[] = []
    const shortTerm: string[] = []
    const longTerm: string[] = []
    const spiritual: string[] = []
    
    // Analyze figures for advice generation
    const hasVia = figures.some(f => f.name === 'Via')
    const hasConjunctio = figures.some(f => f.name === 'Conjunctio')
    const hasCarcer = figures.some(f => f.name === 'Carcer')
    const hasFortunaMajor = figures.some(f => f.name === 'Fortuna Major')
    const hasFortunaMinor = figures.some(f => f.name === 'Fortuna Minor')
    const hasCaputDraconis = figures.some(f => f.name === 'Caput Draconis')
    const hasCaudaDraconis = figures.some(f => f.name === 'Cauda Draconis')
    const hasAcquisitio = figures.some(f => f.name === 'Acquisitio')
    const hasLaetitia = figures.some(f => f.name === 'Laetitia')
    const hasAlbus = figures.some(f => f.name === 'Albus')
    const hasPuella = figures.some(f => f.name === 'Puella')
    const hasAmissio = figures.some(f => f.name === 'Amissio')
    const hasTristitia = figures.some(f => f.name === 'Tristitia')
    
    // Generate advice based on figures
    if (hasVia) {
      immediate.push('Take action and move forward with your plans. The path is opening before you.')
    }
    
    if (hasConjunctio) {
      immediate.push('Seek partnerships and collaborations. Unity will bring success.')
    }
    
    if (hasCarcer) {
      immediate.push('Be patient and avoid rushing decisions. Time will reveal the right path.')
    }
    
    if (hasAlbus) {
      immediate.push('Focus on clarity and honest communication. Truth will guide you.')
    }
    
    if (hasFortunaMajor) {
      shortTerm.push('Expect positive developments and success. Fortune favors you.')
    }
    
    if (hasFortunaMinor) {
      shortTerm.push('Moderate success is indicated. Steady progress will lead to favorable outcomes.')
    }
    
    if (hasAcquisitio) {
      shortTerm.push('Gains and increases are coming. Stay open to opportunities.')
    }
    
    if (hasCaputDraconis) {
      shortTerm.push('Embrace new opportunities and beginnings. This is a time for fresh starts.')
    }
    
    if (hasCaudaDraconis) {
      longTerm.push('Release old patterns and move forward. Letting go will create space for new growth.')
    }
    
    if (hasLaetitia) {
      shortTerm.push('Joy and celebration are ahead. Focus on the positive aspects of your situation.')
    }
    
    // Question-type specific advice
    if (questionType === 'love') {
      if (hasConjunctio || hasPuella) {
        immediate.push('Open your heart to connection. Harmony and beauty are available.')
      }
      if (!hasConjunctio && !hasPuella) {
        immediate.push('Take time to understand what you truly seek in relationships.')
      }
    }
    
    if (questionType === 'career') {
      if (hasVia || hasCaputDraconis) {
        immediate.push('Make bold moves in your career. Initiative will be rewarded.')
      }
      if (hasAcquisitio || hasFortunaMajor) {
        shortTerm.push('Career advancement and recognition are likely. Show your capabilities.')
      }
    }
    
    if (questionType === 'money') {
      if (hasAcquisitio || hasFortunaMajor) {
        immediate.push('Financial opportunities are present. Act wisely but decisively.')
      }
      if (hasAmissio) {
        immediate.push('Be cautious with spending. Consider your financial priorities carefully.')
      }
    }
    
    if (questionType === 'health') {
      if (hasLaetitia || hasFortunaMajor) {
        immediate.push('Focus on wellness and positive healing practices.')
      }
      if (hasCarcer || hasTristitia) {
        immediate.push('Pay attention to your body\'s signals. Rest and recovery may be needed.')
      }
    }
    
    // Spiritual guidance
    spiritual.push('Trust in the wisdom of the earth and your intuition. The patterns revealed hold deeper meaning.')
    spiritual.push('Meditate on the geomantic figures for deeper insights into your situation.')
    spiritual.push('Connect with the elemental energies present in your reading - they guide your path.')
    
    if (hasCaputDraconis) {
      spiritual.push('The Dragon\'s Head indicates karmic blessings. Trust in the natural flow of destiny.')
    }
    
    if (hasCaudaDraconis) {
      spiritual.push('The Dragon\'s Tail calls for release. Let go of what no longer serves your highest good.')
    }
    
    // Ensure we always have at least some advice
    if (immediate.length === 0) {
      immediate.push('Take time to reflect on your question and listen to your inner guidance.')
    }
    
    if (shortTerm.length === 0) {
      shortTerm.push('Stay open to possibilities and trust the unfolding of events.')
    }
    
    if (longTerm.length === 0) {
      longTerm.push('Consider the long-term implications of your current path and choices.')
    }
    
    return {
      immediate,
      shortTerm,
      longTerm,
      spiritual
    }
  }

  private getOrdinalSuffix(num: number): string {
    if (num >= 11 && num <= 13) return 'th'
    switch (num % 10) {
      case 1: return 'st'
      case 2: return 'nd'
      case 3: return 'rd'
      default: return 'th'
    }
  }
}

export const geomancyIntelligence = new GeomancyIntelligence() 