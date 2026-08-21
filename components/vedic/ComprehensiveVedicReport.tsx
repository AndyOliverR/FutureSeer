"use client"

import { useState, useEffect } from 'react'
import { devLog } from '@/lib/devLogger';
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { DevotionistStyleCard } from '@/components/western/DevotionistStyleCard'
import { 
  parsePlanetaryAnalysis, 
  extractKeyInsights,
  textToBulletPoints
} from '@/lib/utils/devotionistFormatter'
import { 
  Star,
  Loader2,
  RefreshCw,
  AlertCircle,
  Heart,
  Eye,
  Target,
  Sparkles,
  Zap,
  Calendar,
  TrendingUp,
  Activity,
  Home,
  Moon,
  Sun,
  Briefcase,
  Shield
} from 'lucide-react'

const REPORT_SECTION_ITEM =
  'rounded-xl border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container)] px-3 sm:px-4'
const REPORT_SECTION_TRIGGER =
  'py-4 text-[var(--m3-on-surface)] hover:text-amber-200 [&[data-state=open]]:text-amber-200 [&>svg]:text-[var(--m3-on-surface-variant)]'
const REPORT_SUMMARY_CARD =
  'rounded-2xl border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container)]'

interface ComprehensiveVedicReportProps {
  userId?: string
  vedicChartData?: any
  userProfile?: any
  cachedReport?: ComprehensiveAnalysis | null
  /** True while the mystical profile is loading from storage (returning user). When true, show "Loading..." not "Generating...". */
  isProfileLoading?: boolean
  isLoadingReport?: boolean
  /** When the report is loaded (from cache or fetch), call this so the parent can use it for Planets/Houses/Remedies tabs */
  onReportLoaded?: (report: ComprehensiveAnalysis) => void
  /** Optional retry handler from parent to retry without page reload. */
  onRetryLoad?: () => void
  /** Optional freshness label from parent (e.g., "Updated 3m ago"). */
  lastUpdatedLabel?: string | null
}

export interface ComprehensiveAnalysis {
  chartOverview: string
  ascendantAnalysis: string
  planetaryAnalysis: Array<{ planet: string; analysis: string }>
  houseAnalysis: Array<{ house: number; analysis: string }>
  dashaAnalysis: string
  yogasAnalysis: string
  nakshatraAnalysis: string
  predictiveInsights: {
    currentPeriod: string
    nextThreeMonths: string
    currentYear: string
    nextYear: string
    longerTermCycles: string
  }
  challengesAndOpportunities: {
    challenges: string[]
    opportunities: string[]
  }
}

