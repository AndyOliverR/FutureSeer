'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { ExternalLink, Database } from 'lucide-react'

interface DivinationSystemsCardProps {
  metadata: any
  className?: string
}

const SYSTEM_DISPLAY_NAMES: Record<string, string> = {
  vedic: 'Vedic Astrology',
  western: 'Western Astrology',
  numerology: 'Numerology',
  tarot: 'Tarot',
  iching: 'I Ching',
  runes: 'Runes',
  lenormand: 'Lenormand',
  bazi: 'BaZi (Four Pillars)',
  kp: 'KP Astrology',
  palmistry: 'Palmistry',
  faceReading: 'Face Reading',
  geomancy: 'Geomancy',
  pendulum: 'Pendulum',
  dreamSymbols: 'Dream Symbols',
  nameAnalysis: 'Name Analysis',
  angelNumbers: 'Angel Numbers',
  vastu: 'Vastu Shastra',
  markov_bayesian: 'AI Prediction Engine'
}

const SYSTEM_ROUTES: Record<string, string> = {
  vedic: '/tools/vedic',
  western: '/tools/western-astrology',
  numerology: '/tools/numerology',
  tarot: '/tools/tarot',
  iching: '/tools/iching',
  runes: '/tools/runes',
  lenormand: '/tools/lenormand',
  bazi: '/tools/bazi',
  kp: '/tools/kp-astrology',
  palmistry: '/tools/palmistry',
  faceReading: '/tools/face-reading',
  geomancy: '/tools/geomancy',
  pendulum: '/tools/pendulum',
  dreamSymbols: '/tools/dream-symbols',
  nameAnalysis: '/tools/name-analysis',
  angelNumbers: '/tools/angel-numbers',
  vastu: '/tools/vastu'
}

export function DivinationSystemsCard({ metadata, className = '' }: DivinationSystemsCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  if (!metadata) {
    return null
  }

  const systemsUsed = metadata.systemsUsed || []
  
  // Don't render if no systems are listed
  if (systemsUsed.length === 0) {
    return null;
  }
  const generatedAt = metadata.generatedAt ? new Date(metadata.generatedAt) : null
  const version = metadata.version || '1.0'
  const source = metadata.source || 'universal_api'

  // Calculate confidence (if available)
  const overallConfidence = metadata.confidenceScore 
    ? Math.round(metadata.confidenceScore * 100) 
    : 85

  // Calculate data freshness
  const getDataFreshness = () => {
    if (!generatedAt) return 'Unknown'
    
    const now = new Date()
    const diffMs = now.getTime() - generatedAt.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return generatedAt.toLocaleDateString()
  }

  return (
    <Card className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 ${className}`}>
      <CardHeader className="border-b border-amber-500/30">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-amber-400" />
          <CardTitle className="text-2xl font-bold font-serif text-amber-400">
            Divination Systems
          </CardTitle>
        </div>
        <p className="text-sm text-white/80 mt-2 font-light">
          {systemsUsed.length} systems analyzed your mystical profile
        </p>
      </CardHeader>
      
      <CardContent className="p-4">
        {/* Compact Summary */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-4 rounded-lg bg-[var(--m3-primary-container)] border border-[var(--m3-outline-variant)]">
            <p className="text-3xl font-serif text-[var(--m3-primary)]">{systemsUsed.length}</p>
            <p className="text-xs text-[var(--m3-on-surface-variant)] mt-1">Systems Used</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-[var(--m3-primary-container)] border border-[var(--m3-outline-variant)]">
            <p className="text-3xl font-serif text-[var(--m3-primary)]">{overallConfidence}%</p>
            <p className="text-xs text-[var(--m3-on-surface-variant)] mt-1">Confidence</p>
          </div>
        </div>

        {/* Show Details Button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-center m3-label-large text-[var(--m3-primary)] hover:text-[var(--m3-on-primary-container)] m3-transition-standard underline mb-2"
        >
          {showDetails ? 'Hide details' : 'Show details'}
        </button>

        {/* Collapsible Details */}
        <AnimatePresence>
          {showDetails && (
            <motion.div 
              className="mt-4 space-y-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ ease: [0, 0, 0.2, 1], duration: 0.3 }}
            >
            {/* Systems Grid */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--m3-primary)] mb-3">Active Systems</h3>
              <div className="grid grid-cols-2 gap-2">
                {systemsUsed.map((system: string, index: number) => {
                  const displayName = SYSTEM_DISPLAY_NAMES[system] || system
                  const route = SYSTEM_ROUTES[system]

                  return (
                    <div
                      key={index}
                      className="group relative"
                    >
                      {route ? (
                        <Link
                          href={route}
                          className="flex items-center justify-between p-3 rounded-lg bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] hover:border-[var(--m3-primary)]/30 hover:bg-[var(--m3-surface-container)] m3-transition-standard m3-elevation-1 hover:m3-elevation-2 m3-elevation-transition"
                        >
                          <span className="text-sm text-[var(--m3-on-surface)] font-light">{displayName}</span>
                          <ExternalLink className="w-3 h-3 text-[var(--m3-primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ) : (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)]">
                          <span className="text-sm text-[var(--m3-on-surface)] font-light">{displayName}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)]">
                <span className="text-xs text-[var(--m3-on-surface-variant)] font-light">Data Freshness</span>
                <Badge variant="outline" className="bg-[var(--m3-primary-container)] border-[var(--m3-outline-variant)] text-[var(--m3-on-primary-container)]">
                  {getDataFreshness()}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)]">
                <span className="text-xs text-[var(--m3-on-surface-variant)] font-light">Profile Version</span>
                <Badge variant="outline" className="bg-[var(--m3-primary-container)] border-[var(--m3-outline-variant)] text-[var(--m3-on-primary-container)]">
                  v{version}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)]">
                <span className="text-xs text-[var(--m3-on-surface-variant)] font-light">Data Source</span>
                <Badge variant="outline" className="bg-[var(--m3-primary-container)] border-[var(--m3-outline-variant)] text-[var(--m3-on-primary-container)]">
                  {source === 'universal_api' ? 'Universal API' : source}
                </Badge>
              </div>
            </div>

            {/* Regenerate Profile Link */}
            <Link
              href="/profile"
              className="block text-center px-4 py-2 rounded-lg bg-[var(--m3-primary-container)] border border-[var(--m3-outline-variant)] text-[var(--m3-on-primary-container)] text-sm font-light hover:bg-[var(--m3-primary-container)]/80 m3-transition-standard m3-elevation-1 hover:m3-elevation-2 m3-elevation-transition"
            >
              Update Mystical Profile
            </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Note */}
        <p className="m3-body-small text-[var(--m3-on-surface-variant)] text-center mt-4 font-light italic">
          Your profile data is synced across all divination tools
        </p>
      </CardContent>
    </Card>
  )
}
