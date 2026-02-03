"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"

interface NumberDisplayProps {
  number: number
  label: string
  description?: string
  size?: "sm" | "md" | "lg"
  delay?: number
  colorScheme?: "amber" | "cyan" | "purple" | "blue"
}

const lightScheme = {
  amber: {
    card: "bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md",
    label: "text-amber-900",
    desc: "text-amber-800",
    number: "text-amber-900",
  },
  cyan: {
    card: "bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl shadow-md",
    label: "text-cyan-900",
    desc: "text-cyan-800",
    number: "text-cyan-900",
  },
  purple: {
    card: "bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl shadow-md",
    label: "text-purple-900",
    desc: "text-purple-800",
    number: "text-purple-900",
  },
  blue: {
    card: "bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl shadow-md",
    label: "text-blue-900",
    desc: "text-blue-800",
    number: "text-blue-900",
  },
}

export function NumberDisplay({
  number,
  label,
  description,
  size = "md",
  delay = 0,
  colorScheme,
}: NumberDisplayProps) {
  const [displayNumber, setDisplayNumber] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    const duration = 1000
    const steps = 30
    const increment = number / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current = Math.min(increment * step, number)
      setDisplayNumber(Math.floor(current))

      if (step >= steps) {
        setDisplayNumber(number)
        clearInterval(timer)
        setIsAnimating(false)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [number])

  const displayClass =
    size === "sm" ? "m3-display-small" : size === "lg" ? "m3-display-large" : "m3-display-medium"

  const light = colorScheme && lightScheme[colorScheme]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card
        elevation={1}
        className={
          light
            ? `rounded-xl p-6 text-center overflow-hidden ${light.card}`
            : "bg-amber-950/95 rounded-xl p-6 text-center border border-amber-500/30 overflow-hidden"
        }
      >
        <motion.div
          className={`${displayClass} mb-3 ${light ? light.number : "gold-glow"}`}
          animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
          transition={{
            duration: 0.3,
            repeat: isAnimating ? Infinity : 0,
            repeatDelay: 0.1,
          }}
        >
          {displayNumber}
        </motion.div>
        <div className={`m3-title-medium mb-2 ${light ? light.label : "text-slate-300"}`}>{label}</div>
        {description && (
          <div className={`m3-body-small ${light ? light.desc : "text-amber-400"}`}>{description}</div>
        )}
      </Card>
    </motion.div>
  )
}

