import { doc, setDoc, getDoc, collection } from 'firebase/firestore'
import { getFirebaseDB } from './firebase';
import { db } from '@/lib/firebase'

export interface TarotCard {
  name: string
  arcana: 'major' | 'minor'
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles'
  number?: number
  upright: string
  reversed: string
  element?: 'fire' | 'water' | 'air' | 'earth'
  numerology?: number
  image: string
}

export interface TarotReading {
  id: string
  timestamp: Date
  question: string
  spreadType: string
  spreadName: string
  positions: string[]
  cards: (TarotCard & { isUpright: boolean; position: string })[]
  overallReading: string
  elementalBalance: {
    fire: number
    water: number
    air: number
    earth: number
    primary: string
    secondary: string
    conflict: string
    harmony: string
  }
  energyScore: number // 1-100
  confidenceLevel: number // 1-100
  timing: {
    currentPhase: string
    favorablePeriods: string[]
    challenges: string[]
    opportunities: string[]
  }
  recommendations: string[]
  coaching: {
    strengths: string[]
    challenges: string[]
    growthAreas: string[]
    affirmations: string[]
  }
}

export interface TarotCoaching {
  id: string
  timestamp: Date
  question: string
  response: string
  insights: string[]
  recommendations: string[]
  followUpQuestions: string[]
}

// --- Tarot Intelligence System ---
class TarotIntelligence {
  // Tarot card data (abbreviated for brevity, but full deck in real use)
  private tarotDeck: TarotCard[] = [
    // Major Arcana
    { name: 'The Fool', arcana: 'major', upright: 'New beginnings, innocence, adventure', reversed: 'Recklessness, naivety, risk', element: 'air', numerology: 0, image: 'major_00_the_fool.png' },
    { name: 'The Magician', arcana: 'major', upright: 'Manifestation, resourcefulness, power', reversed: 'Manipulation, poor planning, untapped talents', element: 'air', numerology: 1, image: 'major_01_the_magician.png' },
    { name: 'The High Priestess', arcana: 'major', upright: 'Intuition, unconscious, mystery', reversed: 'Secrets, disconnected, withdrawal', element: 'water', numerology: 2, image: 'major_02_the_high_priestess.png' },
    // ... (add all 22 Major Arcana)
    // Minor Arcana (Wands, Cups, Swords, Pentacles)
    { name: 'Ace of Wands', arcana: 'minor', suit: 'wands', number: 1, upright: 'Creation, willpower, inspiration', reversed: 'Lack of energy, lack of passion', element: 'fire', numerology: 1, image: 'wands_01.png' },
    { name: 'Two of Wands', arcana: 'minor', suit: 'wands', number: 2, upright: 'Planning, making decisions, leaving comfort zone', reversed: 'Fear of unknown, playing safe, bad planning', element: 'fire', numerology: 2, image: 'wands_02.png' },
    // ... (add all 56 Minor Arcana)
  ]

  private spreads = [
    { key: 'single', name: 'Single Card', description: 'A single card for quick guidance.', positions: ['Message'] },
    { key: 'three', name: 'Three-Card Spread', description: 'Past, Present, and Future insight.', positions: ['Past', 'Present', 'Future'] },
    { key: 'celtic', name: 'Celtic Cross', description: 'Classic 10-card spread for deep insight.', positions: ['Present', 'Challenge', 'Past', 'Future', 'Above', 'Below', 'Advice', 'External', 'Hopes/Fears', 'Outcome'] },
    { key: 'five', name: 'Five-Card Spread', description: 'Situation, Challenge, Advice, Outcome, Clarifier.', positions: ['Situation', 'Challenge', 'Advice', 'Outcome', 'Clarifier'] },
    { key: 'relationship', name: 'Relationship Spread', description: 'You, Partner, Relationship, Challenge, Outcome.', positions: ['You', 'Partner', 'Relationship', 'Challenge', 'Outcome'] },
  ]

  private lifePhases = [
    'New Beginnings',
    'Growth & Expansion',
    'Challenge & Change',
    'Integration & Wisdom',
    'Completion & Renewal'
  ]

  private favorablePeriods = [
    'Spring for new ventures',
    'Summer for growth',
    'Autumn for reflection',
    'Winter for planning',
    'Full moon for manifestation',
    'New moon for intentions'
  ]

