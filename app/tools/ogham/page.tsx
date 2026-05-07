"use client"

/**
 * Ogham Page
 * Main page for Celtic Ogham divination
 * Enhanced with comprehensive reports, profile integration, and visual displays
 */

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Info, BookOpen, AlertCircle, MessageCircle, Users } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useToolReport } from '@/hooks/useComprehensiveMysticalProfile'
import { ToolReportGuard } from '@/components/ToolReportGuard'
import { useViralReportBypass } from '@/hooks/useViralReportBypass'
import { useToolReportUnlock } from '@/hooks/useToolReportUnlock'
import { TeaserView } from '@/components/report-viral/TeaserView'
import { ShareCard } from '@/components/report-viral/ShareCard'
import { ViralLockOverlay } from '@/components/report-viral/LockedReportView'
import { buildToolTeaser } from '@/lib/report-viral/buildToolTeaser'
import { toolPathForSlug } from '@/lib/report-viral/toolSlugToPath'
import { cn } from '@/lib/utils'
import { analytics } from '@/lib/analytics'
import { OghamReport } from '@/lib/ogham/oghamReportGenerator'
import OghamReportDisplay from '@/components/ogham/OghamReportDisplay'
import { OghamSeerChatInterface } from '@/components/ogham/OghamSeerChatInterface'
import { ToolIntroductionTab } from '@/components/ToolIntroductionTab'

type OghamToolTab = 'overview' | 'report' | 'ask-seer'

function isOghamToolTab(value: string): value is OghamToolTab {
  return value === 'overview' || value === 'report' || value === 'ask-seer'
}

