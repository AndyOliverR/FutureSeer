'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Clock, TrendingUp } from 'lucide-react'
import { TruncatedText } from './TruncatedText'

interface DashaTimelineCardProps {
  dashaData: any
  className?: string
}

const PLANET_COLORS: Record<string, string> = {
  Sun: '#FFD700',
  Moon: '#C0C0C0',
  Mars: '#FF4500',
  Mercury: '#32CD32',
  Jupiter: '#4169E1',
  Venus: '#FF69B4',
  Saturn: '#708090',
  Rahu: '#8B0000',
  Ketu: '#4B0082'
}

export function DashaTimelineCard({ dashaData, className = '' }: DashaTimelineCardProps) {
  // Comprehensive validation
  if (!dashaData) return null;
  if (!dashaData.current) return null;
  
  // If current is a string (from timing.currentPeriod), show fallback
  if (typeof dashaData.current === 'string') {
    return (
      <Card className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 ${className}`}>
        <CardHeader className="border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-amber-400" />
            <CardTitle className="text-2xl font-bold font-sacred-heading text-amber-400">
              Planetary Periods
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {dashaData.overview && (
            <TruncatedText text={dashaData.overview} maxLength={150} className="text-[var(--m3-on-surface-variant)] font-sacred-body mb-4" />
          )}
          <p className="text-[var(--m3-primary)] font-sacred-body leading-relaxed">{dashaData.current}</p>
          {dashaData.timing && (
            <div className="mt-4 pt-4 border-t border-[var(--m3-outline-variant)]">
              <TruncatedText text={dashaData.timing} maxLength={150} className="text-sm text-[var(--m3-on-surface-variant)] font-sacred-body" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const getCurrentProgress = (currentPeriod: any) => {
    if (!currentPeriod || !currentPeriod.startDate || !currentPeriod.endDate) {
      return 0
    }

    const start = new Date(currentPeriod.startDate).getTime()
    const end = new Date(currentPeriod.endDate).getTime()
    const now = Date.now()

    if (now < start) return 0
    if (now > end) return 100

    const total = end - start
    const elapsed = now - start
    return Math.round((elapsed / total) * 100)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  const getPlanetColor = (planetName: string) => {
    return PLANET_COLORS[planetName] || '#FFA500'
  }

  const currentProgress = dashaData.current ? getCurrentProgress(dashaData.current) : 0

  return (
    <Card className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 ${className}`}>
      <CardHeader className="border-b border-amber-500/30">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-amber-400" />
          <CardTitle className="text-2xl font-bold font-serif text-amber-400">
            Dasha Timeline
          </CardTitle>
        </div>
        <p className="text-sm text-white/80 mt-2 font-light">
          Current and upcoming planetary periods influencing your life
        </p>
      </CardHeader>
      
      <CardContent className="p-4">
        {/* Overview */}
        {dashaData.overview && (
          <div className="mb-6 p-4 rounded-lg bg-[var(--m3-primary-container)] border border-[var(--m3-outline-variant)]">
            <TruncatedText text={dashaData.overview} maxLength={150} className="text-sm text-[var(--m3-on-surface-variant)]" />
          </div>
        )}

        {/* Current Dasha */}
        {dashaData.current && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold font-serif text-amber-400 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Current Period
              </h3>
              <span className="m3-label-small text-[var(--m3-on-surface-variant)] font-light">
                {currentProgress}% Complete
              </span>
            </div>

            <div className="p-4 rounded-lg bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getPlanetColor(dashaData.current.planet) }}
                    role="img"
                    aria-label={`${dashaData.current.planet} indicator`}
                  />
                  <span className="text-xl font-serif text-[var(--m3-on-surface)]">
                    {dashaData.current.planet || 'Unknown'} Dasha
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--m3-on-surface-variant)] font-light">
                    {formatDate(dashaData.current.startDate)} - {formatDate(dashaData.current.endDate)}
                  </p>
                </div>
              </div>

              <Progress 
                value={currentProgress} 
                className="h-2 mb-3"
                style={{
                  ['--progress-color' as any]: getPlanetColor(dashaData.current.planet)
                }}
              />

              {dashaData.current.effects && (
                <TruncatedText text={dashaData.current.effects} maxLength={150} className="text-sm text-[var(--m3-on-surface-variant)] font-light" />
              )}

              {dashaData.current.antardasha && (
                <div className="mt-3 pt-3 border-t border-[var(--m3-outline-variant)]">
                  <p className="text-xs text-amber-400 mb-1">Current Sub-Period:</p>
                  <p className="text-sm text-[var(--m3-on-surface-variant)] font-light">
                    {dashaData.current.antardasha}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upcoming Periods */}
        {dashaData.upcoming && dashaData.upcoming.length > 0 && (
          <div>
            <h3 className="text-base font-semibold font-serif text-amber-400 mb-3">
              Upcoming Periods
            </h3>

            <div className="space-y-3">
              {dashaData.upcoming.slice(0, 2).map((period: any, index: number) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] hover:border-[var(--m3-primary)]/30 m3-transition-standard m3-elevation-1 hover:m3-elevation-2 m3-elevation-transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: getPlanetColor(period.planet) }}
                        role="img"
                        aria-label={`${period.planet} indicator`}
                      />
                      <span className="text-base font-serif text-[var(--m3-on-surface)]">
                        {period.planet || 'Unknown'}
                      </span>
                    </div>
                    <span className="text-xs text-[var(--m3-on-surface-variant)] font-light">
                      {formatDate(period.startDate)}
                    </span>
                  </div>

                  {period.effects && (
                    <p className="text-xs text-[var(--m3-on-surface-variant)] font-light leading-relaxed">
                      {period.effects}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timing Insights */}
        {dashaData.timing && (
          <div className="mt-6 p-4 rounded-lg bg-[var(--m3-primary-container)] border border-[var(--m3-outline-variant)]">
            <h4 className="text-sm font-semibold text-amber-400 mb-2">Timing Insights</h4>
            <TruncatedText text={dashaData.timing} maxLength={150} className="m3-body-medium text-[var(--m3-on-surface-variant)]" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
