"use client"

import { useState, useEffect, useMemo, useRef } from 'react'
import { devLog } from '@/lib/devLogger';
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { useToolReport } from '@/hooks/useComprehensiveMysticalProfile'
import { ToolReportGuard } from '@/components/ToolReportGuard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { universalOccultService, BirthData } from '@/lib/universalOccultService'
import { 
  AlertTriangle,
  Zap,
  Shield,
  Gem,
  BarChart3,
  Activity,
  Calendar,
  Moon,
  Target,
  Leaf
} from 'lucide-react'
import { DevotionistStyleCard } from '@/components/western/DevotionistStyleCard'
import { DashboardSection } from '@/components/western/DashboardSection'
import { BodyZodiacProjection } from '@/components/medical/BodyZodiacProjection'
import { RemedyTabs } from '@/components/medical/RemedyTabs'
import { FertilityCalendar } from '@/components/medical/FertilityCalendar'
import { MedicalSeerChat } from '@/components/medical/MedicalSeerChat'
import { medicalDatabaseService } from '@/lib/medical/medicalDatabaseService'
import { getFormulaRecommendations } from '@/lib/medical/astrologicalFormulas'
import { getCurrentLunarPhase, getNextHealingPhases, isMercuryRetrograde } from '@/lib/medical/lunarPhases'

