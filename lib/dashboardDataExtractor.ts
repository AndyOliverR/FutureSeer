// Dashboard Data Extractor
// Extracts key insights from comprehensive mystical profile for dashboard snippets

import type { ComprehensiveMysticalProfile } from '@/hooks/useComprehensiveMysticalProfile'
import type { ToolSnippetCardProps } from '@/components/dashboard/ToolSnippetCard'
import { toolManager } from '@/lib/services/toolManager'

/** Use toolManager icon when slug exists; otherwise fallback so dashboard matches tools page. */
function getToolIcon(slug: string, fallback: string): string {
  return toolManager.getTool(slug)?.icon ?? fallback
}

// Extended profile type to include all possible tool data
export interface ExtendedMysticalProfile extends ComprehensiveMysticalProfile {
  western?: any
  numerology?: any
  tarot?: any
  iching?: any
  geomancy?: any
  angelNumbers?: any
  nameAnalysis?: any
  [key: string]: any // Allow additional tool data
}

export interface ToolSnippet {
  toolName: string
  toolSlug: string
  icon: string
  metric: string | number
  metricLabel?: string
  insight: string
  href: string
  colorScheme: ToolSnippetCardProps['colorScheme']
  priority: number
}

/** Discovery snippets: fixed cards for tools without cached data. Shown after data-driven snippets. */
function getDiscoverySnippets(): ToolSnippet[] {
  return [
    {
      toolName: 'I Ching',
      toolSlug: 'iching',
      icon: getToolIcon('i-ching', '☯️'),
      metric: 'Explore',
      metricLabel: 'Guidance',
      insight: 'Ancient wisdom for your current path and decisions.',
      href: '/tools/iching',
      colorScheme: 'green',
      priority: 10
    },
    {
      toolName: 'Geomancy',
      toolSlug: 'geomancy',
      icon: getToolIcon('geomancy', '🌍'),
      metric: 'Explore',
      metricLabel: 'Earth wisdom',
      insight: 'Earth patterns and guidance for your journey.',
      href: '/tools/geomancy',
      colorScheme: 'indigo',
      priority: 11
    },
    {
      toolName: 'Angel Numbers',
      toolSlug: 'angel-numbers',
      icon: getToolIcon('angel-numbers', '👼'),
      metric: 'Explore',
      metricLabel: 'Divine messages',
      insight: 'Decode the numbers that appear in your life.',
      href: '/tools/angel-numbers',
      colorScheme: 'rose',
      priority: 12
    },
    {
      toolName: 'Name Analysis',
      toolSlug: 'name-analysis',
      icon: getToolIcon('name-analysis', '📝'),
      metric: 'Explore',
      metricLabel: 'Name vibration',
      insight: 'Discover the energy and meaning in your name.',
      href: '/tools/name-analysis',
      colorScheme: 'cyan',
      priority: 13
    },
    {
      toolName: 'Runes',
      toolSlug: 'runes',
      icon: getToolIcon('runes', 'ᚱ'),
      metric: 'Explore',
      metricLabel: 'Nordic wisdom',
      insight: 'Draw runes for insight and guidance.',
      href: '/tools/runes',
      colorScheme: 'teal',
      priority: 14
    },
    {
      toolName: 'Dream Symbols',
      toolSlug: 'dream-symbols',
      icon: getToolIcon('dream-symbols', '🌙'),
      metric: 'Explore',
      metricLabel: 'Dream meanings',
      insight: 'Interpret the symbols in your dreams.',
      href: '/tools/dream-symbols',
      colorScheme: 'orange',
      priority: 15
    }
  ]
}

