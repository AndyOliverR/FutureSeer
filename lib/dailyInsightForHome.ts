import type { ComprehensiveMysticalProfile } from '@/contexts/MysticalProfileContext'

export type DailyInsightCardData = {
  headline: string
  summary: string
  accentLabel: string
  luckyColor: string
  luckyNumber: number
  rulingPlanet: string
  moonSign: string | null
  ctaHref: string
  ctaLabel: string
}

const DAY_RULERS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as const

const RULER_COLORS: Record<string, string> = {
  Sun: 'Gold',
  Moon: 'Silver white',
  Mars: 'Coral red',
  Mercury: 'Emerald green',
  Jupiter: 'Saffron yellow',
  Venus: 'Rose pink',
  Saturn: 'Deep blue',
}

const RULER_FOCUS: Record<string, string> = {
  Sun: 'lead with clarity and steady confidence',
  Moon: 'honor intuition and emotional rhythm',
  Mars: 'act with courage but avoid impulsive friction',
  Mercury: 'communicate precisely and learn something small',
  Jupiter: 'expand wisely—teach, mentor, or study',
  Venus: 'cultivate harmony in relationships and aesthetics',
  Saturn: 'build discipline; slow progress still counts',
}

function extractMoonSign(profile: ComprehensiveMysticalProfile | null): string | null {
  if (!profile) return null
  const planets = profile.vedic?.planets
  if (Array.isArray(planets)) {
    for (const p of planets) {
      const rec = p as Record<string, unknown>
      const name = String(rec.name ?? rec.planet ?? '').toLowerCase()
      if (name === 'moon' && rec.sign) return String(rec.sign)
    }
  }
  const western = profile.western as { moonSign?: string; planets?: Array<{ name?: string; sign?: string }> } | undefined
  if (western?.moonSign) return western.moonSign
  if (Array.isArray(western?.planets)) {
    const moon = western.planets.find((p) => String(p.name ?? '').toLowerCase() === 'moon')
    if (moon?.sign) return moon.sign
  }
  return null
}

function pickPersonalLine(profile: ComprehensiveMysticalProfile | null): string | null {
  if (!profile) return null
  const strength = profile.interpretations?.personality?.strengths?.[0]
  if (typeof strength === 'string' && strength.trim()) return strength.trim()
  const overview = profile.interpretations?.personality?.overview
  if (typeof overview === 'string' && overview.trim()) {
    const first = overview.split(/[.!?]/).find((s) => s.trim().length > 20)
    return first ? `${first.trim()}.` : overview.trim().slice(0, 140)
  }
  const dashaPlanet = profile.vedic?.currentDasha?.planet
  if (typeof dashaPlanet === 'string' && dashaPlanet.trim()) {
    return `Your current dasha highlights ${dashaPlanet}—let that theme guide one intentional choice today.`
  }
  return null
}

function stableLuckyNumber(seed: string, date: Date): number {
  let h = 0
  const blob = `${seed}:${date.toISOString().slice(0, 10)}`
  for (let i = 0; i < blob.length; i++) h = (h * 31 + blob.charCodeAt(i)) % 997
  return (h % 9) + 1
}

/**
 * Lightweight, deterministic daily card for home — no extra LLM call.
 * Grounds copy in profile when available (moon sign, strengths, dasha).
 */
export function buildDailyInsightCardData(
  profile: ComprehensiveMysticalProfile | null,
  displayName?: string | null,
  now: Date = new Date(),
): DailyInsightCardData {
  const rulingPlanet = DAY_RULERS[now.getDay()]
  const moonSign = extractMoonSign(profile)
  const personal = pickPersonalLine(profile)
  const firstName = displayName?.trim().split(/\s+/)[0]
  const headline = firstName ? `Today for ${firstName}` : 'Your day at a glance'

  const rulerFocus = RULER_FOCUS[rulingPlanet] ?? 'move with intention'
  const moonBit = moonSign ? ` With Moon in ${moonSign}, lean into what feels emotionally true.` : ''
  const summary =
    personal ??
    `${rulingPlanet} rules this day—${rulerFocus}.${moonBit} Open FutureSeer when you want chart-grounded detail.`

  const hasProfile = Boolean(profile && profile.metadata?.generatedAt)
  return {
    headline,
    summary: summary.length > 220 ? `${summary.slice(0, 217)}…` : summary,
    accentLabel: `${rulingPlanet} day`,
    luckyColor: RULER_COLORS[rulingPlanet] ?? 'Gold',
    luckyNumber: stableLuckyNumber(profile?.userId ?? displayName ?? 'guest', now),
    rulingPlanet,
    moonSign,
    ctaHref: hasProfile ? '/tools' : '/profile',
    ctaLabel: hasProfile ? 'Open Occult / Divination tools' : 'Complete your profile',
  }
}
