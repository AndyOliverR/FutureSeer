/**
 * Lenormand Card Combinations Database
 * 
 * This file contains traditional interpretations for common 2-card combinations
 * in Lenormand readings. While there are 1,296 possible combinations (36x36),
 * we focus on the most common and meaningful pairs.
 * 
 * In Lenormand, cards are read syntactically - like words forming sentences.
 * The meaning of a card changes based on the cards surrounding it.
 */

import { LenormandCard } from './lenormandIntelligence'

export interface CardCombination {
  card1: string
  card2: string
  themes: string[]
  meaning: string
  context: string
}

// Theme categories for organization
export type CombinationTheme = 
  | 'love' 
  | 'career' 
  | 'money' 
  | 'health' 
  | 'travel' 
  | 'timing' 
  | 'communication' 
  | 'conflict' 
  | 'opportunity' 
  | 'transformation' 
  | 'general'

// Common and significant combinations organized by theme
export const CARD_COMBINATIONS: CardCombination[] = [
  // LOVE & RELATIONSHIPS
  { card1: 'Heart', card2: 'Ring', themes: ['love'], meaning: 'Loving commitment or marriage', context: 'Strong partnership, proposal, engagement' },
  { card1: 'Ring', card2: 'Heart', themes: ['love'], meaning: 'Marriage proposal or committed relationship', context: 'Romantic commitment, wedding plans' },
  { card1: 'Heart', card2: 'Bouquet', themes: ['love'], meaning: 'Romance and gifts', context: 'New relationship, receiving love, romance blossoms' },
  { card1: 'Rider', card2: 'Heart', themes: ['love'], meaning: 'News about love', context: 'Message from love interest, news about romance' },
  { card1: 'Heart', card2: 'Sun', themes: ['love'], meaning: 'Happy and joyful love', context: 'Blissful relationship, love brings happiness' },
  { card1: 'Heart', card2: 'Snake', themes: ['love'], meaning: 'Love complications or deception', context: 'Dishonesty in relationship, complex emotions' },
  { card1: 'Ring', card2: 'Snake', themes: ['love'], meaning: 'Commitment issues or contract problems', context: 'Betrayal in partnership, broken promises' },
  
  // CAREER & WORK
  { card1: 'Anchor', card2: 'Sun', themes: ['career'], meaning: 'Successful career or stable work', context: 'Job security, career advancement, professional fulfillment' },
  { card1: 'Fox', card2: 'Anchor', themes: ['career'], meaning: 'Hard work and dedication', context: 'Strategy at work, career planning, effort pays off' },
  { card1: 'Bear', card2: 'Anchor', themes: ['career'], meaning: 'Leadership role or authority position', context: 'Promotion, management role, career strength' },
  { card1: 'Anchor', card2: 'Mountain', themes: ['career'], meaning: 'Career obstacles or job challenges', context: 'Difficult workplace, blocked advancement' },
  { card1: 'Ship', card2: 'Anchor', themes: ['career'], meaning: 'Career change or job travel', context: 'New job location, career journey begins' },
  
  // MONEY & FINANCIAL
  { card1: 'Fish', card2: 'Sun', themes: ['money'], meaning: 'Financial abundance and success', context: 'Money flows in, financial prosperity' },
  { card1: 'Fish', card2: 'Bouquet', themes: ['money'], meaning: 'Money gift or financial opportunity', context: 'Unexpected money, windfall, bonus' },
  { card1: 'Fish', card2: 'Mice', themes: ['money'], meaning: 'Financial loss or gradual wasting', context: 'Money troubles, expenses increasing, savings draining' },
  { card1: 'Clover', card2: 'Fish', themes: ['money'], meaning: 'Lucky financial opportunity', context: 'Small windfall, lucky break with money' },
  { card1: 'Ring', card2: 'Fish', themes: ['money'], meaning: 'Contract money or committed income', context: 'Steady salary, business deal, payment received' },
  
  // HEALTH & WELL-BEING
  { card1: 'Tree', card2: 'Sun', themes: ['health'], meaning: 'Good health and vitality', context: 'Strong constitution, recovery, wellness' },
  { card1: 'Tree', card2: 'Cross', themes: ['health'], meaning: 'Health burden or chronic condition', context: 'Long-term illness, health challenge' },
  { card1: 'Scythe', card2: 'Tree', themes: ['health'], meaning: 'Sudden health issue or surgery', context: 'Medical procedure, acute illness' },
  { card1: 'Coffin', card2: 'Tree', themes: ['health'], meaning: 'End of illness or recovery', context: 'Healing complete, illness ending' },
  
  // TRAVEL
  { card1: 'Ship', card2: 'Sun', themes: ['travel'], meaning: 'Happy journey or successful trip', context: 'Pleasant travel, vacation success' },
  { card1: 'Ship', card2: 'Clouds', themes: ['travel'], meaning: 'Confusing travel or delayed journey', context: 'Travel problems, unclear plans' },
  { card1: 'Ship', card2: 'Rider', themes: ['travel'], meaning: 'Fast travel or quick journey', context: 'Rapid movement, short trip' },
  { card1: 'Ship', card2: 'Mountain', themes: ['travel'], meaning: 'Travel obstacles or difficulty', context: 'Journey blocked, travel challenges' },
  
  // COMMUNICATION
  { card1: 'Rider', card2: 'Letter', themes: ['communication'], meaning: 'Important message arriving', context: 'Email, text, written communication' },
  { card1: 'Birds', card2: 'Letter', themes: ['communication'], meaning: 'Worrying news or gossip', context: 'Anxious conversation, concerning message' },
  { card1: 'Birds', card2: 'Book', themes: ['communication'], meaning: 'Secret conversation or hidden knowledge', context: 'Confidential talk, private discussion' },
  { card1: 'Rider', card2: 'Birds', themes: ['communication'], meaning: 'Multiple messages or conversations', context: 'Busy communication, many calls' },
  
  // TRANSFORMATION & CHANGE
  { card1: 'Coffin', card2: 'Stork', themes: ['transformation'], meaning: 'Complete transformation or rebirth', context: 'Ending leads to new beginning' },
  { card1: 'Scythe', card2: 'Stork', themes: ['transformation'], meaning: 'Sudden and complete change', context: 'Quick transformation, life shift' },
  { card1: 'Coffin', card2: 'Tree', themes: ['transformation'], meaning: 'Recovery and new growth', context: 'Ending of difficulty, beginning of health' },
  { card1: 'Snake', card2: 'Stork', themes: ['transformation'], meaning: 'Complicated change or transformation', context: 'Complex transition, tricky situation evolves' },
  
  // CONFLICT & STRUGGLE
  { card1: 'Whip', card2: 'Snake', themes: ['conflict'], meaning: 'Continuous conflict or ongoing struggle', context: 'Repetitive arguments, ongoing tension' },
  { card1: 'Whip', card2: 'Clouds', themes: ['conflict'], meaning: 'Confusing arguments or unclear conflict', context: 'Chaotic disagreement, unclear issues' },
  { card1: 'Bear', card2: 'Fox', themes: ['conflict'], meaning: 'Power struggle or competition', context: 'Authority conflict, work competition' },
  { card1: 'Crossroads', card2: 'Clouds', themes: ['conflict'], meaning: 'Confusing decision or unclear choices', context: 'Difficult choice, hard decision' },
  
  // OPPORTUNITIES & LUCK
  { card1: 'Clover', card2: 'Sun', themes: ['opportunity'], meaning: 'Lucky and happy opportunity', context: 'Fortune smiles, bright chance' },
  { card1: 'Clover', card2: 'Child', themes: ['opportunity'], meaning: 'Small new opportunity', context: 'Fresh start chance, new beginning luck' },
  { card1: 'Key', card2: 'Sun', themes: ['opportunity'], meaning: 'Unlocking success or golden chance', context: 'Solution found, door opens to success' },
  { card1: 'Bouquet', card2: 'Sun', themes: ['opportunity'], meaning: 'Happy gift or pleasant surprise', context: 'Joyful recognition, celebration ahead' },
  
  // TIMING COMBINATIONS
  { card1: 'Rider', card2: 'Clover', themes: ['timing'], meaning: 'Lucky news very soon', context: 'Quick good news, immediate opportunity' },
  { card1: 'Rider', card2: 'Scythe', themes: ['timing'], meaning: 'Sudden news or immediate change', context: 'Quick decisive event, instant message' },
  { card1: 'Sun', card2: 'Moon', themes: ['timing'], meaning: 'Full cycle or complete period', context: 'Whole cycle, month completion' },
  { card1: 'Star', card2: 'Moon', themes: ['timing'], meaning: 'Timing based on cycles', context: 'Natural timing, cosmic alignment' },
  
  // GENERAL MEANINGFUL PAIRS
  { card1: 'House', card2: 'Heart', themes: ['general'], meaning: 'Home filled with love', context: 'Happy home, family love' },
  { card1: 'House', card2: 'Tree', themes: ['general'], meaning: 'Healthy home or growing family', context: 'Family wellness, domestic growth' },
  { card1: 'Garden', card2: 'Sun', themes: ['general'], meaning: 'Happy social gathering', context: 'Joyful party, community celebration' },
  { card1: 'Anchor', card2: 'Ring', themes: ['general'], meaning: 'Stable commitment or long-term contract', context: 'Secure partnership, lasting agreement' },
  { card1: 'Dog', card2: 'Sun', themes: ['general'], meaning: 'Loyal and joyful friendship', context: 'True friend, happy companionship' },
  { card1: 'Dog', card2: 'Heart', themes: ['general'], meaning: 'Loving friendship or best friend', context: 'Close friend, devoted companion' },
  { card1: 'Book', card2: 'Star', themes: ['general'], meaning: 'Learning and guidance', context: 'Study opportunity, spiritual learning' },
  { card1: 'Lily', card2: 'Sun', themes: ['general'], meaning: 'Peaceful happiness', context: 'Serene joy, calm contentment' }
]

