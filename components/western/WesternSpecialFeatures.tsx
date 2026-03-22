"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { deriveChartFacts, type PlanetLike, type HouseLike } from '@/lib/western/chartDerivedFacts'
import { Sparkles } from 'lucide-react'

interface WesternSpecialFeaturesProps {
  chartData: {
    planets?: PlanetLike[]
    houses?: HouseLike[]
    aspects?: { type: string }[]
  }
}

export function WesternSpecialFeatures({ chartData }: WesternSpecialFeaturesProps) {
  const { bullets } = deriveChartFacts({
    planets: chartData.planets as never,
    houses: chartData.houses as never,
    aspects: chartData.aspects,
  })

  return (
    <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50/90 to-slate-50 rounded-2xl shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-serif text-violet-950">
          <Sparkles className="w-5 h-5 text-violet-700" />
          Special features
        </CardTitle>
        <p className="text-sm text-slate-600 font-normal">
          Deterministic highlights from your chart (elements, hemispheres, moon phase, and more).
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="list-disc pl-5 space-y-2 text-slate-800 text-sm leading-relaxed">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
