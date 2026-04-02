/**
 * Deterministic, non-AI "special features" for Western charts (concise bullet-style facts).
 */

export interface PlanetLike {
  name: string
  longitude?: number
  degree?: number
  sign?: string | { signName: string }
  house?: number
  retrograde?: boolean
}

export interface HouseLike {
  number: number
  cusp: number
  sign?: string | { signName: string }
}

function signName(p: PlanetLike): string {
  if (typeof p.sign === 'string') return p.sign
  if (p.sign && typeof p.sign === 'object' && 'signName' in p.sign) return p.sign.signName
  return 'Unknown'
}

const RULERS: Record<string, string> = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Mercury',
  Libra: 'Venus',
  Scorpio: 'Mars',
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Saturn',
  Pisces: 'Jupiter',
}

/** Sun–Moon elongation in degrees [0, 360). */
export function getSunMoonElongationDeg(planets: PlanetLike[]): number | null {
  const sun = planets.find((p) => p.name === 'Sun')
  const moon = planets.find((p) => p.name === 'Moon')
  if (!sun || moon == null || typeof sun.longitude !== 'number' || typeof moon.longitude !== 'number') return null
  let diff = moon.longitude - sun.longitude
  diff = ((diff % 360) + 360) % 360
  return diff
}

/** Sun–Saturn + Uranus, Neptune, Pluto (10 bodies) — Cafe-style element / modality / polarity counts. */
export function elementModalityPolarityCounts(planets: PlanetLike[]): {
  masculine: number
  feminine: number
  fire: number
  earth: number
  air: number
  water: number
  cardinal: number
  fixed: number
  mutable: number
} {
  const want = new Set([
    'Sun',
    'Moon',
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune',
    'Pluto',
  ])
  const out = {
    masculine: 0,
    feminine: 0,
    fire: 0,
    earth: 0,
    air: 0,
    water: 0,
    cardinal: 0,
    fixed: 0,
    mutable: 0,
  }
  for (const p of planets) {
    if (!want.has(p.name)) continue
    const s = signName(p)
    if (MASCULINE_SIGNS.has(s)) out.masculine++
    else out.feminine++
    const el = ELEMENT_BY_SIGN[s]
    if (el === 'Fire') out.fire++
    else if (el === 'Earth') out.earth++
    else if (el === 'Air') out.air++
    else if (el === 'Water') out.water++
    const mod = modalityOfSign(s)
    if (mod === 'cardinal') out.cardinal++
    else if (mod === 'fixed') out.fixed++
    else if (mod === 'mutable') out.mutable++
  }
  return out
}

/**
 * Classic Part of Fortune (tropical ecliptic longitudes): day chart Asc + Moon − Sun; night Asc + Sun − Moon.
 * Day = Sun in houses 7–12 (above horizon); night = Sun in 1–6.
 */
export function partOfFortuneFromPlanets(planets: PlanetLike[]): {
  longitude: number
  sign: string
  degreeInSign: number
  isDayChart: boolean
} | null {
  const asc = planets.find((p) => p.name === 'Ascendant')
  const sun = planets.find((p) => p.name === 'Sun')
  const moon = planets.find((p) => p.name === 'Moon')
  if (!asc || !sun || !moon) return null
  const al = typeof asc.longitude === 'number' ? asc.longitude : null
  const sl = typeof sun.longitude === 'number' ? sun.longitude : null
  const ml = typeof moon.longitude === 'number' ? moon.longitude : null
  if (al == null || sl == null || ml == null) return null
  const sunH = sun.house
  const isDay = sunH != null && sunH >= 7 && sunH <= 12
  const lon = isDay ? normDeg(al + ml - sl) : normDeg(al + sl - ml)
  const signs = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
  ]
  const idx = Math.floor(lon / 30) % 12
  return {
    longitude: lon,
    sign: signs[idx] ?? 'Unknown',
    degreeInSign: lon % 30,
    isDayChart: isDay,
  }
}

/**
 * Relative aspect weight for display (not comparable to other sites' numeric scales).
 * Negative ≈ more friction; positive ≈ more ease.
 */
export function aspectHarmonyScore(aspectType: string, orb: number): number {
  const t = (aspectType || '').toLowerCase()
  const o = Number.isFinite(orb) ? orb : 5
  let base = 0
  if (t.includes('conjunction')) base = 40
  else if (t.includes('opposition')) base = -35
  else if (t.includes('square')) base = -45
  else if (t.includes('trine')) base = 45
  else if (t.includes('sextile')) base = 25
  else if (t.includes('quincunx')) base = -15
  else base = 5
  const orbPenalty = Math.min(30, o * 6)
  return Math.round(base - orbPenalty)
}

