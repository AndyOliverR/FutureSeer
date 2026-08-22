"use client"

import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PalmistryAnalysis } from '@/lib/palmistryIntelligence'
import { Hand, Sparkles, Heart, Brain, Activity, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

interface PalmistryDashboardHeroProps {
  analysis: PalmistryAnalysis | null
  userProfile: any
}

export const PalmistryDashboardHero = memo(function PalmistryDashboardHero({ analysis, userProfile }: PalmistryDashboardHeroProps) {
  if (!analysis) {
    return (
      <Card className="bg-gradient-to-br from-sky-50 via-cyan-50 to-indigo-50 border-2 border-sky-200 shadow-lg rounded-3xl mb-8">
        <CardContent className="p-8">
          <div className="text-center">
            <Hand className="w-16 h-16 text-sky-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-sky-900 mb-2">Palm Reading Analysis</h2>
            <p className="text-slate-700">
              {userProfile?.palmPhotoUrl 
                ? "Your palm is being analyzed. Results will appear shortly."
                : "Upload a palm image to begin your personalized analysis."}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get key insights
  const lifeLine = analysis.lines?.find(l => l.name === 'Life Line')
  const heartLine = analysis.lines?.find(l => l.name === 'Heart Line')
  const headLine = analysis.lines?.find(l => l.name === 'Head Line')
  const fateLine = analysis.lines?.find(l => l.name === 'Fate Line')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <Card className="bg-gradient-to-br from-sky-50 via-cyan-50 to-indigo-50 border-2 border-sky-200 shadow-lg rounded-3xl overflow-hidden">
        {/* Accent Bar */}
        <div className="h-2 bg-gradient-to-r from-sky-400 via-cyan-400 to-indigo-400" />
        
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Palm Image or Icon */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center">
              {userProfile?.palmPhotoUrl ? (
                <div className="relative w-full aspect-square max-w-[240px] rounded-2xl overflow-hidden border-4 border-sky-400 shadow-xl">
                  <img 
                    src={userProfile.palmPhotoUrl} 
                    alt="Palm" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 flex items-center justify-center bg-gradient-to-br from-sky-100 to-cyan-100 rounded-2xl border-4 border-sky-400 shadow-xl">
                  <Hand className="w-24 h-24 text-sky-600" />
                </div>
              )}
              <div className="mt-4 text-center">
                <Badge className="bg-sky-600 text-white text-sm px-3 py-1">
                  {analysis.hand === 'both' ? 'Both Hands' : analysis.hand === 'left' ? 'Left Hand' : 'Right Hand'}
                </Badge>
                <p className="text-xs text-slate-600 mt-2">{analysis.palmShape}</p>
              </div>
            </div>

            {/* Middle: Key Stats */}
            <div className="lg:col-span-1 flex flex-col justify-center space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-3xl font-bold text-sky-900 mb-2 flex items-center justify-center gap-2">
                  <Sparkles className="w-8 h-8 text-sky-600" />
                  Palm Analysis
                </h2>
                <p className="text-slate-700 text-sm">
                  Energy Level: <span className="font-bold text-sky-700">{analysis.energyScore}/100</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/60 rounded-xl p-3 border border-sky-200 text-center">
                  <div className="text-2xl mb-1">🔥</div>
                  <div className="text-xs text-slate-600 mb-1">Primary Element</div>
                  <div className="text-sm font-bold text-sky-900 capitalize">{analysis.elements?.primary || 'Balanced'}</div>
                </div>
                <div className="bg-white/60 rounded-xl p-3 border border-sky-200 text-center">
                  <div className="text-2xl mb-1">⭐</div>
                  <div className="text-xs text-slate-600 mb-1">Confidence</div>
                  <div className="text-sm font-bold text-sky-900">{analysis.confidenceLevel}%</div>
                </div>
                <div className="bg-white/60 rounded-xl p-3 border border-sky-200 text-center">
                  <div className="text-2xl mb-1">📏</div>
                  <div className="text-xs text-slate-600 mb-1">Major Lines</div>
                  <div className="text-sm font-bold text-sky-900">{analysis.lines?.length || 0}</div>
                </div>
                <div className="bg-white/60 rounded-xl p-3 border border-sky-200 text-center">
                  <div className="text-2xl mb-1">⛰️</div>
                  <div className="text-xs text-slate-600 mb-1">Mounts</div>
                  <div className="text-sm font-bold text-sky-900">{analysis.mounts?.length || 0}</div>
                </div>
              </div>
            </div>

            {/* Right: Key Line Insights */}
            <div className="lg:col-span-1 flex flex-col justify-center space-y-3">
              <h3 className="text-lg font-bold text-sky-900 mb-2 text-center">Key Lines</h3>
              
              {lifeLine && (
                <div className="bg-white/60 rounded-xl p-3 border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-900">Life Line</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs border-green-300 text-green-700">{lifeLine.length}</Badge>
                    <Badge variant="outline" className="text-xs border-green-300 text-green-700">{lifeLine.depth}</Badge>
                    <Badge variant="outline" className="text-xs border-green-300 text-green-700">{lifeLine.quality}</Badge>
                  </div>
                </div>
              )}

              {heartLine && (
                <div className="bg-white/60 rounded-xl p-3 border border-pink-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-pink-600" />
                    <span className="text-sm font-semibold text-pink-900">Heart Line</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs border-pink-300 text-pink-700">{heartLine.length}</Badge>
                    <Badge variant="outline" className="text-xs border-pink-300 text-pink-700">{heartLine.depth}</Badge>
                    <Badge variant="outline" className="text-xs border-pink-300 text-pink-700">{heartLine.quality}</Badge>
                  </div>
                </div>
              )}

              {headLine && (
                <div className="bg-white/60 rounded-xl p-3 border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">Head Line</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">{headLine.length}</Badge>
                    <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">{headLine.depth}</Badge>
                    <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">{headLine.quality}</Badge>
                  </div>
                </div>
              )}

              {fateLine && (
                <div className="bg-white/60 rounded-xl p-3 border border-orange-200">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-semibold text-orange-900">Fate Line</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">{fateLine.length}</Badge>
                    <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">{fateLine.depth}</Badge>
                    <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">{fateLine.quality}</Badge>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom: Current Phase */}
          {analysis.timing?.currentPhase && (
            <div className="mt-6 pt-6 border-t border-sky-200">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-1">Current Life Phase</p>
                <p className="text-lg font-bold text-sky-900">{analysis.timing.currentPhase}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
})
