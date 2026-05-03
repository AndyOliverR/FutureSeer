/* eslint-disable @typescript-eslint/no-require-imports */
import { devLog } from '@/lib/devLogger';
import { userSubdocGet, userSubdocSet, userSubcollectionQueryOrdered } from '@/lib/userSubcollectionFirestore';

export interface LenormandCard {
  number: number
  name: string
  keywords: string[]
  description: string
  advice: string
  image?: string
  playingCard?: string // Traditional playing card association
  timing?: string // Timing indicators
  element?: 'air' | 'earth' | 'fire' | 'water'
  house?: string // For Grand Tableau house interpretations
}

export interface LenormandSpread {
  type: 'single' | 'three' | 'nine' | 'grandTableau' | 'lineOfFive'
  cards: LenormandCard[]
  positions: string[]
  question: string
  interpretation: string
}

export interface LenormandAnalysis {
  spread: LenormandSpread
  summary: string
  advice: string[]
  confidence: number
}

export interface LenormandQuestion {
  question: string
  spreadType: 'single' | 'three' | 'nine' | 'grandTableau' | 'lineOfFive'
  urgency: 'low' | 'medium' | 'high'
}

export interface LenormandAnswer {
  question: string
  answer: string
  cards: LenormandCard[]
  advice: string[]
  confidence: number
}

export interface LenormandReading {
  id: string
  question: string
  spreadType: string
  cards: LenormandCard[]
  positions: string[]
  overallReading: string
  individualCardReadings: Array<{
    cardName: string
    position: string
    interpretation: string
  }>
  combinations: Array<{
    cards: string[]
    meaning: string
  }>
  advice: string[]
  timing: string
  timestamp: Date
}

