"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { universalOccultService, BirthData } from '@/lib/universalOccultService'
import { convertObjectToWestern } from '@/lib/western/westernTerminology'
import WesternSeerChatInterface from '@/components/WesternSeerChatInterface'
import Link from 'next/link'
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

export default function WesternAstrologyPage() {
  const { user, userProfile } = useAuth()
  const searchParams = useSearchParams()
  const [analysis, setAnalysis] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'introduction' | 'compatibility' | 'western-astrology' | 'advanced' | 'astro-numerology' | 'ask-the-seer'>('introduction')

  // Open Advanced tab when ?tab=advanced is in the URL (e.g. from "Back to Advanced")
  useEffect(() => {
    if (searchParams.get('tab') === 'advanced') {
      setActiveTab('advanced')
    }
  }, [searchParams])

  // Comprehensive report state - persisted across tab switches
  const [comprehensiveWesternReport, setComprehensiveWesternReport] = useState<any>(null)
  const [comprehensiveAstroNumerologyReport, setComprehensiveAstroNumerologyReport] = useState<any>(null)
  const [isLoadingWesternReport, setIsLoadingWesternReport] = useState(false)
  const [isLoadingAstroNumerologyReport, setIsLoadingAstroNumerologyReport] = useState(false)
  const [lastProfileKey, setLastProfileKey] = useState<string>('')

  // Check if user has complete birth details
  const hasCompleteDetails = userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace

  // Reset reports if profile data changes - MUST reset BEFORE new fetches
  useEffect(() => {
    const currentProfileKey = `${userProfile?.birthDate}_${userProfile?.birthTime}_${userProfile?.birthPlace}_${userProfile?.displayName || userProfile?.fullName}`
    if (lastProfileKey && lastProfileKey !== currentProfileKey && lastProfileKey !== '') {
      // Profile changed, reset reports immediately
      console.log('🔄 Profile changed - resetting reports')
      setComprehensiveWesternReport(null)
      setComprehensiveAstroNumerologyReport(null)
    }
    setLastProfileKey(currentProfileKey)
  }, [userProfile?.birthDate, userProfile?.birthTime, userProfile?.birthPlace, userProfile?.displayName, userProfile?.fullName])

  const loadWesternAnalysis = useCallback(async () => {
    if (!hasCompleteDetails) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('FutureSeer: Loading Western Astrology analysis...')
      
      const birthData: BirthData = {
        birthDate: userProfile?.birthDate || '',
        birthTime: userProfile?.birthTime || '',
        birthPlace: userProfile?.birthPlace || '',
        latitude: userProfile?.birthLatitude || 12.3051828, // Mysore, Karnataka, India
        longitude: userProfile?.birthLongitude || 76.6553609
      }
      
      // Load comprehensive analysis from Universal Occult API
      const westernData = await universalOccultService.calculateWesternChart(birthData, {
        houseSystem: 'placidus',
        includeAspects: true,
        includeTransits: true
      })
      
      // Apply Western terminology conversion
      const convertedData = convertObjectToWestern(westernData)
      setAnalysis(convertedData)
      
      console.log('FutureSeer: Western Astrology analysis loaded successfully:', westernData)
      console.log('FutureSeer: Transit data received:', westernData?.data?.transits)
    } catch (error) {
      console.error('FutureSeer: Failed to load Western Astrology analysis:', error)
      setError('Failed to load Western Astrology analysis')
    } finally {
      setIsLoading(false)
    }
  }, [hasCompleteDetails, userProfile])

  // Fetch comprehensive Western astrology report once when analysis is ready
  useEffect(() => {
    const fetchComprehensiveWesternReport = async () => {
      // Don't fetch if we already have the report for this profile
      if (comprehensiveWesternReport && lastProfileKey) {
        return
      }
      
      if (!user?.uid || !analysis?.data || !lastProfileKey) {
        return
      }

      console.log('🔄 Fetching comprehensive Western astrology report...')
      setIsLoadingWesternReport(true)
      try {
        const response = await fetch('/api/western-astrology/comprehensive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.uid,
            chartData: {
              planets: analysis.data.planets || [],
              houses: analysis.data.houses || [],
              aspects: analysis.data.aspects || [],
              transits: analysis.data.transits || []
            },
            userProfile: userProfile
          }),
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data?.comprehensiveAnalysis) {
            console.log('✅ Comprehensive Western astrology report fetched successfully')
            setComprehensiveWesternReport(result.data.comprehensiveAnalysis)
          } else {
            console.warn('⚠️ Comprehensive Western report response missing data')
          }
        } else {
          console.error('❌ Failed to fetch comprehensive Western report:', response.status)
        }
      } catch (error) {
        console.error('❌ Error fetching comprehensive Western report:', error)
      } finally {
        setIsLoadingWesternReport(false)
      }
    }

    fetchComprehensiveWesternReport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, analysis?.data, lastProfileKey])

  // Fetch comprehensive Astro-Numerology report once when data is ready
  useEffect(() => {
    const fetchComprehensiveAstroNumerologyReport = async () => {
      // Don't fetch if we already have the report for this profile
      if (comprehensiveAstroNumerologyReport && lastProfileKey) {
        return
      }
      
      if (!user?.uid || !userProfile?.birthDate || !userProfile?.displayName || !lastProfileKey) {
        return // Missing required data
      }

      const sunSign = analysis?.data?.planets?.find((p: any) => p.name === 'Sun')?.sign?.signName || 
                     analysis?.data?.planets?.find((p: any) => p.name === 'Sun')?.sign || 
                     'Unknown'
      
      if (sunSign === 'Unknown') {
        console.log('⏳ Waiting for analysis data to get sun sign...')
        return // Wait for analysis data
      }

      console.log('🔄 Fetching comprehensive Astro-Numerology report...')
      setIsLoadingAstroNumerologyReport(true)
      try {
        const fullName = userProfile.displayName || userProfile.fullName || user?.displayName || ''
        const response = await fetch('/api/astro-numerology/analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.uid,
            birthDate: userProfile.birthDate,
            fullName: fullName,
            sunSign: sunSign,
          }),
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            console.log('✅ Comprehensive Astro-Numerology report fetched successfully')
            // Store the full data structure including sunSign, lifePathNumber, nameNumber, and comprehensiveAnalysis
            setComprehensiveAstroNumerologyReport(result.data)
          } else {
            console.warn('⚠️ Astro-Numerology report response missing data')
          }
        } else {
          console.error('❌ Failed to fetch Astro-Numerology report:', response.status)
        }
      } catch (error) {
        console.error('❌ Error fetching comprehensive Astro-Numerology report:', error)
      } finally {
        setIsLoadingAstroNumerologyReport(false)
      }
    }

    fetchComprehensiveAstroNumerologyReport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, userProfile?.birthDate, userProfile?.displayName, userProfile?.fullName, analysis?.data, lastProfileKey])

  // Auto-load analysis when profile is complete - this triggers the report generation cascade
  useEffect(() => {
    if (hasCompleteDetails) {
      console.log('✅ Profile complete - loading Western Astrology analysis')
      loadWesternAnalysis()
    }
  }, [hasCompleteDetails, loadWesternAnalysis])

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

  if (!hasCompleteDetails) {
    return (
      <div className="relative min-h-screen starfield-ultra-sharp">
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md glass-card border-white/10 rounded-xl text-white">
            <CardContent className="p-6 text-center text-white">
              <Star className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Profile Incomplete</h2>
              <p className="text-slate-200 mb-4">Complete your profile to unlock your Western astrology chart</p>
              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button 
                  onClick={() => window.location.href = '/profile-setup'}
                  className="bg-amber-500 hover:bg-amber-600 text-white relative overflow-hidden focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-transparent"
                >
                  <span className="relative z-10">Complete Profile</span>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="starfield-ultra-sharp min-h-screen p-4 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto py-8">
        <div className="text-center mb-8 pt-4">
          <h1 className="text-5xl font-serif font-semibold mb-6">
            <span className="text-yellow-400">⭐</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Western Astrology</span>
          </h1>
          <p className="text-slate-200 leading-relaxed text-xl font-light">Traditional Western zodiac system with precise calculations</p>
        </div>
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-transparent p-0 gap-2">
            {tabsConfig.map((tab) => (
              <motion.div
                key={tab.value}
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 400, damping: 17 }}
                className="relative"
              >
                <TabsTrigger 
                  value={tab.value} 
                  className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center relative overflow-hidden"
                >
                  {tab.label}
                  {activeTab === tab.value && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl -z-10"
                      transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </TabsTrigger>
              </motion.div>
            ))}
          </TabsList>

          {/* Tab Content with Material 3 Transitions */}
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
                <TabsContent value="introduction" className="space-y-6 mt-6">
                  <ToolIntroductionTab toolSlug="western-astrology" />
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
                <TabsContent value="compatibility" className="space-y-6 mt-6">
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
              >
                <TabsContent value="western-astrology" className="space-y-6 mt-6">
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
            ) : error ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-300 mb-4">{error}</p>
                <motion.div
                  whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                  transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button onClick={loadWesternAnalysis} className="bg-amber-500 hover:bg-amber-600 text-white relative overflow-hidden focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-transparent">
                    <span className="relative z-10">Try Again</span>
                  </Button>
                </motion.div>
              </div>
            ) : analysis?.data ? (
              <>
                {/* HERO SECTION - Always visible */}
                <WesternDashboardHero 
                  chartData={analysis.data}
                  userProfile={userProfile}
                />

                {/* DASHBOARD SECTIONS - Organized like astro-charts.com */}
                <div className="space-y-6 mt-8">
                  
                  {/* Section 1: Chart Overview */}
                  <DashboardSection 
                    title="Chart Overview" 
                    icon={<Star className="w-6 h-6" />}
                    defaultExpanded={true}
                    colorScheme="amber"
                    storageKey="chart-overview"
                  >
                    {comprehensiveWesternReport?.chartOverview ? (
                      <div className="prose prose-slate max-w-none">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                          {comprehensiveWesternReport.chartOverview}
                        </p>
                      </div>
                    ) : isLoadingWesternReport ? (
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
                          className="text-slate-600 text-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          Generating overview...
                        </motion.p>
                      </motion.div>
                    ) : (
                      <div className="text-center py-8">
                        <Info className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-600 text-sm">Chart overview will appear once analysis is complete.</p>
                      </div>
                    )}
                  </DashboardSection>

                  {/* Section 2: Chart Patterns */}
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

                  {/* Section 3: Aspects */}
                  <DashboardSection 
                    title="Aspects" 
                    icon={<Zap className="w-6 h-6" />}
                    badge={`${analysis.data.aspects?.length || 0} Aspects`}
                    defaultExpanded={false}
                    colorScheme="pink"
                    storageKey="aspects"
                  >
                    <AspectLegendPanel aspects={analysis.data.aspects || []} />
                  </DashboardSection>

                  {/* Section 4: Planets */}
                  <DashboardSection 
                    title="Planets" 
                    icon={<Activity className="w-6 h-6" />}
                    badge={`${analysis.data.planets?.length || 0} Celestial Bodies`}
                    defaultExpanded={false}
                    colorScheme="blue"
                    storageKey="planets"
                  >
                    <PlanetaryDashboard 
                      planets={analysis.data.planets || []}
                      planetaryAnalysis={comprehensiveWesternReport?.planetaryAnalysis}
                    />
                  </DashboardSection>

                  {/* Section 5: Houses */}
                  <DashboardSection 
                    title="Houses" 
                    icon={<Home className="w-6 h-6" />}
                    badge="12 Life Areas"
                    defaultExpanded={false}
                    colorScheme="green"
                    storageKey="houses"
                  >
                    <HouseDashboard 
                      houses={analysis.data.houses || []}
                      houseAnalysis={comprehensiveWesternReport?.houseAnalysis}
                    />
                  </DashboardSection>

                  {/* Section 6: Transit Timeline */}
                  <DashboardSection 
                    title="Current Transits" 
                    icon={<TrendingUp className="w-6 h-6" />}
                    badge="Active Now"
                    defaultExpanded={false}
                    colorScheme="orange"
                    storageKey="transits"
                  >
                    <TransitTimeline 
                      transits={analysis.data.transits || []}
                      natalPlanets={analysis.data.planets || []}
                    />
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
                    {comprehensiveWesternReport?.predictiveInsights ? (
                      <div className="space-y-4">
                        {(() => {
                          const insights = comprehensiveWesternReport.predictiveInsights
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
                                        <h4 className="font-bold text-amber-900 mb-2">Today's Quick Win</h4>
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
                    ) : isLoadingWesternReport ? (
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
                          className="text-slate-600 text-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          Generating predictive insights...
                        </motion.p>
                      </motion.div>
                    ) : (
                      <div className="text-center py-8">
                        <Eye className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-600 text-sm">Predictive insights will appear once analysis is complete.</p>
                      </div>
                    )}
                  </DashboardSection>

                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Info className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-200 mb-4">No Western astrology data available. Please complete your profile.</p>
                <motion.div
                  whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                  transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button onClick={loadWesternAnalysis} className="bg-amber-500 hover:bg-amber-600 text-white relative overflow-hidden focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-transparent">
                    <span className="relative z-10">Generate Analysis</span>
                  </Button>
                </motion.div>
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
                <TabsContent value="astro-numerology" className="space-y-6 mt-6">
                  <AstroNumerologyTab
                    userId={user?.uid}
                    birthDate={userProfile?.birthDate}
                    fullName={userProfile?.displayName || userProfile?.fullName || user?.displayName || ''}
                    sunSign={analysis?.data?.planets?.find((p: any) => p.name === 'Sun')?.sign?.signName || analysis?.data?.planets?.find((p: any) => p.name === 'Sun')?.sign}
                    analysis={analysis}
                    cachedReport={comprehensiveAstroNumerologyReport}
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
                <TabsContent value="advanced" className="space-y-6 mt-6">
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
                    Explore specialized astrological systems and techniques for deeper insights into your cosmic blueprint. Suggest which tools you'd like us to implement next—we use your feedback to prioritize new features.
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
                                whileHover={prefersReducedMotion ? {} : { scale: 1.1, rotate: 5 }}
                                transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 400, damping: 17 }}
                              >
                                <span className="text-3xl">{technique.icon}</span>
                              </motion.div>
                              <h4 className="text-amber-900 font-bold text-lg">{technique.name}</h4>
                            </div>
                            <p className="text-slate-700 text-sm mb-4 leading-relaxed">{technique.description}</p>
                            <motion.div
                              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
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
                <TabsContent value="ask-the-seer" className="space-y-6 mt-6">
                  <div className="h-[800px] min-h-0">
                    <WesternSeerChatInterface
                      userId={user?.uid || ''}
                      userProfile={userProfile}
                      westernChartData={analysis?.data}
                      astroNumerologyData={
                        // Only pass Astro-Numerology data if we have the comprehensive report OR if we have the required profile data
                        (comprehensiveAstroNumerologyReport || (userProfile?.birthDate && userProfile?.displayName && analysis?.data)) ? {
                          sunSign: comprehensiveAstroNumerologyReport?.sunSign || 
                                  analysis?.data?.planets?.find((p: any) => p.name === 'Sun')?.sign?.signName || 
                                  analysis?.data?.planets?.find((p: any) => p.name === 'Sun')?.sign || 'Unknown',
                          lifePathNumber: comprehensiveAstroNumerologyReport?.lifePathNumber || 0,
                          nameNumber: comprehensiveAstroNumerologyReport?.nameNumber || 0,
                          comprehensiveReport: comprehensiveAstroNumerologyReport?.comprehensiveAnalysis || comprehensiveAstroNumerologyReport || undefined
                        } : undefined
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
  )
}