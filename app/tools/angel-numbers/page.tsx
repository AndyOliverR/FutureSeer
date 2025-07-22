"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AngelNumbersCoachInterface } from "@/components/AngelNumbersCoachInterface"
import { useAngelNumbersData } from "@/hooks/useAngelNumbersData"

export default function AngelNumbersPage() {
  const {
    number,
    analysis,
    isLoading,
    error,
    setNumber,
    performAngelNumberAnalysis,
    resetData
  } = useAngelNumbersData()

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
          <h1 className="text-5xl font-bold gold-glow mb-4">👼 Angel Numbers</h1>
          <p className="text-soft leading-relaxed text-lg mb-4">
            Divine messages from the angels through sacred number sequences
          </p>
          {/* Inspirational Quote */}
          <div className="glass-card rounded-2xl p-6 border border-white-500/20 max-w-2xl mx-auto">
            <p className="text-xl italic text-white-300 font-serif mb-2">
              "When you see repeating numbers, the angels are speaking directly to your soul, offering guidance from the divine realm."
            </p>
            <p className="text-soft/70 text-sm">— Doreen Virtue</p>
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
              <h2 className="text-2xl gold-glow mb-6 text-center">Divine Messages</h2>
              
              {/* Number Input */}
              <div className="mb-6">
                <h3 className="text-lg text-soft mb-4 flex items-center">
                  <span className="mr-2">👼</span>
                  Angel Number
                </h3>
                <input
                  type="text"
                  placeholder="Enter the number you keep seeing (e.g., 111, 222, 333...)"
                  value={number || ""}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                />
              </div>

              {/* Instructions */}
              <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-white-500/10 to-silver-500/10 border border-white-500/20">
                <h4 className="text-soft font-semibold mb-2 flex items-center">
                  <span className="mr-2">💡</span>
                  Angel Number Insights
                </h4>
                <ul className="space-y-1 text-sm text-soft/80">
                  <li>• Divine angelic guidance</li>
                  <li>• Spiritual messages</li>
                  <li>• Sacred number meanings</li>
                  <li>• Cosmic communication</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={performAngelNumberAnalysis}
                  disabled={isLoading || !number.trim()}
                  className="w-full bg-gradient-to-r from-white-500 to-silver-600 text-white rounded-xl p-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? "👼 Decoding..." : "👼 Decode Angel Message"}
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
                {["overview", "meaning", "guidance", "timing", "action", "advice"].map((tab) => (
                  <motion.button
                    key={tab}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === tab
                        ? "bg-gradient-to-r from-white-500 to-silver-600 text-white"
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
                      👼
                    </motion.div>
                    <p className="text-soft text-lg">Decoding the angelic message...</p>
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
                    <p className="text-red-400 text-lg mb-2">Decoding Error</p>
                    <p className="text-soft">{error}</p>
                  </motion.div>
                ) : analysis ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <AngelNumbersCoachInterface 
                      analysis={analysis}
                      activeTab={activeTab}
                      number={number}
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
                    <div className="text-6xl mb-6">👼</div>
                    <h3 className="text-2xl gold-glow mb-4">Ready for Angelic Guidance?</h3>
                    <p className="text-soft leading-relaxed">
                      Enter the number you keep seeing above to decode the divine 
                      message from your guardian angels.
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
          <h3 className="text-2xl gold-glow mb-6 text-center">✨ Angel Numbers Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">👼</div>
              <h4 className="text-soft font-semibold mb-2">Divine Messages</h4>
              <p className="text-soft/70 text-sm">Angel guidance</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🔢</div>
              <h4 className="text-soft font-semibold mb-2">Sacred Numbers</h4>
              <p className="text-soft/70 text-sm">Spiritual sequences</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">✨</div>
              <h4 className="text-soft font-semibold mb-2">Cosmic Communication</h4>
              <p className="text-soft/70 text-sm">Divine realm connection</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">💫</div>
              <h4 className="text-soft font-semibold mb-2">Spiritual Guidance</h4>
              <p className="text-soft/70 text-sm">Guardian angel wisdom</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 