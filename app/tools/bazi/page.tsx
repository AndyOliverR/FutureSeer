"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useToolReport } from "@/hooks/useComprehensiveMysticalProfile"
import { ToolReportGuard } from '@/components/ToolReportGuard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToolIntroductionTab } from '@/components/ToolIntroductionTab'
import { CompatibilityTab } from '@/components/compatibility/CompatibilityTab'
import { BaZiCoachInterface } from '@/components/BaZiCoachInterface'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BaziDashboardSection } from '@/components/bazi/BaziDashboardSection'
import { m3PageTransition, m3BouncySpring, m3SmoothEase, m3Elevation } from '@/lib/material3Animations'

// Enhanced BaZi Components
import { BaziDashboardHero } from '@/components/bazi/BaziDashboardHero'
import { BaziFourPillarsChart } from '@/components/BaziFourPillarsChart'
import { BaziElementBalance } from '@/components/BaziElementBalance'
import { BaziLuckCycles } from '@/components/BaziLuckCycles'
import { PersonalitySection } from '@/components/bazi/PersonalitySection'
import { CareerWealthSection } from '@/components/bazi/CareerWealthSection'
import { RelationshipsHealthSection } from '@/components/bazi/RelationshipsHealthSection'
import { FavorableItemsSection } from '@/components/bazi/FavorableItemsSection'
import { RecommendationsSection } from '@/components/bazi/RecommendationsSection'

import { 
  AlertTriangle,
  Info,
  Sparkles,
  MessageCircle,
  Calendar,
  Activity,
  User,
  Briefcase,
  Heart,
  Zap,
  Target,
  Eye,
  Loader2
} from 'lucide-react'
import type { BaziReading } from '@/lib/baziIntelligence'

/**
 * Comprehensive BaZi Report Interface (from pipeline)
 */
interface ComprehensiveBaziReport {
  chartOverview?: string
  lifePathInsights?: string
  elementHarmonization?: string
  timingAndOpportunities?: string
}

function normalizeBaziPipelineReport(report: unknown): { reading: BaziReading | null; comprehensive: ComprehensiveBaziReport | null } {
  if (!report || typeof report !== 'object') return { reading: null, comprehensive: null }
  const r = report as Record<string, unknown>
  if (r.placeholder === true) return { reading: null, comprehensive: null }
  const data = (r.data ?? r) as Record<string, unknown>
  const rawReading = (r.reading ?? data?.reading) as unknown
  const hasChart = rawReading && typeof rawReading === 'object' && !!(rawReading as Record<string, unknown>).chart
  const reading: BaziReading | null = hasChart ? (rawReading as BaziReading) : null
  const co = (r.chartOverview ?? data?.chartOverview) as string | undefined
  const lp = (r.lifePathInsights ?? data?.lifePathInsights) as string | undefined
  const eh = (r.elementHarmonization ?? data?.elementHarmonization) as string | undefined
  const to = (r.timingAndOpportunities ?? data?.timingAndOpportunities) as string | undefined
  const comprehensive: ComprehensiveBaziReport | null =
    co || lp || eh || to ? { chartOverview: co, lifePathInsights: lp, elementHarmonization: eh, timingAndOpportunities: to } : null
  return { reading, comprehensive }
}

