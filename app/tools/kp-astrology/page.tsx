"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { devLog } from '@/lib/devLogger';
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Clock, 
  User, 
  Star, 
  Globe, 
  Home, 
  Sparkles,
  Zap,
  Heart,
  Briefcase,
  Activity,
  TrendingUp,
  Gem,
  Loader2,
  Info,
  RefreshCw,
  Target,
  Brain,
  Shield,
  Users,
} from "lucide-react"
import { Button } from '@/components/ui/button'
import NorthIndianVedicChart from "@/components/NorthIndianVedicChart"
import VedicSouthChart from "@/components/VedicSouthChart"
import { KPAstrologyCoachInterface } from "@/components/KPAstrologyCoachInterface"
import KPSeerChatInterface from "@/components/KPSeerChatInterface"
import { KPAnalysis as KPIntelligenceAnalysis } from "@/lib/kpAstrologyIntelligence"
import { useAuth } from "@/hooks/use-auth"
import { useToolReport } from "@/hooks/useComprehensiveMysticalProfile"
import { ToolReportGuard } from '@/components/ToolReportGuard'
import { TeaserView } from '@/components/report-viral/TeaserView'
import { ShareCard } from '@/components/report-viral/ShareCard'
import { ViralLockOverlay } from '@/components/report-viral/LockedReportView'
import { buildToolTeaser } from '@/lib/report-viral/buildToolTeaser'
import { toolPathForSlug } from '@/lib/report-viral/toolSlugToPath'
import { cn } from '@/lib/utils'
import { useToolReportUnlock } from '@/hooks/useToolReportUnlock'
import { useViralReportBypass } from '@/hooks/useViralReportBypass'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ToolIntroductionTab } from '@/components/ToolIntroductionTab'
import { getPermanentChart, storeCurrentChart, getCurrentChart, ChartStorage } from '@/lib/chartStorage'
import { calculateCurrentDasha } from '@/lib/vedic-core'
import { Phase2VisualPanel } from '@/components/charts/Phase2VisualPanel'
import { adaptKpOverlay } from '@/lib/charts/phase2Adapters'
import { isKpChartsV2Enabled } from '@/lib/charts/featureFlags'
import { ToolReportStatusChips } from '@/components/tool-status/ToolReportStatusChips'

const CHART_CANVAS_W = 450
const CHART_CANVAS_H = 333

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000

/** Derive current mahadasha start/end from birth date and Moon longitude (for client-side fallback when dasha_forecast has no dates). */
function deriveDashaDates(birthDate: string, moonLon: number): { startDate: Date; endDate: Date } | null {
  const info = calculateCurrentDasha(birthDate, moonLon)
  if (!info.currentDasha || !info.timeline?.mahadasas?.length) return null
  const idx = info.timeline.mahadasas.findIndex((m: { lord: string }) => m.lord === info.currentDasha!.lord)
  if (idx < 0) return null
  let yearsBefore = 0
  for (let i = 0; i < idx; i++) yearsBefore += info.timeline.mahadasas[i].years
  const [y, mo, d] = birthDate.split('-').map(Number)
  const birthMs = new Date(y, (mo ?? 1) - 1, d ?? 1).getTime()
  const startMs = birthMs + yearsBefore * MS_PER_YEAR
  const endMs = startMs + info.currentDasha.years * MS_PER_YEAR
  return { startDate: new Date(startMs), endDate: new Date(endMs) }
}

