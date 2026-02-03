"use client"

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getToolIntroduction } from '@/lib/data/toolIntroductions'
import { DevotionistStyleCard } from '@/components/western/DevotionistStyleCard'
import { Sparkles, BookOpen, Brain, Target, Lightbulb, Heart, Info, Star } from 'lucide-react'

interface ToolIntroductionTabProps {
  toolSlug: string;
}

export function ToolIntroductionTab({ toolSlug }: ToolIntroductionTabProps) {
  const introduction = getToolIntroduction(toolSlug)

  if (!introduction) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">Introduction content coming soon...</p>
      </div>
    )
  }

  // Convert key concepts to structured items
  const keyConceptsItems = introduction.keyConcepts.map(concept => ({
    text: concept,
    type: 'neutral' as const
  }))

  // Convert use cases to structured items
  const useCasesItems = introduction.useCases.map(useCase => ({
    text: useCase,
    type: 'positive' as const
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-purple-200/60 rounded-full p-3">
              <div className="text-4xl">{introduction.icon}</div>
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-serif text-purple-900">
                {introduction.name}
              </CardTitle>
              <p className="text-slate-700 mt-1">{introduction.description}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overview Section */}
      <DevotionistStyleCard
        icon={<Info className="w-6 h-6" />}
        title="Overview"
        summary={introduction.overview}
        variant="callout"
        colorScheme="amber"
      />

      {/* How It Works Section */}
      <DevotionistStyleCard
        icon={<Brain className="w-6 h-6" />}
        title="How It Works"
        summary={introduction.howItWorks}
        variant="default"
        colorScheme="blue"
      />

      {/* Key Concepts Section */}
      <DevotionistStyleCard
        icon={<BookOpen className="w-6 h-6" />}
        title="Key Concepts"
        summary="Understanding the fundamental concepts that form the foundation of this divination system:"
        items={keyConceptsItems}
        variant="default"
        colorScheme="purple"
      />

      {/* Use Cases Section */}
      <DevotionistStyleCard
        icon={<Target className="w-6 h-6" />}
        title="Use Cases"
        summary="Practical applications where this system can provide valuable insights and guidance:"
        items={useCasesItems}
        variant="default"
        colorScheme="green"
      />

      {/* Why It Matters Section */}
      <DevotionistStyleCard
        icon={<Heart className="w-6 h-6" />}
        title="Why It Matters"
        summary={introduction.whyItMatters}
        variant="callout"
        colorScheme="pink"
      />
    </div>
  )
}

