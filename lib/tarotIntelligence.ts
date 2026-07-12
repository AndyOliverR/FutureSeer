import { devLog } from '@/lib/devLogger';
import { userSubdocGet, userSubdocSet } from '@/lib/userSubcollectionFirestore';
import { LOCAL_TAROT_CARDS } from './tarotApiService'

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
  cards: (TarotCard & { isUpright: boolean; position: string; signalGravity?: 'fleeting' | 'moderate' | 'major' })[]
  overallReading: string
  detailedInterpretation: string
  individualCardReadings: Array<{
    cardName: string
    position: string
    isUpright: boolean
    meaning: string
    interpretation: string
  }>
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
  energyScore: number
  confidenceLevel: number
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

// Map LOCAL_TAROT_CARDS to TarotCard format
const mapMajorArcana = (): TarotCard[] => {
  return LOCAL_TAROT_CARDS.map(card => ({
    name: card.name,
    arcana: 'major' as const,
    upright: card.meaning,
    reversed: card.reversed_meaning,
    element: card.element?.toLowerCase() as 'fire' | 'water' | 'air' | 'earth' | undefined,
    numerology: card.number || 0,
    image: card.image, // card.image already has full path like '/tarot/major_XX.png.png'
    number: card.number
  }))
}

// Minor Arcana cards - Wands (Fire)
const wandsCards: TarotCard[] = [
  { name: 'Ace of Wands', arcana: 'minor', suit: 'wands', number: 1, upright: 'Creation, willpower, inspiration, new beginnings', reversed: 'Lack of energy, lack of passion, delays, creative blocks', element: 'fire', numerology: 1, image: '/tarot/wands_01.png.png' },
  { name: 'Two of Wands', arcana: 'minor', suit: 'wands', number: 2, upright: 'Planning, making decisions, leaving comfort zone', reversed: 'Fear of unknown, playing safe, bad planning', element: 'fire', numerology: 2, image: '/tarot/wands_02.png.png' },
  { name: 'Three of Wands', arcana: 'minor', suit: 'wands', number: 3, upright: 'Looking ahead, expansion, rapid growth', reversed: 'Obstacles, delays, lack of progress', element: 'fire', numerology: 3, image: '/tarot/wands_03.png.png' },
  { name: 'Four of Wands', arcana: 'minor', suit: 'wands', number: 4, upright: 'Celebration, harmony, home, community', reversed: 'Lack of support, transience, home conflicts', element: 'fire', numerology: 4, image: '/tarot/wands_04.png.png' },
  { name: 'Five of Wands', arcana: 'minor', suit: 'wands', number: 5, upright: 'Competition, conflict, tension, disagreement', reversed: 'Avoiding conflict, tension release, collaboration', element: 'fire', numerology: 5, image: '/tarot/wands_05.png.png' },
  { name: 'Six of Wands', arcana: 'minor', suit: 'wands', number: 6, upright: 'Victory, success, public recognition, progress', reversed: 'Lack of recognition, failure, private success', element: 'fire', numerology: 6, image: '/tarot/wands_06.png.png' },
  { name: 'Seven of Wands', arcana: 'minor', suit: 'wands', number: 7, upright: 'Challenge, competition, perseverance, defending position', reversed: 'Give up, overwhelmed, defensive, yielding', element: 'fire', numerology: 7, image: '/tarot/wands_07.png.png' },
  { name: 'Eight of Wands', arcana: 'minor', suit: 'wands', number: 8, upright: 'Rapid action, movement, quick decisions, speed', reversed: 'Delays, frustration, lack of direction, waiting', element: 'fire', numerology: 8, image: '/tarot/wands_08.png.png' },
  { name: 'Nine of Wands', arcana: 'minor', suit: 'wands', number: 9, upright: 'Resilience, courage, persistence, test of faith', reversed: 'Stubbornness, inflexibility, defensiveness, giving up', element: 'fire', numerology: 9, image: '/tarot/wands_09.png.png' },
  { name: 'Ten of Wands', arcana: 'minor', suit: 'wands', number: 10, upright: 'Burden, responsibility, hard work, achievement', reversed: 'Inability to delegate, overstressed, burnt out', element: 'fire', numerology: 10, image: '/tarot/wands_10.png.png' },
  { name: 'Page of Wands', arcana: 'minor', suit: 'wands', upright: 'Exploration, excitement, free spirit, optimism', reversed: 'Lack of direction, procrastination, creating conflict', element: 'fire', numerology: 11, image: '/tarot/wands_page.png.png' },
  { name: 'Knight of Wands', arcana: 'minor', suit: 'wands', upright: 'Action, adventure, fearlessness, energy', reversed: 'Anger, impulsiveness, lack of direction, no restraint', element: 'fire', numerology: 12, image: '/tarot/wands_knight.png.png' },
  { name: 'Queen of Wands', arcana: 'minor', suit: 'wands', upright: 'Courage, determination, joy, independence', reversed: 'Selfishness, jealousy, insecurity, lack of confidence', element: 'fire', numerology: 13, image: '/tarot/wands_queen.png.png' },
  { name: 'King of Wands', arcana: 'minor', suit: 'wands', upright: 'Natural leader, vision, entrepreneurship, honor', reversed: 'Impulsiveness, haste, ruthless, unapproachable', element: 'fire', numerology: 14, image: '/tarot/wands_king.png.png' },
]

