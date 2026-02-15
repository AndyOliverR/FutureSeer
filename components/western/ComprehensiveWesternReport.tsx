"use client"

import { useState, useEffect, useMemo } from 'react'
import { devLog } from '@/lib/devLogger';
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import DualChartDisplay from '@/components/western/DualChartDisplay'
import { DevotionistStyleCard } from '@/components/western/DevotionistStyleCard'
import { VisualTimeline } from '@/components/western/VisualTimeline'
import { PlanetIcon, ZodiacIcon, NumberIcon } from '@/components/icons/AstrologyIcon'
import { 
  parsePlanetaryAnalysis, 
  simplifyAspectDescription,
  extractKeyInsights,
  createTimelineFromTransits,
  textToBulletPoints
} from '@/lib/utils/devotionistFormatter'
import { 
  Sun,
  Moon,
  ArrowUp,
  Star,
  Loader2,
  RefreshCw,
  AlertCircle,
  Home,
  Briefcase,
  Heart,
  Users,
  Target,
  Sparkles,
  Zap,
  Calendar,
  TrendingUp,
  Eye,
  Activity
} from 'lucide-react'

interface ComprehensiveWesternReportProps {
  userId?: string
  chartData?: any
  userProfile?: any
  cachedReport?: ComprehensiveAnalysis | null
  isLoadingReport?: boolean
}

interface ComprehensiveAnalysis {
  chartOverview: string
  planetaryAnalysis: Array<{ planet: string; analysis: string }>
  houseAnalysis: Array<{ house: number; analysis: string }>
  aspectAnalysis: Array<{ aspect: string; analysis: string }>
  transitAnalysis: string
  predictiveInsights: {
    todaysQuickWin: string
    currentWeek: string
    currentMonth: string
    currentYear: string
    nextYearSneakPeek: string
    longerTermCycles: string
  } | string // Support both old (string) and new (object) formats
}

// Helper function to get planet icon - now uses AstrologyIcon with fallback
function getPlanetIcon(planetName: string) {
  return <PlanetIcon planet={planetName} size={20} className="w-5 h-5" />
}

// Helper function to get planet color scheme
function getPlanetColorScheme(planetName: string): 'amber' | 'blue' | 'purple' | 'pink' | 'green' | 'orange' | 'cyan' {
  const name = planetName.toLowerCase()
  if (name.includes('sun')) return 'amber'
  if (name.includes('moon')) return 'blue'
  if (name.includes('mercury')) return 'cyan'
  if (name.includes('venus')) return 'pink'
  if (name.includes('mars')) return 'orange'
  if (name.includes('jupiter')) return 'purple'
  if (name.includes('saturn')) return 'purple'
  if (name.includes('uranus')) return 'cyan'
  if (name.includes('neptune')) return 'blue'
  if (name.includes('pluto')) return 'purple'
  return 'amber'
}

