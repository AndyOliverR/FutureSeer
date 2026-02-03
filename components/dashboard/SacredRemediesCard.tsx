'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Gem, Book, Check } from 'lucide-react'
import { TruncatedText } from './TruncatedText'
import { MantraCollapsible } from './MantraCollapsible'
import { AffiliateLink } from '@/components/AffiliateLink'
import { getGemstoneAffiliateUrl } from '@/lib/affiliateConfig'

interface SacredRemediesCardProps {
  remediesData: any
  className?: string
}

export function SacredRemediesCard({ remediesData, className = '' }: SacredRemediesCardProps) {
  const [completedPractices, setCompletedPractices] = useState<Set<string>>(new Set())

  if (!remediesData) {
    return null
  }

  // Validate that we have at least some remedies data
  const hasMantras = remediesData.mantras && remediesData.mantras.length > 0;
  const hasGemstones = remediesData.gemstones && remediesData.gemstones.length > 0;
  const hasPractices = remediesData.practices && remediesData.practices.length > 0;

  if (!hasMantras && !hasGemstones && !hasPractices) {
    return null;
  }

  const togglePractice = (practice: string) => {
    setCompletedPractices(prev => {
      const newSet = new Set(prev)
      if (newSet.has(practice)) {
        newSet.delete(practice)
      } else {
        newSet.add(practice)
      }
      return newSet
    })
  }

  return (
    <Card className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 ${className}`}>
      <CardHeader className="border-b border-amber-500/30">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-amber-400" />
          <CardTitle className="text-2xl font-bold font-serif text-amber-400">
            Sacred Remedies
          </CardTitle>
        </div>
        <p className="text-sm text-white/80 mt-2 font-light">
          Vedic practices to harmonize planetary influences
        </p>
      </CardHeader>
      
      <CardContent className="p-4">
        {/* Overview */}
        {remediesData.overview && (
          <div className="mb-4 p-4 rounded-lg bg-[var(--m3-primary-container)] border border-[var(--m3-outline-variant)]">
            <TruncatedText text={remediesData.overview} maxLength={150} className="text-sm text-[var(--m3-on-surface-variant)]" />
          </div>
        )}

        <div className="space-y-4">
          {/* Mantras */}
          {remediesData.mantras && remediesData.mantras.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Book className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-semibold font-serif text-amber-400">Sacred Mantras</h3>
              </div>
              
              <MantraCollapsible mantras={remediesData.mantras} maxInitial={3} />

              <p className="text-xs text-[var(--m3-on-surface-variant)] mt-2 font-light italic">
                Chant these mantras during sunrise or meditation for best results
              </p>
            </div>
          )}

          {/* Gemstones */}
          {remediesData.gemstones && remediesData.gemstones.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Gem className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-semibold font-serif text-amber-400">Recommended Gemstones</h3>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {remediesData.gemstones.slice(0, 4).map((gemstone: string, index: number) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-[var(--m3-primary-container)] border-[var(--m3-outline-variant)] text-[var(--m3-on-primary-container)] px-3 py-1.5"
                  >
                    {gemstone}
                  </Badge>
                ))}
                {remediesData.gemstones.length > 4 && (
                  <Badge
                    variant="outline"
                    className="bg-[var(--m3-surface-container)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface-variant)] px-3 py-1.5"
                  >
                    +{remediesData.gemstones.length - 4} more
                  </Badge>
                )}
              </div>

              <p className="text-xs text-[var(--m3-on-surface-variant)] mt-2 font-light italic">
                Wear on appropriate fingers as advised by a Vedic astrologer
              </p>
              <AffiliateLink href={getGemstoneAffiliateUrl(remediesData.gemstones[0] || 'gemstone')} label="Explore" className="mt-2 text-amber-400" />
            </div>
          )}

          {/* Practices */}
          {remediesData.practices && remediesData.practices.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-semibold font-serif text-amber-400">Daily Practices</h3>
                </div>
                <span className="text-xs text-[var(--m3-on-surface-variant)] font-light">
                  {completedPractices.size} / {remediesData.practices.length} completed today
                </span>
              </div>
              
              <div className="space-y-2">
                {remediesData.practices.map((practice: string, index: number) => {
                  const practiceId = `practice-${index}`
                  const isCompleted = completedPractices.has(practiceId)

                  return (
                    <button
                      key={index}
                      onClick={() => togglePractice(practiceId)}
                      className={`w-full p-3 rounded-lg border m3-ripple m3-button-bounce m3-transition-standard m3-elevation-1 hover:m3-elevation-2 m3-elevation-transition will-change-transform text-left ${
                        isCompleted
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] hover:border-[var(--m3-primary)]/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                            isCompleted
                              ? 'border-green-400 bg-green-400'
                              : 'border-[var(--m3-primary)]/50'
                          }`}
                        >
                          {isCompleted && (
                            <Check className="w-3 h-3 text-[var(--m3-on-primary)]" />
                          )}
                        </div>
                        <p className={`text-sm leading-relaxed font-light ${
                          isCompleted ? 'text-[var(--m3-on-surface-variant)] line-through' : 'text-[var(--m3-on-surface)]'
                        }`}>
                          {practice}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>

              <p className="text-xs text-[var(--m3-on-surface-variant)] mt-2 font-light italic">
                Track your daily spiritual practices (resets each day)
              </p>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-[var(--m3-outline-variant)]">
          <p className="text-xs text-[var(--m3-on-surface-variant)] text-center font-light italic">
            These remedies are based on your Vedic birth chart. Consistency is key for maximum benefit.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