// Minor Arcana cards - Cups (Water)
const cupsCards: TarotCard[] = [
  { name: 'Ace of Cups', arcana: 'minor', suit: 'cups', number: 1, upright: 'New feelings, spirituality, intuition, love', reversed: 'Emotional loss, blocked creativity, emptiness, depression', element: 'water', numerology: 1, image: '/tarot/cups_01.png.png' },
  { name: 'Two of Cups', arcana: 'minor', suit: 'cups', number: 2, upright: 'Unified love, partnership, mutual attraction', reversed: 'Breakup, imbalance, broken communication, tension', element: 'water', numerology: 2, image: '/tarot/cups_02.png.png' },
  { name: 'Three of Cups', arcana: 'minor', suit: 'cups', number: 3, upright: 'Friendship, community, happiness, celebrations', reversed: 'Overindulgence, gossip, isolation, third party problems', element: 'water', numerology: 3, image: '/tarot/cups_03.png.png' },
  { name: 'Four of Cups', arcana: 'minor', suit: 'cups', number: 4, upright: 'Meditation, contemplation, apathy, reevaluation', reversed: 'Clarity, awareness, acceptance, moving forward', element: 'water', numerology: 4, image: '/tarot/cups_04.png.png' },
  { name: 'Five of Cups', arcana: 'minor', suit: 'cups', number: 5, upright: 'Loss, grief, self-pity, discontent', reversed: 'Acceptance, moving on, finding peace, forgiveness', element: 'water', numerology: 5, image: '/tarot/cups_05.png.png' },
  { name: 'Six of Cups', arcana: 'minor', suit: 'cups', number: 6, upright: 'Revisiting the past, childhood memories, innocence', reversed: 'Living in the past, forgiveness, moving forward', element: 'water', numerology: 6, image: '/tarot/cups_06.png.png' },
  { name: 'Seven of Cups', arcana: 'minor', suit: 'cups', number: 7, upright: 'Searching for purpose, choices, daydreaming, illusion', reversed: 'Lack of purpose, diversion, confusion, clarity', element: 'water', numerology: 7, image: '/tarot/cups_07.png.png' },
  { name: 'Eight of Cups', arcana: 'minor', suit: 'cups', number: 8, upright: 'Walking away, disillusionment, leaving behind', reversed: 'Avoidance, fear of change, fear of loss, stagnation', element: 'water', numerology: 8, image: '/tarot/cups_08.png.png' },
  { name: 'Nine of Cups', arcana: 'minor', suit: 'cups', number: 9, upright: 'Contentment, satisfaction, gratitude, wish fulfillment', reversed: 'Lack of inner joy, smugness, dissatisfaction', element: 'water', numerology: 9, image: '/tarot/cups_09.png.png' },
  { name: 'Ten of Cups', arcana: 'minor', suit: 'cups', number: 10, upright: 'Divine love, blissful relationships, harmony, alignment', reversed: 'Disconnection, misaligned values, broken home', element: 'water', numerology: 10, image: '/tarot/cups_10.png.png' },
  { name: 'Page of Cups', arcana: 'minor', suit: 'cups', upright: 'Creative opportunities, intuitive messages, curiosity, possibility', reversed: 'Emotional immaturity, insecurity, disappointment, creative blocks', element: 'water', numerology: 11, image: '/tarot/cups_page.png.png' },
  { name: 'Knight of Cups', arcana: 'minor', suit: 'cups', upright: 'Following the heart, idealist, romantic, charming', reversed: 'Moodiness, disappointment, jealousy, unrealistic expectations', element: 'water', numerology: 12, image: '/tarot/cups_knight.png.png' },
  { name: 'Queen of Cups', arcana: 'minor', suit: 'cups', upright: 'Compassion, calm, comfort, emotional security', reversed: 'Inner feelings, self-care, self-love, co-dependency', element: 'water', numerology: 13, image: '/tarot/cups_queen.png.png' },
  { name: 'King of Cups', arcana: 'minor', suit: 'cups', upright: 'Emotional balance, compassion, diplomacy, control', reversed: 'Emotional manipulation, moodiness, emotional abuse, coldness', element: 'water', numerology: 14, image: '/tarot/cups_king.png.png' },
]

