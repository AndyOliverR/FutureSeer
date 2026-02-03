"use client"

import { memo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PalmLine } from '@/lib/palmistryIntelligence'
import { Activity, Heart, Brain, TrendingUp, Star, Sparkles } from 'lucide-react'

interface LineAnalysisCardProps {
  line: PalmLine
}

const lineIcons: { [key: string]: any } = {
  'Life Line': Activity,
  'Heart Line': Heart,
  'Head Line': Brain,
  'Fate Line': TrendingUp,
  'Sun Line': Star,
  'Mercury Line': Sparkles,
}

const lineColors: { [key: string]: { bg: string; border: string; text: string; badge: string } } = {
  'Life Line': { bg: 'from-green-50 to-emerald-50', border: 'border-green-300', text: 'text-green-900', badge: 'bg-green-100 text-green-800' },
  'Heart Line': { bg: 'from-pink-50 to-rose-50', border: 'border-pink-300', text: 'text-pink-900', badge: 'bg-pink-100 text-pink-800' },
  'Head Line': { bg: 'from-blue-50 to-cyan-50', border: 'border-blue-300', text: 'text-blue-900', badge: 'bg-blue-100 text-blue-800' },
  'Fate Line': { bg: 'from-amber-50 to-amber-50', border: 'border-amber-300', text: 'text-amber-900', badge: 'bg-amber-100 text-amber-800' },
  'Sun Line': { bg: 'from-yellow-50 to-amber-50', border: 'border-yellow-300', text: 'text-yellow-900', badge: 'bg-yellow-100 text-yellow-800' },
  'Mercury Line': { bg: 'from-purple-50 to-indigo-50', border: 'border-purple-300', text: 'text-purple-900', badge: 'bg-purple-100 text-purple-800' },
}

export const LineAnalysisCard = memo(function LineAnalysisCard({ line }: LineAnalysisCardProps) {
  const colors = lineColors[line.name] || lineColors['Life Line']
  const Icon = lineIcons[line.name] || Activity

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`bg-gradient-to-br ${colors.bg} border-2 ${colors.border} shadow-md hover:shadow-lg transition-shadow duration-200 rounded-2xl`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${colors.text}`}>
          <Icon className="w-5 h-5" />
          {line.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Characteristics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-xs text-slate-600 mb-1">Length</p>
            <Badge className={colors.badge}>{line.length}</Badge>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-600 mb-1">Depth</p>
            <Badge className={colors.badge}>{line.depth}</Badge>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-600 mb-1">Quality</p>
            <Badge className={colors.badge}>{line.quality}</Badge>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex flex-col">
            <span className="text-slate-500 mb-1">Element</span>
            <span className={`font-semibold capitalize ${colors.text}`}>{line.element}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 mb-1">Energy</span>
            <span className={`font-semibold ${colors.text}`}>{line.energy}/10</span>
          </div>
        </div>

        {/* Description */}
        <div className="pt-3 border-t border-slate-200">
          <p className="text-xs text-slate-500 mb-1 font-semibold">Description</p>
          <p className="text-sm text-slate-700">{line.description}</p>
        </div>

        {/* Interpretation */}
        <div className="pt-2 border-t border-slate-200">
          <p className="text-xs text-slate-500 mb-1 font-semibold">Interpretation</p>
          <p className="text-sm text-slate-700 leading-relaxed">{line.interpretation}</p>
        </div>

        {/* Timing */}
        {line.timing && (
          <div className="pt-2 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-1 font-semibold">Timing</p>
            <p className="text-sm text-slate-700">{line.timing}</p>
          </div>
        )}
      </CardContent>
    </Card>
    </motion.div>
  )
})
