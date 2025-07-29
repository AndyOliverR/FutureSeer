"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HellenisticAstrologyCoachInterface } from "@/components/HellenisticAstrologyCoachInterface"
import { useHellenisticAstrology } from "@/hooks/use-hellenistic-astrology"

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
            Ancient Greek astrological traditions and classical techniques
          </p>
          {/* Inspirational Quote */}
          <div className="glass-card rounded-2xl p-6 border border-blue-500/20 max-w-2xl mx-auto">
            <p className="text-xl italic text-blue-300 font-serif mb-2">
              "The stars incline, they do not compel. In the ancient wisdom of the Greeks lies the foundation of all astrological knowledge."
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
              <h2 className="text-2xl gold-glow mb-6 text-center">Classical Analysis</h2>
              
              {/* Birth Details */}
              <div className="mb-6">
                <h3 className="text-lg text-soft mb-4 flex items-center">
                  <span className="mr-2">🏛️</span>
                  Birth Details
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={birthData.name || ""}
                    onChange={(e) => setBirthData({ ...birthData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                  />
                  <input
                    type="datetime-local"
                    placeholder="Date & Time of Birth"
                    value={birthData.birthDateTime || ""}
                    onChange={(e) => setBirthData({ ...birthData, birthDateTime: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                  />
                  <input
                    type="text"
                    placeholder="Place of Birth"
                    value={birthData.birthPlace || ""}
                    onChange={(e) => setBirthData({ ...birthData, birthPlace: e.target.value })}
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
                  <option value="">Select Focus</option>
                  <option value="personality">Personality & Character</option>
                  <option value="career">Career & Vocation</option>
                  <option value="relationships">Relationships & Love</option>
                  <option value="health">Health & Wellbeing</option>
                  <option value="wealth">Wealth & Prosperity</option>
                  <option value="travel">Travel & Journeys</option>
                  <option value="spirituality">Spirituality & Growth</option>
                  <option value="timing">Timing & Events</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={performHellenisticAnalysis}
                  disabled={!(birthData.name ?? '').trim() || !(birthData.birthDateTime ?? '') || isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Analyzing..." : "🏛️ Perform Hellenistic Analysis"}
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
                {["overview", "planets", "houses", "aspects", "dignities", "timing", "guidance"].map((tab) => (
                  <motion.button
                    key={tab}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === tab
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
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
                    <p className="text-soft">Consulting the ancient Greek wisdom...</p>
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
                        <h3 className="text-2xl gold-glow mb-4">Hellenistic Analysis Overview</h3>
                        <p className="text-soft leading-relaxed mb-4">{analysis.overview}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 glass-card rounded-xl">
                            <div className="text-3xl mb-2">⭐</div>
                            <div className="text-soft/70">Rising Sign</div>
                            <div className="gold-glow">{analysis.risingSign}</div>
                          </div>
                          <div className="text-center p-4 glass-card rounded-xl">
                            <div className="text-3xl mb-2">🌙</div>
                            <div className="text-soft/70">Moon Sign</div>
                            <div className="gold-glow">{analysis.moonSign}</div>
                          </div>
                          <div className="text-center p-4 glass-card rounded-xl">
                            <div className="text-3xl mb-2">☀️</div>
                            <div className="text-soft/70">Sun Sign</div>
                            <div className="gold-glow">{analysis.sunSign}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "planets" && (
                      <div>
                        <h3 className="text-2xl gold-glow mb-4">Planetary Positions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {analysis.planets?.map((planet: any, index: number) => (
                            <div key={index} className="glass-card rounded-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-semibold text-white">{planet.name}</div>
                                <Badge variant="outline" className="border-blue-500 text-blue-400">
                                  {planet.sign}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-400">{planet.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "houses" && (
                      <div>
                        <h3 className="text-2xl gold-glow mb-4">House Analysis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analysis.houses?.map((house: any, index: number) => (
                            <div key={index} className="glass-card rounded-xl p-4">
                              <h4 className="font-semibold text-white mb-2">{house.name}</h4>
                              <p className="text-sm text-slate-400 mb-2">{house.description}</p>
                              <div className="text-xs text-slate-500">
                                <strong>Ruler:</strong> {house.ruler}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "aspects" && (
                      <div>
                        <h3 className="text-2xl gold-glow mb-4">Aspect Analysis</h3>
                        <div className="space-y-3">
                          {analysis.aspects?.map((aspect: any, index: number) => (
                            <div key={index} className="glass-card rounded-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-white">{aspect.planets}</h4>
                                <Badge variant="outline" className="border-green-500 text-green-400">
                                  {aspect.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-400">{aspect.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "dignities" && (
                      <div>
                        <h3 className="text-2xl gold-glow mb-4">Planetary Dignities</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analysis.dignities?.map((dignity: any, index: number) => (
                            <div key={index} className="glass-card rounded-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-semibold text-white">{dignity.planet}</div>
                                <Badge variant="outline" className={`${
                                  dignity.status === 'dignified' ? 'border-green-500 text-green-400' :
                                  dignity.status === 'debilitated' ? 'border-red-500 text-red-400' :
                                  'border-yellow-500 text-yellow-400'
                                }`}>
                                  {dignity.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-400">{dignity.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "timing" && (
                      <div>
                        <h3 className="text-2xl gold-glow mb-4">Timing Analysis</h3>
                        <p className="text-soft leading-relaxed mb-4">{analysis.timing}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="glass-card rounded-xl p-4">
                            <h4 className="font-semibold text-white mb-2">Favorable Periods</h4>
                            <ul className="text-sm text-slate-400 space-y-1">
                              {analysis.favorablePeriods?.map((period: string, index: number) => (
                                <li key={index}>• {period}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="glass-card rounded-xl p-4">
                            <h4 className="font-semibold text-white mb-2">Challenging Periods</h4>
                            <ul className="text-sm text-slate-400 space-y-1">
                              {analysis.challengingPeriods?.map((period: string, index: number) => (
                                <li key={index}>• {period}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "guidance" && (
                      <div>
                        <h3 className="text-2xl gold-glow mb-4">Hellenistic Guidance</h3>
                        <p className="text-soft leading-relaxed mb-4">{analysis.guidance}</p>
                        <div className="space-y-3">
                          {analysis.recommendations?.map((rec: string, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="text-blue-400 mt-1">•</div>
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
                    <div className="text-4xl mb-4">🏛️</div>
                    <h3 className="text-xl gold-glow mb-2">Ready for Hellenistic Analysis</h3>
                    <p className="text-soft">Enter your birth details to begin your classical astrological reading.</p>
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
          <h2 className="text-3xl font-bold gold-glow text-center mb-8">Hellenistic Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">🏛️</div>
              <h4 className="text-soft font-semibold mb-2">Classical Techniques</h4>
              <p className="text-soft/70 text-sm">Ancient Greek methods</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">⭐</div>
              <h4 className="text-soft font-semibold mb-2">Planetary Dignities</h4>
              <p className="text-soft/70 text-sm">Essential dignities analysis</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🏠</div>
              <h4 className="text-soft font-semibold mb-2">House Systems</h4>
              <p className="text-soft/70 text-sm">Traditional house analysis</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">⏰</div>
              <h4 className="text-soft font-semibold mb-2">Timing Techniques</h4>
              <p className="text-soft/70 text-sm">Ancient timing methods</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 