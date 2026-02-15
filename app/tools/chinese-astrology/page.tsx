"use client"

/**
 * Chinese Astrology Page
 * Reads from pipeline only (useToolReport). No auto-call to tool API.
 */

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Calendar,
  Clock,
  MapPin,
  Star,
  Sparkles,
  Info,
  BookOpen,
  Heart,
  Zap,
  Target,
  MessageCircle,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useToolReport } from '@/hooks/useComprehensiveMysticalProfile'
import { ToolReportGuard } from '@/components/ToolReportGuard'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { 
  chineseAstrologyService,
  BirthInfo,
  ZiWeiChartData 
} from '@/lib/chinese/chineseAstrologyService'
import { generateZiWeiReport, ZiWeiReport } from '@/lib/chinese/ziweiReportGenerator'
import ZiWeiChart from '@/components/chinese/ZiWeiChart'
import PalaceAnalysis from '@/components/chinese/PalaceAnalysis'
import FourPillarsChart from '@/components/chinese/FourPillarsChart'
import ChineseZodiacWheel from '@/components/chinese/ChineseZodiacWheel'
import ZiWeiReportGenerator from '@/components/chinese/ZiWeiReportGenerator'
import ZiWeiOverview from '@/components/chinese/ZiWeiOverview'
import FortuneCycleTimeline from '@/components/chinese/FortuneCycleTimeline'
import FourTransformationsPanel from '@/components/chinese/FourTransformationsPanel'
import { ZiWeiSeerChatInterface } from '@/components/ZiWeiSeerChatInterface'
import { ToolIntroductionTab } from '@/components/ToolIntroductionTab'