export default function BaZiPage() {
  const { userProfile } = useAuth()
  const { report: pipelineReport, loading: isLoading, error, hasReport } = useToolReport('bazi')
  const [activeTab, setActiveTab] = useState<'introduction' | 'overview' | 'compatibility' | 'ask-seer'>('introduction')

  const { reading, comprehensive: comprehensiveBaziReport } = useMemo(
    () => normalizeBaziPipelineReport(pipelineReport),
    [pipelineReport]
  )
  const hasData = hasReport && (reading || comprehensiveBaziReport)

  const hasCompleteProfile = useMemo(() => {
    return !!(userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace)
  }, [userProfile?.birthDate, userProfile?.birthTime, userProfile?.birthPlace])

  const currentAge = useMemo(() => {
    if (!userProfile?.birthDate) return 0
    return new Date().getFullYear() - new Date(userProfile.birthDate).getFullYear()
  }, [userProfile?.birthDate])

  return (
    <ToolReportGuard loading={isLoading} error={error ?? null} toolLabel="BaZi reading">
    <div className="relative min-h-screen">
      {/* Fixed starfield background */}
      <div className="fixed inset-0 -z-10 starfield-ultra-sharp pointer-events-none" />
      <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
        {/* Header */}
        <motion.div
          variants={m3PageTransition}
          initial="initial"
          animate="animate"
          className="text-center mb-8 pt-4"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-5xl text-amber-400">🏮</span>
            <h1 className="text-4xl font-bold gold-glow">BaZi</h1>
          </div>
          <p className="text-white/70 text-lg">Four Pillars of Destiny - Ancient Chinese Life Path Analysis</p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0">
              ✨ Premium
            </Badge>
            <Badge variant="outline" className="border-amber-500/50 text-amber-300">
              Chinese Astrology
            </Badge>
          </div>
        </motion.div>

        {/* Profile Completion Alert */}
        {!hasCompleteProfile && (
          <motion.div
            variants={m3PageTransition}
            initial="initial"
            animate="animate"
            className="mb-6"
            role="alert"
            aria-live="polite"
          >
            <Alert className={`bg-slate-800/50 border-amber-500/50 ${m3Elevation.level2} rounded-2xl`}>
              <Info className="h-4 w-4 text-amber-400" aria-hidden="true" />
              <AlertDescription className="text-white">
                Complete your birth information (date, time, and place) in your{' '}
                <Link 
                  href="/profile" 
                  className="text-amber-400 hover:text-amber-300 underline focus-visible:outline-2 focus-visible:outline-amber-400 focus-visible:outline-offset-2 rounded"
                >
                  profile
                </Link>
                {' '}to generate your BaZi reading.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Main Content */}
        <motion.div
          variants={m3PageTransition}
          initial="initial"
          animate="animate"
          transition={{ ...m3SmoothEase, delay: 0.2 }}
        >
          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as typeof activeTab)} 
            className="w-full"
          >
            <TabsList 
              className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30"
              role="tablist"
              aria-label="BaZi tool navigation tabs"
            >
              <TabsTrigger 
                value="introduction"
                className="shrink-0 devotionist-tab-trigger rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 border border-transparent data-[state=inactive]:border-slate-600/50 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 transition-all"
                aria-label="Introduction tab"
              >
                Introduction
              </TabsTrigger>
              <TabsTrigger 
                value="overview"
                className="shrink-0 devotionist-tab-trigger rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 border border-transparent data-[state=inactive]:border-slate-600/50 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 transition-all"
                aria-label="Overview tab"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="compatibility"
                className="shrink-0 devotionist-tab-trigger rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 border border-transparent data-[state=inactive]:border-slate-600/50 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 transition-all"
                aria-label="Compare tab"
              >
                Compare
              </TabsTrigger>
              <TabsTrigger 
                value="ask-seer"
                className="shrink-0 devotionist-tab-trigger rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 border border-transparent data-[state=inactive]:border-slate-600/50 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 transition-all flex items-center gap-2"
                aria-label="Ask the Seer tab"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                Ask the Seer
              </TabsTrigger>
            </TabsList>

            {/* Introduction Tab */}
            <TabsContent value="introduction" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
              <ToolIntroductionTab toolSlug="bazi" />
            </TabsContent>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
              {isLoading ? (
                <div className="space-y-6">
                  <Skeleton className="h-64 w-full bg-slate-800/50 rounded-3xl" />
                  <Skeleton className="h-48 w-full bg-slate-800/50 rounded-3xl" />
                  <Skeleton className="h-48 w-full bg-slate-800/50 rounded-3xl" />
                </div>
              ) : error ? (
                <Alert 
                  className={`bg-slate-800/50 border-red-500/50 rounded-2xl ${m3Elevation.level2}`}
                  role="alert"
                  aria-live="assertive"
                >
                  <AlertTriangle className="h-4 w-4 text-red-400" aria-hidden="true" />
                  <AlertDescription className="text-white">
                    <strong>Error loading BaZi reading:</strong> {error}
                    <br />
                    <span className="text-sm text-slate-400 mt-2 block">
                      Please ensure your birth information (date, time, and place) is complete in your profile.
                    </span>
                  </AlertDescription>
                </Alert>
              ) : !reading ? (
                <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg rounded-3xl">
                  <CardContent className="p-12 text-center">
                    <div className="text-6xl mb-6">🏮</div>
                    <h3 className="text-3xl font-serif font-bold text-amber-900 mb-4">BaZi Reading</h3>
                    <p className="text-slate-700 mb-6 max-w-md mx-auto">
                      Generate your mystical profile to get your Four Pillars of Destiny analysis.
                    </p>
                    <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white">
                      <Link href="/profile">
                        <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
                        Generate your mystical profile
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Hero Section */}
                  {reading && (
                    <BaziDashboardHero 
                      reading={reading}
                      userProfile={userProfile}
                      currentAge={currentAge}
                    />
                  )}

                  {/* Chart Overview Section */}
                  {comprehensiveBaziReport?.chartOverview && (
                    <BaziDashboardSection
                      title="Chart Overview"
                      icon={<Eye className="w-6 h-6" />}
                      defaultExpanded={true}
                      storageKey="bazi-chart-overview"
                    >
                      <div className="prose prose-slate max-w-none">
                        <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                          {comprehensiveBaziReport.chartOverview}
                        </p>
                      </div>
                    </BaziDashboardSection>
                  )}

                  {/* Four Pillars Chart */}
                  <BaziDashboardSection
                    title="Four Pillars of Destiny"
                    icon={<Calendar className="w-6 h-6" />}
                    badge="Your Core Blueprint"
                    defaultExpanded={true}
                    storageKey="bazi-four-pillars"
                  >
                    <BaziFourPillarsChart chart={reading.chart} />
                  </BaziDashboardSection>

                  {/* Element Balance */}
                  <BaziDashboardSection
                    title="Element Balance"
                    icon={<Activity className="w-6 h-6" />}
                    badge="Wu Xing Analysis"
                    defaultExpanded={true}
                    storageKey="bazi-element-balance"
                  >
                    <BaziElementBalance 
                      elements={reading.elements}
                      dayMasterElement={reading.dayMaster.element}
                    />
                  </BaziDashboardSection>

                  {/* Element Harmonization */}
                  {comprehensiveBaziReport?.elementHarmonization && (
                    <BaziDashboardSection
                      title="Element Harmonization"
                      icon={<Sparkles className="w-6 h-6" />}
                      badge="Balance Guidance"
                      defaultExpanded={false}
                      storageKey="bazi-element-harmony"
                    >
                      <div className="prose prose-slate max-w-none">
                        <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                          {comprehensiveBaziReport.elementHarmonization}
                        </p>
                      </div>
                    </BaziDashboardSection>
                  )}

                  {/* Personality Analysis */}
                  <BaziDashboardSection
                    title="Personality & Character"
                    icon={<User className="w-6 h-6" />}
                    badge="Core Traits"
                    defaultExpanded={false}
                    storageKey="bazi-personality"
                  >
                    <PersonalitySection personality={reading.personality} />
                  </BaziDashboardSection>

                  {/* Career & Wealth */}
                  <BaziDashboardSection
                    title="Career & Wealth"
                    icon={<Briefcase className="w-6 h-6" />}
                    badge="Professional Path"
                    defaultExpanded={false}
                    storageKey="bazi-career-wealth"
                  >
                    <CareerWealthSection 
                      career={reading.career}
                      wealth={reading.wealth}
                    />
                  </BaziDashboardSection>

                  {/* Relationships & Health */}
                  <BaziDashboardSection
                    title="Relationships & Health"
                    icon={<Heart className="w-6 h-6" />}
                    badge="Wellness & Connections"
                    defaultExpanded={false}
                    storageKey="bazi-relationships-health"
                  >
                    <RelationshipsHealthSection 
                      relationships={reading.relationships}
                      health={reading.health}
                    />
                  </BaziDashboardSection>

                  {/* Luck Cycles */}
                  <BaziDashboardSection
                    title="Luck Cycles (Da Yun)"
                    icon={<Zap className="w-6 h-6" />}
                    badge="10-Year Periods"
                    defaultExpanded={false}
                    storageKey="bazi-luck-cycles"
                  >
                    <BaziLuckCycles 
                      cycles={reading.luckCycles}
                      currentAge={currentAge}
                    />
                  </BaziDashboardSection>

                  {/* Timing & Opportunities */}
                  {comprehensiveBaziReport?.timingAndOpportunities && (
                    <BaziDashboardSection
                      title="Timing & Opportunities"
                      icon={<Target className="w-6 h-6" />}
                      badge="Strategic Guidance"
                      defaultExpanded={false}
                      storageKey="bazi-timing"
                    >
                      <div className="prose prose-slate max-w-none">
                        <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                          {comprehensiveBaziReport.timingAndOpportunities}
                        </p>
                      </div>
                    </BaziDashboardSection>
                  )}

                  {/* Favorable Items */}
                  <BaziDashboardSection
                    title="Favorable Items"
                    icon={<Sparkles className="w-6 h-6" />}
                    badge="Elements, Colors & Directions"
                    defaultExpanded={false}
                    storageKey="bazi-favorable"
                  >
                    <FavorableItemsSection favorable={reading.favorable} />
                  </BaziDashboardSection>

                  {/* Recommendations & Remedies */}
                  <BaziDashboardSection
                    title="Recommendations & Remedies"
                    icon={<Target className="w-6 h-6" />}
                    badge="Practical Guidance"
                    defaultExpanded={false}
                    storageKey="bazi-recommendations"
                  >
                    <RecommendationsSection
                      recommendations={reading.recommendations}
                      remedies={reading.remedies}
                    />
                  </BaziDashboardSection>

                  {/* Life Path Insights */}
                  {comprehensiveBaziReport?.lifePathInsights && (
                    <BaziDashboardSection
                      title="Life Path Insights"
                      icon={<Eye className="w-6 h-6" />}
                      badge="Your Journey"
                      defaultExpanded={false}
                      storageKey="bazi-life-path"
                    >
                      <div className="prose prose-slate max-w-none">
                        <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                          {comprehensiveBaziReport.lifePathInsights}
                        </p>
                      </div>
                    </BaziDashboardSection>
                  )}

                </div>
              )}
            </TabsContent>

            {/* Compare Tab */}
            <TabsContent value="compatibility" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
              <CompatibilityTab toolSlug="bazi" />
            </TabsContent>

            {/* Ask the Seer Tab */}
            <TabsContent value="ask-seer" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
              {reading ? (
                <BaZiCoachInterface reading={reading} />
              ) : (
                <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg rounded-3xl">
                  <CardContent className="p-12 text-center">
                    <MessageCircle className="w-16 h-16 text-amber-600 mx-auto mb-4" aria-hidden="true" />
                    <h3 className="text-xl font-serif text-amber-900 mb-2">BaZi Reading Required</h3>
                    <p className="text-slate-700 mb-6">
                      Generate your mystical profile to get personalized guidance from Ask the Seer.
                    </p>
                    <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white">
                      <Link href="/profile">
                        <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
                        Generate your mystical profile
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
          </div>
        </motion.div>
      </div>
    </div>
    </ToolReportGuard>
  )
}
