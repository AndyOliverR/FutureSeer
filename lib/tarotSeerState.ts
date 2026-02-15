/**
 * Tarot Seer State Store and Slice Selector.
 * Builds normalized Tarot state (profile + optional reading) and returns
 * only the slice relevant to the question type for expert reasoning.
 */

export type TarotQuestionType =
  | 'situation_clarity'
  | 'decision'
  | 'relationship'
  | 'career'
  | 'emotional'
  | 'near_future'
  | 'advice'
  | 'profile_only'
  | 'refusal'

export interface TarotProfileEntry {
  name: string
  element?: string
  uprightOneLine?: string
}

export interface TarotReadingCard {
  name: string
  position: string
  orientation: 'upright' | 'reversed'
  element?: string
}

export interface TarotState {
  profile: {
    birthCard: TarotProfileEntry | null
    lifePathCard: TarotProfileEntry | null
    soulCard: TarotProfileEntry | null
    personalityCard: TarotProfileEntry | null
  }
  reading: {
    spreadType: string
    spreadName: string
    question: string
    positions: string[]
    cards: TarotReadingCard[]
  } | null
}

function toProfileEntry(card: any): TarotProfileEntry | null {
  if (!card || !card.name) return null
  const upright = card.upright || ''
  return {
    name: card.name,
    element: card.element || undefined,
    uprightOneLine: upright.substring(0, 80) + (upright.length > 80 ? '...' : '')
  }
}

/**
 * Build normalized Tarot state from profile cards and optional current reading.
 */
export function buildTarotState(
  profileCards: any,
  currentReading?: any
): TarotState {
  const profile = {
    birthCard: toProfileEntry(profileCards?.birthCard),
    lifePathCard: toProfileEntry(profileCards?.lifePathCard),
    soulCard: toProfileEntry(profileCards?.soulCard),
    personalityCard: toProfileEntry(profileCards?.personalityCard)
  }

  let reading: TarotState['reading'] = null
  if (currentReading?.cards?.length) {
    reading = {
      spreadType: currentReading.spreadType || currentReading.spread_type || 'unknown',
      spreadName: currentReading.spreadName || currentReading.spread_name || 'Reading',
      question: currentReading.question || '',
      positions: currentReading.positions || currentReading.cards.map((c: any) => c.position),
      cards: (currentReading.cards || []).map((c: any) => ({
        name: c.name || 'Unknown',
        position: c.position || 'Unknown',
        orientation: c.isUpright === false ? 'reversed' : 'upright',
        element: c.element || undefined
      }))
    }
  }

  return { profile, reading }
}

/**
 * Classify Tarot question type. Returns 'refusal' only for Tier 3: medical diagnosis,
 * legal verdict, or exact numeric outcome. Timing questions (e.g. when to launch) get
 * profile_only or interpretive types and are answered with Tier 2 (conditions/phases).
 */
export function classifyTarotQuestion(question: string): TarotQuestionType {
  const lower = question.toLowerCase().trim()

  // Tier 3 refusals only: medical diagnosis, legal verdict, exact numeric outcome
  if (
    /\b(diagnos|doctor\s+say|have\s+cancer|medical\s+result|test\s+result|disease|sick|illness)\b/.test(lower) ||
    /\b(win\s+the\s+lawsuit|legal\s+verdict|judge\s+rule|court\s+decision|will\s+i\s+win\s+the\s+case)\b/.test(lower) ||
    /\b(exact\s+salary|exact\s+number|how\s+much\s+exactly|precise\s+amount|exact\s+figure|will\s+i\s+make\s+\$|dollar\s+amount)\b/.test(lower)
  ) {
    return 'refusal'
  }

  // Profile-only: birth card, life path card, soul card, personality card, profile
  if (/birth\s+card|life\s+path\s+card|soul\s+card|personality\s+card|tarot\s+profile|my\s+cards\s+mean|elemental\s+energy|major\s+vs\s+minor|arcana\s+balance/.test(lower)) {
    return 'profile_only'
  }

  // Profile-only: timing / launch — answer from profile first; spread optional
  if (/when\s+should\s+i|when\s+to\s+|best\s+time\s+to|when\s+is\s+the\s+best\s+time|when\s+to\s+launch|when\s+should\s+i\s+launch|when\s+is\s+good\s+to|right\s+time\s+to/.test(lower)) {
    return 'profile_only'
  }

  // Decision / choice
  if (/decision|choose|should\s+i|which\s+option|pick|choice|whether\s+to/.test(lower)) {
    return 'decision'
  }

  // Relationship
  if (/relationship|partner|love|compatibility|romance|marriage|they\s+feel|us\s+as\s+a\s+couple/.test(lower)) {
    return 'relationship'
  }

  // Career / money
  if (/career|job|work|money|financial|income|promotion|business|profession/.test(lower)) {
    return 'career'
  }

  // Emotional
  if (/emotional|feel|feelings|mood|anxiety|stress|inner\s+state|heart/.test(lower)) {
    return 'emotional'
  }

  // Near-future / outcome
  if (/what\s+will\s+happen|outcome|future|what\s+to\s+expect|next\s+few\s+weeks|near\s+future/.test(lower)) {
    return 'near_future'
  }

  // Advice / action
  if (/advice|what\s+should\s+i\s+do|how\s+can\s+i|guidance|action|step\s+forward|recommend/.test(lower)) {
    return 'advice'
  }

  // Situation clarity (general)
  if (/situation|clarity|understand|what\s+is\s+going\s+on|current\s+state|where\s+i\s+am/.test(lower)) {
    return 'situation_clarity'
  }

  return 'situation_clarity'
}

