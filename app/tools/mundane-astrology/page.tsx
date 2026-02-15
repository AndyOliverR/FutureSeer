"use client"

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { useToolReport } from '@/hooks/useComprehensiveMysticalProfile'
import { ToolReportGuard } from '@/components/ToolReportGuard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { universalOccultService, BirthData } from '@/lib/universalOccultService'
import {
  Globe,
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Brain,
  Gem,
  MessageCircle,
  Eye,
  Target,
  Activity,
  Timer,
  TrendingUp,
  Users,
  Sparkles,
  Moon,
  Star,
  ArrowUp
} from 'lucide-react'
import { MundaneSeerChat } from '@/components/mundane/MundaneSeerChat'

export default function MundaneAstrologyPage() {
  const { userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'sectors' | 'cycles' | 'eclipses' | 'timeline' | 'analysis' | 'ask-seer'>('overview')
  const { report: pipelineReport, loading: isLoading, error } = useToolReport('mundaneAstrology')
  const analysis = useMemo(() => {
    if (!pipelineReport || typeof pipelineReport !== 'object') return null
    const r = pipelineReport as Record<string, unknown>
    if (r.placeholder === true) return null
    return (r.data ?? r) as any
  }, [pipelineReport])

  const hasCompleteDetails = Boolean(userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace)

  if (!hasCompleteDetails) {
    return (
      <div className="relative min-h-screen starfield-ultra-sharp">
        <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
          <div className="text-center py-16">
            <Globe className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-3xl font-serif font-semibold mb-4">
              <span className="text-amber-500">🌍</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Mundane Astrology</span>
            </h1>
            <p className="text-slate-200 mb-8 leading-relaxed">Complete your profile to unlock your mundane astrology insights</p>
            <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
              <Link href="/profile">Complete Profile</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ToolReportGuard loading={isLoading} error={error ?? null} toolLabel="mundane astrology">
    <div className="relative min-h-screen starfield-ultra-sharp">
      <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-semibold mb-6">
              <span className="text-amber-500">🌍</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Mundane Astrology</span>
            </h1>
            <p className="text-slate-200 text-lg sm:text-xl leading-relaxed">World events and global astrological influences</p>
          </motion.div>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full min-w-0">
          <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
            {[
              { value: 'overview', label: 'Overview' },
              { value: 'sectors', label: 'Sectors' },
              { value: 'cycles', label: 'Cycles' },
              { value: 'eclipses', label: 'Eclipses' },
              { value: 'timeline', label: 'Timeline' },
              { value: 'analysis', label: 'Analysis' },
              { value: 'ask-seer', label: 'Ask the Seer' }
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="shrink-0 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-t-lg rounded-b-none px-2 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800/30 data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 transition-all"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab - Daily National Outlook */}
          <TabsContent value="overview" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            <div className="mb-6 p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-lg">
              <p className="text-sm text-slate-700 text-center leading-relaxed">
                <strong className="text-amber-800">Disclaimer:</strong> Mundane astrology analysis is provided for educational and research purposes. Charts are based on publicly available founding dates. Astrological correlations do not guarantee specific outcomes and should be considered alongside geopolitical, economic, and social analysis.
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-12 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-amber-400 border-t-transparent mx-auto mb-4" />
                <p className="text-slate-700">🌍 FutureSeer is analyzing your mundane astrology chart...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 rounded-2xl bg-gradient-to-br from-red-50 to-amber-50 border-2 border-amber-200 shadow-lg">
                <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <p className="text-slate-700 mb-4">{error}</p>
                <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl">
              <Link href="/profile">Generate your mystical profile</Link>
            </Button>
              </div>
            ) : analysis?.data?.dailyOutlook && Array.isArray(analysis.data.dailyOutlook) && analysis.data.dailyOutlook.length > 0 ? (
              <div className="space-y-8">
                {analysis.data.dailyOutlook.map((outlook: any, dayIndex: number) => {
                  const dayLabels = ['Today', 'Tomorrow', 'Day After Tomorrow']
                  const isToday = dayIndex === 0
                  
                  return (
                    <motion.div
                      key={dayIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: dayIndex * 0.1 }}
                    >
                      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-lg overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100 border-b border-amber-200">
                          <CardTitle className="flex items-center justify-between text-amber-900">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-amber-700" />
                              {dayLabels[dayIndex]} - {new Date(outlook.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            {isToday && (
                              <Badge className="bg-amber-100 text-amber-900 border border-amber-300">
                                Current
                              </Badge>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                          <div className="p-4 bg-white/60 border border-amber-200 rounded-xl">
                            <h3 className="text-lg font-semibold text-amber-900 mb-3 flex items-center gap-2">
                              <Globe className="w-5 h-5 text-amber-700" />
                              1️⃣ Global Pulse
                            </h3>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-slate-600">Emotional climate: </span>
                                <span className="text-slate-900 font-medium">{outlook.globalPulse?.emotionalClimate || 'Unknown'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-600">Stress–Ease Index: </span>
                                <div className="flex gap-1">
                                  {[0, 1, 2, 3, 4].map((i) => (
                                    <div
                                      key={i}
                                      className={`w-3 h-3 rounded-full ${
                                        i < Math.round(outlook.globalPulse?.stressEaseIndex || 0)
                                          ? 'bg-amber-500'
                                          : 'bg-amber-200'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-slate-900">({(outlook.globalPulse?.stressEaseIndex || 0).toFixed(1)}/5)</span>
                              </div>
                              <div>
                                <span className="text-slate-600">Dominant tide: </span>
                                <span className="text-slate-900 font-medium">{outlook.globalPulse?.dominantTide?.aspect || 'Unknown'}</span>
                                <span className="text-slate-600"> → </span>
                                <span className="text-slate-700">{outlook.globalPulse?.dominantTide?.interpretation || 'Cosmic forces in motion'}</span>
                              </div>
                              <div className="mt-2 pt-2 border-t border-amber-200">
                                <span className="text-slate-700">→ {outlook.globalPulse?.globalStoryline || 'Global events unfold with cosmic timing'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-white/60 border border-amber-200 rounded-xl">
                            <h3 className="text-lg font-semibold text-amber-900 mb-3 flex items-center gap-2">
                              <Star className="w-5 h-5 text-amber-700" />
                              2️⃣ {analysis?.data?.country || 'India'} National Mood
                            </h3>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-slate-600">Public sentiment: </span>
                                <span className="text-slate-900 font-medium">{outlook.nationalMood?.publicSentiment || 'neutral'}</span>
                              </div>
                              <div>
                                <span className="text-slate-600">Authority vibe: </span>
                                <span className="text-slate-900 font-medium">{outlook.nationalMood?.authorityVibe || 'stable'}</span>
                              </div>
                              <div>
                                <span className="text-slate-600">Economy feel: </span>
                                <span className="text-slate-900 font-medium">{outlook.nationalMood?.economyFeel || '→'}</span>
                              </div>
                              <div>
                                <span className="text-slate-600">Most felt factor: </span>
                                <span className="text-slate-700">{outlook.nationalMood?.mostFeltFactor || 'general economic pressures'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-white/60 border border-amber-200 rounded-xl">
                            <h3 className="text-lg font-semibold text-amber-900 mb-3 flex items-center gap-2">
                              <MapPin className="w-5 h-5 text-amber-700" />
                              3️⃣ Your Local Environment
                            </h3>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-slate-600">Atmosphere: </span>
                                <span className="text-slate-900 font-medium">{outlook.localEnvironment?.atmosphere || 'neutral'}</span>
                              </div>
                              <div>
                                <span className="text-slate-600">Social interaction: </span>
                                <span className="text-slate-900 font-medium">{outlook.localEnvironment?.socialInteraction || 'normal'}</span>
                              </div>
                              <div>
                                <span className="text-slate-600">Friction: </span>
                                <Badge className={
                                  outlook.localEnvironment?.friction === 'low' ? 'bg-green-100 text-green-800 border border-green-300' :
                                  outlook.localEnvironment?.friction === 'high' ? 'bg-red-100 text-red-800 border border-red-300' :
                                  'bg-amber-100 text-amber-900 border border-amber-300'
                                }>
                                  {outlook.localEnvironment?.friction || 'moderate'}
                                </Badge>
                              </div>
                              <div className="mt-2 pt-2 border-t border-amber-200">
                                <span className="text-slate-700">→ {outlook.localEnvironment?.behaviorNote || 'Normal public behavior expected'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-white/60 border border-amber-200 rounded-xl">
                            <h3 className="text-lg font-semibold text-amber-900 mb-3 flex items-center gap-2">
                              <Target className="w-5 h-5 text-amber-700" />
                              4️⃣ Personal Micro-Guidance
                            </h3>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-green-700 font-medium">✓ Best move: </span>
                                <span className="text-slate-900">{outlook.personalGuidance?.bestMove || 'Stay balanced'}</span>
                              </div>
                              <div>
                                <span className="text-red-700 font-medium">⚠ Caution: </span>
                                <span className="text-slate-900">{outlook.personalGuidance?.caution || 'Avoid unnecessary conflict'}</span>
                              </div>
                              {outlook.personalGuidance?.energyWindow && (
                                <div>
                                  <span className="text-amber-800 font-medium">⏰ Energy window: </span>
                                  <span className="text-slate-900">{outlook.personalGuidance.energyWindow}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="p-4 bg-white/60 border border-amber-200 rounded-xl">
                            <h3 className="text-lg font-semibold text-amber-900 mb-3 flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-amber-700" />
                              5️⃣ Archetypal Force of the Day
                            </h3>
                            <p className="text-slate-800 text-lg italic font-medium">
                              &ldquo;{outlook.archetypalForce || 'Cosmic forces are in motion'}&rdquo;
                            </p>
                          </div>

                          <div className="p-4 bg-gradient-to-br from-amber-100 to-yellow-100 border-2 border-amber-300 rounded-xl">
                            <h3 className="text-lg font-semibold text-amber-900 mb-3 flex items-center gap-2">
                              <Gem className="w-5 h-5 text-amber-700" />
                              6️⃣ One-Line Fate Summary
                            </h3>
                            <p className="text-amber-900 text-xl font-bold">
                              {outlook.fateSummary || 'The day unfolds as the cosmos directs'}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg">
                <Info className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <p className="text-slate-700 mb-4">No mundane astrology data available. Please complete your profile.</p>
                <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl">
              <Link href="/profile">Generate your mystical profile</Link>
            </Button>
              </div>
            )}
          </TabsContent>

          {/* Sectors Tab */}
          <TabsContent value="sectors" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            {analysis?.data?.sectorForecasts && Array.isArray(analysis.data.sectorForecasts) && analysis.data.sectorForecasts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysis.data.sectorForecasts.map((sector: any, index: number) => (
                  <Card key={index} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100 border-b border-amber-200">
                      <CardTitle className="flex items-center justify-between text-amber-900">
                        <span className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-amber-700" />
                          {sector.sector}
                        </span>
                        <Badge className="bg-amber-100 text-amber-900 border border-amber-300">
                          {sector.house}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 text-sm">Confidence</span>
                          <Badge className="bg-amber-100 text-amber-900 border border-amber-300">
                            {sector.confidence}%
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-700">
                          <strong className="text-slate-900">Forecast:</strong> {sector.forecast}
                        </div>
                        <div className="text-xs text-slate-600">
                          <strong className="text-slate-700">Timeframe:</strong> {sector.timeframe}
                        </div>
                        {sector.currentInfluences && (
                          <div className="mt-3 pt-3 border-t border-amber-200">
                            <p className="text-xs text-slate-600 mb-2">Current Influences:</p>
                            <div className="flex flex-wrap gap-1">
                              {sector.currentInfluences.map((influence: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs border-amber-300 text-slate-700 bg-amber-50">
                                  {influence}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg">
                <Info className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <p className="text-slate-700">Sector forecast data not available.</p>
              </div>
            )}
          </TabsContent>

          {/* Cycles Tab */}
          <TabsContent value="cycles" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            {analysis?.data?.planetaryCycles && Array.isArray(analysis.data.planetaryCycles) && analysis.data.planetaryCycles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysis.data.planetaryCycles.map((cycle: any, index: number) => (
                  <Card key={index} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100 border-b border-amber-200">
                      <CardTitle className="flex items-center gap-2 text-amber-900">
                        <RefreshCw className="w-5 h-5 text-amber-700" />
                        {cycle.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 text-sm">Duration</span>
                          <Badge variant="outline" className="text-amber-800 border-amber-400 bg-amber-50">
                            {cycle.duration}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 text-sm">Current Phase</span>
                          <span className="text-slate-900 font-semibold">{cycle.currentPhase}</span>
                        </div>
                        {cycle.currentSign && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600 text-sm">Current Sign</span>
                            <Badge className="bg-amber-100 text-amber-900 border border-amber-300">
                              {cycle.currentSign}
                            </Badge>
                          </div>
                        )}
                        <div className="mt-4 pt-4 border-t border-amber-200">
                          <p className="text-sm text-slate-700 mb-2"><strong className="text-slate-900">Mundane Significance:</strong></p>
                          <p className="text-sm text-slate-600">{cycle.mundaneSignificance}</p>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm text-slate-700 mb-2"><strong className="text-slate-900">Current Phase:</strong></p>
                          <p className="text-sm text-slate-600">{cycle.phase}</p>
                        </div>
                        {cycle.historicalContext && (
                          <div className="mt-3">
                            <p className="text-sm text-slate-700 mb-2"><strong className="text-slate-900">Historical Context:</strong></p>
                            <p className="text-sm text-slate-600">{cycle.historicalContext}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg">
                <Info className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <p className="text-slate-700">Planetary cycle data not available.</p>
              </div>
            )}
          </TabsContent>

          {/* Eclipses Tab */}
          <TabsContent value="eclipses" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            {analysis?.data?.eclipseCharts && Array.isArray(analysis.data.eclipseCharts) && analysis.data.eclipseCharts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysis.data.eclipseCharts.map((eclipse: any, index: number) => (
                  <Card key={index} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100 border-b border-amber-200">
                      <CardTitle className="flex items-center gap-2 text-amber-900">
                        <Moon className="w-5 h-5 text-amber-700" />
                        {eclipse.type}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 text-sm">Date</span>
                          <span className="text-slate-900 font-semibold">{new Date(eclipse.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 text-sm">Sign & Degree</span>
                          <Badge className="bg-amber-100 text-amber-900 border border-amber-300">
                            {eclipse.sign} {eclipse.degree}°
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 text-sm">Visibility</span>
                          <Badge variant="outline" className="text-amber-800 border-amber-400 bg-amber-50">
                            {eclipse.visibility}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 text-sm">Path</span>
                          <span className="text-slate-900 text-sm">{eclipse.path}</span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-amber-200">
                          <p className="text-sm text-slate-700 mb-2"><strong className="text-slate-900">Mundane Impact:</strong></p>
                          <p className="text-sm text-slate-600">{eclipse.mundaneImpact}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg">
                <Info className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <p className="text-slate-700">Eclipse data not available.</p>
              </div>
            )}
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            {analysis?.data?.riskTimelines && Array.isArray(analysis.data.riskTimelines) && analysis.data.riskTimelines.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis.data.riskTimelines.map((timeline: any, index: number) => (
                  <Card
                    key={index}
                    className={`bg-gradient-to-br from-amber-50 to-yellow-50 border-2 rounded-2xl shadow-lg overflow-hidden ${
                      timeline.riskLevel === 'High' ? 'border-red-300' :
                      timeline.riskLevel === 'Low' ? 'border-green-300' :
                      'border-amber-200'
                    }`}
                  >
                    <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100 border-b border-amber-200">
                      <CardTitle className="text-amber-900 mb-3">
                        <span className="flex items-center gap-2 mb-3">
                          <Calendar className="w-5 h-5 text-amber-700" />
                          {timeline.month}
                        </span>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge className={
                            timeline.riskLevel === 'High' ? 'bg-red-100 text-red-800 border border-red-300' :
                            timeline.riskLevel === 'Low' ? 'bg-green-100 text-green-800 border border-green-300' :
                            'bg-amber-100 text-amber-900 border border-amber-300'
                          }>
                            <span className="text-xs font-normal mr-1">Risk:</span>
                            <span className="font-semibold">{timeline.riskLevel}</span>
                          </Badge>
                          <Badge className={
                            timeline.opportunityLevel === 'High' ? 'bg-green-100 text-green-800 border border-green-300' :
                            timeline.opportunityLevel === 'Low' ? 'bg-red-100 text-red-800 border border-red-300' :
                            'bg-amber-100 text-amber-900 border border-amber-300'
                          }>
                            <span className="text-xs font-normal mr-1">Opportunity:</span>
                            <span className="font-semibold">{timeline.opportunityLevel}</span>
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="text-sm text-slate-700">
                          {timeline.description}
                        </div>
                        {timeline.astrologicalFactors && timeline.astrologicalFactors.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-amber-200">
                            <p className="text-xs text-slate-600 mb-2">Astrological Factors:</p>
                            <ul className="text-xs text-slate-600 space-y-1">
                              {timeline.astrologicalFactors.map((factor: string, i: number) => (
                                <li key={i}>• {factor}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg">
                <Info className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <p className="text-slate-700">Timeline data not available.</p>
              </div>
            )}
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            {analysis?.data?.analysis ? (
              <div className="space-y-8">
                {analysis.data.analysis.overview && (
                  <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100 border-b border-amber-200">
                      <CardTitle className="flex items-center gap-2 text-amber-900">
                        <Brain className="w-5 h-5 text-amber-700" />
                        Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      {analysis.data.analysis.overview.summary && (
                        <p className="text-slate-700 text-sm leading-relaxed">
                          {analysis.data.analysis.overview.summary}
                        </p>
                      )}
                      {analysis.data.analysis.overview.keyThemes && Array.isArray(analysis.data.analysis.overview.keyThemes) && analysis.data.analysis.overview.keyThemes.length > 0 && (
                        <div>
                          <p className="text-xs text-slate-600 mb-2">Key Themes:</p>
                          <div className="flex flex-wrap gap-2">
                            {analysis.data.analysis.overview.keyThemes.map((theme: string, index: number) => (
                              <Badge key={index} className="bg-amber-100 text-amber-900 border border-amber-300">
                                {theme}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {analysis.data.analysis.overview.majorInfluences && Array.isArray(analysis.data.analysis.overview.majorInfluences) && analysis.data.analysis.overview.majorInfluences.length > 0 && (
                        <div>
                          <p className="text-xs text-slate-600 mb-2">Major Influences:</p>
                          <div className="flex flex-wrap gap-2">
                            {analysis.data.analysis.overview.majorInfluences.map((influence: string, index: number) => (
                              <Badge key={index} className="bg-purple-100 text-purple-800 border border-purple-300">
                                {influence}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {analysis.data.analysis.overview.overallOutlook && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-600">Overall Outlook:</span>
                          <Badge className={
                            analysis.data.analysis.overview.overallOutlook === 'positive' ? 'bg-green-100 text-green-800 border border-green-300' :
                            analysis.data.analysis.overview.overallOutlook === 'challenging' ? 'bg-red-100 text-red-800 border border-red-300' :
                            'bg-amber-100 text-amber-900 border border-amber-300'
                          }>
                            {analysis.data.analysis.overview.overallOutlook.charAt(0).toUpperCase() + analysis.data.analysis.overview.overallOutlook.slice(1)}
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {analysis.data.analysis.events && Array.isArray(analysis.data.analysis.events) && analysis.data.analysis.events.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-amber-700" />
                      World Events
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysis.data.analysis.events.map((event: any, index: number) => (
                        <Card key={index} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-lg overflow-hidden">
                          <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100 border-b border-amber-200">
                            <CardTitle className="text-amber-900 text-base">{event.title || `Event ${index + 1}`}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 pt-6">
                            <p className="text-sm text-slate-700">{event.description}</p>
                            {event.timing && (
                              <div className="flex items-center gap-2 text-xs text-slate-600">
                                <Clock className="w-4 h-4 text-amber-700" />
                                <span>Timing: {event.timing}</span>
                              </div>
                            )}
                            {event.impact && (
                              <Badge className={
                                event.impact === 'major' ? 'bg-red-100 text-red-800 border border-red-300' :
                                event.impact === 'moderate' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                                'bg-green-100 text-green-800 border border-green-300'
                              }>
                                Impact: {event.impact}
                              </Badge>
                            )}
                            {event.affectedAreas && Array.isArray(event.affectedAreas) && event.affectedAreas.length > 0 && (
                              <div>
                                <p className="text-xs text-slate-600 mb-1">Affected Areas:</p>
                                <div className="flex flex-wrap gap-1">
                                  {event.affectedAreas.map((area: string, i: number) => (
                                    <Badge key={i} variant="outline" className="text-xs border-amber-300 text-slate-700 bg-amber-50">
                                      {area}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {event.astrologicalFactors && Array.isArray(event.astrologicalFactors) && event.astrologicalFactors.length > 0 && (
                              <div className="pt-2 border-t border-amber-200">
                                <p className="text-xs text-slate-600 mb-1">Astrological Factors:</p>
                                <ul className="text-xs text-slate-600 space-y-1">
                                  {event.astrologicalFactors.map((factor: string, i: number) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <Star className="w-3 h-3 mt-0.5 text-amber-600 flex-shrink-0" />
                                      {factor}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.data.analysis.trends && Array.isArray(analysis.data.analysis.trends) && analysis.data.analysis.trends.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-amber-700" />
                      Global Trends
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysis.data.analysis.trends.map((trend: any, index: number) => (
                        <Card key={index} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-lg overflow-hidden">
                          <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100 border-b border-amber-200">
                            <CardTitle className="text-amber-900 text-base">{trend.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 pt-6">
                            <p className="text-sm text-slate-700">{trend.description}</p>
                            {trend.duration && (
                              <div className="flex items-center gap-2 text-xs text-slate-600">
                                <Timer className="w-4 h-4 text-amber-700" />
                                <span>Duration: {trend.duration}</span>
                              </div>
                            )}
                            {trend.intensity && (
                              <Badge className={
                                trend.intensity === 'strong' ? 'bg-red-100 text-red-800 border border-red-300' :
                                trend.intensity === 'moderate' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                                'bg-green-100 text-green-800 border border-green-300'
                              }>
                                Intensity: {trend.intensity}
                              </Badge>
                            )}
                            {trend.affectedSectors && Array.isArray(trend.affectedSectors) && trend.affectedSectors.length > 0 && (
                              <div>
                                <p className="text-xs text-slate-600 mb-1">Affected Sectors:</p>
                                <div className="flex flex-wrap gap-1">
                                  {trend.affectedSectors.map((sector: string, i: number) => (
                                    <Badge key={i} variant="outline" className="text-xs border-amber-300 text-slate-700 bg-amber-50">
                                      {sector}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {trend.astrologicalIndicators && Array.isArray(trend.astrologicalIndicators) && trend.astrologicalIndicators.length > 0 && (
                              <div className="pt-2 border-t border-amber-200">
                                <p className="text-xs text-slate-600 mb-1">Astrological Indicators:</p>
                                <ul className="text-xs text-slate-600 space-y-1">
                                  {trend.astrologicalIndicators.map((indicator: string, i: number) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <Star className="w-3 h-3 mt-0.5 text-amber-600 flex-shrink-0" />
                                      {indicator}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.data.analysis.predictions && Array.isArray(analysis.data.analysis.predictions) && analysis.data.analysis.predictions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-amber-700" />
                      Predictions
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {analysis.data.analysis.predictions.map((prediction: any, index: number) => (
                        <Card key={index} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-lg overflow-hidden">
                          <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100 border-b border-amber-200">
                            <CardTitle className="flex items-center justify-between text-amber-900 text-base">
                              <span>{prediction.timeframe || `Prediction ${index + 1}`}</span>
                              {prediction.confidence && (
                                <Badge className="bg-blue-100 text-blue-800 border border-blue-300">
                                  {prediction.confidence}% confidence
                                </Badge>
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 pt-6">
                            <p className="text-sm text-slate-700">{prediction.prediction}</p>
                            {prediction.astrologicalBasis && Array.isArray(prediction.astrologicalBasis) && prediction.astrologicalBasis.length > 0 && (
                              <div>
                                <p className="text-xs text-slate-600 mb-1">Astrological Basis:</p>
                                <div className="flex flex-wrap gap-1">
                                  {prediction.astrologicalBasis.map((basis: string, i: number) => (
                                    <Badge key={i} className="bg-purple-100 text-purple-800 border border-purple-300">
                                      {basis}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {prediction.potentialOutcomes && Array.isArray(prediction.potentialOutcomes) && prediction.potentialOutcomes.length > 0 && (
                              <div className="pt-2 border-t border-amber-200">
                                <p className="text-xs text-slate-600 mb-2">Potential Outcomes:</p>
                                <ul className="text-xs text-slate-600 space-y-1">
                                  {prediction.potentialOutcomes.map((outcome: string, i: number) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <ArrowUp className="w-3 h-3 mt-0.5 text-amber-600 flex-shrink-0" />
                                      {outcome}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.data.analysis.cycles && Array.isArray(analysis.data.analysis.cycles) && analysis.data.analysis.cycles.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-amber-700" />
                      Astrological Cycles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysis.data.analysis.cycles.map((cycle: any, index: number) => (
                        <Card key={index} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-lg overflow-hidden">
                          <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100 border-b border-amber-200">
                            <CardTitle className="flex items-center justify-between text-amber-900 text-base">
                              <span>{cycle.name}</span>
                              {cycle.currentPhase && (
                                <Badge className="bg-green-100 text-green-800 border border-green-300">
                                  {cycle.currentPhase}
                                </Badge>
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 pt-6">
                            <p className="text-sm text-slate-700">{cycle.description}</p>
                            {cycle.influence && (
                              <div>
                                <p className="text-xs text-slate-600 mb-1">Influence:</p>
                                <p className="text-sm text-slate-700">{cycle.influence}</p>
                              </div>
                            )}
                            {cycle.duration && (
                              <div className="flex items-center gap-2 text-xs text-slate-600">
                                <Clock className="w-4 h-4 text-amber-700" />
                                <span>{cycle.duration}</span>
                              </div>
                            )}
                            {cycle.historicalContext && (
                              <div className="pt-2 border-t border-amber-200">
                                <p className="text-xs text-slate-600 mb-1">Historical Context:</p>
                                <p className="text-xs text-slate-600 italic">{cycle.historicalContext}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.data.analysis.advice && (
                  <div>
                    <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-amber-700" />
                      Guidance & Advice
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(analysis.data.analysis.advice).map(([category, adviceList]: [string, any]) => {
                        if (!Array.isArray(adviceList) || adviceList.length === 0) return null
                        return (
                          <Card key={category} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-lg overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100 border-b border-amber-200">
                              <CardTitle className="text-amber-900 text-base capitalize">{category}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                              <ul className="space-y-2">
                                {adviceList.map((advice: string, index: number) => (
                                  <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle className="w-4 h-4 mt-0.5 text-amber-600 flex-shrink-0" />
                                    <span>{advice}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg">
                <Brain className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <p className="text-slate-700 mb-4">No analysis data available. Please generate your mundane astrology analysis first.</p>
                <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl">
              <Link href="/profile">Generate your mystical profile</Link>
            </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ask-seer" className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
            {analysis?.data ? (
              <MundaneSeerChat userProfile={userProfile} analysis={analysis} />
            ) : (
              <div className="text-center py-12 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg">
                <MessageCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <p className="text-slate-700 mb-4">Please generate your mundane astrology analysis first.</p>
                <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl">
              <Link href="/profile">Generate your mystical profile</Link>
            </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
    </ToolReportGuard>
  )
} 