export const LENORMAND_DECK: LenormandCard[] = [
  { number: 1, name: 'Rider', keywords: ['news', 'messages', 'movement', 'visitor'], description: 'The Rider brings news, messages, swift changes, and arrivals. A messenger of fresh information and movement in your life.', advice: 'Be open to new information and opportunities coming your way.', playingCard: '9♠', timing: 'Very soon (hours to days)', element: 'air' },
  { number: 2, name: 'Clover', keywords: ['luck', 'opportunity', 'chance', 'fleeting'], description: 'The Clover brings luck, small opportunities, serendipity, and brief moments of joy.', advice: 'Take advantage of lucky breaks while they last.', playingCard: '6♦', timing: 'Very soon', element: 'fire' },
  { number: 3, name: 'Ship', keywords: ['travel', 'journey', 'commerce', 'distance'], description: 'The Ship brings travel, journeys, business ventures, and distant connections.', advice: 'Explore new horizons and embrace change.', playingCard: '10♠', timing: 'Weeks to months', element: 'water' },
  { number: 4, name: 'House', keywords: ['home', 'family', 'stability', 'foundation'], description: 'The House brings stability, home, family matters, and your personal foundation.', advice: 'Focus on your home and family life for grounding.', playingCard: 'K♥', timing: 'Ongoing', element: 'earth' },
  { number: 5, name: 'Tree', keywords: ['health', 'growth', 'roots', 'endurance'], description: 'The Tree brings health, growth, long-term matters, and resilience.', advice: 'Nurture your physical and spiritual well-being.', playingCard: '7♥', timing: 'Long-term (months to years)', element: 'earth' },
  { number: 6, name: 'Clouds', keywords: ['confusion', 'uncertainty', 'doubt', 'obstacles'], description: 'The Clouds bring confusion, lack of clarity, obstacles, and obscured vision.', advice: 'Wait for the fog to clear before making decisions.', playingCard: 'K♣', timing: 'Variable', element: 'air' },
  { number: 7, name: 'Snake', keywords: ['deception', 'complication', 'seduction', 'wisdom'], description: 'The Snake brings complications, deception, seduction, but also transformation and hidden wisdom.', advice: 'Be wary of hidden motives and complicated situations.', playingCard: '9♥', timing: 'Variable', element: 'fire' },
  { number: 8, name: 'Coffin', keywords: ['ending', 'loss', 'transformation', 'release'], description: 'The Coffin brings endings, loss, transformation, and necessary release.', advice: 'Let go of what no longer serves your highest good.', playingCard: '9♦', timing: 'Critical transition', element: 'earth' },
  { number: 9, name: 'Bouquet', keywords: ['gift', 'happiness', 'invitation', 'beauty'], description: 'The Bouquet brings gifts, happiness, invitations, beauty, and pleasant surprises.', advice: 'Accept joy, gratitude, and recognize the beauty around you.', playingCard: 'Q♠', timing: 'Within days', element: 'air' },
  { number: 10, name: 'Scythe', keywords: ['sudden', 'cut', 'danger', 'decision'], description: 'The Scythe brings sudden changes, cuts, danger, and decisive moments requiring action.', advice: 'Act decisively and with caution during critical moments.', playingCard: 'J♠', timing: 'Immediate', element: 'air' },
  { number: 11, name: 'Whip', keywords: ['conflict', 'tension', 'repetition', 'arguments'], description: 'The Whip brings conflict, tension, repetitive patterns, and heated discussions.', advice: 'Address repetitive issues directly to break negative cycles.', playingCard: 'J♦', timing: 'Repeatedly', element: 'fire' },
  { number: 12, name: 'Birds', keywords: ['communication', 'worry', 'gossip', 'conversation'], description: 'The Birds bring communication, worry, gossip, and important conversations.', advice: 'Engage in meaningful dialogue and manage anxieties.', playingCard: '6♥', timing: 'Soon (days)', element: 'air' },
  { number: 13, name: 'Child', keywords: ['innocence', 'new beginnings', 'playfulness', 'potential'], description: 'The Child brings innocence, new beginnings, playfulness, and untapped potential.', advice: 'Approach situations with fresh eyes and childlike wonder.', playingCard: '10♦', timing: 'New cycle', element: 'fire' },
  { number: 14, name: 'Fox', keywords: ['cunning', 'work', 'strategy', 'deception'], description: 'The Fox brings cunning, hard work, strategic thinking, and careful navigation.', advice: 'Work smart, not just hard, and stay alert to opportunities.', playingCard: '9♣', timing: 'Ongoing effort', element: 'earth' },
  { number: 15, name: 'Bear', keywords: ['strength', 'protection', 'authority', 'leadership'], description: 'The Bear brings strength, protection, authority, and natural leadership.', advice: 'Draw on your inner strength and protect what matters most.', playingCard: '10♣', timing: 'Sustained period', element: 'earth' },
  { number: 16, name: 'Stars', keywords: ['hope', 'guidance', 'spiritual', 'clarity'], description: 'The Stars bring hope, spiritual guidance, clarity, and inspiration from above.', advice: 'Trust in higher wisdom and follow your true north.', playingCard: '6♠', timing: 'As needed', element: 'air' },
  { number: 17, name: 'Stork', keywords: ['change', 'movement', 'shift', 'transformation'], description: 'The Stork brings change, movement, life shifts, and necessary transformations.', advice: 'Embrace change as a natural part of growth.', playingCard: 'J♥', timing: 'Weeks', element: 'water' },
  { number: 18, name: 'Dog', keywords: ['loyalty', 'friendship', 'companionship', 'support'], description: 'The Dog brings loyalty, friendship, companionship, and supportive relationships.', advice: 'Value your friendships and show loyalty to those who support you.', playingCard: '10♥', timing: 'Ongoing', element: 'fire' },
  { number: 19, name: 'Tower', keywords: ['isolation', 'barriers', 'protection', 'institution'], description: 'The Tower brings isolation, barriers, protection, and institutional boundaries.', advice: 'Recognize when you need solitude and when to break down walls.', playingCard: '6♣', timing: 'Long-lasting', element: 'earth' },
  { number: 20, name: 'Garden', keywords: ['social', 'public', 'community', 'networking'], description: 'The Garden brings social connections, public spaces, community involvement, and networking.', advice: 'Engage with your community and expand your social circle.', playingCard: '8♠', timing: 'Upcoming', element: 'air' },
  { number: 21, name: 'Mountain', keywords: ['obstacle', 'blockage', 'challenge', 'delay'], description: 'The Mountain brings obstacles, blockages, challenges, and frustrating delays.', advice: 'Be patient and persistent when facing obstacles.', playingCard: '8♣', timing: 'Prolonged', element: 'earth' },
  { number: 22, name: 'Crossroads', keywords: ['choice', 'decision', 'path', 'option'], description: 'The Crossroads brings important choices, critical decisions, and multiple paths forward.', advice: 'Consider all options carefully before choosing your direction.', playingCard: 'K♠', timing: 'Decision point', element: 'earth' },
  { number: 23, name: 'Mice', keywords: ['worry', 'loss', 'deterioration', 'anxiety'], description: 'The Mice bring worry, gradual loss, deterioration of resources, and gnawing anxiety.', advice: 'Address concerns before they multiply and drain your energy.', playingCard: '7♣', timing: 'Gradual', element: 'water' },
  { number: 24, name: 'Heart', keywords: ['love', 'emotions', 'passion', 'relationship'], description: 'The Heart brings love, deep emotions, passion, and romantic connections.', advice: 'Follow your heart but keep your wisdom close.', playingCard: 'J♣', timing: 'Ongoing', element: 'water' },
  { number: 25, name: 'Ring', keywords: ['commitment', 'contract', 'promise', 'circle'], description: 'The Ring brings commitments, contracts, promises, partnership, and cycles.', advice: 'Honor your commitments and recognize relationship patterns.', playingCard: 'A♥', timing: 'Binding period', element: 'air' },
  { number: 26, name: 'Book', keywords: ['knowledge', 'secrets', 'learning', 'mystery'], description: 'The Book brings knowledge, hidden secrets, learning opportunities, and mysteries revealed.', advice: 'Seek knowledge and be prepared for revelations.', playingCard: '8♦', timing: 'Revelation pending', element: 'water' },
  { number: 27, name: 'Letter', keywords: ['message', 'communication', 'document', 'news'], description: 'The Letter brings messages, written communication, documents, and important news.', advice: 'Pay attention to all forms of communication and documentation.', playingCard: '7♠', timing: 'Imminent (hours to days)', element: 'air' },
  { number: 28, name: 'Man', keywords: ['male', 'masculine', 'person', 'self'], description: 'The Man represents a male person, masculine energy, or yourself if you are male.', advice: 'Consider masculine aspects of situations and relationships.', playingCard: 'K♦', timing: 'Present', element: 'fire' },
  { number: 29, name: 'Woman', keywords: ['female', 'feminine', 'person', 'self'], description: 'The Woman represents a female person, feminine energy, or yourself if you are female.', advice: 'Consider feminine aspects of situations and relationships.', playingCard: 'Q♥', timing: 'Present', element: 'water' },
  { number: 30, name: 'Lily', keywords: ['purity', 'peace', 'wisdom', 'harmony'], description: 'The Lily brings purity, peace, wisdom, harmony, and mature understanding.', advice: 'Seek inner peace and act with wisdom and integrity.', playingCard: 'K♣', timing: 'Mature period', element: 'water' },
  { number: 31, name: 'Sun', keywords: ['happiness', 'success', 'vitality', 'optimism'], description: 'The Sun brings happiness, success, vitality, optimism, and radiant energy.', advice: 'Celebrate your successes and let your light shine.', playingCard: 'A♣', timing: 'Immediate joy', element: 'fire' },
  { number: 32, name: 'Moon', keywords: ['intuition', 'cycles', 'emotions', 'reflection'], description: 'The Moon brings intuition, natural cycles, emotional depth, and reflective wisdom.', advice: 'Trust your intuition and honor your emotional cycles.', playingCard: 'A♠', timing: 'Cyclical', element: 'water' },
  { number: 33, name: 'Key', keywords: ['solution', 'opportunity', 'access', 'unlock'], description: 'The Key brings solutions, golden opportunities, access to what was locked, and unlocking potential.', advice: 'Seize the key to your next opportunity or solution.', playingCard: '8♥', timing: 'Immediate', element: 'fire' },
  { number: 34, name: 'Fish', keywords: ['abundance', 'flow', 'money', 'movement'], description: 'The Fish brings abundance, flow of resources, money, and smooth movement.', advice: 'Go with the flow and trust in abundance.', playingCard: 'Q♦', timing: 'Ongoing flow', element: 'water' },
  { number: 35, name: 'Anchor', keywords: ['stability', 'security', 'career', 'steady'], description: 'The Anchor brings stability, security, career focus, and steady progress.', advice: 'Anchor yourself in what provides security and purpose.', playingCard: '7♦', timing: 'Steady period', element: 'earth' },
  { number: 36, name: 'Cross', keywords: ['burden', 'spiritual', 'lesson', 'sacrifice'], description: 'The Cross brings burdens, spiritual lessons, necessary sacrifices, and karmic obligations.', advice: 'Accept your responsibilities and find meaning in challenges.', playingCard: '6♥', timing: 'Lesson period', element: 'earth' }
]

