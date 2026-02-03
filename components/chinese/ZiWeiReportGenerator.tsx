/**
 * Zi Wei Dou Shu Report Generator Component
 * Displays comprehensive personalized report
 */

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Star,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Heart,
  Briefcase,
  DollarSign,
  Activity,
  BookOpen,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowRight,
} from 'lucide-react'
import { ZiWeiReport } from '@/lib/chinese/ziweiReportGenerator'
import { ZiWeiChartData } from '@/lib/chinese/chineseAstrologyService'

interface ZiWeiReportGeneratorProps {
  report: ZiWeiReport
  chartData: ZiWeiChartData
  isLoading?: boolean
}

export default function ZiWeiReportGenerator({
  report,
  chartData,
  isLoading = false,
}: ZiWeiReportGeneratorProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'life-palace' | 'palaces' | 'stars' | 'fortune' | 'transformations' | 'recommendations'>('overview')

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-purple-700 animate-pulse mx-auto mb-4" />
          <p className="text-slate-700">Generating your comprehensive Zi Wei Dou Shu report...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={motionConfig}
      >
        <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-200/60 rounded-lg">
                <Sparkles className="w-6 h-6 text-purple-700" />
              </div>
              <div>
                <CardTitle className="text-2xl text-purple-900">{report.summary.title}</CardTitle>
                <p className="text-slate-700 text-sm mt-1">Comprehensive Destiny Analysis</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 mb-4 leading-relaxed">{report.summary.overview}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-gradient-to-br from-purple-50/80 to-amber-50/80 rounded-lg border-2 border-purple-200">
                <h4 className="text-purple-900 font-semibold mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-700" />
                  Life Path
                </h4>
                <p className="text-slate-700 text-sm">{report.summary.lifePath}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50/80 to-amber-50/80 rounded-lg border-2 border-purple-200">
                <h4 className="text-purple-900 font-semibold mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-purple-700" />
                  Personality
                </h4>
                <p className="text-slate-700 text-sm">{report.summary.personality}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-purple-900 font-semibold mb-2">Key Insights</h4>
              {report.summary.keyInsights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                  transition={prefersReducedMotion ? {} : { delay: index * 0.1, ...motionConfig }}
                  className="flex items-start gap-2 p-3 bg-gradient-to-br from-purple-50/60 to-amber-50/60 rounded-lg border border-purple-200"
                >
                  <CheckCircle className="w-5 h-5 text-purple-700 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-700 text-sm">{insight}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="flex w-full bg-transparent p-0 gap-2">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=inactive]:hover:bg-slate-200/50 transition-all flex-1"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="life-palace" 
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=inactive]:hover:bg-slate-200/50 transition-all flex-1"
          >
            Life Palace
          </TabsTrigger>
          <TabsTrigger 
            value="palaces" 
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=inactive]:hover:bg-slate-200/50 transition-all flex-1"
          >
            Palaces
          </TabsTrigger>
          <TabsTrigger 
            value="stars" 
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=inactive]:hover:bg-slate-200/50 transition-all flex-1"
          >
            Stars
          </TabsTrigger>
          <TabsTrigger 
            value="fortune" 
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=inactive]:hover:bg-slate-200/50 transition-all flex-1"
          >
            Fortune
          </TabsTrigger>
          <TabsTrigger 
            value="transformations" 
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=inactive]:hover:bg-slate-200/50 transition-all flex-1"
          >
            Transformations
          </TabsTrigger>
          <TabsTrigger 
            value="recommendations" 
            className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=inactive]:hover:bg-slate-200/50 transition-all flex-1"
          >
            Guidance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle className="text-purple-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-700" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.lifePalace.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-slate-700 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle className="text-purple-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-purple-700" />
                  Areas to Develop
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.lifePalace.challenges.map((challenge, index) => (
                    <li key={index} className="flex items-start gap-2 text-slate-700 text-sm">
                      <Info className="w-4 h-4 text-purple-700 mt-0.5 flex-shrink-0" />
                      <span>{challenge}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="life-palace" className="mt-6">
          <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
            <CardHeader>
              <CardTitle className="text-purple-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-700" />
                Life Palace Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">{report.lifePalace.analysis}</p>
              
              <div>
                <h4 className="text-purple-900 font-semibold mb-2">Stars in Life Palace</h4>
                <div className="flex flex-wrap gap-2">
                  {report.lifePalace.stars.map((star, index) => (
                    <Badge key={index} variant="outline" className="border-purple-300 text-purple-700 bg-purple-50">
                      {star}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50/60 to-amber-50/60 rounded-lg border border-purple-200">
                <h4 className="text-purple-900 font-semibold mb-2">Guidance</h4>
                <p className="text-slate-700 text-sm">{report.lifePalace.guidance}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="palaces" className="mt-6">
          <div className="space-y-4">
            <Card elevation={2} className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle className="text-green-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-700" />
                  Strongest Palaces
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {report.palaceStrengths.strongest.map((palace, index) => (
                    <div key={index} className="p-3 bg-gradient-to-br from-green-50/80 to-teal-50/80 rounded-lg border border-green-200">
                      <h5 className="text-green-900 font-semibold mb-1">{palace.englishName}</h5>
                      <p className="text-slate-700 text-xs mb-2">{palace.nameChinese}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-green-100 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${palace.strength * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-700 font-medium">{Math.round(palace.strength * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card elevation={2} className="bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border-2 border-red-200 shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle className="text-red-900 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-700" />
                  Areas to Develop
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {report.palaceStrengths.weakest.map((palace, index) => (
                    <div key={index} className="p-3 bg-gradient-to-br from-red-50/80 to-pink-50/80 rounded-lg border border-red-200">
                      <h5 className="text-red-900 font-semibold mb-1">{palace.englishName}</h5>
                      <p className="text-slate-700 text-xs mb-2">{palace.nameChinese}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-red-100 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full"
                            style={{ width: `${palace.strength * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-700 font-medium">{Math.round(palace.strength * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stars" className="mt-6">
          <div className="space-y-4">
            {report.starCombinations.important.length > 0 && (
              <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-purple-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-700" />
                    Important Star Combinations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {report.starCombinations.important.map((combo, index) => {
                      // Find English names for stars
                      const starDetails = combo.stars.map(chineseName => {
                        const star = [...(chartData.mainStars || []), ...(chartData.supportingStars || [])]
                          .find(s => s.nameChinese === chineseName)
                        return { chinese: chineseName, english: star?.name || chineseName }
                      })
                      
                      return (
                        <div key={index} className="p-4 bg-gradient-to-br from-purple-50/60 to-amber-50/60 rounded-lg border border-purple-200">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {starDetails.map((star, starIndex) => (
                              <div key={starIndex} className="flex items-center gap-1">
                                <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50">
                                  <span className="font-semibold">{star.english}</span>
                                  <span className="text-xs ml-1 opacity-70">({star.chinese})</span>
                                </Badge>
                              </div>
                            ))}
                            <span className="text-slate-600 text-sm">in {combo.palace}</span>
                          </div>
                          <p className="text-slate-700 text-sm mb-1">{combo.meaning}</p>
                          <p className="text-slate-600 text-xs">{combo.influence}</p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {report.starCombinations.auspicious.length > 0 && (
              <Card className="bg-green-500/10 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-300 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Auspicious Combinations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {report.starCombinations.auspicious.map((combo, index) => {
                      // Find English names for stars
                      const starDetails = combo.stars.map(chineseName => {
                        const star = [...(chartData.mainStars || []), ...(chartData.supportingStars || [])]
                          .find(s => s.nameChinese === chineseName)
                        return { chinese: chineseName, english: star?.name || chineseName }
                      })
                      
                      return (
                        <div key={index} className="p-3 bg-gradient-to-br from-green-50/60 to-teal-50/60 rounded-lg border border-green-200">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            {starDetails.map((star, starIndex) => (
                              <Badge key={starIndex} variant="outline" className="border-green-400 text-green-700 bg-green-50">
                                <span className="font-semibold">{star.english}</span>
                                <span className="text-xs ml-1 opacity-70">({star.chinese})</span>
                              </Badge>
                            ))}
                          </div>
                          <p className="text-slate-700 text-sm">{combo.meaning}</p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {report.starCombinations.challenging.length > 0 && (
              <Card className="bg-red-500/10 border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-red-300 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Challenging Combinations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {report.starCombinations.challenging.map((combo, index) => {
                      // Find English names for stars
                      const starDetails = combo.stars.map(chineseName => {
                        const star = [...(chartData.mainStars || []), ...(chartData.supportingStars || [])]
                          .find(s => s.nameChinese === chineseName)
                        return { chinese: chineseName, english: star?.name || chineseName }
                      })
                      
                      return (
                        <div key={index} className="p-3 bg-gradient-to-br from-red-50/60 to-pink-50/60 rounded-lg border border-red-200">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {starDetails.map((star, starIndex) => (
                              <Badge key={starIndex} variant="outline" className="border-red-400 text-red-700 bg-red-50">
                                <span className="font-semibold">{star.english}</span>
                                <span className="text-xs ml-1 opacity-70">({star.chinese})</span>
                              </Badge>
                            ))}
                          </div>
                          <p className="text-slate-700 text-sm mb-2">{combo.meaning}</p>
                          <div>
                            <p className="text-amber-900 text-xs font-semibold mb-1">Remedies:</p>
                            <ul className="space-y-1">
                              {combo.remedies.map((remedy, remedyIndex) => (
                                <li key={remedyIndex} className="text-slate-600 text-xs flex items-start gap-1">
                                  <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-amber-700" />
                                  {remedy}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Fallback: Show all stars if no combinations found */}
            {report.starCombinations.important.length === 0 && 
             report.starCombinations.auspicious.length === 0 && 
             report.starCombinations.challenging.length === 0 && (
              <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-purple-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-700" />
                    Stars in Your Chart
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Main Stars */}
                    {chartData.mainStars && chartData.mainStars.length > 0 && (
                      <div>
                        <h4 className="text-purple-900 font-semibold mb-3 flex items-center gap-2">
                          <Star className="w-4 h-4 text-purple-700" />
                          Main Stars (主星)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {chartData.mainStars.map((star, index) => (
                            <div key={index} className="p-4 bg-gradient-to-br from-purple-50/60 to-amber-50/60 rounded-lg border border-purple-200">
                              <div className="mb-2">
                                <h5 className="text-purple-900 font-semibold text-sm mb-1">
                                  {star.name}
                                </h5>
                                <Badge 
                                  variant="outline" 
                                  className={`${
                                    star.nature === 'auspicious' 
                                      ? 'border-green-400 text-green-700 bg-green-50' 
                                      : star.nature === 'inauspicious'
                                      ? 'border-red-400 text-red-700 bg-red-50'
                                      : 'border-purple-300 text-purple-700 bg-purple-50'
                                  } text-xs`}
                                >
                                  {star.nameChinese}
                                </Badge>
                              </div>
                              {star.palace && (
                                <p className="text-slate-700 text-xs mb-1">
                                  Located in: <span className="text-purple-700 font-medium">{star.palace}</span>
                                </p>
                              )}
                              {star.interpretation && (
                                <p className="text-slate-700 text-xs mt-2 leading-relaxed">{star.interpretation}</p>
                              )}
                              {star.keywords && star.keywords.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {star.keywords.slice(0, 3).map((keyword, kwIndex) => (
                                    <span key={kwIndex} className="text-slate-600 text-xs">#{keyword}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Supporting Stars */}
                    {chartData.supportingStars && chartData.supportingStars.length > 0 && (
                      <div>
                        <h4 className="text-purple-900 font-semibold mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-700" />
                          Supporting Stars (辅星)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {chartData.supportingStars.map((star, index) => (
                            <div key={index} className="p-4 bg-gradient-to-br from-purple-50/60 to-amber-50/60 rounded-lg border border-purple-200">
                              <div className="mb-2">
                                <h5 className="text-purple-900 font-semibold text-sm mb-1">
                                  {star.name}
                                </h5>
                                <Badge 
                                  variant="outline" 
                                  className={`${
                                    star.nature === 'auspicious' 
                                      ? 'border-green-400 text-green-700 bg-green-50' 
                                      : star.nature === 'inauspicious'
                                      ? 'border-red-400 text-red-700 bg-red-50'
                                      : 'border-purple-300 text-purple-700 bg-purple-50'
                                  } text-xs`}
                                >
                                  {star.nameChinese}
                                </Badge>
                              </div>
                              {star.palace && (
                                <p className="text-slate-700 text-xs mb-1">
                                  Located in: <span className="text-purple-700 font-medium">{star.palace}</span>
                                </p>
                              )}
                              {star.interpretation && (
                                <p className="text-slate-700 text-xs mt-2 leading-relaxed">{star.interpretation}</p>
                              )}
                              {star.keywords && star.keywords.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {star.keywords.slice(0, 3).map((keyword, kwIndex) => (
                                    <span key={kwIndex} className="text-slate-600 text-xs">#{keyword}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Message if no stars at all */}
                    {(!chartData.mainStars || chartData.mainStars.length === 0) && 
                     (!chartData.supportingStars || chartData.supportingStars.length === 0) && (
                      <div className="text-center py-8">
                        <Info className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                        <p className="text-slate-700 mb-2 font-medium">Star data is being calculated</p>
                        <p className="text-slate-600 text-sm">
                          Your chart is being processed. Star positions and combinations will be displayed once the calculation is complete.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="fortune" className="mt-6">
          <div className="space-y-4">
            <Card elevation={2} className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 border-2 border-blue-200 shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-700" />
                  Current Fortune Cycle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50 mb-2">
                    {report.fortuneCycles.current.period}
                  </Badge>
                  <p className="text-slate-700 mb-3">{report.fortuneCycles.current.description}</p>
                </div>
                
                {report.fortuneCycles.current.opportunities.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-green-900 font-semibold text-sm mb-2">Opportunities</h5>
                    <ul className="space-y-1">
                      {report.fortuneCycles.current.opportunities.map((opp, index) => (
                        <li key={index} className="text-slate-700 text-sm flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          {opp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {report.fortuneCycles.current.warnings.length > 0 && (
                  <div>
                    <h5 className="text-amber-900 font-semibold text-sm mb-2">Warnings</h5>
                    <ul className="space-y-1">
                      {report.fortuneCycles.current.warnings.map((warning, index) => (
                        <li key={index} className="text-slate-700 text-sm flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {report.fortuneCycles.upcoming.length > 0 && (
              <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-purple-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-700" />
                    Upcoming Fortune Cycles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {report.fortuneCycles.upcoming.map((cycle, index) => (
                      <div key={index} className="p-3 bg-gradient-to-br from-purple-50/60 to-amber-50/60 rounded-lg border border-purple-200">
                        <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50 mb-2">
                          {cycle.period}
                        </Badge>
                        <p className="text-slate-700 text-sm mb-2">{cycle.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {cycle.focus.map((focus, focusIndex) => (
                            <Badge key={focusIndex} variant="outline" className="border-purple-200 text-purple-600 bg-purple-50/50 text-xs">
                              {focus}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="transformations" className="mt-6">
          <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
            <CardHeader>
              <CardTitle className="text-purple-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-700" />
                Four Transformations (四化)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                  <h4 className="text-green-900 font-semibold mb-2">Lu (禄) - Wealth</h4>
                  <p className="text-slate-700 text-sm mb-1">
                    <span className="font-semibold">{report.fourTransformations.lu.star}</span> in {report.fourTransformations.lu.palace}
                  </p>
                  <p className="text-slate-600 text-xs">{report.fourTransformations.lu.meaning}</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
                  <h4 className="text-blue-900 font-semibold mb-2">Quan (权) - Power</h4>
                  <p className="text-slate-700 text-sm mb-1">
                    <span className="font-semibold">{report.fourTransformations.quan.star}</span> in {report.fourTransformations.quan.palace}
                  </p>
                  <p className="text-slate-600 text-xs">{report.fourTransformations.quan.meaning}</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                  <h4 className="text-purple-900 font-semibold mb-2">Ke (科) - Fame</h4>
                  <p className="text-slate-700 text-sm mb-1">
                    <span className="font-semibold">{report.fourTransformations.ke.star}</span> in {report.fourTransformations.ke.palace}
                  </p>
                  <p className="text-slate-600 text-xs">{report.fourTransformations.ke.meaning}</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-lg border-2 border-red-200">
                  <h4 className="text-red-900 font-semibold mb-2">Ji (忌) - Challenge</h4>
                  <p className="text-slate-700 text-sm mb-1">
                    <span className="font-semibold">{report.fourTransformations.ji.star}</span> in {report.fourTransformations.ji.palace}
                  </p>
                  <p className="text-slate-600 text-xs">{report.fourTransformations.ji.meaning}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle className="text-purple-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-700" />
                  Career
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.recommendations.career.map((rec, index) => (
                    <li key={index} className="text-slate-700 text-sm flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-purple-700 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle className="text-purple-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-purple-700" />
                  Relationships
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.recommendations.relationships.map((rec, index) => (
                    <li key={index} className="text-slate-700 text-sm flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-purple-700 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle className="text-purple-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-700" />
                  Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.recommendations.health.map((rec, index) => (
                    <li key={index} className="text-slate-700 text-sm flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-purple-700 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle className="text-purple-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-700" />
                  Wealth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.recommendations.wealth.map((rec, index) => (
                    <li key={index} className="text-slate-700 text-sm flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-purple-700 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl mt-4">
            <CardHeader>
              <CardTitle className="text-purple-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-700" />
                Spiritual Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.recommendations.spiritual.map((rec, index) => (
                  <li key={index} className="text-slate-700 text-sm flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-purple-700 mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

