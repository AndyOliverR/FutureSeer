/**
 * Zi Wei Dou Shu Overview Component
 * Displays concise summary with key insights and highlights
 */

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Star,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Target,
  Heart,
  ArrowRight,
  CheckCircle,
  Info,
  BookOpen,
} from 'lucide-react'
import { ZiWeiReport } from '@/lib/chinese/ziweiReportGenerator'
import { ZiWeiChartData } from '@/lib/chinese/chineseAstrologyService'

interface ZiWeiOverviewProps {
  report: ZiWeiReport
  chartData: ZiWeiChartData
  onViewFullReport?: () => void
}

export default function ZiWeiOverview({
  report,
  chartData,
  onViewFullReport,
}: ZiWeiOverviewProps) {
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

  // Get top insights (first 6)
  const topInsights = report.summary.keyInsights.slice(0, 6)
  
  // Get top 3 strongest and weakest palaces
  const strongestPalaces = report.palaceStrengths.strongest.slice(0, 3)
  const weakestPalaces = report.palaceStrengths.weakest.slice(0, 3)
  
  // Get main stars preview (first 8)
  const mainStarsPreview = chartData.mainStars.slice(0, 8)

  return (
    <div className="space-y-6">
      {/* Header Section */}
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
                <p className="text-slate-700 text-sm mt-1">Quick Overview</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed">{report.summary.overview}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Insights Grid */}
      {topInsights.length > 0 && (
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ ...motionConfig, delay: 0.1 }}
        >
          <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
            <CardHeader>
              <CardTitle className="text-purple-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-700" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {topInsights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 bg-gradient-to-br from-purple-50/60 to-amber-50/60 rounded-lg border border-purple-200"
                  >
                    <CheckCircle className="w-4 h-4 text-purple-700 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-700 text-sm">{insight}</p>
                  </div>
                ))}
              </div>
              {report.summary.keyInsights.length > 6 && (
                <div className="mt-4 text-center">
                  <p className="text-slate-600 text-sm">
                    +{report.summary.keyInsights.length - 6} more insights in full report
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Life Path & Personality Cards */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ ...motionConfig, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
          <CardHeader>
            <CardTitle className="text-purple-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-700" />
              Life Path
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 text-sm leading-relaxed">{report.summary.lifePath}</p>
          </CardContent>
        </Card>

        <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
          <CardHeader>
            <CardTitle className="text-purple-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-purple-700" />
              Personality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 text-sm leading-relaxed">{report.summary.personality}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Palace Strengths Summary */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ ...motionConfig, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Card elevation={2} className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 shadow-lg rounded-3xl">
          <CardHeader>
            <CardTitle className="text-green-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-700" />
              Strongest Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {strongestPalaces.map((palace, index) => (
                <div key={index} className="p-3 bg-gradient-to-br from-green-50/80 to-teal-50/80 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-green-900 font-semibold text-sm">{palace.englishName}</h5>
                    <span className="text-xs text-slate-700 font-medium">{Math.round(palace.strength * 100)}%</span>
                  </div>
                  <div className="flex-1 bg-green-100 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${palace.strength * 100}%` }}
                    />
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
            <div className="space-y-3">
              {weakestPalaces.map((palace, index) => (
                <div key={index} className="p-3 bg-gradient-to-br from-red-50/80 to-pink-50/80 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-red-900 font-semibold text-sm">{palace.englishName}</h5>
                    <span className="text-xs text-slate-700 font-medium">{Math.round(palace.strength * 100)}%</span>
                  </div>
                  <div className="flex-1 bg-red-100 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full transition-all"
                      style={{ width: `${palace.strength * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Stars Preview */}
      {mainStarsPreview.length > 0 && (
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ ...motionConfig, delay: 0.4 }}
        >
          <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
            <CardHeader>
              <CardTitle className="text-purple-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-700" />
                Main Stars Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {mainStarsPreview.map((star, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gradient-to-br from-purple-50/60 to-amber-50/60 rounded-lg border border-purple-200 text-center"
                  >
                    <p className="text-purple-900 font-semibold text-sm mb-1">{star.name}</p>
                    <p className="text-slate-600 text-xs mb-2">{star.nameChinese}</p>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        star.nature === 'auspicious'
                          ? 'border-green-300 text-green-700 bg-green-50'
                          : star.nature === 'inauspicious'
                          ? 'border-red-300 text-red-700 bg-red-50'
                          : 'border-purple-300 text-purple-700 bg-purple-50'
                      }`}
                    >
                      {star.nature}
                    </Badge>
                  </div>
                ))}
              </div>
              {chartData.mainStars.length > 8 && (
                <div className="mt-4 text-center">
                  <p className="text-slate-600 text-sm">
                    +{chartData.mainStars.length - 8} more stars in full report
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Call-to-Action */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ ...motionConfig, delay: 0.5 }}
      >
        <Card elevation={2} className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 shadow-lg rounded-3xl">
          <CardContent className="p-6 text-center">
            <BookOpen className="w-12 h-12 text-amber-700 mx-auto mb-4" />
            <h3 className="text-amber-900 font-semibold text-lg mb-2">Ready for More Details?</h3>
            <p className="text-slate-700 text-sm mb-4">
              View the comprehensive report with detailed palace analysis, star combinations, fortune cycles, and personalized recommendations.
            </p>
            <Button
              onClick={onViewFullReport}
              variant="filled"
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
            >
              View Full Comprehensive Report
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
