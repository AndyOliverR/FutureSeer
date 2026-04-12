import type { ToolTeaserPayload } from '@/lib/report-viral/types'
import { buildWesternTeaser } from '@/lib/western/buildWesternTeaser'

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

const GENERIC_ARCHETYPES = [
  'Cycle Breaker',
  'Path Forger',
  'Quiet Storm',
  'Signal Weaver',
  'Threshold Walker',
]

const SNIPPET_MAX = 140
const MIN_PROSE_LEN = 12

/** Reject JSON-like blobs and tiny tokens so teaser lines stay human-readable. */
function isHumanSnippetText(s: string): boolean {
  const t = s.trim()
  if (t.length < MIN_PROSE_LEN) return false
  if (/^\s*[\[{]/.test(t)) return false
  if (/^\s*["']?\s*[\[{]/.test(t)) return false
  return true
}

function sliceSnippet(s: string): string {
  const t = s.trim()
  return t.length > SNIPPET_MAX ? `${t.slice(0, SNIPPET_MAX - 1)}…` : t
}

function walkFirstHumanString(obj: unknown, depth: number, maxDepth: number): string {
  if (depth > maxDepth || obj == null) return ''
  if (typeof obj === 'string') {
    return isHumanSnippetText(obj) ? sliceSnippet(obj) : ''
  }
  if (typeof obj !== 'object') return ''
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const s = walkFirstHumanString(item, depth + 1, maxDepth)
      if (s) return s
    }
    return ''
  }
  const record = obj as Record<string, unknown>
  const priorityKeys = [
    'summarySnapshot',
    'chartOverview',
    'chartSummary',
    'executiveSummary',
    'overview',
    'summary',
    'title',
    'headline',
    'description',
    'message',
    'primaryLine',
    'personalizedNote',
  ]
  for (const k of priorityKeys) {
    if (!(k in record)) continue
    const s = walkFirstHumanString(record[k], depth + 1, maxDepth)
    if (s) return s
  }
  for (const v of Object.values(record)) {
    const s = walkFirstHumanString(v, depth + 1, maxDepth)
    if (s) return s
  }
  return ''
}

/**
 * Short prose for teasers only — never returns JSON.stringify output (user-facing).
 */
function extractSnippet(report: unknown): string {
  if (report == null) return ''
  if (typeof report === 'string') {
    return isHumanSnippetText(report) ? sliceSnippet(report) : ''
  }
  if (typeof report !== 'object') {
    const raw = String(report).trim()
    return isHumanSnippetText(raw) ? sliceSnippet(raw) : ''
  }
  const r = report as Record<string, unknown>
  const data = (r.data && typeof r.data === 'object' ? r.data : null) as Record<string, unknown> | null
  const comp = r.comprehensiveAnalysis as Record<string, unknown> | undefined
  const candidates: unknown[] = [
    r.summary,
    r.overview,
    r.title,
    comp?.summarySnapshot,
    comp?.chartOverview,
    typeof comp?.chartSummary === 'string' ? comp.chartSummary : (comp?.chartSummary as { text?: string } | undefined)?.text,
    data?.summary,
    data?.overview,
  ]
  for (const c of candidates) {
    if (typeof c === 'string' && isHumanSnippetText(c)) return sliceSnippet(c)
  }
  const walked = walkFirstHumanString(r, 0, 4)
  if (walked) return walked
  if (data) {
    const fromData = walkFirstHumanString(data, 0, 3)
    if (fromData) return fromData
  }
  return ''
}

/**
 * Deterministic teaser for any tool; uses Western chart logic when data matches.
 */
export function buildToolTeaser(toolSlug: string, report: unknown): ToolTeaserPayload {
  if (toolSlug === 'western') {
    if (report && typeof report === 'object') {
      const o = report as Record<string, unknown>
      const chart = (o.chart ?? o) as { planets?: unknown[]; aspects?: unknown[] }
      if (chart?.planets && Array.isArray(chart.planets)) {
        return buildWesternTeaser(chart as never)
      }
    }
  }

  /** Question → chart flow; no Firestore pipeline. */
  if (toolSlug === 'horary') {
    if (report && typeof report === 'object') {
      const o = report as Record<string, unknown>
      const basic = o.basicInfo as { question?: string } | undefined
      const seer = o.seerState as { ascendantSign?: string; moonHouse?: number } | undefined
      const ans = o.answer as { answer?: string } | undefined
      const q = (basic?.question ?? '').trim()
      const asc = seer?.ascendantSign ?? 'Radical'
      const mh = seer?.moonHouse
      const seed = hashString(`${q}:${asc}`)
      const pct = 5 + (seed % 18)
      const hookLine =
        q.length > 0
          ? `Ascendant ${asc}${mh != null ? ` • Moon in house ${mh}` : ''} — your question maps to a top ${pct}% rarity band for this cast: ${q.slice(0, 72)}${q.length > 72 ? '…' : ''}`
          : `Ascendant ${asc} frames this horary moment in a top ${pct}% band for radical chart clarity.`
      return {
        archetypeName: 'Quest Witness',
        rarityLabel: `Top ${pct}%`,
        hookLine,
        subLine: 'Unlock the full chart, verdict, houses, timing, and guidance for this question.',
        patternName: ans?.answer != null && String(ans.answer).trim() !== '' ? String(ans.answer) : null,
      }
    }
  }

  if (toolSlug === 'astrocartography' && report && typeof report === 'object') {
    const o = report as Record<string, unknown>
    const comp = o.comprehensiveAnalysis as Record<string, unknown> | undefined
    const snap =
      typeof comp?.summarySnapshot === 'string'
        ? comp.summarySnapshot.trim()
        : typeof comp?.chartOverview === 'string'
          ? comp.chartOverview.trim()
          : extractSnippet(report)
    const seed = hashString(`astro:${snap.slice(0, 60)}`)
    const pct = 5 + (seed % 18)
    const hookLine =
      snap.length > 0
        ? `Astrocartography lines top ${pct}% — ${snap.slice(0, 100)}${snap.length > 100 ? '…' : ''}`
        : `Your astrocartography map sits in a top ${pct}% band for relocation and line clarity.`
    return {
      archetypeName: 'Horizon Mapper',
      rarityLabel: `Top ${pct}%`,
      hookLine,
      subLine: 'Unlock the full report to see every calculated line, timing note, and cross-reference tied to your profile.',
      patternName: null,
    }
  }

  if (toolSlug === 'mundaneAstrology' && report && typeof report === 'object') {
    const o = report as Record<string, unknown>
    const comp = o.comprehensiveAnalysis as Record<string, unknown> | undefined
    const overview =
      typeof comp?.chartOverview === 'string'
        ? comp.chartOverview.trim()
        : typeof comp?.summarySnapshot === 'string'
          ? comp.summarySnapshot.trim()
          : extractSnippet(report)
    const seed = hashString(`mundane:${overview.slice(0, 60)}`)
    const pct = 5 + (seed % 18)
    const hookLine =
      overview.length > 0
        ? `Mundane astrology top ${pct}% — ${overview.slice(0, 100)}${overview.length > 100 ? '…' : ''}`
        : `Your mundane astrology reading maps to a top ${pct}% band for ingress and world-pattern signal.`
    return {
      archetypeName: 'World Pattern Reader',
      rarityLabel: `Top ${pct}%`,
      hookLine,
      subLine: 'Unlock the full report to see every calculated line, timing note, and cross-reference tied to your profile.',
      patternName: null,
    }
  }

  if (toolSlug === 'tarot' && report && typeof report === 'object') {
    const o = report as Record<string, unknown>
    const data = (o.data ?? o) as Record<string, unknown>
    const profile = (data.profile ?? o.profile) as Record<string, unknown> | undefined
    const cardName = (key: string): string => {
      const block = profile?.[key] as Record<string, unknown> | undefined
      return typeof block?.name === 'string' ? block.name.trim() : ''
    }
    const birth = cardName('birthCard')
    const life = cardName('lifePathCard')
    const soul = cardName('soulCard')
    const personality = cardName('personalityCard')
    const bits = [birth && `Birth ${birth}`, life && `Life path ${life}`, soul && `Soul ${soul}`, personality && `Personality ${personality}`].filter(
      Boolean
    ) as string[]
    const joined = bits.join(' · ')
    const seed = hashString(`tarot:${joined}`)
    const pct = 5 + (seed % 18)
    const hookLine =
      bits.length > 0
        ? `Tarot birth archetypes top ${pct}% — ${joined.slice(0, 120)}${joined.length > 120 ? '…' : ''}`
        : `Your tarot profile maps to a top ${pct}% band for birth-card and path alignment.`
    return {
      archetypeName: 'Arcana Witness',
      rarityLabel: `Top ${pct}%`,
      hookLine,
      subLine: 'Unlock the full spread, interpretation, and guidance for this reading.',
      patternName: null,
    }
  }

  if (toolSlug === 'bibliomancy' && report && typeof report === 'object') {
    const o = report as Record<string, unknown>
    const interp = o.interpretations as Record<string, unknown> | undefined
    let first = ''
    if (interp && typeof interp === 'object') {
      for (const v of Object.values(interp)) {
        if (typeof v === 'string' && isHumanSnippetText(v)) {
          first = v.trim()
          break
        }
      }
    }
    if (!first) first = extractSnippet(report)
    const seed = hashString(`biblio:${first.slice(0, 60)}`)
    const pct = 5 + (seed % 18)
    const hookLine =
      first.length > 0
        ? `Bibliomancy top ${pct}% — ${first.slice(0, 100)}${first.length > 100 ? '…' : ''}`
        : `Your bibliomancy reading sits in a top ${pct}% band for poetic resonance.`
    return {
      archetypeName: 'Verse Seeker',
      rarityLabel: `Top ${pct}%`,
      hookLine,
      subLine: 'Unlock the full report to see every calculated line, timing note, and cross-reference tied to your profile.',
      patternName: null,
    }
  }

  /** Live session / coach flows (no pipeline report shape). */
  if (
    ['runes', 'pendulum', 'lenormand', 'geomancy', 'iching'].includes(toolSlug) &&
    report &&
    typeof report === 'object'
  ) {
    const o = report as Record<string, unknown>
    const qRaw = o.question ?? o.userQuestion ?? o.prompt
    const q = typeof qRaw === 'string' ? qRaw.trim() : ''
    const rawSnippet = extractSnippet(report)
    const snippet = isHumanSnippetText(rawSnippet) ? rawSnippet : ''
    const seed = hashString(`${toolSlug}:${q}:${snippet.slice(0, 60)}`)
    const pct = 5 + (seed % 18)
    const hookLine =
      q.length > 0
        ? `Your question anchors a top ${pct}% clarity band for this ${toolSlug} cast: ${q.slice(0, 72)}${q.length > 72 ? '…' : ''}`
        : snippet
          ? `This ${toolSlug} session maps to a top ${pct}% band—${snippet.slice(0, 80)}${snippet.length > 80 ? '…' : ''}`
          : `This ${toolSlug} cast sits in a top ${pct}% rarity band for symbolic signal strength.`
    return {
      archetypeName: 'Seeker',
      rarityLabel: `Top ${pct}%`,
      hookLine,
      subLine: 'Unlock the full spread, interpretation, and guidance for this reading.',
      patternName: null,
    }
  }

  /** Numerology subset: pipeline or client-shaped payloads */
  if (toolSlug === 'numerology' && report && typeof report === 'object') {
    const o = report as Record<string, unknown>
    const data = (o.data ?? o) as Record<string, unknown>
    const numbers = (data.numbers ?? o.numbers) as Record<string, number> | undefined
    const lp = numbers?.lifePath ?? numbers?.life_path
    const numSnip = extractSnippet(report)
    const seed = hashString(`numerology:${lp}:${numSnip}`)
    const pct = 5 + (seed % 18)
    const hookLine =
      typeof lp === 'number'
        ? numSnip.length > 0
          ? `Life Path ${lp} clusters in the top ${pct}% band for Chaldean profiles like yours — ${numSnip.slice(0, 72)}${numSnip.length > 72 ? '…' : ''}`
          : `Life Path ${lp} clusters in the top ${pct}% band for Chaldean profiles like yours.`
        : numSnip.length > 0
          ? `Your numerology signature maps to a top ${pct}% band — ${numSnip.slice(0, 80)}${numSnip.length > 80 ? '…' : ''}`
          : `Your Chaldean numerology reading sits in a top ${pct}% rarity band for this system.`
    return {
      archetypeName: 'Number Weaver',
      rarityLabel: `Top ${pct}%`,
      hookLine,
      subLine: 'Unlock the full report: planes, cycles, compatibility, remedies, and Ask the Seer.',
      patternName: null,
    }
  }

  if (toolSlug === 'angel-numbers' && report && typeof report === 'object') {
    const o = report as Record<string, unknown>
    const ag = o.angelicGuidance as { primaryMessage?: string } | undefined
    const primary = (ag?.primaryMessage ?? '').trim()
    const seed = hashString(`angel:${primary}:${o.lifePathAngel}`)
    const pct = 5 + (seed % 18)
    const hookLine =
      primary.length > 0
        ? `Angel guidance maps to a top ${pct}% resonance band: ${primary.slice(0, 100)}${primary.length > 100 ? '…' : ''}`
        : `Your angel numbers profile sits in a top ${pct}% rarity band for divine-number alignment.`
    return {
      archetypeName: 'Messenger',
      rarityLabel: `Top ${pct}%`,
      hookLine,
      subLine: 'Unlock the full analysis, lookup depth, and Ask the Seer.',
      patternName: null,
    }
  }

  if (
    (toolSlug === 'kabbalistic-numerology' || toolSlug === 'kabbalisticNumerology') &&
    report &&
    typeof report === 'object'
  ) {
    const o = report as Record<string, unknown>
    const overview = typeof o.overview === 'string' ? o.overview.trim() : ''
    const soul = o.soulNumber
    const seed = hashString(`kab:${soul}:${overview.slice(0, 40)}`)
    const pct = 5 + (seed % 18)
    const hookLine =
      overview.length > 0
        ? `Soul ${String(soul ?? '')} · top ${pct}% Kabbalistic clarity—${overview.slice(0, 90)}${overview.length > 90 ? '…' : ''}`
        : `Hebrew gematria maps your name to a top ${pct}% band for mystical number alignment.`
    return {
      archetypeName: 'Gematria Seeker',
      rarityLabel: `Top ${pct}%`,
      hookLine,
      subLine: 'Unlock gematria, soul/destiny/personality, Hebrew letters, and Ask the Seer.',
      patternName: null,
    }
  }

  if (toolSlug === 'palmistry' && report && typeof report === 'object') {
    const o = report as Record<string, unknown>
    const data = (o.data ?? o) as Record<string, unknown>
    const overall =
      typeof o.overallReading === 'string'
        ? o.overallReading.trim()
        : typeof data.overallReading === 'string'
          ? data.overallReading.trim()
          : ''
    const lifePath = typeof o.lifePath === 'string' ? o.lifePath.trim() : typeof data.lifePath === 'string' ? data.lifePath.trim() : ''
    const seed = hashString(`palm:${overall.slice(0, 40)}:${lifePath.slice(0, 20)}`)
    const pct = 5 + (seed % 18)
    const hookLine =
      overall.length > 0
        ? `Palm signature top ${pct}% — ${overall.slice(0, 100)}${overall.length > 100 ? '…' : ''}`
        : lifePath.length > 0
          ? `Life-path line insight maps to a top ${pct}% band: ${lifePath.slice(0, 90)}${lifePath.length > 90 ? '…' : ''}`
          : `Your palm reading clusters in a top ${pct}% band for line-and-mount clarity.`
    return {
      archetypeName: 'Line Reader',
      rarityLabel: `Top ${pct}%`,
      hookLine,
      subLine: 'Unlock mounts, timing, remedies, and Ask the Seer.',
      patternName: null,
    }
  }

  if (
    (toolSlug === 'dreamSymbols' || toolSlug === 'dream-symbols') &&
    report &&
    typeof report === 'object'
  ) {
    const o = report as Record<string, unknown>
    const theme = typeof o.overallTheme === 'string' ? o.overallTheme.trim() : ''
    const spiritual = typeof o.spiritualMessage === 'string' ? o.spiritualMessage.trim() : ''
    const seed = hashString(`dream:${theme.slice(0, 40)}:${spiritual.slice(0, 40)}`)
    const pct = 5 + (seed % 18)
    const hookLine =
      theme.length > 0
        ? `Dream theme top ${pct}% — ${theme.slice(0, 100)}${theme.length > 100 ? '…' : ''}`
        : spiritual.length > 0
          ? `Symbolic message in a top ${pct}% band: ${spiritual.slice(0, 90)}${spiritual.length > 90 ? '…' : ''}`
          : `Your dream interpretation maps to a top ${pct}% rarity band for subconscious signal.`
    return {
      archetypeName: 'Dream Walker',
      rarityLabel: `Top ${pct}%`,
      hookLine,
      subLine: 'Unlock symbols, meaning, guidance, archetypes, and Ask the Seer.',
      patternName: null,
    }
  }

  if (toolSlug === 'ziweiDouShu' && report && typeof report === 'object') {
    const o = report as Record<string, unknown>
    const exec = typeof o.executiveSummary === 'string' ? o.executiveSummary.trim() : ''
    const life = typeof o.lifePalace === 'string' ? o.lifePalace.trim() : ''
    const seed = hashString(`ziwei:${exec.slice(0, 40)}:${life.slice(0, 40)}`)
    const pct = 5 + (seed % 18)
    const hookLine =
      exec.length > 0
        ? `Zi Wei destiny top ${pct}% — ${exec.slice(0, 100)}${exec.length > 100 ? '…' : ''}`
        : life.length > 0
          ? `Life Palace (命宮) maps to a top ${pct}% band: ${life.slice(0, 90)}${life.length > 90 ? '…' : ''}`
          : `Your Purple Star chart clusters in a top ${pct}% band for palace clarity.`
    return {
      archetypeName: 'Palace Weaver',
      rarityLabel: `Top ${pct}%`,
      hookLine,
      subLine: 'Unlock the full astrolabe, palaces, luck cycles, and Ask the Seer.',
      patternName: null,
    }
  }

  if (toolSlug === 'bazi' && report && typeof report === 'object') {
    const o = report as Record<string, unknown>
    const chart = o.chart as Record<string, unknown> | undefined
    const dm = chart?.dayMaster as { name?: string; element?: string } | undefined
    const dmStr = dm?.name ? `${dm.name}${dm?.element ? ` (${dm.element})` : ''}` : ''
    const comp = o.comprehensiveAnalysis as { chartOverview?: string } | undefined
    const overview = typeof comp?.chartOverview === 'string' ? comp.chartOverview.trim() : ''
    const seed = hashString(`bazi:${dmStr}:${overview.slice(0, 40)}`)
    const pct = 5 + (seed % 18)
    const hookLine =
      overview.length > 0
        ? `Four Pillars top ${pct}% — ${overview.slice(0, 100)}${overview.length > 100 ? '…' : ''}`
        : dmStr.length > 0
          ? `Day Master ${dmStr} maps to a top ${pct}% band for BaZi resonance.`
          : `Your BaZi signature sits in a top ${pct}% rarity band for stem–branch clarity.`
    return {
      archetypeName: 'Pillar Bearer',
      rarityLabel: `Top ${pct}%`,
      hookLine,
      subLine: 'Unlock pillars, elements, luck cycles, comprehensive analysis, and Ask the Seer.',
      patternName: null,
    }
  }

  if (
    (toolSlug === 'fengShui' || toolSlug === 'feng-shui') &&
    report &&
    typeof report === 'object'
  ) {
    const o = report as Record<string, unknown>
    const reading = o.generalRecommendations as string[] | undefined
    const firstRec = Array.isArray(reading) && reading.length > 0 ? String(reading[0]).trim() : ''
    const kua = o.kua as { number?: number; element?: string } | undefined
    const kuaStr =
      kua?.number != null
        ? `Kua ${kua.number}${kua?.element ? ` · ${kua.element}` : ''}`
        : ''
    const seed = hashString(`fs:${kuaStr}:${firstRec.slice(0, 40)}`)
    const pct = 5 + (seed % 18)
    const hookLine =
      firstRec.length > 0
        ? `Feng Shui flow top ${pct}% — ${firstRec.slice(0, 100)}${firstRec.length > 100 ? '…' : ''}`
        : kuaStr.length > 0
          ? `${kuaStr} maps to a top ${pct}% band for directional harmony.`
          : `Your space-energy profile sits in a top ${pct}% band for classical alignment.`
    return {
      archetypeName: 'Qi Harmonizer',
      rarityLabel: `Top ${pct}%`,
      hookLine,
      subLine: 'Unlock Bagua, room guidance, cures, quick fixes, full report, and Ask the Seer.',
      patternName: null,
    }
  }

  if (toolSlug === 'vedic' && report && typeof report === 'object') {
    const o = report as Record<string, unknown>
    const comp = o.comprehensiveAnalysis as Record<string, unknown> | undefined
    const chartOv =
      typeof comp?.chartOverview === 'string'
        ? comp.chartOverview.trim()
        : typeof o.chartOverview === 'string'
          ? o.chartOverview.trim()
          : ''
    const pa = comp?.planetaryAnalysis ?? o.planetaryAnalysis
    let firstPlanet = ''
    if (Array.isArray(pa) && pa.length > 0) {
      const x = pa[0] as Record<string, unknown>
      firstPlanet = typeof x?.analysis === 'string' ? x.analysis.trim().slice(0, 80) : ''
    }
    const seed = hashString(`vedic:${chartOv.slice(0, 40)}:${firstPlanet.slice(0, 30)}`)
    const pct = 5 + (seed % 18)
    const hookLine =
      chartOv.length > 0
        ? `Sidereal chart top ${pct}% — ${chartOv.slice(0, 100)}${chartOv.length > 100 ? '…' : ''}`
        : firstPlanet.length > 0
          ? `Jyotish insight maps to a top ${pct}% band: ${firstPlanet}${firstPlanet.length >= 80 ? '…' : ''}`
          : `Your Vedic signature sits in a top ${pct}% band for graha-house clarity.`
    return {
      archetypeName: 'Graha Witness',
      rarityLabel: `Top ${pct}%`,
      hookLine,
      subLine: 'Unlock charts, dasha, remedies, Gotra, and Ask the Seer.',
      patternName: null,
    }
  }

  if (toolSlug === 'dailyDecisions' && report && typeof report === 'object') {
    const o = report as Record<string, unknown>
    const panch = o.panchangaSummary as { vara?: string; nakshatra?: string } | undefined
    const recs = o.recommendations as Record<string, { personalizedNote?: string }> | undefined
    const lend = recs?.lendMoney?.personalizedNote?.trim() ?? ''
    const vara = panch?.vara?.trim() ?? ''
    const seed = hashString(`dd:${vara}:${lend.slice(0, 40)}`)
    const pct = 5 + (seed % 18)
    const hookLine =
      lend.length > 0
        ? `Daily muhurta top ${pct}% — ${lend.slice(0, 100)}${lend.length > 100 ? '…' : ''}`
        : vara.length > 0
          ? `${vara} window maps to a top ${pct}% band for lending, travel, and grooming timing.`
          : `Your panchanga-aligned day sits in a top ${pct}% band for practical decisions.`
    return {
      archetypeName: 'Muhurta Guide',
      rarityLabel: `Top ${pct}%`,
      hookLine,
      subLine: 'Unlock full recommendations, avoidance windows, and Ask the Seer.',
      patternName: null,
    }
  }

  if (toolSlug === 'kp' && report && typeof report === 'object') {
    const o = report as Record<string, unknown>
    const bi = o.basicInfo as { ascendant?: string; moonSign?: string } | undefined
    const ta = o.timingAnalysis as { summary?: string } | Record<string, unknown> | undefined
    const summary =
      ta && typeof ta === 'object' && 'summary' in ta && typeof (ta as { summary?: string }).summary === 'string'
        ? String((ta as { summary: string }).summary).trim()
        : ''
    const asc = bi?.ascendant?.trim() ?? ''
    const seed = hashString(`kp:${asc}:${summary.slice(0, 40)}`)
    const pct = 5 + (seed % 18)
    const hookLine =
      summary.length > 0
        ? `KP sublord top ${pct}% — ${summary.slice(0, 100)}${summary.length > 100 ? '…' : ''}`
        : asc.length > 0
          ? `Ascendant ${asc} frames a top ${pct}% band for Krishnamurti cusp clarity.`
          : `Your KP chart maps to a top ${pct}% band for sublord timing.`
    return {
      archetypeName: 'Cusp Navigator',
      rarityLabel: `Top ${pct}%`,
      hookLine,
      subLine: 'Unlock charts, dasha, transits, remedies, and Ask the Seer.',
      patternName: null,
    }
  }

  if (toolSlug === 'vastu' && report && typeof report === 'object') {
    const o = report as Record<string, unknown>
    const score = o.overallScore
    const pers = o.personality as { lifePath?: string } | undefined
    const life = typeof pers?.lifePath === 'string' ? pers.lifePath.trim() : ''
    const pi = o.personalizedInsights as { personalizedRecommendations?: string[] } | undefined
    const first =
      Array.isArray(pi?.personalizedRecommendations) && pi.personalizedRecommendations.length > 0
        ? String(pi.personalizedRecommendations[0]).trim()
        : ''
    const seed = hashString(`vastu:${String(score)}:${life.slice(0, 40)}`)
    const pct = 5 + (seed % 18)
    const hookLine =
      first.length > 0
        ? `Vastu harmony top ${pct}% — ${first.slice(0, 100)}${first.length > 100 ? '…' : ''}`
        : life.length > 0
          ? `Space-energy profile top ${pct}% — ${life.slice(0, 90)}${life.length > 90 ? '…' : ''}`
          : typeof score === 'number'
            ? `Overall score ${score}% maps to a top ${pct}% band for directional balance.`
            : `Your Vastu layout sits in a top ${pct}% band for classical alignment.`
    return {
      archetypeName: 'Mandala Keeper',
      rarityLabel: `Top ${pct}%`,
      hookLine,
      subLine: 'Unlock zones, remedies, timing, construction, and Ask the Seer.',
      patternName: null,
    }
  }

  if (toolSlug === 'trichakra' && report && typeof report === 'object') {
    const o = report as Record<string, unknown>
    const remedies = o.remedies as
      | { body?: unknown[]; mind?: unknown[]; soul?: unknown[] }
      | undefined
    const nb = remedies?.body?.length ?? 0
    const nm = remedies?.mind?.length ?? 0
    const ns = remedies?.soul?.length ?? 0
    const actionPlan = o.actionPlan as { immediate?: { title?: string; description?: string }[] } | undefined
    const firstImm = actionPlan?.immediate?.[0]
    const immTitle = typeof firstImm?.title === 'string' ? firstImm.title.trim() : ''
    const immDesc = typeof firstImm?.description === 'string' ? firstImm.description.trim() : ''
    const seed = hashString(`trichakra:${nb}:${nm}:${ns}:${immTitle.slice(0, 30)}`)
    const pct = 5 + (seed % 18)
    const hookLine =
      immTitle.length > 0
        ? `Trichakra remedial stack top ${pct}% — next: ${immTitle.slice(0, 72)}${immTitle.length > 72 ? '…' : ''}${immDesc ? ` — ${immDesc.slice(0, 48)}${immDesc.length > 48 ? '…' : ''}` : ''}`
        : nb + nm + ns > 0
          ? `Body / Mind / Soul remedies: ${nb} / ${nm} / ${ns} — top ${pct}% band for integrated corrective work.`
          : `Your Trichakra synthesis maps to a top ${pct}% band for body–mind–soul alignment.`
    return {
      archetypeName: 'Remedy Weaver',
      rarityLabel: `Top ${pct}%`,
      hookLine,
      subLine: 'Unlock overview, body, mind, soul layers, and Ask the Seer.',
      patternName: null,
    }
  }

  if (toolSlug === 'navaratna' && report && typeof report === 'object') {
    const o = report as Record<string, unknown>
    const data = (o.data ?? o) as Record<string, unknown>
    const chartSummary = (data.chartSummary ?? o.chartSummary) as
      | { ascendant?: { sign?: string }; lagnesh?: string }
      | undefined
    const asc = typeof chartSummary?.ascendant?.sign === 'string' ? chartSummary.ascendant.sign.trim() : ''
    const lag = typeof chartSummary?.lagnesh === 'string' ? chartSummary.lagnesh.trim() : ''
    const rec = (data.recommendations ?? o.recommendations) as
      | { lifeStone?: { gemstone?: { english?: string } } }
      | undefined
    const life =
      typeof rec?.lifeStone?.gemstone?.english === 'string' ? rec.lifeStone.gemstone.english.trim() : ''
    const seed = hashString(`navaratna:${asc}:${lag}:${life.slice(0, 20)}`)
    const pct = 5 + (seed % 18)
    const hookLine =
      life.length > 0
        ? `Life stone ${life} — top ${pct}% band${asc ? ` for ${asc} rising` : ''}${lag ? ` • Lagnesh ${lag}` : ''}.`
        : asc.length > 0
          ? `Ascendant ${asc}${lag ? ` • Lagnesh ${lag}` : ''} — Navaratna profile in the top ${pct}% band for gem correspondence.`
          : `Your Navaratna chart maps to a top ${pct}% band for planetary stone guidance.`
    return {
      archetypeName: 'Gem Harmonist',
      rarityLabel: `Top ${pct}%`,
      hookLine,
      subLine: 'Unlock chart analysis, recommendations, safety notes, and Ask the Seer.',
      patternName: null,
    }
  }

  if (toolSlug === 'humanDesign' && report && typeof report === 'object') {
    const o = report as Record<string, unknown>
    const chart = (o.chart ?? o) as Record<string, unknown> | undefined
    const rep = (o.report ?? o) as Record<string, unknown> | undefined
    const typeName =
      chart && typeof chart.type === 'object' && chart.type
        ? String((chart.type as { name?: string }).name ?? '').trim()
        : ''
    const strategy = typeof chart?.strategy === 'string' ? chart.strategy.trim() : ''
    const authName =
      chart && typeof chart.authority === 'object' && chart.authority
        ? String((chart.authority as { name?: string }).name ?? '').trim()
        : ''
    const overview = rep?.overview as { summary?: string; keyInsights?: string[] } | undefined
    const summary = typeof overview?.summary === 'string' ? overview.summary.trim() : ''
    const firstInsight =
      Array.isArray(overview?.keyInsights) && overview.keyInsights.length > 0
        ? String(overview.keyInsights[0]).trim()
        : ''
    const seed = hashString(`hd:${typeName}:${strategy}:${authName}`)
    const pct = 5 + (seed % 18)
    const hookLine =
      summary.length > 0
        ? `Human Design top ${pct}% — ${summary.slice(0, 100)}${summary.length > 100 ? '…' : ''}`
        : firstInsight.length > 0
          ? `${typeName || 'Your design'} — top ${pct}%: ${firstInsight.slice(0, 90)}${firstInsight.length > 90 ? '…' : ''}`
          : typeName.length > 0
            ? `Type ${typeName}${strategy ? ` • ${strategy}` : ''}${authName ? ` • ${authName} authority` : ''} — top ${pct}% band for HD synthesis.`
            : `Your Human Design blueprint maps to a top ${pct}% band for type and authority clarity.`
    return {
      archetypeName: 'Blueprint Cartographer',
      rarityLabel: `Top ${pct}%`,
      hookLine,
      subLine: 'Unlock BodyGraph, centers, gates, profile, cross, full report, and Ask the Seer.',
      patternName: null,
    }
  }

  if (toolSlug === 'energyHealing' && report && typeof report === 'object') {
    const o = report as Record<string, unknown>
    const raw = (o.data && typeof o.data === 'object' ? o.data : o) as Record<string, unknown>
    if (raw.placeholder === true) {
      /* fall through to generic */
    } else {
      const chakra = raw.chakra as Record<string, unknown> | undefined
      let balance: number | undefined
      if (chakra && typeof chakra === 'object') {
        const ob = chakra.overallBalance ?? chakra.overall_balance
        if (typeof ob === 'number') balance = ob
      }
      if (balance === undefined) {
        const ob = raw.overallBalance ?? raw.overall_balance
        if (typeof ob === 'number') balance = ob
      }
      const aura = raw.aura as { summary?: string; interpretation?: string } | undefined
      const auraSnippet =
        typeof aura?.summary === 'string'
          ? aura.summary.trim()
          : typeof aura?.interpretation === 'string'
            ? aura.interpretation.trim()
            : ''
      const seed = hashString(`eh:${String(balance)}:${auraSnippet.slice(0, 40)}`)
      const pct = 5 + (seed % 18)
      const hookLine =
        typeof balance === 'number'
          ? `Energy signature top ${pct}% — overall balance ~${balance}%${auraSnippet ? ` — ${auraSnippet.slice(0, 72)}${auraSnippet.length > 72 ? '…' : ''}` : ''}`
          : auraSnippet.length > 0
            ? `Aura / energy top ${pct}% — ${auraSnippet.slice(0, 100)}${auraSnippet.length > 100 ? '…' : ''}`
            : `Your energy profile maps to a top ${pct}% band for chakra and field work.`
      return {
        archetypeName: 'Field Weaver',
        rarityLabel: `Top ${pct}%`,
        hookLine,
        subLine: 'Unlock chakra, aura, reiki, crystal, energy balance, and Ask the Seer.',
        patternName: null,
      }
    }
  }

  if (toolSlug === 'faceReading' && report && typeof report === 'object') {
    const o = report as Record<string, unknown>
    const overall = typeof o.overallReading === 'string' ? o.overallReading.trim() : ''
    const shape = typeof o.faceShape === 'string' ? o.faceShape.trim() : ''
    const seed = hashString(`face:${shape}:${overall.slice(0, 40)}`)
    const pct = 5 + (seed % 18)
    const hookLine =
      overall.length > 0
        ? `Face reading top ${pct}% — ${overall.slice(0, 100)}${overall.length > 100 ? '…' : ''}`
        : shape
          ? `${shape} profile maps to a top ${pct}% band for physiognomy resonance.`
          : `Your face reading sits in a top ${pct}% rarity band for feature clarity.`
    return {
      archetypeName: 'Visage Witness',
      rarityLabel: `Top ${pct}%`,
      hookLine,
      subLine: 'Unlock features, personality, destiny, and Ask the Seer.',
      patternName: null,
    }
  }

  if (toolSlug === 'nameAnalysis' && report && typeof report === 'object') {
    const o = report as Record<string, unknown>
    const name = typeof o.fullName === 'string' ? o.fullName.trim() : ''
    const summary = extractSnippet(report)
    const seed = hashString(`name:${name}:${summary.slice(0, 40)}`)
    const pct = 5 + (seed % 18)
    const hookLine =
      summary.length > 0
        ? `Name vibration top ${pct}% — ${summary.slice(0, 100)}${summary.length > 100 ? '…' : ''}`
        : name
          ? `“${name.slice(0, 40)}${name.length > 40 ? '…' : ''}” maps to a top ${pct}% band for name-number resonance.`
          : `Your name analysis sits in a top ${pct}% rarity band for vibrational clarity.`
    return {
      archetypeName: 'Name Bearer',
      rarityLabel: `Top ${pct}%`,
      hookLine,
      subLine: 'Unlock personality, vibrations, purpose, compatibility, and Ask the Seer.',
      patternName: null,
    }
  }

  const seed = hashString(`${toolSlug}:${extractSnippet(report)}`)
  const pct = 5 + (seed % 18)
  const archetype = GENERIC_ARCHETYPES[seed % GENERIC_ARCHETYPES.length]
  const snippet = extractSnippet(report)
  const hookLine = snippet
    ? `Your ${toolSlug.replace(/([A-Z])/g, ' $1').trim()} signature clusters in the top ${pct}% of profiles we compare—${snippet.slice(0, 80)}${snippet.length > 80 ? '…' : ''}`
    : `Your ${toolSlug} reading maps to a top ${pct}% rarity band for this system’s typical outputs.`
  const subLine = 'Unlock the full report to see every calculated line, timing note, and cross-reference tied to your profile.'

  return {
    archetypeName: archetype,
    rarityLabel: `Top ${pct}%`,
    hookLine,
    subLine,
    patternName: null,
  }
}