// Minor Arcana cards - Swords (Air)
const swordsCards: TarotCard[] = [
  { name: 'Ace of Swords', arcana: 'minor', suit: 'swords', number: 1, upright: 'Breakthrough, new ideas, mental clarity, success', reversed: 'Confusion, clouded judgment, lack of clarity', element: 'air', numerology: 1, image: '/tarot/swords_01.png.png' },
  { name: 'Two of Swords', arcana: 'minor', suit: 'swords', number: 2, upright: 'Difficult choices, indecision, stalemate', reversed: 'Lesser of two evils, no right choice, confusion', element: 'air', numerology: 2, image: '/tarot/swords_02.png.png' },
  { name: 'Three of Swords', arcana: 'minor', suit: 'swords', number: 3, upright: 'Heartbreak, emotional pain, sorrow, grief', reversed: 'Recovery, healing, forgiveness, moving on', element: 'air', numerology: 3, image: '/tarot/swords_03.png.png' },
  { name: 'Four of Swords', arcana: 'minor', suit: 'swords', number: 4, upright: 'Rest, restoration, contemplation, recuperation', reversed: 'Restlessness, burnout, lack of progress, stagnation', element: 'air', numerology: 4, image: '/tarot/swords_04.png.png' },
  { name: 'Five of Swords', arcana: 'minor', suit: 'swords', number: 5, upright: 'Unbridled ambition, win at all costs, sneakiness', reversed: 'Reconciliation, making amends, past resentment', element: 'air', numerology: 5, image: '/tarot/swords_05.png.png' },
  { name: 'Six of Swords', arcana: 'minor', suit: 'swords', number: 6, upright: 'Transition, leaving behind, moving on', reversed: 'Emotional baggage, unresolved issues, resisting transition', element: 'air', numerology: 6, image: '/tarot/swords_06.png.png' },
  { name: 'Seven of Swords', arcana: 'minor', suit: 'swords', number: 7, upright: 'Deception, trickery, tactics and strategy, lies', reversed: 'Coming clean, rethinking approach, deception', element: 'air', numerology: 7, image: '/tarot/swords_07.png.png' },
  { name: 'Eight of Swords', arcana: 'minor', suit: 'swords', number: 8, upright: 'Self-imposed restriction, imprisonment, victim mentality', reversed: 'Self-acceptance, new perspective, freedom', element: 'air', numerology: 8, image: '/tarot/swords_08.png.png' },
  { name: 'Nine of Swords', arcana: 'minor', suit: 'swords', number: 9, upright: 'Anxiety, worry, fear, depression, nightmares', reversed: 'Hope, reaching out, despair, mental torture', element: 'air', numerology: 9, image: '/tarot/swords_09.png.png' },
  { name: 'Ten of Swords', arcana: 'minor', suit: 'swords', number: 10, upright: 'Back-stabbed, defeat, crisis, betrayal, endings', reversed: 'Recovery, regeneration, resisting an inevitable end', element: 'air', numerology: 10, image: '/tarot/swords_10.png.png' },
  { name: 'Page of Swords', arcana: 'minor', suit: 'swords', upright: 'New ideas, curiosity, thirst for knowledge, new ways of communicating', reversed: 'Self-doubt, new information, indecisiveness', element: 'air', numerology: 11, image: '/tarot/swords_page.png.png' },
  { name: 'Knight of Swords', arcana: 'minor', suit: 'swords', upright: 'Action, impulsiveness, defending beliefs, breakneck speed', reversed: 'No direction, disregard for consequences, unpredictability', element: 'air', numerology: 12, image: '/tarot/swords_knight.png.png' },
  { name: 'Queen of Swords', arcana: 'minor', suit: 'swords', upright: 'Clear boundaries, direct communication, independence, honesty', reversed: 'Overly-emotional, easily influenced, bitchiness, cold-hearted', element: 'air', numerology: 13, image: '/tarot/swords_queen.png.png' },
  { name: 'King of Swords', arcana: 'minor', suit: 'swords', upright: 'Clear thinking, intellectual power, authority, truth', reversed: 'Manipulative, cruel, weakness, brutality', element: 'air', numerology: 14, image: '/tarot/swords_king.png.png' },
]

