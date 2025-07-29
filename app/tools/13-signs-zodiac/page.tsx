"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ThirteenSignsZodiacCoachInterface } from "@/components/ThirteenSignsZodiacCoachInterface"
import { useThirteenSignsZodiac } from "@/hooks/use-thirteen-signs-zodiac"

export default function ThirteenSignsZodiacPage() {
  const {
    birthData,
    analysis,
    isLoading,
    error,
    setBirthData,
    performThirteenSignsAnalysis,
    resetData
  } = useThirteenSignsZodiac()

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
          <h1 className="text-5xl font-bold gold-glow mb-4">🐍 13 Signs Zodiac</h1>
          <p className="text-soft leading-relaxed text-lg mb-4">
            Modern zodiac system including Ophiuchus for enhanced accuracy
          </p>
          {/* Inspirational Quote */}
          <div className="glass-card rounded-2xl p-6 border border-green-500/20 max-w-2xl mx-auto">
            <p className="text-xl italic text-green-300 font-serif mb-2">
              "The thirteenth sign, Ophiuchus, represents the serpent bearer and brings balance to the cosmic wheel."
            </p>
            <p className="text-soft/70 text-sm">— Modern Astrology</p>
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
              <h2 className="text-2xl gold-glow mb-6 text-center">13 Signs Analysis</h2>
              
              {/* Birth Details */}
              <div className="mb-6">
                <h3 className="text-lg text-soft mb-4 flex items-center">
                  <span className="mr-2">🐍</span>
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
                  <option value="personality">Personality & Traits</option>
                  <option value="compatibility">Relationship Compatibility</option>
                  <option value="career">Career & Vocation</option>
                  <option value="life-path">Life Path & Purpose</option>
                  <option value="strengths">Strengths & Weaknesses</option>
                  <option value="growth">Personal Growth</option>
                  <option value="ophiuchus">Ophiuchus Influence</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={performThirteenSignsAnalysis}
                  disabled={!(birthData.name ?? '').trim() || !(birthData.birthDateTime ?? '') || isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Analyzing..." : "🐍 Perform 13 Signs Analysis"}
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
                {["overview", "signs", "ophiuchus", "compatibility", "personality", "career", "guidance"].map((tab) => (
                  <motion.button
                    key={tab}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === tab
                        ? "bg-gradient-to-r from-green-500 to-blue-600 text-white"
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
                      🐍
                    </motion.div>
                    <p className="text-soft">Analyzing your 13 signs profile...</p>
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
                        <h3 className="text-2xl gold-glow mb-4">13 Signs Overview</h3>
                        <p className="text-soft leading-relaxed mb-4">{analysis.overview}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 glass-card rounded-xl">
                            <div className="text-3xl mb-2">☀️</div>
                            <div className="text-soft/70">Primary Sign</div>
                            <div className="gold-glow">{analysis.primarySign}</div>
                          </div>
                          <div className="text-center p-4 glass-card rounded-xl">
                            <div className="text-3xl mb-2">🌙</div>
                            <div className="text-soft/70">Moon Sign</div>
                            <div className="gold-glow">{analysis.moonSign}</div>
                          </div>
                          <div className="text-center p-4 glass-card rounded-xl">
                            <div className="text-3xl mb-2">🐍</div>
                            <div className="text-soft/70">Ophiuchus</div>
                            <div className="gold-glow">{analysis.ophiuchusInfluence}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "signs" && (
                      <div>
                        <h3 className="text-2xl gold-glow mb-4">All 13 Signs</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {analysis.allSigns?.map((sign: any, index: number) => (
                            <div key={index} className="glass-card rounded-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-semibold text-white">{sign.name}</div>
                                <div className="text-2xl">{sign.icon}</div>
                              </div>
                              <p className="text-sm text-slate-400 mb-2">{sign.dates}</p>
                              <p className="text-xs text-slate-500">{sign.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "ophiuchus" && (
                      <div>
                        <h3 className="text-2xl gold-glow mb-4">Ophiuchus Influence</h3>
                        <div className="glass-card rounded-xl p-6 mb-4">
                          <h4 className="text-xl font-semibold text-white mb-3">🐍 Ophiuchus (Nov 29 - Dec 17)</h4>
                          <p className="text-soft leading-relaxed mb-4">{analysis.ophiuchusDetails}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-semibold text-white mb-2">Traits</h5>
                              <ul className="text-sm text-slate-400 space-y-1">
                                {analysis.ophiuchusTraits?.map((trait: string, index: number) => (
                                  <li key={index}>• {trait}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-semibold text-white mb-2">Strengths</h5>
                              <ul className="text-sm text-slate-400 space-y-1">
                                {analysis.ophiuchusStrengths?.map((strength: string, index: number) => (
                                  <li key={index}>• {strength}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "compatibility" && (
                      <div>
                        <h3 className="text-2xl gold-glow mb-4">Relationship Compatibility</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analysis.compatibility?.map((comp: any, index: number) => (
                            <div key={index} className="glass-card rounded-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-white">{comp.sign}</h4>
                                <Badge variant="outline" className={`${
                                  comp.score >= 80 ? 'border-green-500 text-green-400' :
                                  comp.score >= 60 ? 'border-yellow-500 text-yellow-400' :
                                  'border-red-500 text-red-400'
                                }`}>
                                  {comp.score}%
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-400">{comp.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "personality" && (
                      <div>
                        <h3 className="text-2xl gold-glow mb-4">Personality Analysis</h3>
                        <p className="text-soft leading-relaxed mb-4">{analysis.personality}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="glass-card rounded-xl p-4">
                            <h4 className="font-semibold text-white mb-2">Strengths</h4>
                            <ul className="text-sm text-slate-400 space-y-1">
                              {analysis.strengths?.map((strength: string, index: number) => (
                                <li key={index}>• {strength}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="glass-card rounded-xl p-4">
                            <h4 className="font-semibold text-white mb-2">Growth Areas</h4>
                            <ul className="text-sm text-slate-400 space-y-1">
                              {analysis.growthAreas?.map((area: string, index: number) => (
                                <li key={index}>• {area}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "career" && (
                      <div>
                        <h3 className="text-2xl gold-glow mb-4">Career Guidance</h3>
                        <p className="text-soft leading-relaxed mb-4">{analysis.career}</p>
                        <div className="space-y-3">
                          {analysis.careerPaths?.map((path: any, index: number) => (
                            <div key={index} className="glass-card rounded-xl p-4">
                              <h4 className="font-semibold text-white mb-2">{path.title}</h4>
                              <p className="text-sm text-slate-400 mb-2">{path.description}</p>
                              <div className="text-xs text-slate-500">
                                <strong>Skills:</strong> {path.skills}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "guidance" && (
                      <div>
                        <h3 className="text-2xl gold-glow mb-4">Life Guidance</h3>
                        <p className="text-soft leading-relaxed mb-4">{analysis.guidance}</p>
                        <div className="space-y-3">
                          {analysis.recommendations?.map((rec: string, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="text-green-400 mt-1">•</div>
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
                    <div className="text-4xl mb-4">🐍</div>
                    <h3 className="text-xl gold-glow mb-2">Ready for 13 Signs Analysis</h3>
                    <p className="text-soft">Enter your birth details to discover your 13 signs profile including Ophiuchus.</p>
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
          <h2 className="text-3xl font-bold gold-glow text-center mb-8">13 Signs Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">🐍</div>
              <h4 className="text-soft font-semibold mb-2">Ophiuchus</h4>
              <p className="text-soft/70 text-sm">13th zodiac sign</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">⭐</div>
              <h4 className="text-soft font-semibold mb-2">Modern Accuracy</h4>
              <p className="text-soft/70 text-sm">Updated zodiac system</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">💕</div>
              <h4 className="text-soft font-semibold mb-2">Compatibility</h4>
              <p className="text-soft/70 text-sm">Enhanced relationships</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h4 className="text-soft font-semibold mb-2">Precision</h4>
              <p className="text-soft/70 text-sm">More accurate readings</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 