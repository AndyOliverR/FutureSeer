"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { KabbalisticNumerologyCoachInterface } from "@/components/KabbalisticNumerologyCoachInterface"
import { useKabbalisticNumerology } from "@/hooks/use-kabbalistic-numerology"

export default function KabbalisticNumerologyPage() {
  const {
    name,
    birthDate,
    analysis,
    isLoading,
    error,
    setName,
    setBirthDate,
    performKabbalisticAnalysis,
    resetData
  } = useKabbalisticNumerology()

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
          <h1 className="text-5xl font-bold gold-glow mb-4">🔢 Kabbalistic Numerology</h1>
          <p className="text-soft leading-relaxed text-lg mb-4">
            Discover the mystical connection between Hebrew letters, numbers, and your soul's purpose
          </p>
          {/* Inspirational Quote */}
          <div className="glass-card rounded-2xl p-6 border border-purple-500/20 max-w-2xl mx-auto">
            <p className="text-xl italic text-purple-300 font-serif mb-2">
              "The letters of the Hebrew alphabet are the building blocks of creation, each carrying divine energy."
            </p>
            <p className="text-soft/70 text-sm">— Sefer Yetzirah</p>
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
              <h2 className="text-2xl gold-glow mb-6 text-center">Soul Analysis</h2>
              
              {/* Name Input */}
              <div className="mb-6">
                <h3 className="text-lg text-soft mb-4 flex items-center">
                  <span className="mr-2">📝</span>
                  Your Name
                </h3>
                <input
                  type="text"
                  placeholder="Enter your full name..."
                  value={name || ""}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                />
              </div>

              {/* Birth Date Input */}
              <div className="mb-6">
                <h3 className="text-lg text-soft mb-4 flex items-center">
                  <span className="mr-2">📅</span>
                  Birth Date
                </h3>
                <input
                  type="date"
                  value={birthDate || ""}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                />
              </div>

              {/* Instructions */}
              <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                <h4 className="text-soft font-semibold mb-2 flex items-center">
                  <span className="mr-2">💡</span>
                  Kabbalistic Insights
                </h4>
                <ul className="space-y-1 text-sm text-soft/80">
                  <li>• Hebrew letter analysis</li>
                  <li>• Gematria calculations</li>
                  <li>• Soul number discovery</li>
                  <li>• Divine purpose revelation</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={performKabbalisticAnalysis}
                  disabled={!(name ?? '').trim() || !(birthDate ?? '') || isLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Analyzing..." : "🔢 Reveal Soul Numbers"}
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
                {["overview", "gematria", "soul", "destiny", "personality", "hebrew", "guidance"].map((tab) => (
                  <motion.button
                    key={tab}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === tab
                        ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white"
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
                      🔢
                    </motion.div>
                    <p className="text-soft">Calculating your soul numbers...</p>
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
                        <h3 className="text-2xl gold-glow mb-4">Kabbalistic Overview</h3>
                        <p className="text-soft leading-relaxed mb-4">{analysis.overview}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 glass-card rounded-xl">
                            <div className="text-3xl mb-2">🔢</div>
                            <div className="text-soft/70">Soul Number</div>
                            <div className="gold-glow text-2xl">{analysis.soulNumber}</div>
                          </div>
                          <div className="text-center p-4 glass-card rounded-xl">
                            <div className="text-3xl mb-2">⭐</div>
                            <div className="text-soft/70">Destiny Number</div>
                            <div className="gold-glow text-2xl">{analysis.destinyNumber}</div>
                          </div>
                          <div className="text-center p-4 glass-card rounded-xl">
                            <div className="text-3xl mb-2">🌟</div>
                            <div className="text-soft/70">Personality Number</div>
                            <div className="gold-glow text-2xl">{analysis.personalityNumber}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "gematria" && (
                      <div>
                        <h3 className="text-2xl gold-glow mb-4">Gematria Analysis</h3>
                        <p className="text-soft leading-relaxed mb-4">{analysis.gematria}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="glass-card rounded-xl p-4">
                            <h4 className="font-semibold text-white mb-2">Name Value</h4>
                            <div className="text-2xl gold-glow mb-2">{analysis.nameValue}</div>
                            <p className="text-sm text-slate-400">{analysis.nameMeaning}</p>
                          </div>
                          <div className="glass-card rounded-xl p-4">
                            <h4 className="font-semibold text-white mb-2">Birth Date Value</h4>
                            <div className="text-2xl gold-glow mb-2">{analysis.birthValue}</div>
                            <p className="text-sm text-slate-400">{analysis.birthMeaning}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "soul" && (
                      <div>
                        <h3 className="text-2xl gold-glow mb-4">Soul Number Analysis</h3>
                        <div className="glass-card rounded-xl p-6 mb-4">
                          <h4 className="text-xl font-semibold text-white mb-4">Soul Number: {analysis.soulNumber}</h4>
                          <p className="text-soft leading-relaxed mb-4">{analysis.soulDescription}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-semibold text-white mb-2">Strengths</h5>
                              <ul className="text-sm text-slate-400 space-y-1">
                                {analysis.soulStrengths?.map((strength: string, index: number) => (
                                  <li key={index}>• {strength}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-semibold text-white mb-2">Challenges</h5>
                              <ul className="text-sm text-slate-400 space-y-1">
                                {analysis.soulChallenges?.map((challenge: string, index: number) => (
                                  <li key={index}>• {challenge}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "destiny" && (
                      <div>
                        <h3 className="text-2xl gold-glow mb-4">Destiny Number Analysis</h3>
                        <div className="glass-card rounded-xl p-6 mb-4">
                          <h4 className="text-xl font-semibold text-white mb-4">Destiny Number: {analysis.destinyNumber}</h4>
                          <p className="text-soft leading-relaxed mb-4">{analysis.destinyDescription}</p>
                          <div className="space-y-4">
                            <div>
                              <h5 className="font-semibold text-white mb-2">Life Purpose</h5>
                              <p className="text-slate-400">{analysis.lifePurpose}</p>
                            </div>
                            <div>
                              <h5 className="font-semibold text-white mb-2">Career Paths</h5>
                              <ul className="text-sm text-slate-400 space-y-1">
                                {analysis.careerPaths?.map((career: string, index: number) => (
                                  <li key={index}>• {career}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "personality" && (
                      <div>
                        <h3 className="text-2xl gold-glow mb-4">Personality Number Analysis</h3>
                        <div className="glass-card rounded-xl p-6 mb-4">
                          <h4 className="text-xl font-semibold text-white mb-4">Personality Number: {analysis.personalityNumber}</h4>
                          <p className="text-soft leading-relaxed mb-4">{analysis.personalityDescription}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-semibold text-white mb-2">Traits</h5>
                              <ul className="text-sm text-slate-400 space-y-1">
                                {analysis.personalityTraits?.map((trait: string, index: number) => (
                                  <li key={index}>• {trait}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-semibold text-white mb-2">Expression</h5>
                              <ul className="text-sm text-slate-400 space-y-1">
                                {analysis.expressionModes?.map((mode: string, index: number) => (
                                  <li key={index}>• {mode}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "hebrew" && (
                      <div>
                        <h3 className="text-2xl gold-glow mb-4">Hebrew Letter Analysis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {analysis.hebrewLetters?.map((letter: any, index: number) => (
                            <div key={index} className="glass-card rounded-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-semibold text-white text-lg">{letter.hebrew}</div>
                                <div className="text-purple-400 font-semibold">{letter.value}</div>
                              </div>
                              <p className="text-sm text-slate-400 mb-2">{letter.english}</p>
                              <p className="text-xs text-slate-500">{letter.meaning}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "guidance" && (
                      <div>
                        <h3 className="text-2xl gold-glow mb-4">Spiritual Guidance</h3>
                        <p className="text-soft leading-relaxed mb-4">{analysis.guidance}</p>
                        <div className="space-y-3">
                          {analysis.recommendations?.map((rec: string, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="text-purple-400 mt-1">•</div>
                              <p className="text-soft/80">{rec}</p>
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
                    <div className="text-4xl mb-4">🔢</div>
                    <h3 className="text-xl gold-glow mb-2">Ready for Kabbalistic Analysis</h3>
                    <p className="text-soft">Enter your name and birth date to reveal your soul numbers.</p>
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
          <h2 className="text-3xl font-bold gold-glow text-center mb-8">Kabbalistic Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">🔢</div>
              <h4 className="text-soft font-semibold mb-2">Gematria</h4>
              <p className="text-soft/70 text-sm">Hebrew letter values</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">⭐</div>
              <h4 className="text-soft font-semibold mb-2">Soul Numbers</h4>
              <p className="text-soft/70 text-sm">Inner essence</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🌟</div>
              <h4 className="text-soft font-semibold mb-2">Destiny Path</h4>
              <p className="text-soft/70 text-sm">Life purpose</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">📜</div>
              <h4 className="text-soft font-semibold mb-2">Hebrew Wisdom</h4>
              <p className="text-soft/70 text-sm">Ancient knowledge</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}