export function getMoonPhaseLabel(planets: PlanetLike[]): string {
  const elong = getSunMoonElongationDeg(planets)
  if (elong == null) return 'Moon phase could not be determined from chart data.'
  if (elong < 22.5 || elong >= 337.5) return 'The moon was a new moon'
  if (elong < 67.5) return 'The moon was a waxing crescent moon'
  if (elong < 112.5) return 'The moon was a first quarter moon'
  if (elong < 157.5) return 'The moon was a waxing gibbous moon'
  if (elong < 202.5) return 'The moon was a full moon'
  if (elong < 247.5) return 'The moon was a waning gibbous moon'
  if (elong < 292.5) return 'The moon was a last quarter moon'
  return 'The moon was a waning crescent moon'
}

const normDeg = (x: number) => ((x % 360) + 360) % 360

const MASCULINE_SIGNS = new Set(['Aries', 'Gemini', 'Leo', 'Libra', 'Sagittarius', 'Aquarius'])

const ELEMENT_BY_SIGN: Record<string, 'Fire' | 'Earth' | 'Air' | 'Water'> = {
  Aries: 'Fire',
  Leo: 'Fire',
  Sagittarius: 'Fire',
  Taurus: 'Earth',
  Virgo: 'Earth',
  Capricorn: 'Earth',
  Gemini: 'Air',
  Libra: 'Air',
  Aquarius: 'Air',
  Cancer: 'Water',
  Scorpio: 'Water',
  Pisces: 'Water',
}

function modalityOfSign(sign: string): 'cardinal' | 'fixed' | 'mutable' | null {
  if (['Aries', 'Cancer', 'Libra', 'Capricorn'].includes(sign)) return 'cardinal'
  if (['Taurus', 'Leo', 'Scorpio', 'Aquarius'].includes(sign)) return 'fixed'
  if (['Gemini', 'Virgo', 'Sagittarius', 'Pisces'].includes(sign)) return 'mutable'
  return null
}

/** Inner planets: Sun–Jupiter plus Ascendant and MC when present. */
export function getInnerPlanets(planets: PlanetLike[]): PlanetLike[] {
  const want = new Set([
    'Sun',
    'Moon',
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Ascendant',
    'MC',
    'Asc',
    'Midheaven',
  ])
  return planets.filter((p) => want.has(p.name))
}

export function dominantElementAmong(planets: PlanetLike[]): { element: string; count: number } {
  const counts: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 }
  for (const p of planets) {
    const s = signName(p)
    const el = ELEMENT_BY_SIGN[s]
    if (el) counts[el]++
  }
  const best = Object.entries(counts).reduce(
    (a, [el, c]) => (c > a.count ? { element: el, count: c } : a),
    { element: 'Fire', count: 0 }
  )
  return best
}

export function dominantModalityAmong(planets: PlanetLike[]): { modality: string; count: number } {
  const counts = { cardinal: 0, fixed: 0, mutable: 0 }
  for (const p of planets) {
    const m = modalityOfSign(signName(p))
    if (m) counts[m]++
  }
  const best = Object.entries(counts).reduce(
    (a, [k, c]) => (c > a.count ? { modality: k, count: c } : a),
    { modality: 'cardinal', count: 0 }
  )
  return best
}

function elementMissingAmong(planets: PlanetLike[], inner: PlanetLike[]): string | null {
  const present = new Set<string>()
  for (const p of inner) {
    const el = ELEMENT_BY_SIGN[signName(p)]
    if (el) present.add(el)
  }
  for (const el of ['Fire', 'Earth', 'Air', 'Water'] as const) {
    if (!present.has(el)) return el
  }
  return null
}

/** Hemispheres by house: houses 7–12 vs 1–6 (above vs below horizon in common wheels). */
export function hemisphereSplitByHouse(planets: PlanetLike[], inner: PlanetLike[]): {
  lower: number
  upper: number
  label: string
} {
  let lower = 0
  let upper = 0
  for (const p of inner) {
    const h = p.house
    if (h == null || Number.isNaN(h)) continue
    if (h >= 1 && h <= 6) lower++
    else if (h >= 7 && h <= 12) upper++
  }
  const label =
    lower > upper
      ? 'Most of the inner planets are below the horizon (houses 1–6)'
      : upper > lower
        ? 'Most of the inner planets are above the horizon (houses 7–12)'
        : 'Inner planets are balanced between above and below the horizon'
  return { lower, upper, label }
}

