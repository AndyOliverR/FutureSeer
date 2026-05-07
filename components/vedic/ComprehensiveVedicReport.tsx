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
  onReportLoaded
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
        <h2 className="text-3xl font-bold gold-glow mb-4">🕉️ Comprehensive Vedic Astrology Report</h2>
        <p className="text-slate-200 leading-relaxed">
          Complete analysis of your Vedic birth chart (Jyotish)
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 shadow-lg rounded-3xl">
          <CardContent className="p-3 sm:p-6 text-center">
            <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="text-slate-700 text-sm mb-2">Ascendant</div>
            <div className="text-4xl font-bold text-yellow-800 mb-2">
              {ascendant}
            </div>
            <div className="text-xs text-slate-600">Rising Sign (Lagna)</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-lg rounded-3xl">
          <CardContent className="p-3 sm:p-6 text-center">
            <div className="w-16 h-16 bg-blue-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Moon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-slate-700 text-sm mb-2">Current Dasha</div>
            <div className="text-4xl font-bold text-blue-800 mb-2">
              {currentDasha}
            </div>
            <div className="text-xs text-slate-600">Planetary Period</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 shadow-lg rounded-3xl">
          <CardContent className="p-3 sm:p-6 text-center">
            <div className="w-16 h-16 bg-purple-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-slate-700 text-sm mb-2">Chart Type</div>
            <div className="text-4xl font-bold text-purple-800 mb-2">
              D1
            </div>
            <div className="text-xs text-slate-600">Birth Chart</div>
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
          className="text-center py-8 md:py-12"
        >
          <Card className="bg-[var(--m3-surface-container-high)] md:glass-card border border-[var(--m3-outline-variant)] md:border-white/10 max-w-md mx-auto text-[var(--m3-on-surface)] md:text-white">
            <CardContent className="p-8 text-white">
              <Loader2 className="w-12 h-12 text-amber-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-semibold text-white mb-2">Generating Your Comprehensive Report</h3>
              <p className="text-slate-200">
                FutureSeer is analyzing your Vedic chart with AI insights...
              </p>
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
                onClick={() => window.location.reload()} 
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
          <Card className="bg-[var(--m3-surface-container)] md:bg-gradient-to-br md:from-slate-50 md:to-gray-100 border border-[var(--m3-outline-variant)] md:border-2 md:border-slate-200 shadow-lg rounded-2xl md:rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[var(--m3-on-surface)] md:text-slate-800">
                <Sparkles className="w-6 h-6 text-amber-600" />
                Comprehensive Vedic Astrology Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full space-y-2">
                {/* Chart Overview */}
                <AccordionItem value="overview" className="border border-[var(--m3-outline-variant)] md:border-2 md:border-amber-200 rounded-xl md:rounded-lg bg-[var(--m3-surface-container-high)] md:bg-gradient-to-br md:from-amber-50 md:to-yellow-50 px-3 sm:px-4 shadow-sm">
                  <AccordionTrigger className="text-[var(--m3-on-surface)] md:text-slate-800 hover:text-amber-400 md:hover:text-amber-700 py-4 [&[data-state=open]]:text-amber-400 md:[&[data-state=open]]:text-amber-700 [&>svg]:text-slate-400 md:[&>svg]:text-slate-600">
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
                <AccordionItem value="ascendant" className="border border-[var(--m3-outline-variant)] md:border-2 md:border-yellow-200 rounded-xl md:rounded-lg bg-[var(--m3-surface-container-high)] md:bg-gradient-to-br md:from-yellow-50 md:to-amber-50 px-3 sm:px-4 shadow-sm">
                  <AccordionTrigger className="text-[var(--m3-on-surface)] md:text-slate-800 hover:text-amber-400 md:hover:text-yellow-700 py-4 [&[data-state=open]]:text-amber-400 md:[&[data-state=open]]:text-yellow-700 [&>svg]:text-slate-400 md:[&>svg]:text-slate-600">
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
                <AccordionItem value="planets" className="border border-[var(--m3-outline-variant)] md:border-2 md:border-blue-200 rounded-xl md:rounded-lg bg-[var(--m3-surface-container-high)] md:bg-gradient-to-br md:from-blue-50 md:to-cyan-50 px-3 sm:px-4 shadow-sm">
                  <AccordionTrigger className="text-[var(--m3-on-surface)] md:text-slate-800 hover:text-amber-400 md:hover:text-blue-700 py-4 [&[data-state=open]]:text-amber-400 md:[&[data-state=open]]:text-blue-700 [&>svg]:text-slate-400 md:[&>svg]:text-slate-600">
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
                <AccordionItem value="houses" className="border border-[var(--m3-outline-variant)] md:border-2 md:border-purple-200 rounded-xl md:rounded-lg bg-[var(--m3-surface-container-high)] md:bg-gradient-to-br md:from-purple-50 md:to-pink-50 px-3 sm:px-4 shadow-sm">
                  <AccordionTrigger className="text-[var(--m3-on-surface)] md:text-slate-800 hover:text-amber-400 md:hover:text-purple-700 py-4 [&[data-state=open]]:text-amber-400 md:[&[data-state=open]]:text-purple-700 [&>svg]:text-slate-400 md:[&>svg]:text-slate-600">
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
                <AccordionItem value="dasha" className="border border-[var(--m3-outline-variant)] md:border-2 md:border-green-200 rounded-xl md:rounded-lg bg-[var(--m3-surface-container-high)] md:bg-gradient-to-br md:from-green-50 md:to-emerald-50 px-3 sm:px-4 shadow-sm">
                  <AccordionTrigger className="text-[var(--m3-on-surface)] md:text-slate-800 hover:text-amber-400 md:hover:text-green-700 py-4 [&[data-state=open]]:text-amber-400 md:[&[data-state=open]]:text-green-700 [&>svg]:text-slate-400 md:[&>svg]:text-slate-600">
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
                <AccordionItem value="yogas" className="border border-[var(--m3-outline-variant)] md:border-2 md:border-orange-200 rounded-xl md:rounded-lg bg-[var(--m3-surface-container-high)] md:bg-gradient-to-br md:from-orange-50 md:to-amber-50 px-3 sm:px-4 shadow-sm">
                  <AccordionTrigger className="text-[var(--m3-on-surface)] md:text-slate-800 hover:text-amber-400 md:hover:text-orange-700 py-4 [&[data-state=open]]:text-amber-400 md:[&[data-state=open]]:text-orange-700 [&>svg]:text-slate-400 md:[&>svg]:text-slate-600">
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
                <AccordionItem value="nakshatra" className="border border-[var(--m3-outline-variant)] md:border-2 md:border-pink-200 rounded-xl md:rounded-lg bg-[var(--m3-surface-container-high)] md:bg-gradient-to-br md:from-pink-50 md:to-purple-50 px-3 sm:px-4 shadow-sm">
                  <AccordionTrigger className="text-[var(--m3-on-surface)] md:text-slate-800 hover:text-amber-400 md:hover:text-pink-700 py-4 [&[data-state=open]]:text-amber-400 md:[&[data-state=open]]:text-pink-700 [&>svg]:text-slate-400 md:[&>svg]:text-slate-600">
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
                <AccordionItem value="challenges-opportunities" className="border border-[var(--m3-outline-variant)] md:border-2 md:border-orange-200 rounded-xl md:rounded-lg bg-[var(--m3-surface-container-high)] md:bg-gradient-to-br md:from-orange-50 md:to-amber-50 px-3 sm:px-4 shadow-sm">
                  <AccordionTrigger className="text-[var(--m3-on-surface)] md:text-slate-800 hover:text-amber-400 md:hover:text-orange-700 py-4 [&[data-state=open]]:text-amber-400 md:[&[data-state=open]]:text-orange-700 [&>svg]:text-slate-400 md:[&>svg]:text-slate-600">
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
                <AccordionItem value="predictions" className="border border-[var(--m3-outline-variant)] md:border-2 md:border-cyan-200 rounded-xl md:rounded-lg bg-[var(--m3-surface-container-high)] md:bg-gradient-to-br md:from-cyan-50 md:to-blue-50 px-3 sm:px-4 shadow-sm">
                  <AccordionTrigger className="text-[var(--m3-on-surface)] md:text-slate-800 hover:text-amber-400 md:hover:text-cyan-700 py-4 [&[data-state=open]]:text-amber-400 md:[&[data-state=open]]:text-cyan-700 [&>svg]:text-slate-400 md:[&>svg]:text-slate-600">
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

