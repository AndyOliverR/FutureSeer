import { detectChartPatterns, type AspectPattern } from '@/lib/western/chartPatternDetection'
import type { PlanetLike } from '@/lib/western/chartDerivedFacts'

export interface WesternTeaserPayload {
  archetypeName: string
  rarityLabel: string
  hookLine: string
  subLine: string
  patternName: string | null
}

const ARCHETYPES = [
  'Cycle Breaker',
  'Path Forger',
  'Quiet Storm',
  'Cosmic Anchor',
  'Signal Weaver',
  'Threshold Walker',
]

function patternToArchetype(patterns: AspectPattern[], seed: number): { archetype: string; patternName: string | null } {
  if (patterns.length === 0) {
    return { archetype: ARCHETYPES[seed % ARCHETYPES.length], patternName: null }
  }
  const top = patterns[0]
  const name = top.name
  if (top.type === 'grand-trine') return { archetype: 'Harmonic Triad', patternName: name }
  if (top.type === 't-square') return { archetype: 'Tension Alchemist', patternName: name }
  if (top.type === 'stellium') return { archetype: 'Concentration Core', patternName: name }
  if (top.type === 'grand-cross') return { archetype: 'Crossroads', patternName: name }
  if (top.type === 'yod') return { archetype: 'Finger of Fate', patternName: name }
  return { archetype: ARCHETYPES[seed % ARCHETYPES.length], patternName: name }
}

function signName(p: PlanetLike): string {
  if (typeof p.sign === 'string') return p.sign
  if (p.sign && typeof p.sign === 'object' && 'signName' in p.sign) return p.sign.signName
  return 'Unknown'
}

/** Deterministic pseudo-rarity from chart fingerprints (feels personal, not generic). */
function computeRarityPercent(planets: PlanetLike[], aspects: { orb?: number }[]): number {
  let h = 0
  for (const p of planets.slice(0, 12)) {
    h = (h * 31 + Math.round(p.longitude * 100)) % 997
  }
  h = (h + aspects.length * 17) % 997
  const tight = aspects.filter((a) => typeof a.orb === 'number' && a.orb <= 1).length
  h = (h + tight * 41) % 997
  return 5 + (h % 18)
}

export function buildWesternTeaser(chartData: {
  planets?: PlanetLike[]
  aspects?: { planet1: string; planet2: string; type: string; orb: number }[]
}): WesternTeaserPayload {
  const planets = chartData.planets ?? []
  const aspects = chartData.aspects ?? []
  const patterns = detectChartPatterns(planets as never, aspects as never)

  const sun = planets.find((p) => p.name === 'Sun')
  const moon = planets.find((p) => p.name === 'Moon')
  const sunS = sun ? signName(sun) : 'Unknown'
  const moonS = moon ? signName(moon) : 'Unknown'

  const seedSeed =
    (sun?.longitude ?? 0) * 1.1 + (moon?.longitude ?? 0) * 1.7 + aspects.length * 3
  const seed = Math.floor(Math.abs(seedSeed)) % 1000

  const { archetype, patternName } = patternToArchetype(patterns, seed)
  const pct = computeRarityPercent(planets, aspects)

  const hookLine = patternName
    ? `Your chart carries ${patternName.split('(')[0].trim()}—a configuration that shows up in roughly the top ${pct}% of natal maps we analyze.`
    : `Your ${sunS} Sun paired with ${moonS} Moon sits in a rare ${pct}% cluster for intensity of fixed-sign emphasis.`

  const subLine = moon
    ? `Moon in ${moonS} tunes your emotional baseline; the full report maps how that collides with your angles and transits.`
    : `The full report maps every major aspect and house story tied to your birth moment.`

  return {
    archetypeName: archetype,
    rarityLabel: `Top ${pct}%`,
    hookLine,
    subLine,
    patternName,
  }
}