export default function OghamPage() {
  const { user, userProfile } = useAuth()
  const bypassViralRestrictions = useViralReportBypass()
  const viralUnlock = useToolReportUnlock('ogham')
  const [showShareCard, setShowShareCard] = useState(false)
  const [waitingLite, setWaitingLite] = useState(false)
  const [activeTab, setActiveTab] = useState<OghamToolTab>('overview')
  const { report: pipelineReport, loading: isGeneratingReport, error, hasReport } = useToolReport('ogham')
  const report = useMemo(() => {
    const raw = pipelineReport as Record<string, unknown> | undefined
    if (raw?.report) return raw.report as OghamReport
    if (pipelineReport && typeof pipelineReport === 'object' && !('placeholder' in (pipelineReport as object))) return pipelineReport as unknown as OghamReport
    return null
  }, [pipelineReport])

  const oghamTeaser = useMemo(() => {
    const raw = pipelineReport as Record<string, unknown> | undefined
    return buildToolTeaser('ogham', raw?.report ?? raw ?? report ?? null)
  }, [pipelineReport, report])

  const showOghamViral = Boolean(report) && !bypassViralRestrictions

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
          text: `${oghamTeaser.archetypeName}: ${oghamTeaser.hookLine.slice(0, 120)}…`,
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
  }, [copyLink, viralUnlock, oghamTeaser.archetypeName, oghamTeaser.hookLine])

  const continueWithoutSharing = useCallback(() => {
    setWaitingLite(true)
    window.setTimeout(() => {
      viralUnlock.unlockLite()
      setWaitingLite(false)
    }, 4000)
  }, [viralUnlock])

  const oghamCompareHref = useMemo(() => `/tools/${toolPathForSlug('ogham')}?friend=compare&ref=share`, [])

  const oghamLocked =
    showOghamViral && viralUnlock.hydrated && !viralUnlock.isUnlocked && !bypassViralRestrictions

  return (
    <ToolReportGuard loading={isGeneratingReport} error={error ?? null} toolLabel="Ogham">
    <div className="starfield-ultra-sharp min-h-screen overflow-x-hidden">
      <div className="container mx-auto px-2 sm:px-4 py-8 pt-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-5xl">🌿</span>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold gold-glow">
                Ogham Divination
              </h1>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
              Discover your connection to the ancient Celtic tree alphabet and unlock the wisdom of the Ogham script
            </p>
          </motion.div>

          {showOghamViral && !bypassViralRestrictions && (
            <div className="mb-6 space-y-4">
              <TeaserView teaser={oghamTeaser} />
              {showShareCard && (
                <ShareCard
                  archetypeName={oghamTeaser.archetypeName}
                  hookLine={oghamTeaser.hookLine}
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

          {showOghamViral && viralUnlock.isUnlocked && !bypassViralRestrictions && (
            <div className="mb-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href={oghamCompareHref}
                className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-950/40 px-4 py-2 text-sm font-medium text-violet-100 hover:bg-violet-900/50"
              >
                <Users className="h-4 w-4" />
                Compare with a friend
              </Link>
              <Link
                href="/subscribe"
                className="text-center text-sm font-medium text-amber-200/90 underline underline-offset-2 hover:text-amber-100"
                onClick={() =>
                  analytics.trackPricingView('subscribe_from_viral_gate_footer', { surface: 'ogham_tool' })
                }
              >
                Coffee, Treat, or Hamper — upgrade for full access everywhere
              </Link>
            </div>
          )}

          {/* CTA when no report */}
          {!hasReport && !isGeneratingReport && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="bg-amber-500/10 border-amber-500/30">
                <CardContent className="p-4 text-center">
                  <p className="text-slate-300 mb-3">Generate your mystical profile to unlock your Ogham reading.</p>
                  <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                    <Link href="/profile">Generate your mystical profile</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="bg-red-500/10 border-red-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <div>
                      <p className="text-red-400 font-semibold">Error</p>
                      <p className="text-slate-300 text-sm">{error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Main Content Tabs */}
          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              if (isOghamToolTab(value)) setActiveTab(value)
            }}
            className="w-full min-w-0"
          >
            <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
              <TabsTrigger 
                value="overview" 
                className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50"
              >
                <Info className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="report" 
                className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Your Reading
              </TabsTrigger>
              <TabsTrigger 
                value="ask-seer" 
                className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center border border-transparent data-[state=inactive]:border-slate-600/50"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Ask The Seer
              </TabsTrigger>
            </TabsList>

            {activeTab === 'ask-seer' ? (
            <TabsContent value="ask-seer" className="pt-6 px-2 sm:px-6 pb-6 mt-0">
              {user?.uid && userProfile ? (
                report ? (
                  <OghamSeerChatInterface
                    report={report}
                    userProfile={userProfile}
                    userId={user.uid}
                  />
                ) : (
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl">
                    <CardContent className="p-12 text-center">
                      <MessageCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                      <p className="text-slate-700 mb-4">Generate your mystical profile to unlock your Ogham reading.</p>
                      <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl">
                        <Link href="/profile">Generate your mystical profile</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              ) : (
                <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl">
                  <CardContent className="p-12 text-center">
                    <p className="text-slate-700">Please sign in to ask The Seer about Ogham</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            ) : showOghamViral && !viralUnlock.hydrated ? (
              <div className="py-12 text-center text-slate-400">Loading report…</div>
            ) : (
              <div className="relative min-h-[320px]">
                {oghamLocked && (
                  <ViralLockOverlay
                    onUnlockClick={handleShareToUnlock}
                    onContinueWithoutSharing={waitingLite ? () => {} : continueWithoutSharing}
                    continueDisabled={waitingLite}
                  />
                )}
                <div
                  className={cn(
                    oghamLocked &&
                      'pointer-events-none select-none blur-sm filter transition-[filter] duration-300 [&_*]:pointer-events-none'
                  )}
                >
            {/* Overview Tab */}
            <TabsContent value="overview" className="pt-6 px-2 sm:px-6 pb-6 mt-0">
              <ToolIntroductionTab toolSlug="ogham" />
              
              {!hasReport && (
                <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl mt-6">
                  <CardContent className="p-12 text-center">
                    <p className="text-slate-700 mb-4">Generate your mystical profile to unlock your Ogham reading.</p>
                    <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                      <Link href="/profile">Generate your mystical profile</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Report Tab */}
            <TabsContent value="report" className="pt-6 px-2 sm:px-6 pb-6 mt-0">
              {report ? (
                <OghamReportDisplay report={report} isLoading={isGeneratingReport} />
              ) : (
                <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl">
                  <CardContent className="p-12 text-center">
                    <p className="text-slate-700 mb-4">Generate your mystical profile to unlock your Ogham reading.</p>
                    <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                      <Link href="/profile">Generate your mystical profile</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
                </div>
              </div>
            )}
          </Tabs>
          </div>
        </div>
      </div>
    </div>
    </ToolReportGuard>
  )
}
