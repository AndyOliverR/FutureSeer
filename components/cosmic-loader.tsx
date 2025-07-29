"use client"

import { motion } from 'framer-motion'

interface CosmicLoaderProps {
  text?: string
  className?: string
}

export function CosmicLoader({ text = "Consulting the cosmic realm...", className = '' }: CosmicLoaderProps) {
  return (
    <div className={`text-center ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="text-6xl mb-6"
      >
        🌟
      </motion.div>
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-amber-200 font-serif text-lg"
      >
        {text}
      </motion.p>
    </div>
  )
} 