export default function MedicalAstrologyPage() {
  const { userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'body-parts' | 'remedies' | 'timing' | 'ask-seer'>('overview')
  const [healthInsights, setHealthInsights] = useState<any>(null)
  const { report: pipelineReport, loading: isLoading, error } = useToolReport('medicalAstrology')
  const [onDemandReport, setOnDemandReport] = useState<Record<string, unknown> | null>(null)
  const [onDemandLoading, setOnDemandLoading] = useState(false)
  const [onDemandError, setOnDemandError] = useState<string | null>(null)
  const onDemandFetchedRef = useRef(false)

  const effectivePipelineReport = useMemo(() => {
    if (!pipelineReport || typeof pipelineReport !== 'object') return null
    const r = pipelineReport as Record<string, unknown>
    if (r.placeholder === true) return null
    const inner = (r.data ?? r) as Record<string, unknown> | undefined
    if (!inner || typeof inner !== 'object' || inner.chart == null) return null
    return r
  }, [pipelineReport])

  const reportToUse = useMemo(() => {
    const fromOnDemand = onDemandReport && (onDemandReport as { data?: { chart?: unknown } })?.data?.chart
    if (fromOnDemand) return onDemandReport
    if (effectivePipelineReport && (effectivePipelineReport as { data?: { chart?: unknown } })?.data) return effectivePipelineReport
    const r = effectivePipelineReport as Record<string, unknown> | undefined
    if (r && typeof r === 'object' && (r.data ?? r) && ((r.data ?? r) as { chart?: unknown })?.chart) return effectivePipelineReport
    return onDemandReport ?? effectivePipelineReport ?? null
  }, [effectivePipelineReport, onDemandReport])

  const analysis = useMemo(() => {
    if (!reportToUse || typeof reportToUse !== 'object') return null
    return (reportToUse.data ?? reportToUse) as any
  }, [reportToUse])

  // Normalize so we support both report.data.chart (orchestrator) and report.chart (API top-level)
  const rawChart = analysis?.data?.chart ?? analysis?.chart ?? null
  const chart = useMemo(() => {
    if (!rawChart) return null
    const planets = rawChart.planets
    if (Array.isArray(planets)) {
      const byName: Record<string, unknown> = {}
      planets.forEach((p: { name?: string }) => {
        const name = p?.name
        if (name) byName[name] = p
      })
      return { ...rawChart, planets: byName }
    }
    return rawChart
  }, [rawChart])
  const data = useMemo(() => analysis?.data ?? (analysis?.chart ? analysis : null), [analysis])
  const metadata = (reportToUse as Record<string, unknown>)?.metadata ?? analysis?.metadata

  const hasCompleteDetails = !!(userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace)

  // When user has complete details but no chart data, fetch on demand once (or after retry).
  // Depend only on hasCompleteDetails/chart/onDemand so profile listener updates don't cancel the request.
  useEffect(() => {
    if (!hasCompleteDetails || chart) return
    if (onDemandReport && (onDemandReport as { data?: { chart?: unknown } })?.data?.chart) return
    if (onDemandFetchedRef.current && onDemandLoading) return
    if (onDemandLoading) return

    const birthDate = userProfile?.birthDate
    const birthTime = userProfile?.birthTime || '12:00:00'
    const birthPlace = userProfile?.birthPlace
    if (!birthDate || !birthPlace) return

    onDemandFetchedRef.current = true
    const birthData: BirthData = {
      birthDate,
      birthTime: birthTime.includes(':') ? birthTime : `${birthTime}:00:00`.slice(0, 8),
      birthPlace,
      latitude: Number(userProfile?.birthLatitude) ?? 0,
      longitude: Number(userProfile?.birthLongitude) ?? 0,
    }
    let cancelled = false
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        setOnDemandError('Request timed out. Please try again.')
        setOnDemandLoading(false)
      }
    }, 45000)
    setOnDemandLoading(true)
    setOnDemandError(null)
    universalOccultService
      .calculateMedicalChart(birthData)
      .then((res) => {
        const raw = res?.data
        const payload =
          raw && typeof raw === 'object' && (raw as { data?: unknown }).data !== undefined
            ? (raw as { data: unknown }).data
            : raw
        if (!payload || typeof payload !== 'object' || (payload as Record<string, unknown>).placeholder === true) {
          if (!cancelled) setOnDemandError('No chart data returned. Please try again.')
          return
        }
        const withChart = payload as Record<string, unknown>
        if (!withChart.chart) {
          if (!cancelled) setOnDemandError('Chart data missing. Please try again.')
          return
        }
        setOnDemandReport({
          data: withChart,
          metadata: (res as { metadata?: unknown })?.metadata ?? { generatedAt: new Date().toISOString() },
        })
      })
      .catch((err) => {
        if (!cancelled) {
          onDemandFetchedRef.current = false
          setOnDemandError(err instanceof Error ? err.message : 'Failed to load medical astrology report')
        }
      })
      .finally(() => {
        if (!cancelled) {
          clearTimeout(timeoutId)
          setOnDemandLoading(false)
        }
      })
    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [hasCompleteDetails, chart, onDemandReport, onDemandLoading])

  // Planetary strength calculator
  function calculatePlanetaryStrengths(chart: any) {
    const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']
    const strengths: { [key: string]: number } = {}
    
    // House categories for strength calculation
    const angularHouses = [1, 4, 7, 10]
    const succedentHouses = [2, 5, 8, 11]
    const cadentHouses = [3, 6, 9, 12]
    
    planets.forEach(planet => {
      const planetData = chart.planets?.[planet]
      if (!planetData) return
      
      let strength = 50 // Base strength
      
      // House strength: Angular (strongest), Succedent (moderate), Cadent (weakest)
      if (angularHouses.includes(planetData.house)) strength += 20
      else if (succedentHouses.includes(planetData.house)) strength += 10
      else if (cadentHouses.includes(planetData.house)) strength -= 10
      
      // Health houses (6th, 8th, 12th) reduce planetary strength
      if ([6, 8, 12].includes(planetData.house)) strength -= 15
      
      // Ensure strength stays within 0-100
      strengths[planet] = Math.max(0, Math.min(100, strength))
    })
    
    return strengths
  }

  // Calculate health insights from medical databases (uses normalized chart)
  useEffect(() => {
    if (!chart) return
    try {
      // 1. Analyze 6th house (health), 8th house (chronic disease), 12th house (hospitalization)
      const healthHouses = [6, 8, 12]
      const afflictedPlanets: Array<{ planet: string; sign: string; house: number }> = []

      // 2. Check planetary afflictions
      Object.entries(chart.planets || {}).forEach(([planet, planetData]: [string, any]) => {
        if (healthHouses.includes(planetData.house)) {
          afflictedPlanets.push({ planet, sign: planetData.sign, house: planetData.house })
        }
      })

      // 3. Apply medical astrology formulas (Zoller, Ptolemy)
      const formulas = getFormulaRecommendations({
        planets: Object.entries(chart.planets || {}).reduce((acc, [planet, planetData]: [string, any]) => {
          acc[planet] = { sign: planetData.sign, house: planetData.house }
          return acc
        }, {} as any),
        houses: [],
        aspects: []
      })

      // 4. Cross-reference with ICD10 database
      const healthConcerns = afflictedPlanets.flatMap(({ planet, sign, house }) => {
        return medicalDatabaseService.searchICD10({
          planets: [planet],
          zodiacSigns: [sign],
          houses: [house]
        })
      })

      // 5. Get targeted remedies from all three databases (BROADER SEARCH)
      const bodyPartsAffected = healthConcerns.map(c => c.bodyPart).filter(Boolean)

      // Get Sun sign for constitutional remedies
      const sunSign = chart.planets?.Sun?.sign || chart.planets?.sun?.sign
      const moonSign = chart.planets?.Moon?.sign || chart.planets?.moon?.sign

      // BROADER REMEDY SEARCH:
      const constitutionalRemedies = {
        homeopathic: medicalDatabaseService.searchHomeopathy({
          planets: ['Sun', 'Moon'],
          zodiacSigns: [sunSign, moonSign].filter(Boolean) as string[]
        }),
        herbal: medicalDatabaseService.searchHerbal({
          zodiacSigns: [sunSign, moonSign].filter(Boolean) as string[]
        }),
        acupuncture: medicalDatabaseService.searchAcupuncture({
          zodiacSigns: [sunSign, moonSign].filter(Boolean) as string[]
        })
      }
      const afflictionRemedies = {
        homeopathic: medicalDatabaseService.searchHomeopathy({
          bodyParts: bodyPartsAffected,
          planets: afflictedPlanets.map(p => p.planet),
          zodiacSigns: afflictedPlanets.map(p => p.sign)
        }),
        herbal: medicalDatabaseService.searchHerbal({
          bodyParts: bodyPartsAffected,
          zodiacSigns: afflictedPlanets.map(p => p.sign)
        }),
        acupuncture: medicalDatabaseService.searchAcupuncture({
          zodiacSigns: afflictedPlanets.map(p => p.sign)
        })
      }
      const weakPlanets: string[] = []
      Object.entries(chart.planets || {}).forEach(([planet, planetData]: [string, any]) => {
        if (planetData.speed < 0) weakPlanets.push(planet)
      })
      const weakRemedies = {
        homeopathic: medicalDatabaseService.searchHomeopathy({ planets: weakPlanets }),
        herbal: [],
        acupuncture: []
      }
      const remedies = {
        homeopathic: [...new Map([...constitutionalRemedies.homeopathic, ...afflictionRemedies.homeopathic, ...weakRemedies.homeopathic].map(r => [r.name, r])).values()].slice(0, 20),
        herbal: [...new Map([...constitutionalRemedies.herbal, ...afflictionRemedies.herbal].map(r => [r.name, r])).values()].slice(0, 20),
        acupuncture: [...new Map([...constitutionalRemedies.acupuncture, ...afflictionRemedies.acupuncture].map((r: any) => [r.name || r.formula || `${r}`, r])).values()].slice(0, 20)
      }
      const planetaryStrengths = calculatePlanetaryStrengths(chart)
      setHealthInsights({
        formulas,
        healthConcerns,
        remedies,
        afflictedPlanets,
        planetaryStrengths
      })
    } catch (error) {
      devLog.error('Error calculating health insights:', error, 'page')
    }
  }, [chart])

  if (!hasCompleteDetails) {
    return (
      <div className="relative min-h-screen starfield-ultra-sharp">
        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-4 pb-8">
          <div className="text-center py-16">
            <span className="text-6xl block mx-auto mb-4" aria-hidden>⚕️</span>
            <h1 className="text-3xl font-serif bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent mb-3">Medical Astrology</h1>
            <p className="text-slate-300 mb-8">Complete your profile to unlock your health astrology insights</p>
            <Button 
              onClick={() => window.location.href = '/profile-setup'}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Complete Profile
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ToolReportGuard loading={isLoading} error={error ?? null} toolLabel="medical astrology">
    <div className="relative min-h-screen starfield-ultra-sharp">
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-4 pb-8">
        {/* Medical Disclaimer */}
        <div className="mb-6 p-4 bg-amber-50/90 border-2 border-amber-300 rounded-xl space-y-3">
          <p className="text-sm text-slate-800 text-center">
            <strong className="text-amber-900">Disclaimer:</strong> Medical astrology is a metaphysical framework for educational and spiritual insight. It is not a substitute for professional medical diagnosis or treatment. Always consult a qualified healthcare professional for health concerns.
          </p>
          <p className="text-xs text-slate-600 text-center">
            This report provides constitutional analysis, vulnerability mapping, and timing awareness as a <strong>preventive awareness framework</strong>—risk-indicator analysis only, not medical advice. It cannot diagnose disease, replace lab testing, or predict specific medical outcomes.
          </p>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-6xl block mx-auto mb-4" aria-hidden>⚕️</span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent mb-3">Medical Astrology</h1>
            <p className="text-slate-300 text-lg">Health-focused astrological analysis and healing guidance</p>
          </motion.div>
        </div>

        {/* Report framework summary */}
        <Collapsible className="mb-6 rounded-xl border border-amber-500/20 bg-slate-800/40 overflow-hidden">
          <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-200 hover:bg-slate-800/50 transition-colors">
            <span>What&apos;s in this report</span>
            <span className="text-slate-400 text-xs">Constitutional, vulnerability, timing</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 pt-0 text-xs text-slate-400 space-y-2 border-t border-amber-500/10">
              <p><strong className="text-amber-200/90">Constitutional:</strong> Lagna (Ascendant) and Sun vitality; Moon sign and placement; Ayurvedic dosha (Vata/Pitta/Kapha) from chart.</p>
              <p><strong className="text-amber-200/90">Vulnerability:</strong> 6th house (acute illness), 8th (chronic/hereditary), 12th (hospitalization); planet–body mapping (Kaal Purusha); planetary significations (e.g. Saturn–bones, Mars–inflammation).</p>
              <p><strong className="text-amber-200/90">Timing:</strong> Transits and lunar phases for healing windows; stress and recovery windows where applicable.</p>
              <p className="text-slate-500">This is a preventive awareness framework only—not diagnosis or treatment. Built with established astrological mapping and Swiss Ephemeris–based calculations.</p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Tabs */}
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full min-w-0">
          <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
            <TabsTrigger 
              value="overview" 
              className="shrink-0 w-full sm:w-auto data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 rounded-t-lg rounded-b-none px-3 py-2 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 transition-all border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="health" 
              className="shrink-0 w-full sm:w-auto data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 rounded-t-lg rounded-b-none px-3 py-2 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 transition-all border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Health
            </TabsTrigger>
            <TabsTrigger 
              value="body-parts" 
              className="shrink-0 w-full sm:w-auto data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 rounded-t-lg rounded-b-none px-3 py-2 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 transition-all border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Body Parts
            </TabsTrigger>
            <TabsTrigger 
              value="remedies" 
              className="shrink-0 w-full sm:w-auto data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 rounded-t-lg rounded-b-none px-3 py-2 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 transition-all border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Remedies
            </TabsTrigger>
            <TabsTrigger 
              value="timing" 
              className="shrink-0 w-full sm:w-auto data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 rounded-t-lg rounded-b-none px-3 py-2 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 transition-all border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Health Timing
            </TabsTrigger>
            <TabsTrigger 
              value="ask-seer" 
              className="shrink-0 w-full sm:w-auto data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:m3-elevation-1 rounded-t-lg rounded-b-none px-3 py-2 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 transition-all border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Ask the Seer
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            {isLoading || (hasCompleteDetails && !(data || healthInsights) && onDemandLoading) ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4" aria-hidden />
                <p className="text-slate-300">FutureSeer is analyzing your medical astrology chart...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-300 mb-4">{error}</p>
                <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                  <Link href="/profile">Generate your mystical profile</Link>
                </Button>
              </div>
            ) : onDemandError && !(data || healthInsights) ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <p className="text-slate-200 mb-4">Could not load your medical astrology report.</p>
                <Button
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={() => { onDemandFetchedRef.current = false; setOnDemandReport(null); setOnDemandError(null); }}
                >
                  Try again
                </Button>
              </div>
            ) : (data || healthInsights) ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Medical Crisis Indicators (Zoller formulas) */}
                {healthInsights?.formulas && healthInsights.formulas.length > 0 && (
                  <DevotionistStyleCard
                    variant="callout"
                    colorScheme="orange"
                    icon={<AlertTriangle className="w-5 h-5" />}
                    title="Medical Crisis Indicators"
                  >
                    <div className="space-y-3">
                      {healthInsights.formulas.slice(0, 3).map((formula: any, index: number) => (
                        <div key={index} className="p-3 bg-orange-50/80 border border-orange-200 rounded-lg">
                          <div className="font-medium text-orange-900">{formula.name}</div>
                          <div className="text-sm text-slate-800">{formula.medicalImplications}</div>
                          <div className="text-xs text-slate-600 mt-2">Tradition: {formula.tradition}</div>
                        </div>
                      ))}
                    </div>
                  </DevotionistStyleCard>
                )}

                {/* Health Concerns */}
                {healthInsights?.healthConcerns && healthInsights.healthConcerns.length > 0 && (
                  <DevotionistStyleCard
                    variant="callout"
                    colorScheme="pink"
                    icon={<Shield className="w-5 h-5" />}
                    title="Health Concerns"
                  >
                    <div className="space-y-3">
                      {healthInsights.healthConcerns.slice(0, 3).map((condition: any, index: number) => (
                        <div key={index} className="p-3 bg-pink-50/80 border border-pink-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-pink-900">{condition.name}</div>
                              <div className="text-xs text-slate-600">Code: {condition.code}</div>
                            </div>
                            <Badge className="text-xs bg-pink-200 text-pink-900 border border-pink-300">
                              {condition.severity}
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-600 mt-2">
                            {condition.bodyPart} • {condition.zodiacSign}
                          </div>
                        </div>
                      ))}
                    </div>
                  </DevotionistStyleCard>
                )}

                {/* Planetary Health Influences */}
                {healthInsights?.afflictedPlanets && healthInsights.afflictedPlanets.length > 0 && (
                  <DevotionistStyleCard
                    variant="callout"
                    colorScheme="purple"
                    icon={<Zap className="w-5 h-5" />}
                    title="Planetary Health Influences"
                  >
                    <div className="space-y-3">
                      {healthInsights.afflictedPlanets.slice(0, 3).map((planet: any, index: number) => (
                        <div key={index} className="p-3 bg-purple-50/80 border border-purple-200 rounded-lg">
                          <div className="font-medium text-purple-900">{planet.planet}</div>
                          <div className="text-sm text-slate-800">House {planet.house} • {planet.sign}</div>
                          <div className="text-xs text-slate-600 mt-1">
                            {planet.house === 6 ? 'Health indicators' : planet.house === 8 ? 'Chronic disease' : 'Hospitalization'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </DevotionistStyleCard>
                )}

                {/* Immediate Remedies */}
                {(healthInsights?.remedies?.homeopathic?.length > 0 || healthInsights?.remedies?.herbal?.length > 0 || healthInsights?.remedies?.acupuncture?.length > 0) && (
                  <DevotionistStyleCard
                    variant="callout"
                    colorScheme="green"
                    icon={<Gem className="w-5 h-5" />}
                    title="Immediate Remedies"
                  >
                    <div className="space-y-3">
                      {healthInsights.remedies.homeopathic?.slice(0, 1).map((remedy: any, index: number) => (
                        <div key={`h-${index}`} className="p-3 bg-green-50/80 border border-green-200 rounded-lg">
                          <div className="font-medium text-green-900">{remedy.name} (Homeopathic)</div>
                          <div className="text-sm text-slate-800">
                            {Array.isArray(remedy.keynotes) 
                              ? remedy.keynotes.slice(0, 2).join(', ').substring(0, 60) 
                              : (remedy.keynotes || '').substring(0, 60)}...
                          </div>
                        </div>
                      ))}
                      {healthInsights.remedies.herbal?.slice(0, 1).map((remedy: any, index: number) => (
                        <div key={`e-${index}`} className="p-3 bg-green-50/80 border border-green-200 rounded-lg">
                          <div className="font-medium text-green-900">{remedy.name} (Herbal)</div>
                          <div className="text-sm text-slate-800">
                            {Array.isArray(remedy.virtues) 
                              ? remedy.virtues.slice(0, 2).join(', ').substring(0, 60) 
                              : (remedy.virtues || '').substring(0, 60)}...
                          </div>
                        </div>
                      ))}
                      {healthInsights.remedies.acupuncture?.slice(0, 1).map((remedy: any, index: number) => (
                        <div key={`a-${index}`} className="p-3 bg-green-50/80 border border-green-200 rounded-lg">
                          <div className="font-medium text-green-900">{remedy.formula || 'Formula'} (Acupuncture)</div>
                          <div className="text-sm text-slate-800">Meridians: {remedy.meridians?.join(', ') || 'N/A'}</div>
                        </div>
                      ))}
                    </div>
                  </DevotionistStyleCard>
                )}

                {/* Planetary Strengths */}
                {healthInsights?.planetaryStrengths && Object.keys(healthInsights.planetaryStrengths).length > 0 && (
                  <div className="rounded-2xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 shadow-lg m3-elevation-1 hover:border-blue-400 transition-all">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="rounded-lg bg-blue-200/60 p-2">
                        <BarChart3 className="w-5 h-5 text-blue-700" />
                      </div>
                      <h4 className="font-semibold text-lg text-blue-900">Planetary Strengths</h4>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(healthInsights.planetaryStrengths).map(([planet, strength]: [string, any]) => (
                        <div key={planet} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-800">{planet}</span>
                            <span className={`font-medium ${strength < 30 ? 'text-red-700' : strength < 50 ? 'text-amber-700' : 'text-green-700'}`}>
                              {strength}%
                            </span>
                          </div>
                          <div className="w-full bg-blue-200/60 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${strength < 30 ? 'bg-red-500' : strength < 50 ? 'bg-amber-500' : 'bg-green-600'}`}
                              style={{ width: `${strength}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fallback: Show general health overview if no specific data */}
                {(!healthInsights?.formulas || healthInsights.formulas.length === 0) &&
                 (!healthInsights?.healthConcerns || healthInsights.healthConcerns.length === 0) &&
                 (!healthInsights?.afflictedPlanets || healthInsights.afflictedPlanets.length === 0) &&
                 data && (
                  <DevotionistStyleCard
                    variant="callout"
                    colorScheme="amber"
                    icon={<span className="text-2xl" aria-hidden>⚕️</span>}
                    title="General Health Overview"
                  >
                    <p className="text-slate-800 mb-4">
                      Your chart shows balanced health indicators. Here&apos;s what your Medical Astrology analysis reveals:
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-800">
                        ✓ Your planetary positions have been analyzed for health correlations
                      </p>
                      <p className="text-sm text-slate-800">
                        ✓ Check the <strong className="text-amber-900">Health</strong> tab for detailed planetary influences
                      </p>
                      <p className="text-sm text-slate-800">
                        ✓ Explore <strong className="text-amber-900">Body Parts</strong> tab for zodiacal correspondences
                      </p>
                    </div>
                    {metadata && (metadata as { generatedAt?: string }).generatedAt && (
                      <div className="mt-4 pt-4 border-t border-amber-300">
                        <p className="text-xs text-slate-700">
                          Analysis generated: {new Date((metadata as { generatedAt: string }).generatedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </DevotionistStyleCard>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4" aria-hidden />
                <p className="text-slate-300">Loading your medical astrology report...</p>
              </div>
            )}
          </TabsContent>

          {/* Health Tab */}
          <TabsContent value="health" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Health Indicators */}
              {data?.healthIndicators && data.healthIndicators.length > 0 && (
                <DevotionistStyleCard
                  variant="callout"
                  colorScheme="blue"
                  icon={<Activity className="w-5 h-5" />}
                  title="Health Indicators"
                >
                  <div className="space-y-3">
                    {data.healthIndicators.map((indicator: any, index: number) => (
                      <div key={index} className="p-3 bg-blue-50/80 border border-blue-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-blue-900">{indicator.name}</h4>
                          <Badge className={`text-xs border ${indicator.status === 'strong' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-blue-200 text-blue-900 border-blue-300'}`}>
                            {indicator.status || 'Moderate'}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-800 mb-2">{indicator.description}</p>
                        <div className="flex gap-4 text-xs text-slate-600">
                          {indicator.dignity && <span>Dignity: {indicator.dignity}</span>}
                          {indicator.essentialStrength && <span>Essential: {indicator.essentialStrength}</span>}
                          {indicator.accidentalStrength && <span>Accidental: {indicator.accidentalStrength}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </DevotionistStyleCard>
              )}

              {/* Body Systems with Hybrid Vedic + Western */}
              {data?.bodySystems && data.bodySystems.length > 0 && (
                <DevotionistStyleCard
                  variant="callout"
                  colorScheme="cyan"
                  icon={<Activity className="w-5 h-5" />}
                  title="Body Systems Analysis (Hybrid)"
                >
                  <div className="space-y-2">
                    {data.bodySystems.map((system: any, index: number) => (
                      <div key={index} className="p-3 bg-cyan-50/80 border border-cyan-200 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-800">{system.system}</span>
                          <Badge className={`text-xs border ${
                            system.riskLevel === 'high' ? 'bg-red-100 text-red-800 border-red-300' :
                            system.riskLevel === 'moderate' ? 'bg-amber-200 text-amber-900 border-amber-300' :
                            'bg-green-100 text-green-800 border-green-300'
                          }`}>
                            {system.riskLevel}
                          </Badge>
                        </div>
                        <div className="w-full bg-cyan-200/60 rounded-full h-2 mb-2">
                          <div 
                            className={`h-2 rounded-full ${
                              system.strength < 30 ? 'bg-red-500' : system.strength < 50 ? 'bg-amber-500' : 'bg-green-600'
                            }`}
                            style={{ width: `${system.strength}%` }}
                          />
                        </div>
                        
                        {/* Hybrid Analysis */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          {system.vedicAnalysis && (
                            <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                              <p className="text-blue-800 font-medium mb-1">Vedic (Dosha)</p>
                              <p className="text-slate-800">{system.vedicAnalysis.dosha} Constitution</p>
                              <p className="text-slate-600 mt-1">{system.vedicAnalysis.recommendation}</p>
                            </div>
                          )}
                          {system.westernAnalysis && (
                            <div className="p-2 bg-amber-50/80 border border-amber-200 rounded-lg text-xs">
                              <p className="text-amber-900 font-medium mb-1">Western (Transits)</p>
                              <p className="text-slate-800">{system.westernAnalysis.currentTransit}</p>
                              <p className="text-slate-600 mt-1">{system.westernAnalysis.impact}</p>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-xs text-slate-700 mt-2">{system.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </DevotionistStyleCard>
              )}

              {/* Planetary Aspects */}
              {data?.planetaryAspects && data.planetaryAspects.length > 0 && (
                <DevotionistStyleCard
                  variant="callout"
                  colorScheme="purple"
                  icon={<Zap className="w-5 h-5" />}
                  title="Health-Relevant Aspects"
                >
                  <div className="space-y-2">
                    {data.planetaryAspects.slice(0, 8).map((aspect: any, index: number) => (
                      <div key={index} className="p-2 bg-purple-50/80 border border-purple-200 rounded-lg text-xs">
                        <span className="text-purple-900 font-medium">{aspect.planets}</span> — {aspect.aspect} ({aspect.orb}°)
                        <p className="text-slate-700 mt-1">{aspect.healthInfluence}</p>
                      </div>
                    ))}
                  </div>
                </DevotionistStyleCard>
              )}

              {/* Planetary Strengths Table */}
              {healthInsights?.planetaryStrengths && Object.keys(healthInsights.planetaryStrengths).length > 0 && (
                <div className="rounded-2xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 shadow-lg m3-elevation-1 hover:border-blue-400 transition-all">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="rounded-lg bg-blue-200/60 p-2">
                      <BarChart3 className="w-5 h-5 text-blue-700" />
                    </div>
                    <h4 className="font-semibold text-lg text-blue-900">Planetary Strengths (Health Context)</h4>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(healthInsights.planetaryStrengths).map(([planet, strength]: [string, any]) => (
                      <div key={planet} className="flex items-center justify-between p-2 bg-blue-50/80 border border-blue-200 rounded-lg">
                        <span className="text-sm text-slate-800">{planet}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-blue-200/60 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${
                                strength < 30 ? 'bg-red-500' : strength < 50 ? 'bg-amber-500' : 'bg-green-600'
                              }`}
                              style={{ width: `${strength}%` }}
                            />
                          </div>
                          <span className={`text-xs w-12 text-right font-medium ${
                            strength < 30 ? 'text-red-700' : strength < 50 ? 'text-amber-700' : 'text-green-700'
                          }`}>
                            {strength}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Fallback message if no data */}
            {(!data?.healthIndicators || data.healthIndicators.length === 0) &&
             (!data?.bodySystems || data.bodySystems.length === 0) &&
             (!data?.planetaryAspects || data.planetaryAspects.length === 0) && (
              <DevotionistStyleCard
                variant="callout"
                colorScheme="amber"
                icon={<span className="text-2xl" aria-hidden>⚕️</span>}
                title="Health Analysis"
              >
                <p className="text-slate-800">
                  Your chart is being analyzed for health correlations. Planetary positions and aspects are being evaluated.
                </p>
                {chart && (
                  <div className="mt-4 pt-4 border-t border-amber-300">
                    <p className="text-sm text-slate-700 mb-2">Chart calculated:</p>
                    <p className="text-xs text-slate-600">
                      {metadata && (metadata as { generatedAt?: string }).generatedAt ? new Date((metadata as { generatedAt: string }).generatedAt).toLocaleString() : 'Recently'}
                    </p>
                  </div>
                )}
              </DevotionistStyleCard>
            )}
          </TabsContent>

          {/* Body Parts Tab */}
          <TabsContent value="body-parts" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <DashboardSection
              title="Body Parts"
              icon={<Target className="w-6 h-6" />}
              badge="Zodiac wheel"
              defaultExpanded={true}
              colorScheme="cyan"
              storageKey="medical-body-parts"
            >
              <BodyZodiacProjection 
                userChart={chart} 
                gender={userProfile?.gender === 'male' ? 'male' : 'female'} 
              />
            </DashboardSection>
          </TabsContent>

          {/* Remedies Tab */}
          <TabsContent value="remedies" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <DashboardSection
              title="Remedies"
              icon={<Leaf className="w-6 h-6" />}
              badge="Homeopathy • Herbal • Acupuncture"
              defaultExpanded={true}
              colorScheme="green"
              storageKey="medical-remedies"
            >
              <RemedyTabs 
                selectedCondition={data?.healthIndicators?.[0]?.name}
                bodyPart={data?.bodyParts?.[0]?.bodyPart}
                zodiacSign={chart?.planets?.Sun?.sign}
                precomputedRemedies={healthInsights?.remedies}
              />
            </DashboardSection>
          </TabsContent>

          {/* Health Timing Tab */}
          <TabsContent value="timing" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            {userProfile?.gender === 'female' && userProfile?.birthDate ? (
              <FertilityCalendar natalDate={userProfile.birthDate} />
            ) : (
              <div className="space-y-6">
                {/* Current Lunar Phase */}
                {(() => {
                  const currentPhase = getCurrentLunarPhase()
                  const nextPhases = getNextHealingPhases()
                  const mercuryRx = isMercuryRetrograde()
                  
                  return (
                    <>
                      <DevotionistStyleCard
                        variant="callout"
                        colorScheme="cyan"
                        icon={<Moon className="w-5 h-5" />}
                        title="Current Lunar Phase"
                      >
                        <div className="space-y-4">
                          <div className="p-4 bg-cyan-50/80 border border-cyan-200 rounded-lg">
                            <h3 className="text-lg font-semibold text-cyan-900 mb-2">{currentPhase.name}</h3>
                            <p className="text-slate-800 mb-3">{currentPhase.description}</p>
                            <div className="space-y-1">
                              <p className="text-sm text-slate-800 font-medium">Optimal for:</p>
                              <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                                {currentPhase.optimalFor.map((activity, idx) => (
                                  <li key={idx}>{activity}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <div className="text-xs text-slate-700">
                            Phase until: {currentPhase.endDate.toLocaleDateString()}
                          </div>
                        </div>
                      </DevotionistStyleCard>

                      {/* Upcoming Healing Phases */}
                      <DevotionistStyleCard
                        variant="callout"
                        colorScheme="green"
                        icon={<Calendar className="w-5 h-5" />}
                        title="Upcoming Optimal Healing Windows"
                      >
                        <div className="space-y-3">
                          {nextPhases.map((phase, idx) => (
                            <div key={idx} className="p-3 bg-green-50/80 border border-green-200 rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-green-900">{phase.name}</h4>
                                <Badge className="text-xs bg-blue-100 text-blue-800 border border-blue-300">
                                  {phase.startDate.toLocaleDateString()}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-800 mb-2">{phase.description}</p>
                              <div className="flex flex-wrap gap-1">
                                {phase.optimalFor.map((item, i) => (
                                  <span key={i} className="text-xs px-2 py-1 bg-green-200/60 text-green-900 rounded-lg">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </DevotionistStyleCard>

                      {/* Mercury Retrograde Warning */}
                      {mercuryRx && (
                        <div className="rounded-2xl border-2 border-red-300 bg-gradient-to-br from-red-50 to-amber-50 p-4 shadow-lg m3-elevation-1">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="rounded-lg bg-red-200/60 p-2">
                              <AlertTriangle className="w-5 h-5 text-red-800" />
                            </div>
                            <h4 className="font-semibold text-lg text-red-900">Mercury Retrograde Warning</h4>
                          </div>
                          <p className="text-sm text-slate-800">
                            Mercury is currently retrograde. Consider avoiding:
                          </p>
                          <ul className="list-disc list-inside space-y-1 mt-2 text-sm text-slate-700">
                            <li>Elective surgeries when possible</li>
                            <li>Starting new major health treatments</li>
                            <li>Making irreversible health decisions</li>
                          </ul>
                          <p className="text-xs text-slate-700 mt-3">
                            Minor procedures are fine, but major interventions should be carefully considered.
                          </p>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            )}
          </TabsContent>

          {/* Ask the Seer Tab */}
          <TabsContent value="ask-seer" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <MedicalSeerChat userProfile={userProfile} analysis={analysis} />
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
    </ToolReportGuard>
  )
} 