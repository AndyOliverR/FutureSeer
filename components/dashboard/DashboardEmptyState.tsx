'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Sparkles, Star, Moon, Sun } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface DashboardEmptyStateProps {
  userName?: string
}

export function DashboardEmptyState({ userName = 'Seeker' }: DashboardEmptyStateProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <Card elevation={3} className="max-w-2xl w-full backdrop-blur-md bg-[var(--m3-surface-container)] border-[var(--m3-outline-variant)] card-sacred-glow overflow-hidden">
        {/* Sacred Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
              <pattern id="sacredGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="15" fill="none" stroke="#FFD700" strokeWidth="0.5"/>
                <path d="M 20 5 L 20 35 M 5 20 L 35 20" stroke="#FFD700" strokeWidth="0.3"/>
              </pattern>
            </defs>
            <rect width="200" height="200" fill="url(#sacredGrid)"/>
          </svg>
        </div>

        <CardContent className="p-12 text-center relative z-10">
          {/* Mystical Icons */}
          <motion.div 
            className="flex justify-center items-center gap-6 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ease: [0, 0, 0.2, 1], duration: 1 }}
          >
            <Sun className="w-12 h-12 text-[var(--m3-primary)] animate-pulse" style={{ animationDuration: '3s' }} />
            <div className="relative">
              <Sparkles className="w-16 h-16 text-[var(--m3-tertiary)] animate-pulse" style={{ animationDuration: '2s' }} />
              <Star 
                className="w-6 h-6 text-[var(--m3-primary)] absolute -top-2 -right-2 animate-pulse" 
                style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} 
              />
            </div>
            <Moon className="w-12 h-12 text-indigo-300 animate-pulse" style={{ animationDuration: '3.5s' }} />
          </motion.div>

          {/* Heading */}
          <motion.h2 
            className="text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-[var(--m3-on-primary-container)] via-[var(--m3-tertiary)] to-[var(--m3-primary)] mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: [0, 0, 0.2, 1], duration: 0.8 }}
          >
            Welcome, {userName}
          </motion.h2>

          {/* Main Message */}
          <motion.p 
            className="m3-headline-small text-[var(--m3-on-surface)] mb-6 font-light leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: [0, 0, 0.2, 1], duration: 0.8, delay: 0.2 }}
          >
            Your Sacred Profile Awaits
          </motion.p>

          <motion.p 
            className="m3-body-large text-[var(--m3-on-surface-variant)] mb-8 max-w-lg mx-auto font-light leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: [0, 0, 0.2, 1], duration: 0.8, delay: 0.4 }}
          >
            Generate your comprehensive mystical profile to unlock personalized insights from over 
            <span className="text-[var(--m3-primary)] font-semibold"> 60+ ancient divination systems</span>.
          </motion.p>

          {/* What Will Be Revealed */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: [0, 0, 0.2, 1], duration: 0.8, delay: 0.6 }}
          >
            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20">
              <h3 className="text-sm font-serif text-purple-300 mb-2 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Life Guidance Dashboard
              </h3>
              <p className="text-xs text-[var(--m3-on-surface-variant)] font-light">
                Comprehensive insights across personality, purpose, relationships, career, health & spirituality
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[var(--m3-primary-container)] border border-[var(--m3-outline-variant)]">
              <h3 className="text-sm font-serif text-[var(--m3-primary)] mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                View Detailed Charts
              </h3>
              <p className="text-xs text-[var(--m3-on-surface-variant)] font-light">
                Access detailed Vedic birth charts on the Tools page
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-500/20">
              <h3 className="text-sm font-serif text-rose-300 mb-2 flex items-center gap-2">
                <Moon className="w-4 h-4" />
                Planetary Timeline
              </h3>
              <p className="text-xs text-[var(--m3-on-surface-variant)] font-light">
                Current and upcoming dasha periods with guidance
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <h3 className="text-sm font-serif text-green-300 mb-2 flex items-center gap-2">
                <Sun className="w-4 h-4" />
                Sacred Practices
              </h3>
              <p className="text-xs text-[var(--m3-on-surface-variant)] font-light">
                Personalized mantras, gemstones, and daily rituals
              </p>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ease: [0, 0, 0.2, 1], duration: 0.8, delay: 0.8 }}
          >
            <Link
              href="/profile"
              variant="filled"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-[var(--m3-primary)] hover:bg-[var(--m3-primary)]/90 text-[var(--m3-on-primary)] font-semibold m3-label-large m3-transition-emphasized m3-elevation-2 hover:m3-elevation-3 m3-elevation-transition m3-gpu-accelerated button-glow"
            >
              <Sparkles className="w-6 h-6" />
              Generate My Mystical Profile
              <Sparkles className="w-6 h-6" />
            </Link>
          </motion.div>

          {/* Additional Info */}
          <motion.p 
            className="text-xs text-[var(--m3-on-surface-variant)] mt-6 font-light italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ease: [0, 0, 0.2, 1], duration: 1, delay: 1 }}
          >
            Takes 2-3 minutes • NASA-validated astronomy • Time-tested traditions
          </motion.p>
        </CardContent>
      </Card>
    </div>
  )
}
