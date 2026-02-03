'use client'

import React from "react"
import { motion } from "framer-motion"

interface HeroWelcomeProps {
  userName: string
  lunarPhase: string
  dominantElement: string
}

export function HeroWelcome({ 
  userName, 
  lunarPhase, 
  dominantElement 
}: HeroWelcomeProps) {
  return (
    <motion.section 
      className="relative w-full rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 py-6 px-6 mb-2 overflow-visible"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: [0, 0, 0.2, 1], duration: 0.6 }}
    >
      {/* Welcome content */}
      <div className="flex flex-col items-start text-left w-full">
        <h2 className="text-2xl md:text-3xl font-bold font-sacred-heading text-amber-400 mb-2">
          Welcome back, <span className="italic">{userName}</span> ✨
        </h2>
        <div className="flex flex-col md:flex-row gap-2 md:gap-6 items-start md:items-center text-sm md:text-base font-sacred-body font-light text-white/80 mb-2">
          <span className="flex items-center gap-2">
            <span role="img" aria-label="moon phase">🌘</span> Lunar Phase: {lunarPhase}
          </span>
          <span className="hidden md:inline">|</span>
          <span className="flex items-center gap-2">
            <span role="img" aria-label="element">💧</span> Dominant Element: {dominantElement}
          </span>
        </div>
        <p className="text-sm text-white/80 font-sacred-body font-light max-w-xl leading-relaxed mt-2">
          The cosmos aligns in your favor, {userName}. Your intuition is strong today - trust the signs and let the stars guide your next steps.
        </p>
      </div>
    </motion.section>
  )
} 