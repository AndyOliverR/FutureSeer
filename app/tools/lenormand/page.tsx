"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LenormandCoachInterface } from "@/components/LenormandCoachInterface"
import { useLenormand } from "@/hooks/use-lenormand-hook"

export default function LenormandPage() {
  const {
    question,
    spreadType,
    cards,
    analysis,
    isLoading,
    error,
    setQuestion,
    setSpreadType,
    performLenormandReading,
    resetData
  } = useLenormand()

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
          <h1 className="text-5xl font-bold gold-glow mb-4">🌸 Lenormand</h1>
          <p className="text-soft leading-relaxed text-lg mb-4">
            36-card fortune telling system with precise symbolic meanings
          </p>
          {/* Inspirational Quote */}
          <div className="glass-card rounded-2xl p-6 border border-pink-500/20 max-w-2xl mx-auto">
            <p className="text-xl italic text-pink-300 font-serif mb-2">
              "The Lenormand cards speak with the voice of everyday wisdom, revealing the hidden patterns in the fabric of daily life."
            </p>
            <p className="text-soft/70 text-sm">— Mademoiselle Lenormand</p>
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
              <h2 className="text-2xl gold-glow mb-6 text-center">Fortune Telling</h2>
              
              {/* Question Input */}
              <div className="mb-6">
                <h3 className="text-lg text-soft mb-4 flex items-center">
                  <span className="mr-2">❓</span>
                  Your Question
                </h3>
                <textarea
                  placeholder="Ask the Lenormand cards for guidance..."
                  value={question || ""}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft placeholder-white/50 focus:outline-none focus:border-yellow-400 transition-all duration-300 h-32 resize-none"
                />
              </div>

              {/* Spread Type */}
              <div className="mb-6">
                <h3 className="text-lg text-soft mb-4 flex items-center">
                  <span className="mr-2">🌸</span>
                  Spread Type
                </h3>
                <select
                  value={spreadType || ""}
                  onChange={(e) => setSpreadType(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                >
                  <option value="">Select Spread</option>
                  <option value="single">Single Card</option>
                  <option value="three-card">Three Card Spread</option>
                  <option value="nine-card">Nine Card Spread</option>
                  <option value="grand-tableau">Grand Tableau</option>
                  <option value="line-of-five">Line of Five</option>
                  <option value="custom">Custom Spread</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={performLenormandReading}
                  disabled={!(question ?? '').trim() || !(spreadType ?? '') || isLoading}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Reading Cards..." : "🔮 Read the Cards"}
                </button>
                
                <button
                  onClick={resetData}
                  className="w-full bg-white/5 border border-white/20 text-soft py-3 px-6 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300"
                >
                  Reset
                </button>
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
                {["overview", "cards", "interpretation", "guidance", "timing", "advice"].map((tab) => (
                  <motion.button
                    key={tab}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === tab
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
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
                      🌸
                    </motion.div>
                    <p className="text-soft">Consulting the Lenormand cards...</p>
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-16"
                  >
                    <div className="text-red-400 text-4xl mb-4">⚠️</div>
                    <p className="text-soft">{error}</p>
                  </motion.div>
                ) : analysis ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {activeTab === "overview" && (
                      <div>
                        <h3 className="text-2xl gold-glow mb-4">Card Reading Overview</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="text-center p-4 glass-card rounded-xl">
                            <div className="text-3xl mb-2">🌸</div>
                            <div className="text-soft/70">Cards Drawn</div>
                            <div className="gold-glow">{cards?.length || 0}</div>
                          </div>
                          <div className="text-center p-4 glass-card rounded-xl">
                            <div className="text-3xl mb-2">🔮</div>
                            <div className="text-soft/70">Spread Type</div>
                            <div className="gold-glow">{spreadType}</div>
                          </div>
                          <div className="text-center p-4 glass-card rounded-xl">
                            <div className="text-3xl mb-2">✨</div>
                            <div className="text-soft/70">Reading Type</div>
                            <div className="gold-glow">Fortune Telling</div>
                          </div>
                        </div>
                        <p className="text-soft leading-relaxed">{analysis.overview}</p>
                      </div>
                    )}

                    {activeTab === "cards" && (
                      <div>
                        <h3 className="text-2xl gold-glow mb-4">Cards Drawn</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {cards?.map((card: any, index: number) => (
                            <div key={index} className="glass-card rounded-xl p-4 text-center">
                              <div className="text-3xl mb-2">{card.symbol}</div>
                              <h4 className="gold-glow font-semibold mb-2">{card.name}</h4>
                              <p className="text-soft/70 text-sm mb-2">{card.keyword}</p>
                              <p className="text-soft/80 text-xs">{card.meaning}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "interpretation" && (
                      <div>
                        <h3 className="text-2xl gold-glow mb-4">Card Interpretation</h3>
                        <p className="text-soft leading-relaxed mb-4">{analysis.interpretation}</p>
                        <div className="space-y-3">
                          {analysis.cardMeanings?.map((meaning: any, index: number) => (
                            <div key={index} className="glass-card rounded-xl p-4">
                              <h4 className="gold-glow font-semibold mb-2">{meaning.card}</h4>
                              <p className="text-soft/80">{meaning.meaning}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "guidance" && (
                      <div>
                        <h3 className="text-2xl gold-glow mb-4">Guidance & Advice</h3>
                        <p className="text-soft leading-relaxed mb-4">{analysis.guidance}</p>
                        <div className="space-y-3">
                          {analysis.advice?.map((advice: string, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="text-pink-400 mt-1">•</div>
                              <p className="text-soft/80">{advice}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "timing" && (
                      <div>
                        <h3 className="text-2xl gold-glow mb-4">Timing & Events</h3>
                        <p className="text-soft leading-relaxed mb-4">{analysis.timing}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="glass-card rounded-xl p-4">
                            <h4 className="gold-glow font-semibold mb-2">Short Term</h4>
                            <p className="text-soft/80">{analysis.shortTerm}</p>
                          </div>
                          <div className="glass-card rounded-xl p-4">
                            <h4 className="gold-glow font-semibold mb-2">Long Term</h4>
                            <p className="text-soft/80">{analysis.longTerm}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "advice" && (
                      <div>
                        <h3 className="text-2xl gold-glow mb-4">Practical Advice</h3>
                        <p className="text-soft leading-relaxed mb-4">{analysis.practicalAdvice}</p>
                        <div className="space-y-3">
                          {analysis.actions?.map((action: string, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="text-pink-400 mt-1">→</div>
                              <p className="text-soft/80">{action}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-16"
                  >
                    <div className="text-4xl mb-4">🌸</div>
                    <h3 className="text-xl gold-glow mb-2">Ready for Your Reading</h3>
                    <p className="text-soft">Enter your question and select a spread to begin your Lenormand reading.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16"
        >
          <h2 className="text-3xl font-bold gold-glow text-center mb-8">Lenormand Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">🌸</div>
              <h4 className="text-soft font-semibold mb-2">36 Traditional Cards</h4>
              <p className="text-soft/70 text-sm">Complete Lenormand deck</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🔮</div>
              <h4 className="text-soft font-semibold mb-2">Multiple Spreads</h4>
              <p className="text-soft/70 text-sm">Various reading layouts</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">💫</div>
              <h4 className="text-soft font-semibold mb-2">Symbolic Meanings</h4>
              <p className="text-soft/70 text-sm">Deep symbolic interpretation</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">✨</div>
              <h4 className="text-soft font-semibold mb-2">Practical Guidance</h4>
              <p className="text-soft/70 text-sm">Everyday life wisdom</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 