function ResponsiveChartWrap({ children }: { children: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(CHART_CANVAS_W)
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? CHART_CANVAS_W
      setWidth(Math.min(w, CHART_CANVAS_W))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const scale = width / CHART_CANVAS_W
  return (
    <div
      ref={wrapRef}
      className="w-full max-w-[450px] mx-auto aspect-[450/333] min-h-0 relative overflow-hidden bg-white p-0 leading-none text-[0px]"
    >
      <div
        className="absolute left-0 top-0 origin-top-left bg-white"
        style={{
          width: CHART_CANVAS_W,
          height: CHART_CANVAS_H,
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

// Helper functions for generating interpretations
const getPlanetInterpretation = (planet: string, sign: string, house: number, nakshatra: string, sublord: string): string => {
  const planetNames: Record<string, string> = {
    'Sun': 'Your Sun represents your core identity, ego, and life force',
    'Moon': 'Your Moon reflects your emotional nature, intuition, and inner self',
    'Mars': 'Mars governs your energy, courage, and drive',
    'Mercury': 'Mercury influences communication, intellect, and reasoning',
    'Jupiter': 'Jupiter brings wisdom, expansion, and spiritual growth',
    'Venus': 'Venus rules love, beauty, relationships, and pleasures',
    'Saturn': 'Saturn teaches discipline, responsibility, and life lessons',
    'Rahu': 'Rahu represents desires, innovation, and worldly pursuits',
    'Ketu': 'Ketu signifies spirituality, detachment, and past-life karma'
  }
  
  const houseMeanings: Record<number, string> = {
    1: 'affects your personality and physical appearance',
    2: 'influences wealth, family, and speech',
    3: 'rules courage, siblings, and communication',
    4: 'governs home, mother, and emotional foundation',
    5: 'controls creativity, education, and children',
    6: 'relates to health, service, and obstacles',
    7: 'signifies partnerships, marriage, and business',
    8: 'represents transformation, longevity, and mysteries',
    9: 'rules spirituality, higher learning, and fortune',
    10: 'controls career, reputation, and public life',
    11: 'governs gains, friendships, and aspirations',
    12: 'signifies losses, spirituality, and liberation'
  }
  
  const sublordMeanings: Record<string, string> = {
    'Sun': 'with solar sub-lord energy emphasizing authority and leadership',
    'Moon': 'with lunar sub-lord bringing emotional sensitivity and intuition',
    'Mars': 'with martial sub-lord indicating dynamic action and initiative',
    'Mercury': 'with mercurial sub-lord highlighting communication and adaptability',
    'Jupiter': 'with jovian sub-lord expanding wisdom and opportunity',
    'Venus': 'with venusian sub-lord enhancing relationships and creativity',
    'Saturn': 'with saturnine sub-lord teaching patience and structure',
    'Rahu': 'with rahu sub-lord bringing innovation and worldly desires',
    'Ketu': 'with ketu sub-lord focusing on spirituality and detachment'
  }
  
  const base = planetNames[planet] || `${planet} influences specific areas of your life`
  const houseInfo = houseMeanings[house] || `in house ${house}`
  const sublordInfo = sublordMeanings[sublord] || `with ${sublord} sub-lord influence`
  
  return `${base}, ${houseInfo}. The ${nakshatra} nakshatra and ${sublordInfo} create unique timing influences in your chart.`
}

const getHouseInterpretation = (house: number, sign: string, sublord: string): string => {
  const houseNames: Record<number, string> = {
    1: 'Personality & Self', 2: 'Wealth & Family', 3: 'Courage & Siblings',
    4: 'Home & Mother', 5: 'Creativity & Children', 6: 'Health & Service',
    7: 'Partnerships & Marriage', 8: 'Transformation & Longevity', 9: 'Spirituality & Fortune',
    10: 'Career & Reputation', 11: 'Gains & Friendships', 12: 'Spirituality & Liberation'
  }
  
  const sublordInfluences: Record<string, string> = {
    'Sun': 'Leadership qualities and authority will be prominent',
    'Moon': 'Emotional sensitivity and intuitive abilities are highlighted',
    'Mars': 'Dynamic action and courage characterize this area',
    'Mercury': 'Communication and intellectual pursuits are favored',
    'Jupiter': 'Wisdom, expansion, and positive growth are indicated',
    'Venus': 'Relationships, creativity, and pleasures are enhanced',
    'Saturn': 'Discipline, patience, and structured progress are needed',
    'Rahu': 'Innovation, worldly desires, and unconventional paths',
    'Ketu': 'Spiritual growth and detachment from materialism'
  }
  
  return `Your ${houseNames[house]} house (${sign}) with ${sublord} sub-lord suggests ${sublordInfluences[sublord] || 'unique influences'} in this life area.`
}

const getDashaInfluence = (dasha: string): { focus: string, events: string[] } => {
  const influences: Record<string, { focus: string, events: string[] }> = {
    'Sun': { focus: 'Leadership, authority, recognition, and career advancement', events: ['Professional opportunities', 'Government connections', 'Recognition for achievements', 'Leadership roles'] },
    'Moon': { focus: 'Emotional growth, public matters, and domestic harmony', events: ['Emotional healing', 'Home improvements', 'Public recognition', 'Nurturing relationships'] },
    'Mars': { focus: 'Energy, courage, property, and assertive actions', events: ['New ventures', 'Property matters', 'Physical activities', 'Competitive success'] },
    'Mercury': { focus: 'Communication, business, education, and intellectual pursuits', events: ['Business opportunities', 'Educational achievements', 'Writing or speaking', 'Short journeys'] },
    'Jupiter': { focus: 'Wisdom, expansion, children, and spiritual growth', events: ['Educational pursuits', 'Spiritual growth', 'Family expansion', 'Financial gains'] },
    'Venus': { focus: 'Relationships, arts, luxury, and pleasures', events: ['Romantic relationships', 'Artistic pursuits', 'Luxury purchases', 'Social connections'] },
    'Saturn': { focus: 'Discipline, hard work, obstacles, and service', events: ['Career challenges', 'Service to others', 'Delayed gratification', 'Long-term projects'] },
    'Rahu': { focus: 'Innovation, foreign connections, technology, and desires', events: ['Foreign travel', 'Technological opportunities', 'Unconventional paths', 'Material desires'] },
    'Ketu': { focus: 'Spirituality, research, detachment, and past-life karma', events: ['Spiritual practices', 'Research activities', 'Letting go of attachments', 'Mystical experiences'] }
  }
  
  return influences[dasha] || { focus: 'Balanced growth and development', events: ['Personal growth', 'Life opportunities', 'Inner development'] }
}

const getRemedyExplanation = (remedy: string, planet?: string): { explanation: string, benefits: string, instructions?: string } => {
  const explanations: Record<string, { explanation: string, benefits: string, instructions?: string }> = {
    'Chant mantras for': {
      explanation: `Mantras for ${planet} help align your energy with the planetary influence, reducing negative effects and enhancing positive qualities.`,
      benefits: 'Brings harmony, reduces obstacles, and strengthens the planetary energy in your chart.',
      instructions: `Chant ${planet === 'Sun' ? 'Gayatri Mantra' : planet === 'Moon' ? 'Om Som Somaya Namah' : `the specific mantra for ${planet}`} daily, ideally during the planetary hour or sunrise.`
    },
    'Wear gemstones': {
      explanation: 'Gemstones resonate with specific planetary energies, helping balance and strengthen those influences in your chart.',
      benefits: 'Enhances positive planetary effects, protects from negative influences, and attracts favorable energies.',
      instructions: 'Wear the recommended gemstone after proper consultation, ideally on the appropriate finger and during an auspicious time.'
    },
    'Perform charitable acts': {
      explanation: 'Charitable acts help balance karma and create positive energy that aligns with planetary beneficence.',
      benefits: 'Reduces negative karma, attracts positive opportunities, and creates spiritual merit.',
      instructions: 'Perform charity on auspicious days, particularly during the planetary day of the week.'
    },
    'Maintain positive thoughts': {
      explanation: 'Your mental state directly influences how planetary energies manifest in your life.',
      benefits: 'Attracts positive experiences, reduces stress, and helps manifest favorable outcomes.',
      instructions: 'Practice meditation, affirmations, and mindfulness daily to maintain positive mental energy.'
    }
  }
  
  if (remedy.includes('Chant mantras')) {
    return explanations['Chant mantras for']
  } else if (remedy.includes('gemstone')) {
    return explanations['Wear gemstones']
  } else if (remedy.includes('charitable')) {
    return explanations['Perform charitable acts']
  } else if (remedy.includes('positive thoughts')) {
    return explanations['Maintain positive thoughts']
  }
  
  return {
    explanation: 'This remedy is recommended based on your KP chart analysis to balance planetary influences.',
    benefits: 'Helps align your energy with favorable cosmic influences and reduce obstacles.'
  }
}

// Transform KP analysis planetary positions to NorthIndianVedicChart format
// Calculate planetary dignity based on Vedic astrology rules
const calculatePlanetaryDignity = (planetName: string, sign: number, signName: string): { exalted: boolean; debilitated: boolean; ownSign: boolean } => {
  const planet = planetName.toLowerCase()
  const signLower = signName.toLowerCase()
  
  // Exaltation signs
  const exaltationSigns: Record<string, string> = {
    'sun': 'aries',
    'moon': 'taurus',
    'mars': 'capricorn',
    'mercury': 'virgo',
    'jupiter': 'cancer',
    'venus': 'pisces',
    'saturn': 'libra'
  }
  
  // Debilitation signs
  const debilitationSigns: Record<string, string> = {
    'sun': 'libra',
    'moon': 'scorpio',
    'mars': 'cancer',
    'mercury': 'pisces',
    'jupiter': 'capricorn',
    'venus': 'virgo',
    'saturn': 'aries'
  }
  
  // Own signs (multiple signs per planet)
  const ownSigns: Record<string, string[]> = {
    'sun': ['leo'],
    'moon': ['cancer'],
    'mars': ['aries', 'scorpio'],
    'mercury': ['gemini', 'virgo'],
    'jupiter': ['sagittarius', 'pisces'],
    'venus': ['taurus', 'libra'],
    'saturn': ['capricorn', 'aquarius']
  }
  
  const exalted = exaltationSigns[planet] === signLower
  const debilitated = debilitationSigns[planet] === signLower
  const ownSign = ownSigns[planet]?.includes(signLower) || false
  
  return { exalted, debilitated, ownSign }
}

const transformKPPlanetsForChart = (planetaryPositions: any[]): Array<{ name: string; sign: number; degreeInSign: number; isRetrograde: boolean }> => {
  if (!planetaryPositions || !Array.isArray(planetaryPositions)) return []
  
  const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
  
  const getSignIndex = (signName: string): number => {
    const index = signNames.findIndex(s => s.toLowerCase() === signName.toLowerCase())
    return index >= 0 ? index : 0
  }
  
  return planetaryPositions.map((planet: any) => {
    const planetName = (planet.planet || planet.name || '').charAt(0).toUpperCase() + (planet.planet || planet.name || '').slice(1).toLowerCase()
    const signName = planet.sign || 'Aries'
    const sign = getSignIndex(signName)
    const degree = planet.degree || 0
    // Extract degree in sign (assuming degree is already in sign format or convert from absolute degree)
    const degreeInSign = degree >= 30 ? degree % 30 : degree
    const isRetrograde = planet.isRetrograde || planet.retrograde || false
    
    return {
      name: planetName,
      sign,
      degreeInSign,
      isRetrograde
    }
  })
}

interface KPAnalysis {
  basicInfo?: {
    name: string;
    dateOfBirth: string;
    timeOfBirth: string;
    placeOfBirth: string;
    currentLocation?: string;
  };
  birthChart?: string;
  chartOverview?: string;
  planetaryPositions?: Record<string, any>;
  houses?: Array<{
    house: number;
    sign: string;
    degree: string;
    lord: string;
  }>;
  aspects?: any;
  interpretations?: {
    personality?: string;
    lifePath?: string;
    career?: string;
    relationships?: string;
    health?: string;
    wealth?: string;
    spiritual?: string;
    strengths?: string[];
    challenges?: string[];
    recommendations?: string[];
    kpSpecific?: {
      sublords?: string[];
      dashaPeriods?: string[];
      transits?: string[];
      predictions?: string[];
    };
  };
  isRealData?: boolean;
  rawAstroAppData?: any;
  ascendant?: string | { sign: string; degree: number; subLord: string; starLord: string; nakshatra: string; nakshatraLord: string };
  moonSign?: string;
  sunSign?: string;
  // Native KP pipeline shape (from kpAstrologyIntelligence.analyzeChart)
  cusps?: Array<{ house: number; sign: string; degree: number; subLord: string; starLord: string; nakshatra: string; nakshatraLord: string }>;
  planets?: Array<{ name: string; sign: string; degree: number; subLord: string; starLord: string; house: number; nakshatra: string; nakshatraLord: string }>;
  timingAnalysis?: { dasha: string; antardasha: string; pratyantardasha: string; currentPeriod: string; nextPeriod: string };
  subLords?: Array<{ planet: string; subLords: string[]; significations: string[] }>;
  significations?: { career: string[]; relationships: string[]; health: string[]; wealth: string[]; education: string[]; travel: string[] };
  predictions?: { shortTerm: string; mediumTerm: string; longTerm: string; remedies: Array<{ type: string; planet: string; name: string; description: string; instructions: string[]; benefits: string[]; frequency?: string; explanation: string; priority: string }> };
}

/** Map native KP analysis (from pipeline) to rawAstroAppData shape expected by chart tabs and transform. */
function nativeKPAnalysisToRawAstroAppData(native: KPIntelligenceAnalysis): Record<string, unknown> {
  return {
    ascendant: native.ascendant,
    planetary_positions: (native.planets || []).map((p) => ({
      planet: p.name,
      sign: p.sign,
      degree: p.degree,
      house: p.house,
      nakshatra: p.nakshatra,
      sublord: p.subLord,
      nakshatraLord: p.nakshatraLord,
      starLord: p.starLord,
    })),
    house_analysis: (native.cusps || []).map((c) => ({
      house: c.house,
      sign: c.sign,
      degree: c.degree,
      sublord: c.subLord,
      starLord: c.starLord,
      nakshatra: c.nakshatra,
      nakshatraLord: c.nakshatraLord,
    })),
    sublord_analysis: {
      sublords: (native.subLords || []).map((sl) => ({
        planet: sl.planet,
        sublord: sl.subLords?.[0] ?? sl.planet,
        influence: (sl.significations || []).join(', '),
      })),
    },
    dasha_forecast: [
      {
        planet: native.timingAnalysis?.dasha ?? 'Moon',
        antardasha: native.timingAnalysis?.antardasha ?? 'Sun',
        pratyantardasha: native.timingAnalysis?.pratyantardasha ?? 'Mars',
        description: native.timingAnalysis?.currentPeriod ?? 'Current dasha period',
        nextPeriod: native.timingAnalysis?.nextPeriod ?? 'Next dasha period',
        startDate: (native.timingAnalysis as { startDate?: string })?.startDate,
        endDate: (native.timingAnalysis as { endDate?: string })?.endDate,
      },
    ],
    significations: native.significations || {},
    predictions: native.predictions
      ? { shortTerm: native.predictions.shortTerm, mediumTerm: native.predictions.mediumTerm, longTerm: native.predictions.longTerm }
      : {},
    remedies: (native.predictions?.remedies || []).map((r) => ({
      type: r.type,
      planet: r.planet,
      name: r.name,
      description: r.description,
      instructions: r.instructions,
      benefits: r.benefits,
      frequency: r.frequency,
      explanation: r.explanation,
      priority: r.priority,
    })),
  }
}

export default function KPAstrologyPage() {
  const { user, userProfile } = useAuth()
  const {
    report: pipelineReport,
    loading: isLoadingPipeline,
    error: profileError,
    reportUpdatedAt,
    reportGeneratedAt,
    reportUnchanged,
  } = useToolReport('kp')
  const freshnessLabel = useMemo(() => {
    const ts = reportUpdatedAt ?? reportGeneratedAt
    if (!ts) return null
    const ms = typeof ts === "number" ? ts : Date.parse(ts)
    if (!Number.isFinite(ms)) return null
    const delta = Date.now() - ms
    if (delta < 60_000) return "Updated just now"
    if (delta < 3_600_000) return `Updated ${Math.floor(delta / 60_000)} min ago`
    if (delta < 86_400_000) return `Updated ${Math.floor(delta / 3_600_000)}h ago`
    return `Updated ${Math.floor(delta / 86_400_000)}d ago`
  }, [reportGeneratedAt, reportUpdatedAt])
  const analysisFromPipeline = useMemo((): KPAnalysis | null => {
    if (!pipelineReport || typeof pipelineReport !== 'object') return null
    const r = pipelineReport as Record<string, unknown>
    if (r.placeholder === true) return null
    const data = (r.data ?? r) as KPAnalysis | undefined
    if (!data || typeof data !== 'object') return null
    if (data.basicInfo ?? data.rawAstroAppData ?? data.interpretations) return data
    if (Array.isArray(data.cusps) && data.cusps.length > 0 && data.timingAnalysis) return data
    return null
  }, [pipelineReport])
  const [analysis, setAnalysis] = useState<KPAnalysis | null>(null)
  useEffect(() => {
    if (!analysisFromPipeline) return
    const hasNativeShape =
      Array.isArray(analysisFromPipeline.cusps) &&
      analysisFromPipeline.cusps.length > 0 &&
      analysisFromPipeline.timingAnalysis
    const hasRaw = analysisFromPipeline.rawAstroAppData
    if (hasNativeShape && !hasRaw) {
      setAnalysis({
        ...analysisFromPipeline,
        rawAstroAppData: nativeKPAnalysisToRawAstroAppData(analysisFromPipeline as KPIntelligenceAnalysis),
      })
    } else {
      setAnalysis(analysisFromPipeline)
    }
  }, [analysisFromPipeline])
  const [currentTransits, setCurrentTransits] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const isLoadingAny = isLoading || isLoadingPipeline
  
  const [isLoadingTransits, setIsLoadingTransits] = useState(false)
  const [transitsError, setTransitsError] = useState<string | null>(null)
  /** One in-flight transits POST per mount wave; Strict Mode + deps avoid duplicate network work. */
  const transitsInFlightRef = useRef<Promise<void> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'introduction' | 'chart_images' | 'planetary_positions' | 'sublord_analysis' | 'dasha_forecast' | 'remedies' | 'current_transits' | 'kp_astrology_expert'>('introduction')

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])
  const motionConfig = useMemo(() => {
    if (prefersReducedMotion) return { duration: 0 }
    return { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }
  }, [prefersReducedMotion])
  const tabsConfig = useMemo(
    () => [
      { value: 'introduction', label: 'Introduction' },
      { value: 'chart_images', label: 'Chart Images' },
      { value: 'planetary_positions', label: 'Planetary Positions' },
      { value: 'sublord_analysis', label: 'Sublord Analysis' },
      { value: 'dasha_forecast', label: 'Dasha Forecast' },
      { value: 'remedies', label: 'Remedies' },
      { value: 'current_transits', label: 'Current Transits' },
      { value: 'kp_astrology_expert', label: 'Ask the Seer' },
    ],
    []
  )

  const viralUnlock = useToolReportUnlock('kp')
  const bypassViral = useViralReportBypass()
  const [showShareCard, setShowShareCard] = useState(false)
  const [waitingLite, setWaitingLite] = useState(false)

  const showKpViral = Boolean(analysis) && !bypassViral
  const kpTeaser = useMemo(
    () => buildToolTeaser('kp', analysis ?? pipelineReport),
    [analysis, pipelineReport]
  )

  const handleShareToUnlock = useCallback(() => {
    setShowShareCard(true)
  }, [])

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(viralUnlock.shareUrl)
    } catch {
      /* ignore */
    }
    viralUnlock.unlockFull()
    setShowShareCard(false)
  }, [viralUnlock])

  const nativeShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'FutureSeer — my reading',
          text: `${kpTeaser.archetypeName}: ${kpTeaser.hookLine.slice(0, 120)}…`,
          url: viralUnlock.shareUrl,
        })
        viralUnlock.unlockFull()
        setShowShareCard(false)
        return
      } catch {
        /* cancelled */
      }
    }
    await copyLink()
  }, [copyLink, viralUnlock, kpTeaser.archetypeName, kpTeaser.hookLine])

  const continueWithoutSharing = useCallback(() => {
    setWaitingLite(true)
    window.setTimeout(() => {
      viralUnlock.unlockLite()
      setWaitingLite(false)
    }, 4000)
  }, [viralUnlock])

  const kpCompareHref = useMemo(
    () => `/tools/${toolPathForSlug('kp')}?friend=compare&ref=share`,
    []
  )

  const kpLocked =
    showKpViral && viralUnlock.hydrated && !viralUnlock.isUnlocked && !bypassViral

  // Check if user has complete profile
  const hasCompleteProfile = userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace

  // Transform analysis data to KPAnalysis format for KPAstrologyCoachInterface
  const transformToKPIntelligenceAnalysis = (): KPIntelligenceAnalysis | null => {
    if (!analysis?.rawAstroAppData) return null

    const raw = analysis.rawAstroAppData

    return {
      ascendant: {
        sign: raw.ascendant?.sign || 'Aries',
        degree: raw.ascendant?.degree || 0,
        subLord: raw.ascendant?.subLord || 'Sun',
        starLord: raw.ascendant?.starLord || raw.ascendant?.nakshatraLord || 'Sun',
        nakshatra: raw.ascendant?.nakshatra || 'Unknown',
        nakshatraLord: raw.ascendant?.nakshatraLord || raw.ascendant?.starLord || 'Sun'
      },
      planets: (raw.planetary_positions || []).map((p: any) => ({
        name: p.planet || p.name || 'Sun',
        sign: p.sign || 'Aries',
        degree: p.degree || 0,
        subLord: p.sublord || p.subLord || 'Sun',
        starLord: p.nakshatraLord || p.starLord || 'Sun',
        house: p.house || 1,
        nakshatra: p.nakshatra || 'Unknown',
        nakshatraLord: p.nakshatraLord || 'Sun'
      })),
      cusps: (raw.house_analysis || []).map((c: any) => ({
        house: c.house || 1,
        sign: c.sign || 'Aries',
        degree: c.degree || 0,
        subLord: c.sublord || c.subLord || 'Sun',
        starLord: c.starLord || 'Sun',
        nakshatra: c.nakshatra || 'Unknown',
        nakshatraLord: c.nakshatraLord || 'Sun'
      })),
      subLords: (raw.sublord_analysis?.sublords || []).map((sl: any) => ({
        planet: sl.planet || 'Sun',
        subLords: sl.sublord ? [sl.sublord] : ['Sun'],
        significations: sl.influence ? sl.influence.split(', ') : []
      })),
      timingAnalysis: {
        dasha: raw.dasha_forecast?.[0]?.planet || 'Moon',
        antardasha: raw.dasha_forecast?.[0]?.antardasha || 'Sun',
        pratyantardasha: raw.dasha_forecast?.[0]?.pratyantardasha || 'Mars',
        currentPeriod: raw.dasha_forecast?.[0]?.description || 'Current dasha period',
        nextPeriod: raw.dasha_forecast?.[0]?.nextPeriod || 'Next dasha period'
      },
      significations: {
        career: raw.significations?.career || [],
        relationships: raw.significations?.relationships || [],
        health: raw.significations?.health || [],
        wealth: raw.significations?.wealth || [],
        education: raw.significations?.education || [],
        travel: raw.significations?.travel || []
      },
      predictions: {
        shortTerm: raw.predictions?.shortTerm || '',
        mediumTerm: raw.predictions?.mediumTerm || '',
        longTerm: raw.predictions?.longTerm || '',
        remedies: (raw.remedies || []).map((r: any) => ({
          type: r.type || 'lifestyle',
          planet: r.planet || 'General',
          name: typeof r === 'string' ? r : (r.name || r.remedy || 'Remedy'),
          description: typeof r === 'string' ? r : (r.description || r.remedy || 'KP remedy'),
          instructions: typeof r === 'string' ? [] : (Array.isArray(r.instructions) ? r.instructions : []),
          benefits: typeof r === 'string' ? [] : (Array.isArray(r.benefits) ? r.benefits : []),
          frequency: typeof r === 'string' ? undefined : r.frequency,
          explanation: typeof r === 'string' ? 'Based on KP sub-lord analysis' : (r.explanation || 'Based on KP chart analysis'),
          priority: typeof r === 'string' ? 'medium' : (r.priority || 'medium')
        }))
      }
    }
  }

  const fetchCurrentTransits = useCallback(async (signal?: AbortSignal) => {
    if (!hasCompleteProfile || !userProfile?.uid) return

    if (transitsInFlightRef.current) {
      await transitsInFlightRef.current
      return
    }

    const run = (async () => {
    setTransitsError(null)
    setIsLoadingTransits(true)
    try {
      devLog.debug('🔄 Fetching current transits for KP astrology...')
      const response = await fetch('/api/tools/kp-astrology/current-transits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal,
        body: JSON.stringify({
          userId: userProfile.uid,
          birthData: {
            birthDate: userProfile.birthDate,
            birthTime: userProfile.birthTime,
            birthPlace: userProfile.birthPlace,
            displayName: userProfile.displayName || 'User'
          }
        }),
      })

      if (response.ok) {
        const result = await response.json()
        devLog.debug('📡 Transits API response:', {
          success: result.success,
          hasData: !!result.data,
          activeTransitsCount: result.data?.activeTransits?.length || 0,
          upcomingTransitsCount: result.data?.upcomingTransits?.length || 0
        })
        
        if (result.success) {
          setCurrentTransits(result.data)
          setTransitsError(null)
          // Store current transits with shorter cache time
          storeCurrentChart(
            userProfile.uid || 'default', 
            'kp-astrology', 
            result.data, 
            {
              birthDate: userProfile.birthDate ?? '',
              birthTime: userProfile.birthTime ?? '',
              birthPlace: userProfile.birthPlace ?? '',
              displayName: userProfile.displayName || 'User'
            },
            { maxAge: 2 * 60 * 60 * 1000 } // 2 hours
          )
          devLog.debug('✅ Fresh current transits loaded and cached:', {
            activeTransits: result.data?.activeTransits?.length || 0,
            upcomingTransits: result.data?.upcomingTransits?.length || 0
          })
        } else {
          devLog.warn('⚠️ Failed to fetch transits:', result.error, 'page')
          setTransitsError(result.error || 'Failed to load transits')
          setCurrentTransits(null)
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        const errMsg = errorData.error || `Request failed (${response.status})`
        devLog.warn('Transits API error', { status: response.status, error: errMsg }, 'kp-astrology')
        setTransitsError(errMsg)
        setCurrentTransits(null)
      }
    } catch (err) {
      if (signal?.aborted || (err instanceof DOMException && err.name === 'AbortError')) {
        return
      }
      devLog.error('❌ Error loading current transits:', err, 'page')
      setTransitsError(err instanceof Error ? err.message : 'Failed to load transits')
      setCurrentTransits(null)
    } finally {
      setIsLoadingTransits(false)
    }
    })()

    transitsInFlightRef.current = run.finally(() => {
      transitsInFlightRef.current = null
    })
    await run
  }, [hasCompleteProfile, userProfile?.uid, userProfile?.birthDate, userProfile?.birthTime, userProfile?.birthPlace, userProfile?.displayName])

  const loadCurrentTransits = useCallback(async (signal?: AbortSignal) => {
    if (!hasCompleteProfile || !userProfile?.uid) return

    setTransitsError(null)
    // getCurrentChart returns a Promise; transit payload is stored in chartUrl
    try {
      const stored = await getCurrentChart(userProfile.uid || 'default', 'kp-astrology')
      const payload = stored && typeof (stored as { chartUrl?: unknown }).chartUrl === 'object' && (stored as { chartUrl: unknown }).chartUrl !== null
        ? (stored as { chartUrl: { activeTransits?: unknown[]; upcomingTransits?: unknown[] } }).chartUrl
        : null
      if (payload && (Array.isArray(payload.activeTransits) || Array.isArray(payload.upcomingTransits))) {
        if (signal?.aborted) return
        setCurrentTransits(payload)
        setTransitsError(null)
        devLog.debug('✅ Loaded current transits from cache')
        return
      }
    } catch (e) {
      devLog.warn('⚠️ Failed to read transit cache:', e, 'page')
    }

    await fetchCurrentTransits(signal)
  }, [hasCompleteProfile, userProfile?.uid, fetchCurrentTransits])

  // Load transits on mount when profile is complete so the tab is not blank
  useEffect(() => {
    if (!hasCompleteProfile || !userProfile?.uid) return
    const ac = new AbortController()
    void loadCurrentTransits(ac.signal)
    return () => ac.abort()
  }, [hasCompleteProfile, userProfile?.uid, loadCurrentTransits])

  const performKPAnalysis = useCallback(async () => {
    if (!hasCompleteProfile) {
      setError('Please complete your profile with birth date, time, and place')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      devLog.debug('🔄 Generating KP Astrology report...')
      
      const formattedBirthData = {
        birthDate: userProfile.birthDate,
        birthTime: userProfile.birthTime,
        birthPlace: userProfile.birthPlace,
        displayName: userProfile.fullName || userProfile.displayName || 'User'
      }
      
      // Generate KP astrology report using the new API endpoint
      devLog.debug('📡 Calling KP astrology API endpoint...', {
        userId: userProfile.uid,
        birthData: formattedBirthData
      })

      const response = await fetch('/api/tools/kp-astrology/generate-real', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userProfile.uid || 'user',
          birthData: formattedBirthData
        })
      })

      devLog.debug('📡 API Response status:', response.status, response.statusText)

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch (e) {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        devLog.error('❌ API Error Response:', errorData, 'page')
        throw new Error(errorData.error || `Failed to generate KP astrology report (${response.status})`)
      }

      const result = await response.json()
      devLog.debug('📡 API Response received:', {
        success: result.success,
        hasData: !!result.data,
        dataKeys: result.data ? Object.keys(result.data) : []
      })
      
      if (!result.success) {
        devLog.error('❌ API returned error:', result.error, 'page')
        throw new Error(result.error || 'Failed to generate KP astrology report')
      }

      if (!result.data) {
        devLog.error('❌ API response missing data field', undefined, 'page')
        throw new Error('API response missing data field')
      }

      const kpData = result.data // This is KPAnalysis from intelligence service
      devLog.debug('✅ KP Astrology data received:', {
        hasAscendant: !!kpData.ascendant,
        ascendantSign: kpData.ascendant?.sign,
        hasPlanets: !!kpData.planets && kpData.planets.length > 0,
        planetsCount: kpData.planets?.length || 0,
        hasCusps: !!kpData.cusps && kpData.cusps.length > 0,
        cuspsCount: kpData.cusps?.length || 0,
        hasSubLords: !!kpData.subLords && kpData.subLords.length > 0,
        subLordsCount: kpData.subLords?.length || 0,
        hasTimingAnalysis: !!kpData.timingAnalysis,
        timingDasha: kpData.timingAnalysis?.dasha,
        hasSignifications: !!kpData.significations,
        hasPredictions: !!kpData.predictions
      })
      
      // Transform KP analysis to page format
      const sunPlanet = kpData.planets?.find((p: any) => p.name === 'Sun')
      const moonPlanet = kpData.planets?.find((p: any) => p.name === 'Moon')
      const venusPlanet = kpData.planets?.find((p: any) => p.name === 'Venus')
      
      // Create KP astrology analysis in page format
      const analysisData: KPAnalysis = {
        basicInfo: {
          name: userProfile.fullName || 'User',
          dateOfBirth: userProfile.birthDate || '',
          timeOfBirth: userProfile.birthTime || '',
          placeOfBirth: userProfile.birthPlace || ''
        },
        // Store raw KP data for access
        rawAstroAppData: {
          ascendant: kpData.ascendant,
          planetary_positions: kpData.planets?.map((p: any) => ({
            planet: p.name,
            sign: p.sign,
            degree: p.degree,
            house: p.house,
            nakshatra: p.nakshatra,
            sublord: p.subLord,
            starLord: p.starLord
          })) || [],
          significations: kpData.significations || {},
          sublord_analysis: {
            summary: {
              totalSublords: kpData.subLords?.length || 0,
              dominantSublord: kpData.subLords?.[0]?.planet || 'Unknown',
              strongestSublord: kpData.subLords?.[0]?.planet || 'Unknown'
            },
            sublords: kpData.subLords?.map((sl: any) => ({
              planet: sl.planet,
              sublord: sl.subLords?.[0] || sl.planet,
              influence: sl.significations?.join(', ') || 'KP analysis pending',
              strength: 'moderate'
            })) || []
          },
          dasha_forecast: [{
            planet: kpData.timingAnalysis?.dasha || 'Moon',
            description: kpData.timingAnalysis?.currentPeriod || 'Current dasha period',
            antardasha: kpData.timingAnalysis?.antardasha || 'Unknown',
            pratyantardasha: kpData.timingAnalysis?.pratyantardasha || 'Unknown',
            nextPeriod: kpData.timingAnalysis?.nextPeriod || 'Unknown',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            focus_area: kpData.significations?.career?.[0] || 'General life matters',
            likely_events: kpData.predictions?.shortTerm || 'KP predictions pending'
          }],
          predictions: kpData.predictions || {},
          remedies: kpData.predictions?.remedies?.map((r: string) => ({
            type: 'General',
            remedy: r,
            benefits: 'Based on KP sub-lord analysis'
          })) || [],
          house_analysis: kpData.cusps?.map((c: any) => ({
            house: c.house,
            sign: c.sign,
            degree: c.degree,
            sublord: c.subLord
          })) || []
        },
        isRealData: true,
        sunSign: sunPlanet?.sign || 'Unknown',
        moonSign: moonPlanet?.sign || 'Unknown',
        ascendant: kpData.ascendant?.sign || 'Unknown',
        // Add interpretations based on real data
        interpretations: {
          personality: `As a ${sunPlanet?.sign || 'Sun'} sign with ${moonPlanet?.sign || 'Moon'} in your emotional nature, your KP chart reveals unique characteristics based on sub-lord influences.`,
          lifePath: `Your ${kpData.ascendant?.sign || 'Rising Sign'} with ${kpData.ascendant?.subLord || 'sub-lord'} sublord suggests a life journey focused on personal development and growth.`,
          career: kpData.significations?.career?.join(', ') || 'KP career analysis pending',
          relationships: kpData.significations?.relationships?.join(', ') || 'KP relationship analysis pending',
          health: kpData.significations?.health?.join(', ') || 'KP health analysis pending',
          wealth: kpData.significations?.wealth?.join(', ') || 'KP wealth analysis pending',
          spiritual: `Your KP chart reveals spiritual insights through ${kpData.ascendant?.nakshatra || 'nakshatra'} and sub-lord connections.`,
          strengths: kpData.predictions?.remedies?.slice(0, 3).map((r: any) => typeof r === 'string' ? r : r.name || r.description || 'Strength') || ['Natural leadership', 'Creative expression', 'Intellectual depth'],
          challenges: ['Perfectionism', 'Emotional sensitivity', 'High expectations'],
          recommendations: kpData.predictions?.remedies?.map((r: any) => typeof r === 'string' ? r : r.name || r.description || 'Recommendation') || ['Practice self-compassion', 'Develop emotional boundaries', 'Embrace imperfection'],
          kpSpecific: {
            sublords: kpData.subLords?.map((sl: any) => `${sl.planet}: ${sl.subLords?.[0] || 'Unknown'} sublord`) || ['Detailed sublord analysis would go here'],
            dashaPeriods: [`${kpData.timingAnalysis?.dasha || 'Moon'} Dasha: ${kpData.timingAnalysis?.currentPeriod || 'Current period'}`],
            transits: ['Important planetary transits'],
            predictions: [kpData.predictions?.shortTerm || 'KP predictions pending']
          }
        }
      }

      devLog.debug('✅ KP analysis data transformed successfully:', {
        hasBasicInfo: !!analysisData.basicInfo,
        hasRawData: !!analysisData.rawAstroAppData,
        hasInterpretations: !!analysisData.interpretations,
        sunSign: analysisData.sunSign,
        moonSign: analysisData.moonSign,
        ascendant: analysisData.ascendant
      })

      setAnalysis(analysisData)
      setError(null)
      
      // Store as permanent data (birth chart doesn't change)
      // Note: storePermanentChart stores data in chartUrl property, so we need to pass it as a string or JSON
      // But since we're storing an object, we'll JSON.stringify it for proper storage
      try {
        // Store using the chart storage - the data goes into chartUrl property
        // We need to pass birthData separately for validation
        const birthDataForStorage = {
          birthDate: userProfile.birthDate || '',
          birthTime: userProfile.birthTime || '',
          birthPlace: userProfile.birthPlace || '',
          displayName: userProfile.fullName || userProfile.displayName || 'User'
        }
        
        // Use ChartStorage instance directly to include birthData for validation
        // The export wrapper storeChart doesn't support birthData parameter properly
        // Note: storeChart is async but we don't await it since caching failure shouldn't block the UI
        ChartStorage.getInstance().storeChart(
          userProfile.uid || 'default', 
          'kp-astrology' as any, 
          JSON.stringify(analysisData), // Store as JSON string in chartUrl
          'futureseer-generator',
          birthDataForStorage,
          { analysisData } // Also store in metadata for easier retrieval
        ).catch(err => {
          devLog.warn('⚠️ Failed to store chart:', err, 'page')
        })
        
        devLog.debug('✅ KP analysis stored in cache with birth data validation')
      } catch (cacheError) {
        devLog.warn('⚠️ Failed to cache KP analysis:', cacheError, 'page')
        // Don't throw - caching failure shouldn't prevent analysis display
      }
      
      // Also load current transits (don't wait for it to complete)
      loadCurrentTransits().catch(err => {
        devLog.warn('⚠️ Failed to load current transits:', err, 'page')
        // Don't throw - transits are optional
      })
      
    } catch (err: any) {
      devLog.error('❌ KP Astrology analysis failed:', {
        error: err,
        message: err.message,
        stack: err.stack,
        name: err.name
      }, 'page')
      const errorMessage = err.message || 'Failed to perform KP astrology analysis'
      setError(errorMessage)
      setAnalysis(null) // Clear any partial analysis on error
    } finally {
      setIsLoading(false)
      devLog.debug('✅ KP analysis process completed, loading state:', false)
    }
  }, [hasCompleteProfile, userProfile?.uid, userProfile?.birthDate, userProfile?.birthTime, userProfile?.birthPlace, userProfile?.fullName, userProfile?.displayName, loadCurrentTransits])

  if (!hasCompleteProfile) {
    return (
      <div className="min-h-screen p-4 starfield-ultra-sharp">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-12 max-w-2xl mx-auto shadow-md">
              <User className="w-24 h-24 text-amber-700 mx-auto mb-6" />
              <h1 className="text-4xl font-bold text-amber-900 mb-6">Complete Your Profile</h1>
              <p className="text-slate-700 text-lg mb-8 leading-relaxed">
                To unlock your KP astrology reading, please complete your cosmic profile with your birth details.
              </p>
              <motion.a
                href="/profile"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300"
                whileHover={{ y: -2 }}
              >
                <User className="w-5 h-5" />
                Complete Profile
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <ToolReportGuard loading={isLoadingPipeline} error={profileError ?? null} toolLabel="KP Astrology">
    <div className="starfield-ultra-sharp min-h-screen p-4">
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 pt-4"
        >
          <h1 className="text-5xl font-bold gold-glow mb-6">
            <span className="text-yellow-400">🎯</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">KP Astrology</span>
          </h1>
          <p className="text-slate-200 leading-relaxed text-xl font-light mb-8">
            Krishnamurti Paddhati - The most precise system of astrological predictions
          </p>
          <ToolReportStatusChips
            freshnessLabel={freshnessLabel}
            reportUnchanged={reportUnchanged}
            className="mb-6"
          />
          {/* Inspirational Quote */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-6 shadow-md max-w-2xl mx-auto">
            <p className="text-xl italic text-amber-900 font-serif mb-2">
              "In the precise calculations of KP Astrology lies the mathematical key to unlocking the exact timing of destiny's unfolding."
            </p>
            <p className="text-slate-700 text-sm">— Prof. K.S. Krishnamurti</p>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-12 max-w-2xl mx-auto shadow-md">
              <Loader2 className="w-16 h-16 text-amber-700 mx-auto mb-6 animate-spin" />
              <h2 className="text-2xl font-bold text-amber-900 mb-4">Calculating Sublords</h2>
              <p className="text-slate-700 text-lg">Generating your KP astrology analysis...</p>
            </div>
                    </motion.div>
        )}

        {/* Error State - Always visible when error exists */}
        {error && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
            className="text-center py-8 mb-8"
          >
            <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-2xl p-8 max-w-2xl mx-auto shadow-md">
              <h2 className="text-2xl font-bold text-red-700 mb-4">Analysis Error</h2>
              <p className="text-slate-700 text-lg mb-6">{error}</p>
              <Button asChild className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold">
                <Link href="/profile">Generate your mystical profile</Link>
              </Button>
            </div>
                  </motion.div>
                )}

        {/* CTA when no analysis from pipeline */}
        {hasCompleteProfile && !analysis && !isLoadingAny && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 mb-8"
          >
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-8 max-w-2xl mx-auto shadow-md">
              <Target className="w-16 h-16 text-amber-700 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-amber-900 mb-4">KP Astrology Analysis</h2>
              <p className="text-slate-700 text-lg mb-6 leading-relaxed">
                Generate your mystical profile to get your KP astrology analysis and precise timing predictions based on sub-lords and cusps.
              </p>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-2 mx-auto">
                <Link href="/profile">
                  <Target className="w-5 h-5" />
                  Generate your mystical profile
                </Link>
              </Button>
            </div>
          </motion.div>
        )}

        {/* Tab Navigation - Always visible when profile is complete */}
        {hasCompleteProfile && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {showKpViral && !bypassViral && (
            <div className="space-y-4">
              <TeaserView teaser={kpTeaser} />
              {showShareCard && (
                <ShareCard
                  archetypeName={kpTeaser.archetypeName}
                  hookLine={kpTeaser.hookLine}
                  shareUrl={viralUnlock.shareUrl}
                  onCopy={copyLink}
                  onShare={nativeShare}
                />
              )}
              {waitingLite && (
                <p className="text-center text-sm text-amber-200/90">Unlocking lighter view in a few seconds…</p>
              )}
            </div>
          )}

          {showKpViral && viralUnlock.isUnlocked && !bypassViral && (
            <div className="flex justify-center">
              <Link
                href={kpCompareHref}
                className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-950/40 px-4 py-2 text-sm font-medium text-violet-100 hover:bg-violet-900/50"
              >
                <Users className="h-4 w-4" />
                Compare with a friend
              </Link>
            </div>
          )}

          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="w-full min-w-0">
              <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
                {tabsConfig.map((tab) => (
                  <motion.div
                    key={tab.value}
                    whileHover={{}}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                    transition={prefersReducedMotion ? {} : { type: 'spring', stiffness: 400, damping: 17 }}
                    className="relative shrink-0"
                  >
                    <TabsTrigger
                      value={tab.value}
                      className="w-full sm:w-auto shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center relative overflow-hidden border border-transparent data-[state=inactive]:border-slate-600/50"
                    >
                      {tab.label}
                      {activeTab === tab.value && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-t-lg rounded-b-none -z-10"
                          transition={prefersReducedMotion ? {} : { type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </TabsTrigger>
                  </motion.div>
                ))}
              </TabsList>

            {analysis && isKpChartsV2Enabled() && (
              <div className="pt-6 px-4 sm:px-6 pb-2">
                <Phase2VisualPanel
                  charts={[
                    adaptKpOverlay({
                      title: 'KP Overlay (Phase 2 Preview)',
                      points: (() => {
                        const chart = (analysis as Record<string, unknown>)?.chart as Record<string, unknown> | undefined;
                        const planets = chart?.planets as Array<Record<string, unknown>> | undefined;
                        if (!Array.isArray(planets)) return [];
                        return planets.slice(0, 12).map((planet, index) => ({
                          id: String(planet.name ?? `p${index}`),
                          label: String(planet.name ?? `P${index + 1}`),
                          longitude: Number(planet.longitude ?? planet.lon ?? 0),
                          house: Number(planet.house ?? 0),
                        }));
                      })(),
                    }),
                  ]}
                />
              </div>
            )}

            {activeTab === 'kp_astrology_expert' && analysis ? (
              <motion.div
                key="kp-expert"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-6 shadow-md pt-6 px-4 sm:px-6 pb-6 mt-0">
                  <KPSeerChatInterface
                    analysis={transformToKPIntelligenceAnalysis() ?? undefined}
                    userId={user?.uid ?? userProfile?.uid}
                    userProfile={userProfile}
                    sessionId={userProfile?.uid ? `kp_${userProfile.uid}` : undefined}
                  />
                </div>
              </motion.div>
            ) : showKpViral && !viralUnlock.hydrated ? (
              <div className="py-12 text-center text-slate-400">Loading report…</div>
            ) : (
              <div className="relative min-h-[320px]">
                {kpLocked && (
                  <ViralLockOverlay
                    onUnlockClick={handleShareToUnlock}
                    onContinueWithoutSharing={waitingLite ? () => {} : continueWithoutSharing}
                    continueDisabled={waitingLite}
                  />
                )}
                <div
                  className={cn(
                    kpLocked &&
                      'pointer-events-none select-none blur-sm filter transition-[filter] duration-300 [&_*]:pointer-events-none'
                  )}
                >
            {/* Tab Content - Introduction always visible; other tabs show empty state when no analysis */}
            <AnimatePresence mode="wait">
              {activeTab === 'introduction' ? (
                <motion.div
                  key="introduction"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <TabsContent value="introduction" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                    <ToolIntroductionTab toolSlug="kp-astrology" />
                  </TabsContent>
                </motion.div>
              ) : !analysis ? (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-12 text-center shadow-md"
                >
                  <Target className="w-16 h-16 text-amber-700 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-amber-900 mb-4">
                    {activeTab === 'chart_images' && 'No Chart Data Available'}
                    {activeTab === 'planetary_positions' && 'No Planetary Positions Available'}
                    {activeTab === 'sublord_analysis' && 'No Sublord Analysis Available'}
                    {activeTab === 'dasha_forecast' && 'No Dasha Forecast Available'}
                    {activeTab === 'remedies' && 'No Remedies Available'}
                    {activeTab === 'current_transits' && 'No Transits Available'}
                    {activeTab === 'kp_astrology_expert' && 'No Analysis Available'}
                  </h3>
                  <p className="text-slate-700 text-lg mb-6">
                    Generate your KP astrology analysis to view {activeTab === 'chart_images' ? 'chart data' : activeTab === 'kp_astrology_expert' ? 'the expert' : activeTab.replace('_', ' ').toLowerCase()} here.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="analysis-content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {/* Chart Images Tab (only when analysis exists) */}
            {activeTab === 'chart_images' && (
              <motion.div
                key="charts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {analysis?.rawAstroAppData?.planetary_positions && analysis.rawAstroAppData.house_analysis ? (() => {
                  // Transform KP analysis data into chart format for VedicNorthChart/VedicSouthChart
                  const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
                  const getSignIndex = (signName: string): number => {
                    const index = signNames.findIndex(s => s.toLowerCase() === signName.toLowerCase())
                    return index >= 0 ? index : 0
                  }

                  const planets: Record<string, any> = {}
                  analysis.rawAstroAppData.planetary_positions.forEach((planet: any) => {
                    const planetKey = planet.planet?.toLowerCase() || planet.name?.toLowerCase()
                    if (planetKey) {
                      const signName = planet.sign || 'Aries'
                      const signIndex = getSignIndex(signName)
                      const dignity = calculatePlanetaryDignity(planet.planet || planet.name, signIndex, signName)
                      planets[planetKey] = {
                        name: planet.planet || planet.name,
                        house: planet.house || 1,
                        sign: signIndex,
                        signName: signName,
                        degree: planet.degree || 0,
                        nakshatra: planet.nakshatra,
                        sublord: planet.sublord,
                        dignity: dignity
                      }
                    }
                  })

                  const houses = analysis.rawAstroAppData.house_analysis.slice(0, 12).map((house: any, index: number) => {
                    const signName = house.sign || signNames[index] || 'Aries'
                    return {
                      house: house.house || (index + 1),
                      signName: signName,
                      sign: getSignIndex(signName),
                      lord: house.lord || 'Sun',
                      degree: house.degree || 0,
                      sublord: house.sublord
                    }
                  })

                  const chartData = {
                    planets,
                    houses,
                    ascendant: analysis.rawAstroAppData.ascendant ? {
                      signName: analysis.rawAstroAppData.ascendant.sign,
                      sign: houses.findIndex((h: any) => h.signName === analysis.rawAstroAppData.ascendant.sign),
                      degree: analysis.rawAstroAppData.ascendant.degree || 0,
                      nakshatra: analysis.rawAstroAppData.ascendant.nakshatra,
                      sublord: analysis.rawAstroAppData.ascendant.subLord
                    } : null,
                    metadata: {
                      ayanamsha: 'KP',
                      system: 'Placidus',
                      chartType: 'KP Astrology'
                    }
                  }

                  // Transform planets for NorthIndianVedicChart
                  const transformedPlanets = transformKPPlanetsForChart(analysis.rawAstroAppData.planetary_positions || [])
                  
                  // Calculate ascendant sign and degree for NorthIndianVedicChart
                  const ascendantSign = analysis.rawAstroAppData.ascendant 
                    ? getSignIndex(analysis.rawAstroAppData.ascendant.sign || 'Aries')
                    : 0
                  const ascendantDegree = analysis.rawAstroAppData.ascendant?.degree || 0

                  return (
                    <>
                      {/* Chart Images Display */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        {/* North Indian Chart */}
                        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow duration-300">
                          <h3 className="text-2xl font-bold text-amber-900 mb-6 text-center flex items-center justify-center gap-3">
                            <Globe className="w-6 h-6 text-amber-700" />
                            North Indian Chart
                          </h3>
                          <ResponsiveChartWrap>
                            <NorthIndianVedicChart
                              planets={transformedPlanets}
                              ascendantSign={ascendantSign}
                              ascendantDegree={ascendantDegree}
                              chartType="KP"
                              width={CHART_CANVAS_W}
                              height={CHART_CANVAS_H}
                            />
                      </ResponsiveChartWrap>
                </div>

                        {/* South Indian Chart */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow duration-300">
                          <h3 className="text-2xl font-bold text-purple-900 mb-6 text-center flex items-center justify-center gap-3">
                            <Globe className="w-6 h-6 text-purple-700" />
                            South Indian Chart
                          </h3>
                          <ResponsiveChartWrap>
                            <VedicSouthChart chart={chartData} />
                    </ResponsiveChartWrap>
                    </div>
                    </div>

                      {/* Chart Summary */}
                      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-300 rounded-2xl p-6 shadow-md">
                        <h3 className="text-xl font-bold text-cyan-900 mb-4 text-center">Chart Summary</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white rounded-xl p-4 border-2 border-cyan-200 text-center shadow-sm">
                            <p className="text-slate-600 text-sm mb-1">Total Planets</p>
                            <p className="text-cyan-900 text-2xl font-bold">{analysis.rawAstroAppData.planetary_positions?.length || 9}</p>
                  </div>
                          <div className="bg-white rounded-xl p-4 border-2 border-cyan-200 text-center shadow-sm">
                            <p className="text-slate-600 text-sm mb-1">House Cusps</p>
                            <p className="text-cyan-900 text-2xl font-bold">{analysis.rawAstroAppData.house_analysis?.length || 12}</p>
                </div>
                          <div className="bg-white rounded-xl p-4 border-2 border-cyan-200 text-center shadow-sm">
                            <p className="text-slate-600 text-sm mb-1">Sub-Lords</p>
                            <p className="text-cyan-900 text-2xl font-bold">{analysis.rawAstroAppData.sublord_analysis?.summary?.totalSublords || 9}</p>
                    </div>
                          <div className="bg-white rounded-xl p-4 border-2 border-cyan-200 text-center shadow-sm">
                            <p className="text-slate-600 text-sm mb-1">Ascendant</p>
                            <p className="text-amber-700 text-lg font-bold">{analysis.rawAstroAppData.ascendant?.sign || 'N/A'}</p>
                    </div>
                      </div>
                        <p className="text-slate-700 text-sm italic text-center mt-4">
                          Your KP birth chart uses Placidus house system with sub-lord analysis based on Vimshottari dasha divisions.
                        </p>
                  </div>
                    </>
                  )
                })() : (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-2xl p-12 text-center shadow-md">
                    <Star className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-700 text-lg">Chart images will be generated based on your KP analysis</p>
                    <p className="text-slate-600 text-sm mt-2">Generate your KP analysis to view chart images</p>
                </div>
                )}
              </motion.div>
            )}

            {/* Planetary Positions Tab */}
            {activeTab === 'planetary_positions' && (
              <motion.div
                key="planets"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-300 rounded-2xl p-8 shadow-md">
                  <h2 className="text-3xl font-bold text-green-900 mb-6 text-center flex items-center justify-center gap-3">
                    <Zap className="w-8 h-8 text-green-700" />
                    Planetary Positions with Sublords
                  </h2>
                  
                  {analysis.rawAstroAppData?.planetary_positions ? (
                    <>
                      {/* Planetary Summary */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-lg p-4 text-center border-2 border-green-200 shadow-sm">
                          <h4 className="text-green-700 font-medium mb-1">Total Planets</h4>
                          <p className="text-green-900 text-2xl font-bold">{analysis.rawAstroAppData.planetary_positions.length}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border-2 border-green-200 shadow-sm">
                          <h4 className="text-green-700 font-medium mb-1">Unique Signs</h4>
                          <p className="text-green-900 text-2xl font-bold">
                            {new Set(analysis.rawAstroAppData.planetary_positions.map((p: any) => p.sign)).size}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border-2 border-green-200 shadow-sm">
                          <h4 className="text-green-700 font-medium mb-1">Unique Houses</h4>
                          <p className="text-green-900 text-2xl font-bold">
                            {new Set(analysis.rawAstroAppData.planetary_positions.map((p: any) => p.house)).size}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border-2 border-green-200 shadow-sm">
                          <h4 className="text-green-700 font-medium mb-1">Unique Sublords</h4>
                          <p className="text-green-900 text-2xl font-bold">
                            {new Set(analysis.rawAstroAppData.planetary_positions.map((p: any) => p.sublord)).size}
                          </p>
                        </div>
                      </div>

                      {/* Personality Insights Section */}
                      {analysis.interpretations?.personality && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-2xl p-6 mb-8 border-2 border-purple-300 shadow-md"
                        >
                          <div className="flex items-start gap-4">
                            <Brain className="w-8 h-8 text-purple-700 flex-shrink-0 mt-1" />
                            <div>
                              <h3 className="text-xl font-bold text-purple-900 mb-2">Personality Insights</h3>
                              <p className="text-slate-700 leading-relaxed">{analysis.interpretations.personality}</p>
                              {analysis.interpretations.lifePath && (
                                <p className="text-slate-600 mt-3 italic leading-relaxed">{analysis.interpretations.lifePath}</p>
                              )}
                              </div>
                            </div>
                        </motion.div>
                      )}

                      {/* Detailed Planetary Positions with Interpretations */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {analysis.rawAstroAppData.planetary_positions.slice(0, 9).map((planet: any, index: number) => {
                          const interpretation = getPlanetInterpretation(
                            planet.planet,
                            planet.sign,
                            planet.house,
                            planet.nakshatra || 'Unknown',
                            planet.sublord || 'Unknown'
                          )
                          const houseStrength = [1, 4, 5, 7, 9, 10].includes(planet.house) ? 'strong' : 
                                               [6, 8, 12].includes(planet.house) ? 'weak' : 'moderate'
                          
                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="bg-white rounded-xl p-5 border-2 border-green-200 hover:border-green-400 transition-all duration-300 shadow-sm"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-slate-900 font-bold text-lg">{planet.planet}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 border border-purple-200">
                                    {planet.sign}
                                  </span>
                                  <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 border border-blue-200">
                                    {planet.house}H
                                  </span>
                              </div>
                              </div>
                              
                              {/* Strength Indicator */}
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-slate-600">Planetary Strength</span>
                                  <span className={`text-xs font-medium ${
                                    houseStrength === 'strong' ? 'text-green-700' :
                                    houseStrength === 'weak' ? 'text-red-700' : 'text-amber-700'
                                  }`}>
                                    {houseStrength.charAt(0).toUpperCase() + houseStrength.slice(1)}
                                  </span>
                              </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all duration-500 ${
                                      houseStrength === 'strong' ? 'bg-green-600 w-4/5' :
                                      houseStrength === 'weak' ? 'bg-red-600 w-2/5' : 'bg-amber-600 w-3/5'
                                    }`}
                                  />
                              </div>
                            </div>

                              <div className="space-y-3 text-sm mb-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-600">Sign:</span>
                                  <span className="text-slate-900 font-medium">{planet.sign}</span>
                          </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-600">House:</span>
                                  <span className="text-slate-900 font-medium">{planet.house}</span>
                      </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-600">Degree:</span>
                                  <span className="text-slate-900 font-medium">{planet.degree}°</span>
                    </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-600">Nakshatra:</span>
                                  <span className="text-purple-700 font-medium">{planet.nakshatra || 'Unknown'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-600">Star Lord:</span>
                                  <span className="text-blue-700 font-medium">{planet.starLord || 'Unknown'}</span>
                                </div>
                                <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                                  <span className="text-amber-700 font-medium">Sub-Lord:</span>
                                  <span className="text-amber-800 font-bold">{planet.sublord || 'Unknown'}</span>
                                </div>
                </div>

                              {/* Interpretation */}
                              <div className="mt-4 pt-4 border-t border-slate-200">
                                <p className="text-xs text-slate-700 leading-relaxed italic">
                                  {interpretation}
                                </p>
                              </div>
                            </motion.div>
                          )
                        })}
                    </div>
                    
                      {/* Life Area Significations */}
                      {analysis.rawAstroAppData?.significations && Object.keys(analysis.rawAstroAppData.significations).length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-8"
                        >
                          <h3 className="text-2xl font-bold text-green-900 mb-6 text-center flex items-center justify-center gap-3">
                            <TrendingUp className="w-6 h-6 text-green-700" />
                            Life Area Significations
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {analysis.rawAstroAppData.significations.career && (
                              <div className="bg-white rounded-xl p-5 border-2 border-blue-300 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                  <Briefcase className="w-6 h-6 text-blue-700" />
                                  <h4 className="text-lg font-bold text-blue-900">Career</h4>
                                </div>
                                <ul className="space-y-2">
                                  {Array.isArray(analysis.rawAstroAppData.significations.career) 
                                    ? analysis.rawAstroAppData.significations.career.map((sig: string, idx: number) => (
                                        <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                          <Star className="w-3 h-3 text-amber-600 mt-1 flex-shrink-0" />
                                          <span>{sig}</span>
                                        </li>
                                      ))
                                    : <li className="text-sm text-slate-700">{analysis.rawAstroAppData.significations.career}</li>
                                  }
                                </ul>
                              </div>
                            )}
                            {analysis.rawAstroAppData.significations.relationships && (
                              <div className="bg-white rounded-xl p-5 border-2 border-pink-300 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                  <Heart className="w-6 h-6 text-pink-700" />
                                  <h4 className="text-lg font-bold text-pink-900">Relationships</h4>
                    </div>
                                <ul className="space-y-2">
                                  {Array.isArray(analysis.rawAstroAppData.significations.relationships)
                                    ? analysis.rawAstroAppData.significations.relationships.map((sig: string, idx: number) => (
                                        <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                          <Star className="w-3 h-3 text-amber-600 mt-1 flex-shrink-0" />
                                          <span>{sig}</span>
                                        </li>
                                      ))
                                    : <li className="text-sm text-slate-700">{analysis.rawAstroAppData.significations.relationships}</li>
                                  }
                                </ul>
                      </div>
                    )}
                            {analysis.rawAstroAppData.significations.wealth && (
                              <div className="bg-white rounded-xl p-5 border-2 border-amber-300 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                  <TrendingUp className="w-6 h-6 text-amber-700" />
                                  <h4 className="text-lg font-bold text-amber-900">Wealth</h4>
                  </div>
                                <ul className="space-y-2">
                                  {Array.isArray(analysis.rawAstroAppData.significations.wealth)
                                    ? analysis.rawAstroAppData.significations.wealth.map((sig: string, idx: number) => (
                                        <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                          <Star className="w-3 h-3 text-amber-600 mt-1 flex-shrink-0" />
                                          <span>{sig}</span>
                                        </li>
                                      ))
                                    : <li className="text-sm text-slate-700">{analysis.rawAstroAppData.significations.wealth}</li>
                                  }
                                </ul>
                              </div>
                            )}
                            {analysis.rawAstroAppData.significations.health && (
                              <div className="bg-white rounded-xl p-5 border-2 border-green-300 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                  <Activity className="w-6 h-6 text-green-700" />
                                  <h4 className="text-lg font-bold text-green-900">Health</h4>
                                </div>
                                <ul className="space-y-2">
                                  {Array.isArray(analysis.rawAstroAppData.significations.health)
                                    ? analysis.rawAstroAppData.significations.health.map((sig: string, idx: number) => (
                                        <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                          <Star className="w-3 h-3 text-amber-600 mt-1 flex-shrink-0" />
                                          <span>{sig}</span>
                                        </li>
                                      ))
                                    : <li className="text-sm text-slate-700">{analysis.rawAstroAppData.significations.health}</li>
                                  }
                                </ul>
                              </div>
                            )}
                            {analysis.rawAstroAppData.significations.education && (
                              <div className="bg-white rounded-xl p-5 border-2 border-indigo-300 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                  <Brain className="w-6 h-6 text-indigo-700" />
                                  <h4 className="text-lg font-bold text-indigo-900">Education</h4>
                                </div>
                                <ul className="space-y-2">
                                  {Array.isArray(analysis.rawAstroAppData.significations.education)
                                    ? analysis.rawAstroAppData.significations.education.map((sig: string, idx: number) => (
                                        <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                          <Star className="w-3 h-3 text-amber-600 mt-1 flex-shrink-0" />
                                          <span>{sig}</span>
                                        </li>
                                      ))
                                    : <li className="text-sm text-slate-700">{analysis.rawAstroAppData.significations.education}</li>
                                  }
                                </ul>
                              </div>
                            )}
                            {analysis.rawAstroAppData.significations.travel && (
                              <div className="bg-white rounded-xl p-5 border-2 border-cyan-300 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                  <Globe className="w-6 h-6 text-cyan-700" />
                                  <h4 className="text-lg font-bold text-cyan-900">Travel</h4>
                                </div>
                                <ul className="space-y-2">
                                  {Array.isArray(analysis.rawAstroAppData.significations.travel)
                                    ? analysis.rawAstroAppData.significations.travel.map((sig: string, idx: number) => (
                                        <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                          <Star className="w-3 h-3 text-amber-600 mt-1 flex-shrink-0" />
                                          <span>{sig}</span>
                                        </li>
                                      ))
                                    : <li className="text-sm text-slate-700">{analysis.rawAstroAppData.significations.travel}</li>
                                  }
                                </ul>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Zap className="w-16 h-16 text-green-700 mx-auto mb-4" />
                      <p className="text-slate-700 text-lg">Planetary positions will be calculated based on your birth details</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Sublord Analysis Tab */}
            {activeTab === 'sublord_analysis' && (
              <motion.div
                key="sublords"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-2xl p-8 shadow-md">
                  <h2 className="text-3xl font-bold text-purple-900 mb-6 text-center flex items-center justify-center gap-3">
                    <Target className="w-8 h-8 text-purple-700" />
                    Sublord Analysis
                  </h2>
                  
                  {(() => {
                    const raw = analysis.rawAstroAppData
                    const fromPipeline = raw?.sublord_analysis
                    const planets = raw?.planetary_positions || []
                    const hasPlanets = Array.isArray(planets) && planets.length > 0
                    const derivedSublords = hasPlanets && !fromPipeline?.sublords?.length
                      ? planets.map((p: any) => ({
                          planet: p.planet || p.name || 'Planet',
                          sublord: p.sublord || p.subLord || 'Unknown',
                          influence: p.nakshatra ? `${p.planet || p.name} in ${p.sign || ''} (${p.nakshatra}) — sub-lord influences timing and significations.` : 'KP sub-lord analysis based on Vimshottari dasha system.',
                          strength: 'moderate'
                        }))
                      : fromPipeline?.sublords || []
                    const summary = fromPipeline?.summary || (derivedSublords.length > 0 ? {
                      totalSublords: derivedSublords.length,
                      dominantSublord: (() => {
                        const counts: Record<string, number> = {}
                        derivedSublords.forEach((s: any) => { const sl = s.sublord || 'Unknown'; counts[sl] = (counts[sl] || 0) + 1 })
                        return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'
                      })(),
                      strongestSublord: derivedSublords[0]?.sublord || 'Unknown'
                    } : null)
                    const hasContent = (summary && (summary.totalSublords > 0 || summary.dominantSublord)) || derivedSublords.length > 0 || (raw?.house_analysis && raw.house_analysis.length > 0)
                    return hasContent ? (
                    <>
                      {/* Sublord Summary */}
                      {summary && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-lg p-4 text-center border-2 border-purple-200 shadow-sm">
                          <h4 className="text-purple-700 font-medium mb-1">Total Sublords</h4>
                          <p className="text-purple-900 text-2xl font-bold">{summary.totalSublords ?? 0}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border-2 border-purple-200 shadow-sm">
                          <h4 className="text-purple-700 font-medium mb-1">Dominant Sublord</h4>
                          <p className="text-purple-900 text-xl font-bold">{summary.dominantSublord || 'Unknown'}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border-2 border-purple-200 shadow-sm">
                          <h4 className="text-purple-700 font-medium mb-1">Strongest Sublord</h4>
                          <p className="text-purple-900 text-xl font-bold">{summary.strongestSublord || 'Unknown'}</p>
                        </div>
                      </div>
                      )}

                      {/* Sublord Details */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-purple-900 mb-4">Sub-Lord Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {derivedSublords.map((sublord: any, index: number) => (
                            <div key={index} className="bg-white rounded-lg p-4 border-2 border-purple-200 shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-slate-900 font-medium">{sublord.planet || `Planet ${index + 1}`}</h4>
                                <span className={`text-xs px-2 py-1 rounded border ${
                                  sublord.strength === 'strong' ? 'bg-green-100 text-green-700 border-green-300' :
                                  sublord.strength === 'moderate' ? 'bg-amber-100 text-amber-700 border-amber-300' :
                                  'bg-red-100 text-red-700 border-red-300'
                                }`}>
                                  {sublord.strength || 'moderate'}
                                </span>
                              </div>
                              <p className="text-sm text-slate-700 mb-2">Sub-Lord: <span className="text-amber-700 font-semibold">{sublord.sublord}</span></p>
                              <p className="text-xs text-slate-600 leading-relaxed">{sublord.influence || 'KP sub-lord analysis based on Vimshottari dasha system'}</p>
                            </div>
                          ))}
                          
                          {/* House Cusp Sub-Lords with Interpretations */}
                          {raw?.house_analysis && raw.house_analysis.length > 0 && (
                            <div className="col-span-full mt-6">
                              <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                                <Home className="w-5 h-5 text-purple-700" />
                                House Cusp Sub-Lords & Interpretations
                              </h3>
                              <p className="text-slate-700 text-sm mb-4 leading-relaxed">
                                Each house cusp has its own sub-lord which influences the timing and outcomes of matters related to that life area. Understanding these sub-lords is crucial for precise KP predictions.
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(raw?.house_analysis || []).slice(0, 12).map((house: any, idx: number) => {
                                  const interpretation = getHouseInterpretation(house.house, house.sign || 'Unknown', house.sublord || 'Unknown')
                                  
                                  return (
                                    <motion.div
                                      key={idx}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: idx * 0.05 }}
                                      className="bg-white rounded-lg p-4 border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 shadow-sm"
                                    >
                                      <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-lg font-bold text-purple-900">House {house.house}</h4>
                                        <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 border border-amber-300">
                                          {house.sublord || 'Unknown'} Sub-Lord
                                        </span>
                        </div>
                                      <div className="mb-3">
                                        <p className="text-xs text-slate-600 mb-1">Sign</p>
                                        <p className="text-sm text-slate-900 font-medium">{house.sign || 'Unknown'}</p>
                      </div>
                                      {house.degree !== undefined && (
                                        <div className="mb-3">
                                          <p className="text-xs text-slate-600 mb-1">Degree</p>
                                          <p className="text-sm text-slate-900 font-medium">{house.degree}°</p>
                    </div>
                  )}
                                      <div className="pt-3 border-t border-slate-200">
                                        <p className="text-xs text-slate-700 leading-relaxed italic">{interpretation}</p>
                </div>
                                    </motion.div>
                                  )
                                })}
                    </div>
                            </div>
                          )}
                    </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Target className="w-16 h-16 text-purple-700 mx-auto mb-4" />
                      <p className="text-slate-700 text-lg">Sublord analysis will be calculated based on your planetary positions.</p>
                    </div>
                  )
                  })()}
                </div>
              </motion.div>
            )}

            {/* Dasha Forecast Tab */}
            {activeTab === 'dasha_forecast' && (
              <motion.div
                key="dashas"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300 rounded-2xl p-8 shadow-md">
                  <h2 className="text-3xl font-bold text-orange-900 mb-6 text-center flex items-center justify-center gap-3">
                    <Clock className="w-8 h-8 text-orange-700" />
                    Dasha Forecast
                  </h2>
                  
                  {analysis?.rawAstroAppData?.dasha_forecast && analysis.rawAstroAppData.dasha_forecast.length > 0 ? (
                    <div className="space-y-6">
                      {analysis.rawAstroAppData.dasha_forecast.map((dasha: any, index: number) => {
                        const dashaInfluence = getDashaInfluence(dasha.planet || 'Moon')
                        let startDate = new Date(dasha.startDate)
                        let endDate = new Date(dasha.endDate)
                        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
                          const birthDate = userProfile?.birthDate
                          const planets = analysis?.rawAstroAppData?.planetary_positions
                          const moon = Array.isArray(planets) ? planets.find((p: any) => (String(p.planet || p.name || '').toLowerCase()) === 'moon') : undefined
                          if (birthDate && moon) {
                            const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
                            const signIndex = signNames.findIndex((s: string) => s.toLowerCase() === String(moon.sign || '').toLowerCase())
                            const moonLon = (signIndex >= 0 ? signIndex : 0) * 30 + (Number(moon.degree) || 0)
                            const derived = deriveDashaDates(birthDate, moonLon)
                            if (derived) {
                              startDate = derived.startDate
                              endDate = derived.endDate
                            }
                          }
                          if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
                            const fallbackEnd = new Date()
                            fallbackEnd.setFullYear(fallbackEnd.getFullYear() + 1)
                            startDate = new Date()
                            endDate = fallbackEnd
                          }
                        }
                        const now = new Date()
                        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                        const elapsedDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                        const progressPercent = totalDays > 0 ? Math.max(0, Math.min(100, (elapsedDays / totalDays) * 100)) : 0
                        const remainingDays = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl p-6 border-2 border-orange-300 shadow-md"
                          >
                            {/* Dasha Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                              <div>
                                <h3 className="text-2xl font-bold text-orange-900 flex items-center gap-3 mb-2">
                                  <Clock className="w-7 h-7 text-orange-700" />
                                  {dasha.planet || 'Moon'} Dasha
                                  {dasha.antardasha && (
                                    <span className="text-lg text-slate-600 font-normal">- {dasha.antardasha} Antardasha</span>
                                  )}
                                </h3>
                                <p className="text-slate-700 text-sm">{dasha.description || dashaInfluence.focus}</p>
                            </div>
                              <div className="text-right">
                                <div className="text-sm text-slate-600 mb-1">Period Duration</div>
                                <div className="text-slate-900 font-semibold">
                                  {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                          </div>
                            </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-6">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-600">Dasha Progress</span>
                                <span className="text-sm font-semibold text-orange-700">{Math.round(progressPercent)}% Complete</span>
                          </div>
                              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progressPercent}%` }}
                                  transition={{ duration: 1, ease: 'easeOut' }}
                                  className="h-full bg-gradient-to-r from-orange-600 to-amber-600 rounded-full"
                                />
                        </div>
                              <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                                <span>{elapsedDays} days elapsed</span>
                                <span>{remainingDays} days remaining</span>
                    </div>
                            </div>

                            {/* Focus Area & Events Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              <div className="bg-orange-50 rounded-lg p-5 border-2 border-orange-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                  <Target className="w-5 h-5 text-orange-700" />
                                  <h4 className="text-lg font-bold text-orange-900">Focus Area</h4>
                                </div>
                                <p className="text-slate-700 leading-relaxed">{dashaInfluence.focus}</p>
                                {dasha.focus_area && (
                                  <p className="text-slate-600 text-sm mt-2 italic">{dasha.focus_area}</p>
                                )}
                              </div>
                              <div className="bg-amber-50 rounded-lg p-5 border-2 border-amber-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                  <Sparkles className="w-5 h-5 text-amber-700" />
                                  <h4 className="text-lg font-bold text-amber-900">Likely Events</h4>
                                </div>
                                <ul className="space-y-2">
                                  {Array.isArray(dashaInfluence.events) ? (
                                    dashaInfluence.events.slice(0, 4).map((event: string, idx: number) => (
                                      <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                        <Star className="w-3 h-3 text-amber-600 mt-1 flex-shrink-0" />
                                        <span>{event}</span>
                                      </li>
                                    ))
                                  ) : (
                                    <li className="text-sm text-slate-700">{dasha.likely_events || dashaInfluence.events || 'Positive developments expected'}</li>
                                  )}
                                </ul>
                    </div>
                            </div>

                            {/* Dasha Details */}
                            {dasha.antardasha && (
                              <div className="bg-slate-50 rounded-lg p-4 mb-4 border-2 border-slate-200">
                                <h4 className="text-slate-900 font-semibold mb-2">Sub-Periods:</h4>
                                <div className="flex flex-wrap gap-3">
                                  {dasha.pratyantardasha && (
                                    <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                                      Pratyantar: {dasha.pratyantardasha}
                                    </span>
                  )}
                </div>
                              </div>
                            )}

                            {/* Next Dasha Preview */}
                            {dasha.nextPeriod && (
                              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <TrendingUp className="w-5 h-5 text-blue-700" />
                                  <h4 className="text-blue-900 font-semibold">Next Dasha Period</h4>
                    </div>
                                <p className="text-slate-900 font-medium">{dasha.nextPeriod}</p>
                                <p className="text-slate-600 text-sm mt-1">
                                  {getDashaInfluence(dasha.nextPeriod.replace(' Dasha', '')).focus}
                                </p>
                              </div>
                            )}
                          </motion.div>
                        )
                      })}
                      
                      {/* Predictions Section */}
                      {analysis?.rawAstroAppData?.predictions && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-xl p-6 border-2 border-purple-300 shadow-md"
                        >
                          <h3 className="text-2xl font-bold text-purple-900 mb-6 text-center flex items-center justify-center gap-3">
                            <Sparkles className="w-6 h-6 text-purple-700" />
                            KP Predictions
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {analysis.rawAstroAppData.predictions.shortTerm && (
                              <div className="bg-green-50 rounded-lg p-5 border-2 border-green-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                  <Zap className="w-5 h-5 text-green-700" />
                                  <h4 className="text-lg font-bold text-green-900">Short Term</h4>
                                </div>
                                <p className="text-slate-700 text-sm leading-relaxed">{analysis.rawAstroAppData.predictions.shortTerm}</p>
                              </div>
                            )}
                            {analysis.rawAstroAppData.predictions.mediumTerm && (
                              <div className="bg-amber-50 rounded-lg p-5 border-2 border-amber-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                  <Clock className="w-5 h-5 text-amber-700" />
                                  <h4 className="text-lg font-bold text-amber-900">Medium Term</h4>
                    </div>
                                <p className="text-slate-700 text-sm leading-relaxed">{analysis.rawAstroAppData.predictions.mediumTerm}</p>
                      </div>
                    )}
                            {analysis.rawAstroAppData.predictions.longTerm && (
                              <div className="bg-blue-50 rounded-lg p-5 border-2 border-blue-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                  <TrendingUp className="w-5 h-5 text-blue-700" />
                                  <h4 className="text-lg font-bold text-blue-900">Long Term</h4>
                  </div>
                                <p className="text-slate-700 text-sm leading-relaxed">{analysis.rawAstroAppData.predictions.longTerm}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Clock className="w-16 h-16 text-orange-700 mx-auto mb-4" />
                      <p className="text-slate-700 text-lg">Dasha forecast will be calculated based on your birth details</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Remedies Tab */}
            {activeTab === 'remedies' && (
              <motion.div
                key="remedies"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-300 rounded-2xl p-8 shadow-md">
                  <h2 className="text-3xl font-bold text-red-900 mb-6 text-center flex items-center justify-center gap-3">
                    <Shield className="w-8 h-8 text-red-700" />
                    KP Remedies
                  </h2>
                  
                  {analysis?.rawAstroAppData?.remedies && analysis.rawAstroAppData.remedies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {analysis.rawAstroAppData.remedies.map((remedy: any, index: number) => {
                        // Handle both old string format and new structured format
                        const isStructured = typeof remedy === 'object' && remedy.name && remedy.type
                        
                        if (!isStructured) {
                          // Legacy string format - skip for now as we should have structured data
                          return null
                        }
                        
                        const getTypeIcon = (type: string) => {
                          switch(type) {
                            case 'gemstone': return <Gem className="w-6 h-6 text-amber-700" />
                            case 'mantra': return <Sparkles className="w-6 h-6 text-blue-700" />
                            case 'ritual': return <Heart className="w-6 h-6 text-red-700" />
                            default: return <Shield className="w-6 h-6 text-purple-700" />
                          }
                        }
                        
                        const getTypeColor = (type: string) => {
                          switch(type) {
                            case 'gemstone': return 'bg-amber-50 border-amber-300'
                            case 'mantra': return 'bg-blue-50 border-blue-300'
                            case 'ritual': return 'bg-red-50 border-red-300'
                            default: return 'bg-purple-50 border-purple-300'
                          }
                        }
                        
                        const priorityBadge = remedy.priority === 'high' ? 'bg-red-100 text-red-800 border-red-300' :
                                              remedy.priority === 'medium' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                                              'bg-blue-100 text-blue-800 border-blue-300'
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`bg-white rounded-xl p-6 border-2 ${getTypeColor(remedy.type)} shadow-md hover:shadow-lg transition-all duration-300`}
                          >
                            <div className="flex items-start gap-3 mb-4">
                              {getTypeIcon(remedy.type)}
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="text-xl font-bold text-slate-900">
                                    {remedy.name}
                                  </h3>
                                  <span className={`text-xs px-2 py-1 rounded border ${priorityBadge}`}>
                                    {remedy.priority} priority
                                  </span>
                            </div>
                                <div className="bg-slate-50 rounded-lg p-3 mb-3 border-2 border-slate-200">
                                  <p className="text-slate-700 text-sm font-medium leading-relaxed">{remedy.description}</p>
                                  {remedy.planet && remedy.planet !== 'General' && (
                                    <p className="text-amber-700 text-xs mt-2">For {remedy.planet} • {remedy.type.charAt(0).toUpperCase() + remedy.type.slice(1)}</p>
                          )}
                        </div>
                              </div>
                            </div>

                            {/* Explanation */}
                            <div className="mb-4">
                              <h4 className="text-blue-900 font-semibold mb-2 flex items-center gap-2">
                                <Info className="w-4 h-4 text-blue-700" />
                                Why This Remedy?
                              </h4>
                              <p className="text-slate-700 text-sm leading-relaxed">{remedy.explanation}</p>
                            </div>

                            {/* Benefits */}
                            {remedy.benefits && Array.isArray(remedy.benefits) && remedy.benefits.length > 0 && (
                              <div className="mb-4 bg-green-50 rounded-lg p-4 border-2 border-green-200">
                                <h4 className="text-green-900 font-semibold mb-2 flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-green-700" />
                                  Benefits
                                </h4>
                                <ul className="space-y-1">
                                  {remedy.benefits.map((benefit: string, idx: number) => (
                                    <li key={idx} className="text-slate-700 text-sm flex items-start gap-2">
                                      <span className="text-green-700 mt-1">•</span>
                                      <span>{benefit}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Instructions */}
                            {remedy.instructions && Array.isArray(remedy.instructions) && remedy.instructions.length > 0 && (
                              <div className="bg-amber-50 rounded-lg p-4 border-2 border-amber-200">
                                <h4 className="text-amber-900 font-semibold mb-2 flex items-center gap-2">
                                  {remedy.type === 'gemstone' ? <Gem className="w-4 h-4 text-amber-700" /> : remedy.type === 'mantra' ? <Sparkles className="w-4 h-4 text-amber-700" /> : <Target className="w-4 h-4 text-amber-700" />}
                                  How to Practice
                                </h4>
                                <ul className="space-y-2">
                                  {remedy.instructions.map((instruction: string, idx: number) => (
                                    <li key={idx} className="text-slate-700 text-sm flex items-start gap-2">
                                      <span className="text-amber-700 mt-1">•</span>
                                      <span>{instruction}</span>
                                    </li>
                                  ))}
                                </ul>
                                {remedy.frequency && (
                                  <p className="text-amber-800 text-xs mt-3 font-medium">
                                    Frequency: {remedy.frequency}
                                  </p>
                                )}
                              </div>
                            )}
                            {remedy.type === 'gemstone' && (
                              <div className="mt-3 text-xs text-amber-700/80 font-medium">
                                Suggested source: local trusted seller
                              </div>
                            )}
                          </motion.div>
                        )
                      }).filter(Boolean)}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Shield className="w-16 h-16 text-red-700 mx-auto mb-4" />
                      <p className="text-slate-700 text-lg">Personalized remedies will be generated based on your chart analysis</p>
                    </div>
                  )}

                  {/* Show predictions with remedies */}
                  {analysis?.interpretations?.recommendations && analysis.interpretations.recommendations.length > 0 && (
                    <div className="mt-6 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-6 shadow-md">
                      <h3 className="text-xl font-semibold text-amber-900 mb-4">KP-Based Recommendations</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {analysis.interpretations.recommendations.map((rec: any, idx: number) => {
                          const recText = typeof rec === 'string' ? rec : (rec?.name || rec?.description || 'Recommendation')
                          return (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="text-amber-700 mt-1">•</span>
                              <p className="text-slate-700">{recText}</p>
                    </div>
                          )
                        })}
                    </div>
                      </div>
                    )}
                </div>
              </motion.div>
            )}

            {/* Current Transits Tab */}
            {activeTab === 'current_transits' && (
              <motion.div
                key="current_transits"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-300 rounded-2xl p-8 shadow-md">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center mr-4">
                        <RefreshCw className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-cyan-900">Current Transits</h2>
                        <p className="text-slate-700 text-sm">Real-time planetary influences affecting your KP timing</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { void fetchCurrentTransits() }}
                      disabled={isLoadingTransits}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 "
                    >
                      {isLoadingTransits ? (
                        <>
                          <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                          Refreshing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 inline mr-2" />
                          Refresh Transits
                        </>
                      )}
                    </button>
                  </div>

                  {currentTransits ? (
                    (currentTransits.activeTransits?.length > 0 || currentTransits.upcomingTransits?.length > 0) ? (
                    <div className="space-y-6">
                        {currentTransits.activeTransits && currentTransits.activeTransits.length > 0 && (
                      <div className="bg-white rounded-xl p-6 border-2 border-cyan-200 shadow-md">
                        <h3 className="text-xl font-semibold text-cyan-900 mb-4">Active KP Transits</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {currentTransits.activeTransits.map((transit: any, index: number) => (
                            <div key={index} className="p-4 bg-cyan-50 rounded-lg border-2 border-cyan-200 shadow-sm">
                              <h4 className="text-slate-900 font-medium">{transit.planet} → {transit.target}</h4>
                                  <p className="text-sm text-slate-700 mt-2">{transit.description}</p>
                              <div className="text-xs text-cyan-800 mt-2">
                                {transit.startDate} - {transit.endDate}
                              </div>
                                  {transit.intensity && (
                                    <div className="text-xs text-amber-700 mt-1">
                                      Intensity: {transit.intensity}
                                    </div>
                                  )}
                            </div>
                          ))}
                        </div>
                      </div>
                        )}

                        {currentTransits.upcomingTransits && currentTransits.upcomingTransits.length > 0 && (
                      <div className="bg-white rounded-xl p-6 border-2 border-pink-200 shadow-md">
                        <h3 className="text-xl font-semibold text-pink-900 mb-4">Upcoming KP Transits</h3>
                        <div className="space-y-3">
                              {currentTransits.upcomingTransits.slice(0, 5).map((transit: any, index: number) => (
                            <div key={index} className="p-4 bg-pink-50 rounded-lg border-2 border-pink-200 shadow-sm">
                              <h4 className="text-slate-900 font-medium">{transit.planet} → {transit.target}</h4>
                                  <p className="text-sm text-slate-700 mt-2">{transit.description}</p>
                              <div className="text-xs text-pink-800 mt-2">
                                Starts: {transit.startDate}
                              </div>
                                  {transit.significance && (
                                    <div className="text-xs text-amber-700 mt-1">
                                      {transit.significance}
                                    </div>
                                  )}
                            </div>
                          ))}
                        </div>
                      </div>
                        )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <RefreshCw className="w-16 h-16 text-cyan-700 mx-auto mb-4" />
                        <p className="text-slate-700 text-lg mb-2">No active transits at this time</p>
                        <p className="text-slate-600 text-sm">Planetary transits are calculated based on current positions relative to your natal chart</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-12">
                      <RefreshCw className="w-16 h-16 text-cyan-700 mx-auto mb-4" />
                      {transitsError ? (
                        <>
                          <p className="text-red-700 font-medium mb-2">Could not load transits</p>
                          <p className="text-slate-600 text-sm mb-4">{transitsError}</p>
                        </>
                      ) : (
                        <p className="text-slate-700 text-lg mb-2">Click &quot;Refresh Transits&quot; to load current KP planetary influences for today</p>
                      )}
                      {!hasCompleteProfile && (
                        <p className="text-amber-700 text-sm mt-2">Complete your profile (birth date, time, place) to calculate transits.</p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
                </div>
              </div>
            )}
            </Tabs>
          </div>
        </motion.div>
        )}
      </div>
    </div>
    </ToolReportGuard>
  )
} 