'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Target, Activity, Sparkles, User, Briefcase, ChevronDown, ChevronUp } from 'lucide-react'
import { TruncatedText } from './TruncatedText'
import { CollapsibleList } from './CollapsibleList'

interface PlanetaryInsightsCardProps {
  interpretations: any
  className?: string
}

interface InsightSection {
  id: string
  title: string
  icon: React.ReactNode
  data: any
  color: string
}

export function PlanetaryInsightsCard({ interpretations, className = '' }: PlanetaryInsightsCardProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set([]))

  if (!interpretations) {
    return null
  }

  // Filter out sections without data before rendering
  const sectionsWithData = [
    {
      id: 'personality',
      title: 'Personality Overview',
      icon: <User className="w-5 h-5" />,
      data: interpretations.personality,
      color: 'from-purple-400 to-pink-400'
    },
    {
      id: 'lifePurpose',
      title: 'Life Purpose & Dharma',
      icon: <Target className="w-5 h-5" />,
      data: interpretations.lifePurpose,
      color: 'from-amber-400 to-orange-400'
    },
    {
      id: 'relationships',
      title: 'Relationships & Marriage',
      icon: <Heart className="w-5 h-5" />,
      data: interpretations.relationships,
      color: 'from-rose-400 to-red-400'
    },
    {
      id: 'career',
      title: 'Career & Success Path',
      icon: <Briefcase className="w-5 h-5" />,
      data: interpretations.career,
      color: 'from-blue-400 to-cyan-400'
    },
    {
      id: 'health',
      title: 'Health & Wellness',
      icon: <Activity className="w-5 h-5" />,
      data: interpretations.health,
      color: 'from-green-400 to-emerald-400'
    },
    {
      id: 'spirituality',
      title: 'Spiritual Evolution',
      icon: <Sparkles className="w-5 h-5" />,
      data: interpretations.spirituality,
      color: 'from-indigo-400 to-violet-400'
    }
  ].filter(section => {
    const data = section.data;
    return data && (
      data.overview || 
      (data.strengths && data.strengths.length > 0) ||
      (data.karmicLessons && data.karmicLessons.length > 0) ||
      (data.suitableProfessions && data.suitableProfessions.length > 0)
    );
  });

  if (sectionsWithData.length === 0) {
    return null;
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  const sections: InsightSection[] = sectionsWithData;

  const renderSectionContent = (section: InsightSection) => {
    const data = section.data
    if (!data) return null

    return (
      <div className="space-y-4">
        {data.overview && (
          <div>
            <h4 className="text-sm font-semibold text-amber-400 mb-2">Overview</h4>
            <TruncatedText text={data.overview} maxLength={200} />
          </div>
        )}

        {data.strengths && data.strengths.length > 0 && (
          <CollapsibleList
            title="Strengths"
            items={data.strengths}
            maxInitial={3}
            color="amber"
          />
        )}

        {data.challenges && data.challenges.length > 0 && (
          <CollapsibleList
            title="Challenges"
            items={data.challenges}
            maxInitial={3}
            color="amber"
          />
        )}

        {data.karmicLessons && data.karmicLessons.length > 0 && (
          <CollapsibleList
            title="Karmic Lessons"
            items={data.karmicLessons}
            maxInitial={3}
            color="amber"
          />
        )}

        {data.spiritualPath && (
          <div>
            <h4 className="text-sm font-semibold text-amber-400 mb-2">Spiritual Path</h4>
            <TruncatedText text={data.spiritualPath} maxLength={200} />
          </div>
        )}

        {data.soulEvolution && (
          <div>
            <h4 className="text-sm font-semibold text-amber-400 mb-2">Soul Evolution</h4>
            <TruncatedText text={data.soulEvolution} maxLength={200} />
          </div>
        )}

        {data.marriageTiming && (
          <div>
            <h4 className="text-sm font-semibold text-amber-400 mb-2">Marriage Timing</h4>
            <TruncatedText text={data.marriageTiming} maxLength={200} />
          </div>
        )}

        {data.compatibility && (
          <div>
            <h4 className="text-sm font-semibold text-amber-400 mb-2">Compatibility</h4>
            <TruncatedText text={data.compatibility} maxLength={200} />
          </div>
        )}

        {data.familyLife && (
          <div>
            <h4 className="text-sm font-semibold text-amber-400 mb-2">Family Life</h4>
            <TruncatedText text={data.familyLife} maxLength={200} />
          </div>
        )}

        {data.suitableProfessions && data.suitableProfessions.length > 0 && (
          <CollapsibleList
            title="Suitable Professions"
            items={data.suitableProfessions}
            maxInitial={3}
            color="amber"
          />
        )}

        {data.successFactors && data.successFactors.length > 0 && (
          <CollapsibleList
            title="Success Factors"
            items={data.successFactors}
            maxInitial={3}
            color="amber"
          />
        )}

        {data.timing && (
          <div>
            <h4 className="text-sm font-semibold text-amber-400 mb-2">Timing Insights</h4>
            <TruncatedText text={data.timing} maxLength={200} />
          </div>
        )}

        {data.constitution && (
          <div>
            <h4 className="text-sm font-semibold text-amber-400 mb-2">Constitution</h4>
            <TruncatedText text={data.constitution} maxLength={200} />
          </div>
        )}

        {data.healthTips && data.healthTips.length > 0 && (
          <CollapsibleList
            title="Health Tips"
            items={data.healthTips}
            maxInitial={3}
            color="amber"
          />
        )}

        {data.vulnerableAreas && data.vulnerableAreas.length > 0 && (
          <CollapsibleList
            title="Vulnerable Areas"
            items={data.vulnerableAreas}
            maxInitial={3}
            color="amber"
          />
        )}

        {data.practices && data.practices.length > 0 && (
          <CollapsibleList
            title="Recommended Practices"
            items={data.practices}
            maxInitial={3}
            color="amber"
          />
        )}

        {data.evolution && (
          <div>
            <h4 className="text-sm font-semibold text-amber-400 mb-2">Evolution Path</h4>
            <TruncatedText text={data.evolution} maxLength={200} />
          </div>
        )}

        {data.divineConnection && (
          <div>
            <h4 className="text-sm font-semibold text-amber-400 mb-2">Divine Connection</h4>
            <TruncatedText text={data.divineConnection} maxLength={200} />
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 ${className}`}>
      <CardHeader className="border-b border-[var(--m3-outline-variant)]">
        <CardTitle className="text-2xl font-bold font-serif text-amber-400">
          Life Insights
        </CardTitle>
        <p className="text-sm text-white/80 mt-2 font-light">
          Comprehensive guidance across all areas of your life
        </p>
      </CardHeader>
      
      <CardContent className="p-4">
        <motion.div 
          className="space-y-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1,
              },
            },
          }}
        >
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    ease: [0, 0, 0.2, 1],
                    duration: 0.3,
                  },
                },
              }}
              className="rounded-lg border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden hover:border-amber-500/50 transition-all duration-300"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-[var(--m3-surface-container)] m3-ripple m3-button-bounce m3-transition-standard will-change-transform"
                aria-expanded={expandedSections.has(section.id)}
                aria-controls={`section-${section.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${section.color}`}>
                    {section.icon}
                  </div>
                  <span className="text-lg font-semibold font-serif text-amber-400">{section.title}</span>
                </div>
                {expandedSections.has(section.id) ? (
                  <ChevronUp className="w-5 h-5 text-amber-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-amber-400" />
                )}
              </button>

              <AnimatePresence>
                {expandedSections.has(section.id) && (
                  <motion.div
                    id={`section-${section.id}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ ease: [0, 0, 0.2, 1], duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0">
                      {renderSectionContent(section)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  )
}