// Minor Arcana cards - Pentacles (Earth)
const pentaclesCards: TarotCard[] = [
  { name: 'Ace of Pentacles', arcana: 'minor', suit: 'pentacles', number: 1, upright: 'New opportunity, resources, manifestation, abundance', reversed: 'Lost opportunity, lack of planning, bad investment', element: 'earth', numerology: 1, image: '/tarot/pentacles_01.png.png' },
  { name: 'Two of Pentacles', arcana: 'minor', suit: 'pentacles', number: 2, upright: 'Balance, adaptability, time management, prioritization', reversed: 'Imbalance, unorganized, overwhelmed, messiness', element: 'earth', numerology: 2, image: '/tarot/pentacles_02.png.png' },
  { name: 'Three of Pentacles', arcana: 'minor', suit: 'pentacles', number: 3, upright: 'Teamwork, collaboration, learning, implementation', reversed: 'Disharmony, misalignment, working alone, bad teamwork', element: 'earth', numerology: 3, image: '/tarot/pentacles_03.png.png' },
  { name: 'Four of Pentacles', arcana: 'minor', suit: 'pentacles', number: 4, upright: 'Security, control, conservation, frugality', reversed: 'Greediness, stinginess, self-protection, financial insecurity', element: 'earth', numerology: 4, image: '/tarot/pentacles_04.png.png' },
  { name: 'Five of Pentacles', arcana: 'minor', suit: 'pentacles', number: 5, upright: 'Need, poverty, insecurity, isolation, worry', reversed: 'Recovery, charity, moving on, spiritual poverty', element: 'earth', numerology: 5, image: '/tarot/pentacles_05.png.png' },
  { name: 'Six of Pentacles', arcana: 'minor', suit: 'pentacles', number: 6, upright: 'Giving, receiving, sharing wealth, generosity', reversed: 'Selfishness, strings attached, tainted generosity, power and domination', element: 'earth', numerology: 6, image: '/tarot/pentacles_06.png.png' },
  { name: 'Seven of Pentacles', arcana: 'minor', suit: 'pentacles', number: 7, upright: 'Hard work, perseverance, diligence, long-term goals', reversed: 'Lack of growth, shortcuts, no effort, procrastination', element: 'earth', numerology: 7, image: '/tarot/pentacles_07.png.png' },
  { name: 'Eight of Pentacles', arcana: 'minor', suit: 'pentacles', number: 8, upright: 'Skill development, quality, mastery, commitment', reversed: 'Lack of quality, no motivation, laziness, tardiness', element: 'earth', numerology: 8, image: '/tarot/pentacles_08.png.png' },
  { name: 'Nine of Pentacles', arcana: 'minor', suit: 'pentacles', number: 9, upright: 'Self-sufficiency, financial independence, rewards, luxury', reversed: 'Self-worth, over-investment in work, reckless spending', element: 'earth', numerology: 9, image: '/tarot/pentacles_09.png.png' },
  { name: 'Ten of Pentacles', arcana: 'minor', suit: 'pentacles', number: 10, upright: 'Wealth, financial security, family, long-term success, contribution', reversed: 'The dark side of wealth, financial failure, lack of stability', element: 'earth', numerology: 10, image: '/tarot/pentacles_10.png.png' },
  { name: 'Page of Pentacles', arcana: 'minor', suit: 'pentacles', upright: 'Ambitious, opportunity, new financial prospect, manifestation', reversed: 'Lack of progress, procrastination, learn from failure, lack of commitment', element: 'earth', numerology: 11, image: '/tarot/pentacles_page.png.png' },
  { name: 'Knight of Pentacles', arcana: 'minor', suit: 'pentacles', upright: 'Efficiency, routine, conservatism, perseverance', reversed: 'Laziness, no initiative, extreme caution, staleness', element: 'earth', numerology: 12, image: '/tarot/pentacles_knight.png.png' },
  { name: 'Queen of Pentacles', arcana: 'minor', suit: 'pentacles', upright: 'Practical, motherly, abundant, nurturing, security', reversed: 'Self-centeredness, jealousy, smothering, materialistic', element: 'earth', numerology: 13, image: '/tarot/pentacles_queen.png.png' },
  { name: 'King of Pentacles', arcana: 'minor', suit: 'pentacles', upright: 'Abundance, prosperity, security, career, discipline, generosity', reversed: 'Greed, indulgence, sensuality, reckless spending, conservative', element: 'earth', numerology: 14, image: '/tarot/pentacles_king.png.png' },
]

// --- Tarot Intelligence System ---
class TarotIntelligence {
  private tarotDeck: TarotCard[]

  constructor() {
    // Build complete 78-card deck
    this.tarotDeck = [
      ...mapMajorArcana(), // 22 Major Arcana
      ...wandsCards,       // 14 Wands
      ...cupsCards,        // 14 Cups
      ...swordsCards,      // 14 Swords
      ...pentaclesCards    // 14 Pentacles
    ]
  }

