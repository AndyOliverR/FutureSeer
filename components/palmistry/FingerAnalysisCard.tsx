"use client"

import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FingerAnalysis } from '@/lib/palmistryIntelligence'
import { Hand } from 'lucide-react'

interface FingerAnalysisCardProps {
  fingers: FingerAnalysis
}

const fingerNames = {
  thumb: '👍 Thumb',
  index: '☝️ Index',
  middle: '🖕 Middle',
  ring: '💍 Ring',
  pinky: '🤙 Pinky',
}

const fingerColors: { [key: string]: { bg: string; border: string; text: string } } = {
  thumb: { bg: 'from-red-50 to-orange-50', border: 'border-red-300', text: 'text-red-900' },
  index: { bg: 'from-yellow-50 to-amber-50', border: 'border-yellow-300', text: 'text-yellow-900' },
  middle: { bg: 'from-gray-50 to-slate-50', border: 'border-gray-300', text: 'text-gray-900' },
  ring: { bg: 'from-orange-50 to-amber-50', border: 'border-orange-300', text: 'text-orange-900' },
  pinky: { bg: 'from-blue-50 to-cyan-50', border: 'border-blue-300', text: 'text-blue-900' },
}

export const FingerAnalysisCard = memo(function FingerAnalysisCard({ fingers }: FingerAnalysisCardProps) {
  return (
    <div className="space-y-4">
      {Object.entries(fingers).map(([fingerName, fingerData]) => {
        const colors = fingerColors[fingerName] || fingerColors.thumb

        return (
          <Card key={fingerName} className={`bg-gradient-to-br ${colors.bg} border-2 ${colors.border} shadow-md rounded-2xl`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 text-lg ${colors.text}`}>
                {fingerNames[fingerName as keyof typeof fingerNames]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Characteristics */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center bg-white/60 rounded-lg p-2">
                  <p className="text-xs text-slate-600 mb-1">Length</p>
                  <p className={`text-sm font-semibold capitalize ${colors.text}`}>{fingerData.length}</p>
                </div>
                <div className="text-center bg-white/60 rounded-lg p-2">
                  <p className="text-xs text-slate-600 mb-1">Flexibility</p>
                  <p className={`text-sm font-semibold capitalize ${colors.text}`}>{fingerData.flexibility}</p>
                </div>
                <div className="text-center bg-white/60 rounded-lg p-2">
                  <p className="text-xs text-slate-600 mb-1">Energy</p>
                  <p className={`text-sm font-semibold ${colors.text}`}>{fingerData.energy}/10</p>
                </div>
              </div>

              {/* Element */}
              <div className="flex items-center justify-between bg-white/60 rounded-lg p-2">
                <span className="text-xs text-slate-600">Element</span>
                <Badge className={`${colors.text} bg-white/80 border ${colors.border} capitalize`}>
                  {fingerData.element}
                </Badge>
              </div>

              {/* Interpretation */}
              <div className="pt-2 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-600 mb-2">Meaning</p>
                <p className="text-sm text-slate-700 leading-relaxed">{fingerData.interpretation}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Overall Hand Analysis */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-amber-900">
            <Hand className="w-5 h-5" />
            Overall Hand Characteristics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-semibold">Thumb:</span> Represents willpower and determination
            </p>
            <p>
              <span className="font-semibold">Index Finger:</span> Indicates leadership qualities and ambition
            </p>
            <p>
              <span className="font-semibold">Middle Finger:</span> Shows sense of responsibility and wisdom
            </p>
            <p>
              <span className="font-semibold">Ring Finger:</span> Reveals creative talents and artistic nature
            </p>
            <p>
              <span className="font-semibold">Pinky Finger:</span> Reflects communication skills and business acumen
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})
