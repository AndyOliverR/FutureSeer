import { calculateLifePathNumber } from '@/lib/numerologyCalculations'

const LIFE_PATH_BLURBS: Record<number, string> = {
  1: 'Leadership, initiative, and forging your own path.',
  2: 'Partnership, patience, and diplomatic strength.',
  3: 'Expression, creativity, and social warmth.',
  4: 'Structure, discipline, and building lasting foundations.',
  5: 'Freedom, change, and experiential learning.',
  6: 'Care, responsibility, and nurturing others.',
  7: 'Analysis, solitude, and inner study.',
  8: 'Authority, material mastery, and strategic ambition.',
  9: 'Compassion, completion, and wide humanitarian themes.',
}

/** Pure helper for the public life-path calculator (YYYY-MM-DD). */
export function lifePathFromIsoDate(isoDate: string): { number: number; blurb: string } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null
  const [y, m, d] = isoDate.split('-').map(Number)
  if (!y || !m || !d || m < 1 || m > 12 || d < 1 || d > 31) return null
  const number = calculateLifePathNumber(isoDate)
  return { number, blurb: LIFE_PATH_BLURBS[number] ?? 'Explore your full numerology report in FutureSeer.' }
}

export type AngelNumberMeaning = {
  sequence: string
  title: string
  meaning: string
}

export const COMMON_ANGEL_NUMBERS: AngelNumberMeaning[] = [
  {
    sequence: '111',
    title: 'Alignment',
    meaning: 'A nudge to notice thoughts becoming form—clarify intention before you act.',
  },
  {
    sequence: '222',
    title: 'Balance',
    meaning: 'Partnership and patience; trust timing rather than forcing outcomes.',
  },
  {
    sequence: '333',
    title: 'Support',
    meaning: 'Creative and collaborative energy; ask for help and share your voice.',
  },
  {
    sequence: '444',
    title: 'Foundation',
    meaning: 'Stability and protection themes—reinforce habits that keep you grounded.',
  },
  {
    sequence: '555',
    title: 'Change',
    meaning: 'Transition is underway; stay flexible and release what no longer fits.',
  },
  {
    sequence: '666',
    title: 'Recenter',
    meaning: 'Rebalance material and emotional focus; return to what truly matters.',
  },
  {
    sequence: '777',
    title: 'Insight',
    meaning: 'Study, intuition, and spiritual curiosity—follow the quiet knowing.',
  },
  {
    sequence: '888',
    title: 'Flow',
    meaning: 'Cycles of resource and responsibility; steward gains with integrity.',
  },
  {
    sequence: '999',
    title: 'Completion',
    meaning: 'A chapter closing; integrate lessons before the next beginning.',
  },
  {
    sequence: '000',
    title: 'Wholeness',
    meaning: 'Reset and infinite potential—begin again with a clear center.',
  },
]

export function lookupAngelNumber(raw: string): AngelNumberMeaning | null {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return null
  const exact = COMMON_ANGEL_NUMBERS.find((n) => n.sequence === digits)
  if (exact) return exact
  // Collapse repeating single digit e.g. 1111 -> treat as 111 family when all same
  if (/^(\d)\1+$/.test(digits) && digits.length >= 3) {
    const base = digits.slice(0, 3)
    return COMMON_ANGEL_NUMBERS.find((n) => n.sequence === base) ?? null
  }
  return null
}