  private spreads = [
    { key: 'single', name: 'Single Card', description: 'A single card for quick guidance.', positions: ['Present'] },
    { key: 'three', name: 'Three Card', description: 'Past, Present, and Future insight.', positions: ['Past', 'Present', 'Future'] },
    { key: 'celtic', name: 'Celtic Cross', description: 'Classic 10-card spread for deep insight.', positions: ['Present', 'Challenge', 'Past', 'Future', 'Above', 'Below', 'Advice', 'External', 'Hopes', 'Outcome'] },
    { key: 'five', name: 'Five Card', description: 'Situation, Challenge, Advice, Outcome, Clarifier.', positions: ['Situation', 'Challenge', 'Advice', 'Outcome', 'Clarifier'] },
    { key: 'horseshoe', name: 'Horseshoe Spread', description: 'A seven-card spread shaped like a horseshoe for detailed guidance.', positions: ['Past', 'Present', 'Future', 'Advice', 'Obstacles', 'External', 'Outcome'] },
    { key: 'tree-of-life', name: 'Tree of Life', description: 'A mystical ten-card spread based on the Kabbalistic Tree of Life.', positions: ['Crown', 'Wisdom', 'Understanding', 'Mercy', 'Severity', 'Beauty', 'Victory', 'Glory', 'Foundation', 'Kingdom'] },
    { key: 'relationship', name: 'Relationship Spread', description: 'You, Partner, Relationship, Challenge, Outcome.', positions: ['You', 'Partner', 'Relationship', 'Challenge', 'Outcome'] },
    { key: 'year-ahead', name: 'Year Ahead Spread', description: 'A 13-card spread offering a forecast for each month plus overall theme.', positions: ['Overall Theme', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] },
    { key: 'life-purpose', name: 'Life Purpose Spread', description: 'Five cards to help with guidance on life path or career.', positions: ['Your Purpose', 'Your Gifts', 'Challenges', 'Path Forward', 'Outcome'] },
    { key: 'love-compatibility', name: 'Love & Compatibility Spread', description: 'Analyze love life and relationships.', positions: ['Your Feelings', 'Their Feelings', 'Relationship Dynamics', 'Challenges', 'Strengths', 'Future Potential'] },
    { key: 'elemental', name: 'Elemental Spread', description: 'Explore the balance of Fire, Water, Air, and Earth in your life.', positions: ['Fire Energy', 'Water Energy', 'Air Energy', 'Earth Energy', 'Overall Balance'] },
    {
      key: 'matrix-whisper',
      name: 'Matrix + Whisper Spread',
      description:
        'Foresight layout: a blind-spot Whisper card plus four isolated factors synthesized into one pattern. Each card includes signal gravity (fleeting, moderate, or major).',
      positions: ['Whisper (Blind Spot)', 'Inner Life', 'Environment', 'Habit', 'Coincidence', 'Synthesis (Pattern)'],
    },
  ]

