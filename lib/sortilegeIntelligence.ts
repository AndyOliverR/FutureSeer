/**
 * Sortilege Intelligence Service
 * Comprehensive divination through casting lots (dice, stones, cards, coins, sticks)
 */

import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore'
import { devLog } from '@/lib/devLogger';
import { getFirebaseDB } from './firebase'
import { UserProfile } from './firebase'
import { createAICompletion } from './aiGateway'
import { getAllDivinationData } from './universalDataAggregator'


export type CastingMethod = 'dice' | 'stones' | 'cards' | 'coins' | 'sticks'

export interface CastResult {
  method: CastingMethod
  question: string
  cast: {
    objects: Array<{
      id: string
      value: number | string
      symbol?: string
      position?: { x: number; y: number }
      orientation?: number
    }>
    circle?: { center: { x: number; y: number }; radius: number }
    insideCircle?: number
    totalValue?: number
  }
  interpretation: {
    primary: string
    detailed: string
    symbols: Array<{
      name: string
      meaning: string
      significance: string
    }>
  }
  personalizedInsights: {
    overview: string
    guidance: string[]
    warnings: string[]
    opportunities: string[]
  }
  historicalContext: string
  remedies: string[]
  timestamp: Date
}

export interface SortilegeReading {
  id: string
  userId: string
  question: string
  method: CastingMethod
  castResult: CastResult
  comprehensiveReport: {
    overview: string
    interpretation: string
    personalizedInsights: string
    guidance: string[]
    remedies: string[]
    historicalContext: string
  }
  generatedAt: string
}

class SortilegeIntelligence {
  private db: any = null
  private cache = new Map<string, SortilegeReading>()
  private readonly CACHE_TTL = 1000 * 60 * 60 // 1 hour cache

  constructor() {
    try {
      this.db = getFirebaseDB()
    } catch (error) {
      devLog.warn('Firebase not available for Sortilege Intelligence', undefined, 'sortilegeIntelligence')
    }
  }

  /**
   * Generate comprehensive sortilege reading
   */
  async generateReading(
    userId: string,
    question: string,
    method: CastingMethod,
    userProfile?: UserProfile | null
  ): Promise<SortilegeReading> {
    // Check cache first
    const cacheKey = `${userId}-${question}-${method}`
    const cached = this.cache.get(cacheKey)
    if (cached) {
      const cacheAge = Date.now() - new Date(cached.generatedAt).getTime()
      if (cacheAge < this.CACHE_TTL) {
        return cached
      } else {
        this.cache.delete(cacheKey)
      }
    }

    // Perform the cast
    const castResult = await this.performCast(question, method)

    // Generate comprehensive report using AI
    const comprehensiveReport = await this.generateComprehensiveReport(
      question,
      method,
      castResult,
      userProfile
    )

    const reading: SortilegeReading = {
      id: `sortilege-${Date.now()}`,
      userId,
      question,
      method,
      castResult,
      comprehensiveReport,
      generatedAt: new Date().toISOString()
    }

    // Cache the reading
    this.cache.set(cacheKey, reading)

    // Save to Firestore
    await this.saveReading(userId, reading)

    return reading
  }

  /**
   * Perform the actual casting based on method
   */
  private async performCast(question: string, method: CastingMethod): Promise<CastResult> {
    switch (method) {
      case 'dice':
        return this.castDice(question)
      case 'stones':
        return this.castStones(question)
      case 'cards':
        return this.castCards(question)
      case 'coins':
        return this.castCoins(question)
      case 'sticks':
        return this.castSticks(question)
      default:
        throw new Error(`Unknown casting method: ${method}`)
    }
  }