export function extractToolSnippets(profile: ExtendedMysticalProfile | ComprehensiveMysticalProfile | null): ToolSnippet[] {
  if (!profile) return []

  const snippets: ToolSnippet[] = []

  // 1. Vedic Astrology - Always try to extract, should always return something if profile exists
  const vedicSnippet = extractVedicSnippet(profile)
  if (vedicSnippet) snippets.push(vedicSnippet)

  // 2. Western Astrology
  const westernSnippet = extractWesternSnippet(profile)
  if (westernSnippet) snippets.push(westernSnippet)

  // 3. Numerology
  const numerologySnippet = extractNumerologySnippet(profile)
  if (numerologySnippet) snippets.push(numerologySnippet)

  // 4. Tarot
  const tarotSnippet = extractTarotSnippet(profile)
  if (tarotSnippet) snippets.push(tarotSnippet)

  // 5. I Ching
  const ichingSnippet = extractIChingSnippet(profile)
  if (ichingSnippet) snippets.push(ichingSnippet)

  // 6. Geomancy
  const geomancySnippet = extractGeomancySnippet(profile)
  if (geomancySnippet) snippets.push(geomancySnippet)

  // 7. Angel Numbers
  const angelNumbersSnippet = extractAngelNumbersSnippet(profile)
  if (angelNumbersSnippet) snippets.push(angelNumbersSnippet)

  // 8. Name Analysis
  const nameAnalysisSnippet = extractNameAnalysisSnippet(profile)
  if (nameAnalysisSnippet) snippets.push(nameAnalysisSnippet)

  // If no snippets found but profile exists, ensure at least Vedic shows
  if (snippets.length === 0 && profile) {
    console.warn('⚠️ No tool snippets extracted, adding fallback Vedic snippet')
    snippets.push({
      toolName: 'Vedic Astrology',
      toolSlug: 'vedic',
      icon: getToolIcon('vedic-astrology', '🕉️'),
      metric: 'Profile Ready',
      metricLabel: 'Status',
      insight: 'Your mystical profile is available. Click to explore your Vedic chart and insights.',
      href: '/tools/vedic',
      colorScheme: 'amber',
      priority: 1
    })
  }

  // Append discovery snippets (tools without cached data); avoid duplicates by slug
  const existingSlugs = new Set(snippets.map((s) => s.toolSlug))
  const discovery = getDiscoverySnippets().filter((s) => !existingSlugs.has(s.toolSlug))
  snippets.push(...discovery)

  // Sort by priority
  return snippets.sort((a, b) => a.priority - b.priority)
}

function extractVedicSnippet(profile: ExtendedMysticalProfile | ComprehensiveMysticalProfile): ToolSnippet | null {
  // If profile exists, always return at least a basic Vedic snippet
  if (!profile) return null
  
  // Try multiple ways to get Vedic data
  const vedicData = profile.vedic || (profile as any).Vedic || (profile as any).vedicAstrology
  const interpretations = profile.interpretations || (profile as any).interpretations
  
  // Even if no specific data, return a basic snippet if profile exists
  if (!vedicData && !interpretations) {
    // Still return basic snippet to show something
    return {
      toolName: 'Vedic Astrology',
      toolSlug: 'vedic',
      icon: getToolIcon('vedic-astrology', '🕉️'),
      metric: 'Chart Available',
      metricLabel: 'Status',
      insight: 'Your Vedic chart is ready. Click to view detailed insights.',
      href: '/tools/vedic',
      colorScheme: 'amber',
      priority: 1
    }
  }

  const currentDasha = vedicData?.currentDasha || interpretations?.dasha?.current || vedicData?.dasha?.[0]
  const strengths = interpretations?.personality?.strengths || []
  const topStrength = strengths[0] || 'Discovering your cosmic blueprint'

  let metric = 'Vedic Chart'
  let metricLabel = 'Active'

  if (currentDasha) {
    const dashaName = currentDasha.dasha || currentDasha.planet || currentDasha.name || 'Current Period'
    metric = dashaName
    metricLabel = 'Dasha Period'
  } else if (vedicData?.ascendant !== undefined) {
    const ascendantSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                            'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
    const ascendant = ascendantSigns[vedicData.ascendant] || 'Active'
    metric = ascendant
    metricLabel = 'Ascendant'
  }

  return {
    toolName: 'Vedic Astrology',
    toolSlug: 'vedic',
    icon: getToolIcon('vedic-astrology', '🕉️'),
    metric,
    metricLabel,
    insight: topStrength.length > 80 ? topStrength.substring(0, 77) + '...' : topStrength,
    href: '/tools/vedic',
    colorScheme: 'amber',
    priority: 1
  }
}

