"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { ToolInterestForm } from './ToolInterestForm'
import { AdvancedTechnique } from '@/lib/data/advancedTechniques'
import { Sparkles } from 'lucide-react'

interface AdvancedTechniqueModalProps {
  technique: AdvancedTechnique | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AdvancedTechniqueModal({ technique, isOpen, onClose }: AdvancedTechniqueModalProps) {
  if (!technique) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-slate-900/95 border-amber-500/50 backdrop-blur-md">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{technique.icon}</div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-serif bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent">
                {technique.name}
              </DialogTitle>
              <DialogDescription className="text-slate-400 mt-1">
                {technique.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
          <div className="space-y-6">
            {/* Overview Section */}
            <section>
              <h3 className="text-lg font-semibold text-amber-300 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Overview
              </h3>
              <p className="text-slate-300 leading-relaxed">
                {technique.overview}
              </p>
            </section>

            {/* How It Works Section */}
            <section>
              <h3 className="text-lg font-semibold text-amber-300 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                How It Works
              </h3>
              <p className="text-slate-300 leading-relaxed">
                {technique.howItWorks}
              </p>
            </section>

            {/* Key Concepts Section */}
            <section>
              <h3 className="text-lg font-semibold text-amber-300 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Key Concepts
              </h3>
              <ul className="space-y-2">
                {technique.keyConcepts.map((concept, index) => (
                  <li key={index} className="flex items-start gap-2 text-slate-300">
                    <span className="text-amber-400 mt-1">•</span>
                    <span className="leading-relaxed">{concept}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Use Cases Section */}
            <section>
              <h3 className="text-lg font-semibold text-amber-300 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Use Cases
              </h3>
              <div className="flex flex-wrap gap-2">
                {technique.useCases.map((useCase, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="border-amber-500/30 text-amber-300 bg-amber-500/10"
                  >
                    {useCase}
                  </Badge>
                ))}
              </div>
            </section>

            {/* Why It Matters Section */}
            <section>
              <h3 className="text-lg font-semibold text-amber-300 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Why It Matters
              </h3>
              <p className="text-slate-300 leading-relaxed">
                {technique.whyItMatters}
              </p>
            </section>

            {/* Interest Form */}
            <ToolInterestForm 
              techniqueName={technique.name}
              techniqueSlug={technique.slug}
              onSuccess={onClose}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

