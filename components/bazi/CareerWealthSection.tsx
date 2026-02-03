"use client"

import { CareerAnalysis, WealthAnalysis } from "@/lib/baziIntelligence"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, TrendingUp, DollarSign, Clock, Target } from "lucide-react"

interface CareerWealthSectionProps {
  career: CareerAnalysis
  wealth: WealthAnalysis
}

export function CareerWealthSection({ career, wealth }: CareerWealthSectionProps) {
  return (
    <div className="space-y-6">
      {/* Career Overview */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-blue-700" />
            <h3 className="text-lg font-bold text-blue-900">Career Paths</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Suitable Career Paths</h4>
              <div className="flex flex-wrap gap-2">
                {career.suitablePaths.map((path, i) => (
                  <Badge 
                    key={i} 
                    className="bg-blue-100 text-blue-900 border border-blue-300"
                  >
                    {path}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Favorable Industries</h4>
              <div className="flex flex-wrap gap-2">
                {career.favorableIndustries.map((industry, i) => (
                  <Badge 
                    key={i} 
                    className="bg-green-100 text-green-900 border border-green-300"
                  >
                    {industry}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Career Timing */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-purple-700" />
            <h3 className="text-lg font-bold text-purple-900">Career Timing & Opportunities</h3>
          </div>
          <ul className="space-y-2">
            {career.careerTiming.map((timing, i) => (
              <li key={i} className="text-slate-800 text-sm flex items-start gap-2">
                <span className="text-purple-600 mt-1">⏰</span>
                <span>{timing}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Wealth Patterns */}
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-amber-700" />
            <h3 className="text-lg font-bold text-amber-900">Financial Potential</h3>
          </div>
          <p className="text-slate-800 leading-relaxed mb-4">{wealth.wealthPattern}</p>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Income Sources
              </h4>
              <ul className="space-y-1.5">
                {wealth.incomeSources.map((source, i) => (
                  <li key={i} className="text-slate-800 text-sm flex items-start gap-2">
                    <span className="text-green-600 mt-1">💰</span>
                    <span>{source}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-green-800 mb-2">Favorable Periods</h4>
                <ul className="space-y-1">
                  {wealth.favorablePeriods.map((period, i) => (
                    <li key={i} className="text-slate-700 text-xs flex items-start gap-1.5">
                      <span className="text-green-600">✓</span>
                      <span>{period}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-orange-800 mb-2">Cautionary Periods</h4>
                <ul className="space-y-1">
                  {wealth.cautionaryPeriods.map((period, i) => (
                    <li key={i} className="text-slate-700 text-xs flex items-start gap-1.5">
                      <span className="text-orange-600">⚠</span>
                      <span>{period}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Advice */}
      <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-cyan-700" />
            <h3 className="text-lg font-bold text-cyan-900">Investment Guidance</h3>
          </div>
          <ul className="space-y-2">
            {wealth.investmentAdvice.map((advice, i) => (
              <li key={i} className="text-slate-800 text-sm flex items-start gap-2">
                <span className="text-cyan-600 mt-1">💡</span>
                <span>{advice}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
