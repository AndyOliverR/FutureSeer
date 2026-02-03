"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"

interface HebrewLetter {
  hebrew: string
  english: string
  value: number
  meaning: string
}

interface HebrewLetterGridProps {
  letters: HebrewLetter[]
  variant?: "dark" | "light"
}

export function HebrewLetterGrid({ letters, variant = "dark" }: HebrewLetterGridProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const isLight = variant === "light"

  const emptyClass = isLight
    ? "bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6"
    : "bg-amber-950/95 border border-amber-500/30 rounded-xl p-6"
  const emptyText = isLight ? "text-slate-700" : "text-slate-400"

  if (!letters || letters.length === 0) {
    return (
      <div className={emptyClass}>
        <div className="text-center">
          <p className={`m3-body-medium ${emptyText}`}>No Hebrew letters to display</p>
        </div>
      </div>
    )
  }

  const letterCardBase = isLight
    ? "bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl p-4"
    : "bg-amber-950/95 rounded-xl p-4 border border-amber-500/30"
  const letterCardHovered = isLight
    ? "border-cyan-400 scale-105 bg-cyan-100/80"
    : "border-amber-400/60 bg-amber-500/10 scale-105"
  const letterCardNotHovered = isLight ? "hover:border-cyan-300" : "hover:border-amber-400/40"
  const totalCardClass = isLight
    ? "mt-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-4 overflow-hidden"
    : "mt-4 bg-amber-950/95 rounded-xl p-4 border border-amber-500/30 overflow-hidden"
  const headingClass = isLight ? "m3-title-large text-slate-200 mb-4" : "m3-title-large text-amber-400 mb-4"
  const hebrewClass = isLight ? "m3-headline-small text-cyan-900" : "m3-headline-small text-white"
  const valueClass = isLight ? "m3-title-medium text-cyan-800" : "m3-title-medium text-amber-400"
  const englishClass = isLight ? "m3-body-small text-cyan-800 mb-2" : "m3-body-small text-amber-400 mb-2"
  const meaningClass = isLight ? "m3-body-small text-slate-700 leading-relaxed" : "m3-body-small text-slate-300 leading-relaxed"
  const totalLabelClass = isLight ? "m3-title-medium text-slate-700" : "m3-title-medium text-slate-300"
  const totalValueClass = isLight ? "m3-display-small text-purple-900" : "m3-display-small gold-glow"

  return (
    <div className="space-y-4">
      <h4 className={`${headingClass} flex items-center gap-2`}>
        <Sparkles className="w-5 h-5" />
        Letters in Your Name
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {letters.map((letter, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <Card
              elevation={1}
              className={`${letterCardBase} border transition-all cursor-pointer overflow-hidden ${
                hoveredIndex === index ? letterCardHovered : letterCardNotHovered
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={hebrewClass}>{letter.hebrew}</div>
                <div className={valueClass}>{letter.value}</div>
              </div>
              <p className={englishClass}>{letter.english}</p>
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: hoveredIndex === index ? 1 : 0.7,
                  height: "auto",
                }}
                className={meaningClass}
              >
                {letter.meaning}
              </motion.p>
            </Card>
          </motion.div>
        ))}
      </div>
      <Card elevation={1} className={totalCardClass}>
        <div className="flex items-center justify-between">
          <span className={totalLabelClass}>Total Gematria Value:</span>
          <span className={totalValueClass}>
            {letters.reduce((sum, letter) => sum + letter.value, 0)}
          </span>
        </div>
      </Card>
    </div>
  )
}