/**
 * Eastern vs western hemisphere using house numbers (10–12, 1–3 vs 4–9).
 */
export function eastWestHemisphereLabel(planets: PlanetLike[], inner: PlanetLike[]): string {
  let east = 0
  let west = 0
  for (const p of inner) {
    const h = p.house
    if (h == null) continue
    if ([10, 11, 12, 1, 2, 3].includes(h)) east++
    else if ([4, 5, 6, 7, 8, 9].includes(h)) west++
  }
  if (east > west) return 'Most inner planets lie in the eastern hemisphere (houses 10–3)'
  if (west > east) return 'Most inner planets lie in the western hemisphere (houses 4–9)'
  return 'Inner planets are balanced between eastern and western hemispheres'
}

/** Simplified bucket: one planet separated by a large gap along the zodiac from a tight cluster. */
export function getBucketShapeHint(planets: PlanetLike[]): string | null {
  const bodies = planets
    .filter((p) => p.name !== 'North Node' && p.name !== 'South Node')
    .map((p) => {
      const lon = typeof p.longitude === 'number' ? p.longitude : 0
      return { name: p.name, lon: ((lon % 360) + 360) % 360 }
    })
    .sort((a, b) => a.lon - b.lon)
  if (bodies.length < 6) return null

  let maxGap = 0
  let gapStartIdx = 0
  for (let i = 0; i < bodies.length; i++) {
    const next = (i + 1) % bodies.length
    const gap =
      next === 0
        ? 360 - bodies[i].lon + bodies[0].lon
        : bodies[next].lon - bodies[i].lon
    if (gap > maxGap) {
      maxGap = gap
      gapStartIdx = i
    }
  }
  if (maxGap < 120) return null
  const handle = bodies[(gapStartIdx + 1) % bodies.length]
  return `The chart suggests a Bucket shape, with ${handle.name} acting as the "handle" opposite a tight cluster`
}

export function rulershipBullet(planets: PlanetLike[]): string | null {
  const bits: string[] = []
  for (const p of planets) {
    const s = signName(p)
    const ruler = RULERS[s]
    if (ruler && ruler === p.name) {
      bits.push(`${p.name} in ${s}`)
    }
  }
  if (bits.length === 0) return null
  if (bits.length === 1) return `${bits[0]} is in its sign of rulership`
  return `${bits.slice(0, 3).join(' and ')} are in signs of their rulership`
}

export interface DerivedChartFacts {
  bullets: string[]
}

function mostCommonAspectBullet(aspects: { type: string }[]): string | null {
  if (!aspects?.length) return null
  const counts: Record<string, number> = {}
  for (const a of aspects) {
    const t = (a.type || 'unknown').toLowerCase()
    counts[t] = (counts[t] || 0) + 1
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const best = sorted[0]
  if (!best) return null
  const label = best[0].charAt(0).toUpperCase() + best[0].slice(1)
  return `The ${label} aspect occurs the most, a total of ${best[1]} times`
}

export function deriveChartFacts(chartData: {
  planets?: PlanetLike[]
  houses?: HouseLike[]
  aspects?: { type: string }[]
}): DerivedChartFacts {
  const planets = chartData.planets ?? []
  const aspects = chartData.aspects ?? []
  let inner = getInnerPlanets(planets)
  if (inner.length === 0) inner = planets.filter((p) =>
    ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter'].includes(p.name)
  )
  const bullets: string[] = []

  bullets.push(getMoonPhaseLabel(planets))

  const domEl = dominantElementAmong(inner.length ? inner : planets)
  bullets.push(
    `The ${domEl.element} element is strongest among inner-planet placements (${domEl.count} placements)`
  )

  const domMod = dominantModalityAmong(inner.length ? inner : planets)
  bullets.push(
    `The ${domMod.modality} mode is strongest among inner planets (${domMod.count} placements)`
  )

  const missing = elementMissingAmong(planets, inner.length ? inner : planets)
  if (missing) {
    bullets.push(`The inner planets do not fall in a ${missing} sign`)
  }

  const ew = eastWestHemisphereLabel(planets, inner.length ? inner : planets)
  bullets.push(ew)

  const hs = hemisphereSplitByHouse(planets, inner.length ? inner : planets)
  bullets.push(hs.label)

  const bucket = getBucketShapeHint(planets)
  if (bucket) bullets.push(bucket)

  const rule = rulershipBullet(planets)
  if (rule) bullets.push(rule)

  const aspectTop = mostCommonAspectBullet(aspects)
  if (aspectTop) bullets.push(aspectTop)

  return { bullets }
}