  private challenges = [
    'Balancing intuition and logic',
    'Embracing change',
    'Letting go of the past',
    'Trusting the journey',
    'Maintaining focus on goals'
  ]

  private opportunities = [
    'Personal growth',
    'New relationships',
    'Career advancement',
    'Spiritual awakening',
    'Creative inspiration'
  ]

  // --- Core Analysis ---
  async drawCards(question: string, spreadType: string): Promise<TarotReading> {
    const spread = this.spreads.find(s => s.key === spreadType) || this.spreads[0]
    const deck = this.shuffleDeck([...this.tarotDeck])
    const cards = spread.positions.map((pos, i) => {
      const card = deck.pop()!
      return {
        ...card,
        isUpright: Math.random() > 0.5,
        position: pos
      }
    })

    // Elemental balance
    const elementalBalance = this.calculateElementalBalance(cards)
    // Energy score
    const totalEnergy = cards.reduce((sum, c) => sum + (c.numerology || 1), 0)
    const energyScore = Math.round((totalEnergy / (cards.length * 10)) * 100)
    // Timing
    const timing = {
      currentPhase: this.lifePhases[Math.floor(Math.random() * this.lifePhases.length)],
      favorablePeriods: this.favorablePeriods.sort(() => 0.5 - Math.random()).slice(0, 3),
      challenges: this.challenges.sort(() => 0.5 - Math.random()).slice(0, 2),
      opportunities: this.opportunities.sort(() => 0.5 - Math.random()).slice(0, 2)
    }
    // Overall reading
    const overallReading = this.generateOverallReading(cards, question, spread)
    // Recommendations
    const recommendations = this.generateRecommendations(cards, elementalBalance, timing)
    // Coaching
    const coaching = this.generateCoaching(cards, elementalBalance, timing)

    const reading: TarotReading = {
      id: Date.now().toString(),
      timestamp: new Date(),
      question,
      spreadType,
      spreadName: spread.name,
      positions: spread.positions,
      cards,
      overallReading,
      elementalBalance,
      energyScore,
      confidenceLevel: 94,
      timing,
      recommendations,
      coaching
    }
    return reading
  }

