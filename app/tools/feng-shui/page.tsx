"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { devLog } from '@/lib/devLogger';
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { useToolReport } from "@/hooks/useComprehensiveMysticalProfile"
import { useRouter } from "next/navigation"
import { useToolReportUnlock } from "@/hooks/useToolReportUnlock"
import { useViralReportBypass } from "@/hooks/useViralReportBypass"
import { TeaserView } from "@/components/report-viral/TeaserView"
import { ShareCard } from "@/components/report-viral/ShareCard"
import { ViralLockOverlay } from "@/components/report-viral/LockedReportView"
import { buildToolTeaser } from "@/lib/report-viral/buildToolTeaser"
import { toolPathForSlug } from "@/lib/report-viral/toolSlugToPath"
import { cn } from "@/lib/utils"
import { 
  Compass, 
  Layout, 
  Home, 
  Sparkles, 
  Shield,
  Zap,
  Info,
  BookOpen,
  MessageCircle,
  Users,
  ListChecks,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FengShuiSeerChatInterface from "@/components/FengShuiSeerChatInterface"
import { generateFengShuiAnalysis, FengShuiAnalysis } from "@/lib/fengshui/fengShuiService"
import { generateFengShuiReading, FengShuiReading } from "@/lib/fengshui/fengShuiIntelligence"
import BaguaMap from "@/components/fengshui/BaguaMap"
import RoomGuidance from "@/components/fengshui/RoomGuidance"
import ElementBalance from "@/components/fengshui/ElementBalance"
import FengShuiCures from "@/components/fengshui/FengShuiCures"
import FengShuiPracticalGuides from "@/components/fengshui/FengShuiPracticalGuides"
import FengShuiReport from "@/components/fengshui/FengShuiReport"
import CompassHelper from "@/components/fengshui/CompassHelper"
import { Phase2VisualPanel } from "@/components/charts/Phase2VisualPanel"
import { adaptFengShuiBagua } from "@/lib/charts/phase2Adapters"
import { isFengShuiChartsV2Enabled } from "@/lib/charts/featureFlags"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FengShuiLayoutInput } from "@/components/FengShuiSeerChatInterface"
import { classifyToolReportState } from "@/lib/profileGenerationOrchestrator"

const DIRECTION_OPTIONS = ['Unknown', 'North', 'South', 'East', 'West', 'Northeast', 'Northwest', 'Southeast', 'Southwest'] as const

const tabs = [
  { id: 'overview', label: 'Overview', icon: Compass },
  { id: 'bagua', label: 'Bagua Map', icon: Layout },
  { id: 'rooms', label: 'Room Guidance', icon: Home },
  { id: 'elements', label: 'Element Balance', icon: Sparkles },
  { id: 'report', label: 'Full Report', icon: BookOpen },
  { id: 'cures', label: 'Cures & Remedies', icon: Shield },
  { id: 'quick-fixes', label: 'Quick fixes', icon: ListChecks },
  { id: 'ask-seer', label: 'Ask The Seer', icon: MessageCircle }
]

