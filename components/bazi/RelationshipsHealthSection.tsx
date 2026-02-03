"use client"

import { RelationshipAnalysis, HealthAnalysis } from "@/lib/baziIntelligence"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, Activity, Shield } from "lucide-react"

interface RelationshipsHealthSectionProps {
  relationships: RelationshipAnalysis
  health: HealthAnalysis
}

export function RelationshipsHealthSection({ relationships, health }: RelationshipsHealthSectionProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Relationships Card */}
      <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 rounded-2xl">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-pink-700" />
            <h3 className="text-lg font-bold text-pink-900">Relationships</h3>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-pink-800 mb-2 flex items-center gap-1">
                <Users className="w-4 h-4" />
                Interpersonal Dynamics
              </h4>
              <p className="text-slate-800 text-sm leading-relaxed">{relationships.interpersonalDynamics}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-pink-800 mb-2">Best Element Matches</h4>
              <div className="flex flex-wrap gap-2">
                {relationships.compatibility.bestElements.map((element, i) => (
                  <Badge 
                    key={i} 
                    className="bg-green-100 text-green-900 border border-green-300"
                  >
                    {element}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-pink-800 mb-2">Challenging Element Matches</h4>
              <div className="flex flex-wrap gap-2">
                {relationships.compatibility.challengingElements.map((element, i) => (
                  <Badge 
                    key={i} 
                    className="bg-orange-100 text-orange-900 border border-orange-300"
                  >
                    {element}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-pink-800 mb-2">Partnership Advice</h4>
              <ul className="space-y-1.5">
                {relationships.partnershipAdvice.map((advice, i) => (
                  <li key={i} className="text-slate-800 text-sm flex items-start gap-2">
                    <span className="text-pink-600 mt-1">💕</span>
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Card */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-green-700" />
            <h3 className="text-lg font-bold text-green-900">Health & Wellness</h3>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Constitution
              </h4>
              <p className="text-slate-800 text-sm leading-relaxed">{health.constitution}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-green-800 mb-2">Vulnerable Areas</h4>
              <div className="flex flex-wrap gap-2">
                {health.vulnerableAreas.map((area, i) => (
                  <Badge 
                    key={i} 
                    className="bg-red-100 text-red-900 border border-red-300"
                  >
                    {area}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-green-800 mb-2">Wellness Advice</h4>
              <ul className="space-y-1.5">
                {health.wellnessAdvice.map((advice, i) => (
                  <li key={i} className="text-slate-800 text-sm flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-green-800 mb-2">Favorable Practices</h4>
              <ul className="space-y-1.5">
                {health.favorablePractices.map((practice, i) => (
                  <li key={i} className="text-slate-800 text-sm flex items-start gap-2">
                    <span className="text-green-600 mt-1">🌿</span>
                    <span>{practice}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