  private shuffleDeck(deck: TarotCard[]): TarotCard[] {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[deck[i], deck[j]] = [deck[j], deck[i]]
    }
    return deck
  }

  private calculateElementalBalance(cards: (TarotCard & { isUpright: boolean })[]): TarotReading['elementalBalance'] {
    const elementCounts = { fire: 0, water: 0, air: 0, earth: 0 }
    cards.forEach(card => {
      if (card.element) elementCounts[card.element]++
    })
    const sorted = Object.entries(elementCounts).sort(([, a], [, b]) => b - a)
    return {
      ...elementCounts,
      primary: sorted[0][0],
      secondary: sorted[1][0],
      conflict: sorted[2][0],
      harmony: sorted[3][0]
    }
  }

  private generateOverallReading(cards: (TarotCard & { isUpright: boolean; position: string })[], question: string, spread: any): string {
    const mainCard = cards.find(c => c.position === 'Present' || c.position === 'Message') || cards[0]
    const adviceCard = cards.find(c => c.position === 'Advice')
    const outcomeCard = cards.find(c => c.position === 'Outcome' || c.position === 'Future')
    return `For your question: "${question}", the ${spread.name} reveals ${mainCard.name} (${mainCard.isUpright ? 'upright' : 'reversed'}) in the ${mainCard.position} position, indicating: ${mainCard.isUpright ? mainCard.upright : mainCard.reversed}. ${adviceCard ? `Advice: ${adviceCard.name} - ${adviceCard.isUpright ? adviceCard.upright : adviceCard.reversed}.` : ''} ${outcomeCard ? `Outcome: ${outcomeCard.name} - ${outcomeCard.isUpright ? outcomeCard.upright : outcomeCard.reversed}.` : ''} The elemental balance is ${this.getElementalDescription(cards)}. Trust the guidance of the Tarot.`
  }

  private getElementalDescription(cards: (TarotCard & { isUpright: boolean })[]): string {
    const elements = cards.map(c => c.element).filter(Boolean)
    const counts = { fire: 0, water: 0, air: 0, earth: 0 }
    elements.forEach(e => { if (e) counts[e]++ })
    const max = Math.max(...Object.values(counts))
    const dominant = Object.keys(counts).find(k => counts[k as keyof typeof counts] === max)
    switch (dominant) {
      case 'fire': return 'passion and action'
      case 'water': return 'intuition and emotion'
      case 'air': return 'intellect and communication'
      case 'earth': return 'stability and grounding'
      default: return 'balance and harmony'
    }
  }

  private generateRecommendations(cards: (TarotCard & { isUpright: boolean })[], elementalBalance: TarotReading['elementalBalance'], timing: TarotReading['timing']): string[] {
    const recs = [
      'Reflect on the main card in your spread',
      'Pay attention to the advice card for guidance',
      'Work with the dominant element in your reading',
      'Journal about the timing and phases indicated',
      'Use the Tarot as a daily meditation tool',
      'Trust your intuition when interpreting the cards',
      'Apply the Tarot wisdom to your current situation',
      'Balance the elements in your life for harmony'
    ]
    return recs.sort(() => 0.5 - Math.random()).slice(0, 4)
  }

  private generateCoaching(cards: (TarotCard & { isUpright: boolean })[], elementalBalance: TarotReading['elementalBalance'], timing: TarotReading['timing']): TarotReading['coaching'] {
    const strengths = [
      `Dominant ${elementalBalance.primary} energy for ${this.getElementalDescription(cards)}`,
      `Key card: ${cards[0].name} (${cards[0].isUpright ? 'upright' : 'reversed'})`,
      `Spread type: ${cards.length} cards`,
      `Receptive to Tarot guidance`
    ]
    const challenges = [
      'Balancing intuition and logic',
      'Embracing change',
      'Letting go of the past',
      'Trusting the journey',
      'Maintaining focus on goals'
    ]
    const growthAreas = [
      'Deepening your understanding of Tarot symbolism',
      'Developing your intuitive connection to the cards',
      'Applying Tarot wisdom to daily challenges',
      'Building a personal relationship with the Tarot'
    ]
    const affirmations = [
      'I trust the wisdom of the Tarot',
      'I embrace the guidance of the cards',
      'I balance intuition and logic',
      'I am open to new beginnings',
      'I grow through the lessons of the Tarot'
    ]
    return { strengths, challenges, growthAreas, affirmations }
  }

  async getCoaching(question: string, reading: TarotReading): Promise<TarotCoaching | null> {
    const insights = [
      `Your dominant element is ${reading.elementalBalance.primary}, suggesting ${this.getElementalDescription(reading.cards)} is key to your situation.`,
      `The main card is ${reading.cards[0].name} (${reading.cards[0].isUpright ? 'upright' : 'reversed'}).`,
      `Your spread type is ${reading.spreadName}.`,
      `The Tarot reveals: ${reading.overallReading}`
    ]
    const recommendations = [
      'Reflect on the main card and its message',
      'Work with the dominant element for guidance',
      'Journal about the timing and phases',
      'Use the Tarot as a meditation tool'
    ]
    const followUpQuestions = [
      'How do you see the Tarot guidance manifesting in your life?',
      'What timing considerations from your reading are most relevant now?',
      'How can you develop the qualities indicated by the main card?',
      'What elemental balance do you need to focus on currently?',
      'How does the Tarot influence your decisions?'
    ]
    return {
      id: Date.now().toString(),
      timestamp: new Date(),
      question,
      response: `For your question: "${question}", the Tarot reveals: ${reading.overallReading} Focus on the main card and the dominant element for guidance.`,
      insights,
      recommendations,
      followUpQuestions
    }
  }

  async saveReading(userId: string, reading: TarotReading): Promise<void> {
    const docRef = doc(db, 'users', userId, 'tarot-readings', reading.id)
    await setDoc(docRef, reading)
  }

  async getReading(userId: string, readingId: string): Promise<TarotReading | null> {
    const docRef = doc(db, 'users', userId, 'tarot-readings', readingId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return docSnap.data() as TarotReading
    }
    return null
  }

  async saveCoaching(userId: string, coaching: TarotCoaching): Promise<void> {
    const docRef = doc(db, 'users', userId, 'tarot-coaching', coaching.id)
    await setDoc(docRef, coaching)
  }

  getSystemStatus() {
    return {
      totalCards: this.tarotDeck.length,
      totalSpreads: this.spreads.length,
      lifePhases: this.lifePhases.length,
      favorablePeriods: this.favorablePeriods.length,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    }
  }
}

export const tarotIntelligence = new TarotIntelligence() 