export default function ComprehensiveVedicReport({ 
  userId,
  vedicChartData,
  userProfile,
  cachedReport,
  isProfileLoading = false,
  isLoadingReport = false,
  onReportLoaded,
  onRetryLoad,
  lastUpdatedLabel = null
}: ComprehensiveVedicReportProps) {
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState<ComprehensiveAnalysis | null>(
    cachedReport || null
  )
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [showGeneratingMessage, setShowGeneratingMessage] = useState(false)

  // Update local state when cachedReport prop changes; notify parent so Planets/Houses/Remedies can show the report
  useEffect(() => {
    if (cachedReport) {
      setComprehensiveAnalysis(cachedReport)
      onReportLoaded?.(cachedReport)
    }
  }, [cachedReport, onReportLoaded])

  // Only show "Generating..." when we're actually fetching, not while profile is loading (returning user has report in profile)
  useEffect(() => {
    const actuallyGenerating = !isProfileLoading && (isLoadingReport || isLoadingAnalysis) && !comprehensiveAnalysis
    if (!actuallyGenerating) {
      setShowGeneratingMessage(false)
      return
    }
    const t = setTimeout(() => setShowGeneratingMessage(true), 400)
    return () => clearTimeout(t)
  }, [isProfileLoading, isLoadingReport, isLoadingAnalysis, comprehensiveAnalysis])

  // Only fetch if we don't have cached data and report isn't being loaded by parent; don't fetch while profile is loading
  useEffect(() => {
    if (isProfileLoading || isLoadingReport || cachedReport || comprehensiveAnalysis) {
      return
    }

    if (!userId || !userProfile?.birthDate || !userProfile?.birthPlace) {
      return
    }

    const birthTime = userProfile.birthTime || '12:00:00'
    const fetchComprehensiveAnalysis = async () => {
      setIsLoadingAnalysis(true)
      setAnalysisError(null)

      try {
        const response = await fetch('/api/vedic/comprehensive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            vedicChartData,
            userProfile: {
              birthDate: userProfile.birthDate,
              birthTime,
              birthPlace: userProfile.birthPlace,
              fullName: userProfile.fullName || userProfile.displayName,
              displayName: userProfile.displayName
            }
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Failed to generate comprehensive analysis (${response.status})`)
        }

        const result = await response.json()
        const report = result.data?.comprehensiveAnalysis ?? result.comprehensiveAnalysis ?? result.data
        if (result.success && report && typeof report === 'object') {
          setComprehensiveAnalysis(report)
          onReportLoaded?.(report)
        } else {
          throw new Error(result.error || 'Failed to generate analysis. Please try again.')
        }
      } catch (error: any) {
        devLog.error('Error fetching comprehensive analysis:', error, 'ComprehensiveVedicReport')
        const errorMessage = error?.message || 'Failed to generate comprehensive analysis'
        setAnalysisError(errorMessage)
      } finally {
        setIsLoadingAnalysis(false)
      }
    }

    fetchComprehensiveAnalysis()
  }, [userId, vedicChartData, cachedReport, isLoadingReport, comprehensiveAnalysis, userProfile])

  if (!userProfile?.birthDate || !userProfile?.birthTime || !userProfile?.birthPlace) {
    return (
      <div className="text-center py-12">
        <Card className="glass-card border-white/10 max-w-md mx-auto text-white">
          <CardContent className="p-8 text-white">
            <Star className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Birth Data Needed</h3>
            <p className="text-slate-200">
              Please ensure your birth date, time, and place are complete to view the comprehensive report.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const ascendant = vedicChartData?.ascendant?.signName || vedicChartData?.ascendant?.sign || 'Unknown'
  const currentDasha = vedicChartData?.currentDasha?.planet || vedicChartData?.dasha?.[0]?.planet || 'Unknown'

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="mb-4 text-3xl font-medium tracking-wide text-amber-200">Comprehensive Vedic Astrology Report</h2>
        <p className="text-slate-200 leading-relaxed">
          Complete analysis of your Vedic birth chart (Jyotish)
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className={REPORT_SUMMARY_CARD}>
          <CardContent className="p-3 text-center sm:p-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15">
              <Star className="h-8 w-8 text-amber-300" />
            </div>
            <div className="mb-2 text-sm text-[var(--m3-on-surface-variant)]">Ascendant</div>
            <div className="mb-2 text-4xl font-medium text-amber-200">
              {ascendant}
            </div>
            <div className="text-xs text-[var(--m3-on-surface-variant)]">Rising Sign (Lagna)</div>
          </CardContent>
        </Card>

        <Card className={REPORT_SUMMARY_CARD}>
          <CardContent className="p-3 text-center sm:p-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15">
              <Moon className="h-8 w-8 text-amber-300" />
            </div>
            <div className="mb-2 text-sm text-[var(--m3-on-surface-variant)]">Current Dasha</div>
            <div className="mb-2 text-4xl font-medium text-amber-200">
              {currentDasha}
            </div>
            <div className="text-xs text-[var(--m3-on-surface-variant)]">Planetary Period</div>
          </CardContent>
        </Card>

        <Card className={REPORT_SUMMARY_CARD}>
          <CardContent className="p-3 text-center sm:p-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15">
              <Sparkles className="h-8 w-8 text-amber-300" />
            </div>
            <div className="mb-2 text-sm text-[var(--m3-on-surface-variant)]">Chart Type</div>
            <div className="mb-2 text-4xl font-medium text-amber-200">
              D1
            </div>
            <div className="text-xs text-[var(--m3-on-surface-variant)]">Birth Chart</div>
          </CardContent>
        </Card>
      </div>

      {/* Comprehensive Analysis Section - show "Loading..." while profile loads (returning user); "Generating" only when actually fetching */}
      {isProfileLoading && !cachedReport && !comprehensiveAnalysis ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-center py-8 md:py-12"
        >
          <Card className="bg-[var(--m3-surface-container-high)] md:glass-card border border-[var(--m3-outline-variant)] md:border-white/10 max-w-md mx-auto text-[var(--m3-on-surface)] md:text-white">
            <CardContent className="p-8 text-white">
              <Loader2 className="w-12 h-12 text-amber-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-semibold text-white mb-2">Loading Your Report</h3>
              <p className="text-slate-200">
                Loading your saved Vedic report…
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : showGeneratingMessage ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="py-5 md:py-8"
        >
          <Card className="bg-[var(--m3-surface-container-high)] md:glass-card border border-[var(--m3-outline-variant)] md:border-white/10 max-w-2xl mx-auto text-[var(--m3-on-surface)] md:text-white">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-start gap-3">
                <Loader2 className="w-5 h-5 text-amber-400 animate-spin mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-white mb-1">Building deeper Vedic insights in background</h3>
                  <p className="text-slate-200 text-xs md:text-sm">
                    Your report shell is ready. You can continue exploring other tabs now while detailed interpretations load.
                  </p>
                  <div className="mt-2 flex items-center gap-1.5" aria-hidden>
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-300 animate-pulse" />
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-300 animate-pulse [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-300 animate-pulse [animation-delay:300ms]" />
                  </div>
                  {lastUpdatedLabel ? (
                    <p className="text-[11px] md:text-xs text-slate-300 mt-2">{lastUpdatedLabel}</p>
                  ) : null}
                  {onRetryLoad ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={onRetryLoad}
                      className="mt-2 h-auto p-0 text-xs text-amber-300 hover:text-amber-200 hover:bg-transparent"
                    >
                      Retry now
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : analysisError ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-8"
        >
          <Card className="glass-card border-red-400/20 max-w-md mx-auto text-white">
            <CardContent className="p-8 text-white">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Error Generating Report</h3>
              <p className="text-slate-200 mb-4">{analysisError}</p>
              <Button
                onClick={() => {
                  setAnalysisError(null)
                  onRetryLoad?.()
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : comprehensiveAnalysis ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="rounded-2xl border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-200">
                <Sparkles className="w-6 h-6 text-amber-600" />
                Comprehensive Vedic Astrology Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full space-y-2">
                {/* Chart Overview */}
                <AccordionItem value="overview" className={REPORT_SECTION_ITEM}>
                  <AccordionTrigger className={REPORT_SECTION_TRIGGER}>
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-amber-600" />
                      <span className="text-left font-semibold">Chart Overview</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <DevotionistStyleCard
                      icon={<Star className="w-5 h-5" />}
                      title="Your Vedic Chart Profile"
                      summary={comprehensiveAnalysis.chartOverview ?? ''}
                      colorScheme="amber"
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Ascendant Analysis */}
                <AccordionItem value="ascendant" className={REPORT_SECTION_ITEM}>
                  <AccordionTrigger className={REPORT_SECTION_TRIGGER}>
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-yellow-600" />
                      <span className="text-left font-semibold">Ascendant Analysis</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <DevotionistStyleCard
                      icon={<Target className="w-5 h-5" />}
                      title={`${ascendant} Ascendant (Lagna)`}
                      summary={comprehensiveAnalysis.ascendantAnalysis ?? ''}
                      items={textToBulletPoints(comprehensiveAnalysis.ascendantAnalysis ?? '', 5).map(item => ({
                        ...item,
                        type: 'neutral' as const
                      }))}
                      colorScheme="amber"
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Planetary Analysis */}
                <AccordionItem value="planets" className={REPORT_SECTION_ITEM}>
                  <AccordionTrigger className={REPORT_SECTION_TRIGGER}>
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-blue-600" />
                      <span className="text-left font-semibold">Planetary Analysis</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-3">
                    {(Array.isArray(comprehensiveAnalysis.planetaryAnalysis) ? comprehensiveAnalysis.planetaryAnalysis : []).map((item, index) => (
                      <DevotionistStyleCard
                        key={index}
                        icon={<Star className="w-5 h-5" />}
                        title={item.planet}
                        summary={item.analysis}
                        items={textToBulletPoints(item.analysis, 3).map(bullet => ({
                          ...bullet,
                          type: 'neutral' as const
                        }))}
                        colorScheme={index % 2 === 0 ? 'blue' : 'cyan'}
                      />
                    ))}
                  </AccordionContent>
                </AccordionItem>

                {/* House Analysis */}
                <AccordionItem value="houses" className={REPORT_SECTION_ITEM}>
                  <AccordionTrigger className={REPORT_SECTION_TRIGGER}>
                    <div className="flex items-center gap-3">
                      <Home className="w-5 h-5 text-purple-600" />
                      <span className="text-left font-semibold">House Analysis</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-3">
                    {(Array.isArray(comprehensiveAnalysis.houseAnalysis) ? comprehensiveAnalysis.houseAnalysis : []).map((item, index) => (
                      <DevotionistStyleCard
                        key={index}
                        icon={<Home className="w-5 h-5" />}
                        title={`${item.house}${item.house === 1 ? 'st' : item.house === 2 ? 'nd' : item.house === 3 ? 'rd' : 'th'} House`}
                        summary={item.analysis}
                        items={textToBulletPoints(item.analysis, 3).map(bullet => ({
                          ...bullet,
                          type: 'neutral' as const
                        }))}
                        colorScheme={index % 2 === 0 ? 'purple' : 'pink'}
                      />
                    ))}
                  </AccordionContent>
                </AccordionItem>

                {/* Dasha Analysis */}
                <AccordionItem value="dasha" className={REPORT_SECTION_ITEM}>
                  <AccordionTrigger className={REPORT_SECTION_TRIGGER}>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <span className="text-left font-semibold">Dasha Analysis</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <DevotionistStyleCard
                      icon={<Calendar className="w-5 h-5" />}
                      title={`Current ${currentDasha} Dasha Period`}
                      summary={comprehensiveAnalysis.dashaAnalysis ?? ''}
                      items={textToBulletPoints(comprehensiveAnalysis.dashaAnalysis ?? '', 5).map(item => ({
                        ...item,
                        type: 'neutral' as const
                      }))}
                      colorScheme="green"
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Yogas Analysis */}
                <AccordionItem value="yogas" className={REPORT_SECTION_ITEM}>
                  <AccordionTrigger className={REPORT_SECTION_TRIGGER}>
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-orange-600" />
                      <span className="text-left font-semibold">Yogas Analysis</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <DevotionistStyleCard
                      icon={<Sparkles className="w-5 h-5" />}
                      title="Planetary Combinations (Yogas)"
                      summary={comprehensiveAnalysis.yogasAnalysis ?? ''}
                      items={textToBulletPoints(comprehensiveAnalysis.yogasAnalysis ?? '', 5).map(item => ({
                        ...item,
                        type: 'neutral' as const
                      }))}
                      colorScheme="orange"
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Nakshatra Analysis */}
                <AccordionItem value="nakshatra" className={REPORT_SECTION_ITEM}>
                  <AccordionTrigger className={REPORT_SECTION_TRIGGER}>
                    <div className="flex items-center gap-3">
                      <Moon className="w-5 h-5 text-pink-600" />
                      <span className="text-left font-semibold">Nakshatra Analysis</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <DevotionistStyleCard
                      icon={<Moon className="w-5 h-5" />}
                      title="Birth Star (Nakshatra)"
                      summary={comprehensiveAnalysis.nakshatraAnalysis ?? ''}
                      items={textToBulletPoints(comprehensiveAnalysis.nakshatraAnalysis ?? '', 5).map(item => ({
                        ...item,
                        type: 'neutral' as const
                      }))}
                      colorScheme="pink"
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Challenges & Opportunities */}
                <AccordionItem value="challenges-opportunities" className={REPORT_SECTION_ITEM}>
                  <AccordionTrigger className={REPORT_SECTION_TRIGGER}>
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                      <span className="text-left font-semibold">Challenges & Opportunities</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-3">
                    {(Array.isArray(comprehensiveAnalysis.challengesAndOpportunities?.challenges) ? comprehensiveAnalysis.challengesAndOpportunities.challenges : []).length > 0 && (
                      <DevotionistStyleCard
                        icon={<AlertCircle className="w-5 h-5" />}
                        title="Challenges"
                        items={(comprehensiveAnalysis.challengesAndOpportunities?.challenges ?? []).map((challenge: string) => ({
                          text: challenge,
                          type: 'challenge' as const
                        }))}
                        colorScheme="orange"
                      />
                    )}
                    {(Array.isArray(comprehensiveAnalysis.challengesAndOpportunities?.opportunities) ? comprehensiveAnalysis.challengesAndOpportunities.opportunities : []).length > 0 && (
                      <DevotionistStyleCard
                        icon={<Zap className="w-5 h-5" />}
                        title="Opportunities"
                        items={(comprehensiveAnalysis.challengesAndOpportunities?.opportunities ?? []).map((opportunity: string) => ({
                          text: opportunity,
                          type: 'positive' as const
                        }))}
                        colorScheme="green"
                      />
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* Predictive Insights */}
                <AccordionItem value="predictions" className={REPORT_SECTION_ITEM}>
                  <AccordionTrigger className={REPORT_SECTION_TRIGGER}>
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-cyan-600" />
                      <span className="text-left font-semibold">Predictive Insights</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-3">
                    <DevotionistStyleCard
                      icon={<Zap className="w-5 h-5" />}
                      title="Current Period"
                      summary={comprehensiveAnalysis.predictiveInsights?.currentPeriod ?? ''}
                      colorScheme="cyan"
                    />
                    <DevotionistStyleCard
                      icon={<Calendar className="w-5 h-5" />}
                      title="Next Three Months"
                      summary={comprehensiveAnalysis.predictiveInsights?.nextThreeMonths ?? ''}
                      colorScheme="blue"
                    />
                    <DevotionistStyleCard
                      icon={<Calendar className="w-5 h-5" />}
                      title="This Year"
                      summary={comprehensiveAnalysis.predictiveInsights?.currentYear ?? ''}
                      colorScheme="purple"
                    />
                    <DevotionistStyleCard
                      icon={<TrendingUp className="w-5 h-5" />}
                      title="Next Year Preview"
                      summary={comprehensiveAnalysis.predictiveInsights?.nextYear ?? ''}
                      colorScheme="amber"
                    />
                    <DevotionistStyleCard
                      icon={<Star className="w-5 h-5" />}
                      title="Longer-Term Cycles"
                      summary={comprehensiveAnalysis.predictiveInsights?.longerTermCycles ?? ''}
                      colorScheme="pink"
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>
      ) : null}
    </div>
  )
}