function extractWesternSnippet(profile: ExtendedMysticalProfile | ComprehensiveMysticalProfile): ToolSnippet | null {
  const western = (profile as Record<string, unknown>).western || (profile as any).westernAstrology
  if (!western) return null

  // Cached Western comprehensive API shape: { comprehensiveAnalysis: { chartOverview, planetaryAnalysis } }
  const comprehensive = western.comprehensiveAnalysis
  if (comprehensive) {
    const chartOverview = comprehensive.chartOverview || ''
    const planetaryAnalysis = comprehensive.planetaryAnalysis || []
    const sunEntry = Array.isArray(planetaryAnalysis)
      ? planetaryAnalysis.find((p: any) => p?.planet === 'Sun')
      : null
    let metric = 'Western Chart'
    let metricLabel = 'Overview'
    if (sunEntry?.analysis) {
      const signMatch = (sunEntry.analysis as string).match(/\b(Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)\b/i)
      if (signMatch) {
        metric = signMatch[1]
        metricLabel = 'Sun Sign'
      }
    }
    const insight = chartOverview
      ? (chartOverview.length > 80 ? chartOverview.substring(0, 77) + '...' : chartOverview)
      : 'Your cosmic identity reveals unique strengths and opportunities'
    return {
      toolName: 'Western Astrology',
      toolSlug: 'western-astrology',
      icon: getToolIcon('western-astrology', '⭐'),
      metric,
      metricLabel,
      insight,
      href: '/tools/western-astrology',
      colorScheme: 'purple',
      priority: 2
    }
  }

  // Chart object shape (legacy / direct chart data)
  const sunSign = western.chart?.sun?.signName ||
                   western.sunSign ||
                   (western.chart?.planets?.find((p: any) => p.name === 'Sun')?.signName) ||
                   'Calculating...'
  const risingSign = western.chart?.ascendant?.signName ||
                     western.risingSign ||
                     (western.chart?.planets?.find((p: any) => p.name === 'Ascendant')?.signName) ||
                     null

  let metric = sunSign
  let metricLabel = 'Sun Sign'
  if (risingSign && risingSign !== sunSign) {
    metric = `${sunSign} / ${risingSign}`
    metricLabel = 'Sun / Rising'
  }

  const personalityOverview = profile.interpretations?.personality?.overview
  const insight = personalityOverview
    ? (personalityOverview.length > 80 ? personalityOverview.substring(0, 77) + '...' : personalityOverview)
    : 'Your cosmic identity reveals unique strengths and opportunities'

  return {
    toolName: 'Western Astrology',
    toolSlug: 'western-astrology',
    icon: getToolIcon('western-astrology', '⭐'),
    metric,
    metricLabel,
    insight,
    href: '/tools/western-astrology',
    colorScheme: 'purple',
    priority: 2
  }
}