  /**
   * Cast dice (Cleromancy)
   */
  private castDice(question: string): CastResult {
    // Generate deterministic but random-seeming results based on question
    const questionHash = this.hashQuestion(question)
    const seed = questionHash % 1000000

    // Simulate 2 dice
    const die1 = (seed % 6) + 1
    const die2 = ((seed * 7) % 6) + 1
    const total = die1 + die2

    // Simulate circle casting - both dice inside so generated reading is always valid for Ask the Seer
    const insideCircle = 2

    const dice = [
      {
        id: 'die1',
        value: die1,
        position: { x: 50 + (seed % 20) - 10, y: 50 + ((seed * 3) % 20) - 10 },
        orientation: (seed % 360)
      },
      {
        id: 'die2',
        value: die2,
        position: { x: 50 + ((seed * 5) % 20) - 10, y: 50 + ((seed * 7) % 20) - 10 },
        orientation: ((seed * 11) % 360)
      }
    ]

    const interpretation = this.interpretDice(die1, die2, total, insideCircle)

    return {
      method: 'dice',
      question,
      cast: {
        objects: dice,
        circle: { center: { x: 50, y: 50 }, radius: 30 },
        insideCircle,
        totalValue: total
      },
      interpretation,
      personalizedInsights: {
        overview: '',
        guidance: [],
        warnings: [],
        opportunities: []
      },
      historicalContext: 'Dice casting (cleromancy) has been used since ancient times to determine fate and divine will. In ancient Rome, dice were cast to make important decisions.',
      remedies: [],
      timestamp: new Date()
    }
  }

  /**
   * Cast stones (Lithomancy)
   */
  private castStones(question: string): CastResult {
    const questionHash = this.hashQuestion(question)
    const seed = questionHash % 1000000

    const stoneSymbols = ['Sun', 'Moon', 'Star', 'Tree', 'Water', 'Fire', 'Earth', 'Air']
    const numStones = 5 + (seed % 3) // 5-7 stones

    const stones = Array.from({ length: numStones }, (_, i) => {
      const symbolIndex = (seed * (i + 1)) % stoneSymbols.length
      return {
        id: `stone-${i}`,
        value: symbolIndex,
        symbol: stoneSymbols[symbolIndex],
        position: {
          x: 30 + ((seed * (i + 1) * 7) % 40),
          y: 30 + ((seed * (i + 1) * 11) % 40)
        },
        orientation: (seed * (i + 1) * 13) % 360
      }
    })

    const interpretation = this.interpretStones(stones)

    return {
      method: 'stones',
      question,
      cast: {
        objects: stones
      },
      interpretation,
      personalizedInsights: {
        overview: '',
        guidance: [],
        warnings: [],
        opportunities: []
      },
      historicalContext: 'Stone casting (lithomancy) is one of the oldest forms of divination, used by ancient cultures to read patterns and symbols in nature.',
      remedies: [],
      timestamp: new Date()
    }
  }

  /**
   * Cast cards (Cartomancy)
   */
  private castCards(question: string): CastResult {
    const questionHash = this.hashQuestion(question)
    const seed = questionHash % 1000000

    const majorArcana = [
      'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
      'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
      'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
      'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World'
    ]

    const numCards = 3
    const cards = Array.from({ length: numCards }, (_, i) => {
      const cardIndex = (seed * (i + 1) * 17) % majorArcana.length
      return {
        id: `card-${i}`,
        value: cardIndex,
        symbol: majorArcana[cardIndex],
        position: {
          x: 20 + (i * 30),
          y: 50
        },
        orientation: (seed * (i + 1)) % 2 === 0 ? 0 : 180 // Upright or reversed
      }
    })

    const interpretation = this.interpretCards(cards)

    return {
      method: 'cards',
      question,
      cast: {
        objects: cards
      },
      interpretation,
      personalizedInsights: {
        overview: '',
        guidance: [],
        warnings: [],
        opportunities: []
      },
      historicalContext: 'Card divination (cartomancy) evolved from ancient card games and became a powerful tool for divination, with Tarot being one of the most popular systems.',
      remedies: [],
      timestamp: new Date()
    }
  }

