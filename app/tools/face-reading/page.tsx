"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaceReadingCoachInterface } from "@/components/FaceReadingCoachInterface"
import { useFaceReading } from "@/hooks/use-face-reading"

export default function FaceReadingPage() {
  const {
    faceData,
    analysis,
    isLoading,
    error,
    setFaceData,
    performFaceReading,
    resetData
  } = useFaceReading()

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
          <h1 className="text-5xl font-bold gold-glow mb-4">👁️ Face Reading</h1>
          <p className="text-soft leading-relaxed text-lg mb-4">
            Ancient physiognomy revealing personality through facial features
          </p>
          {/* Inspirational Quote */}
          <div className="glass-card rounded-2xl p-6 border border-pink-500/20 max-w-2xl mx-auto">
            <p className="text-xl italic text-pink-300 font-serif mb-2">
              "The face is the mirror of the soul, and every feature tells the story of character written by the hand of destiny."
            </p>
            <p className="text-soft/70 text-sm">— Aristotle</p>
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
              <h2 className="text-2xl gold-glow mb-6 text-center">Facial Wisdom</h2>
              
              {/* Face Features */}
              <div className="mb-6">
                <h3 className="text-lg text-soft mb-4 flex items-center">
                  <span className="mr-2">👁️</span>
                  Facial Features
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Eye Shape"
                    value={faceData.eyeShape || ""}
                    onChange={(e) => setFaceData({ ...faceData, eyeShape: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                  />
                  <input
                    type="text"
                    placeholder="Nose Type"
                    value={faceData.noseType || ""}
                    onChange={(e) => setFaceData({ ...faceData, noseType: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                  />
                  <input
                    type="text"
                    placeholder="Mouth Shape"
                    value={faceData.mouthShape || ""}
                    onChange={(e) => setFaceData({ ...faceData, mouthShape: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                  />
                  <input
                    type="text"
                    placeholder="Forehead Type"
                    value={faceData.foreheadType || ""}
                    onChange={(e) => setFaceData({ ...faceData, foreheadType: e.target.value })}
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
                  value={faceData.analysisFocus || ""}
                  onChange={(e) => setFaceData({ ...faceData, analysisFocus: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-soft focus:outline-none focus:border-yellow-400 transition-all duration-300"
                >
                  <option value="">Select Focus</option>
                  <option value="personality">Personality Traits</option>
                  <option value="character">Character Analysis</option>
                  <option value="destiny">Life Destiny</option>
                  <option value="relationships">Relationship Patterns</option>
                  <option value="career">Career Aptitude</option>
                  <option value="comprehensive">Comprehensive Reading</option>
                </select>
              </div>

              {/* Instructions */}
              <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
                <h4 className="text-soft font-semibold mb-2 flex items-center">
                  <span className="mr-2">💡</span>
                  Face Reading Insights
                </h4>
                <ul className="space-y-1 text-sm text-soft/80">
                  <li>• Ancient physiognomy</li>
                  <li>• Character analysis</li>
                  <li>• Personality traits</li>
                  <li>• Life destiny</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={performFaceReading}
                  disabled={isLoading || !faceData.eyeShape || !faceData.noseType || !faceData.mouthShape || !faceData.foreheadType || !faceData.analysisFocus}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl p-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? "👁️ Reading..." : "👁️ Read Your Face"}
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
                {["overview", "features", "personality", "character", "destiny", "advice"].map((tab) => (
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
                      👁️
                    </motion.div>
                    <p className="text-soft text-lg">Reading the wisdom written in your features...</p>
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
                    <p className="text-red-400 text-lg mb-2">Reading Error</p>
                    <p className="text-soft">{error}</p>
                  </motion.div>
                ) : analysis ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <FaceReadingCoachInterface 
                      analysis={analysis}
                      activeTab={activeTab}
                      faceData={faceData}
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
                    <div className="text-6xl mb-6">👁️</div>
                    <h3 className="text-2xl gold-glow mb-4">Ready to Read Your Face?</h3>
                    <p className="text-soft leading-relaxed">
                      Enter your facial features above to discover the character and destiny 
                      written in the wisdom of physiognomy.
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
          <h3 className="text-2xl gold-glow mb-6 text-center">✨ Face Reading Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">👁️</div>
              <h4 className="text-soft font-semibold mb-2">Eye Reading</h4>
              <p className="text-soft/70 text-sm">Window to the soul</p>
              </div>
            <div className="text-center">
              <div className="text-3xl mb-3">👃</div>
              <h4 className="text-soft font-semibold mb-2">Nose Analysis</h4>
              <p className="text-soft/70 text-sm">Character traits</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">👄</div>
              <h4 className="text-soft font-semibold mb-2">Mouth Reading</h4>
              <p className="text-soft/70 text-sm">Communication style</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🧠</div>
              <h4 className="text-soft font-semibold mb-2">Forehead Wisdom</h4>
              <p className="text-soft/70 text-sm">Intellectual capacity</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 