function extractNumerologySnippet(profile: ExtendedMysticalProfile | ComprehensiveMysticalProfile): ToolSnippet | null {
  // Try multiple ways to get Numerology data (including Astro-Numerology cache)
  const numerology = (profile as Record<string, unknown>).numerology || (profile as any).Numerology || (profile as any).numerologyData
  if (!numerology) return null

  const lifePath = numerology.lifePathNumber || numerology.lifePath || numerology.coreNumber
  const personalYear = numerology.personalYearNumber || numerology.personalYear
  const nameNumber = numerology.nameNumber

  if (!lifePath && !nameNumber) return null

  let metric = lifePath != null ? `Life Path ${lifePath}` : `Name ${nameNumber}`
  let metricLabel = lifePath != null ? 'Core Number' : 'Name Vibration'

  if (lifePath != null && personalYear) {
    metric = `${lifePath} / Year ${personalYear}`
    metricLabel = 'Life Path / Personal Year'
  } else if (lifePath != null && nameNumber != null) {
    metric = `${lifePath} / ${nameNumber}`
    metricLabel = 'Life Path / Name'
  }

  const interpretations = profile.interpretations || (profile as any).interpretations
  const lifePurpose = interpretations?.lifePurpose?.overview
  const comprehensiveLifePurpose = numerology.comprehensiveAnalysis?.lifePurpose ?? numerology.comprehensiveAnalysis?.personalitySynthesis
  const insight = lifePurpose
    ? (lifePurpose.length > 80 ? lifePurpose.substring(0, 77) + '...' : lifePurpose)
    : (typeof comprehensiveLifePurpose === 'string'
        ? (comprehensiveLifePurpose.length > 80 ? comprehensiveLifePurpose.substring(0, 77) + '...' : comprehensiveLifePurpose)
        : numerology.insights?.lifePurpose ||
          numerology.lifePurpose ||
          `Your Life Path ${lifePath ?? nameNumber} reveals your unique purpose and destiny`)

  return {
    toolName: 'Numerology',
    toolSlug: 'numerology',
    icon: getToolIcon('numerology', '🔢'),
    metric,
    metricLabel,
    insight,
    href: '/tools/numerology',
    colorScheme: 'blue',
    priority: 3
  }
}

function extractTarotSnippet(profile: ExtendedMysticalProfile | ComprehensiveMysticalProfile): ToolSnippet | null {
  // Check multiple possible locations for tarot data (including combined-system cache)
  const tarot = (profile as Record<string, unknown>).tarot || (profile as any).Tarot
  if (!tarot) return null

  const birthCard = tarot.birthCard || tarot.profile?.birthCard || tarot.card?.birthCard
  if (!birthCard && !tarot.holisticAnalysis?.overview) return null

  const cardName = birthCard
    ? (typeof birthCard === 'string' ? birthCard : (birthCard.name || birthCard.card || 'The Fool'))
    : 'Tarot Profile'
  const cardMeaning = birthCard && typeof birthCard === 'object'
    ? (birthCard.meaning || birthCard.upright || birthCard.description || '')
    : ''
  const holisticOverview = tarot.holisticAnalysis?.overview

  const metric = cardName
  const metricLabel = birthCard ? 'Birth Card' : 'Combined System'

  const insight = cardMeaning
    ? (cardMeaning.length > 80 ? cardMeaning.substring(0, 77) + '...' : cardMeaning)
    : (typeof holisticOverview === 'string'
        ? (holisticOverview.length > 80 ? holisticOverview.substring(0, 77) + '...' : holisticOverview)
        : 'Your birth card reveals your core spiritual energy and life path')

  return {
    toolName: 'Tarot',
    toolSlug: 'tarot',
    icon: getToolIcon('tarot', '🔮'),
    metric,
    metricLabel,
    insight,
    href: '/tools/tarot',
    colorScheme: 'pink',
    priority: 4
  }
}

function extractIChingSnippet(profile: ExtendedMysticalProfile | ComprehensiveMysticalProfile): ToolSnippet | null {
  const iching = (profile as Record<string, unknown>).iching || (profile as any)['I Ching']
  if (!iching) return null

  const hexagram = iching.hexagram || iching.currentHexagram || iching.hexagramData
  if (!hexagram) return null

  const hexagramNumber = typeof hexagram === 'object' 
    ? (hexagram.number || hexagram.hexagram || '')
    : hexagram

  const hexagramName = typeof hexagram === 'object'
    ? (hexagram.name || hexagram.title || '')
    : ''

  const metric = hexagramNumber ? `Hexagram ${hexagramNumber}` : 'I Ching'
  const metricLabel = hexagramName || 'Guidance'

  const meaning = typeof hexagram === 'object'
    ? (hexagram.meaning || hexagram.interpretation || hexagram.description || '')
    : ''

  const insight = meaning
    ? (meaning.length > 80 ? meaning.substring(0, 77) + '...' : meaning)
    : 'Ancient wisdom reveals your current path and guidance'

  return {
    toolName: 'I Ching',
    toolSlug: 'iching',
    icon: getToolIcon('i-ching', '☯️'),
    metric,
    metricLabel,
    insight,
    href: '/tools/iching',
    colorScheme: 'green',
    priority: 5
  }
}

