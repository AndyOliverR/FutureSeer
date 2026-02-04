"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ToolInterestForm } from './ToolInterestForm'
import { AdvancedTechnique } from '@/lib/data/advancedTechniques'
import { Sparkles } from 'lucide-react'

interface AdvancedTechniqueDetailProps {
  technique: AdvancedTechnique
  onSuccess?: () => void
}

export function AdvancedTechniqueDetail({ technique, onSuccess }: AdvancedTechniqueDetailProps) {
  return (
    <Card className="max-w-4xl mx-auto overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
      <CardHeader className="flex-shrink-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-200/60 rounded-full p-2">
            <span className="text-3xl">{technique.icon}</span>
          </div>
          <div className="flex-1">
            <CardTitle className="text-amber-900 font-bold text-lg">
              {technique.name}
            </CardTitle>
            <p className="text-slate-700 text-sm leading-relaxed mt-1">
              {technique.description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col pt-0">
        <div className="flex-1 overflow-auto space-y-6">
          <section>
            <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Overview
            </h3>
            <p className="text-slate-700 leading-relaxed">
              {technique.overview}
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              How It Works
            </h3>
            <p className="text-slate-700 leading-relaxed">
              {technique.howItWorks}
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Key Concepts
            </h3>
            <ul className="space-y-2">
              {technique.keyConcepts.map((concept, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-700">
                  <span className="text-amber-600 mt-1">•</span>
                  <span className="leading-relaxed">{concept}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Use Cases
            </h3>
            <div className="flex flex-wrap gap-2">
              {technique.useCases.map((useCase, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="border-amber-300 text-amber-800 bg-amber-50"
                >
                  {useCase}
                </Badge>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Why It Matters
            </h3>
            <p className="text-slate-700 leading-relaxed">
              {technique.whyItMatters}
            </p>
          </section>
        </div>

        <div className="flex-shrink-0 border-t border-amber-300 pt-4 mt-2">
          <ToolInterestForm
            techniqueName={technique.name}
            techniqueSlug={technique.slug}
            onSuccess={onSuccess}
            variant="light"
          />
        </div>
      </CardContent>
    </Card>
  )
}
