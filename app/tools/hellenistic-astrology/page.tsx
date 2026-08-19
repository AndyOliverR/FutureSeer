"use client"

import { useState, useMemo, useEffect, useLayoutEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { useToolReport } from '@/hooks/useComprehensiveMysticalProfile'
import { ToolReportGuard } from '@/components/ToolReportGuard'
import { ToolReportViralShell } from '@/components/report-viral/ToolReportViralShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Star, 
  AlertTriangle,
  Home,
  Gem,
  User,
  Heart,
  Sparkles,
  Moon,
  Sun,
  History,
  Briefcase
} from 'lucide-react'
import type { HellenisticAstrologyReading } from '@/lib/hellenisticAstrologyIntelligence'
import HellenisticChartWheel from '@/components/hellenistic/HellenisticChartWheel'
import { ToolIntroductionTab } from '@/components/ToolIntroductionTab'
import HellenisticSeerChatInterface from '@/components/hellenistic/HellenisticSeerChatInterface'
import { AstrologyMethodologyBadge } from '@/components/astrology/AstrologyMethodologyBadge'
import { DashboardSection } from '@/components/western/DashboardSection'
import { useIsMobileLayout } from '@/hooks/useIsMobileLayout'
import { fetchWithFirebaseAuthRequired } from '@/lib/clientFirebaseFetch'

// Constants
const HOUSE_MEANINGS: Record<number, string> = {
  1: 'Self, identity, appearance, personality, and how you present yourself to the world. The Ascendant house governs your physical body and life force.',
  2: 'Resources, values, possessions, money, and material security. Governs what you value and how you acquire wealth.',
  3: 'Communication, siblings, short journeys, learning, and immediate environment. Governs your thinking style and local connections.',
  4: 'Home, family, roots, emotional foundation, and private life. Governs your sense of security and ancestral heritage.',
  5: 'Creativity, children, romance, pleasure, and self-expression. Governs your capacity for joy and creative pursuits.',
  6: 'Health, work, service, daily routines, and small animals. Governs your approach to wellness and daily responsibilities.',
  7: 'Partnerships, marriage, relationships, and open enemies. Governs your approach to committed relationships and contracts.',
  8: 'Transformation, shared resources, death, regeneration, and the occult. Governs your ability to change and regenerate.',
  9: 'Higher learning, philosophy, long journeys, religion, and wisdom. Governs your quest for meaning and truth.',
  10: 'Career, reputation, public image, authority, and social status. Governs your professional path and public standing.',
  11: 'Friends, groups, hopes, wishes, and aspirations. Governs your social networks and future goals.',
  12: 'Subconscious, spirituality, hidden matters, sacrifice, and isolation. Governs your spiritual practices and areas of release.'
} as const;

const CHART_WHEEL_SIZE = 600;
const MATERIAL_3_EASING = [0.4, 0, 0.2, 1] as const;

