"use client"

import { useState } from "react"
import { motion } from "framer-motion"

export function AstroScribeCoachInterface() {
  const [isLoading, setIsLoading] = useState(false)
  const [input, setInput] = useState("")
  const [result, setResult] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // TODO: Implement actual astrological analysis
    setTimeout(() => {
      setResult("Your astrological analysis will appear here...")
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className="glass-card rounded-3xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-semibold gold-glow mb-4">AstroScribe</h2>
        <p className="text-soft">Transform your thoughts into cosmic wisdom</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-soft mb-2">What would you like to explore?</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-4 bg-dark/50 border border-soft/20 rounded-xl text-soft placeholder-soft/50 focus:border-yellow-400 focus:outline-none"
            rows={4}
            placeholder="Describe your question, situation, or what you'd like to understand through astrology..."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="w-full py-3 px-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-dark font-semibold rounded-xl hover:from-yellow-300 hover:to-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Analyzing..." : "Get Astrological Insight"}
        </button>
      </form>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 bg-dark/30 rounded-xl border border-soft/20"
        >
          <h3 className="text-xl gold-glow mb-4">Your Cosmic Analysis</h3>
          <p className="text-soft leading-relaxed">{result}</p>
        </motion.div>
      )}
    </div>
  )
} 