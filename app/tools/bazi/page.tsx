"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useBaZi } from "@/hooks/use-bazi"
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
  RefreshCw,
  AlertTriangle,
  Info,
  Sparkles,
  MessageCircle,
  ArrowLeft,
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

/**
 * Comprehensive BaZi Report Interface
 * Contains AI-generated insights for enhanced analysis
 */
interface ComprehensiveBaziReport {
  chartOverview?: string
  lifePathInsights?: string
  elementHarmonization?: string
  timingAndOpportunities?: string
}

export default function BaZiPage() {
  const { user, userProfile } = useAuth()
  const { reading, isLoading, error, hasCompleteProfile, loadBaziReading, regenerateReading } = useBaZi()
  const [activeTab, setActiveTab] = useState<'introduction' | 'overview' | 'compatibility' | 'ask-seer'>('introduction')
  
  // Comprehensive report state
  const [comprehensiveBaziReport, setComprehensiveBaziReport] = useState<ComprehensiveBaziReport | null>(null)
  const [isLoadingBaziReport, setIsLoadingBaziReport] = useState(false)
  const [lastProfileKey, setLastProfileKey] = useState<string>('')
  
  // Request deduplication ref
  const fetchRequestRef = useRef<Promise<void> | null>(null)

  // Memoize current age calculation
  const currentAge = useMemo(() => {
    if (!userProfile?.birthDate) return 0
    return new Date().getFullYear() - new Date(userProfile.birthDate).getFullYear()
  }, [userProfile?.birthDate])

  // Memoize profile key to prevent unnecessary recalculations
  const profileKey = useMemo(() => {
    return `${userProfile?.birthDate}_${userProfile?.birthTime}_${userProfile?.birthPlace}`
  }, [userProfile?.birthDate, userProfile?.birthTime, userProfile?.birthPlace])

  // Reset reports if profile data changes
  useEffect(() => {
    if (lastProfileKey && lastProfileKey !== profileKey && lastProfileKey !== '') {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Profile changed - resetting BaZi report')
      }
      setComprehensiveBaziReport(null)
    }
    setLastProfileKey(profileKey)
  }, [profileKey, lastProfileKey])

  // Auto-load reading if profile is complete (optimized dependencies)
  const loadBaziReadingCallback = useCallback(() => {
    if (hasCompleteProfile && !reading && !isLoading) {
      loadBaziReading()
    }
  }, [hasCompleteProfile, reading, isLoading, loadBaziReading])

  useEffect(() => {
    loadBaziReadingCallback()
  }, [loadBaziReadingCallback])

  // Memoize comprehensive report fetch logic
  const shouldFetchReport = useMemo(() => {
    return !!(user?.uid && reading && profileKey && !comprehensiveBaziReport && !isLoadingBaziReport)
  }, [user?.uid, reading, profileKey, comprehensiveBaziReport, isLoadingBaziReport])

  // Fetch comprehensive report when reading is available (with request deduplication)
  useEffect(() => {
    if (!shouldFetchReport) return

    // Prevent duplicate requests
    if (fetchRequestRef.current) return

    const fetchComprehensiveBaziReport = async () => {
      if (!user?.uid || !reading || !profileKey) return

      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Fetching comprehensive BaZi report...')
      }
      
      setIsLoadingBaziReport(true)
      
      try {
        const response = await fetch('/api/bazi/comprehensive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.uid,
            reading: reading,
            userProfile: userProfile
          }),
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            if (process.env.NODE_ENV === 'development') {
              console.log('✅ Comprehensive BaZi report fetched successfully')
            }
            setComprehensiveBaziReport(result.data)
          } else {
            if (process.env.NODE_ENV === 'development') {
              console.warn('⚠️ BaZi report response missing data')
            }
            setComprehensiveBaziReport(null)
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ Failed to fetch BaZi report:', response.status)
          }
          setComprehensiveBaziReport(null)
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Error fetching comprehensive BaZi report:', error)
        }
        setComprehensiveBaziReport(null)
      } finally {
        setIsLoadingBaziReport(false)
        fetchRequestRef.current = null
      }
    }

    fetchRequestRef.current = fetchComprehensiveBaziReport()
    fetchRequestRef.current.catch(() => {
      fetchRequestRef.current = null
    })

    // Cleanup function
    return () => {
      if (fetchRequestRef.current) {
        fetchRequestRef.current = null
      }
    }
  }, [shouldFetchReport, user?.uid, reading, profileKey, userProfile])

  return (
    <div className="relative min-h-screen">
      {/* Fixed starfield background */}
      <div className="fixed inset-0 -z-10 starfield-ultra-sharp pointer-events-none" />
      <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
        {/* Header */}
        <motion.div
          variants={m3PageTransition}
          initial="initial"
          animate="animate"
          className="mb-8"
        >
          <Link 
            href="/tools" 
            className="inline-flex items-center gap-2 text-amber-200 hover:text-amber-300 transition-colors mb-6 group focus-visible:outline-2 focus-visible:outline-amber-400 focus-visible:outline-offset-2 rounded-md"
            aria-label="Navigate back to tools page"
          >
            <motion.div
              whileHover={{ x: -4 }}
              transition={m3BouncySpring}
            >
              <ArrowLeft className="w-4 h-4" />
            </motion.div>
            <span>Back to Tools</span>
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl text-amber-400">🏮</div>
            <div>
              <h1 className="text-4xl font-bold gold-glow mb-6">BaZi</h1>
              <p className="text-white/70 text-lg">Four Pillars of Destiny - Ancient Chinese Life Path Analysis</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
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
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as typeof activeTab)} 
            className="space-y-6"
          >
            <TabsList 
              className="grid w-full grid-cols-4 bg-transparent p-0 gap-2"
              role="tablist"
              aria-label="BaZi tool navigation tabs"
            >
              <TabsTrigger 
                value="introduction"
                className="devotionist-tab-trigger"
                aria-label="Introduction tab"
              >
                Introduction
              </TabsTrigger>
              <TabsTrigger 
                value="overview"
                className="devotionist-tab-trigger"
                aria-label="Overview tab"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="compatibility"
                className="devotionist-tab-trigger"
                aria-label="Compare tab"
              >
                Compare
              </TabsTrigger>
              <TabsTrigger 
                value="ask-seer"
                className="devotionist-tab-trigger"
                aria-label="Ask the Seer tab"
              >
                <MessageCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                Ask the Seer
              </TabsTrigger>
            </TabsList>

            {/* Introduction Tab */}
            <TabsContent value="introduction" className="space-y-6">
              <ToolIntroductionTab toolSlug="bazi" />
            </TabsContent>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
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
                    <h3 className="text-3xl font-serif font-bold text-amber-900 mb-4">BaZi Reading Ready</h3>
                    <p className="text-slate-700 mb-6 max-w-md mx-auto">
                      {hasCompleteProfile 
                        ? "Your Four Pillars of Destiny analysis is being generated..."
                        : "Complete your birth information in your profile to generate your BaZi reading."}
                    </p>
                    {hasCompleteProfile && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={m3BouncySpring}
                      >
                        <Button
                          onClick={loadBaziReading}
                          className={`bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white ${m3Elevation.level2} hover:${m3Elevation.level4} transition-all duration-300`}
                          aria-label="Generate BaZi reading"
                        >
                          <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
                          Generate BaZi Reading
                        </Button>
                      </motion.div>
                    )}
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

                  {/* Comprehensive Report Status Alert */}
                  {!isLoadingBaziReport && !comprehensiveBaziReport && reading && (
                    <Alert 
                      className={`bg-amber-900/20 border-amber-500/50 rounded-2xl ${m3Elevation.level1}`}
                      role="status"
                      aria-live="polite"
                    >
                      <Info className="h-4 w-4 text-amber-400" aria-hidden="true" />
                      <AlertDescription className="text-amber-200">
                        <span className="font-semibold">Enhanced AI insights are loading...</span>
                        <br />
                        Your complete Four Pillars analysis is displayed below.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Loading State for Comprehensive Report */}
                  {isLoadingBaziReport && (
                    <BaziDashboardSection
                      title="Loading Comprehensive Analysis..."
                      icon={<Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />}
                      defaultExpanded={true}
                    >
                      <div className="text-center py-8" role="status" aria-live="polite">
                        <Loader2 className="w-12 h-12 animate-spin text-amber-400 mx-auto mb-4" aria-hidden="true" />
                        <p className="text-slate-300">Generating your personalized insights...</p>
                        <p className="text-slate-500 text-sm mt-2">This may take a few moments</p>
                      </div>
                    </BaziDashboardSection>
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

                  {/* Regenerate Button */}
                  <div className="flex justify-center pt-6">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={m3BouncySpring}
                    >
                      <Button
                        onClick={regenerateReading}
                        className={`bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white ${m3Elevation.level2} hover:${m3Elevation.level4} transition-all duration-300 px-8 py-6 text-lg rounded-2xl`}
                        aria-label="Regenerate BaZi reading"
                      >
                        <RefreshCw className="w-5 h-5 mr-2" aria-hidden="true" />
                        Regenerate Reading
                      </Button>
                    </motion.div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Compare Tab */}
            <TabsContent value="compatibility" className="space-y-6">
              <CompatibilityTab toolSlug="bazi" />
            </TabsContent>

            {/* Ask the Seer Tab */}
            <TabsContent value="ask-seer" className="space-y-6">
              {reading ? (
                <BaZiCoachInterface reading={reading} />
              ) : (
                <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg rounded-3xl">
                  <CardContent className="p-12 text-center">
                    <MessageCircle className="w-16 h-16 text-amber-600 mx-auto mb-4" aria-hidden="true" />
                    <h3 className="text-xl font-serif text-amber-900 mb-2">BaZi Reading Required</h3>
                    <p className="text-slate-700 mb-6">
                      Generate your BaZi reading first to get personalized guidance from Ask the Seer.
                    </p>
                    {hasCompleteProfile && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={m3BouncySpring}
                      >
                        <Button
                          onClick={loadBaziReading}
                          className={`bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white ${m3Elevation.level2} hover:${m3Elevation.level4} transition-all duration-300`}
                          aria-label="Generate BaZi reading"
                        >
                          <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
                          Generate BaZi Reading
                        </Button>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
