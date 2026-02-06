"use client"

import { useState, useEffect, useMemo } from 'react'
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
  Hash,
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
  Calculator
} from 'lucide-react'

interface ComprehensiveNumerologyReportProps {
  userId?: string
  numerologyData?: any
  userProfile?: any
  cachedReport?: ComprehensiveAnalysis | null
  isLoadingReport?: boolean
}

export interface ComprehensiveAnalysis {
  profileOverview: string
  coreNumbersAnalysis: Array<{ number: string; value: number; analysis: string }>
  lifePathAnalysis: string
  expressionAnalysis: string
  soulUrgeAnalysis: string
  personalityAnalysis: string
  destinyAnalysis: string
  personalYearAnalysis: string
  challengesAndOpportunities: {
    challenges: string[]
    opportunities: string[]
  }
  predictiveInsights: {
    todaysQuickWin: string
    currentWeek: string
    currentMonth: string
    currentYear: string
    nextYearSneakPeek: string
    longerTermCycles: string
  }
}

export default function ComprehensiveNumerologyReport({ 
  userId,
  numerologyData,
  userProfile,
  cachedReport,
  isLoadingReport = false
}: ComprehensiveNumerologyReportProps) {
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState<ComprehensiveAnalysis | null>(
    cachedReport || null
  )
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  // Update local state when cachedReport prop changes
  useEffect(() => {
    if (cachedReport) {
      setComprehensiveAnalysis(cachedReport)
    }
  }, [cachedReport])

  // Only fetch if we don't have cached data and report isn't being loaded by parent
  useEffect(() => {
    if (isLoadingReport || cachedReport || comprehensiveAnalysis) {
      return
    }

    if (!userId || !numerologyData) {
      return
    }

    const fetchComprehensiveAnalysis = async () => {
      setIsLoadingAnalysis(true)
      setAnalysisError(null)

      try {
        const response = await fetch('/api/numerology/comprehensive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            numerologyData: {
              lifePathNumber: numerologyData.life_path_number || numerologyData.life_path,
              expressionNumber: numerologyData.expression_number,
              soulUrgeNumber: numerologyData.soul_number || numerologyData.soul_urge,
              personalityNumber: numerologyData.personality_number,
              destinyNumber: numerologyData.destiny_number,
              birthdayNumber: numerologyData.birthday_number,
              maturityNumber: numerologyData.maturity_number,
              breakdown: numerologyData.breakdown
            },
            userProfile: userProfile
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Failed to generate comprehensive analysis (${response.status})`)
        }

        const result = await response.json()
        if (result.success && result.data?.comprehensiveAnalysis) {
          setComprehensiveAnalysis(result.data.comprehensiveAnalysis)
        } else {
          throw new Error(result.error || 'Failed to generate analysis. Please try again.')
        }
      } catch (error: any) {
        console.error('Error fetching comprehensive analysis:', error)
        const errorMessage = error?.message || 'Failed to generate comprehensive analysis'
        setAnalysisError(errorMessage)
      } finally {
        setIsLoadingAnalysis(false)
      }
    }

    fetchComprehensiveAnalysis()
  }, [userId, numerologyData, cachedReport, isLoadingReport, comprehensiveAnalysis, userProfile])

  if (!numerologyData) {
    return (
      <div className="text-center py-12">
        <Card className="glass-card border-white/10 max-w-md mx-auto text-white">
          <CardContent className="p-8 text-white">
            <Calculator className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Numerology Data Needed</h3>
            <p className="text-slate-200">
              Please ensure your numerology profile is loaded to view the comprehensive report.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const lifePath = numerologyData.life_path_number || numerologyData.life_path || 0
  const expression = numerologyData.expression_number || numerologyData.destiny_number || 0
  const soulUrge = numerologyData.soul_number || numerologyData.soul_urge || 0
  const personality = numerologyData.personality_number || 0
  const destiny = numerologyData.destiny_number || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold gold-glow mb-4">🔢 Comprehensive Numerology Report</h2>
        <p className="text-slate-200 leading-relaxed">
          Complete analysis of your Chaldean Numerology profile
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 shadow-lg rounded-3xl">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="text-slate-700 text-sm mb-2">Life Path</div>
            <div className="text-4xl font-bold text-yellow-800 mb-2">
              {lifePath}{lifePath === 11 || lifePath === 22 || lifePath === 33 ? '*' : ''}
            </div>
            <div className="text-xs text-slate-600">Life's Purpose</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-lg rounded-3xl">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Hash className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-slate-700 text-sm mb-2">Expression</div>
            <div className="text-4xl font-bold text-blue-800 mb-2">
              {expression}{expression === 11 || expression === 22 || expression === 33 ? '*' : ''}
            </div>
            <div className="text-xs text-slate-600">Natural Talents</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 shadow-lg rounded-3xl">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-purple-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-slate-700 text-sm mb-2">Soul Urge</div>
            <div className="text-4xl font-bold text-purple-800 mb-2">
              {soulUrge}{soulUrge === 11 || soulUrge === 22 || soulUrge === 33 ? '*' : ''}
            </div>
            <div className="text-xs text-slate-600">Inner Desires</div>
          </CardContent>
        </Card>
      </div>

      {/* Comprehensive Analysis Section */}
      {(isLoadingAnalysis || isLoadingReport) && !comprehensiveAnalysis ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-12"
        >
          <Card className="glass-card border-white/10 max-w-md mx-auto text-white">
            <CardContent className="p-8 text-white">
              <Loader2 className="w-12 h-12 text-amber-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-semibold text-white mb-2">Generating Your Comprehensive Report</h3>
              <p className="text-slate-200">
                FutureSeer is analyzing your numerology profile with AI insights...
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
          <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-slate-200 shadow-lg rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Sparkles className="w-6 h-6 text-amber-600" />
                Comprehensive Numerology Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full space-y-2">
                {/* Profile Overview */}
                <AccordionItem value="overview" className="border-2 border-amber-200 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 px-4 shadow-sm">
                  <AccordionTrigger className="text-slate-800 hover:text-amber-700 py-4 [&[data-state=open]]:text-amber-700 [&>svg]:text-slate-600">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-amber-600" />
                      <span className="text-left font-semibold">Profile Overview</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <DevotionistStyleCard
                      icon={<Star className="w-5 h-5" />}
                      title="Your Numerology Profile"
                      summary={comprehensiveAnalysis.profileOverview}
                      colorScheme="amber"
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Core Numbers Analysis */}
                <AccordionItem value="core-numbers" className="border-2 border-blue-200 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 px-4 shadow-sm">
                  <AccordionTrigger className="text-slate-800 hover:text-blue-700 py-4 [&[data-state=open]]:text-blue-700 [&>svg]:text-slate-600">
                    <div className="flex items-center gap-3">
                      <Hash className="w-5 h-5 text-blue-600" />
                      <span className="text-left font-semibold">Core Numbers Analysis</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-3">
                    {comprehensiveAnalysis.coreNumbersAnalysis.map((item, index) => (
                      <DevotionistStyleCard
                        key={index}
                        icon={<Calculator className="w-5 h-5" />}
                        title={`${item.number} Number: ${item.value}${item.value === 11 || item.value === 22 || item.value === 33 ? ' (Master Number)' : ''}`}
                        summary={item.analysis}
                        colorScheme={index % 2 === 0 ? 'blue' : 'cyan'}
                      />
                    ))}
                  </AccordionContent>
                </AccordionItem>

                {/* Life Path Analysis */}
                <AccordionItem value="life-path" className="border-2 border-yellow-200 rounded-lg bg-gradient-to-br from-yellow-50 to-amber-50 px-4 shadow-sm">
                  <AccordionTrigger className="text-slate-800 hover:text-yellow-700 py-4 [&[data-state=open]]:text-yellow-700 [&>svg]:text-slate-600">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-yellow-600" />
                      <span className="text-left font-semibold">Life Path Analysis</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <DevotionistStyleCard
                      icon={<Target className="w-5 h-5" />}
                      title={`Life Path Number ${lifePath}`}
                      summary={comprehensiveAnalysis.lifePathAnalysis}
                      items={textToBulletPoints(comprehensiveAnalysis.lifePathAnalysis, 5).map(item => ({
                        ...item,
                        type: 'neutral' as const
                      }))}
                      colorScheme="amber"
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Expression Analysis */}
                <AccordionItem value="expression" className="border-2 border-blue-200 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 px-4 shadow-sm">
                  <AccordionTrigger className="text-slate-800 hover:text-blue-700 py-4 [&[data-state=open]]:text-blue-700 [&>svg]:text-slate-600">
                    <div className="flex items-center gap-3">
                      <Hash className="w-5 h-5 text-blue-600" />
                      <span className="text-left font-semibold">Expression Analysis</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <DevotionistStyleCard
                      icon={<Hash className="w-5 h-5" />}
                      title={`Expression Number ${expression}`}
                      summary={comprehensiveAnalysis.expressionAnalysis}
                      items={textToBulletPoints(comprehensiveAnalysis.expressionAnalysis, 5).map(item => ({
                        ...item,
                        type: 'neutral' as const
                      }))}
                      colorScheme="blue"
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Soul Urge Analysis */}
                <AccordionItem value="soul-urge" className="border-2 border-pink-200 rounded-lg bg-gradient-to-br from-pink-50 to-purple-50 px-4 shadow-sm">
                  <AccordionTrigger className="text-slate-800 hover:text-pink-700 py-4 [&[data-state=open]]:text-pink-700 [&>svg]:text-slate-600">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-pink-600" />
                      <span className="text-left font-semibold">Soul Urge Analysis</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <DevotionistStyleCard
                      icon={<Heart className="w-5 h-5" />}
                      title={`Soul Urge Number ${soulUrge}`}
                      summary={comprehensiveAnalysis.soulUrgeAnalysis}
                      items={textToBulletPoints(comprehensiveAnalysis.soulUrgeAnalysis, 5).map(item => ({
                        ...item,
                        type: 'neutral' as const
                      }))}
                      colorScheme="pink"
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Personality Analysis */}
                <AccordionItem value="personality" className="border-2 border-purple-200 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 px-4 shadow-sm">
                  <AccordionTrigger className="text-slate-800 hover:text-purple-700 py-4 [&[data-state=open]]:text-purple-700 [&>svg]:text-slate-600">
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-purple-600" />
                      <span className="text-left font-semibold">Personality Analysis</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <DevotionistStyleCard
                      icon={<Eye className="w-5 h-5" />}
                      title={`Personality Number ${personality}`}
                      summary={comprehensiveAnalysis.personalityAnalysis}
                      items={textToBulletPoints(comprehensiveAnalysis.personalityAnalysis, 5).map(item => ({
                        ...item,
                        type: 'neutral' as const
                      }))}
                      colorScheme="purple"
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Destiny Analysis */}
                <AccordionItem value="destiny" className="border-2 border-amber-200 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 px-4 shadow-sm">
                  <AccordionTrigger className="text-slate-800 hover:text-amber-700 py-4 [&[data-state=open]]:text-amber-700 [&>svg]:text-slate-600">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                      <span className="text-left font-semibold">Destiny Analysis</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <DevotionistStyleCard
                      icon={<Sparkles className="w-5 h-5" />}
                      title={`Destiny Number ${destiny}`}
                      summary={comprehensiveAnalysis.destinyAnalysis}
                      items={textToBulletPoints(comprehensiveAnalysis.destinyAnalysis, 5).map(item => ({
                        ...item,
                        type: 'neutral' as const
                      }))}
                      colorScheme="amber"
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Personal Year Analysis */}
                <AccordionItem value="personal-year" className="border-2 border-green-200 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 px-4 shadow-sm">
                  <AccordionTrigger className="text-slate-800 hover:text-green-700 py-4 [&[data-state=open]]:text-green-700 [&>svg]:text-slate-600">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <span className="text-left font-semibold">Personal Year Analysis</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <DevotionistStyleCard
                      icon={<Calendar className="w-5 h-5" />}
                      title="Current Personal Year"
                      summary={comprehensiveAnalysis.personalYearAnalysis}
                      items={textToBulletPoints(comprehensiveAnalysis.personalYearAnalysis, 5).map(item => ({
                        ...item,
                        type: 'neutral' as const
                      }))}
                      colorScheme="green"
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Challenges & Opportunities */}
                <AccordionItem value="challenges-opportunities" className="border-2 border-orange-200 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 px-4 shadow-sm">
                  <AccordionTrigger className="text-slate-800 hover:text-orange-700 py-4 [&[data-state=open]]:text-orange-700 [&>svg]:text-slate-600">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                      <span className="text-left font-semibold">Challenges & Opportunities</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-3">
                    {comprehensiveAnalysis.challengesAndOpportunities.challenges.length > 0 && (
                      <DevotionistStyleCard
                        icon={<AlertCircle className="w-5 h-5" />}
                        title="Challenges"
                        items={comprehensiveAnalysis.challengesAndOpportunities.challenges.map(challenge => ({
                          text: challenge,
                          type: 'challenge' as const
                        }))}
                        colorScheme="orange"
                      />
                    )}
                    {comprehensiveAnalysis.challengesAndOpportunities.opportunities.length > 0 && (
                      <DevotionistStyleCard
                        icon={<Zap className="w-5 h-5" />}
                        title="Opportunities"
                        items={comprehensiveAnalysis.challengesAndOpportunities.opportunities.map(opportunity => ({
                          text: opportunity,
                          type: 'positive' as const
                        }))}
                        colorScheme="green"
                      />
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* Predictive Insights */}
                <AccordionItem value="predictions" className="border-2 border-cyan-200 rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 px-4 shadow-sm">
                  <AccordionTrigger className="text-slate-800 hover:text-cyan-700 py-4 [&[data-state=open]]:text-cyan-700 [&>svg]:text-slate-600">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-cyan-600" />
                      <span className="text-left font-semibold">Predictive Insights</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-3">
                    <DevotionistStyleCard
                      icon={<Zap className="w-5 h-5" />}
                      title="Today's Quick Win"
                      summary={comprehensiveAnalysis.predictiveInsights.todaysQuickWin}
                      colorScheme="cyan"
                    />
                    <DevotionistStyleCard
                      icon={<Calendar className="w-5 h-5" />}
                      title="This Week"
                      summary={comprehensiveAnalysis.predictiveInsights.currentWeek}
                      colorScheme="blue"
                    />
                    <DevotionistStyleCard
                      icon={<Calendar className="w-5 h-5" />}
                      title="This Month"
                      summary={comprehensiveAnalysis.predictiveInsights.currentMonth}
                      colorScheme="purple"
                    />
                    <DevotionistStyleCard
                      icon={<Calendar className="w-5 h-5" />}
                      title="This Year"
                      summary={comprehensiveAnalysis.predictiveInsights.currentYear}
                      colorScheme="amber"
                    />
                    <DevotionistStyleCard
                      icon={<TrendingUp className="w-5 h-5" />}
                      title="Next Year Sneak Peek"
                      summary={comprehensiveAnalysis.predictiveInsights.nextYearSneakPeek}
                      colorScheme="green"
                    />
                    <DevotionistStyleCard
                      icon={<Star className="w-5 h-5" />}
                      title="Longer-Term Cycles"
                      summary={comprehensiveAnalysis.predictiveInsights.longerTermCycles}
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

