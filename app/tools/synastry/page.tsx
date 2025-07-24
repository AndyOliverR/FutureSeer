"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SynastryCoachInterface } from "@/components/SynastryCoachInterface"
import { useSynastry } from "@/hooks/useSynastry"

export default function SynastryPage() {
  const {
    birthData1,
    birthData2,
    analysis,
    isLoading,
    error,
    setBirthData1,
    setBirthData2,
    performSynastryAnalysis,
    resetData
  } = useSynastry()

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
          <h1 className="text-5xl font-bold gold-glow mb-4">💕 Synastry</h1>
          <p className="text-soft leading-relaxed text-lg mb-4">
            Relationship compatibility analysis through astrological chart comparison
          </p>
          {/* Inspirational Quote */}
          <div className="glass-card rounded-2xl p-6 border border-pink-500/20 max-w-2xl mx-auto">
            <p className="text-xl italic text-pink-300 font-serif mb-2">
              "The stars aligned when our souls first met, for love is written in the cosmic dance of planets."
            </p>
            <p className="text-soft/70 text-sm">— Ancient Astrological Wisdom</p>
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
              <h2 className="text-2xl gold-glow mb-6 text-center">Relationship Data</h2>
              
              {/* Person 1 */}
              <div className="mb-8">
                <h3 className="text-lg text-soft mb-4 flex items-center">
                  <span className="mr-2">👤</span>
                  Person 1
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={(birthData1?.name ?? "")}
                    onChange={(e) => setBirthData1({ ...birthData1, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                  />
                  <input
                    type="date"
                    placeholder="Birth Date"
                    value={(birthData1?.birthDate ?? "")}
                    onChange={(e) => setBirthData1({ ...birthData1, birthDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                  />
                  <input
                    type="time"
                    placeholder="Birth Time"
                    value={(birthData1?.birthTime ?? "")}
                    onChange={(e) => setBirthData1({ ...birthData1, birthTime: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                  />
                  <input
                    type="text"
                    placeholder="Birth Location"
                    value={(birthData1?.birthLocation ?? "")}
                    onChange={(e) => setBirthData1({ ...birthData1, birthLocation: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Person 2 */}
              <div className="mb-8">
                <h3 className="text-lg text-soft mb-4 flex items-center">
                  <span className="mr-2">👤</span>
                  Person 2
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={(birthData2?.name ?? "")}
                    onChange={(e) => setBirthData2({ ...birthData2, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                  />
                  <input
                    type="date"
                    placeholder="Birth Date"
                    value={(birthData2?.birthDate ?? "")}
                    onChange={(e) => setBirthData2({ ...birthData2, birthDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                  />
                  <input
                    type="time"
                    placeholder="Birth Time"
                    value={(birthData2?.birthTime ?? "")}
                    onChange={(e) => setBirthData2({ ...birthData2, birthTime: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                  />
                  <input
                    type="text"
                    placeholder="Birth Location"
                    value={(birthData2?.birthLocation ?? "")}
                    onChange={(e) => setBirthData2({ ...birthData2, birthLocation: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
                <h4 className="text-soft font-semibold mb-2 flex items-center">
                  <span className="mr-2">💡</span>
                  Synastry Insights
                </h4>
                <ul className="space-y-1 text-sm text-soft/80">
                  <li>• Planetary aspects between charts</li>
                  <li>• Compatibility analysis</li>
                  <li>• Relationship dynamics</li>
                  <li>• Growth opportunities</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={performSynastryAnalysis}
                  disabled={isLoading || !birthData1.name || !birthData1.birthDate || !birthData1.birthTime || !birthData1.birthLocation || !birthData2.name || !birthData2.birthDate || !birthData2.birthTime || !birthData2.birthLocation}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl p-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? "💕 Analyzing..." : "💕 Analyze Compatibility"}
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
                {["overview", "aspects", "compatibility", "dynamics", "growth", "advice"].map((tab) => (
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
                      💕
                    </motion.div>
                    <p className="text-soft text-lg">Analyzing cosmic compatibility...</p>
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
                    <SynastryCoachInterface 
                      compatibility={analysis}
                      activeTab={activeTab}
                      person1Data={{
                        name: birthData1?.name ?? '',
                        birthTime: birthData1?.birthTime ?? '',
                        birthPlace: birthData1?.birthLocation ?? '',
                      }}
                      person2Data={{
                        name: birthData2?.name ?? '',
                        birthTime: birthData2?.birthTime ?? '',
                        birthPlace: birthData2?.birthLocation ?? '',
                      }}
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
                    <div className="text-6xl mb-6">💕</div>
                    <h3 className="text-2xl gold-glow mb-4">Ready for Love Analysis?</h3>
                    <p className="text-soft leading-relaxed">
                      Enter both birth details above to discover the cosmic compatibility 
                      and relationship dynamics between two souls.
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
          <h3 className="text-2xl gold-glow mb-6 text-center">✨ Synastry Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">💫</div>
              <h4 className="text-soft font-semibold mb-2">Planetary Aspects</h4>
              <p className="text-soft/70 text-sm">Analyze how planets interact between charts</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">💕</div>
              <h4 className="text-soft font-semibold mb-2">Compatibility</h4>
              <p className="text-soft/70 text-sm">Discover relationship strengths and challenges</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🌱</div>
              <h4 className="text-soft font-semibold mb-2">Growth</h4>
              <p className="text-soft/70 text-sm">Identify opportunities for mutual development</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">💡</div>
              <h4 className="text-soft font-semibold mb-2">Guidance</h4>
              <p className="text-soft/70 text-sm">Receive personalized relationship advice</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 