export default function FengShuiPage() {
  const { user, userProfile } = useAuth()
  const { report: pipelineReport, loading: isPipelineLoading, error: pipelineError } = useToolReport('fengShui')
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [analysis, setAnalysis] = useState<FengShuiAnalysis | null>(null)
  const [reading, setReading] = useState<FengShuiReading | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fengShuiFromPipeline = useMemo(() => {
    if (!pipelineReport || typeof pipelineReport !== 'object') return null
    if (classifyToolReportState(pipelineReport) !== 'ready') return null
    const envelope = pipelineReport as Record<string, unknown>
    const data = (envelope.data ?? envelope) as Record<string, unknown>
    const analysis = (data.analysis ?? data.fengShuiAnalysis ?? data) as FengShuiAnalysis | undefined
    const reading = (data.reading ?? data.fengShuiReading) as FengShuiReading | undefined
    if (!analysis || !reading) return null
    return { analysis, reading }
  }, [pipelineReport])

  const [facingDirection, setFacingDirection] = useState<string>('')
  const [layout, setLayout] = useState<FengShuiLayoutInput>({})

  const viralUnlock = useToolReportUnlock('fengShui')
  const bypassViral = useViralReportBypass()
  const [showShareCard, setShowShareCard] = useState(false)
  const [waitingLite, setWaitingLite] = useState(false)

  const showFengViral = Boolean(analysis && reading) && !bypassViral
  const fengTeaserSource = useMemo(() => {
    if (!reading && !analysis) return null
    if (reading && analysis) {
      return { ...reading, kua: analysis.kua, elementAnalysis: analysis.elementAnalysis }
    }
    return reading ?? analysis
  }, [reading, analysis])

  const fengTeaser = useMemo(
    () => buildToolTeaser('fengShui', fengTeaserSource),
    [fengTeaserSource]
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
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "FutureSeer — my reading",
          text: `${fengTeaser.archetypeName}: ${fengTeaser.hookLine.slice(0, 120)}…`,
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
  }, [copyLink, viralUnlock, fengTeaser.archetypeName, fengTeaser.hookLine])

  const continueWithoutSharing = useCallback(() => {
    setWaitingLite(true)
    window.setTimeout(() => {
      viralUnlock.unlockLite()
      setWaitingLite(false)
    }, 4000)
  }, [viralUnlock])

  const fengCompareHref = useMemo(
    () => `/tools/${toolPathForSlug("fengShui")}?friend=compare&ref=share`,
    []
  )

  const fengLocked =
    showFengViral && viralUnlock.hydrated && !viralUnlock.isUnlocked && !bypassViral

  useEffect(() => {
    const loadFengShuiAnalysis = async () => {
      if (fengShuiFromPipeline) {
        setAnalysis(fengShuiFromPipeline.analysis)
        setReading(fengShuiFromPipeline.reading)
        setIsLoading(false)
        setError(null)
        return
      }

      if (!userProfile) {
        setIsLoading(false)
        return
      }

      // Check if profile is complete
      if (!userProfile.birthDate || userProfile.gender === undefined) {
        setError("Please complete your profile with birth date and gender to receive personalized Feng Shui analysis.")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Generate analysis
        const fengShuiAnalysis = generateFengShuiAnalysis(userProfile)
        
        if (!fengShuiAnalysis) {
          setError("Unable to generate Feng Shui analysis. Please ensure your profile is complete.")
          setIsLoading(false)
          return
        }

        setAnalysis(fengShuiAnalysis)

        // Generate reading
        const fengShuiReading = await generateFengShuiReading(userProfile, fengShuiAnalysis)
        setReading(fengShuiReading)
      } catch (err: unknown) {
        devLog.error('Error loading Feng Shui analysis:', err, 'page')
        setError(err instanceof Error ? err.message : "An error occurred while generating your Feng Shui analysis.")
      } finally {
        setIsLoading(false)
      }
    }

    loadFengShuiAnalysis()
  }, [userProfile, fengShuiFromPipeline])

  if (!user) {
    return (
      <div className="starfield-ultra-sharp min-h-screen flex items-center justify-center p-4">
        <Card 
          elevation={2}
          className="backdrop-blur-md bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] rounded-xl max-w-md"
        >
          <CardContent className="p-6 text-center">
            <p className="text-[var(--m3-on-surface)] mb-4">Please sign in to access Feng Shui analysis.</p>
            <Button onClick={() => router.push('/auth')} className="bg-gradient-to-r from-amber-600 to-yellow-500">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="starfield-ultra-sharp min-h-screen overflow-x-hidden">
      <div className="px-2 sm:px-4 py-4">
        <div className="max-w-7xl mx-auto">
          {/* Header - match Western Astrology typography */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 pt-4"
          >
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-6">
              <span className="text-yellow-400">🏮</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Feng Shui Analysis</span>
            </h1>
            <p className="text-slate-200 leading-relaxed text-xl font-light max-w-2xl mx-auto">
              Harmonize your environment with natural energy flow to enhance health, wealth, relationships, and well-being
            </p>
          </motion.div>

          {/* Error Alert */}
          {(error || pipelineError) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert className="bg-red-500/20 border-red-500/50 text-[var(--m3-on-surface)]">
                <Info className="h-4 w-4" />
                <AlertDescription>{error ?? pipelineError}</AlertDescription>
                {(error ?? pipelineError ?? '').includes("complete your profile") && (
                  <Button
                    onClick={() => router.push('/profile')}
                    className="mt-4 bg-gradient-to-r from-amber-600 to-yellow-500"
                  >
                    Complete Profile
                  </Button>
                )}
              </Alert>
            </motion.div>
          )}

          {/* Loading State */}
          {(isLoading || isPipelineLoading) && (
            <div className="text-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-6xl mb-4"
              >
                🏮
              </motion.div>
              <p className="text-[var(--m3-on-surface-variant)]">Calculating your Feng Shui analysis...</p>
            </div>
          )}

          {/* Main Content */}
          {!isLoading && analysis && reading && (
            <>
              {isFengShuiChartsV2Enabled() && (
                <div className="mb-6">
                  <Phase2VisualPanel
                    charts={[
                      adaptFengShuiBagua({
                        title: "Feng Shui Bagua (Phase 2 Preview)",
                        sectors: analysis?.bagua?.map((area) => String(area?.name ?? '')).filter(Boolean),
                      }),
                    ]}
                  />
                </div>
              )}

              {showFengViral && !bypassViral && (
                <div className="mb-6 space-y-4">
                  <TeaserView teaser={fengTeaser} />
                  {showShareCard && (
                    <ShareCard
                      archetypeName={fengTeaser.archetypeName}
                      hookLine={fengTeaser.hookLine}
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

              {showFengViral && viralUnlock.isUnlocked && !bypassViral && (
                <div className="mb-4 flex justify-center">
                  <Link
                    href={fengCompareHref}
                    className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-950/40 px-4 py-2 text-sm font-medium text-violet-100 hover:bg-violet-900/50"
                  >
                    <Users className="h-4 w-4" />
                    Compare with a friend
                  </Link>
                </div>
              )}

              {/* Tabs - filing-cabinet, match Western Astrology */}
              <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)} className="w-full min-w-0">
                <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
                    {tabs.map((tab) => {
                      const Icon = tab.icon
                      return (
                        <TabsTrigger
                          key={tab.id}
                          value={tab.id}
                          className="shrink-0 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 border border-transparent data-[state=inactive]:border-slate-600/50 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 transition-all flex items-center justify-center gap-2"
                        >
                          <Icon className="w-4 h-4" />
                          {tab.label}
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>

                  {activeTab === 'ask-seer' ? (
                  <TabsContent value="ask-seer" className="space-y-6 pt-6 px-2 sm:px-6 pb-6 mt-0">
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-6 shadow-md">
                      <FengShuiSeerChatInterface
                        analysis={analysis}
                        userId={user?.uid}
                        userProfile={userProfile ?? undefined}
                        sessionId={userProfile?.uid ? `feng-shui_${userProfile.uid}` : undefined}
                        facingDirection={facingDirection || undefined}
                        layout={[layout.main_door, layout.bedroom, layout.kitchen, layout.toilet].some(Boolean) ? layout : undefined}
                      />
                    </div>
                  </TabsContent>
                  ) : showFengViral && !viralUnlock.hydrated ? (
                  <div className="py-12 text-center text-slate-400">Loading report…</div>
                  ) : (
                  <div className="relative min-h-[320px]">
                    {fengLocked && (
                      <ViralLockOverlay
                        onUnlockClick={handleShareToUnlock}
                        onContinueWithoutSharing={waitingLite ? () => {} : continueWithoutSharing}
                        continueDisabled={waitingLite}
                      />
                    )}
                    <div
                      className={cn(
                        fengLocked &&
                          'pointer-events-none select-none blur-sm filter transition-[filter] duration-300 [&_*]:pointer-events-none'
                      )}
                    >
              {/* Kua Number Summary Card - Material 3 devotionist gradient */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-6 mb-6 shadow-md mx-4 sm:mx-6 mt-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-900 mb-1">
                      {analysis.kua.number}
                    </div>
                    <div className="text-sm text-slate-700">Kua Number</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-900 mb-1">
                      {analysis.kua.element}
                    </div>
                    <div className="text-sm text-slate-700">Element</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-amber-900 mb-1">
                      {analysis.kua.favorableDirections.success}
                    </div>
                    <div className="text-sm text-slate-700">Success Direction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-amber-900 mb-1">
                      {analysis.kua.favorableDirections.health}
                    </div>
                    <div className="text-sm text-slate-700">Health Direction</div>
                  </div>
                </div>
              </motion.div>

                  <TabsContent value="overview" className="space-y-6 pt-6 px-2 sm:px-6 pb-6 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                        <CardHeader>
                          <CardTitle className="text-amber-900 flex items-center gap-2">
                            <Compass className="w-5 h-5 text-amber-700" />
                            Your Kua Number
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <div className="text-4xl font-bold text-amber-900 mb-2">
                                {analysis.kua.number}
                              </div>
                              <p className="text-slate-700 text-sm">{analysis.kua.attributes}</p>
                            </div>
                            <div className="pt-3 border-t border-amber-200">
                              <p className="text-sm font-semibold text-amber-900 mb-2">Favorable Directions:</p>
                              <div className="space-y-1 text-sm text-slate-700">
                                <div>Success: <span className="text-amber-900">{analysis.kua.favorableDirections.success}</span></div>
                                <div>Health: <span className="text-amber-900">{analysis.kua.favorableDirections.health}</span></div>
                                <div>Relationships: <span className="text-amber-900">{analysis.kua.favorableDirections.relationships}</span></div>
                                <div>Wisdom: <span className="text-amber-900">{analysis.kua.favorableDirections.wisdom}</span></div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                        <CardHeader>
                          <CardTitle className="text-amber-900 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-700" />
                            Element Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <div className="text-2xl font-bold text-amber-900 mb-2">
                                {analysis.elementAnalysis.primaryElement}
                              </div>
                              <p className="text-slate-700 text-sm">{analysis.elementAnalysis.elementDescription}</p>
                            </div>
                            <div className="pt-3 border-t border-amber-200">
                              <p className="text-sm font-semibold text-amber-900 mb-2">Enhancing Elements:</p>
                              <div className="flex flex-wrap gap-2">
                                {analysis.elementAnalysis.generatingCycle.map((element, i) => (
                                  <Badge key={`element-${i}`} className="bg-amber-100 text-amber-900 border border-amber-300">
                                    {element}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                      <CardHeader>
                        <CardTitle className="text-amber-900">Quick Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {reading.generalRecommendations.slice(0, 5).map((rec, i) => (
                            <li key={`rec-${i}`} className="flex items-start gap-2 text-slate-700">
                              <Zap className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Space layout: facing + room directions for Ask the Seer */}
                    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                      <CardHeader>
                        <CardTitle className="text-amber-900 flex items-center gap-2">
                          <Layout className="w-5 h-5 text-amber-700" />
                          Space layout
                        </CardTitle>
                        <p className="text-sm text-slate-700">
                          Optional. Fill this in so &quot;Ask the Seer&quot; can give layout-specific advice. Use the compass on a phone/tablet to set facing direction.
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-amber-900 block mb-1">Facing direction</label>
                            <Select
                              value={facingDirection || 'Unknown'}
                              onValueChange={(v) => setFacingDirection(v === 'Unknown' ? '' : v)}
                            >
                              <SelectTrigger className="border-amber-200 bg-white text-slate-800">
                                <SelectValue placeholder="Select…" />
                              </SelectTrigger>
                              <SelectContent>
                                {DIRECTION_OPTIONS.map((d) => (
                                  <SelectItem key={d} value={d}>{d}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-amber-900 block mb-1">Main door</label>
                            <Select
                              value={layout.main_door || 'Unknown'}
                              onValueChange={(v) => setLayout((prev) => ({ ...prev, main_door: v === 'Unknown' ? undefined : v }))}
                            >
                              <SelectTrigger className="border-amber-200 bg-white text-slate-800">
                                <SelectValue placeholder="Select…" />
                              </SelectTrigger>
                              <SelectContent>
                                {DIRECTION_OPTIONS.map((d) => (
                                  <SelectItem key={d} value={d}>{d}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-amber-900 block mb-1">Bedroom</label>
                            <Select
                              value={layout.bedroom || 'Unknown'}
                              onValueChange={(v) => setLayout((prev) => ({ ...prev, bedroom: v === 'Unknown' ? undefined : v }))}
                            >
                              <SelectTrigger className="border-amber-200 bg-white text-slate-800">
                                <SelectValue placeholder="Select…" />
                              </SelectTrigger>
                              <SelectContent>
                                {DIRECTION_OPTIONS.map((d) => (
                                  <SelectItem key={d} value={d}>{d}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-amber-900 block mb-1">Kitchen</label>
                            <Select
                              value={layout.kitchen || 'Unknown'}
                              onValueChange={(v) => setLayout((prev) => ({ ...prev, kitchen: v === 'Unknown' ? undefined : v }))}
                            >
                              <SelectTrigger className="border-amber-200 bg-white text-slate-800">
                                <SelectValue placeholder="Select…" />
                              </SelectTrigger>
                              <SelectContent>
                                {DIRECTION_OPTIONS.map((d) => (
                                  <SelectItem key={d} value={d}>{d}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-amber-900 block mb-1">Toilet</label>
                            <Select
                              value={layout.toilet || 'Unknown'}
                              onValueChange={(v) => setLayout((prev) => ({ ...prev, toilet: v === 'Unknown' ? undefined : v }))}
                            >
                              <SelectTrigger className="border-amber-200 bg-white text-slate-800">
                                <SelectValue placeholder="Select…" />
                              </SelectTrigger>
                              <SelectContent>
                                {DIRECTION_OPTIONS.map((d) => (
                                  <SelectItem key={d} value={d}>{d}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <CompassHelper onUseDirection={(d) => setFacingDirection(d)} />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="bagua" className="space-y-6 pt-6 px-2 sm:px-6 pb-6 mt-0">
                    <BaguaMap 
                      areas={analysis.bagua} 
                      favorableDirections={analysis.favorableDirections}
                    />
                  </TabsContent>

                  <TabsContent value="rooms" className="space-y-6 pt-6 px-2 sm:px-6 pb-6 mt-0">
                    <RoomGuidance rooms={reading.roomGuidance} />
                  </TabsContent>

                  <TabsContent value="elements" className="space-y-6 pt-6 px-2 sm:px-6 pb-6 mt-0">
                    <ElementBalance elementAnalysis={analysis.elementAnalysis} />
                  </TabsContent>

                  <TabsContent value="report" className="space-y-6 pt-6 px-2 sm:px-6 pb-6 mt-0">
                    <FengShuiReport reading={reading} />
                  </TabsContent>

                  <TabsContent value="cures" className="space-y-6 pt-6 px-2 sm:px-6 pb-6 mt-0">
                    <FengShuiCures cures={reading.cures} />
                  </TabsContent>

                  <TabsContent value="quick-fixes" className="space-y-6 pt-6 px-2 sm:px-6 pb-6 mt-0">
                    <FengShuiPracticalGuides wealthTips={reading.wealthTips} />
                  </TabsContent>
                    </div>
                  </div>
                  )}
                </Tabs>
                </div>
            </>
          )}

          {/* Empty State - No Profile */}
          {!isLoading && !analysis && !error && (
            <Card
              elevation={2}
              className="backdrop-blur-md bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] rounded-xl p-8 text-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-6xl mb-4">🏮</div>
                <h2 className="text-2xl font-bold text-[var(--m3-on-surface)] mb-4">Complete Your Profile</h2>
                <p className="text-[var(--m3-on-surface-variant)] mb-6">
                  To receive personalized Feng Shui analysis, please complete your profile with birth date, gender, and birth place.
                </p>
                <Button
                  onClick={() => router.push('/profile')}
                  className="bg-gradient-to-r from-amber-600 to-yellow-500"
                >
                  Go to Profile
                </Button>
              </motion.div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

