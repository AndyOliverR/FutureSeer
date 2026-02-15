/**
 * Trichakra Seer State Store and Slice Selector.
 * Builds normalized Trichakra state (imbalance levels + sources + action plan)
 * and returns only the slice relevant for expert reasoning: state-based, not question-based.
 */

import type { TrichakraAnalysis } from '@/lib/trichakraIntelligence'

export type TrichakraQuestionType =
  | 'what_should_i_do'
  | 'reduce_problems'
  | 'which_remedy'
  | 'why_blocked'
  | 'general'
  | 'refusal'

export interface TrichakraActiveRemedy {
  title: string
  source: string
  layer: 'body' | 'mind' | 'soul'
}

export interface TrichakraState {
  body_level: number
  mind_level: number
  soul_level: number
  dominant_sources: string[]
  life_path: number | null
  planetary_stress: string[]
  environmental_issues: string[]
  active_remedies: TrichakraActiveRemedy[]
  vastu_hints: string[]
  immediate_count: number
  short_term_count: number
  long_term_count: number
  timestamp: string
}

/**
 * Build Trichakra state from analysis. This is the equivalent of natal chart / tarot spread
 * for the Trichakra expert; the Seer must never reason without this object.
 */
export function buildTrichakraState(analysis: TrichakraAnalysis): TrichakraState {
  const body_level = analysis.remedies.body.length
  const mind_level = analysis.remedies.mind.length
  const soul_level = analysis.remedies.soul.length

  const sources = new Set<string>()
  const allRemedies = [
    ...analysis.remedies.body,
    ...analysis.remedies.mind,
    ...analysis.remedies.soul
  ]
  allRemedies.forEach((r: { system?: string }) => {
    if (r.system) sources.add(r.system)
  })
  if (analysis.numerologyAnalysis?.lifePathNumber != null) sources.add('numerology')
  if (analysis.astrologicalAnalysis?.weakPlanets?.length) sources.add('astrology')
  if (analysis.lalKitabAnalysis?.priorityPlanets?.length) sources.add('lal-kitab')
  if (analysis.vastuAnalysis?.remedies?.length || analysis.vastuAnalysis?.unfavorableDirections?.length) {
    sources.add('vastu')
  }
  const dominant_sources = Array.from(sources)

  const life_path =
    analysis.numerologyAnalysis?.lifePathNumber != null
      ? analysis.numerologyAnalysis.lifePathNumber
      : null

  const planetary_stress = analysis.astrologicalAnalysis?.weakPlanets ?? []

  const environmental_issues =
    analysis.vastuAnalysis?.unfavorableDirections ?? []

  const vastu_hints: string[] = []
  const vastuRemedies = analysis.vastuAnalysis?.remedies ?? []
  for (let i = 0; i < Math.min(2, vastuRemedies.length); i++) {
    const r = vastuRemedies[i] as { title?: string; description?: string; instructions?: string[] }
    const title = r.title || 'Vastu remedy'
    const firstInstruction = r.instructions?.[0] || r.description || ''
    vastu_hints.push(firstInstruction ? `${title}: ${firstInstruction}` : title)
  }

  const active_remedies: TrichakraActiveRemedy[] = (analysis.actionPlan?.immediate ?? [])
    .slice(0, 3)
    .map((r: { title: string; system?: string; chakra?: string }) => ({
      title: r.title,
      source: r.system ?? 'unknown',
      layer: (r.chakra as 'body' | 'mind' | 'soul') ?? 'body'
    }))

  const immediate_count = analysis.actionPlan?.immediate?.length ?? 0
  const short_term_count = analysis.actionPlan?.shortTerm?.length ?? 0
  const long_term_count = analysis.actionPlan?.longTerm?.length ?? 0

  const generatedAt = analysis.metadata?.generatedAt as Date | string | undefined
  const timestamp =
    generatedAt instanceof Date
      ? generatedAt.toISOString().slice(0, 10)
      : typeof generatedAt === 'string'
        ? generatedAt.slice(0, 10)
        : new Date().toISOString().slice(0, 10)

  return {
    body_level,
    mind_level,
    soul_level,
    dominant_sources,
    life_path,
    planetary_stress,
    environmental_issues,
    active_remedies,
    vastu_hints,
    immediate_count,
    short_term_count,
    long_term_count,
    timestamp
  }
}

/**
 * Classify Trichakra question. Returns 'refusal' only for Tier 3: predictive outcomes
 * (will I get married, will my app succeed) or medical/mental health substitution.
 * Timing questions ("when will things get better", "when should I launch") are NOT
 * refused; they get Tier 2 (conditions) from the prompt.
 */
