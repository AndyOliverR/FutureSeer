"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AstroCoachInterface } from "./AstroCoachInterface"

export function AstrologyTool() {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold gold-glow mb-4">Astrology Reading</h1>
          <p className="text-soft">Discover your cosmic blueprint through the ancient wisdom of astrology</p>
        </div>
        
        <AstroCoachInterface />
      </div>
    </div>
  )
} 