  // Map spread name to key
  getSpreadKey(spreadName: string): string {
    const mapping: Record<string, string> = {
      'Single Card': 'single',
      'Three Card': 'three',
      'Past Present Future': 'three',
      'Celtic Cross': 'celtic',
      'Five Card': 'five',
      'Horseshoe Spread': 'horseshoe',
      'Tree of Life': 'tree-of-life',
      'Relationship Spread': 'relationship',
      'Year Ahead Spread': 'year-ahead',
      'Life Purpose Spread': 'life-purpose',
      'Love & Compatibility Spread': 'love-compatibility',
      'Elemental Spread': 'elemental',
      'Matrix + Whisper Spread': 'matrix-whisper',
    }
    return mapping[spreadName] || 'single'
  }

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
  async drawCards(question: string, spreadType: string, displayName?: string): Promise<TarotReading> {
    const spreadKey = this.getSpreadKey(spreadType)
    const spread = this.spreads.find(s => s.key === spreadKey) || this.spreads[0]
    const deck = this.shuffleDeck([...this.tarotDeck])
    
    // Draw cards for the spread
    const cards = spread.positions.map((pos, i) => {
      const card = deck.pop()!
      const isUpright = Math.random() > 0.3 // 70% chance of upright
      const base = {
        ...card,
        isUpright,
        position: pos,
      }
      if (spreadKey === 'matrix-whisper') {
        const roll = ((card.numerology ?? i + 1) % 6) + 1
        const signalGravity: 'fleeting' | 'moderate' | 'major' =
          roll <= 2 ? 'fleeting' : roll <= 4 ? 'moderate' : 'major'
        return { ...base, signalGravity }
      }
      return base
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
    
    // Generate detailed interpretations
    const individualCardReadings = this.generateIndividualCardReadings(cards, question)
    const overallReading = this.generateOverallReading(cards, question, spread)
    const detailedInterpretation = this.generateDetailedInterpretation(cards, question, spread, displayName)
    
    // Recommendations
    const recommendations = this.generateRecommendations(cards, elementalBalance, timing)
    // Coaching
    const coaching = this.generateCoaching(cards, elementalBalance, timing)

    const reading: TarotReading = {
      id: Date.now().toString(),
      timestamp: new Date(),
      question,
      spreadType: spreadKey,
      spreadName: spread.name,
      positions: spread.positions,
      cards,
      overallReading,
      detailedInterpretation,
      individualCardReadings,
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

  private gravityLabel(gravity: 'fleeting' | 'moderate' | 'major'): string {
    if (gravity === 'major') return 'Major shift — treat this theme as a macro pattern, not a passing mood.'
    if (gravity === 'moderate') return 'Moderate weight — real, but still shapeable with intentional action.'
    return 'Fleeting energy — notice it, but do not over-structure your life around it.'
  }

  private generateIndividualCardReadings(
    cards: (TarotCard & { isUpright: boolean; position: string; signalGravity?: 'fleeting' | 'moderate' | 'major' })[],
    question: string,
  ): Array<{ cardName: string; position: string; isUpright: boolean; meaning: string; interpretation: string }> {
    return cards.map((card) => {
      const meaning = card.isUpright ? card.upright : card.reversed
      const positionContext = this.getPositionContext(card.position)
      const gravityBit = card.signalGravity
        ? ` Signal gravity: ${card.signalGravity}. ${this.gravityLabel(card.signalGravity)}`
        : ''
      const interpretation = `${card.name} appears ${card.isUpright ? 'upright' : 'reversed'} in the ${card.position} position. ${positionContext} This suggests: ${meaning}.${gravityBit}`

      return {
        cardName: card.name,
        position: card.position,
        isUpright: card.isUpright,
        meaning,
        interpretation,
      }
    })
  }

  private getPositionContext(position: string): string {
    const contexts: Record<string, string> = {
      'Past': 'Reflecting on what has come before,',
      'Present': 'Regarding your current circumstances,',
      'Future': 'Looking ahead to what may come,',
      'Situation': 'In relation to your current situation,',
      'Challenge': 'Regarding the obstacles you face,',
      'Advice': 'The guidance being offered is:',
      'Outcome': 'Concerning the likely outcome,',
      'You': 'In relation to yourself,',
      'Partner': 'Regarding your partner or the other person,',
      'Relationship': 'In terms of the relationship itself,',
      'Whisper (Blind Spot)': 'As the quiet anomaly or blind spot,',
      'Inner Life': 'Regarding your inner world,',
      'Environment': 'In your outer environment,',
      'Habit': 'Through habitual patterns,',
      'Coincidence': 'Through seeming coincidence,',
      'Synthesis (Pattern)': 'When the isolated factors are woven together,',
    }
    return contexts[position] || 'In this position,'
  }

  private generateOverallReading(cards: (TarotCard & { isUpright: boolean; position: string })[], question: string, spread: any): string {
    const mainCard = cards.find(c => c.position === 'Present' || c.position === 'Message' || c.position === 'Situation' || c.position === 'Synthesis (Pattern)') || cards[0]
    const adviceCard = cards.find(c => c.position === 'Advice')
    const outcomeCard = cards.find(c => c.position === 'Outcome' || c.position === 'Future')
    return `For your question: "${question}", the ${spread.name} reveals ${mainCard.name} (${mainCard.isUpright ? 'upright' : 'reversed'}) in the ${mainCard.position} position, indicating: ${mainCard.isUpright ? mainCard.upright : mainCard.reversed}. ${adviceCard ? `Advice: ${adviceCard.name} - ${adviceCard.isUpright ? adviceCard.upright : adviceCard.reversed}.` : ''} ${outcomeCard ? `Outcome: ${outcomeCard.name} - ${outcomeCard.isUpright ? outcomeCard.upright : outcomeCard.reversed}.` : ''} The elemental balance is ${this.getElementalDescription(cards)}. Trust the guidance of the Tarot.`
  }

  private generateDetailedInterpretation(cards: (TarotCard & { isUpright: boolean; position: string })[], question: string, spread: any, displayName?: string): string {
    // Story-telling interpretation in DoveandSerpentTarot style
    const greeting = `Dear ${displayName || 'Seeker'}`
    let story = `${greeting}, as we explore your question "${question}", the ${spread.name} reveals a beautiful narrative woven through these sacred cards.\n\n`
    
    // Introduction to the spread
    story += `The cards laid before us tell a story of transformation, guidance, and wisdom. Each card speaks to different aspects of your journey, and together they form a cohesive message from the universe.\n\n`
    
    // Individual card interpretations
    story += `Let us begin by examining each card in its position:\n\n`
    cards.forEach((card, index) => {
      const meaning = card.isUpright ? card.upright : card.reversed
      const orientation = card.isUpright ? 'upright' : 'reversed'
      story += `${index + 1}. ${card.name} (${orientation}) in the ${card.position} position:\n`
      story += `   ${this.getPositionContext(card.position)} ${meaning}. `
      
      // Add deeper insight based on card type
      if (card.arcana === 'major') {
        story += `As a Major Arcana card, ${card.name} carries significant spiritual weight and indicates a major life lesson or turning point. `
      } else {
        story += `This ${card.suit} card reflects the ${this.getElementalDescription([card])} energy in your daily life. `
      }
      story += '\n\n'
    })
    
    // Combined narrative
    story += `Now, let us weave these cards together into a unified message:\n\n`
    const mainCard = cards.find(c => c.position === 'Present' || c.position === 'Situation' || c.position === 'Message') || cards[0]
    const pastCard = cards.find(c => c.position === 'Past')
    const futureCard = cards.find(c => c.position === 'Future' || c.position === 'Outcome')
    
    story += `Your journey begins ${pastCard ? `with ${pastCard.name} in your past, which has shaped where you stand today. ` : ''}Currently, you are experiencing the energy of ${mainCard.name}, which speaks to ${mainCard.isUpright ? mainCard.upright : mainCard.reversed}. `
    
    if (futureCard) {
      story += `Looking ahead, ${futureCard.name} suggests that your path forward involves ${futureCard.isUpright ? futureCard.upright : futureCard.reversed}. `
    }
    
    // Elemental analysis
    const elementalBalance = this.calculateElementalBalance(cards)
    story += `\nThe elemental energies present in your reading show a dominance of ${elementalBalance.primary} energy, indicating ${this.getElementalDescription(cards)}. `
    
    // Answer the question
    story += `\n\nTo answer your question directly: ${this.answerQuestionDirectly(cards, question, spread)}`
    
    // Closing guidance
    story += `\n\nRemember, the Tarot is a mirror reflecting your inner wisdom and the energies surrounding you. Trust in the guidance offered, but also trust in your own intuition and ability to navigate your path. The cards do not dictate your future; they illuminate possibilities and provide clarity on your journey.`
    
    return story
  }

  private answerQuestionDirectly(cards: (TarotCard & { isUpright: boolean; position: string })[], question: string, spread: any): string {
    const mainCard = cards.find(c => c.position === 'Present' || c.position === 'Situation' || c.position === 'Message') || cards[0]
    const outcomeCard = cards.find(c => c.position === 'Outcome' || c.position === 'Future')
    const adviceCard = cards.find(c => c.position === 'Advice')
    
    let answer = `The cards suggest that ${mainCard.isUpright ? mainCard.upright : mainCard.reversed}. `
    
    if (adviceCard) {
      answer += `The guidance being offered is to focus on ${adviceCard.isUpright ? adviceCard.upright : adviceCard.reversed}. `
    }
    
    if (outcomeCard) {
      answer += `The likely outcome involves ${outcomeCard.isUpright ? outcomeCard.upright : outcomeCard.reversed}. `
    }
    
    return answer
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

  private generateRecommendations(
    cards: (TarotCard & { isUpright: boolean; position: string; signalGravity?: 'fleeting' | 'moderate' | 'major' })[],
    elementalBalance: TarotReading['elementalBalance'],
    timing: TarotReading['timing'],
  ): string[] {
    const whisper = cards.find((c) => c.position === 'Whisper (Blind Spot)');
    if (whisper) {
      const synthesis = cards.find((c) => c.position === 'Synthesis (Pattern)');
      return [
        `Treat the Whisper card (${whisper.name}) as the quiet anomaly — the theme you are tempted to dismiss.`,
        'Read Inner Life, Environment, Habit, and Coincidence as isolated forces before merging them.',
        synthesis
          ? `Let ${synthesis.name} in Synthesis name the macro pattern only after you have honored each factor.`
          : 'Name what each factor wants before you merge them into one story.',
        'Use signal gravity: fleeting themes are notes; major themes are course corrections.',
      ];
    }
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
    await userSubdocSet(userId, 'tarot-readings', reading.id, {
      ...reading,
      timestamp: reading.timestamp.toISOString(),
    } as Record<string, unknown>)
  }

  async getReading(userId: string, readingId: string): Promise<TarotReading | null> {
    const data = await userSubdocGet(userId, 'tarot-readings', readingId)
    if (!data) return null
    return {
      ...data,
      timestamp: new Date(data.timestamp as string),
    } as TarotReading
  }

  async saveCoaching(userId: string, coaching: TarotCoaching): Promise<void> {
    await userSubdocSet(userId, 'tarot-coaching', coaching.id, {
      ...coaching,
      timestamp: coaching.timestamp.toISOString(),
    } as Record<string, unknown>)
  }

  getSystemStatus() {
    return {
      totalCards: this.tarotDeck.length,
      totalSpreads: this.spreads.length,
      lifePhases: this.lifePhases.length,
      favorablePeriods: this.favorablePeriods.length,
      lastUpdated: new Date().toISOString(),
      version: '2.0.0'
    }
  }

  getAvailableSpreads() {
    return this.spreads.map(s => ({
      name: s.name,
      key: s.key,
      description: s.description,
      cardCount: s.positions.length,
      positions: s.positions
    }))
  }

  getAllCards(): TarotCard[] {
    return [...this.tarotDeck]
  }

  getMajorArcanaCards(): TarotCard[] {
    return this.tarotDeck.filter(card => card.arcana === 'major')
  }

  getMinorArcanaCards(suit?: 'wands' | 'cups' | 'swords' | 'pentacles'): TarotCard[] {
    const minorCards = this.tarotDeck.filter(card => card.arcana === 'minor')
    if (suit) {
      return minorCards.filter(card => card.suit === suit)
    }
    return minorCards
  }

  // --- Profile Card Calculations ---
  
  /**
   * Calculate Tarot profile cards (Birth Card, Life Path Card, Soul Card, Personality Card)
   * based on birth date and full name using numerology.
   */
  calculateProfileCards(birthDate: string, fullName: string): {
    birthCard: TarotCard | null
    lifePathCard: TarotCard | null
    soulCard: TarotCard | null
    personalityCard: TarotCard | null
  } {
    try {
      // Numerology letter values (Pythagorean system)
      const LETTER_VALUES: { [key: string]: number } = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
        'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
        'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
      }

      const MASTER_NUMBERS = [11, 22]

      // Helper: Reduce number to single digit or master number (1-22 range)
      const reduceToTarotNumber = (num: number): number => {
        if (MASTER_NUMBERS.includes(num)) return num
        if (num <= 0) return 0
        if (num <= 22) return num
        // Reduce numbers > 22
        let reduced = num
        while (reduced > 22) {
          reduced = reduced.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0)
          if (MASTER_NUMBERS.includes(reduced)) return reduced
        }
        return reduced
      }

      // Helper: Map numerology number (1-22) to Major Arcana card number (0-21)
      const mapToMajorArcanaNumber = (num: number): number => {
        if (num === 0) return 0 // The Fool
        if (num === 22) return 21 // The World (22 is completion/master number)
        if (num >= 1 && num <= 21) return num
        return 0 // Default to The Fool
      }

      // Helper: Get Major Arcana card by number
      const getMajorArcanaCard = (cardNumber: number): TarotCard | null => {
        const majorCards = this.getMajorArcanaCards()
        return majorCards.find(card => card.number === cardNumber) || null
      }

      // 1. Birth Card: Sum all digits of birth date (MM/DD/YYYY), reduce to 1-22
      const date = new Date(birthDate)
      const day = date.getDate()
      const month = date.getMonth() + 1
      const year = date.getFullYear()
      
      const birthDateSum = day.toString().split('').concat(
        month.toString().split(''),
        year.toString().split('')
      ).reduce((sum, digit) => sum + parseInt(digit), 0)
      
      const birthCardNumber = mapToMajorArcanaNumber(reduceToTarotNumber(birthDateSum))
      const birthCard = getMajorArcanaCard(birthCardNumber)

      // 2. Life Path Card: Calculate Life Path Number from birth date
      const dayReduced = reduceToTarotNumber(day)
      const monthReduced = reduceToTarotNumber(month)
      const yearReduced = reduceToTarotNumber(year)
      const lifePathSum = reduceToTarotNumber(dayReduced + monthReduced + yearReduced)
      const lifePathCardNumber = mapToMajorArcanaNumber(lifePathSum)
      const lifePathCard = getMajorArcanaCard(lifePathCardNumber)

      // 3. Soul Card: Sum vowels in full name
      const vowels = ['A', 'E', 'I', 'O', 'U']
      const nameArray = fullName.toUpperCase().split('')
      const vowelLetters = nameArray.filter(letter => vowels.includes(letter))
      const soulSum = vowelLetters.reduce((total, letter) => {
        return total + (LETTER_VALUES[letter] || 0)
      }, 0)
      const soulCardNumber = mapToMajorArcanaNumber(reduceToTarotNumber(soulSum))
      const soulCard = getMajorArcanaCard(soulCardNumber)

      // 4. Personality Card: Sum consonants in full name
      const consonantLetters = nameArray.filter(letter => 
        !vowels.includes(letter) && LETTER_VALUES[letter]
      )
      const personalitySum = consonantLetters.reduce((total, letter) => {
        return total + (LETTER_VALUES[letter] || 0)
      }, 0)
      const personalityCardNumber = mapToMajorArcanaNumber(reduceToTarotNumber(personalitySum))
      const personalityCard = getMajorArcanaCard(personalityCardNumber)

      return {
        birthCard,
        lifePathCard,
        soulCard,
        personalityCard
      }
    } catch (error) {
      devLog.error('Error calculating profile cards:', error, 'tarotIntelligence')
      return {
        birthCard: null,
        lifePathCard: null,
        soulCard: null,
        personalityCard: null
      }
    }
  }
}

export const tarotIntelligence = new TarotIntelligence()
