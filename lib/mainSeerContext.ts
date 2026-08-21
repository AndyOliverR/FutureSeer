/**
 * Packs identity + Seer Master + a few relevant stored reports for the main Seer.
 * Does not dump all 42 reports into the prompt.
 */

import { getDocument } from '@/lib/firebase-admin'
import type { UserProfile } from '@/lib/firebase'
import { ALL_TOOL_SLUGS, isReadyToolReport, summarizeToolReadiness } from '@/lib/toolReportReadiness'
import { wantsDeeperSeerAnswer } from '@/lib/seerChatVoice'

const SLICE_CHARS_DEFAULT = 1_800
const SLICE_CHARS_DEEP = 2_400
const MASTER_MAX_CHARS = 3_500

export const DEFAULT_MAIN_SEER_SLUGS = ['vedic', 'western', 'numerology', 'tarot'] as const

const TOPIC_SLUGS: Array<{ pattern: RegExp; slugs: readonly string[] }> = [
  { pattern: /\b(career|job|jobs|work|profession|business|promotion|office)\b/i, slugs: ['vedic', 'western', 'kp', 'numerology', 'humanDesign'] },
  { pattern: /\b(love|relationship|marriage|married|marry|partner|spouse|dating|synastry)\b/i, slugs: ['synastry', 'vedic', 'western', 'tarot'] },
  { pattern: /\b(money|finance|wealth|income|debt|invest)\b/i, slugs: ['financialAstrology', 'vedic', 'numerology', 'bazi'] },
  { pattern: /\b(health|illness|body|vitality|medical)\b/i, slugs: ['medicalAstrology', 'vedic', 'palmistry', 'western'] },
  { pattern: /\b(home|house|move|relocat|vastu|feng.?shui|where (should|to) live)\b/i, slugs: ['vastu', 'fengShui', 'astrocartography', 'vedic'] },
  { pattern: /\b(should i|decision|choose|which option|horary)\b/i, slugs: ['dailyDecisions', 'horary', 'tarot', 'iching'] },
  { pattern: /\b(who am i|identity|purpose|dharma|life path)\b/i, slugs: ['vedic', 'western', 'humanDesign', 'numerology'] },
  { pattern: /\b(when|timing|this year|this month|dasha|transit)\b/i, slugs: ['vedic', 'kp', 'western', 'horary'] },
  { pattern: /\b(palm|hand|mounts|life line)\b/i, slugs: ['palmistry', 'vedic', 'numerology'] },
  { pattern: /\b(face|physiognomy)\b/i, slugs: ['faceReading', 'vedic', 'numerology'] },
  { pattern: /\b(dream)\b/i, slugs: ['dreamSymbols', 'tarot', 'vedic'] },
  { pattern: /\b(angel number|repeating number|111|222|333|444|555)\b/i, slugs: ['angelNumbers', 'numerology', 'kabbalisticNumerology'] },
]

export function pickRelevantToolSlugs(
  question: string,
  readySlugs: readonly string[],
  options?: { deeper?: boolean },
): string[] {
  const ready = new Set(readySlugs)
  const picked: string[] = []
  const add = (slug: string) => {
    if (!ready.has(slug) || picked.includes(slug)) return
    picked.push(slug)
  }

  for (const topic of TOPIC_SLUGS) {
    if (topic.pattern.test(question)) {
      topic.slugs.forEach(add)
    }
  }

  if (picked.length === 0) {
    DEFAULT_MAIN_SEER_SLUGS.forEach(add)
    for (const slug of readySlugs) add(slug)
  }

  const limit = options?.deeper ? 8 : 4
  return picked.slice(0, limit)
}

export function buildIdentityDossier(profile: UserProfile | null | undefined): string {
  if (!profile) {
    return 'User identity: profile not loaded. If birth data is also missing, ask once for date, time, and place of birth.'
  }
  const firstName = (profile.displayName || profile.fullName || '').trim().split(/\s+/)[0] || ''
  const lines: string[] = ['User identity (already known — do not ask them to re-enter these):']
  if (profile.fullName?.trim()) lines.push(`- Full name: ${profile.fullName.trim()}`)
  else if (firstName) lines.push(`- Name: ${firstName}`)
  if (profile.birthDate) lines.push(`- Date of birth: ${profile.birthDate}`)
  if (profile.birthTime) lines.push(`- Time of birth: ${profile.birthTime}`)
  if (profile.birthPlace) lines.push(`- Place of birth: ${profile.birthPlace}`)
  if (profile.gender) lines.push(`- Gender: ${profile.gender}`)
  if (profile.currentLocation?.trim()) lines.push(`- Current residence: ${profile.currentLocation.trim()}`)
  lines.push(`- Face photo on file: ${profile.facePhotoUrl ? 'yes' : 'no'}`)
  lines.push(`- Palm photo on file: ${profile.palmPhotoUrl ? 'yes' : 'no'}`)
  lines.push(
    'Do not claim to see facial or palm features unless a stored faceReading or palmistry analysis is included below.',
  )
  return lines.join('\n')
}

