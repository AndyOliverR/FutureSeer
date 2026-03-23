"use client"

import { Suspense, useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { useToolReport } from '@/hooks/useComprehensiveMysticalProfile'
import { ToolReportGuard } from '@/components/ToolReportGuard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { convertObjectToWestern } from '@/lib/western/westernTerminology'
import WesternSeerChatInterface from '@/components/WesternSeerChatInterface'
import { getAllAdvancedTechniques } from '@/lib/data/advancedTechniques';
import { ToolIntroductionTab } from '@/components/ToolIntroductionTab';
import { CompatibilityTab } from '@/components/compatibility/CompatibilityTab';
import AstroNumerologyTab from '@/components/western/AstroNumerologyTab';
import { WesternDashboardHero } from '@/components/western/WesternDashboardHero';
import { DashboardSection } from '@/components/western/DashboardSection';
import { AspectLegendPanel } from '@/components/western/AspectLegendPanel';
import { PlanetaryDashboard } from '@/components/western/PlanetaryDashboard';
import { HouseDashboard } from '@/components/western/HouseDashboard';
import { TransitTimeline } from '@/components/western/TransitTimeline';
import { LifeJourneyMap } from '@/components/western/LifeJourneyMap';
import { AspectPatternDiagram } from '@/components/western/AspectPatternDiagram';
import { ChartBirthSummaryCard } from '@/components/western/ChartBirthSummaryCard';
import { WesternSpecialFeatures } from '@/components/western/WesternSpecialFeatures';
import { WesternCelebritySampleSection } from '@/components/western/WesternCelebritySampleSection';
import { buildToolTeaser } from '@/lib/report-viral/buildToolTeaser'
import { ToolReportViralGate } from '@/components/report-viral/ToolReportViralGate'
import { useViralReportBypass } from '@/hooks/useViralReportBypass'
import { 
  Star, 
  Calendar,
  AlertTriangle,
  Info,
  Zap,
  Home,
  Eye,
  Activity,
  TrendingUp,
  Sparkles
} from 'lucide-react'

type WesternToolTab =
  | 'introduction'
  | 'compatibility'
  | 'western-astrology'
  | 'advanced'
  | 'astro-numerology'
  | 'ask-the-seer'

function sunSignFromWesternChart(planets: unknown[] | undefined): string | undefined {
  const sun = planets?.find(
    (p): p is { name: string; sign?: string | { signName?: string } } =>
      typeof p === 'object' && p !== null && 'name' in p && (p as { name: string }).name === 'Sun'
  )
  if (!sun) return undefined
  if (typeof sun.sign === 'string') return sun.sign
  if (sun.sign && typeof sun.sign === 'object' && 'signName' in sun.sign) return sun.sign.signName
  return undefined
}

function WesternAstrologyPageContent() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<WesternToolTab>('introduction')

  // Deep-link tabs: ?tab=advanced | introduction | western-astrology | chart
  useEffect(() => {
    const t = searchParams.get('tab')
    if (t === 'advanced') setActiveTab('advanced')
    else if (t === 'introduction') setActiveTab('introduction')
    else if (t === 'western-astrology' || t === 'chart') setActiveTab('western-astrology')
  }, [searchParams])

  const { report: westernPipelineReport, loading: isLoading, error: profileError, hasReport, refreshProfile } = useToolReport('western')
  const { report: astroNumerologyReport, loading: isLoadingAstroNumerologyReport } = useToolReport('astroNumerology')
  const analysis = useMemo(() => {
    const raw = (westernPipelineReport as Record<string, unknown> | undefined)?.chart
    if (!raw) return null
    const converted = convertObjectToWestern(raw)
    // Pipeline stores chart as { planets, houses, aspects, transits, ... }; page expects analysis.data
    const hasDataShape = converted && typeof converted === 'object' && ('planets' in converted || 'houses' in converted)
    if (hasDataShape && !('data' in converted && converted.data)) {
      return { data: converted }
    }
    return converted
  }, [westernPipelineReport])
  const comprehensiveWesternReport = useMemo(() => {
    const raw = westernPipelineReport as Record<string, unknown> | undefined
    return (raw?.comprehensiveAnalysis ?? null) as {
      chartOverview?: string
      planetaryAnalysis?: { planet: string; analysis: string }[]
      houseAnalysis?: { house: number; analysis: string }[]
      predictiveInsights?: unknown
    } | null
  }, [westernPipelineReport])
  const [fetchedComprehensiveAnalysis, setFetchedComprehensiveAnalysis] = useState<typeof comprehensiveWesternReport>(null)
  const [isLoadingComprehensiveAnalysis, setIsLoadingComprehensiveAnalysis] = useState(false)
  const effectiveComprehensiveReport = comprehensiveWesternReport || fetchedComprehensiveAnalysis

  const teaser = useMemo(
    () => (analysis?.data ? buildToolTeaser('western', analysis.data) : null),
    [analysis?.data]
  )
  const bypassViralRestrictions = useViralReportBypass()

  const chartAutoOpenedRef = useRef(false)
  // Chart-first: once chart data exists, open the Western dashboard tab (unless URL pins another tab)
  useEffect(() => {
    if (chartAutoOpenedRef.current) return
    const t = searchParams.get('tab')
    if (t === 'advanced' || t === 'introduction') return
    if (activeTab !== 'introduction') return
    if (!analysis?.data || !hasReport) return
    setActiveTab('western-astrology')
    chartAutoOpenedRef.current = true
  }, [analysis?.data, hasReport, searchParams, activeTab])

  const [fetchedTransits, setFetchedTransits] = useState<unknown[] | null>(null)
  const [isLoadingTransits, setIsLoadingTransits] = useState(false)
  const effectiveTransits = useMemo(() => {
    const fromAnalysis = (analysis?.data as { transits?: unknown[] } | undefined)?.transits
    if (fromAnalysis && Array.isArray(fromAnalysis) && fromAnalysis.length > 0) return fromAnalysis
    return fetchedTransits ?? []
  }, [analysis?.data, fetchedTransits])

  // When we have chart data but no comprehensive analysis from profile, fetch once and persist so returning visits load from cache
  useEffect(() => {
    if (!user?.uid || !analysis?.data || comprehensiveWesternReport?.chartOverview) return
    const chartData = analysis.data as { planets?: unknown[]; houses?: unknown[]; aspects?: unknown[]; transits?: unknown[] }
    if (!chartData.planets?.length) return

    let cancelled = false
    setIsLoadingComprehensiveAnalysis(true)
    fetch('/api/western-astrology/comprehensive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.uid, chartData })
    })
      .then((res) => res.json())
      .then(async (json) => {
        if (cancelled || !json?.success) return
        const comp = (json.data?.comprehensiveAnalysis ?? json.data) as typeof comprehensiveWesternReport
        if (comp) {
          setFetchedComprehensiveAnalysis(comp)
          try {
            const token = await user.getIdToken()
            const saveRes = await fetch('/api/profile/save-tool-report', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                toolSlug: 'western',
                data: { chart: chartData, comprehensiveAnalysis: comp },
              }),
            })
            if (saveRes.ok) await refreshProfile()
          } catch {
            // Non-blocking: UI already updated; next visit may refetch once
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoadingComprehensiveAnalysis(false)
      })
    return () => { cancelled = true }
  }, [user?.uid, user, analysis?.data, comprehensiveWesternReport?.chartOverview, refreshProfile])

  // When we have chart but no transits (e.g. profile generated before transits were requested), fetch transits on demand
  useEffect(() => {
    const chartData = analysis?.data as { transits?: unknown[]; planets?: unknown[] } | undefined
    if (!user?.uid || !userProfile?.birthDate || !chartData?.planets?.length) return
    if (chartData.transits && Array.isArray(chartData.transits) && chartData.transits.length > 0) return

    let cancelled = false
    setIsLoadingTransits(true)
    const birthData = {
      birthDate: userProfile.birthDate,
      birthTime: userProfile.birthTime || '12:00:00',
      birthPlace: userProfile.birthPlace || '',
      latitude: Number(userProfile.birthLatitude) ?? 0,
      longitude: Number(userProfile.birthLongitude) ?? 0,
      ...(userProfile?.currentLocation && { currentLocation: userProfile.currentLocation })
    }
    fetch('/api/occult/universal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: 'western',
        birthData,
        options: { includeTransits: true, ...(userProfile?.currentLocation && { currentLocation: userProfile.currentLocation }) }
      })
    })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !json?.success || !json?.data?.transits) return
        setFetchedTransits(Array.isArray(json.data.transits) ? json.data.transits : [])
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoadingTransits(false)
      })
    return () => { cancelled = true }
  }, [user?.uid, userProfile?.birthDate, userProfile?.birthTime, userProfile?.birthPlace, userProfile?.birthLatitude, userProfile?.birthLongitude, userProfile?.currentLocation, analysis?.data])

  const [westernNoReportGraceEnded, setWesternNoReportGraceEnded] = useState(false)
  const [isGeneratingWestern, setIsGeneratingWestern] = useState(false)

  // On-demand Western report when user has birth data but no saved report
  const canGenerateWesternOnDemand =
    !!userProfile?.birthDate &&
    !!userProfile?.birthPlace &&
    !!user?.uid &&
    !analysis?.data
  const generateWesternReport = async () => {
    if (!user?.uid || !userProfile?.birthDate || !userProfile?.birthPlace || isGeneratingWestern) return
    setIsGeneratingWestern(true)
    try {
      const birthData = {
        birthDate: userProfile.birthDate,
        birthTime: userProfile.birthTime || '12:00:00',
        birthPlace: userProfile.birthPlace || '',
        latitude: Number(userProfile.birthLatitude) ?? 0,
        longitude: Number(userProfile.birthLongitude) ?? 0,
        ...(userProfile?.currentLocation && { currentLocation: userProfile.currentLocation })
      }
      const res = await fetch('/api/occult/universal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: 'western',
          birthData,
          options: { includeTransits: true, ...(userProfile?.currentLocation && { currentLocation: userProfile.currentLocation }) }
        }),
      })
      const json = await res.json()
      const chartData = json?.data ?? json
      if (!chartData?.planets?.length) throw new Error('Chart could not be generated')
      const token = await user.getIdToken()
      const saveRes = await fetch('/api/profile/save-tool-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ toolSlug: 'western', data: { chart: chartData } }),
      })
      if (!saveRes.ok) throw new Error('Failed to save report')
      window.dispatchEvent(
        new CustomEvent('futureSeer:toolReportSaved', { detail: { toolSlug: 'western', data: { chart: chartData } } })
      )
      await refreshProfile()
    } catch {
      // Non-blocking; user can retry or use Profile page
    } finally {
      setIsGeneratingWestern(false)
    }
  }

  // No full-page "Profile Incomplete" gate: show tool UI (tabs, Introduction, Compare, etc.) as soon as auth is ready. Western tab handles its own loading/empty state so report can appear later (e.g. from listener or refresh).
  const profileLoaded = !authLoading && user != null

  // Give the Western report a few seconds to appear before showing "No report" (avoids flash when profile loads late)
  useEffect(() => {
    if (analysis?.data || profileError || isLoading) {
      setWesternNoReportGraceEnded(false)
      return
    }
    const t = setTimeout(() => setWesternNoReportGraceEnded(true), 6000)
    return () => clearTimeout(t)
  }, [analysis?.data, profileError, isLoading])

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Material 3 motion configuration - optimized for GPU acceleration
  const motionConfig = useMemo(() => {
    if (prefersReducedMotion) return { duration: 0 }
    return { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }
  }, [prefersReducedMotion])

  // Memoize tab configuration
  const tabsConfig = useMemo(() => [
    { value: 'introduction', label: 'Introduction' },
    { value: 'western-astrology', label: 'Western Astrology' },
    { value: 'astro-numerology', label: 'Astro-Numerology' },
    { value: 'compatibility', label: 'Compare' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'ask-the-seer', label: 'Ask the Seer' }
  ], [])

  if (!user) return null

  if (!profileLoaded) {
    return (
      <div className="relative min-h-screen starfield-ultra-sharp flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-amber-400 border-t-transparent" />
      </div>
    )
  }

  return (
    <ToolReportGuard loading={isLoading} error={profileError ?? null} toolLabel="Western astrology">
    <div className="starfield-ultra-sharp min-h-screen p-4 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto py-8">
        <div className="text-center mb-8 pt-4">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-6">
            <span className="text-yellow-400">⭐</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Western Astrology</span>
          </h1>
          <p className="text-slate-200 leading-relaxed text-xl font-light">Traditional Western zodiac system with precise calculations</p>
        </div>
        {/* Tabs – filing-cabinet style: one bordered container so tabs stay attached to content on all screens */}
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as WesternToolTab)} className="w-full min-w-0">
            <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
              {tabsConfig.map((tab) => (
                <motion.div
                  key={tab.value}
                  whileHover={{}}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                  transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 400, damping: 17 }}
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
                        transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </TabsTrigger>
                </motion.div>
              ))}
            </TabsList>

            {/* Tab Content – inside same bordered container, no visual gap */}
            <AnimatePresence mode="wait">
            {/* Introduction Tab */}
            {activeTab === 'introduction' && (
              <motion.div
                key="introduction"
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                transition={motionConfig}
              >
                <TabsContent value="introduction" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                  {analysis?.data && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pb-2">
                      <Button
                        type="button"
                        onClick={() => setActiveTab('western-astrology')}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold shadow-md"
                      >
                        View my chart
                      </Button>
                      <p className="text-center text-sm text-slate-300 sm:max-w-md">
                        Your wheel and placements are ready—open the Western Astrology tab for the full snapshot.
                      </p>
                    </div>
                  )}
                  <ToolIntroductionTab toolSlug="western-astrology" />
                  <WesternCelebritySampleSection />
                </TabsContent>
              </motion.div>
            )}

            {/* Compatibility Tab */}
            {activeTab === 'compatibility' && (
              <motion.div
                key="compatibility"
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                transition={motionConfig}
              >
                <TabsContent value="compatibility" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                  <CompatibilityTab toolSlug="western-astrology" />
                </TabsContent>
              </motion.div>
            )}

            {/* Western Astrology Dashboard Tab */}
            {activeTab === 'western-astrology' && (
              <motion.div
                key="western-astrology"
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                transition={motionConfig}
                className="bg-gradient-to-b from-amber-50/98 to-slate-100/98 min-h-[60vh]"
              >
                <TabsContent value="western-astrology" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0 border-0 bg-transparent">
            {isLoading ? (
              <motion.div 
                className="text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="relative w-16 h-16 mx-auto mb-4"
                  animate={prefersReducedMotion ? {} : { rotate: 360 }}
                  transition={prefersReducedMotion ? {} : { duration: 1.5, repeat: Infinity, ease: "linear" }}
                  style={{ willChange: prefersReducedMotion ? 'auto' : 'transform' }}
                >
                  <svg className="w-16 h-16" viewBox="0 0 24 24" style={{ willChange: 'auto' }}>
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="rgba(251, 191, 36, 0.2)"
                      strokeWidth="2"
                      fill="none"
                    />
                    {!prefersReducedMotion && (
                      <motion.circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="#fbbf24"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray="60 40"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        style={{ transformOrigin: "12px 12px", willChange: 'transform' }}
                      />
                    )}
                  </svg>
                </motion.div>
                <motion.p 
                  className="text-slate-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  FutureSeer is analyzing your Western astrology chart...
                </motion.p>
              </motion.div>
            ) : profileError ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-300 mb-4">{profileError}</p>
                <motion.div
                  whileHover={{}}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                  transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white relative overflow-hidden focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-transparent">
                    <Link href="/profile">Generate your mystical profile</Link>
                  </Button>
                </motion.div>
              </div>
            ) : analysis?.data ? (
              <ToolReportViralGate
                toolSlug="western"
                teaser={teaser!}
                bypassViralRestrictions={bypassViralRestrictions}
                applyLiteVisualStyling
                renderReport={({ lite }) => (
              <>
                <ChartBirthSummaryCard
                  displayName={userProfile?.displayName}
                  fullName={userProfile?.fullName}
                  birthDate={userProfile?.birthDate}
                  birthTime={userProfile?.birthTime}
                  birthPlace={userProfile?.birthPlace}
                />

                {/* HERO SECTION - Always visible */}
                <WesternDashboardHero 
                  chartData={analysis.data}
                  userProfile={userProfile}
                />

                {/* DASHBOARD SECTIONS - Factual blocks first (Astro-Charts scan order), then AI narrative */}
                <div className="space-y-6 mt-8">
                  
                  <WesternSpecialFeatures chartData={analysis.data} />

                  {/* Chart Patterns */}
                  <DashboardSection 
                    title="Chart Patterns" 
                    icon={<Sparkles className="w-6 h-6" />}
                    badge="Special Configurations"
                    defaultExpanded={true}
                    colorScheme="purple"
                    storageKey="chart-patterns"
                  >
                    <AspectPatternDiagram chartData={analysis.data} />
                  </DashboardSection>

                  {/* Aspects */}
                  <DashboardSection 
                    title="Aspects" 
                    icon={<Zap className="w-6 h-6" />}
                    badge={`${analysis.data.aspects?.length || 0} Aspects`}
                    defaultExpanded={true}
                    colorScheme="pink"
                    storageKey="aspects"
                  >
                    <AspectLegendPanel aspects={analysis.data.aspects || []} />
                  </DashboardSection>

                  {/* Planets */}
                  <DashboardSection 
                    title="Planets" 
                    icon={<Activity className="w-6 h-6" />}
                    badge={`${analysis.data.planets?.length || 0} Celestial Bodies`}
                    defaultExpanded={true}
                    colorScheme="blue"
                    storageKey="planets"
                  >
                    <PlanetaryDashboard 
                      planets={analysis.data.planets || []}
                      planetaryAnalysis={effectiveComprehensiveReport?.planetaryAnalysis}
                    />
                  </DashboardSection>

                  {/* Houses */}
                  <DashboardSection 
                    title="Houses" 
                    icon={<Home className="w-6 h-6" />}
                    badge="12 Life Areas"
                    defaultExpanded={true}
                    colorScheme="green"
                    storageKey="houses"
                  >
                    <HouseDashboard 
                      houses={analysis.data.houses || []}
                      houseAnalysis={effectiveComprehensiveReport?.houseAnalysis}
                    />
                  </DashboardSection>

                  {/* Chart Overview (AI) — after deterministic placements */}
                  <DashboardSection 
                    title="Chart Overview" 
                    icon={<Star className="w-6 h-6" />}
                    defaultExpanded={true}
                    colorScheme="amber"
                    storageKey="chart-overview"
                  >
                    {effectiveComprehensiveReport?.chartOverview ? (
                      <div className="prose prose-slate max-w-none">
                        <p className="text-slate-800 leading-relaxed whitespace-pre-line">
                          {effectiveComprehensiveReport.chartOverview}
                        </p>
                      </div>
                    ) : isLoading || isLoadingComprehensiveAnalysis ? (
                      <motion.div 
                        className="text-center py-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div
                          className="relative w-12 h-12 mx-auto mb-3"
                          animate={prefersReducedMotion ? {} : { rotate: 360 }}
                          transition={prefersReducedMotion ? {} : { duration: 1.5, repeat: Infinity, ease: "linear" }}
                          style={{ willChange: prefersReducedMotion ? 'auto' : 'transform' }}
                        >
                          <svg className="w-12 h-12" viewBox="0 0 24 24" style={{ willChange: 'auto' }}>
                            <circle
                              cx="12"
                              cy="12"
                              r="8"
                              stroke="rgba(217, 119, 6, 0.2)"
                              strokeWidth="2"
                              fill="none"
                            />
                            {!prefersReducedMotion && (
                              <motion.circle
                                cx="12"
                                cy="12"
                                r="8"
                                stroke="#d97706"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray="50 30"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                style={{ transformOrigin: "12px 12px", willChange: 'transform' }}
                              />
                            )}
                          </svg>
                        </motion.div>
                        <motion.p 
                          className="text-slate-700 text-sm font-medium"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          Generating overview...
                        </motion.p>
                      </motion.div>
                    ) : (
                      <div className="text-center py-8">
                        <Info className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                        <p className="text-slate-700 text-sm">Chart overview will appear once analysis is complete.</p>
                      </div>
                    )}
                  </DashboardSection>

                  {!lite && (
                  <>
                  {/* Transit Timeline */}
                  <DashboardSection 
                    title="Current Transits" 
                    icon={<TrendingUp className="w-6 h-6" />}
                    badge={isLoadingTransits ? 'Loading…' : (effectiveTransits.length > 0 ? `${effectiveTransits.length} Active` : 'Active Now')}
                    defaultExpanded={false}
                    colorScheme="orange"
                    storageKey="transits"
                  >
                    {isLoadingTransits ? (
                      <div className="py-8 text-center text-slate-600">Loading current transits…</div>
                    ) : (
                      <TransitTimeline 
                        transits={effectiveTransits}
                        natalPlanets={analysis.data.planets || []}
                      />
                    )}
                  </DashboardSection>

                  {/* Section 7: Life Journey Map */}
                  <DashboardSection 
                    title="Life Journey & Cycles" 
                    icon={<Calendar className="w-6 h-6" />}
                    badge="Your Timeline"
                    defaultExpanded={false}
                    colorScheme="cyan"
                    storageKey="life-journey"
                  >
                    <LifeJourneyMap 
                      birthDate={userProfile?.birthDate || new Date().toISOString()}
                      chartData={analysis.data}
                    />
                  </DashboardSection>

                  {/* Section 8: Predictive Insights */}
                  <DashboardSection 
                    title="Predictive Insights" 
                    icon={<Eye className="w-6 h-6" />}
                    badge="Future Outlook"
                    defaultExpanded={false}
                    colorScheme="purple"
                    storageKey="predictive"
                  >
                    {effectiveComprehensiveReport?.predictiveInsights ? (
                      <div className="space-y-4">
                        {(() => {
                          const insights = effectiveComprehensiveReport.predictiveInsights
                          if (typeof insights === 'object' && insights !== null && !Array.isArray(insights) && 'todaysQuickWin' in insights) {
                            const structuredInsights = insights as {
                              todaysQuickWin: string
                              currentWeek: string
                              currentMonth: string
                              currentYear: string
                              nextYearSneakPeek: string
                              longerTermCycles: string
                            }
                            return (
                              <>
                                {structuredInsights.todaysQuickWin && (
                                  <motion.div
                                    initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                                    animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                                    transition={motionConfig}
                                    whileHover={prefersReducedMotion ? {} : { y: -4, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                                  >
                                    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                                      <CardContent className="p-4">
                                        <h4 className="font-bold text-amber-900 mb-2">Today&apos;s Quick Win</h4>
                                        <p className="text-slate-700 leading-relaxed">{structuredInsights.todaysQuickWin}</p>
                                      </CardContent>
                                    </Card>
                                  </motion.div>
                                )}
                                {structuredInsights.currentWeek && (
                                  <motion.div
                                    initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                                    animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                                    transition={prefersReducedMotion ? {} : { duration: 0.3, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
                                    whileHover={prefersReducedMotion ? {} : { y: -4, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                                  >
                                    <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                                      <CardContent className="p-4">
                                        <h4 className="font-bold text-cyan-900 mb-2">Current Week</h4>
                                        <p className="text-slate-700 leading-relaxed">{structuredInsights.currentWeek}</p>
                                      </CardContent>
                                    </Card>
                                  </motion.div>
                                )}
                                {structuredInsights.currentMonth && (
                                  <motion.div
                                    initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                                    animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                                    transition={prefersReducedMotion ? {} : { duration: 0.3, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
                                    whileHover={prefersReducedMotion ? {} : { y: -4, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                                  >
                                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                                      <CardContent className="p-4">
                                        <h4 className="font-bold text-blue-900 mb-2">Current Month</h4>
                                        <p className="text-slate-700 leading-relaxed">{structuredInsights.currentMonth}</p>
                                      </CardContent>
                                    </Card>
                                  </motion.div>
                                )}
                                {structuredInsights.currentYear && (
                                  <motion.div
                                    initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                                    animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                                    transition={prefersReducedMotion ? {} : { duration: 0.3, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                    whileHover={prefersReducedMotion ? {} : { y: -4, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                                  >
                                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                                      <CardContent className="p-4">
                                        <h4 className="font-bold text-purple-900 mb-2">Current Year ({new Date().getFullYear()})</h4>
                                        <p className="text-slate-700 leading-relaxed">{structuredInsights.currentYear}</p>
                                      </CardContent>
                                    </Card>
                                  </motion.div>
                                )}
                              </>
                            )
                          }
                          return (
                            <div className="text-slate-700 leading-relaxed">
                              {typeof insights === 'string' ? insights : 'Predictive insights are being prepared...'}
                            </div>
                          )
                        })()}
                      </div>
                    ) : isLoading || isLoadingComprehensiveAnalysis ? (
                      <motion.div 
                        className="text-center py-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div
                          className="relative w-12 h-12 mx-auto mb-3"
                          animate={prefersReducedMotion ? {} : { rotate: 360 }}
                          transition={prefersReducedMotion ? {} : { duration: 1.5, repeat: Infinity, ease: "linear" }}
                          style={{ willChange: prefersReducedMotion ? 'auto' : 'transform' }}
                        >
                          <svg className="w-12 h-12" viewBox="0 0 24 24" style={{ willChange: 'auto' }}>
                            <circle
                              cx="12"
                              cy="12"
                              r="8"
                              stroke="rgba(147, 51, 234, 0.2)"
                              strokeWidth="2"
                              fill="none"
                            />
                            {!prefersReducedMotion && (
                              <motion.circle
                                cx="12"
                                cy="12"
                                r="8"
                                stroke="#9333ea"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray="50 30"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                style={{ transformOrigin: "12px 12px", willChange: 'transform' }}
                              />
                            )}
                          </svg>
                        </motion.div>
                        <motion.p 
                          className="text-slate-700 text-sm font-medium"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          Generating predictive insights...
                        </motion.p>
                      </motion.div>
                    ) : (
                      <div className="text-center py-8">
                        <Eye className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                        <p className="text-slate-700 text-sm">Predictive insights will appear once analysis is complete.</p>
                      </div>
                    )}
                  </DashboardSection>
                  </>
                  )}

                </div>
              </>
                )}
              />
            ) : !westernNoReportGraceEnded ? (
              <motion.div
                className="text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative w-12 h-12 mx-auto mb-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-amber-400 border-t-transparent" />
                </div>
                <p className="text-slate-200">Loading your Western report…</p>
              </motion.div>
            ) : (
              <div className="text-center py-8">
                <Info className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-200 mb-4">No Western astrology report loaded. Generate your mystical profile once from your Profile page to see your report here.</p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center items-center">
                  <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white relative overflow-hidden focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-transparent">
                    <Link href="/profile">Generate your mystical profile</Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-amber-500/50 text-amber-200 hover:bg-amber-500/10"
                    onClick={() => refreshProfile()}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Refreshing…' : 'Refresh profile'}
                  </Button>
                  {canGenerateWesternOnDemand && (
                    <Button
                      type="button"
                      className="bg-amber-600/80 hover:bg-amber-600 text-white border border-amber-500/50"
                      onClick={generateWesternReport}
                      disabled={isGeneratingWestern}
                    >
                      {isGeneratingWestern ? 'Generating…' : 'Generate Western report'}
                    </Button>
                  )}
                </div>
              </div>
            )}
                </TabsContent>
              </motion.div>
            )}

            {/* Astro-Numerology Tab */}
            {activeTab === 'astro-numerology' && (
              <motion.div
                key="astro-numerology"
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                transition={motionConfig}
              >
                <TabsContent value="astro-numerology" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                  <AstroNumerologyTab
                    userId={user?.uid}
                    birthDate={userProfile?.birthDate}
                    fullName={userProfile?.displayName || userProfile?.fullName || user?.displayName || user?.email || (user ? 'You' : '')}
                    sunSign={sunSignFromWesternChart(analysis?.data?.planets as unknown[] | undefined)}
                    analysis={analysis}
                    cachedReport={astroNumerologyReport}
                    isLoadingReport={isLoadingAstroNumerologyReport}
                  />
                </TabsContent>
              </motion.div>
            )}

            {/* Advanced Techniques Tab */}
            {activeTab === 'advanced' && (
              <motion.div
                key="advanced"
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                transition={motionConfig}
              >
                <TabsContent value="advanced" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-purple-900">
                    <div className="bg-purple-200/60 rounded-full p-2">
                      <Zap className="w-6 h-6 text-purple-700" />
                    </div>
                    <span>Advanced Astrology Techniques</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 text-sm mb-6 leading-relaxed">
                    Explore specialized astrological systems and techniques for deeper insights into your cosmic blueprint. Suggest which tools you&apos;d like us to implement next—we use your feedback to prioritize new features.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getAllAdvancedTechniques().map((technique, index) => (
                      <motion.div
                        key={technique.slug}
                        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                        transition={prefersReducedMotion ? {} : { duration: 0.3, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
                        whileHover={prefersReducedMotion ? {} : { y: -4, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                      >
                        <Card 
                          className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 hover:border-amber-400 hover:shadow-xl transition-all duration-300 shadow-md rounded-2xl"
                        >
                          <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                              <motion.div 
                                className="bg-amber-200/60 rounded-full p-2"
                                whileHover={{}}
                                transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 400, damping: 17 }}
                              >
                                <span className="text-3xl">{technique.icon}</span>
                              </motion.div>
                              <h4 className="text-amber-900 font-bold text-lg">{technique.name}</h4>
                            </div>
                            <p className="text-slate-700 text-sm mb-4 leading-relaxed">{technique.description}</p>
                            <motion.div
                              whileHover={{}}
                              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                              transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 400, damping: 17 }}
                            >
                              <Link
                                href={`/tools/western-astrology/advanced/${technique.slug}`}
                                className="flex w-full items-center justify-center rounded-xl border-2 border-amber-400 bg-white px-4 py-2 text-sm font-medium text-amber-700 transition-all hover:border-amber-500 hover:bg-amber-50"
                              >
                                Learn More →
                              </Link>
                            </motion.div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
                </TabsContent>
              </motion.div>
            )}

            {/* Ask the Seer Tab */}
            {activeTab === 'ask-the-seer' && (
              <motion.div
                key="ask-the-seer"
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                transition={motionConfig}
              >
                <TabsContent value="ask-the-seer" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                  <div className="h-[800px] min-h-0">
                    <WesternSeerChatInterface
                      userId={user?.uid || ''}
                      userProfile={userProfile}
                      westernChartData={analysis?.data}
                      astroNumerologyData={
                        // Only pass Astro-Numerology data if we have the pipeline report OR if we have the required profile data
                        (astroNumerologyReport || (userProfile?.birthDate && userProfile?.displayName && analysis?.data)) ? (() => {
                          const numReport = astroNumerologyReport as { sunSign?: string; lifePathNumber?: number; nameNumber?: number; comprehensiveAnalysis?: unknown } | null | undefined;
                          return {
                            sunSign: numReport?.sunSign ||
                              sunSignFromWesternChart(analysis?.data?.planets as unknown[] | undefined) ||
                              'Unknown',
                            lifePathNumber: numReport?.lifePathNumber || 0,
                            nameNumber: numReport?.nameNumber || 0,
                            comprehensiveReport: numReport?.comprehensiveAnalysis ?? numReport ?? undefined
                          };
                        })() : undefined
                      }
                    />
                  </div>
                </TabsContent>
              </motion.div>
            )}
          </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </div>
    </ToolReportGuard>
  )
}

export default function WesternAstrologyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center starfield-ultra-sharp">
        <div className="animate-pulse text-amber-400">Loading...</div>
      </div>
    }>
      <WesternAstrologyPageContent />
    </Suspense>
  )
}