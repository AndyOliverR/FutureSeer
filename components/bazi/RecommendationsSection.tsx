"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Target, Shield, Sparkles, Star } from "lucide-react"

interface RecommendationsSectionProps {
  recommendations: string[]
  remedies: string[]
}

export function RecommendationsSection({ recommendations, remedies }: RecommendationsSectionProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Recommendations */}
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-amber-700" />
            <h3 className="text-lg font-bold text-amber-900">Life Recommendations</h3>
          </div>
          <ul className="space-y-2.5">
            {recommendations.map((rec, i) => (
              <li key={i} className="text-slate-800 text-sm flex items-start gap-2.5 leading-relaxed">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center text-xs font-bold mt-0.5">
                  {i + 1}
                </span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-4 pt-4 border-t border-amber-200">
            <p className="text-xs text-slate-600 flex items-start gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>These recommendations are based on your Four Pillars and element balance to guide you toward harmony and success.</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Remedies & Practices */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-purple-700" />
            <h3 className="text-lg font-bold text-purple-900">Remedies & Practices</h3>
          </div>
          <ul className="space-y-2.5">
            {remedies.map((remedy, i) => (
              <li key={i} className="text-slate-800 text-sm flex items-start gap-2.5 leading-relaxed">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-200 text-purple-900 flex items-center justify-center text-xs font-bold mt-0.5">
                  {i + 1}
                </span>
                <span>{remedy}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 pt-4 border-t border-purple-200">
            <p className="text-xs text-slate-600 flex items-start gap-1.5">
              <Star className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
              <span>These remedies help balance your elements and mitigate challenging influences in your BaZi chart.</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