export default function HellenisticAstrologyPage() {
  const { user, userProfile } = useAuth()
  const isMobileLayout = useIsMobileLayout()
  const [activeTab, setActiveTab] = useState<'introduction' | 'chart' | 'planets' | 'houses' | 'lots' | 'sect' | 'profections' | 'interpretations' | 'ask-the-seer'>('introduction')
  const { report: pipelineReport, loading: isLoading, error, refreshProfile } = useToolReport('hellenistic')
  const reading = useMemo((): HellenisticAstrologyReading | null => {
    if (!pipelineReport || typeof pipelineReport !== 'object') return null
    const r = pipelineReport as Record<string, unknown>
    if (r.placeholder === true) return null
    const data = (r.data ?? r) as HellenisticAstrologyReading | undefined
    return data && typeof data === 'object' ? data : null
  }, [pipelineReport])

  const [onDemandReading, setOnDemandReading] = useState<HellenisticAstrologyReading | null>(null)
  const [onDemandLoading, setOnDemandLoading] = useState(false)
  const [onDemandError, setOnDemandError] = useState<string | null>(null)

  const hasCompleteDetails = useMemo(() => 
    !!(userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace),
    [userProfile?.birthDate, userProfile?.birthTime, userProfile?.birthPlace]
  )

  const refreshProfileRef = useRef(refreshProfile)
  useLayoutEffect(() => {
    refreshProfileRef.current = refreshProfile
  }, [refreshProfile])
  const onDemandReadingRef = useRef<HellenisticAstrologyReading | null>(null)

  // When pipeline has no real report (missing or placeholder), fetch once and persist so returning visits load from profile
  useEffect(() => {
    if (!user?.uid || !userProfile || !hasCompleteDetails || reading || isLoading) return
    // Restore from ref if we already fetched (e.g. after Strict Mode remount) so content shows immediately
    if (onDemandReadingRef.current) {
      setOnDemandReading(onDemandReadingRef.current)
      setOnDemandLoading(false)
      return
    }
    if (onDemandLoading) return
    let cancelled = false
    const uid = user.uid
    const profile = userProfile
    const currentUser = user
    setOnDemandError(null)
    setOnDemandLoading(true)
    fetchWithFirebaseAuthRequired('/api/hellenistic/comprehensive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: uid,
        userProfile: {
          birthDate: profile.birthDate,
          birthTime: profile.birthTime || '12:00:00',
          birthPlace: profile.birthPlace,
          birthLatitude: profile.birthLatitude ?? 0,
          birthLongitude: profile.birthLongitude ?? 0,
        },
      }),
    })
      .then((res) => res.json())
      .then(async (json) => {
        const raw = json?.data
        const hasValidShape = raw && typeof raw === 'object' && !(raw as Record<string, unknown>).placeholder &&
          Array.isArray((raw as Record<string, unknown>).planets) &&
          Array.isArray((raw as Record<string, unknown>).houses)
        if (hasValidShape) {
          const reportData = raw as HellenisticAstrologyReading
          onDemandReadingRef.current = reportData
          setOnDemandReading(reportData)
          setOnDemandError(null)
          try {
            const token = await currentUser.getIdToken()
            const saveRes = await fetch('/api/profile/save-tool-report', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ toolSlug: 'hellenistic', data: reportData }),
            })
            if (saveRes.ok) refreshProfileRef.current?.()
          } catch {
            // Non-blocking
          }
        } else {
          setOnDemandError((json?.error as string) ?? 'Hellenistic report unavailable')
        }
      })
      .catch((err) => {
        if (!cancelled) setOnDemandError(err instanceof Error ? err.message : 'Failed to load Hellenistic report')
      })
      .finally(() => {
        if (!cancelled) {
          setOnDemandLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [user?.uid, userProfile, hasCompleteDetails, reading, isLoading, onDemandLoading])

  const effectiveReading = reading ?? onDemandReading
  const effectiveLoading = !effectiveReading && (isLoading || (!!hasCompleteDetails && !reading && onDemandLoading))
  const effectiveError = error ?? (!!hasCompleteDetails && !reading && !onDemandLoading ? onDemandError : null)

  if (!hasCompleteDetails) {
    return (
      <div className="relative min-h-screen starfield-ultra-sharp">
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md bg-slate-900/50 border-amber-500/50 backdrop-blur-sm rounded-xl">
            <CardContent className="p-6 text-center">
              <Star className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-amber-200 mb-2">Profile Incomplete</h2>
              <p className="text-slate-300 mb-4">Complete your profile to unlock your Hellenistic astrology chart</p>
              <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white transition-all duration-300 hover:shadow-lg" aria-label="Navigate to profile">
                <Link href="/profile">Complete Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Full-page loading only when profile is loading and we have no reading yet
  const chartWheelSize = isMobileLayout ? 320 : CHART_WHEEL_SIZE

  return (
    <ToolReportGuard loading={isLoading && !effectiveReading} error={effectiveError ?? null} toolLabel="Hellenistic chart">
    <div className="starfield-ultra-sharp min-h-screen px-2 sm:px-4 pt-4 overflow-x-hidden">
      {/* Softening overlay to integrate content with starfield */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 via-slate-900/30 to-slate-900/40 pointer-events-none"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto py-8">
        <div className="text-center mb-8 pt-4">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-6">
            <span className="text-yellow-400">🏛️</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Hellenistic Astrology</span>
          </h1>
          <p className="text-slate-200 leading-relaxed text-xl font-light">Ancient Greco-Roman astrology system (1st century BCE – 7th century CE)</p>
          <AstrologyMethodologyBadge variant="hellenistic" className="mt-4 mb-0" />
        </div>

        {/* Tabs */}
        <div className="rounded-2xl border border-amber-500/25 border-t-stone-500/30 bg-slate-900/80 overflow-hidden">
        <Tabs 
          value={activeTab} 
          onValueChange={(value) =>
            setActiveTab(
              value as
                | 'introduction'
                | 'chart'
                | 'planets'
                | 'houses'
                | 'lots'
                | 'sect'
                | 'profections'
                | 'interpretations'
                | 'ask-the-seer'
            )
          } 
          className="w-full"
          aria-label="Hellenistic Astrology navigation tabs"
        >
          <TabsList 
            className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 border-b-stone-600/30 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30"
            role="tablist"
            aria-label="Hellenistic Astrology sections"
          >
            <TabsTrigger 
              value="introduction" 
              className="hellenistic-tab hellenistic-tab-amber shrink-0 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50"
              aria-label="Introduction to Hellenistic Astrology"
            >
              Introduction
            </TabsTrigger>
            <TabsTrigger 
              value="chart" 
              className="hellenistic-tab hellenistic-tab-stone shrink-0 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Chart
            </TabsTrigger>
            <TabsTrigger 
              value="planets" 
              className="hellenistic-tab hellenistic-tab-rose shrink-0 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Planets
            </TabsTrigger>
            <TabsTrigger 
              value="houses" 
              className="hellenistic-tab hellenistic-tab-amber shrink-0 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Houses
            </TabsTrigger>
            <TabsTrigger 
              value="lots" 
              className="hellenistic-tab hellenistic-tab-stone shrink-0 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Lots
            </TabsTrigger>
            <TabsTrigger 
              value="sect" 
              className="hellenistic-tab hellenistic-tab-rose shrink-0 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Sect
            </TabsTrigger>
            <TabsTrigger 
              value="profections" 
              className="hellenistic-tab hellenistic-tab-amber shrink-0 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Profections
            </TabsTrigger>
            <TabsTrigger 
              value="interpretations" 
              className="hellenistic-tab hellenistic-tab-stone shrink-0 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Interpretations
            </TabsTrigger>
            <TabsTrigger 
              value="ask-the-seer" 
              className="hellenistic-tab hellenistic-tab-rose shrink-0 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50"
            >
              Ask the Seer
            </TabsTrigger>
          </TabsList>

          {/* Introduction Tab */}
          <AnimatePresence mode="wait">
            <TabsContent value="introduction" className="space-y-6 pt-6 px-2 sm:px-6 pb-6 mt-0">
              <motion.div
                key="introduction"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: MATERIAL_3_EASING }}
              >
                <ToolIntroductionTab toolSlug="hellenistic-astrology" />
              </motion.div>
            </TabsContent>
          </AnimatePresence>

          {/* Chart Tab */}
          <AnimatePresence mode="wait">
            <TabsContent value="chart" className="space-y-6 pt-6 px-2 sm:px-6 pb-6 mt-0">
              {effectiveLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-amber-50 to-stone-50 border-2 border-amber-200 rounded-3xl shadow-lg">
                    <CardContent className="p-8 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                      <p className="font-sacred-body text-amber-900 text-lg">Calculating your Hellenistic chart...</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : effectiveError ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-3xl shadow-lg">
                    <CardContent className="p-8 text-center">
                      <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                      <p className="text-red-700 mb-4">{effectiveError}</p>
                      <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white transition-all duration-300 hover:shadow-lg">
                        <Link href="/profile">Generate your mystical profile</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : effectiveReading ? (
                <ToolReportViralShell toolSlug="hellenistic" reportForTeaser={pipelineReport ?? effectiveReading}>
                <motion.div
                  key="chart"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: MATERIAL_3_EASING }}
                >
                  <DashboardSection 
                    title="Whole Sign House Chart" 
                    icon={<Star className="w-6 h-6" />}
                    colorScheme="amber"
                    defaultExpanded={true}
                    storageKey="chart"
                  >
                    <div className="space-y-6">
                      <div className="flex justify-center">
                      <HellenisticChartWheel
                        planets={effectiveReading.planets}
                        houses={effectiveReading.houses}
                        lots={[effectiveReading.lots.partOfFortune, effectiveReading.lots.partOfSpirit]}
                        ascendant={effectiveReading.ascendant}
                        width={chartWheelSize}
                        height={chartWheelSize}
                      />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1, duration: 0.3 }}
                        >
                          <Card className="bg-gradient-to-br from-amber-100 to-yellow-100 border-2 border-amber-300 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                            <CardContent className="p-4">
                              <p className="font-heading text-amber-900 font-semibold mb-2 text-sm uppercase tracking-wide">Ascendant</p>
                              <p className="text-slate-700 text-lg font-medium">
                                {effectiveReading.ascendant.sign} {effectiveReading.ascendant.degree.toFixed(1)}°
                              </p>
                            </CardContent>
                          </Card>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2, duration: 0.3 }}
                        >
                          <Card className="bg-gradient-to-br from-stone-100 to-amber-50 border-2 border-stone-300 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                            <CardContent className="p-4">
                              <p className="font-heading text-stone-800 font-semibold mb-2 text-sm uppercase tracking-wide">Chart Type</p>
                              <p className="text-slate-700 text-lg font-medium capitalize">{effectiveReading.sect.type} Chart</p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </div>
                    </div>
                  </DashboardSection>
                </motion.div>
                </ToolReportViralShell>
              ) : null}
            </TabsContent>
          </AnimatePresence>

          {/* Planets Tab */}
          <AnimatePresence mode="wait">
            <TabsContent value="planets" className="space-y-6 pt-6 px-2 sm:px-6 pb-6 mt-0">
              {effectiveLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-stone-50 to-amber-50 border-2 border-stone-200 rounded-3xl shadow-lg">
                    <CardContent className="p-8 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-500 mx-auto mb-4"></div>
                      <p className="font-sacred-body text-stone-800 text-lg">Loading planetary data...</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : effectiveReading ? (
                <motion.div
                  key="planets"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: MATERIAL_3_EASING }}
                >
                  <DashboardSection 
                    title="Planetary Positions & Dignities" 
                    icon={<Star className="w-6 h-6" />}
                    badge={`${effectiveReading.planets.length} Planets`}
                    colorScheme="amber"
                    defaultExpanded={true}
                    storageKey="planets"
                  >
                    <div className="space-y-4">
                      {effectiveReading.planets.map(planet => {
                        const dignity = effectiveReading.dignities[planet.name];
                        return (
                          <motion.div
                            key={planet.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, ease: MATERIAL_3_EASING }}
                          >
                            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h3 className="text-amber-900 font-semibold text-lg">{planet.name}</h3>
                                  <Badge className={dignity.score >= 3 ? 'bg-green-600' : dignity.score >= 1 ? 'bg-amber-500' : 'bg-red-600'}>
                                    Dignity: {dignity.score.toFixed(1)}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                                  <div className="bg-white/60 p-2 rounded-lg">
                                    <p className="text-slate-600 text-xs">Sign</p>
                                    <p className="text-slate-800 font-medium">{planet.sign} {planet.degree.toFixed(1)}°</p>
                                  </div>
                                  <div className="bg-white/60 p-2 rounded-lg">
                                    <p className="text-slate-600 text-xs">House</p>
                                    <p className="text-slate-800 font-medium">House {planet.house}</p>
                                  </div>
                                  <div className="bg-white/60 p-2 rounded-lg">
                                    <p className="text-slate-600 text-xs">Domicile</p>
                                    <p className={dignity.domicile ? 'text-green-700 font-bold' : 'text-slate-500'}>
                                      {dignity.domicile ? '✓' : '✗'}
                                    </p>
                                  </div>
                                  <div className="bg-white/60 p-2 rounded-lg">
                                    <p className="text-slate-600 text-xs">Exaltation</p>
                                    <p className={dignity.exaltation ? 'text-green-700 font-bold' : 'text-slate-500'}>
                                      {dignity.exaltation ? '✓' : '✗'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {dignity.triplicity && <Badge variant="outline" className="text-xs text-amber-700 border-amber-400 bg-amber-50">Triplicity</Badge>}
                                  {dignity.term && <Badge variant="outline" className="text-xs text-amber-700 border-amber-400 bg-amber-50">Term</Badge>}
                                  {dignity.face && <Badge variant="outline" className="text-xs text-amber-700 border-amber-400 bg-amber-50">Face</Badge>}
                                  {dignity.detriment && <Badge variant="outline" className="text-xs text-red-700 border-red-400 bg-red-50">Detriment</Badge>}
                                  {dignity.fall && <Badge variant="outline" className="text-xs text-red-700 border-red-400 bg-red-50">Fall</Badge>}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </DashboardSection>
                </motion.div>
              ) : null}
            </TabsContent>
          </AnimatePresence>

          {/* Houses Tab */}
          <AnimatePresence mode="wait">
            <TabsContent value="houses" className="space-y-6 pt-6 px-2 sm:px-6 pb-6 mt-0">
              {effectiveLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl shadow-lg">
                    <CardContent className="p-8 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                      <p className="font-sacred-body text-amber-900 text-lg">Loading house data...</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : effectiveReading ? (
                <motion.div
                  key="houses"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: MATERIAL_3_EASING }}
                >
                  <DashboardSection 
                    title="Whole Sign Houses" 
                    icon={<Home className="w-6 h-6" />}
                    badge="12 Houses"
                    colorScheme="amber"
                    defaultExpanded={true}
                    storageKey="houses"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {effectiveReading.houses.map((house, index) => (
                        <motion.div
                          key={house.number}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.2, ease: MATERIAL_3_EASING }}
                        >
                          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-amber-900 font-semibold">House {house.number}</h3>
                                <Badge variant="outline" className="text-amber-700 border-amber-400 bg-amber-50">{house.sign}</Badge>
                              </div>
                              <p className="text-slate-700 text-sm mb-3 leading-relaxed">
                                {house.interpretation || HOUSE_MEANINGS[house.number]}
                              </p>
                              {house.planets.length > 0 ? (
                                <div className="mt-2">
                                  <p className="text-slate-600 text-sm mb-1">Contains:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {house.planets.map(planet => (
                                      <Badge key={planet} className="bg-amber-600 text-white text-xs">
                                        {planet}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-slate-500 text-sm mt-2 italic">Empty</p>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </DashboardSection>
                </motion.div>
              ) : null}
            </TabsContent>
          </AnimatePresence>

          {/* Lots Tab */}
          <AnimatePresence mode="wait">
            <TabsContent value="lots" className="space-y-6 pt-6 px-2 sm:px-6 pb-6 mt-0">
              {effectiveLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-stone-50 to-amber-50 border-2 border-stone-200 rounded-3xl shadow-lg">
                    <CardContent className="p-8 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-500 mx-auto mb-4"></div>
                      <p className="font-sacred-body text-stone-800 text-lg">Calculating Lots...</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : effectiveReading ? (
                <motion.div
                  key="lots"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: MATERIAL_3_EASING }}
                >
                  <DashboardSection 
                    title="Lots (Parts)" 
                    icon={<Gem className="w-6 h-6" />}
                    badge="2 Lots"
                    colorScheme="amber"
                    defaultExpanded={true}
                    storageKey="lots"
                  >
                    <div className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1, duration: 0.3, ease: MATERIAL_3_EASING }}
                      >
                        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                          <CardContent className="p-6">
                            <h3 className="text-amber-900 font-semibold text-lg mb-4">
                              {effectiveReading.lots.partOfFortune.name}
                            </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="bg-white/60 p-3 rounded-lg">
                          <p className="text-slate-600 text-xs mb-1">Sign</p>
                          <p className="text-slate-800 font-medium">{effectiveReading.lots.partOfFortune.sign}</p>
                        </div>
                        <div className="bg-white/60 p-3 rounded-lg">
                          <p className="text-slate-600 text-xs mb-1">Degree</p>
                          <p className="text-slate-800 font-medium">{effectiveReading.lots.partOfFortune.degree.toFixed(1)}°</p>
                        </div>
                        <div className="bg-white/60 p-3 rounded-lg">
                          <p className="text-slate-600 text-xs mb-1">House</p>
                          <p className="text-slate-800 font-medium">House {effectiveReading.lots.partOfFortune.house}</p>
                        </div>
                        <div className="bg-white/60 p-3 rounded-lg">
                          <p className="text-slate-600 text-xs mb-1">Lord</p>
                          <p className="text-slate-800 font-medium">
                            {effectiveReading.houses.find(h => h.number === effectiveReading.lots.partOfFortune.house)?.sign ? 
                              (Object.entries({
                                'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
                                'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Mars',
                                'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
                              }).find(([sign]) => sign === effectiveReading.houses.find(h => h.number === effectiveReading.lots.partOfFortune.house)?.sign)?.[1] || 'Unknown') : 'Unknown'}
                          </p>
                        </div>
                      </div>
                            <p className="text-slate-700 text-sm leading-relaxed">{effectiveReading.lots.partOfFortune.interpretation}</p>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.3, ease: MATERIAL_3_EASING }}
                      >
                        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                          <CardContent className="p-6">
                            <h3 className="text-amber-900 font-semibold text-lg mb-4">
                              {effectiveReading.lots.partOfSpirit.name}
                            </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="bg-white/60 p-3 rounded-lg">
                          <p className="text-slate-600 text-xs mb-1">Sign</p>
                          <p className="text-slate-800 font-medium">{effectiveReading.lots.partOfSpirit.sign}</p>
                        </div>
                        <div className="bg-white/60 p-3 rounded-lg">
                          <p className="text-slate-600 text-xs mb-1">Degree</p>
                          <p className="text-slate-800 font-medium">{effectiveReading.lots.partOfSpirit.degree.toFixed(1)}°</p>
                        </div>
                        <div className="bg-white/60 p-3 rounded-lg">
                          <p className="text-slate-600 text-xs mb-1">House</p>
                          <p className="text-slate-800 font-medium">House {effectiveReading.lots.partOfSpirit.house}</p>
                        </div>
                        <div className="bg-white/60 p-3 rounded-lg">
                          <p className="text-slate-600 text-xs mb-1">Lord</p>
                          <p className="text-slate-800 font-medium">
                            {effectiveReading.houses.find(h => h.number === effectiveReading.lots.partOfSpirit.house)?.sign ? 
                              (Object.entries({
                                'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
                                'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Mars',
                                'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
                              }).find(([sign]) => sign === effectiveReading.houses.find(h => h.number === effectiveReading.lots.partOfSpirit.house)?.sign)?.[1] || 'Unknown') : 'Unknown'}
                          </p>
                        </div>
                      </div>
                            <p className="text-slate-700 text-sm leading-relaxed">{effectiveReading.lots.partOfSpirit.interpretation}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  </DashboardSection>
                </motion.div>
              ) : null}
            </TabsContent>
          </AnimatePresence>

          {/* Sect Tab */}
          <AnimatePresence mode="wait">
            <TabsContent value="sect" className="space-y-6 pt-6 px-2 sm:px-6 pb-6 mt-0">
              {effectiveLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-rose-50 to-amber-50 border-2 border-rose-200 rounded-3xl shadow-lg">
                    <CardContent className="p-8 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
                      <p className="font-sacred-body text-rose-900 text-lg">Determining sect...</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : effectiveReading ? (
                <motion.div
                  key="sect"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: MATERIAL_3_EASING }}
                >
                  <DashboardSection 
                    title="Planetary Sect" 
                    icon={effectiveReading.sect.type === 'day' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                    badge={effectiveReading.sect.type === 'day' ? 'Day Chart' : 'Night Chart'}
                    colorScheme="amber"
                    defaultExpanded={true}
                    storageKey="sect"
                  >
                    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                          <Badge className={effectiveReading.sect.type === 'day' ? 'bg-amber-500' : 'bg-amber-600'} variant="default">
                            {effectiveReading.sect.type.toUpperCase()} Chart
                          </Badge>
                          <p className="text-slate-700">
                            Sect Light: <span className="text-amber-900 font-semibold">{effectiveReading.sect.sectLeader}</span>
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-gradient-to-br from-amber-100 to-yellow-100 border border-amber-300 p-4 rounded-xl">
                            <p className="text-slate-600 text-sm mb-2">Sect Benefic</p>
                            <p className="text-amber-900 font-semibold text-lg">{effectiveReading.sect.benefic}</p>
                            <p className="text-slate-600 text-xs mt-1">Works more beneficially in this chart</p>
                          </div>
                          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 p-4 rounded-xl">
                            <p className="text-slate-600 text-sm mb-2">Sect Malefic</p>
                            <p className="text-amber-800 font-semibold text-lg">{effectiveReading.sect.malefic}</p>
                            <p className="text-slate-600 text-xs mt-1">More challenging in this chart</p>
                          </div>
                        </div>
                        <div className="mt-4 p-4 bg-white/60 rounded-lg border border-amber-200">
                          <p className="text-slate-700 text-sm leading-relaxed">
                            In a {effectiveReading.sect.type} chart, the {effectiveReading.sect.sectLeader} is the primary light and guide. 
                            The {effectiveReading.sect.benefic} works more beneficially, while the {effectiveReading.sect.malefic} may present 
                            more challenges. Understanding your sect helps you work with your chart&apos;s natural energies.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </DashboardSection>
                </motion.div>
              ) : null}
            </TabsContent>
          </AnimatePresence>

          {/* Profections Tab */}
          <AnimatePresence mode="wait">
            <TabsContent value="profections" className="space-y-6 pt-6 px-2 sm:px-6 pb-6 mt-0">
              {effectiveLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-amber-50 to-stone-50 border-2 border-amber-200 rounded-3xl shadow-lg">
                    <CardContent className="p-8 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                      <p className="font-sacred-body text-amber-900 text-lg">Calculating profections...</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : effectiveReading ? (
                <motion.div
                  key="profections"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: MATERIAL_3_EASING }}
                >
                  <DashboardSection 
                    title="Annual Profections" 
                    icon={<History className="w-6 h-6" />}
                    badge={`Year ${effectiveReading.profections.currentYear}`}
                    colorScheme="amber"
                    defaultExpanded={true}
                    storageKey="profections"
                  >
                    <div className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.3, ease: MATERIAL_3_EASING }}
                      >
                        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                              <Badge className="bg-amber-600 text-white">Year {effectiveReading.profections.currentYear}</Badge>
                              <p className="text-amber-900 font-semibold">
                                {effectiveReading.profections.currentSign} - Ruled by {effectiveReading.profections.lord}
                              </p>
                            </div>
                            <div className="mb-4">
                              <p className="text-slate-600 text-sm mb-2">Activated Houses</p>
                              <div className="flex flex-wrap gap-2">
                                {effectiveReading.profections.activatedHouses.map(house => (
                                  <Badge key={house} variant="outline" className="text-amber-700 border-amber-400 bg-amber-50">
                                    House {house}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <p className="text-slate-700 text-sm leading-relaxed">{effectiveReading.profections.timing}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.3, ease: MATERIAL_3_EASING }}
                      >
                        <Card className="bg-white/60 border border-amber-300 rounded-2xl shadow-sm">
                          <CardContent className="p-4">
                            <p className="text-slate-600 text-sm leading-relaxed">
                              Profections are an ancient timing technique where each year of life activates a different sign, 
                              starting from the Ascendant. The sign&apos;s ruler becomes the time-lord for that year, activating 
                              themes related to the houses it rules.
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  </DashboardSection>
                </motion.div>
              ) : null}
            </TabsContent>
          </AnimatePresence>

          {/* Interpretations Tab */}
          <AnimatePresence mode="wait">
            <TabsContent value="interpretations" className="space-y-6 pt-6 px-2 sm:px-6 pb-6 mt-0">
              {effectiveLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-stone-50 to-rose-50 border-2 border-stone-200 rounded-3xl shadow-lg">
                    <CardContent className="p-8 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-500 mx-auto mb-4"></div>
                      <p className="font-sacred-body text-stone-800 text-lg">Generating interpretations...</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : effectiveReading ? (
                <motion.div
                  key="interpretations"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: MATERIAL_3_EASING }}
                  className="space-y-6"
                >
                  {/* Personality */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3, ease: MATERIAL_3_EASING }}
                  >
                    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-t-3xl">
                        <CardTitle className="font-heading text-amber-900 flex items-center gap-2 text-xl tracking-tight">
                          <User className="w-6 h-6" />
                          Personality
                        </CardTitle>
                      </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <p className="text-slate-700 leading-relaxed">{effectiveReading.interpretations.personality.overview}</p>
                      <div className="bg-white/60 p-4 rounded-xl">
                        <p className="text-amber-900 font-semibold mb-2">Strengths</p>
                        <ul className="list-disc list-inside space-y-1 text-slate-700">
                          {effectiveReading.interpretations.personality.strengths.map((strength, i) => (
                            <li key={i}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white/60 p-4 rounded-xl">
                        <p className="text-amber-900 font-semibold mb-2">Challenges</p>
                        <ul className="list-disc list-inside space-y-1 text-slate-700">
                          {effectiveReading.interpretations.personality.challenges.map((challenge, i) => (
                            <li key={i}>{challenge}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white/60 p-4 rounded-xl">
                        <p className="text-amber-900 font-semibold mb-2">Life Purpose</p>
                        <p className="text-slate-700 leading-relaxed">{effectiveReading.interpretations.personality.lifePurpose}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Career */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3, ease: MATERIAL_3_EASING }}
                >
                  <Card className="bg-gradient-to-br from-stone-50 to-amber-50 border-2 border-stone-200 rounded-3xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-stone-100 to-amber-100 rounded-t-3xl">
                      <CardTitle className="font-heading text-stone-800 flex items-center gap-2 text-xl tracking-tight">
                        <Briefcase className="w-6 h-6" />
                        Career
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <p className="text-stone-800 font-semibold mb-3">Suitable Professions</p>
                        <div className="flex flex-wrap gap-2">
                          {effectiveReading.interpretations.career.suitableProfessions.map((prof, i) => (
                            <Badge key={i} className="bg-stone-600 text-white">
                              {prof}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="bg-white/60 p-4 rounded-xl">
                        <p className="text-slate-700 leading-relaxed">{effectiveReading.interpretations.career.careerTiming}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Relationships */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3, ease: MATERIAL_3_EASING }}
                >
                  <Card className="bg-gradient-to-br from-rose-50 to-amber-50 border-2 border-rose-200 rounded-3xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-rose-100 to-amber-100 rounded-t-3xl">
                      <CardTitle className="font-heading text-rose-900 flex items-center gap-2 text-xl tracking-tight">
                        <Heart className="w-6 h-6" />
                        Relationships
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="bg-white/60 p-4 rounded-xl">
                        <p className="text-slate-700 leading-relaxed mb-3">{effectiveReading.interpretations.relationships.compatibility}</p>
                        <p className="text-slate-700 leading-relaxed">{effectiveReading.interpretations.relationships.relationshipAdvice}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Remedies */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3, ease: MATERIAL_3_EASING }}
                >
                  <Card className="bg-gradient-to-br from-amber-50 to-stone-50 border-2 border-amber-200 rounded-3xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-amber-100 to-stone-100 rounded-t-3xl">
                      <CardTitle className="font-heading text-amber-900 flex items-center gap-2 text-xl tracking-tight">
                        <Sparkles className="w-6 h-6" />
                        Remedies & Guidance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <p className="text-amber-900 font-semibold mb-3">Planetary Remedies</p>
                        {effectiveReading.remedies.planetary.map((remedy, i) => (
                          <div key={i} className="bg-white/60 p-4 rounded-xl mb-3">
                            <p className="text-amber-900 font-semibold">{remedy.planet}</p>
                            <p className="text-slate-700 text-sm mt-1">{remedy.remedy}</p>
                            <p className="text-slate-600 text-xs mt-2">Timing: {remedy.timing}</p>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-amber-900 font-semibold mb-3">General Guidance</p>
                        <ul className="list-disc list-inside space-y-2 text-slate-700">
                          {effectiveReading.remedies.general.map((guidance, i) => (
                            <li key={i}>{guidance}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ) : null}
          </TabsContent>
          </AnimatePresence>

          {/* Ask the Seer Tab */}
          <AnimatePresence mode="wait">
            <TabsContent value="ask-the-seer" className="space-y-6 pt-6 px-2 sm:px-6 pb-6 mt-0">
              <motion.div
                key="ask-seer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: MATERIAL_3_EASING }}
              >
                <Card className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 shadow-lg rounded-3xl h-auto md:h-[800px] min-h-[50vh] max-h-[85vh] overflow-hidden">
                  <div className="h-full bg-gradient-to-b from-transparent to-white/30">
                    <HellenisticSeerChatInterface 
                      userId={user?.uid || ''}
                      userProfile={userProfile}
                      hellenisticReading={effectiveReading || undefined}
                    />
                  </div>
                </Card>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
        </div>
      </div>
    </div>
    </ToolReportGuard>
  )
}