  /**
   * Cast coins (I Ching style)
   */
  private castCoins(question: string): CastResult {
    const questionHash = this.hashQuestion(question)
    const seed = questionHash % 1000000

    // I Ching uses 3 coins, each can be heads (3) or tails (2)
    const coins = Array.from({ length: 3 }, (_, i) => {
      const isHeads = ((seed * (i + 1) * 19) % 2) === 0
      return {
        id: `coin-${i}`,
        value: isHeads ? 3 : 2,
        symbol: isHeads ? 'Heads' : 'Tails',
        position: {
          x: 30 + (i * 20),
          y: 50
        },
        orientation: isHeads ? 0 : 180
      }
    })

    const total = coins.reduce((sum, coin) => sum + (coin.value as number), 0)
    const interpretation = this.interpretCoins(coins, total)

    return {
      method: 'coins',
      question,
      cast: {
        objects: coins,
        totalValue: total
      },
      interpretation,
      personalizedInsights: {
        overview: '',
        guidance: [],
        warnings: [],
        opportunities: []
      },
      historicalContext: 'Coin divination is central to the I Ching (Book of Changes), one of the oldest Chinese divination systems dating back over 3000 years.',
      remedies: [],
      timestamp: new Date()
    }
  }

  /**
   * Cast sticks
   */
  private castSticks(question: string): CastResult {
    const questionHash = this.hashQuestion(question)
    const seed = questionHash % 1000000
    const timestamp = Date.now()

    const stickSymbols = ['Growth', 'Protection', 'Wisdom', 'Change', 'Stability', 'Journey']
    const numSticks = 5

    // Use different prime numbers for each stick to ensure variety
    const primes = [23, 29, 31, 37, 41, 43, 47, 53, 59, 61]

    const sticks = Array.from({ length: numSticks }, (_, i) => {
      // Add more entropy by combining seed, index, timestamp, and different primes
      const entropy = (seed * (i + 1) * primes[i % primes.length] + timestamp * (i + 1) * primes[(i + 2) % primes.length]) % 1000000
      const symbolIndex = entropy % stickSymbols.length
      return {
        id: `stick-${i}`,
        value: symbolIndex,
        symbol: stickSymbols[symbolIndex],
        position: {
          x: 25 + ((entropy * primes[i % primes.length]) % 50),
          y: 30 + ((entropy * primes[(i + 1) % primes.length]) % 40)
        },
        orientation: (entropy * primes[(i + 3) % primes.length]) % 360
      }
    })

    const interpretation = this.interpretSticks(sticks)

    return {
      method: 'sticks',
      question,
      cast: {
        objects: sticks
      },
      interpretation,
      personalizedInsights: {
        overview: '',
        guidance: [],
        warnings: [],
        opportunities: []
      },
      historicalContext: 'Stick casting has been used in many cultures, from Chinese I Ching yarrow stalks to African divination practices.',
      remedies: [],
      timestamp: new Date()
    }
  }

  /**
   * Interpret dice results
   */
  private interpretDice(die1: number, die2: number, total: number, insideCircle: number): CastResult['interpretation'] {
    const meanings: Record<number, string> = {
      2: 'Partnership and balance. A time for cooperation.',
      3: 'Creativity and expression. New beginnings.',
      4: 'Stability and foundation. Building solid ground.',
      5: 'Change and adventure. Embrace transformation.',
      6: 'Harmony and balance. Peaceful resolution.',
      7: 'Spiritual insight. Inner wisdom.',
      8: 'Material success. Abundance and prosperity.',
      9: 'Completion and fulfillment. Achievement.',
      10: 'New cycle beginning. Fresh start.',
      11: 'Intuition and inspiration. Trust your inner voice.',
      12: 'Mastery and completion. Full circle.'
    }

    const primary = meanings[total] || 'The dice reveal a message of change and possibility.'
    
    let detailed = `The first die shows ${die1}, representing ${this.getDieMeaning(die1)}. `
    detailed += `The second die shows ${die2}, representing ${this.getDieMeaning(die2)}. `
    detailed += `Together they total ${total}, which signifies ${meanings[total] || 'a time of change'}. `
    
    if (insideCircle === 2) {
      detailed += 'Both dice landed inside the sacred circle, indicating strong alignment with your question.'
    } else if (insideCircle === 1) {
      detailed += 'One die landed inside the circle, suggesting partial alignment with your path.'
    } else {
      detailed += 'The dice landed outside the circle, suggesting you may need to reconsider your approach.'
    }

    return {
      primary,
      detailed,
      symbols: [
        {
          name: `Die 1: ${die1}`,
          meaning: this.getDieMeaning(die1),
          significance: 'Represents the foundation or current state'
        },
        {
          name: `Die 2: ${die2}`,
          meaning: this.getDieMeaning(die2),
          significance: 'Represents the direction or outcome'
        },
        {
          name: `Total: ${total}`,
          meaning: meanings[total] || 'Change and transformation',
          significance: 'The combined message of the cast'
        }
      ]
    }
  }