export function formatSeerMasterForPrompt(master: Record<string, unknown> | null): string {
  if (!master || Object.keys(master).length === 0) {
    return 'Seer Master: not generated yet. Answer from identity and any tool slices provided. Do not invent a full 42-tool synthesis.'
  }
  const raw = JSON.stringify(master)
  const clipped = raw.length > MASTER_MAX_CHARS ? `${raw.slice(0, MASTER_MAX_CHARS)}…[truncated]` : raw
  return `Cross-tool Seer Master (compact synthesis of stored readings):\n${clipped}`
}

export function compactReportSlice(value: unknown, maxChars: number): string {
  try {
    const raw = JSON.stringify(value)
    if (raw.length <= maxChars) return raw
    return `${raw.slice(0, maxChars)}…[truncated]`
  } catch {
    return ''
  }
}

function resolveStoredReport(
  comprehensive: Record<string, unknown>,
  slug: string,
): Record<string, unknown> | null {
  const nested = comprehensive.toolReports as Record<string, { data?: unknown }> | undefined
  const val = comprehensive[slug] ?? nested?.[slug]?.data
  if (!val || typeof val !== 'object' || Array.isArray(val)) return null
  if (!isReadyToolReport(val, slug)) return null
  return val as Record<string, unknown>
}

export function formatReadyToolsIndex(
  readySlugs: readonly string[],
  pendingSlugs: readonly string[],
): string {
  return [
    `Stored reports ready (${readySlugs.length}/${ALL_TOOL_SLUGS.length}): ${readySlugs.join(', ') || 'none'}.`,
    pendingSlugs.length > 0
      ? `Not generated yet (user has not opened these tools): ${pendingSlugs.join(', ')}.`
      : 'All catalog tools have a stored report.',
    'Use only ready reports. Do not invent missing tools.',
  ].join('\n')
}

export interface MainSeerPackedContext {
  identityText: string
  seerMasterText: string
  readyIndexText: string
  reportSlicesText: string
  wantsDeep: boolean
  selectedSlugs: string[]
  readySlugs: string[]
}

export async function loadMainSeerContext(params: {
  userId: string
  question: string
  profile: UserProfile | null
}): Promise<MainSeerPackedContext> {
  const { userId, question, profile } = params
  const wantsDeep = wantsDeeperSeerAnswer(question)
  const comprehensive = ((await getDocument('comprehensiveMysticalProfiles', userId)) ||
    {}) as Record<string, unknown>
  const readiness = summarizeToolReadiness(comprehensive, ALL_TOOL_SLUGS)
  const readySlugs = ALL_TOOL_SLUGS.filter((slug) => !readiness.pendingToolSlugs.includes(slug))
  const selectedSlugs = pickRelevantToolSlugs(question, readySlugs, { deeper: wantsDeep })
  const sliceChars = wantsDeep ? SLICE_CHARS_DEEP : SLICE_CHARS_DEFAULT

  const slices = selectedSlugs
    .map((slug) => {
      const report = resolveStoredReport(comprehensive, slug)
      if (!report) return null
      const text = compactReportSlice(report, sliceChars)
      return text ? `### ${slug}\n${text}` : null
    })
    .filter((block): block is string => Boolean(block))

  let seerMaster = ((await getDocument('seerMaster', userId)) || null) as Record<string, unknown> | null
  if (!seerMaster || Object.keys(seerMaster).length === 0) {
    const nested = comprehensive.seerMaster
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      seerMaster = nested as Record<string, unknown>
    }
  }

  return {
    identityText: buildIdentityDossier(profile),
    seerMasterText: formatSeerMasterForPrompt(seerMaster),
    readyIndexText: formatReadyToolsIndex(readySlugs, readiness.pendingToolSlugs),
    reportSlicesText:
      slices.length > 0
        ? `Relevant stored reports for this question:\n${slices.join('\n\n')}`
        : 'No matching stored tool reports for this question yet.',
    wantsDeep,
    selectedSlugs,
    readySlugs,
  }
}
