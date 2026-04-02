"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { devLog } from '@/lib/devLogger';
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GemstoneRecommendation } from '@/lib/navaratnaIntelligence'
import { Gem, Clock, Shield, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { getGemstonePhotoPath } from '@/lib/gemstoneImageMap'

interface GemstoneRecommendationCardProps {
  recommendation: GemstoneRecommendation
  isLifeStone?: boolean
  isDashaLord?: boolean
}

export function GemstoneRecommendationCard({ 
  recommendation, 
  isLifeStone = false,
  isDashaLord = false 
}: GemstoneRecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-600 text-white border-2 border-red-700 font-semibold'
      case 'medium':
        return 'bg-amber-600 text-white border-2 border-amber-700 font-semibold'
      case 'low':
        return 'bg-blue-600 text-white border-2 border-blue-700 font-semibold'
      default:
        return 'bg-slate-600 text-white border-2 border-slate-700 font-semibold'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'life_stone':
        return 'Life Stone'
      case 'dasha_stone':
        return 'Dasha Stone'
      case 'benefic_stone':
        return 'Benefic Stone'
      case 'strengthening':
        return 'Strengthening'
      default:
        return type
    }
  }

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl shadow-md hover:shadow-xl hover:border-amber-400 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-transparent border border-amber-300/20 flex items-center justify-center relative">
                {(() => {
                  const photoPath = recommendation.gemstone.imagePath ?? getGemstonePhotoPath(recommendation.gemstone.english)
                  const iconPath = recommendation.gemstone.iconPath
                  const src = photoPath ?? iconPath
                  return src ? (
                  <>
                    <img
                      src={src}
                      alt={recommendation.gemstone.english}
                      className={`w-full h-full ${photoPath ? 'object-cover' : 'object-contain p-2'}`}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement
                        target.style.display = 'none'
                        const fallback = target.parentElement?.querySelector('.emoji-fallback') as HTMLElement
                        if (fallback) fallback.style.display = 'block'
                      }}
                    />
                    <span className="emoji-fallback text-3xl hidden absolute inset-0 flex items-center justify-center bg-amber-100/80">
                      {isLifeStone ? '👑' : '💎'}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl">
                    {isLifeStone ? '👑' : '💎'}
                  </span>
                )
                })()}
              </div>
              <div>
                <CardTitle className="text-amber-900 text-xl">
                  {recommendation.gemstone.english}
                </CardTitle>
                <div className="text-slate-600 text-sm mt-1">
                  {recommendation.gemstone.sanskrit} • {recommendation.planet}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge className={getPriorityColor(recommendation.priority)}>
                {getTypeLabel(recommendation.type)}
              </Badge>
              {isLifeStone && (
                <Badge className="bg-purple-600 text-white border-2 border-purple-700 font-semibold">
                  Life Stone
                </Badge>
              )}
              {isDashaLord && (
                <Badge className="bg-blue-600 text-white border-2 border-blue-700 font-semibold">
                  Dasha Period
                </Badge>
              )}
              <Badge className="bg-green-600 text-white border-2 border-green-700 font-semibold">
                {recommendation.priority.toUpperCase()} Priority
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Reason */}
        <div className="bg-amber-100 rounded-xl p-3 border-2 border-amber-200">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
            <p className="text-slate-700 text-sm">{recommendation.reason}</p>
          </div>
        </div>

        {/* Wearing Instructions */}
        <div>
          <h4 className="text-amber-900 font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Wearing Instructions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-3">
              <div className="text-slate-600 mb-1">Day</div>
              <div className="text-cyan-900 font-medium">{recommendation.wearingInstructions.day}</div>
            </div>
            <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-3">
              <div className="text-slate-600 mb-1">Time</div>
              <div className="text-cyan-900 font-medium">{recommendation.wearingInstructions.time}</div>
            </div>
            <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-3">
              <div className="text-slate-600 mb-1">Metal</div>
              <div className="text-cyan-900 font-medium text-xs">{recommendation.wearingInstructions.metal}</div>
            </div>
            <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-3">
              <div className="text-slate-600 mb-1">Finger</div>
              <div className="text-cyan-900 font-medium">{recommendation.wearingInstructions.finger}</div>
            </div>
            <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-3">
              <div className="text-slate-600 mb-1">Hand</div>
              <div className="text-cyan-900 font-medium">{recommendation.wearingInstructions.hand}</div>
            </div>
            {recommendation.wearingInstructions.pendant && (
              <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-3">
                <div className="text-slate-600 mb-1">Pendant</div>
                <div className="text-cyan-900 font-medium">Yes</div>
              </div>
            )}
          </div>
        </div>

        {/* Mantra & Purification */}
        <div>
          <h4 className="text-amber-900 font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Activation
          </h4>
          <div className="space-y-3">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3">
              <div className="text-slate-600 mb-1 text-sm">Mantra</div>
              <div className="text-blue-900 font-mono text-sm">{recommendation.wearingInstructions.mantra}</div>
              <div className="text-slate-600 text-xs mt-1">{recommendation.wearingInstructions.chanting}</div>
            </div>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3">
              <div className="text-slate-600 mb-1 text-sm">Purification</div>
              <div className="text-blue-900 text-sm">{recommendation.wearingInstructions.purification}</div>
            </div>
            {recommendation.wearingInstructions.special && (
              <div className="bg-amber-100 border-2 border-amber-300 rounded-xl p-3">
                <div className="text-amber-800 mb-1 text-sm font-semibold">Special Instructions</div>
                <div className="text-amber-900 text-sm">{recommendation.wearingInstructions.special}</div>
              </div>
            )}
          </div>
        </div>

        {/* Weight Guidelines */}
        <div>
          <h4 className="text-amber-900 font-semibold mb-3 flex items-center gap-2">
            <Gem className="w-4 h-4" />
            Weight Guidelines
          </h4>
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Minimum:</span>
              <span className="text-indigo-900 font-medium">{recommendation.weight.min}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Ideal:</span>
              <span className="text-indigo-900 font-medium">{recommendation.weight.ideal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Maximum:</span>
              <span className="text-indigo-900 font-medium">{recommendation.weight.max}</span>
            </div>
            <div className="text-slate-600 text-xs mt-2 pt-2 border-t border-amber-200">
              {recommendation.weight.note}
            </div>
          </div>
        </div>

        {/* Benefits */}
        {recommendation.benefits.length > 0 && (
          <div>
            <h4 className="text-amber-900 font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Benefits
            </h4>
            <ul className="space-y-2">
              {recommendation.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-700 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-700 mt-0.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {recommendation.warnings.length > 0 && (
          <div>
            <h4 className="text-red-900 font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Warnings & Contraindications
            </h4>
            <ul className="space-y-2">
              {recommendation.warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2 text-red-900 text-sm bg-red-100 border-2 border-red-300 rounded-xl p-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-2 space-y-1">
          <p className="text-xs text-amber-700/80 font-medium">Suggested source: local trusted seller</p>
          <p className="text-xs text-slate-500">Prefer certified gemstones from reputable sellers.</p>
        </div>

        {/* Expandable Details */}
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="outline"
          className="w-full border-2 border-amber-200 text-amber-900 hover:bg-amber-100 hover:border-amber-300 transition-all rounded-xl"
        >
          {isExpanded ? 'Show Less' : 'Show More Details'}
        </Button>

        {isExpanded && (
          <div className="space-y-3 pt-3 border-t border-amber-200">
            {(recommendation.gemstone.imagePath ?? getGemstonePhotoPath(recommendation.gemstone.english)) && (
              <div>
                <h5 className="text-slate-600 text-sm mb-2">Gemstone Image</h5>
                <div className="w-full max-w-xs mx-auto rounded-xl overflow-hidden bg-transparent border border-amber-300/20">
                  <img
                    src={recommendation.gemstone.imagePath ?? getGemstonePhotoPath(recommendation.gemstone.english)!}
                    alt={`${recommendation.gemstone.english} gemstone`}
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>
                <p className="text-slate-600 text-xs mt-2 text-center">
                  Color: {recommendation.color ?? '—'}
                </p>
              </div>
            )}
            <div>
              <h5 className="text-slate-600 text-sm mb-2">Planetary Strength</h5>
              <div className="text-amber-900 text-sm">
                {recommendation.analysis.strength}
              </div>
            </div>
            <div>
              <h5 className="text-slate-600 text-sm mb-2">House Placement</h5>
              <div className="text-amber-900 text-sm">
                {recommendation.analysis.house}th House
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
