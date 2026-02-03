"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HoraryAstrologyCoachInterface } from "@/components/HoraryAstrologyCoachInterface"
import { useHoraryAstrology } from "@/hooks/use-horary-astrology"
import { Badge } from "@/components/ui/badge"

export default function HoraryPage() {
  const {
    question,
    questionTime,
    questionPlace,
    analysis,
    isLoading,
    error,
    setQuestion,
    setQuestionTime,
    setQuestionPlace,
    performHoraryAnalysis,
    resetData
  } = useHoraryAstrology()

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
          <h1 className="text-5xl font-bold gold-glow mb-4">⏰ Horary Astrology</h1>
          <p className="text-soft leading-relaxed text-lg mb-4">
            Answer specific questions with precise timing through astrological charts
          </p>
          {/* Inspirational Quote */}
          <div className="glass-card rounded-2xl p-6 border border-orange-500/20 max-w-2xl mx-auto">
            <p className="text-xl italic text-orange-300 font-serif mb-2">
              "The moment a question is asked is the moment the stars align to reveal the answer."
            </p>
            <p className="text-soft/70 text-sm">— William Lilly</p>
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
              <h2 className="text-2xl gold-glow mb-6 text-center">Question Analysis</h2>
              
              {/* Question Input */}
              <div className="mb-6">
                <h3 className="text-lg text-soft mb-4 flex items-center">
                  <span className="mr-2">❓</span>
                  Your Question
                </h3>
                <textarea
                  placeholder="Ask a specific yes/no question or timing question..."
                  value={question || ""}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft placeholder-white/50 focus:outline-none focus:border-yellow-400 transition-all duration-300 h-32 resize-none"
                />
              </div>

              {/* Question Time */}
              <div className="mb-6">
                <h3 className="text-lg text-soft mb-4 flex items-center">
                  <span className="mr-2">⏰</span>
                  Question Time
                </h3>
                <input
                  type="datetime-local"
                  value={questionTime || ""}
                  onChange={(e) => setQuestionTime(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                />
              </div>

              {/* Question Place */}
              <div className="mb-6">
                <h3 className="text-lg text-soft mb-4 flex items-center">
                  <span className="mr-2">📍</span>
                  Question Place
                </h3>
                <input
                  type="text"
                  placeholder="Where were you when you asked the question?"
                  value={questionPlace || ""}
                  onChange={(e) => setQuestionPlace(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={performHoraryAnalysis}
                  disabled={!(question ?? '').trim() || !(questionTime ?? '') || isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Analyzing..." : "⏰ Cast Horary Chart"}
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
                {["overview", "answer", "timing", "planets", "houses", "aspects", "guidance"].map((tab) => (
                  <motion.button
                    key={tab}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === tab
                        ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
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
                      ⏰
                    </motion.div>
                    <p className="text-soft">Casting your horary chart...</p>
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
                        <h3 className="text-2xl gold-glow mb-4">Horary Chart Overview</h3>
                        <p className="text-soft leading-relaxed mb-4">{analysis.overview}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 glass-card rounded-xl">
                            <div className="text-3xl mb-2">❓</div>
                            <div className="text-soft/70">Question</div>
                            <div className="gold-glow text-sm">{analysis.question}</div>
                          </div>
                          <div className="text-center p-4 glass-card rounded-xl">
                            <div className="text-3xl mb-2">⏰</div>
                            <div className="text-soft/70">Chart Time</div>
                            <div className="gold-glow">{analysis.chartTime}</div>
                          </div>
                          <div className="text-center p-4 glass-card rounded-xl">
                            <div className="text-3xl mb-2">📍</div>
                            <div className="text-soft/70">Location</div>
                            <div className="gold-glow">{analysis.location}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "answer" && (
                      <div>
                        <h3 className="text-2xl gold-glow mb-4">Answer to Your Question</h3>
                        <div className="glass-card rounded-xl p-6 mb-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xl font-semibold text-white">Direct Answer</h4>
                            <Badge variant="outline" className={`${
                              analysis.answer === 'Yes' ? 'border-green-500 text-green-400' :
                              analysis.answer === 'No' ? 'border-red-500 text-red-400' :
                              'border-yellow-500 text-yellow-400'
                            }`}>
                              {analysis.answer}
                            </Badge>
                          </div>
                          <p className="text-soft leading-relaxed mb-4">{analysis.answerExplanation}</p>
                          <div className="text-sm text-slate-400">
                            <strong>Confidence Level:</strong> {analysis.confidence}%
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "timing" && (
                      <div>
                        <h3 className="text-2xl gold-glow mb-4">Timing Analysis</h3>
                        <p className="text-soft leading-relaxed mb-4">{analysis.timing}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="glass-card rounded-xl p-4">
                            <h4 className="font-semibold text-white mb-2">Favorable Timing</h4>
                            <ul className="text-sm text-slate-400 space-y-1">
                              {analysis.favorableTiming?.map((timing: string, index: number) => (
                                <li key={index}>• {timing}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="glass-card rounded-xl p-4">
                            <h4 className="font-semibold text-white mb-2">Avoid These Times</h4>
                            <ul className="text-sm text-slate-400 space-y-1">
                              {analysis.avoidTiming?.map((timing: string, index: number) => (
                                <li key={index}>• {timing}</li>
                              ))}
                            </ul>
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
                                <Badge variant="outline" className="border-orange-500 text-orange-400">
                                  {planet.sign}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-400 mb-2">{planet.house}</p>
                              <p className="text-xs text-slate-500">{planet.meaning}</p>
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

                    {activeTab === "guidance" && (
                      <div>
                        <h3 className="text-2xl gold-glow mb-4">Guidance & Advice</h3>
                        <p className="text-soft leading-relaxed mb-4">{analysis.guidance}</p>
                        <div className="space-y-3">
                          {analysis.recommendations?.map((rec: string, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="text-orange-400 mt-1">•</div>
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
                    <div className="text-4xl mb-4">⏰</div>
                    <h3 className="text-xl gold-glow mb-2">Ready for Horary Analysis</h3>
                    <p className="text-soft">Ask a specific question to cast your horary chart.</p>
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
          <h2 className="text-3xl font-bold gold-glow text-center mb-8">Horary Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">⏰</div>
              <h4 className="text-soft font-semibold mb-2">Precise Timing</h4>
              <p className="text-soft/70 text-sm">Exact moment analysis</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">❓</div>
              <h4 className="text-soft font-semibold mb-2">Specific Answers</h4>
              <p className="text-soft/70 text-sm">Yes/no questions</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">📅</div>
              <h4 className="text-soft font-semibold mb-2">Event Timing</h4>
              <p className="text-soft/70 text-sm">When things happen</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h4 className="text-soft font-semibold mb-2">Direct Guidance</h4>
              <p className="text-soft/70 text-sm">Clear answers</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 