function extractGeomancySnippet(profile: ExtendedMysticalProfile | ComprehensiveMysticalProfile): ToolSnippet | null {
  const geomancy = (profile as Record<string, unknown>).geomancy || (profile as any).Geomancy
  if (!geomancy) return null

  const figures = geomancy.figures || geomancy.currentFigures || geomancy.reading?.figures
  if (!figures || (Array.isArray(figures) && figures.length === 0)) return null

  const firstFigure = Array.isArray(figures) ? figures[0] : figures
  const figureName = typeof firstFigure === 'object'
    ? (firstFigure.name || firstFigure.figure || firstFigure.title || '')
    : firstFigure

  const metric = figureName || 'Geomancy'
  const metricLabel = 'Current Figure'

  const meaning = typeof firstFigure === 'object'
    ? (firstFigure.meaning || firstFigure.interpretation || firstFigure.description || '')
    : ''

  const insight = meaning
    ? (meaning.length > 80 ? meaning.substring(0, 77) + '...' : meaning)
    : 'Earth wisdom reveals patterns and guidance for your path'

  return {
    toolName: 'Geomancy',
    toolSlug: 'geomancy',
    icon: getToolIcon('geomancy', '🌍'),
    metric,
    metricLabel,
    insight,
    href: '/tools/geomancy',
    colorScheme: 'indigo',
    priority: 6
  }
}

function extractAngelNumbersSnippet(profile: ExtendedMysticalProfile | ComprehensiveMysticalProfile): ToolSnippet | null {
  const angelNumbers = (profile as Record<string, unknown>).angelNumbers || (profile as any)['Angel Numbers']
  if (!angelNumbers) return null

  const primaryNumber = angelNumbers.primaryNumber || 
                       angelNumbers.number || 
                       angelNumbers.angelNumber ||
                       (Array.isArray(angelNumbers.numbers) ? angelNumbers.numbers[0] : null)
  
  if (!primaryNumber) return null

  const metric = primaryNumber.toString()
  const metricLabel = 'Angel Number'

  const message = angelNumbers.message || 
                  angelNumbers.meaning || 
                  angelNumbers.messages?.[primaryNumber] ||
                  `Angel number ${primaryNumber} brings divine guidance`

  const insight = typeof message === 'string'
    ? (message.length > 80 ? message.substring(0, 77) + '...' : message)
    : `Divine message through number ${primaryNumber}`

  return {
    toolName: 'Angel Numbers',
    toolSlug: 'angel-numbers',
    icon: getToolIcon('angel-numbers', '👼'),
    metric,
    metricLabel,
    insight,
    href: '/tools/angel-numbers',
    colorScheme: 'rose',
    priority: 7
  }
}

function extractNameAnalysisSnippet(profile: ExtendedMysticalProfile | ComprehensiveMysticalProfile): ToolSnippet | null {
  const nameAnalysis = (profile as Record<string, unknown>).nameAnalysis || (profile as any)['Name Analysis']
  if (!nameAnalysis) return null

  const expressionNumber = nameAnalysis.expressionNumber || 
                           nameAnalysis.destinyNumber ||
                           nameAnalysis.powerNumber ||
                           nameAnalysis.nameNumber

  if (!expressionNumber) return null

  const metric = `Expression ${expressionNumber}`
  const metricLabel = 'Name Vibration'

  const insight = nameAnalysis.insight ||
                  nameAnalysis.meaning ||
                  nameAnalysis.vibration ||
                  `Your name carries the vibration of number ${expressionNumber}`

  const insightText = typeof insight === 'string'
    ? (insight.length > 80 ? insight.substring(0, 77) + '...' : insight)
    : 'Your name reveals hidden patterns and potentials'

  return {
    toolName: 'Name Analysis',
    toolSlug: 'name-analysis',
    icon: getToolIcon('name-analysis', '📝'),
    metric,
    metricLabel,
    insight: insightText,
    href: '/tools/name-analysis',
    colorScheme: 'cyan',
    priority: 8
  }
}
