"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HellenisticAstrologyCoachInterface } from "@/components/HellenisticAstrologyCoachInterface"
import { useHellenisticAstrology } from "@/hooks/useHellenisticAstrology"

export default function HellenisticAstrologyPage() {
  const {
    birthData,
    analysis,
    isLoading,
    error,
    setBirthData,
    performHellenisticAnalysis,
    resetData
  } = useHellenisticAstrology()

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
          <h1 className="text-5xl font-bold gold-glow mb-4">🏛️ Hellenistic Astrology</h1>
          <p className="text-soft leading-relaxed text-lg mb-4">
            Ancient Greek astrological wisdom with planetary dignities and classical techniques
          </p>
          {/* Inspirational Quote */}
          <div className="glass-card rounded-2xl p-6 border border-indigo-500/20 max-w-2xl mx-auto">
            <p className="text-xl italic text-indigo-300 font-serif mb-2">
              "The Greeks knew that the cosmos speaks through planetary dignities, and those who understand their language become masters of fate."
            </p>
            <p className="text-soft/70 text-sm">— Ptolemy</p>
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
              <h2 className="text-2xl gold-glow mb-6 text-center">Ancient Wisdom</h2>
              
              {/* Birth Data */}
              <div className="mb-6">
                <h3 className="text-lg text-soft mb-4 flex items-center">
                  <span className="mr-2">👤</span>
                  Birth Information
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={birthData.name || ""}
                    onChange={(e) => setBirthData({ ...birthData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                  />
                  <input
                    type="date"
                    placeholder="Birth Date"
                    value={birthData.birthDate || ""}
                    onChange={(e) => setBirthData({ ...birthData, birthDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                  />
                  <input
                    type="time"
                    placeholder="Birth Time"
                    value={birthData.birthTime || ""}
                    onChange={(e) => setBirthData({ ...birthData, birthTime: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                  />
                  <input
                    type="text"
                    placeholder="Birth Location"
                    value={birthData.birthLocation || ""}
                    onChange={(e) => setBirthData({ ...birthData, birthLocation: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Analysis Focus */}
              <div className="mb-6">
                <h3 className="text-lg text-soft mb-4 flex items-center">
                  <span className="mr-2">🎯</span>
                  Analysis Focus
                </h3>
                <select
                  value={birthData.analysisFocus || ""}
                  onChange={(e) => setBirthData({ ...birthData, analysisFocus: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                >
                  <option value="">Select Analysis Focus</option>
                  <option value="planetary-dignities">Planetary Dignities</option>
                  <option value="classical-aspects">Classical Aspects</option>
                  <option value="houses">House Analysis</option>
                  <option value="temperaments">Temperaments</option>
                  <option value="timing">Timing Techniques</option>
                  <option value="comprehensive">Comprehensive Analysis</option>
                </select>
              </div>

              {/* Instructions */}
              <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                <h4 className="text-soft font-semibold mb-2 flex items-center">
                  <span className="mr-2">💡</span>
                  Hellenistic Insights
                </h4>
                <ul className="space-y-1 text-sm text-soft/80">
                  <li>• Planetary dignities and debilities</li>
                  <li>• Classical aspect patterns</li>
                  <li>• Ancient timing techniques</li>
                  <li>• Greek philosophical wisdom</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={performHellenisticAnalysis}
                  disabled={isLoading || !birthData.name || !birthData.birthDate || !birthData.birthTime || !birthData.birthLocation || !birthData.analysisFocus}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? "🏛️ Analyzing..." : "🏛️ Analyze Hellenistic Chart"}
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
                {["overview", "planets", "aspects", "houses", "dignities", "timing", "advice"].map((tab) => (
                  <motion.button
                    key={tab}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === tab
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
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
                      🏛️
                    </motion.div>
                    <p className="text-soft text-lg">Analyzing ancient Greek astrological wisdom...</p>
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
                    <HellenisticAstrologyCoachInterface 
                      analysis={analysis}
                      activeTab={activeTab}
                      birthData={birthData}
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
                    <div className="text-6xl mb-6">🏛️</div>
                    <h3 className="text-2xl gold-glow mb-4">Ready for Ancient Wisdom?</h3>
                    <p className="text-soft leading-relaxed">
                      Enter your birth details above to discover your chart through the lens 
                      of ancient Greek astrological wisdom and classical techniques.
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
          <h3 className="text-2xl gold-glow mb-6 text-center">✨ Hellenistic Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">👑</div>
              <h4 className="text-soft font-semibold mb-2">Planetary Dignities</h4>
              <p className="text-soft/70 text-sm">Understand planetary strength and weakness</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h4 className="text-soft font-semibold mb-2">Classical Aspects</h4>
              <p className="text-soft/70 text-sm">Ancient aspect patterns and meanings</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🏠</div>
              <h4 className="text-soft font-semibold mb-2">House Analysis</h4>
              <p className="text-soft/70 text-sm">Traditional house interpretations</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">⏰</div>
              <h4 className="text-soft font-semibold mb-2">Timing Techniques</h4>
              <p className="text-soft/70 text-sm">Ancient methods for timing events</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 