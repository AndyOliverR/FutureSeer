"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AstroScribeCoachInterface } from "@/components/AstroScribeCoachInterface"
import { useAstroScribe } from "@/hooks/useAstroScribe"

export default function AstroScribePage() {
  const {
    scribeData,
    interpretation,
    isLoading,
    error,
    setScribeData,
    generateInterpretation,
    resetData
  } = useAstroScribe()

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
          <h1 className="text-5xl font-bold gold-glow mb-4">✍️ AstroScribe</h1>
          <p className="text-soft leading-relaxed text-lg">
            AI-powered astrological interpretation and personalized report generation
          </p>
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
              <h2 className="text-2xl gold-glow mb-6 text-center">Interpretation Parameters</h2>
              
              {/* Interpretation Type */}
              <div className="mb-6">
                <h3 className="text-lg text-soft mb-4 flex items-center">
                  <span className="mr-2">🎯</span>
                  Interpretation Type
                </h3>
                <select
                  value={scribeData.interpretationType || ""}
                  onChange={(e) => setScribeData({ ...scribeData, interpretationType: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                >
                  <option value="">Select Interpretation Type</option>
                  <option value="birth-chart">Birth Chart Analysis</option>
                  <option value="relationship">Relationship Compatibility</option>
                  <option value="career">Career & Life Path</option>
                  <option value="health">Health & Wellness</option>
                  <option value="spiritual">Spiritual Development</option>
                  <option value="timing">Timing & Transits</option>
                  <option value="custom">Custom Interpretation</option>
                </select>
              </div>

              {/* Writing Style */}
              <div className="mb-6">
                <h3 className="text-lg text-soft mb-4 flex items-center">
                  <span className="mr-2">✍️</span>
                  Writing Style
                </h3>
                <select
                  value={scribeData.writingStyle || ""}
                  onChange={(e) => setScribeData({ ...scribeData, writingStyle: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                >
                  <option value="">Select Writing Style</option>
                  <option value="professional">Professional & Analytical</option>
                  <option value="conversational">Conversational & Friendly</option>
                  <option value="poetic">Poetic & Inspirational</option>
                  <option value="detailed">Detailed & Comprehensive</option>
                  <option value="concise">Concise & Practical</option>
                </select>
              </div>

              {/* Focus Areas */}
              <div className="mb-6">
                <h3 className="text-lg text-soft mb-4 flex items-center">
                  <span className="mr-2">🎯</span>
                  Focus Areas
                </h3>
                <div className="space-y-2">
                  {[
                    "Personality & Traits",
                    "Relationships & Love",
                    "Career & Success",
                    "Health & Wellness",
                    "Spiritual Growth",
                    "Life Challenges",
                    "Opportunities",
                    "Timing & Cycles"
                  ].map((area) => (
                    <label key={area} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={scribeData.focusAreas?.includes(area) || false}
                        onChange={(e) => {
                          const currentAreas = scribeData.focusAreas || []
                          const newAreas = e.target.checked
                            ? [...currentAreas, area]
                            : currentAreas.filter(a => a !== area)
                          setScribeData({ ...scribeData, focusAreas: newAreas })
                        }}
                        className="w-4 h-4 text-purple-600 bg-white/5 border-white/20 rounded focus:ring-purple-500 focus:ring-2"
                      />
                      <span className="text-soft text-sm">{area}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Astrological Data */}
              <div className="mb-6">
                <h3 className="text-lg text-soft mb-4 flex items-center">
                  <span className="mr-2">📊</span>
                  Astrological Data
                </h3>
                <textarea
                  placeholder="Enter birth data, chart details, or specific astrological information to interpret..."
                  value={scribeData.astrologicalData || ""}
                  onChange={(e) => setScribeData({ ...scribeData, astrologicalData: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft placeholder-white/50 focus:outline-none focus:border-yellow-400 transition-all duration-300 h-32 resize-none"
                />
              </div>

              {/* Specific Questions */}
              <div className="mb-6">
                <h3 className="text-lg text-soft mb-4 flex items-center">
                  <span className="mr-2">❓</span>
                  Specific Questions
                </h3>
                <textarea
                  placeholder="What specific questions or areas would you like me to focus on? (optional)"
                  value={scribeData.specificQuestions || ""}
                  onChange={(e) => setScribeData({ ...scribeData, specificQuestions: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft placeholder-white/50 focus:outline-none focus:border-yellow-400 transition-all duration-300 h-24 resize-none"
                />
              </div>

              {/* Report Length */}
              <div className="mb-8">
                <h3 className="text-lg text-soft mb-4 flex items-center">
                  <span className="mr-2">📏</span>
                  Report Length
                </h3>
                <select
                  value={scribeData.reportLength || ""}
                  onChange={(e) => setScribeData({ ...scribeData, reportLength: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                >
                  <option value="">Select Report Length</option>
                  <option value="brief">Brief Summary (1-2 pages)</option>
                  <option value="standard">Standard Report (3-5 pages)</option>
                  <option value="detailed">Detailed Analysis (6-10 pages)</option>
                  <option value="comprehensive">Comprehensive Report (10+ pages)</option>
                </select>
              </div>

              {/* Instructions */}
              <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <h4 className="text-soft font-semibold mb-2 flex items-center">
                  <span className="mr-2">💡</span>
                  AstroScribe Features
                </h4>
                <ul className="space-y-1 text-sm text-soft/80">
                  <li>• AI-powered astrological interpretation</li>
                  <li>• Personalized report generation</li>
                  <li>• Multiple writing styles and formats</li>
                  <li>• Comprehensive analysis and insights</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generateInterpretation}
                  disabled={isLoading || !scribeData.interpretationType || !scribeData.writingStyle || !scribeData.astrologicalData || !scribeData.reportLength}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl p-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? "✍️ Generating..." : "✍️ Generate Interpretation"}
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
                {["overview", "analysis", "insights", "recommendations", "timing", "summary"].map((tab) => (
                  <motion.button
                    key={tab}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === tab
                        ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white"
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
                      ✍️
                    </motion.div>
                    <p className="text-soft text-lg">Generating your personalized astrological interpretation...</p>
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
                    <p className="text-red-400 text-lg mb-2">Generation Error</p>
                    <p className="text-soft">{error}</p>
                  </motion.div>
                ) : interpretation ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <AstroScribeCoachInterface 
                      interpretation={interpretation}
                      activeTab={activeTab}
                      scribeData={scribeData}
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
                    <div className="text-6xl mb-6">✍️</div>
                    <h3 className="text-2xl gold-glow mb-4">Ready for AI Interpretation?</h3>
                    <p className="text-soft leading-relaxed">
                      Enter your astrological data and preferences above to receive a personalized, 
                      AI-powered interpretation and comprehensive report.
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
          <h3 className="text-2xl gold-glow mb-6 text-center">✨ AstroScribe Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">🤖</div>
              <h4 className="text-soft font-semibold mb-2">AI-Powered</h4>
              <p className="text-soft/70 text-sm">Advanced AI interpretation of astrological data</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">📝</div>
              <h4 className="text-soft font-semibold mb-2">Personalized</h4>
              <p className="text-soft/70 text-sm">Custom reports tailored to your specific needs</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🎨</div>
              <h4 className="text-soft font-semibold mb-2">Multiple Styles</h4>
              <p className="text-soft/70 text-sm">Choose from various writing styles and formats</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">📊</div>
              <h4 className="text-soft font-semibold mb-2">Comprehensive</h4>
              <p className="text-soft/70 text-sm">Detailed analysis covering all aspects of life</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 