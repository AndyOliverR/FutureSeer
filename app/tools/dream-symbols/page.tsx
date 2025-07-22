"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DreamSymbolsCoachInterface } from "@/components/DreamSymbolsCoachInterface"
import { useDreamSymbols } from "@/hooks/useDreamSymbols"

export default function DreamSymbolsPage() {
  const {
    dreamDescription,
    symbols,
    analysis,
    isLoading,
    error,
    setDreamDescription,
    setSymbols,
    performDreamAnalysis,
    resetData
  } = useDreamSymbols()

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
          <h1 className="text-5xl font-bold gold-glow mb-4">🌙 Dream Symbols</h1>
          <p className="text-soft leading-relaxed text-lg mb-4">
            Unlock the hidden messages of your subconscious through ancient dream symbolism
          </p>
          {/* Inspirational Quote */}
          <div className="glass-card rounded-2xl p-6 border border-purple-500/20 max-w-2xl mx-auto">
            <p className="text-xl italic text-purple-300 font-serif mb-2">
              "Dreams are the royal road to the unconscious, where symbols speak the language of the soul."
            </p>
            <p className="text-soft/70 text-sm">— Carl Jung</p>
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
              <h2 className="text-2xl gold-glow mb-6 text-center">Subconscious Messages</h2>
              
              {/* Dream Description */}
              <div className="mb-6">
                <h3 className="text-lg text-soft mb-4 flex items-center">
                  <span className="mr-2">🌙</span>
                  Your Dream
                </h3>
                <textarea
                  placeholder="Describe your dream in detail, including emotions and key elements..."
                  value={dreamDescription || ""}
                  onChange={(e) => setDreamDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft placeholder-white/50 focus:outline-none focus:border-yellow-400 transition-all duration-300 h-32 resize-none"
                />
              </div>

              {/* Key Symbols */}
              <div className="mb-6">
                <h3 className="text-lg text-soft mb-4 flex items-center">
                  <span className="mr-2">🔮</span>
                  Key Symbols
                </h3>
                <textarea
                  placeholder="List the main symbols, objects, or themes from your dream..."
                  value={symbols || ""}
                  onChange={(e) => setSymbols(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft placeholder-white/50 focus:outline-none focus:border-yellow-400 transition-all duration-300 h-24 resize-none"
                />
              </div>

              {/* Instructions */}
              <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20">
                <h4 className="text-soft font-semibold mb-2 flex items-center">
                  <span className="mr-2">💡</span>
                  Dream Insights
                </h4>
                <ul className="space-y-1 text-sm text-soft/80">
                  <li>• Subconscious messages</li>
                  <li>• Archetypal symbols</li>
                  <li>• Personal meaning</li>
                  <li>• Life guidance</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={performDreamAnalysis}
                  disabled={isLoading || !dreamDescription.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl p-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? "🌙 Analyzing..." : "🌙 Interpret Dream"}
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
                {["overview", "symbols", "meaning", "guidance", "archetypes", "advice"].map((tab) => (
                  <motion.button
                    key={tab}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === tab
                        ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
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
                      🌙
                    </motion.div>
                    <p className="text-soft text-lg">Decoding the symbols of your subconscious...</p>
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
                    <p className="text-red-400 text-lg mb-2">Analysis Error</p>
                    <p className="text-soft">{error}</p>
                  </motion.div>
                ) : analysis ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <DreamSymbolsCoachInterface 
                      analysis={analysis}
                      activeTab={activeTab}
                      dreamDescription={dreamDescription}
                      symbols={symbols}
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
                    <div className="text-6xl mb-6">🌙</div>
                    <h3 className="text-2xl gold-glow mb-4">Ready to Decode Your Dreams?</h3>
                    <p className="text-soft leading-relaxed">
                      Share your dream above and let us unlock the hidden messages 
                      from your subconscious mind through ancient symbolism.
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
          <h3 className="text-2xl gold-glow mb-6 text-center">✨ Dream Symbol Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">🌙</div>
              <h4 className="text-soft font-semibold mb-2">Subconscious</h4>
              <p className="text-soft/70 text-sm">Hidden messages</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🔮</div>
              <h4 className="text-soft font-semibold mb-2">Archetypes</h4>
              <p className="text-soft/70 text-sm">Universal symbols</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">💭</div>
              <h4 className="text-soft font-semibold mb-2">Personal</h4>
              <p className="text-soft/70 text-sm">Individual meaning</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">✨</div>
              <h4 className="text-soft font-semibold mb-2">Jungian</h4>
              <p className="text-soft/70 text-sm">Depth psychology</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 