/**
 * Get combination meaning for two specific cards
 */
export function getCombination(
  card1Name: string, 
  card2Name: string
): CardCombination | null {
  // Try exact match first
  const exactMatch = CARD_COMBINATIONS.find(
    c => c.card1 === card1Name && c.card2 === card2Name
  )
  if (exactMatch) return exactMatch
  
  // Try reverse order
  const reverseMatch = CARD_COMBINATIONS.find(
    c => c.card1 === card2Name && c.card2 === card1Name
  )
  if (reverseMatch) {
    return {
      ...reverseMatch,
      card1: card1Name,
      card2: card2Name
    }
  }
  
  return null
}

/**
 * Get all combinations for a specific theme
 */
export function getCombinationsByTheme(theme: CombinationTheme): CardCombination[] {
  return CARD_COMBINATIONS.filter(c => c.themes.includes(theme))
}

/**
 * Find combinations involving a specific card
 */
export function getCombinationsForCard(cardName: string): CardCombination[] {
  return CARD_COMBINATIONS.filter(
    c => c.card1 === cardName || c.card2 === cardName
  )
}

/**
 * Analyze a spread for key combinations
 */
export function analyzeSpreadCombinations(cards: LenormandCard[]): Array<{
  cards: string[]
  combination: CardCombination
}> {
  const combinations: Array<{ cards: string[]; combination: CardCombination }> = []
  
  // Check adjacent pairs in spread
  for (let i = 0; i < cards.length - 1; i++) {
    const card1 = cards[i]
    const card2 = cards[i + 1]
    const combo = getCombination(card1.name, card2.name)
    
    if (combo) {
      combinations.push({
        cards: [card1.name, card2.name],
        combination: combo
      })
    }
  }
  
  return combinations
}

/**
 * Generate fallback interpretation for unknown combinations
 */
export function generateFallbackInterpretation(
  card1: LenormandCard,
  card2: LenormandCard
): string {
  const keywords1 = card1.keywords.join(' or ')
  const keywords2 = card2.keywords.join(' or ')
  
  return `The ${card1.name} combined with ${card2.name} suggests a situation involving ${keywords1} intersecting with ${keywords2}. This combination creates a dynamic interplay between ${card1.name.toLowerCase()} energy and ${card2.name.toLowerCase()} influences, requiring careful consideration of both aspects to understand the full meaning.`
}