/** Suggested spread name per question type (for prompt when no reading in context). */
export const SPREAD_SUGGESTION_BY_TYPE: Record<Exclude<TarotQuestionType, 'refusal'>, string> = {
  situation_clarity: 'Three Card (Past, Present, Future)',
  decision: 'Five Card (Situation, Challenge, Advice, Outcome, Clarifier)',
  relationship: 'Relationship Spread',
  career: 'Life Purpose Spread',
  emotional: 'Three Card or Elemental Spread',
  near_future: 'Three Card (Past, Present, Future)',
  advice: 'Five Card (Situation, Challenge, Advice, Outcome, Clarifier)',
  profile_only: 'Single Card or Tarot Profile'
}

/**
 * Format Tarot slice for the system prompt: profile block + optional current reading block.
 * Only includes reading when it is relevant to the question type (e.g. decision + five-card reading).
 */
export function getTarotSliceForQuestionType(
  questionType: TarotQuestionType,
  tarotState: TarotState
): string {
  const lines: string[] = []
  lines.push('# Tarot facts (use only these to answer)')
  lines.push('')

  // Profile: always include
  lines.push('## Tarot profile')
  const { profile, reading } = tarotState
  if (profile.birthCard) {
    lines.push(`- Birth Card: ${profile.birthCard.name}${profile.birthCard.element ? ` (${profile.birthCard.element})` : ''}${profile.birthCard.uprightOneLine ? ` — ${profile.birthCard.uprightOneLine}` : ''}`)
  }
  if (profile.lifePathCard) {
    lines.push(`- Life Path Card: ${profile.lifePathCard.name}${profile.lifePathCard.element ? ` (${profile.lifePathCard.element})` : ''}${profile.lifePathCard.uprightOneLine ? ` — ${profile.lifePathCard.uprightOneLine}` : ''}`)
  }
  if (profile.soulCard) {
    lines.push(`- Soul Card: ${profile.soulCard.name}${profile.soulCard.element ? ` (${profile.soulCard.element})` : ''}${profile.soulCard.uprightOneLine ? ` — ${profile.soulCard.uprightOneLine}` : ''}`)
  }
  if (profile.personalityCard) {
    lines.push(`- Personality Card: ${profile.personalityCard.name}${profile.personalityCard.element ? ` (${profile.personalityCard.element})` : ''}${profile.personalityCard.uprightOneLine ? ` — ${profile.personalityCard.uprightOneLine}` : ''}`)
  }
  if (!profile.birthCard && !profile.lifePathCard && !profile.soulCard && !profile.personalityCard) {
    lines.push('- (No profile cards in this slice)')
  }
  lines.push('')

  // Reading: include when present and question type is interpretive (not profile_only)
  const needsReading =
    questionType !== 'profile_only' &&
    questionType !== 'refusal' &&
    ['situation_clarity', 'decision', 'relationship', 'career', 'emotional', 'near_future', 'advice'].includes(questionType)

  if (needsReading && reading) {
    lines.push('## Current reading')
    lines.push(`- Spread: ${reading.spreadName} (${reading.spreadType})`)
    if (reading.question) lines.push(`- Question: ${reading.question}`)
    lines.push('- Cards:')
    reading.cards.forEach(c => {
      lines.push(`  - ${c.name} (position: ${c.position}, ${c.orientation})${c.element ? `, ${c.element}` : ''}`)
    })
    lines.push('')
  } else if (needsReading && !reading) {
    lines.push('## Current reading')
    lines.push('- No reading in context. Use the Tarot profile above to give practical guidance first. You may suggest a spread for deeper insight after giving profile-based insight.')
    lines.push(`- Suggested spread for this type of question: ${SPREAD_SUGGESTION_BY_TYPE[questionType] || 'Three Card'}`)
    lines.push('')
  }

  return lines.join('\n').trim() || '# No Tarot slice available.'
}