  private getDieMeaning(value: number): string {
    const meanings: Record<number, string> = {
      1: 'New beginnings, individuality',
      2: 'Partnership, balance, duality',
      3: 'Creativity, expression, communication',
      4: 'Stability, foundation, structure',
      5: 'Change, freedom, adventure',
      6: 'Harmony, balance, completion'
    }
    return meanings[value] || 'Mystery and potential'
  }

  /**
   * Interpret stones
   */
  private interpretStones(stones: CastResult['cast']['objects']): CastResult['interpretation'] {
    const symbolCounts: Record<string, number> = {}
    stones.forEach(stone => {
      const symbol = stone.symbol || 'Unknown'
      symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1
    })

    const dominantSymbol = Object.entries(symbolCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Unknown'

    const symbolMeanings: Record<string, string> = {
      'Sun': 'Illumination, clarity, vitality',
      'Moon': 'Intuition, emotions, cycles',
      'Star': 'Guidance, hope, destiny',
      'Tree': 'Growth, stability, connection',
      'Water': 'Emotions, flow, purification',
      'Fire': 'Passion, transformation, energy',
      'Earth': 'Grounding, stability, material',
      'Air': 'Thought, communication, freedom'
    }

    const primary = `The stones reveal the symbol of ${dominantSymbol}, representing ${symbolMeanings[dominantSymbol] || 'mystery and potential'}.`

    let detailed = `You cast ${stones.length} stones. The dominant symbol is ${dominantSymbol}, which appears ${symbolCounts[dominantSymbol]} time(s). `
    detailed += `This symbol represents ${symbolMeanings[dominantSymbol] || 'a message from the divine'}. `
    detailed += `The positions and proximity of the stones suggest patterns in your path.`

    const symbols = stones.map((stone, index) => ({
      name: `Stone ${index + 1}: ${stone.symbol}`,
      meaning: symbolMeanings[stone.symbol || 'Unknown'] || 'Mystery and potential',
      significance: `Position ${index + 1} in the cast`
    }))

    return { primary, detailed, symbols }
  }

  /**
   * Interpret cards
   */
  private interpretCards(cards: CastResult['cast']['objects']): CastResult['interpretation'] {
    const cardNames = cards.map(c => c.symbol || 'Unknown')
    const primary = `The cards reveal: ${cardNames.join(', ')}.`

    let detailed = `You drew ${cards.length} cards. `
    cards.forEach((card, index) => {
      const isReversed = card.orientation === 180
      detailed += `Card ${index + 1} is ${card.symbol}${isReversed ? ' (reversed)' : ''}, `
    })
    detailed += 'These cards together tell a story about your question.'

    const symbols = cards.map((card, index) => ({
      name: `Card ${index + 1}: ${card.symbol}`,
      meaning: card.orientation === 180 ? 'Reversed meaning' : 'Upright meaning',
      significance: `Position ${index + 1} in the spread`
    }))

    return { primary, detailed, symbols }
  }

  /**
   * Interpret coins
   */
  private interpretCoins(coins: CastResult['cast']['objects'], total: number): CastResult['interpretation'] {
    const lineTypes: Record<number, string> = {
      6: 'Old Yin (changing)',
      7: 'Young Yang (stable)',
      8: 'Young Yin (stable)',
      9: 'Old Yang (changing)'
    }

    const lineType = lineTypes[total] || 'Unknown'
    const meaning = this.getCoinLineMeaning(total)
    const primary = `The coins reveal ${lineType}, representing ${meaning}.`

    // Build professional description
    const coinResults = coins.map((coin, index) => {
      const position = ['first', 'second', 'third'][index] || `${index + 1}`
      return `the ${position} coin shows ${coin.symbol === 'Heads' ? 'Yang (Heads)' : 'Yin (Tails)'}`
    }).join(', ')

    const detailed = `Three coins were cast in the traditional I Ching method. ${coinResults.charAt(0).toUpperCase() + coinResults.slice(1)}, resulting in a total of ${total}. This combination forms a ${lineType} line, which represents ${meaning}.`

    const symbols = coins.map((coin, index) => ({
      name: `Coin ${index + 1}: ${coin.symbol === 'Heads' ? 'Yang' : 'Yin'}`,
      meaning: coin.symbol === 'Heads' ? 'Yang energy - active, creative, masculine principle' : 'Yin energy - receptive, nurturing, feminine principle',
      significance: `The ${coin.symbol === 'Heads' ? 'Yang' : 'Yin'} energy of this coin contributes to the formation of the hexagram line, influencing the overall divination reading.`
    }))

    return { primary, detailed, symbols }
  }

  private getCoinLineMeaning(total: number): string {
    const meanings: Record<number, string> = {
      6: 'Yin changing to Yang - transformation',
      7: 'Yang stable - active, creative',
      8: 'Yin stable - receptive, nurturing',
      9: 'Yang changing to Yin - completion'
    }
    return meanings[total] || 'Mystery and potential'
  }

  /**
   * Interpret sticks
   */
  private interpretSticks(sticks: CastResult['cast']['objects']): CastResult['interpretation'] {
    const symbolCounts: Record<string, number> = {}
    sticks.forEach(stick => {
      const symbol = stick.symbol || 'Unknown'
      symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1
    })

    const dominantSymbol = Object.entries(symbolCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Unknown'

    const symbolMeanings: Record<string, string> = {
      'Growth': 'Expansion, development, progress',
      'Protection': 'Safety, security, boundaries',
      'Wisdom': 'Knowledge, understanding, insight',
      'Change': 'Transformation, transition, new phase',
      'Stability': 'Foundation, consistency, reliability',
      'Journey': 'Movement, travel, path forward'
    }

    const primary = `The sticks reveal ${dominantSymbol}, representing ${symbolMeanings[dominantSymbol] || 'mystery and potential'}.`

    let detailed = `You cast ${sticks.length} sticks. The dominant symbol is ${dominantSymbol}. `
    detailed += `The arrangement and positions of the sticks reveal patterns in your path.`

    const symbols = sticks.map((stick, index) => ({
      name: `Stick ${index + 1}: ${stick.symbol}`,
      meaning: symbolMeanings[stick.symbol || 'Unknown'] || 'Mystery and potential',
      significance: `Position ${index + 1} in the cast`
    }))

    return { primary, detailed, symbols }
  }

  /**
   * Generate comprehensive AI report
   */
  private async generateComprehensiveReport(
    question: string,
    method: CastingMethod,
    castResult: CastResult,
    userProfile?: UserProfile | null
  ): Promise<SortilegeReading['comprehensiveReport']> {
    const displayName = userProfile?.displayName || userProfile?.fullName || 'Beloved Seeker'
    const hasCompleteProfile = userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace

    try {
      // Get universal divination data if profile is complete
      let universalData = null
      if (hasCompleteProfile && userProfile) {
        try {
          universalData = await getAllDivinationData(userProfile, question)
        } catch (error) {
          devLog.warn('Could not fetch universal data:', error, 'sortilegeIntelligence')
        }
      }

      const systemPrompt = `You are a master Sortilege diviner with deep knowledge of ancient divination practices including cleromancy (dice), lithomancy (stones), cartomancy (cards), coin divination, and stick casting. Sortilege is the art of divination through casting lots - objects like dice, stones, cards, coins, or sticks that are thrown or drawn to reveal guidance.

Key Principles:
- Sortilege relies on synchronicity and chance to reveal hidden truths
- The position, orientation, and symbols of cast objects carry meaning
- Each method has its own historical and cultural significance
- Personal context enhances interpretation
- Address the user directly using "you" and "your"
- Be profound yet practical
- Connect the cast results to the user's question
- Provide actionable guidance
- DO NOT use markdown formatting (no **, *, or []())
- Be concise and specific - avoid generic statements`

      const castDescription = this.describeCast(castResult)
      const profileContext = hasCompleteProfile && userProfile
        ? `\n\nUser Profile:\n- Name: ${displayName}\n- Birth Date: ${userProfile.birthDate}\n- Birth Time: ${userProfile.birthTime}\n- Birth Place: ${userProfile.birthPlace}`
        : '\n\nNote: User profile is incomplete. Provide general guidance that can be personalized once profile is complete.'

      const astroContext = universalData
        ? `\n\nAstrological Context:\n- The user's astrological profile provides additional layers of meaning to this reading.`
        : ''

      const userPrompt = `Generate a comprehensive Sortilege divination report for ${displayName}.

Question: ${question}
Method: ${method}
Cast Result: ${castDescription}${profileContext}${astroContext}

IMPORTANT: Format your response EXACTLY as follows. Use clear section headers. Do NOT use markdown formatting like ** or *. Use plain text only.

=== OVERVIEW ===

[Write 3-4 sentences providing an overview of the reading, connecting the cast result to the question. Address ${displayName} directly.]

=== INTERPRETATION ===

[Write 4-6 sentences providing detailed interpretation of the cast results. Explain what the symbols, positions, and patterns mean in relation to the question. Be specific and personal.]

=== PERSONALIZED INSIGHTS ===

[Write 4-6 sentences providing personalized insights based on the cast and the user's question. If profile data is available, incorporate it. Address ${displayName} directly using "you" and "your".]

=== GUIDANCE ===

- [Guidance point 1: specific actionable advice]
- [Guidance point 2: specific actionable advice]
- [Guidance point 3: specific actionable advice]
- [Guidance point 4: specific actionable advice]
- [Guidance point 5: specific actionable advice]

=== REMEDIES ===

- [Remedy 1: specific practice or action]
- [Remedy 2: specific practice or action]
- [Remedy 3: specific practice or action]
- [Remedy 4: specific practice or action]

=== HISTORICAL CONTEXT ===

[Write 2-3 sentences about the historical and cultural significance of ${method} divination. Explain how this method has been used throughout history.]

Remember: Use plain text only. No markdown formatting. Be specific and personal. Address ${displayName} directly using "you" and "your".`

      const result = await createAICompletion({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        maxTokens: 3000,
        topP: 0.9,
        frequencyPenalty: 0.3,
        presencePenalty: 0.3
      })

      const aiResponse = result.content || ''
      return this.parseAIResponse(aiResponse, displayName)

    } catch (error) {
      devLog.error('Error generating comprehensive report:', error, 'sortilegeIntelligence')
      return this.generateFallbackReport(question, method, castResult, displayName)
    }
  }

  /**
   * Describe the cast result for AI
   */
  private describeCast(castResult: CastResult): string {
    const { method, cast, interpretation } = castResult
    let description = `Method: ${method}\n`
    description += `Primary Interpretation: ${interpretation.primary}\n`
    description += `Detailed: ${interpretation.detailed}\n`
    description += `Symbols: ${interpretation.symbols.map(s => `${s.name} - ${s.meaning}`).join(', ')}\n`
    
    if (cast.totalValue !== undefined) {
      description += `Total Value: ${cast.totalValue}\n`
    }
    if (cast.insideCircle !== undefined) {
      description += `Objects inside circle: ${cast.insideCircle}\n`
    }
    
    return description
  }

  /**
   * Parse AI response into structured format
   */
  private parseAIResponse(aiResponse: string, displayName: string): SortilegeReading['comprehensiveReport'] {
    const cleanText = (text: string): string => {
      if (!text) return ''
      // Remove all section headers (=== SECTION_NAME ===)
      text = text.replace(/===+\s*[A-Z\s]+\s*===+/gi, '')
      // Remove markdown formatting
      text = text.replace(/\*\*/g, '')
      text = text.replace(/\*/g, '')
      text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      // Remove list markers
      text = text.replace(/^[-•*]\s*/gm, '')
      text = text.replace(/^\d+\.\s*/gm, '')
      // Normalize whitespace
      text = text.replace(/\n{3,}/g, '\n\n')
      text = text.trim()
      return text
    }

    const extractSection = (sectionName: string, content: string): string => {
      // Pattern to match section header with === format followed by content until next section or end
      const sectionHeaderPattern = new RegExp(`===+\\s*${sectionName}\\s*===+\\s*([\\s\\S]*?)(?===+\\s*[A-Z\\s]+\\s*===+|$)`, 'i')
      let match = content.match(sectionHeaderPattern)
      
      // Fallback pattern for sections without === format
      if (!match || !match[1]) {
        const fallbackPattern = new RegExp(`${sectionName}[\\s:]*([\\s\\S]*?)(?===+\\s*[A-Z\\s]+\\s*===+|$)`, 'i')
        match = content.match(fallbackPattern)
      }
      
      if (match && match[1]) {
        let text = match[1].trim()
        // Remove any section headers that might be embedded in the content
        text = text.replace(/===+\s*[A-Z\s]+\s*===+/gi, '')
        text = cleanText(text)
        if (text.length > 800) {
          text = text.substring(0, 800).trim() + '...'
        }
        return text
      }
      return ''
    }

    const extractList = (sectionName: string, content: string): string[] => {
      // Pattern to match section header with === format followed by content until next section or end
      let sectionHeaderPattern = new RegExp(`===+\\s*${sectionName}\\s*===+\\s*([\\s\\S]*?)(?===+\\s*[A-Z\\s]+\\s*===+|$)`, 'i')
      let sectionMatch = content.match(sectionHeaderPattern)
      
      // Fallback pattern for sections without === format
      if (!sectionMatch || !sectionMatch[1]) {
        const fallbackPattern = new RegExp(`${sectionName}[\\s:]*([\\s\\S]*?)(?===+\\s*[A-Z\\s]+\\s*===+|$)`, 'i')
        sectionMatch = content.match(fallbackPattern)
      }
      
      if (!sectionMatch || !sectionMatch[1]) return []
      
      let sectionContent = sectionMatch[1].trim()
      // Remove any section headers that might be embedded in the content
      sectionContent = sectionContent.replace(/===+\s*[A-Z\s]+\s*===+/gi, '')
      
      const items = sectionContent
        .split(/\n/)
        .map(line => cleanText(line))
        .filter(line => {
          const trimmed = line.trim()
          return trimmed.length > 5 && 
                 !trimmed.match(/^(===|Guidance|Remedies|Historical|Personalized|Overview|Interpretation)/i)
        })
        .map(item => item.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim())
        .filter(item => item.length > 0)
      
      return Array.from(new Set(items)).slice(0, 10)
    }

    const overview = extractSection('OVERVIEW', aiResponse) || 
                    `Dear ${displayName}, the sortilege cast reveals guidance for your question.`
    
    const interpretation = extractSection('INTERPRETATION', aiResponse) || 
                          'The cast results provide insight into your situation.'
    
    const personalizedInsights = extractSection('PERSONALIZED INSIGHTS', aiResponse) || 
                                 'The symbols and patterns in your cast offer personal guidance.'
    
    const guidance = extractList('GUIDANCE', aiResponse) || 
                    ['Trust your intuition', 'Take aligned action', 'Stay open to guidance']
    
    const remedies = extractList('REMEDIES', aiResponse) || 
                    ['Meditate on the symbols', 'Journal about the meaning', 'Take time for reflection']
    
    const historicalContext = extractSection('HISTORICAL CONTEXT', aiResponse) || 
                              'Sortilege has been practiced for thousands of years across many cultures.'

    return {
      overview: cleanText(overview),
      interpretation: cleanText(interpretation),
      personalizedInsights: cleanText(personalizedInsights),
      guidance,
      remedies,
      historicalContext: cleanText(historicalContext)
    }
  }

  /**
   * Generate fallback report if AI fails
   */
  private generateFallbackReport(
    question: string,
    method: CastingMethod,
    castResult: CastResult,
    displayName: string
  ): SortilegeReading['comprehensiveReport'] {
    return {
      overview: `Dear ${displayName}, the sortilege cast using ${method} reveals guidance for your question: "${question}". The symbols and patterns in your cast offer insight into your path.`,
      interpretation: castResult.interpretation.detailed,
      personalizedInsights: `The cast results suggest that ${castResult.interpretation.primary} This guidance is specifically relevant to your question and current situation.`,
      guidance: [
        'Trust the guidance revealed in the cast',
        'Reflect on the symbols and their meanings',
        'Take aligned action based on the insights',
        'Stay open to synchronicities',
        'Honor the wisdom of the ancient practice'
      ],
      remedies: [
        'Meditate on the cast symbols',
        'Journal about the interpretation',
        'Create a ritual to honor the guidance',
        'Share the insights with trusted advisors'
      ],
      historicalContext: castResult.historicalContext
    }
  }

  /**
   * Hash function for deterministic results
   */
  private hashQuestion(question: string): number {
    let hash = 0
    const normalizedQuestion = question.toLowerCase().trim().replace(/[^\w\s]/g, '')
    
    for (let i = 0; i < normalizedQuestion.length; i++) {
      const char = normalizedQuestion.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    
    return Math.abs(hash)
  }

  /**
   * Save reading to Firestore
   */
  async saveReading(userId: string, reading: SortilegeReading): Promise<void> {
    if (!this.db) {
      devLog.warn('Firestore not available, skipping save', 'sortilegeIntelligence')
      return
    }

    try {
      const readingRef = doc(this.db, 'users', userId, 'sortilege-readings', reading.id)
      await setDoc(readingRef, {
        ...reading,
        castResult: {
          ...reading.castResult,
          timestamp: Timestamp.fromDate(reading.castResult.timestamp)
        }
      })
      devLog.debug('✅ Saved Sortilege reading to Firestore')
    } catch (error) {
      devLog.error('Error saving Sortilege reading:', error, 'sortilegeIntelligence')
    }
  }

  /**
   * Load reading from Firestore
   */
  async loadReading(userId: string, readingId: string): Promise<SortilegeReading | null> {
    if (!this.db) {
      return null
    }

    try {
      const readingRef = doc(this.db, 'users', userId, 'sortilege-readings', readingId)
      const docSnap = await getDoc(readingRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          ...data,
          castResult: {
            ...data.castResult,
            timestamp: data.castResult.timestamp.toDate()
          }
        } as SortilegeReading
      }
      
      return null
    } catch (error) {
      devLog.error('Error loading Sortilege reading:', error, 'sortilegeIntelligence')
      return null
    }
  }
}

export const sortilegeIntelligence = new SortilegeIntelligence()