export default function ChineseAstrologyPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'introduction' | 'overview' | 'chart' | 'palaces' | 'pillars' | 'zodiac' | 'fortune' | 'transformations' | 'report' | 'ask-seer'>('introduction')
  const { report: pipelineReport, loading: isLoading, error: profileError } = useToolReport('chineseAstrology')
  const { chartData, report } = useMemo(() => {
    if (!pipelineReport || typeof pipelineReport !== 'object') return { chartData: null, report: null }
    const r = pipelineReport as Record<string, unknown>
    if (r.placeholder === true) return { chartData: null, report: null }
    const data = (r.data ?? r) as Record<string, unknown> | undefined
    if (!data) return { chartData: null, report: null }
    const chart = (data.chartData ?? data.chart ?? r.chartData ?? r.chart) as ZiWeiChartData | null | undefined
    const rep = (data.report ?? r.report) as ZiWeiReport | null | undefined
    return {
      chartData: chart && typeof chart === 'object' ? chart : null,
      report: rep && typeof rep === 'object' ? rep : null
    }
  }, [pipelineReport])
  
  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Material 3 motion configuration
  const motionConfig = useMemo(() => {
    if (prefersReducedMotion) return { duration: 0 }
    return { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }
  }, [prefersReducedMotion])

  // Memoize tab configuration
  const tabsConfig = useMemo(() => [
    { value: 'introduction', label: 'Introduction' },
    { value: 'overview', label: 'Overview' },
    { value: 'report', label: 'Report' },
    { value: 'chart', label: 'Chart' },
    { value: 'palaces', label: 'Palaces' },
    { value: 'pillars', label: 'Pillars' },
    { value: 'zodiac', label: 'Zodiac' },
    { value: 'fortune', label: 'Fortune' },
    { value: 'transformations', label: '四化' },
    { value: 'ask-seer', label: 'Ask the Seer' }
  ], [])
  
  // Birth data state
  const [birthData, setBirthData] = useState<BirthInfo>({
    solarDate: '',
    solarTime: '',
    gender: 'male',
    location: {
      latitude: 0,
      longitude: 0,
      timezone: 'UTC'
    }
  })

  const hasCompleteDetails = !!(userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace)

  useEffect(() => {
    if (hasCompleteDetails && userProfile && !birthData.solarDate) {
      setBirthData({
        solarDate: userProfile.birthDate!,
        solarTime: userProfile.birthTime!,
        gender: userProfile.gender === 'female' ? 'female' : 'male',
        location: {
          latitude: userProfile.latitude ?? 0,
          longitude: userProfile.longitude ?? 0,
          timezone: 'UTC'
        }
      })
    }
  }, [hasCompleteDetails, userProfile])

  // Handle birth data changes (for display only; no API call)
  const handleBirthDataChange = (field: keyof BirthInfo, value: any) => {
    setBirthData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!user) {
    return (
      <div className="starfield-ultra-sharp min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
          className="text-center"
        >
          <Sparkles className="w-16 h-16 text-amber-400 mb-4 mx-auto" />
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 mb-3">Unlock Your Chinese Destiny</h2>
          <p className="text-lg text-slate-300 text-center mb-6 max-w-md">
            Please log in to explore your personalized Zi Wei Dou Shu (Purple Star Astrology) chart and discover your Chinese zodiac destiny.
          </p>
          <Button 
            onClick={() => router.push('/signin')}
            variant="filled"
            className="font-semibold"
          >
            Login to Reveal Your Destiny
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <ToolReportGuard loading={isLoading} error={profileError ?? null} toolLabel="Chinese astrology">
    <div className="starfield-ultra-sharp min-h-screen p-4 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
        >
          <div className="text-center mb-8 pt-4">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-6">
              <span className="text-yellow-400">🏮</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">紫微斗數 (Zi Wei Dou Shu)</span>
            </h1>
            <p className="text-slate-200 leading-relaxed text-xl font-light">
              Purple Star Astrology - Traditional Chinese Divination
            </p>
          </div>

          {/* Birth Information Form - Only show if profile is incomplete */}
          {!hasCompleteDetails && !chartData && (
            <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl mb-8">
              <CardHeader>
                <CardTitle className="text-purple-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-700" />
                  Birth Information
                </CardTitle>
                <p className="text-slate-700 text-sm">
                  {hasCompleteDetails 
                    ? 'Your profile data will be used automatically. You can modify it below if needed.'
                    : 'Enter your birth details to calculate your Zi Wei Dou Shu chart'}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="text-slate-700 font-medium">Birth Date</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={birthData.solarDate}
                      onChange={(e) => handleBirthDataChange('solarDate', e.target.value)}
                      className="bg-white border-2 border-purple-200 text-slate-900 focus:border-purple-400 focus:ring-purple-200"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="birthTime" className="text-slate-700 font-medium">Birth Time</Label>
                    <Input
                      id="birthTime"
                      type="time"
                      value={birthData.solarTime}
                      onChange={(e) => handleBirthDataChange('solarTime', e.target.value)}
                      className="bg-white border-2 border-purple-200 text-slate-900 focus:border-purple-400 focus:ring-purple-200"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-slate-700 font-medium">Gender</Label>
                    <select
                      id="gender"
                      value={birthData.gender}
                      onChange={(e) => handleBirthDataChange('gender', e.target.value)}
                      className="w-full p-2 bg-white border-2 border-purple-200 rounded text-slate-900 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Location</Label>
                    <div className="text-sm text-slate-700 p-2 bg-white rounded border-2 border-purple-200">
                      {userProfile?.birthPlace || 'Please set in profile'}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button asChild variant="filled" className="font-semibold">
                    <Link href="/profile">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate your mystical profile
                    </Link>
                  </Button>
                  
                  {!hasCompleteDetails && (
                    <Button
                      variant="outlined"
                      onClick={() => router.push('/profile')}
                    >
                      Complete Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
              className="mb-6"
            >
              <Card elevation={1} className="bg-red-900/40 border-red-700/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-red-300">
                    <Info className="w-5 h-5" />
                    <p>{error}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Loading State - When profile is complete and chart is being generated */}
          {hasCompleteDetails && isLoading && !chartData && (
            <Card elevation={2} className="glass-card border-amber-500/30">
              <CardContent className="p-12 text-center">
                <Loader2 className="w-12 h-12 text-amber-400 mx-auto mb-4 animate-spin" />
                <p className="text-slate-300 text-lg mb-2">Calculating Your Zi Wei Dou Shu Chart...</p>
                <p className="text-slate-400 text-sm">Using your profile data to generate your personalized destiny chart</p>
              </CardContent>
            </Card>
          )}

          {/* Chart Results */}
          {chartData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
              className="space-y-6"
            >
              {/* Lunar Date Info */}
              <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div>
                      <p className="text-slate-600 text-sm mb-2 font-medium">Solar Date</p>
                      <p className="text-purple-900 font-semibold text-lg">
                        {format(new Date(birthData.solarDate), 'PPP')}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 text-sm mb-2 font-medium">Lunar Date</p>
                      <p className="text-purple-900 font-semibold text-lg">
                        {chartData.lunarDate.lunarMonth} {chartData.lunarDate.day}, {chartData.lunarDate.year}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 text-sm mb-2 font-medium">Chinese Zodiac</p>
                      <p className="text-purple-900 font-semibold text-lg">
                        {chartData.zodiacAnimal.animal} ({chartData.zodiacAnimal.nameChinese ?? chartData.zodiacAnimal.animal})
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Main Tabs */}
              <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full min-w-0">
                <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
                  {tabsConfig.map((tab) => (
                    <motion.div
                      key={tab.value}
                      whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                      transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 400, damping: 17 }}
                      className="relative shrink-0"
                    >
                      <TabsTrigger 
                        value={tab.value} 
                        className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 transition-all flex items-center justify-center relative overflow-hidden border border-transparent data-[state=inactive]:border-slate-600/50"
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

                {/* Tab Content with Material 3 Transitions */}
                <AnimatePresence mode="wait">
                  {activeTab === 'introduction' && (
                    <motion.div
                      key="introduction"
                      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                      transition={motionConfig}
                    >
                      <TabsContent value="introduction" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                        <ToolIntroductionTab toolSlug="chinese-astrology" />
                      </TabsContent>
                    </motion.div>
                  )}

                  {activeTab === 'overview' && (
                    <motion.div
                      key="overview"
                      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                      transition={motionConfig}
                    >
                      <TabsContent value="overview" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                        {report && chartData ? (
                          <ZiWeiOverview 
                            report={report} 
                            chartData={chartData}
                            onViewFullReport={() => setActiveTab('report')}
                          />
                        ) : (
                          <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
                            <CardContent className="p-12 text-center">
                              <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                              <p className="text-purple-900 mb-4 font-medium">Generate your mystical profile to see your Zi Wei report.</p>
                              <Button asChild variant="filled">
                                <Link href="/profile">
                                  <Sparkles className="w-4 h-4 mr-2" />
                                  Generate your mystical profile
                                </Link>
                              </Button>
                            </CardContent>
                          </Card>
                        )}
                      </TabsContent>
                    </motion.div>
                  )}

                  {activeTab === 'report' && (
                    <motion.div
                      key="report"
                      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                      transition={motionConfig}
                    >
                      <TabsContent value="report" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                  {report ? (
                    <ZiWeiReportGenerator 
                      report={report} 
                      chartData={chartData}
                      isLoading={isLoading}
                    />
                  ) : (
                    <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
                      <CardContent className="p-12 text-center">
                        <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                        <p className="text-purple-900 mb-4 font-medium">Generate your mystical profile to see your comprehensive Zi Wei report.</p>
                        <Button asChild variant="filled">
                          <Link href="/profile">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate your mystical profile
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                      </TabsContent>
                    </motion.div>
                  )}

                  {activeTab === 'chart' && (
                    <motion.div
                      key="chart"
                      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                      transition={motionConfig}
                    >
                      <TabsContent value="chart" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                  <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
                    <CardHeader>
                      <CardTitle className="text-purple-900 flex items-center gap-2">
                        <Star className="w-5 h-5 text-purple-700" />
                        Zi Wei Dou Shu Chart
                      </CardTitle>
                      <p className="text-slate-700 text-sm">
                        Your Purple Star Astrology chart showing the 12 palaces and star positions
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-center">
                        <ZiWeiChart
                          palaces={chartData.palaces}
                          mainStars={chartData.mainStars}
                          supportingStars={chartData.supportingStars}
                          width={600}
                          height={600}
                          showStars={true}
                          showElements={true}
                          onPalaceClick={() => {}}
                          onStarClick={() => {}}
                        />
                      </div>
                    </CardContent>
                  </Card>
                      </TabsContent>
                    </motion.div>
                  )}

                  {activeTab === 'palaces' && (
                    <motion.div
                      key="palaces"
                      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                      transition={motionConfig}
                    >
                      <TabsContent value="palaces" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                  <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
                    <CardContent className="p-6">
                      <PalaceAnalysis
                        palaces={chartData.palaces}
                        mainStars={chartData.mainStars}
                        supportingStars={chartData.supportingStars}
                        onStarClick={() => {}}
                      />
                    </CardContent>
                  </Card>
                      </TabsContent>
                    </motion.div>
                  )}

                  {activeTab === 'pillars' && (
                    <motion.div
                      key="pillars"
                      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                      transition={motionConfig}
                    >
                      <TabsContent value="pillars" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                  <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
                    <CardContent className="p-6">
                      <FourPillarsChart
                        fourPillars={chartData.fourPillars}
                        elementBalance={chartData.elements}
                        onPillarClick={() => {}}
                      />
                    </CardContent>
                  </Card>
                      </TabsContent>
                    </motion.div>
                  )}

                  {activeTab === 'zodiac' && (
                    <motion.div
                      key="zodiac"
                      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                      transition={motionConfig}
                    >
                      <TabsContent value="zodiac" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                  <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
                    <CardContent className="p-6">
                      <ChineseZodiacWheel
                        zodiacAnimal={chartData.zodiacAnimal}
                        birthYear={new Date(birthData.solarDate).getFullYear()}
                        onAnimalClick={() => {}}
                        showCompatibility={true}
                        showElements={true}
                      />
                    </CardContent>
                  </Card>
                      </TabsContent>
                    </motion.div>
                  )}

                  {activeTab === 'fortune' && (
                    <motion.div
                      key="fortune"
                      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                      transition={motionConfig}
                    >
                      <TabsContent value="fortune" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                  {chartData.runtimeContext ? (
                    <FortuneCycleTimeline 
                      runtimeContext={chartData.runtimeContext}
                    />
                  ) : (
                    <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
                      <CardContent className="p-12 text-center">
                        <Target className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                        <p className="text-purple-900 font-medium">Runtime context will be calculated...</p>
                      </CardContent>
                    </Card>
                  )}
                      </TabsContent>
                    </motion.div>
                  )}

                  {activeTab === 'transformations' && (
                    <motion.div
                      key="transformations"
                      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                      transition={motionConfig}
                    >
                      <TabsContent value="transformations" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                        <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
                          <CardContent className="p-6">
                            <FourTransformationsPanel chartData={chartData} />
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </motion.div>
                  )}

                  {activeTab === 'ask-seer' && (
                    <motion.div
                      key="ask-seer"
                      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                      transition={motionConfig}
                    >
                      <TabsContent value="ask-seer" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
                        <ZiWeiSeerChatInterface
                          chartData={chartData}
                          report={report}
                          userId={user?.uid}
                        />
                      </TabsContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Tabs>
              </div>
            </motion.div>
          )}

          {/* Profile Incomplete Message */}
          {!hasCompleteDetails && !chartData && !isLoading && (
            <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
              <CardContent className="p-12 text-center">
                <Sparkles className="w-16 h-16 text-purple-700 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-purple-900 mb-3">Complete Your Profile</h3>
                <p className="text-slate-700 text-lg mb-4">
                  To generate your personalized Zi Wei Dou Shu report, please complete your profile with:
                </p>
                <ul className="text-slate-700 text-sm space-y-2 mb-6">
                  {!userProfile?.birthDate && <li>• Birth Date</li>}
                  {!userProfile?.birthTime && <li>• Birth Time</li>}
                  {!userProfile?.birthPlace && <li>• Birth Place</li>}
                </ul>
                <Button
                  onClick={() => router.push('/profile')}
                  variant="filled"
                  className="font-semibold"
                >
                  Go to Profile Settings
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Information Cards - Only show if profile is incomplete and no chart */}
          {!hasCompleteDetails && !chartData && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Card elevation={1} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-purple-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-700" />
                    About Zi Wei Dou Shu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 text-sm">
                    Zi Wei Dou Shu (Purple Star Astrology) is a traditional Chinese astrological system 
                    that uses the positions of 14 main stars and 108 supporting stars to analyze 
                    personality, fortune, and life events.
                  </p>
                </CardContent>
              </Card>

              <Card elevation={1} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-purple-900 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-purple-700" />
                    The 12 Palaces
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 text-sm">
                    Each of the 12 palaces represents different aspects of life: personality, family, 
                    career, wealth, relationships, health, and more. The stars in each palace 
                    influence these life areas.
                  </p>
                </CardContent>
              </Card>

              <Card elevation={1} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-purple-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-700" />
                    Four Pillars
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 text-sm">
                    The Four Pillars (Ba Zi) represent your birth year, month, day, and hour. 
                    Each pillar contains a heavenly stem and earthly branch that determine 
                    your elemental balance and characteristics.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </div>
    </ToolReportGuard>
  )
}
