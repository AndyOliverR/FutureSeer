/**
 * Fortune Cycle Timeline Component
 * Visualizes 大運/流年/流月/流日 fortune cycles
 */

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Target,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { RuntimeContextData } from '@/lib/chinese/chineseAstrologyService'

interface FortuneCycleTimelineProps {
  runtimeContext: RuntimeContextData
  onDateChange?: (date: Date) => void
}

export default function FortuneCycleTimeline({
  runtimeContext,
  onDateChange,
}: FortuneCycleTimelineProps) {
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

  const getNatureColor = (ground: string): string => {
    const excellent = ['寅', '午']
    const good = ['子', '卯', '巳', '申', '亥']
    const challenging = ['酉']
    
    if (excellent.includes(ground)) return 'text-green-400 border-green-500/30 bg-green-500/10'
    if (good.includes(ground)) return 'text-blue-400 border-blue-500/30 bg-blue-500/10'
    if (challenging.includes(ground)) return 'text-red-400 border-red-500/30 bg-red-500/10'
    return 'text-slate-400 border-slate-500/30 bg-slate-500/10'
  }

  return (
    <div className="space-y-6">
      {/* Ten Year Fortune (大運) */}
      <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
        <CardHeader>
          <CardTitle className="text-purple-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-700" />
            大運 - Ten Year Fortune Cycle
            <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50 ml-auto">
              Ages {runtimeContext.tenYear.startAge}-{runtimeContext.tenYear.endAge}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-lg border ${getNatureColor(runtimeContext.tenYear.ground)}`}>
              <div className="text-2xl font-bold">{runtimeContext.tenYear.ground}</div>
              <div className="text-xs opacity-70">Ground</div>
            </div>
            <ArrowRight className="text-slate-600" />
            <div className={`p-3 rounded-lg border ${getNatureColor(runtimeContext.tenYear.sky)}`}>
              <div className="text-2xl font-bold">{runtimeContext.tenYear.sky}</div>
              <div className="text-xs opacity-70">Sky</div>
            </div>
          </div>
          <p className="text-slate-700 mb-3">{runtimeContext.tenYear.description}</p>
          <div className="flex flex-wrap gap-2">
            {runtimeContext.tenYear.focus.map((focus, index) => (
              <Badge key={index} variant="outline" className="border-purple-300 text-purple-700 bg-purple-50">
                {focus}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Year Fortune (流年) */}
      <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
        <CardHeader>
          <CardTitle className="text-purple-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-700" />
            流年 - Annual Fortune
            <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50 ml-auto">
              {runtimeContext.year.year}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-lg border ${getNatureColor(runtimeContext.year.ground)}`}>
              <div className="text-2xl font-bold">{runtimeContext.year.ground}</div>
              <div className="text-xs opacity-70">Ground</div>
            </div>
            <ArrowRight className="text-slate-600" />
            <div className={`p-3 rounded-lg border ${getNatureColor(runtimeContext.year.sky)}`}>
              <div className="text-2xl font-bold">{runtimeContext.year.sky}</div>
              <div className="text-xs opacity-70">Sky</div>
            </div>
          </div>
          <p className="text-slate-700 mb-3">{runtimeContext.year.description}</p>
          <div className="flex flex-wrap gap-2">
            {runtimeContext.year.focus.map((focus, index) => (
              <Badge key={index} variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
                {focus}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Month Fortune (流月) */}
      <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
        <CardHeader>
          <CardTitle className="text-purple-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-700" />
            流月 - Monthly Fortune
            <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50 ml-auto">
              {runtimeContext.month.month}/{runtimeContext.month.year}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-lg border ${getNatureColor(runtimeContext.month.ground)}`}>
              <div className="text-2xl font-bold">{runtimeContext.month.ground}</div>
              <div className="text-xs opacity-70">Ground</div>
            </div>
            <ArrowRight className="text-slate-600" />
            <div className={`p-3 rounded-lg border ${getNatureColor(runtimeContext.month.sky)}`}>
              <div className="text-2xl font-bold">{runtimeContext.month.sky}</div>
              <div className="text-xs opacity-70">Sky</div>
            </div>
          </div>
          <p className="text-slate-700 mb-3">{runtimeContext.month.description}</p>
          <div className="flex flex-wrap gap-2">
            {runtimeContext.month.focus.map((focus, index) => (
              <Badge key={index} variant="outline" className="border-purple-300 text-purple-700 bg-purple-50">
                {focus}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Day Fortune (流日) */}
      <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
        <CardHeader>
          <CardTitle className="text-purple-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-700" />
            流日 - Daily Fortune
            <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50 ml-auto">
              {runtimeContext.day.day}/{runtimeContext.day.month}/{runtimeContext.day.year}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-lg border ${getNatureColor(runtimeContext.day.ground)}`}>
              <div className="text-2xl font-bold">{runtimeContext.day.ground}</div>
              <div className="text-xs opacity-70">Ground</div>
            </div>
            <ArrowRight className="text-slate-600" />
            <div className={`p-3 rounded-lg border ${getNatureColor(runtimeContext.day.sky)}`}>
              <div className="text-2xl font-bold">{runtimeContext.day.sky}</div>
              <div className="text-xs opacity-70">Sky</div>
            </div>
          </div>
          <p className="text-slate-700 mb-3">{runtimeContext.day.description}</p>
          <div className="flex flex-wrap gap-2">
            {runtimeContext.day.focus.map((focus, index) => (
              <Badge key={index} variant="outline" className="border-purple-300 text-purple-700 bg-purple-50">
                {focus}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Age Information */}
      <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Current Age</p>
              <p className="text-purple-900 text-2xl font-bold">{Math.floor(runtimeContext.age)}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-600 text-sm">Effective Month</p>
              <p className="text-purple-900 text-2xl font-bold">{runtimeContext.effectiveMonth}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
