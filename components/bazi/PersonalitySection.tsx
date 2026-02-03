"use client"

import { PersonalityAnalysis } from "@/lib/baziIntelligence"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Star, AlertTriangle, Heart, MessageCircle } from "lucide-react"

interface PersonalitySectionProps {
  personality: PersonalityAnalysis
}

export function PersonalitySection({ personality }: PersonalitySectionProps) {
  return (
    <div className="space-y-6">
      {/* Core Traits */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-purple-700" />
            <h3 className="text-lg font-bold text-purple-900">Core Traits</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {personality.coreTraits.map((trait, i) => (
              <Badge 
                key={i} 
                className="bg-purple-100 text-purple-900 border border-purple-300 hover:bg-purple-200 transition-colors"
              >
                {trait}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Growth Areas */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-green-700" />
              <h3 className="text-lg font-bold text-green-900">Strengths</h3>
            </div>
            <ul className="space-y-2">
              {personality.strengths.map((strength, i) => (
                <li key={i} className="text-slate-800 text-sm flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-orange-700" />
              <h3 className="text-lg font-bold text-orange-900">Areas for Growth</h3>
            </div>
            <ul className="space-y-2">
              {personality.weaknesses.map((weakness, i) => (
                <li key={i} className="text-slate-800 text-sm flex items-start gap-2">
                  <span className="text-orange-600 mt-1">→</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Motivations */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-blue-700" />
            <h3 className="text-lg font-bold text-blue-900">Core Motivations</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {personality.motivations.map((motivation, i) => (
              <Badge 
                key={i} 
                className="bg-blue-100 text-blue-900 border border-blue-300 hover:bg-blue-200 transition-colors"
              >
                {motivation}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Communication & Relationships */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="w-5 h-5 text-indigo-700" />
              <h3 className="text-lg font-bold text-indigo-900">Communication Style</h3>
            </div>
            <p className="text-slate-800 leading-relaxed text-sm">{personality.communication}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-pink-700" />
              <h3 className="text-lg font-bold text-pink-900">In Relationships</h3>
            </div>
            <p className="text-slate-800 leading-relaxed text-sm">{personality.relationships}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