export function classifyTrichakraQuestion(question: string): TrichakraQuestionType {
  const lower = question.toLowerCase().trim()

  // Tier 3 refusals only: predictive "will" (outcome) + medical/mental health substitution
  const isPredictiveWill =
    /\bwill\s+i\s+(get|be|have|marry|succeed|win|find|land)\b/.test(lower) ||
    /\bwill\s+my\s+(app|business|marriage|job|relationship)\s+(succeed|work|happen)\b/.test(lower) ||
    /\bwill\s+this\s+(work|succeed|happen)\b/.test(lower) ||
    /\bwill\s+it\s+(work|succeed|happen)\b/.test(lower) ||
    /\bwill\s+i\s+get\s+married\b/.test(lower) ||
    /\bguarantee|guaranteed\s+result/.test(lower)
  const isMedicalMental =
    /\b(medical|diagnos|treatment|mental\s+health|therapy|cure\s+my|fix\s+my\s+health|replace\s+medical|substitute\s+for\s+(medical|doctor|therapy))\b/.test(
      lower
    )
  if (isPredictiveWill || isMedicalMental) {
    return 'refusal'
  }

  // Timing / conditions: do NOT refuse; map to general so prompt gives Tier 2 (conditions) answer
  if (/when\s+should\s+i\s+(launch|start|act)|when\s+to\s+(launch|start|act)|best\s+time\s+to|when\s+will\s+things\s+get\s+better|when\s+will\s+i\s+see\s+improvement/.test(lower)) {
    return 'general'
  }

  if (/what\s+should\s+i\s+do\s+right\s+now|what\s+to\s+do\s+now|what\s+do\s+i\s+do\s+first/.test(lower)) {
    return 'what_should_i_do'
  }
  if (/how\s+do\s+i\s+reduce|reduce\s+problems|lessen|minimize\s+(stress|problems)/.test(lower)) {
    return 'reduce_problems'
  }
  if (/which\s+remedy|which\s+remedies|what\s+remedy\s+should|follow\s+which/.test(lower)) {
    return 'which_remedy'
  }
  if (
    /why\s+am\s+i\s+feeling\s+(blocked|heavy|disturbed)|feeling\s+blocked|feel\s+heavy|disturbed|stuck/.test(
      lower
    )
  ) {
    return 'why_blocked'
  }

  return 'general'
}

/**
 * Imbalance router: allowed focus based on state (only layers with level > 0).
 */
function getAllowedFocus(state: TrichakraState): string {
  const body = state.body_level > 0
  const mind = state.mind_level > 0
  const soul = state.soul_level > 0
  if (body && !mind && !soul) return 'Body only'
  if (!body && mind && !soul) return 'Mind only'
  if (!body && !mind && soul) return 'Soul only'
  if (body && mind && !soul) return 'Body and Mind'
  if (body && !mind && soul) return 'Body and Soul'
  if (!body && mind && soul) return 'Mind and Soul'
  if (body && mind && soul) return 'Body, Mind, and Soul'
  return 'None (no imbalance in context)'
}

/**
 * Format Trichakra slice for the system prompt: state summary + imbalance router +
 * source selector + remedy minimalism + action plan sequencer.
 */
export function getTrichakraSliceForQuestionType(
  questionType: Exclude<TrichakraQuestionType, 'refusal'>,
  state: TrichakraState
): string {
  const lines: string[] = []
  lines.push('# Trichakra facts (use only these to answer)')
  lines.push('')

  lines.push('## State summary')
  lines.push(`- Body level (remedy count): ${state.body_level}`)
  lines.push(`- Mind level (remedy count): ${state.mind_level}`)
  lines.push(`- Soul level (remedy count): ${state.soul_level}`)
  lines.push(`- Dominant sources (only these may prescribe): ${state.dominant_sources.join(', ') || 'none'}`)
  if (state.life_path != null) lines.push(`- Life path number: ${state.life_path}`)
  if (state.planetary_stress.length)
    lines.push(`- Planetary stress: ${state.planetary_stress.join(', ')}`)
  if (state.environmental_issues.length)
    lines.push(`- Environmental issues (directions): ${state.environmental_issues.join(', ')}`)
  if (state.active_remedies.length) {
    lines.push('- Active remedies (max 3):')
    state.active_remedies.forEach((r) => lines.push(`  - ${r.title} (${r.source}, ${r.layer})`))
  }
  if (state.vastu_hints?.length) {
    lines.push('- Vastu suggestions (use when user asks how to mitigate or name an element):')
    state.vastu_hints.forEach((h) => lines.push(`  - ${h}`))
  }
  lines.push(`- Timestamp: ${state.timestamp}`)
  lines.push('')

  const allowedFocus = getAllowedFocus(state)
  lines.push('## Imbalance router')
  lines.push(`- Allowed focus: ${allowedFocus}. Only suggest remedies for layers that have imbalance (level > 0).`)
  lines.push('- Body-level remedies: gemstones, colors, materials, vastu (directions, placement), and numerology-based physical applications (lucky numbers, lucky days, colors, routine timing). When Body level > 0, you may suggest these from dominant_sources.')
  lines.push('- Mind-level: mantras, meditation, affirmations. Soul-level: rituals, transformational practices, charity. Do not suggest Mind- or Soul-level remedies when Mind or Soul level is 0.')
  lines.push('- Do not refuse gemstones or numerology (numbers, days, colors) on the grounds that Mind or Soul are 0; they are Body-level when prescribed from dominant_sources or from the user\'s active remedies.')
  lines.push('')

  lines.push('## Source selector')
  lines.push('- Only remedies from dominant_sources may be prescribed.')
  lines.push('- If the user asks about gemstones and dominant_sources do not include astrology or lal-kitab, say their current state is guided by the listed sources (e.g. numerology and vastu) and suggest what applies: lucky numbers/days, vastu directions. If dominant_sources include astrology or lal-kitab, gemstones from the user\'s Body remedies may be suggested.')
  lines.push('')

  lines.push('## Remedy minimalism')
  lines.push(
    '- Max 1–2 remedies per layer, max 3 active remedies total. When the user already has sufficient guidance from the state, say: "No additional remedies are required at this stage."'
  )
  lines.push('')

  lines.push('## Action plan sequencer')
  lines.push(
    `- Immediate: ${state.immediate_count}. Short-term: ${state.short_term_count}. Long-term: ${state.long_term_count}. Answer in time order (immediate → short-term → long-term).`
  )
  if (state.immediate_count === 0) {
    lines.push(
      '- If the user asks what to do right now, state clearly: there are 0 immediate remedies in the current state; suggest they focus on short-term or long-term items from their analysis, or that no additional remedies are required at this stage.'
    )
  }
  lines.push('')

  return lines.join('\n').trim()
}
