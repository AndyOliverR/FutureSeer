"use client"

import { motion } from "framer-motion"
import { Hash, Calculator } from "lucide-react"
import { Card } from "@/components/ui/card"

interface GematriaVisualizationProps {
  name: string
  nameValue: number
  birthValue: number
  letters: Array<{ hebrew: string; english: string; value: number }>
  variant?: "dark" | "light"
}

export function GematriaVisualization({
  name,
  nameValue,
  birthValue,
  letters,
  variant = "dark",
}: GematriaVisualizationProps) {
  const isLight = variant === "light"
  const calculationSteps = letters.map((letter, index) => ({
    letter: letter.english,
    hebrew: letter.hebrew,
    value: letter.value,
    cumulative: letters
      .slice(0, index + 1)
      .reduce((sum, l) => sum + l.value, 0),
  }))

  const breakdownCardClass = isLight
    ? "bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl p-6 overflow-hidden shadow-md"
    : "bg-amber-950/95 rounded-xl p-6 border border-amber-500/30 overflow-hidden"
  const breakdownTitleClass = isLight ? "m3-title-large text-cyan-900 mb-4" : "m3-title-large text-white mb-4"
  const breakdownIconClass = isLight ? "text-cyan-600" : "text-amber-400"
  const stepRowClass = isLight
    ? "flex items-center justify-between p-3 bg-cyan-50/60 rounded-lg"
    : "flex items-center justify-between p-3 bg-amber-900/30 rounded-lg"
  const stepValueClass = isLight ? "m3-label-medium text-cyan-800 w-8" : "m3-label-medium text-amber-400 w-8"
  const stepHebrewClass = isLight ? "m3-title-medium text-cyan-900" : "m3-title-medium text-white"
  const stepMetaClass = isLight ? "m3-body-small text-slate-700" : "m3-body-small text-slate-300"

  const nameCardClass = isLight
    ? "bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 overflow-hidden shadow-md"
    : "bg-amber-950/95 rounded-xl p-6 border border-amber-500/30 overflow-hidden"
  const birthCardClass = isLight
    ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-6 overflow-hidden shadow-md"
    : "bg-amber-950/95 rounded-xl p-6 border border-amber-500/30 overflow-hidden"
  const nameTitleClass = isLight ? "m3-title-large text-purple-900" : "m3-title-large text-white"
  const birthTitleClass = isLight ? "m3-title-large text-amber-900" : "m3-title-large text-white"
  const nameIconClass = isLight ? "text-purple-600" : "text-amber-400"
  const birthIconClass = isLight ? "text-amber-600" : "text-amber-400"
  const nameValueClass = isLight ? "m3-display-small text-purple-900 mb-2" : "m3-display-small gold-glow mb-2"
  const birthValueClass = isLight ? "m3-display-small text-amber-900 mb-2" : "m3-display-small gold-glow mb-2"
  const nameDescClass = isLight ? "m3-body-small text-slate-700" : "m3-body-small text-slate-300"
  const birthDescClass = isLight ? "m3-body-small text-slate-700" : "m3-body-small text-slate-300"

  return (
    <div className="space-y-6">
      <Card elevation={1} className={breakdownCardClass}>
        <h4 className={`${breakdownTitleClass} flex items-center gap-2`}>
          <Calculator className={`w-5 h-5 ${breakdownIconClass}`} />
          Calculation Breakdown
        </h4>
        <div className="space-y-3 overflow-hidden rounded-lg">
          {calculationSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={stepRowClass}
            >
              <div className="flex items-center gap-3">
                <span className={stepValueClass}>{step.value}</span>
                <span className={stepHebrewClass}>{step.hebrew}</span>
                <span className={stepMetaClass}>({step.letter})</span>
              </div>
              <span className={stepMetaClass}>= {step.cumulative}</span>
            </motion.div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card elevation={1} className={nameCardClass}>
            <div className="flex items-center gap-2 mb-3">
              <Hash className={`w-5 h-5 ${nameIconClass}`} />
              <h5 className={nameTitleClass}>Name Gematria</h5>
            </div>
            <div className={nameValueClass}>{nameValue}</div>
            <p className={nameDescClass}>
              Total value of &quot;{name}&quot;
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card elevation={1} className={birthCardClass}>
            <div className="flex items-center gap-2 mb-3">
              <Hash className={`w-5 h-5 ${birthIconClass}`} />
              <h5 className={birthTitleClass}>Birth Date Value</h5>
            </div>
            <div className={birthValueClass}>{birthValue}</div>
            <p className={birthDescClass}>Numerical value of birth date</p>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