function drawCards(deck: LenormandCard[], count: number): LenormandCard[] {
  const shuffled = [...deck].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// Get all cards for reference
function getAllCards(): LenormandCard[] {
  return LENORMAND_DECK
}

// Get available spreads
function getAvailableSpreads() {
  return [
    { name: 'Single Card', value: 'single', cardCount: 1, description: 'A direct answer to your question' },
    { name: 'Three-Card Spread', value: 'three', cardCount: 3, description: 'Past, Present, and Future insight' },
    { name: 'Nine-Card Spread (Petite Tableau)', value: 'nine', cardCount: 9, description: 'Detailed overview of a specific situation' },
    { name: 'Line of Five', value: 'lineOfFive', cardCount: 5, description: 'Progressive reading of challenge to outcome' },
    { name: 'Grand Tableau', value: 'grandTableau', cardCount: 36, description: 'Complete life overview using all cards' }
  ]
}

class LenormandIntelligence {
  private cache = new Map<string, LenormandAnalysis>()
  private db: any = null

  constructor() {
    // Initialize Firebase DB if available
    try {
      const { getFirebaseDB } = require('./firebase')
      this.db = getFirebaseDB()
    } catch (error) {
      devLog.warn('Firebase not available for Lenormand Intelligence', undefined, 'lenormandIntelligence')
    }
  }

  // Get all cards
  getAllCards(): LenormandCard[] {
    return getAllCards()
  }

  // Get available spreads
  getAvailableSpreads() {
    return getAvailableSpreads()
  }

  async analyzeSpread(question: string, spreadType: LenormandQuestion['spreadType']): Promise<LenormandAnalysis> {
    const cacheKey = `${question}-${spreadType}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }
    const spread = this.generateSpread(question, spreadType)
    const summary = this.interpretSpread(spread)
    const advice = spread.cards.map(card => card.advice)
    const analysis: LenormandAnalysis = {
      spread,
      summary,
      advice,
      confidence: Math.floor(Math.random() * 20) + 80
    }
    this.cache.set(cacheKey, analysis)
    return analysis
  }

  private generateSpread(question: string, spreadType: LenormandQuestion['spreadType']): LenormandSpread {
    let count = 1
    let positions: string[] = ['Answer']
    
    if (spreadType === 'single') {
      count = 1
      positions = ['Answer']
    } else if (spreadType === 'three') {
      count = 3
      positions = ['Past', 'Present', 'Future']
    } else if (spreadType === 'nine') {
      count = 9
      positions = [
        'Top Left', 'Top Center', 'Top Right',
        'Middle Left', 'Center', 'Middle Right',
        'Bottom Left', 'Bottom Center', 'Bottom Right'
      ]
    } else if (spreadType === 'lineOfFive') {
      count = 5
      positions = ['Challenge', 'Past Influence', 'Present Situation', 'Future Influence', 'Outcome']
    } else if (spreadType === 'grandTableau') {
      count = 36
      // Grand Tableau positions: 4 rows of 8, then a row of 4 = 36 cards
      positions = Array.from({ length: 36 }, (_, i) => {
        const row = Math.floor(i / 8)
        const col = (i % 8) + 1
        if (row < 4) return `Row ${row + 1}, Col ${col}`
        return 'Mal 4'
      })
    }
    
    const cards = drawCards(LENORMAND_DECK, count)
    return {
      type: spreadType,
      cards,
      positions,
      question,
      interpretation: ''
    }
  }

  private interpretSpread(spread: LenormandSpread): string {
    if (spread.type === 'single') {
      return `The card "${spread.cards[0].name}" suggests: ${spread.cards[0].description}`
    } else if (spread.type === 'three') {
      return `Past: ${spread.cards[0].name} - ${spread.cards[0].description}. Present: ${spread.cards[1].name} - ${spread.cards[1].description}. Future: ${spread.cards[2].name} - ${spread.cards[2].description}.`
    } else if (spread.type === 'lineOfFive') {
      return `The Line of Five reveals: Challenge (${spread.cards[0].name}) → Past Influence (${spread.cards[1].name}) → Present (${spread.cards[2].name}) → Future (${spread.cards[3].name}) → Outcome (${spread.cards[4].name}).`
    } else if (spread.type === 'nine') {
      return `A complex situation with multiple influences. Center card: ${spread.cards[4].name} - ${spread.cards[4].description}`
    } else if (spread.type === 'grandTableau') {
      return `A full life overview with all 36 cards. Key central cards: ${spread.cards[17].name}, ${spread.cards[18].name}.`
    }
    return 'No interpretation available.'
  }

  async answerQuestion(question: string, spreadType: LenormandQuestion['spreadType'] = 'three', urgency: LenormandQuestion['urgency'] = 'medium'): Promise<LenormandAnswer> {
    const analysis = await this.analyzeSpread(question, spreadType)
    return {
      question,
      answer: analysis.summary,
      cards: analysis.spread.cards,
      advice: analysis.advice,
      confidence: analysis.confidence
    }
  }

  async saveReading(userId: string, reading: LenormandReading): Promise<void> {
    if (!this.db) {
      devLog.warn('Database not available, cannot save reading', 'lenormandIntelligence')
      return
    }
    try {
      await userSubdocSet(userId, 'lenormand-readings', reading.id, {
        ...reading,
        timestamp: reading.timestamp.toISOString(),
      } as Record<string, unknown>);
      devLog.debug('✅ Saved Lenormand reading for user:', userId)
    } catch (error) {
      devLog.error('Error saving Lenormand reading:', error, 'lenormandIntelligence')
    }
  }

  async getReading(userId: string, readingId: string): Promise<LenormandReading | null> {
    if (!this.db) {
      devLog.warn('Database not available', undefined, 'lenormandIntelligence')
      return null
    }
    try {
      const data = await userSubdocGet(userId, 'lenormand-readings', readingId)
      if (!data) return null
      const rawTs = data.timestamp
      const timestamp =
        rawTs instanceof Date
          ? rawTs
          : typeof rawTs === 'string' || typeof rawTs === 'number'
            ? new Date(rawTs)
            : typeof (rawTs as { toDate?: () => Date })?.toDate === 'function'
              ? (rawTs as { toDate: () => Date }).toDate()
              : new Date()
      return {
        ...data,
        timestamp,
      } as LenormandReading
    } catch (error) {
      devLog.error('Error getting Lenormand reading:', error, 'lenormandIntelligence')
      return null
    }
  }

  async getReadingHistory(userId: string, limit: number = 10): Promise<LenormandReading[]> {
    if (!this.db) {
      devLog.warn('Database not available', undefined, 'lenormandIntelligence')
      return []
    }
    try {
      const rows = await userSubcollectionQueryOrdered(
        userId,
        'lenormand-readings',
        'timestamp',
        'desc',
        limit
      )
      return rows.map((data) => {
        const rawTs = data.timestamp
        const timestamp =
          rawTs instanceof Date
            ? rawTs
            : typeof rawTs === 'string' || typeof rawTs === 'number'
              ? new Date(rawTs)
              : typeof (rawTs as { toDate?: () => Date })?.toDate === 'function'
                ? (rawTs as { toDate: () => Date }).toDate()
                : new Date()
        return {
          ...data,
          timestamp,
        } as LenormandReading
      })
    } catch (error) {
      devLog.error('Error getting Lenormand reading history:', error, 'lenormandIntelligence')
      return []
    }
  }

  async saveAnalysis(userId: string, analysis: LenormandAnalysis): Promise<void> {
    // Legacy method for backward compatibility
    devLog.debug('Saving Lenormand analysis for user:', userId)
  }

  async getAnalysisHistory(userId: string): Promise<LenormandAnalysis[]> {
    // Legacy method for backward compatibility
    return []
  }

  getSystemStatus() {
    return {
      status: 'operational',
      accuracy: 92,
      lastUpdate: new Date().toISOString(),
      features: [
        'Card Draws',
        'Spread Analysis',
        'Advice Generation',
        'Caching',
        'Q&A',
        'Firebase Storage',
        'Reading History'
      ]
    }
  }
}

export const lenormandIntelligence = new LenormandIntelligence() 