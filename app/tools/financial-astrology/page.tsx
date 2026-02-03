"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { universalOccultService, BirthData } from '@/lib/universalOccultService'
import FinancialSeerChatInterface from '@/components/FinancialSeerChatInterface'
import { 
  Calendar,
  AlertTriangle,
  Info,
  Zap,
  BarChart3,
  Activity,
  Timer,
  Moon
} from 'lucide-react'

export default function FinancialAstrologyPage() {
  const { user, userProfile } = useAuth()
  const [analysis, setAnalysis] = useState<any>(null)
  const [natalChart, setNatalChart] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'cycles' | 'predictions' | 'timing' | 'markets' | 'ask-the-seer'>('overview')

  // Check if user has complete birth details
  const hasCompleteDetails = userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace

  // Load Financial Astrology Analysis
  const loadFinancialAnalysis = useCallback(async () => {
    if (!hasCompleteDetails) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const birthData: BirthData = {
        birthDate: userProfile?.birthDate || '',
        birthTime: userProfile?.birthTime || '',
        birthPlace: userProfile?.birthPlace || '',
        latitude: userProfile?.latitude || 40.7128,
        longitude: userProfile?.longitude || -74.0060
      }
      
      const [financialData, westernResult] = await Promise.all([
        universalOccultService.calculateFinancialChart(birthData, {
          includeCycles: true,
          includePredictions: true,
          includeTiming: true,
          includeMarkets: true
        }),
        universalOccultService.calculateWesternChart(birthData, {})
      ])

      setAnalysis(financialData)
      setNatalChart(westernResult?.success ? westernResult.data : null)
    } catch (err) {
      console.error('Financial Astrology: failed to load analysis', err)
      setError('Failed to load Financial Astrology analysis')
    } finally {
      setIsLoading(false)
    }
  }, [hasCompleteDetails, userProfile?.birthDate, userProfile?.birthTime, userProfile?.birthPlace, userProfile?.latitude, userProfile?.longitude])

  useEffect(() => {
    if (!hasCompleteDetails) return
    loadFinancialAnalysis()
  }, [hasCompleteDetails, loadFinancialAnalysis])

  if (!hasCompleteDetails) {
    return (
      <div className="relative min-h-screen starfield-ultra-sharp">
        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-4 pb-12">
          <div className="text-center py-16">
            <h1 className="text-3xl font-serif mb-2">
              <span className="text-amber-400">💰</span>{' '}
              <span className="bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent">Financial Astrology</span>
            </h1>
            <p className="text-slate-300 mb-8">Complete your profile to unlock your financial astrology insights</p>
            <Button 
              onClick={() => window.location.href = '/profile-setup'}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Complete Profile
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen starfield-ultra-sharp">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-12">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-serif mb-2">
              <span className="text-amber-400">💰</span>{' '}
              <span className="bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent">Financial Astrology</span>
            </h1>
            <p className="text-slate-300 text-lg">Investment and wealth astrological guidance</p>
          </motion.div>
        </div>

        {/* Tabs - devotionist styling */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-transparent p-0 gap-2 rounded-none">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800/30 transition-all"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="cycles" 
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800/30 transition-all"
            >
              Cycles
            </TabsTrigger>
            <TabsTrigger 
              value="predictions" 
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800/30 transition-all"
            >
              Predictions
            </TabsTrigger>
            <TabsTrigger 
              value="timing" 
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800/30 transition-all"
            >
              Timing
            </TabsTrigger>
            <TabsTrigger 
              value="markets" 
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800/30 transition-all"
            >
              Markets
            </TabsTrigger>
            <TabsTrigger 
              value="ask-the-seer" 
              className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800/30 transition-all"
            >
              Ask The Seer
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4" />
                <p className="text-slate-300">💰 FutureSeer is analyzing your financial astrology chart...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-300 mb-4">{error}</p>
                <Button onClick={loadFinancialAnalysis} className="bg-amber-500 hover:bg-amber-600 text-white">
                  Try Again
                </Button>
              </div>
            ) : analysis?.data ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Financial Cycles */}
                <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                    <CardTitle className="flex items-center gap-2 text-amber-900">
                      <Activity className="w-5 h-5 text-amber-700" />
                      Financial Cycles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {analysis.data.planetaryCycles?.slice(0, 3).map((cycle: any, index: number) => (
                        <div key={index} className="p-3 bg-white/60 rounded-xl border border-amber-200/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-amber-900">{cycle.name || `Cycle ${index + 1}`}</div>
                              <div className="text-sm text-slate-700">{cycle.description || 'Financial cycle'}</div>
                            </div>
                            <Badge variant="outline" className="text-amber-700 border-amber-400 bg-amber-50">
                              {cycle.currentPhase || 'Active'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Lunar Phases for Trading */}
                <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                    <CardTitle className="flex items-center gap-2 text-amber-900">
                      <Moon className="w-5 h-5 text-amber-700" />
                      Lunar Phases for Trading
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {analysis.data.lunarPhases?.slice(0, 3).map((phase: any, index: number) => (
                        <div key={index} className="p-3 bg-white/60 rounded-xl border border-amber-200/50">
                          <div className="font-medium text-amber-900">{phase.name || `Phase ${index + 1}`}</div>
                          <div className="text-sm text-slate-700">{phase.tradingAdvice || 'Trading guidance'}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Aspects */}
                <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                    <CardTitle className="flex items-center gap-2 text-amber-900">
                      <Zap className="w-5 h-5 text-amber-700" />
                      Financial Aspects
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {analysis.data.aspects?.slice(0, 3).map((aspect: any, index: number) => (
                        <div key={index} className="p-3 bg-white/60 rounded-xl border border-amber-200/50">
                          <div className="font-medium text-amber-900">{aspect.type || `Aspect ${index + 1}`}</div>
                          <div className="text-sm text-slate-700">{aspect.financialImplication || 'Financial influence'}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Market Predictions */}
                <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                    <CardTitle className="flex items-center gap-2 text-amber-900">
                      <BarChart3 className="w-5 h-5 text-amber-700" />
                      Market Predictions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {analysis.data.predictions?.slice(0, 3).map((prediction: any, index: number) => (
                        <div key={index} className="p-3 bg-white/60 rounded-xl border border-amber-200/50">
                          <div className="font-medium text-amber-900">{prediction.timeframe || `Market ${index + 1}`}</div>
                          <div className="text-sm text-slate-700">{prediction.forecast || 'Market forecast'}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-300 mb-4">No financial astrology data available. Please complete your profile.</p>
                <Button onClick={loadFinancialAnalysis} className="bg-amber-500 hover:bg-amber-600 text-white">
                  Generate Analysis
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Cycles Tab */}
          <TabsContent value="cycles" className="space-y-6 mt-6">
            {analysis?.data?.planetaryCycles ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analysis.data.planetaryCycles.map((cycle: any, index: number) => (
                  <Card key={index} className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                      <CardTitle className="flex items-center gap-2 text-amber-900">
                        <Activity className="w-5 h-5 text-amber-700" />
                        {cycle.name || `Cycle ${index + 1}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="text-sm text-slate-700">
                          {cycle.description || 'Financial cycle description'}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 text-sm">Phase:</span>
                          <Badge variant="outline" className="text-amber-700 border-amber-400 bg-amber-50 text-xs">
                            {cycle.currentPhase || 'Active'}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-600">
                          Period: {cycle.period || 'Unknown'}
                        </div>
                        <div className="text-xs text-slate-600">
                          Next Peak: {cycle.nextPeak ? new Date(cycle.nextPeak).toLocaleDateString() : 'Unknown'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-300">No financial cycle data available.</p>
              </div>
            )}
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6 mt-6">
            {analysis?.data?.predictions ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysis.data.predictions.map((prediction: any, index: number) => (
                  <Card key={index} className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                      <CardTitle className="flex items-center gap-2 text-amber-900">
                        <BarChart3 className="w-5 h-5 text-amber-700" />
                        {prediction.timeframe ? `${prediction.timeframe} Outlook` : `Market ${index + 1}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="text-sm text-slate-700">
                          {prediction.forecast || 'Market forecast description'}
                        </div>
                        <div className="text-xs text-slate-600">
                          Timeframe: {prediction.timeframe || 'Unknown'}
                        </div>
                        <div className="text-xs text-slate-600">
                          Confidence: {prediction.confidence || '50'}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-300">No prediction data available.</p>
              </div>
            )}
          </TabsContent>

          {/* Timing Tab */}
          <TabsContent value="timing" className="space-y-6 mt-6">
            {analysis?.data?.timing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Optimal Entry Periods */}
                {analysis.data.timing.optimalEntry && analysis.data.timing.optimalEntry.length > 0 && (
                  <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                      <CardTitle className="flex items-center gap-2 text-amber-900">
                        <Timer className="w-5 h-5 text-amber-700" />
                        Optimal Entry Periods
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        {analysis.data.timing.optimalEntry.map((period: string, index: number) => (
                          <div key={index} className="text-sm text-slate-700">
                            • {period}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Optimal Exit Periods */}
                {analysis.data.timing.optimalExit && analysis.data.timing.optimalExit.length > 0 && (
                  <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                      <CardTitle className="flex items-center gap-2 text-amber-900">
                        <Timer className="w-5 h-5 text-amber-700" />
                        Optimal Exit Periods
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        {analysis.data.timing.optimalExit.map((period: string, index: number) => (
                          <div key={index} className="text-sm text-slate-700">
                            • {period}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Avoid Periods */}
                {analysis.data.timing.avoidPeriods && analysis.data.timing.avoidPeriods.length > 0 && (
                  <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-orange-100 to-amber-100">
                      <CardTitle className="flex items-center gap-2 text-orange-900">
                        <AlertTriangle className="w-5 h-5 text-orange-700" />
                        Avoid Periods
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        {analysis.data.timing.avoidPeriods.map((period: string, index: number) => (
                          <div key={index} className="text-sm text-slate-700">
                            • {period}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Best Trading Days */}
                {analysis.data.timing.bestDaysOfWeek && analysis.data.timing.bestDaysOfWeek.length > 0 && (
                  <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                      <CardTitle className="flex items-center gap-2 text-amber-900">
                        <Calendar className="w-5 h-5 text-amber-700" />
                        Best Trading Days
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        {analysis.data.timing.bestDaysOfWeek.map((day: string, index: number) => (
                          <div key={index} className="text-sm text-slate-700">
                            • {day}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Monthly Forecast */}
                {analysis.data.timing.monthlyForecast && (
                  <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg rounded-2xl overflow-hidden col-span-1 md:col-span-2">
                    <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                      <CardTitle className="flex items-center gap-2 text-amber-900">
                        <Calendar className="w-5 h-5 text-amber-700" />
                        Monthly Forecast
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="text-sm text-slate-700">
                          <span className="font-semibold text-amber-900">Current Month:</span> {analysis.data.timing.monthlyForecast.currentMonth}
                        </div>
                        <div className="text-sm text-slate-700">
                          <span className="font-semibold text-amber-900">Next Month:</span> {analysis.data.timing.monthlyForecast.nextMonth}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-300">No timing data available.</p>
              </div>
            )}
          </TabsContent>

          {/* Markets Tab */}
          <TabsContent value="markets" className="space-y-6 mt-6">
            {analysis?.data ? (
              <div className="space-y-6">
                {/* Current Market Conditions */}
                <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                    <CardTitle className="flex items-center gap-2 text-amber-900">
                      <Activity className="w-5 h-5 text-amber-700" />
                      Current Market Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysis.data.planetaryCycles?.slice(0, 2).map((cycle: any, index: number) => (
                        <div key={index} className="p-4 bg-white/60 rounded-xl border border-amber-200/50">
                          <div className="font-medium text-amber-900 mb-2">{cycle.name}</div>
                          <div className="text-sm text-slate-700">{cycle.currentPhase}</div>
                          <div className="text-xs text-slate-600 mt-2">{cycle.description}</div>
                        </div>
                      ))}
                      {analysis.data.lunarPhases?.[0] && (
                        <div className="p-4 bg-white/60 rounded-xl border border-amber-200/50">
                          <div className="font-medium text-amber-900 mb-2">Current Lunar Phase</div>
                          <div className="text-sm text-slate-700">{analysis.data.lunarPhases[0].phase}</div>
                          <div className="text-xs text-slate-600 mt-2">{analysis.data.lunarPhases[0].tradingAdvice}</div>
                        </div>
                      )}
                      {analysis.data.aspects?.find((a: any) => a.type?.includes('Mercury Retrograde')) && (
                        <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-xl">
                          <div className="font-medium text-orange-900 mb-2">⚠️ Mercury Retrograde Active</div>
                          <div className="text-sm text-slate-700">Exercise caution with trading decisions and data analysis.</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Planetary Portfolios */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-200 mb-4">Planetary Portfolios</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg rounded-2xl overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100">
                        <CardTitle className="flex items-center gap-2">
                          <Badge className="bg-green-200 text-green-800 border-green-400">Jupiter</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="text-sm text-slate-600 mb-3 font-medium">Recommended Sectors:</div>
                        <ul className="space-y-1 text-sm text-slate-700">
                          <li>• Banking</li>
                          <li>• Insurance</li>
                          <li>• Financial Services</li>
                        </ul>
                        <div className="mt-3 text-xs text-slate-600">
                          Status: {analysis.data.planetaryCycles?.find((c: any) => c.name === 'Jupiter Cycle')?.currentPhase || 'Active'}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg rounded-2xl overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100">
                        <CardTitle className="flex items-center gap-2">
                          <Badge className="bg-amber-200 text-amber-800 border-amber-400">Saturn</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="text-sm text-slate-600 mb-3 font-medium">Recommended Sectors:</div>
                        <ul className="space-y-1 text-sm text-slate-700">
                          <li>• Real Estate</li>
                          <li>• Mining</li>
                          <li>• Commodities</li>
                        </ul>
                        <div className="mt-3 text-xs text-slate-600">
                          Status: {analysis.data.planetaryCycles?.find((c: any) => c.name === 'Saturn Cycle')?.currentPhase || 'Active'}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-red-300 bg-gradient-to-br from-red-50 to-rose-50 shadow-lg rounded-2xl overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-red-100 to-rose-100">
                        <CardTitle className="flex items-center gap-2">
                          <Badge className="bg-red-200 text-red-800 border-red-400">Mars</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="text-sm text-slate-600 mb-3 font-medium">Recommended Sectors:</div>
                        <ul className="space-y-1 text-sm text-slate-700">
                          <li>• Technology</li>
                          <li>• Defense</li>
                          <li>• Energy</li>
                        </ul>
                        <div className="mt-3 text-xs text-slate-600">
                          Status: {analysis.data.planetaryCycles?.find((c: any) => c.name === 'Mars Cycle')?.currentPhase || 'Active'}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Sector Recommendations */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-200 mb-4">Sector Recommendations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.data.predictions?.map((prediction: any, index: number) => {
                      const favorability = prediction.confidence === 'Medium-High' ? 'green' : 
                                           prediction.confidence === 'Medium' ? 'amber' : 'red';
                      return (
                        <Card key={index} className={`border-2 shadow-lg rounded-2xl overflow-hidden ${
                          favorability === 'green' ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' :
                          favorability === 'amber' ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300' :
                          'bg-gradient-to-br from-red-50 to-rose-50 border-red-300'
                        }`}>
                          <CardHeader className={favorability === 'green' ? 'bg-gradient-to-r from-green-100 to-emerald-100' : favorability === 'amber' ? 'bg-gradient-to-r from-amber-100 to-yellow-100' : 'bg-gradient-to-r from-red-100 to-rose-100'}>
                            <CardTitle className="flex items-center gap-2">
                              <BarChart3 className={`w-5 h-5 ${favorability === 'green' ? 'text-green-700' : favorability === 'amber' ? 'text-amber-700' : 'text-red-700'}`} />
                              <Badge className={
                                favorability === 'green' ? 'bg-green-200 text-green-800 border-green-400' :
                                favorability === 'amber' ? 'bg-amber-200 text-amber-800 border-amber-400' :
                                'bg-red-200 text-red-800 border-red-400'
                              }>
                                {prediction.timeframe}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4">
                            <div className="text-sm text-slate-700 mb-2">{prediction.forecast}</div>
                            <div className="text-xs text-slate-600">Confidence: {prediction.confidence}</div>
                            <div className="text-xs text-slate-600 mt-2">{prediction.recommendations}</div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Trading Alerts */}
                {analysis.data.aspects && analysis.data.aspects.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-slate-200 mb-4">Trading Alerts</h3>
                    <div className="space-y-3">
                      {analysis.data.aspects.map((aspect: any, index: number) => {
                        const alertScheme = aspect.severity === 'High' ? 'amber' : aspect.severity === 'Positive' ? 'green' : 'slate';
                        return (
                          <Card key={index} className={`border-2 shadow-lg rounded-2xl overflow-hidden ${
                            alertScheme === 'amber' ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300' :
                            alertScheme === 'green' ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' :
                            'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300'
                          }`}>
                            <CardHeader className={alertScheme === 'amber' ? 'bg-gradient-to-r from-amber-100 to-yellow-100' : alertScheme === 'green' ? 'bg-gradient-to-r from-green-100 to-emerald-100' : 'bg-gradient-to-r from-slate-100 to-slate-200'}>
                              <CardTitle className={`flex items-center gap-2 ${alertScheme === 'amber' ? 'text-amber-900' : alertScheme === 'green' ? 'text-green-900' : 'text-slate-900'}`}>
                                <AlertTriangle className={`w-5 h-5 ${alertScheme === 'amber' ? 'text-amber-700' : alertScheme === 'green' ? 'text-green-700' : 'text-slate-700'}`} />
                                {aspect.type}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                              <div className="text-sm text-slate-700">{aspect.description}</div>
                              <div className={`text-sm mt-2 font-medium ${alertScheme === 'amber' ? 'text-amber-800' : alertScheme === 'green' ? 'text-green-800' : 'text-slate-700'}`}>{aspect.financialImplication}</div>
                              {aspect.dateRange && (
                                <div className="text-xs text-slate-600 mt-2">Period: {aspect.dateRange}</div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-300">No market data available. Please complete your profile.</p>
              </div>
            )}
          </TabsContent>

          {/* Ask The Seer Tab */}
          <TabsContent value="ask-the-seer" className="space-y-6 mt-6">
            <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 shadow-lg rounded-3xl h-[600px] overflow-hidden">
              <div className="h-full bg-gradient-to-b from-transparent to-white/30 p-4">
                <FinancialSeerChatInterface
                  userId={user?.uid || ''}
                  userProfile={userProfile}
                  financialChartData={analysis?.data}
                  natalChart={natalChart}
                  sessionId={`financial_${Date.now()}`}
                />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}