export default function ComprehensiveWesternReport({ 
  userId,
  chartData,
  userProfile,
  cachedReport,
  isLoadingReport = false
}: ComprehensiveWesternReportProps) {
  // Use cached report if available, otherwise use local state
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState<ComprehensiveAnalysis | null>(
    cachedReport || null
  )
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  // Stabilize array dependencies with useMemo to prevent unnecessary re-fetches
  const planets = useMemo(() => chartData?.planets || [], [chartData?.planets])
  const houses = useMemo(() => chartData?.houses || [], [chartData?.houses])
  const aspects = useMemo(() => chartData?.aspects || [], [chartData?.aspects])
  const transits = useMemo(() => chartData?.transits || [], [chartData?.transits])

  // Get Sun, Moon, Rising - memoized to prevent recalculation
  const sun = useMemo(() => planets.find((p: any) => p.name === 'Sun'), [planets])
  const moon = useMemo(() => planets.find((p: any) => p.name === 'Moon'), [planets])
  const rising = useMemo(() => houses[0], [houses]) // Ascendant is typically house 1

  // Update local state when cachedReport prop changes
  useEffect(() => {
    if (cachedReport) {
      setComprehensiveAnalysis(cachedReport)
    }
  }, [cachedReport])

  // Only fetch if we don't have cached data and report isn't being loaded by parent
  useEffect(() => {
    // If parent is loading or we have cached data, don't fetch
    if (isLoadingReport || cachedReport || comprehensiveAnalysis) {
      return
    }

    // Only fetch if we have required data
    if (!userId || !chartData) {
      return
    }

    const fetchComprehensiveAnalysis = async () => {
      setIsLoadingAnalysis(true)
      setAnalysisError(null)

      try {
        const response = await fetch('/api/western-astrology/comprehensive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            chartData: {
              planets,
              houses,
              aspects,
              transits
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
        devLog.error('Error fetching comprehensive analysis:', error, 'ComprehensiveWesternReport')
        const errorMessage = error?.message || 'Failed to generate comprehensive analysis'
        setAnalysisError(errorMessage)
        // Don't fail silently - show user-friendly error
      } finally {
        setIsLoadingAnalysis(false)
      }
    }

    fetchComprehensiveAnalysis()
  }, [userId, chartData, cachedReport, isLoadingReport, comprehensiveAnalysis, planets, houses, aspects, transits, userProfile])

  if (!chartData) {
    return (
      <div className="text-center py-12">
        <Card className="glass-card border-white/10 max-w-md mx-auto text-white">
          <CardContent className="p-8 text-white">
            <Star className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Chart Data Needed</h3>
            <p className="text-slate-200">
              Please ensure your Western astrology chart is loaded to view the comprehensive report.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold gold-glow mb-4">🌟 Comprehensive Western Astrology Report</h2>
        <p className="text-slate-200 leading-relaxed">
          Complete analysis of your Tropical Zodiac birth chart
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 shadow-lg rounded-3xl">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sun className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="text-slate-700 text-sm mb-2">Sun Sign</div>
            <div className="flex items-center justify-center gap-2 mb-2">
              {sun?.sign?.signName || sun?.sign ? (
                <div style={{ filter: 'brightness(0) saturate(100%) invert(75%) sepia(100%) saturate(500%) hue-rotate(25deg) brightness(120%)' }}>
                  <ZodiacIcon sign={sun?.sign?.signName || sun?.sign} size={24} className="" />
                </div>
              ) : null}
              <div className="text-2xl font-bold text-yellow-800">
                {sun?.sign?.signName || sun?.sign || 'Unknown'}
              </div>
            </div>
            <div className="text-xs text-slate-600">House {sun?.house || 'N/A'}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-lg rounded-3xl">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Moon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-slate-700 text-sm mb-2">Moon Sign</div>
            <div className="flex items-center justify-center gap-2 mb-2">
              {moon?.sign?.signName || moon?.sign ? (
                <div style={{ filter: 'brightness(0) saturate(100%) invert(45%) sepia(100%) saturate(500%) hue-rotate(190deg) brightness(110%)' }}>
                  <ZodiacIcon sign={moon?.sign?.signName || moon?.sign} size={24} className="" />
                </div>
              ) : null}
              <div className="text-2xl font-bold text-blue-800">
                {moon?.sign?.signName || moon?.sign || 'Unknown'}
              </div>
            </div>
            <div className="text-xs text-slate-600">House {moon?.house || 'N/A'}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 shadow-lg rounded-3xl">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-purple-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowUp className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-slate-700 text-sm mb-2">Rising Sign</div>
            <div className="flex items-center justify-center gap-2 mb-2">
              {rising?.sign?.signName || rising?.sign ? (
                <div style={{ filter: 'brightness(0) saturate(100%) invert(55%) sepia(100%) saturate(500%) hue-rotate(250deg) brightness(110%)' }}>
                  <ZodiacIcon sign={rising?.sign?.signName || rising?.sign} size={24} className="" />
                </div>
              ) : null}
              <div className="text-2xl font-bold text-purple-800">
                {rising?.sign?.signName || rising?.sign || 'Unknown'}
              </div>
            </div>
            <div className="text-xs text-slate-600">Ascendant</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Visualization */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="glass-card border-white/10 rounded-2xl text-white">
          <CardHeader className="text-white">
            <CardTitle className="flex items-center gap-2 text-white">
              <Eye className="w-5 h-5 text-amber-400" />
              Chart Visualization
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white">
            <DualChartDisplay
              natalPlanets={planets}
              natalHouses={houses}
              natalAspects={aspects}
              transitPlanets={transits}
              transitHouses={houses}
              width={550}
              height={400}
              natalMetadata={{
                eventType: "Natal Chart",
                date: userProfile?.birthDate ? new Date(userProfile.birthDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric',
                  weekday: 'short'
                }) : "Birth Chart",
                time: userProfile?.birthTime || "Unknown",
                timezone: "Local",
                location: userProfile?.birthPlace || "Unknown",
                houseSystem: "Placidus",
                zodiacType: "Tropical"
              }}
              transitMetadata={{
                eventType: "Transit Chart",
                date: new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric',
                  weekday: 'short'
                }),
                time: new Date().toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit'
                }),
                timezone: "Local",
                location: userProfile?.birthPlace || "Unknown",
                houseSystem: "Placidus",
                zodiacType: "Tropical"
              }}
            />
          </CardContent>
        </Card>
      </motion.div>

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
                FutureSeer is analyzing your Western astrology chart with AI insights...
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
                Comprehensive Chart Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full space-y-2">
                {/* Chart Overview */}
                <AccordionItem value="overview" className="border-2 border-amber-200 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 px-4 shadow-sm">
                  <AccordionTrigger className="text-slate-800 hover:text-amber-700 py-4 [&[data-state=open]]:text-amber-700 [&>svg]:text-slate-600">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-amber-600" />
                      <span className="text-left font-semibold">Chart Overview</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <DevotionistStyleCard
                      icon={<Star className="w-6 h-6" />}
                      title="Your Birth Chart at a Glance"
                      summary={(() => {
                        const overview = comprehensiveAnalysis.chartOverview || ''
                        if (overview.length <= 200) return overview
                        const truncated = overview.substring(0, 200)
                        const lastSpace = truncated.lastIndexOf(' ')
                        const lastPeriod = truncated.lastIndexOf('.')
                        const cutPoint = lastSpace > 150 ? lastSpace : (lastPeriod > 150 ? lastPeriod + 1 : 200)
                        return overview.substring(0, cutPoint).trim()
                      })()}
                      items={extractKeyInsights(comprehensiveAnalysis.chartOverview).slice(0, 4).map(insight => ({
                        text: insight.description,
                        highlight: insight.highlight
                      }))}
                      variant="callout"
                      colorScheme="amber"
                      className="mb-4"
                    />
                    {comprehensiveAnalysis.chartOverview && (() => {
                      const overview = comprehensiveAnalysis.chartOverview
                      if (overview.length <= 200) return null
                      const truncated = overview.substring(0, 200)
                      const lastSpace = truncated.lastIndexOf(' ')
                      const lastPeriod = truncated.lastIndexOf('.')
                      const cutPoint = lastSpace > 150 ? lastSpace : (lastPeriod > 150 ? lastPeriod + 1 : 200)
                      const remainder = overview.substring(cutPoint).trim()
                      return remainder ? (
                        <p className="text-slate-700 text-sm leading-relaxed mt-4">
                          {remainder}
                        </p>
                      ) : null
                    })()}
                  </AccordionContent>
                </AccordionItem>

                {/* Planetary Analysis */}
                <AccordionItem value="planets" className="border-2 border-blue-200 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 px-4 shadow-sm">
                  <AccordionTrigger className="text-slate-800 hover:text-blue-700 py-4 [&[data-state=open]]:text-blue-700 [&>svg]:text-slate-600">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <span className="text-left font-semibold">Planetary Analysis</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-4">
                    {comprehensiveAnalysis.planetaryAnalysis.map((planet, index) => {
                      const parsed = parsePlanetaryAnalysis(planet.analysis)
                      const colorScheme = getPlanetColorScheme(planet.planet)
                      
                      return (
                        <DevotionistStyleCard
                          key={index}
                          icon={getPlanetIcon(planet.planet)}
                          title={planet.planet}
                          summary={parsed.summary}
                          items={[
                            ...parsed.keyTraits.map(trait => ({ text: trait, type: 'neutral' as const })),
                            ...parsed.strengths,
                            ...parsed.challenges
                          ]}
                          variant="default"
                          colorScheme={colorScheme}
                        />
                      )
                    })}
                  </AccordionContent>
                </AccordionItem>

                {/* House Analysis */}
                <AccordionItem value="houses" className="border-2 border-purple-200 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 px-4 shadow-sm">
                  <AccordionTrigger className="text-slate-800 hover:text-purple-700 py-4 [&[data-state=open]]:text-purple-700 [&>svg]:text-slate-600">
                    <div className="flex items-center gap-3">
                      <Home className="w-5 h-5 text-purple-600" />
                      <span className="text-left font-semibold">House Analysis</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {comprehensiveAnalysis.houseAnalysis.map((house, index) => {
                        const bulletPoints = textToBulletPoints(house.analysis, 3)
                        const summary = (() => {
                          if (house.analysis.length <= 150) return house.analysis
                          const truncated = house.analysis.substring(0, 150)
                          const lastSpace = truncated.lastIndexOf(' ')
                          const lastPeriod = truncated.lastIndexOf('.')
                          const cutPoint = lastSpace > 100 ? lastSpace : (lastPeriod > 100 ? lastPeriod + 1 : 150)
                          return house.analysis.substring(0, cutPoint).trim() + '...'
                        })()
                        
                        return (
                          <DevotionistStyleCard
                            key={index}
                            icon={<Home className="w-5 h-5" />}
                            title={`House ${house.house}`}
                            summary={summary}
                            items={bulletPoints}
                            variant="default"
                            colorScheme="purple"
                            className="h-full"
                          />
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Aspect Analysis */}
                <AccordionItem value="aspects" className="border-2 border-pink-200 rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 px-4 shadow-sm">
                  <AccordionTrigger className="text-slate-800 hover:text-pink-700 py-4 [&[data-state=open]]:text-pink-700 [&>svg]:text-slate-600">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-pink-600" />
                      <span className="text-left font-semibold">Aspect Analysis</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-3">
                    {comprehensiveAnalysis.aspectAnalysis.map((aspect, index) => {
                      const items = simplifyAspectDescription(aspect.aspect, aspect.analysis)
                      const summary = (() => {
                        if (aspect.analysis.length <= 150) return aspect.analysis
                        const truncated = aspect.analysis.substring(0, 150)
                        const lastSpace = truncated.lastIndexOf(' ')
                        const lastPeriod = truncated.lastIndexOf('.')
                        const cutPoint = lastSpace > 100 ? lastSpace : (lastPeriod > 100 ? lastPeriod + 1 : 150)
                        return aspect.analysis.substring(0, cutPoint).trim() + '...'
                      })()
                      
                      return (
                        <DevotionistStyleCard
                          key={index}
                          icon={<Zap className="w-5 h-5" />}
                          title={aspect.aspect}
                          summary={summary}
                          items={items}
                          variant="default"
                          colorScheme="pink"
                        />
                      )
                    })}
                  </AccordionContent>
                </AccordionItem>

                {/* Transit Analysis */}
                <AccordionItem value="transits" className="border-2 border-green-200 rounded-lg bg-gradient-to-br from-green-50 to-teal-50 px-4 shadow-sm">
                  <AccordionTrigger className="text-slate-800 hover:text-green-700 py-4 [&[data-state=open]]:text-green-700 [&>svg]:text-slate-600">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="text-left font-semibold">Current Transits</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    {/* Try to use timeline if transits are available, otherwise use formatted text */}
                    {transits && transits.length > 0 ? (
                      <VisualTimeline
                        events={createTimelineFromTransits(transits, planets, houses)}
                        colorScheme="green"
                      />
                    ) : (
                      <DevotionistStyleCard
                        icon={<TrendingUp className="w-6 h-6" />}
                        title="Current Astrological Transits"
                        summary={(() => {
                          const transitAnalysis = comprehensiveAnalysis.transitAnalysis || ''
                          if (transitAnalysis.length <= 200) return transitAnalysis
                          const truncated = transitAnalysis.substring(0, 200)
                          const lastSpace = truncated.lastIndexOf(' ')
                          const lastPeriod = truncated.lastIndexOf('.')
                          const cutPoint = lastSpace > 150 ? lastSpace : (lastPeriod > 150 ? lastPeriod + 1 : 200)
                          return transitAnalysis.substring(0, cutPoint).trim()
                        })()}
                        items={textToBulletPoints(comprehensiveAnalysis.transitAnalysis || '', 4)}
                        variant="callout"
                        colorScheme="green"
                      />
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* Predictive Insights */}
                <AccordionItem value="predictive" className="border-2 border-cyan-200 rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 px-4 shadow-sm">
                  <AccordionTrigger className="text-slate-800 hover:text-cyan-700 py-4 [&[data-state=open]]:text-cyan-700 [&>svg]:text-slate-600">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-cyan-600" />
                      <span className="text-left font-semibold">Predictive Insights</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-4">
                    {(() => {
                      const insights = comprehensiveAnalysis.predictiveInsights
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
                            {/* Today's Quick Win - Prominent */}
                            <DevotionistStyleCard
                              icon={<Zap className="w-6 h-6" />}
                              title="Today's Quick Win"
                              summary={structuredInsights.todaysQuickWin || 'Today brings cosmic opportunities aligned with your chart\'s energies.'}
                              variant="callout"
                              colorScheme="amber"
                              className="mb-4"
                            />

                            {/* Time-Based Predictions Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                              {/* Current Week */}
                              <DevotionistStyleCard
                                icon={<Calendar className="w-5 h-5" />}
                                title="Current Week"
                                summary={structuredInsights.currentWeek || 'This week holds potential for meaningful developments.'}
                                items={textToBulletPoints(structuredInsights.currentWeek || '', 2)}
                                variant="default"
                                colorScheme="cyan"
                              />

                              {/* Current Month */}
                              <DevotionistStyleCard
                                icon={<Calendar className="w-5 h-5" />}
                                title="Current Month"
                                summary={structuredInsights.currentMonth || 'The current month presents themes of growth and transformation.'}
                                items={textToBulletPoints(structuredInsights.currentMonth || '', 2)}
                                variant="default"
                                colorScheme="blue"
                              />

                              {/* Current Year */}
                              <DevotionistStyleCard
                                icon={<TrendingUp className="w-5 h-5" />}
                                title={`Current Year (${new Date().getFullYear()})`}
                                summary={structuredInsights.currentYear || `The year ${new Date().getFullYear()} offers significant astrological influences.`}
                                items={textToBulletPoints(structuredInsights.currentYear || '', 2)}
                                variant="default"
                                colorScheme="purple"
                              />

                              {/* Next Year Sneak Peek */}
                              <DevotionistStyleCard
                                icon={<Target className="w-5 h-5" />}
                                title={`Next Year (${new Date().getFullYear() + 1})`}
                                summary={structuredInsights.nextYearSneakPeek || `Next year (${new Date().getFullYear() + 1}) will bring new cycles and opportunities.`}
                                items={textToBulletPoints(structuredInsights.nextYearSneakPeek || '', 2)}
                                variant="default"
                                colorScheme="pink"
                              />
                            </div>

                            {/* Longer-Term Cycles */}
                            <DevotionistStyleCard
                              icon={<Sparkles className="w-5 h-5" />}
                              title="Longer-Term Cycles"
                              summary={structuredInsights.longerTermCycles || 'Solar return, lunar return, and progressions reveal important cycles ahead.'}
                              items={textToBulletPoints(structuredInsights.longerTermCycles || '', 3)}
                              variant="default"
                              colorScheme="purple"
                            />
                          </>
                        )
                      }
                      // Fallback for old string format
                      return (
                        <div className="text-slate-700 leading-relaxed">
                          {typeof insights === 'string' ? insights : 'Predictive insights are being prepared...'}
                        </div>
                      )
                    })()}
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

