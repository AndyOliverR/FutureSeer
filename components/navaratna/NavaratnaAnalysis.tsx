"use client"

import { NavaratnaAnalysis as NavaratnaAnalysisType } from '@/lib/navaratnaIntelligence'
import { GemstoneRecommendationCard } from './GemstoneRecommendationCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Gem, AlertTriangle, XCircle, Shield } from 'lucide-react'

interface NavaratnaAnalysisProps {
  analysis: NavaratnaAnalysisType
}

export function NavaratnaAnalysis({ analysis }: NavaratnaAnalysisProps) {
  return (
    <div className="space-y-6">
      {/* Safety Warnings */}
      {analysis.safetyWarnings.length > 0 && (
        <Alert className="bg-amber-100 border-2 border-amber-300 rounded-2xl">
          <Shield className="h-5 w-5 text-amber-700" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-semibold text-amber-900 mb-2">Important Safety Warnings</div>
              <ul className="space-y-1 text-amber-900 text-sm">
                {analysis.safetyWarnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-amber-700 mt-1">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Life Stone - Prominently Displayed */}
      {analysis.recommendations.lifeStone && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-300 rounded-2xl p-4 mb-4 shadow-md">
            <h3 className="text-3xl font-serif text-amber-900 mb-2 flex items-center gap-3">
              <span className="text-4xl">👑</span>
              <span>Your Life Stone (Lagnesh)</span>
            </h3>
            <p className="text-amber-800 text-sm">This is your primary gemstone recommendation based on your Ascendant Lord</p>
          </div>
          <GemstoneRecommendationCard
            recommendation={analysis.recommendations.lifeStone}
            isLifeStone={true}
          />
        </div>
      )}

      {/* Dasha Stone */}
      {analysis.recommendations.dashaStone && (
        <div>
          <h3 className="text-2xl font-serif text-amber-900 mb-4 flex items-center gap-2">
            <Gem className="w-6 h-6" />
            Dasha Stone
          </h3>
          <GemstoneRecommendationCard
            recommendation={analysis.recommendations.dashaStone}
            isDashaLord={true}
          />
        </div>
      )}

      {/* Benefic Stones */}
      {analysis.recommendations.beneficStones.length > 0 && (
        <div>
          <h3 className="text-2xl font-serif text-amber-900 mb-4 flex items-center gap-2">
            <Gem className="w-6 h-6" />
            Benefic Stones
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analysis.recommendations.beneficStones.map((stone, index) => (
              <GemstoneRecommendationCard
                key={index}
                recommendation={stone}
              />
            ))}
          </div>
        </div>
      )}

      {/* Avoided Stones */}
      {analysis.recommendations.avoidedStones.length > 0 && (
        <div>
          <h3 className="text-2xl font-serif text-red-900 mb-4 flex items-center gap-2">
            <XCircle className="w-6 h-6" />
            Avoid These Gemstones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysis.recommendations.avoidedStones.map((stone, index) => (
              <Card key={index} className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl shadow-md">
                <CardHeader>
                  <CardTitle className="text-red-900 text-lg flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    {stone.gemstone}
                  </CardTitle>
                  <div className="text-slate-600 text-sm">
                    {stone.planet}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-red-100 border-2 border-red-300 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-700 mt-0.5 flex-shrink-0" />
                      <p className="text-red-900 text-sm">{stone.reason}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Weight Recommendation */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Gem className="w-5 h-5" />
            General Weight Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4">
              <div className="text-slate-600 text-sm mb-1">Minimum</div>
              <div className="text-cyan-900 text-xl font-semibold">
                {analysis.weightRecommendation.min}
              </div>
            </div>
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4">
              <div className="text-slate-600 text-sm mb-1">Ideal</div>
              <div className="text-cyan-900 text-xl font-semibold">
                {analysis.weightRecommendation.ideal}
              </div>
            </div>
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4">
              <div className="text-slate-600 text-sm mb-1">Maximum</div>
              <div className="text-cyan-900 text-xl font-semibold">
                {analysis.weightRecommendation.max}
              </div>
            </div>
          </div>
          <div className="mt-4 text-slate-600 text-sm">
            {analysis.weightRecommendation.note}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
