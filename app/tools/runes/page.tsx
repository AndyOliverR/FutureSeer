"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { RunesCoachInterface } from "@/components/RunesCoachInterface"
import { useRunes } from "@/hooks/use-runes"

export default function RunesPage() {
  const {
    question,
    spreadType,
    runes,
    analysis,
    isLoading,
    error,
    setQuestion,
    setSpreadType,
    performRuneReading,
    resetData
  } = useRunes()

  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 pt-8"
        >
          <motion.a
            href="/tools"
            className="text-soft hover:gold-glow mb-4 inline-block transition-all duration-300"
            whileHover={{ x: -5 }}
          >
            ← Back to Tools
          </motion.a>
          <h1 className="text-5xl font-bold gold-glow mb-4">ᚱ Runes</h1>
          <p className="text-soft leading-relaxed text-lg mb-4">
            Ancient Norse wisdom through sacred runic symbols and divine guidance
          </p>
          {/* Inspirational Quote */}
          <div className="glass-card rounded-2xl p-6 border border-slate-500/20 max-w-2xl mx-auto">
            <p className="text-xl italic text-slate-300 font-serif mb-2">
              "The runes speak with the voice of Odin himself, and those who cast them receive wisdom from the Allfather's sacred well."
            </p>
            <p className="text-soft/70 text-sm">— Norse Edda</p>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="glass-card rounded-3xl p-6 border border-white/10">
              <h2 className="text-2xl gold-glow mb-6 text-center">Norse Wisdom</h2>
              
              {/* Question Input */}
              <div className="mb-6">
                <h3 className="text-lg text-soft mb-4 flex items-center">
                  <span className="mr-2">❓</span>
                  Your Question
                </h3>
                <textarea
                  placeholder="Ask the runes for guidance on your path..."
                  value={question || ""}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft placeholder-white/50 focus:outline-none focus:border-yellow-400 transition-all duration-300 h-32 resize-none"
                />
              </div>

              {/* Spread Type */}
              <div className="mb-6">
                <h3 className="text-lg text-soft mb-4 flex items-center">
                  <span className="mr-2">ᚱ</span>
                  Spread Type
                </h3>
                <select
                  value={spreadType || ""}
                  onChange={(e) => setSpreadType(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                >
                  <option value="">Select Spread</option>
                  <option value="single">Single Rune</option>
                  <option value="three-rune">Three Rune Spread</option>
                  <option value="norns">Norns Spread</option>
                  <option value="cross">Runic Cross</option>
                  <option value="wheel">Wheel of Wyrd</option>
                  <option value="custom">Custom Spread</option>
                </select>
              </div>

              {/* Instructions */}
              <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-slate-500/10 to-gray-500/10 border border-slate-500/20">
                <h4 className="text-soft font-semibold mb-2 flex items-center">
                  <span className="mr-2">💡</span>
                  Runic Insights
                </h4>
                <ul className="space-y-1 text-sm text-soft/80">
                  <li>• Ancient Norse wisdom</li>
                  <li>• Sacred runic symbols</li>
                  <li>• Divine guidance</li>
                  <li>• Warrior spirit</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={performRuneReading}
                  disabled={isLoading || !(question ?? '').trim() || !(spreadType ?? '')}
                  className="w-full bg-gradient-to-r from-slate-500 to-gray-600 text-white rounded-xl p-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? "ᚱ Casting..." : "ᚱ Cast the Runes"}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetData}
                  className="w-full bg-white/5 border border-white/20 text-soft rounded-xl p-4 font-semibold hover:bg-white/10 transition-all duration-300"
                >
                  🔄 Reset
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="glass-card rounded-3xl p-6 border border-white/10">
              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {["overview", "runes", "interpretation", "guidance", "timing", "advice"].map((tab) => (
                  <motion.button
                    key={tab}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === tab
                        ? "bg-gradient-to-r from-slate-500 to-gray-600 text-white"
                        : "bg-white/5 text-soft hover:bg-white/10"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </motion.button>
                ))}
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-16"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="text-4xl mb-4"
                    >
                      ᚱ
                    </motion.div>
                    <p className="text-soft text-lg">Casting the runes and seeking Odin's wisdom...</p>
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-16"
                  >
                    <div className="text-4xl mb-4">⚠️</div>
                    <p className="text-red-400 text-lg mb-2">Casting Error</p>
                    <p className="text-soft">{error}</p>
                  </motion.div>
                ) : analysis ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <RunesCoachInterface 
                      analysis={analysis}
                      activeTab={activeTab}
                      question={question}
                      spreadType={spreadType}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-16"
                  >
                    <div className="text-6xl mb-6">ᚱ</div>
                    <h3 className="text-2xl gold-glow mb-4">Ready for Norse Wisdom?</h3>
                    <p className="text-soft leading-relaxed">
                      Ask your question above to receive guidance through the ancient 
                      wisdom of runes and Odin's sacred symbols.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Features Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card rounded-3xl p-8 mt-12 border border-white/10"
        >
          <h3 className="text-2xl gold-glow mb-6 text-center">✨ Runes Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">ᚱ</div>
              <h4 className="text-soft font-semibold mb-2">Ancient Symbols</h4>
              <p className="text-soft/70 text-sm">Sacred Norse runes</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">⚔️</div>
              <h4 className="text-soft font-semibold mb-2">Warrior Spirit</h4>
              <p className="text-soft/70 text-sm">Norse strength and courage</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🔮</div>
              <h4 className="text-soft font-semibold mb-2">Divine Guidance</h4>
              <p className="text-soft/70 text-sm">Odin's wisdom</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">✨</div>
              <h4 className="text-soft font-semibold mb-2">Sacred Knowledge</h4>
              <p className="text-soft/70 text-sm">Ancient Norse traditions</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 