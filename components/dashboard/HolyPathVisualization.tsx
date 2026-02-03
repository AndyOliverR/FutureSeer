'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Sparkles, CheckCircle, Circle } from 'lucide-react'
import { TruncatedText } from './TruncatedText'

interface HolyPathVisualizationProps {
  spiritualityData: any
  lifePurposeData: any
  className?: string
}

export function HolyPathVisualization({ 
  spiritualityData, 
  lifePurposeData,
  className = '' 
}: HolyPathVisualizationProps) {
  if (!spiritualityData && !lifePurposeData) {
    return null
  }

  // Validate we have meaningful data to display
  const hasSpirituData = spiritualityData && (spiritualityData.overview || spiritualityData.practices);
  const hasLifePurposeData = lifePurposeData && (lifePurposeData.overview || lifePurposeData.karmicLessons);

  if (!hasSpirituData && !hasLifePurposeData) {
    return null;
  }

  // Calculate progress based on karmic lessons and practices
  const karmicLessons = lifePurposeData?.karmicLessons || []
  const practices = spiritualityData?.practices || []
  const totalMilestones = karmicLessons.length + practices.length
  const progressPercentage = totalMilestones > 0 ? Math.min(45, (totalMilestones * 15)) : 25

  const milestones = [
    {
      id: 'awareness',
      title: 'Self-Awareness',
      description: 'Understanding your true nature and life purpose',
      completed: true
    },
    {
      id: 'practice',
      title: 'Daily Practice',
      description: 'Incorporating spiritual rituals into daily life',
      completed: practices.length > 0
    },
    {
      id: 'karma',
      title: 'Karmic Understanding',
      description: 'Learning and resolving karmic patterns',
      completed: karmicLessons.length > 0
    },
    {
      id: 'evolution',
      title: 'Soul Evolution',
      description: 'Progressing on your spiritual journey',
      completed: false
    },
    {
      id: 'enlightenment',
      title: 'Higher Consciousness',
      description: 'Approaching spiritual enlightenment',
      completed: false
    }
  ]

  return (
    <Card className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 overflow-hidden ${className}`}>
      {/* Sacred Geometry Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Flower of Life pattern */}
          <defs>
            <pattern id="flowerOfLife" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="20" fill="none" stroke="var(--m3-primary)" strokeWidth="0.5"/>
              <circle cx="70" cy="50" r="20" fill="none" stroke="#FFD700" strokeWidth="0.5"/>
              <circle cx="30" cy="50" r="20" fill="none" stroke="#FFD700" strokeWidth="0.5"/>
              <circle cx="50" cy="67" r="20" fill="none" stroke="#FFD700" strokeWidth="0.5"/>
              <circle cx="50" cy="33" r="20" fill="none" stroke="#FFD700" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="200" height="200" fill="url(#flowerOfLife)"/>
        </svg>
      </div>

      <CardHeader className="border-b border-amber-500/30 relative z-10">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-amber-400" />
          <CardTitle className="text-2xl font-bold font-serif text-amber-400">
            Your Holy Path
          </CardTitle>
        </div>
        <p className="text-sm text-white/80 mt-2 font-light">
          Track your spiritual evolution and soul's journey
        </p>
      </CardHeader>
      
      <CardContent className="p-4 relative z-10">
        {/* Overall Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="m3-title-medium font-serif text-[var(--m3-primary)]">Spiritual Progress</h3>
            <span className="m3-headline-small font-serif text-[var(--m3-primary)]">{progressPercentage}%</span>
          </div>
          
          <Progress 
            value={progressPercentage} 
            className="h-3 bg-[var(--m3-surface-container-low)]"
          />
          
          <p className="text-xs text-[var(--m3-on-surface-variant)] mt-2 font-light">
            Your journey towards spiritual enlightenment continues...
          </p>
        </div>

        {/* Milestones */}
        <div className="mb-8">
          <h3 className="text-base font-serif text-[var(--m3-primary)] mb-4">Spiritual Milestones</h3>
          
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className="flex items-start gap-4"
              >
                {/* Milestone indicator */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center m3-transition-standard ${
                      milestone.completed
                        ? 'bg-[var(--m3-primary)] m3-elevation-2'
                        : 'bg-[var(--m3-surface-container-low)] border-2 border-[var(--m3-outline-variant)]'
                    }`}
                  >
                    {milestone.completed ? (
                      <CheckCircle className="w-5 h-5 text-[var(--m3-on-primary)]" />
                    ) : (
                      <Circle className="w-5 h-5 text-[var(--m3-primary)]/50" />
                    )}
                  </div>
                  
                  {/* Connecting line */}
                  {index < milestones.length - 1 && (
                    <div
                      className={`w-0.5 h-12 my-1 ${
                        milestone.completed
                          ? 'bg-[var(--m3-primary)]/30'
                          : 'bg-[var(--m3-surface-container)]'
                      }`}
                    />
                  )}
                </div>

                {/* Milestone content */}
                <div className="flex-1 pb-4">
                  <h4 className={`font-serif text-base mb-1 ${
                    milestone.completed ? 'text-[var(--m3-primary)]' : 'text-[var(--m3-on-surface-variant)]'
                  }`}>
                    {milestone.title}
                  </h4>
                  <p className={`text-sm font-light ${
                      milestone.completed ? 'text-[var(--m3-on-surface-variant)]' : 'text-[var(--m3-on-surface-variant)]'
                  }`}>
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Soul Evolution Insights */}
        {lifePurposeData?.soulEvolution && (
          <div className="mb-6 p-4 rounded-lg bg-[var(--m3-primary-container)] border border-[var(--m3-outline-variant)]">
            <h4 className="text-sm font-semibold text-[var(--m3-primary)] mb-2">Soul Evolution</h4>
            <TruncatedText text={lifePurposeData.soulEvolution} maxLength={150} className="text-sm text-[var(--m3-on-surface-variant)]" />
          </div>
        )}

        {/* Spiritual Practices */}
        {spiritualityData?.evolution && (
          <div className="p-4 rounded-lg bg-[var(--m3-primary-container)] border border-[var(--m3-outline-variant)]">
            <h4 className="m3-title-small font-semibold text-[var(--m3-primary)] mb-2">Evolution Path</h4>
            <TruncatedText text={spiritualityData.evolution} maxLength={150} className="m3-body-medium text-[var(--m3-on-surface-variant)]" />
          </div>
        )}

        {/* Karmic Lessons Summary */}
        {karmicLessons.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-[var(--m3-primary)] mb-3">
              Active Karmic Lessons ({karmicLessons.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {karmicLessons.slice(0, 3).map((lesson: string, index: number) => (
                <div
                  key={index}
                  className="px-3 py-1.5 rounded-full bg-[var(--m3-primary-container)] border border-[var(--m3-outline-variant)] text-xs text-[var(--m3-on-primary-container)] font-light"
                >
                  {lesson.length > 30 ? lesson.substring(0, 30) + '...' : lesson}
                </div>
              ))}
              {karmicLessons.length > 3 && (
                <div className="px-3 py-1.5 rounded-full bg-[var(--m3-surface-container)] border border-[var(--m3-outline-variant)] text-xs text-[var(--m3-on-surface-variant)]">
                  +{karmicLessons.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
