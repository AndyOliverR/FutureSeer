"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import IChingSeerChatInterface from "@/components/IChingSeerChatInterface"
import { useIChing } from "@/hooks/use-iching"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function IChingPage() {
  const { user, userProfile } = useAuth()
  const {
    question,
    method,
    hexagrams,
    analysis,
    isLoading,
    error,
    setQuestion,
    setMethod,
    performIChingReading,
    resetData
  } = useIChing()

  const [activeTab, setActiveTab] = useState("overview")

  // Hexagram visualization component with safety checks
  const HexagramDisplay = ({ hexagram, title }: { hexagram: any, title: string }) => {
    if (!hexagram || !hexagram.lines || !Array.isArray(hexagram.lines)) {
      return (
        <div className="text-center text-red-400 p-4">
          <p>Invalid hexagram data</p>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center space-y-4">
        <h4 className="text-lg font-semibold text-amber-900">{title}</h4>
        <div className="bg-white rounded-lg p-6 border-2 border-amber-200 shadow-md">
          {/* Hexagram lines from top to bottom (lines are stored bottom to top) */}
          <div className="space-y-2">
            {[...hexagram.lines].reverse().map((line: any, idx: number) => {
              const isChanging = line.changing
              return (
                <div key={idx} className={`flex justify-center ${isChanging ? 'ring-2 ring-amber-400 rounded p-1' : ''}`}>
                  {line.yinYang === 'yang' ? (
                    <div className={`w-32 h-3 rounded bg-amber-500 ${isChanging ? 'opacity-80' : ''}`} />
                  ) : (
                    <div className="flex gap-2">
                      <div className={`w-14 h-3 rounded bg-amber-500 ${isChanging ? 'opacity-80' : ''}`} />
                      <div className={`w-14 h-3 rounded bg-amber-500 ${isChanging ? 'opacity-80' : ''}`} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-600">{hexagram.number}</p>
          <p className="text-lg text-slate-700">{hexagram.chinese}</p>
          <p className="text-sm text-slate-600">{hexagram.name}</p>
          <p className="text-xs text-slate-500 italic">{hexagram.pinyin}</p>
        </div>
      </div>
    )
  }

  // Render tab content based on activeTab
  const renderTabContent = () => {
    if (!analysis) {
      return null
    }

    if (!analysis.hexagram) {
      return (
        <div className="text-center py-16">
          <p className="text-red-400">Error: Hexagram data is missing</p>
        </div>
      )
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-amber-900 mb-2">
                Hexagram {analysis.hexagram.number}: {analysis.hexagram.name}
              </h3>
              <p className="text-slate-700">{analysis.hexagram.meaning}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HexagramDisplay hexagram={analysis.hexagram} title="Primary Hexagram" />
              {analysis.hexagram.changingTo && (
                <HexagramDisplay hexagram={analysis.hexagram.changingTo} title="Relating Hexagram" />
              )}
            </div>
            <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-lg">
              <CardContent className="p-4">
                <h4 className="font-semibold text-amber-900 mb-2">Question</h4>
                <p className="text-slate-700 mb-4">{question}</p>
                <h4 className="font-semibold text-amber-900 mb-2">Method</h4>
                <p className="text-slate-700">{method === 'coins' ? 'Three Coins' : method === 'yarrow' ? 'Yarrow Stalks' : 'Random'}</p>
              </CardContent>
            </Card>
          </div>
        )
      
      case 'hexagrams':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HexagramDisplay hexagram={analysis.hexagram} title="Primary Hexagram" />
              {analysis.hexagram.changingTo && (
                <HexagramDisplay hexagram={analysis.hexagram.changingTo} title="Relating Hexagram" />
              )}
            </div>
            <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-lg">
              <CardContent className="p-4 space-y-4">
                <div>
                  <h4 className="font-semibold text-amber-900 mb-2">Trigrams</h4>
                  <p className="text-slate-700">
                    Upper: {analysis.hexagram.trigramUpper} ({analysis.hexagram.elementUpper})
                  </p>
                  <p className="text-slate-700">
                    Lower: {analysis.hexagram.trigramLower} ({analysis.hexagram.elementLower})
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900 mb-2">Lines</h4>
                  <div className="space-y-2">
                    {analysis.hexagram.lines.map((line: any) => (
                      <div key={line.position} className="flex items-center gap-2">
                        <span className="text-slate-600 w-20">Line {line.position}:</span>
                        <span className={`text-sm ${line.changing ? 'text-amber-600 font-bold' : 'text-slate-700'}`}>
                          {line.yinYang === 'yang' ? 'Yang' : 'Yin'} {line.changing ? '(Changing)' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      case 'interpretation':
        return (
          <div className="space-y-4">
            <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-lg">
              <CardContent className="p-4">
                <h4 className="font-semibold text-amber-900 mb-3">Overall Interpretation</h4>
                <p className="text-slate-700 leading-relaxed">{analysis.interpretation.overall}</p>
              </CardContent>
            </Card>
            <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-lg">
              <CardContent className="p-4">
                <h4 className="font-semibold text-amber-900 mb-3">Advice</h4>
                <p className="text-slate-700 leading-relaxed">{analysis.interpretation.advice}</p>
              </CardContent>
            </Card>
            <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-lg">
              <CardContent className="p-4">
                <h4 className="font-semibold text-amber-900 mb-3">Warning</h4>
                <p className="text-slate-700 leading-relaxed">{analysis.interpretation.warning}</p>
              </CardContent>
            </Card>
            <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-lg">
              <CardContent className="p-4">
                <h4 className="font-semibold text-amber-900 mb-3">Opportunity</h4>
                <p className="text-slate-700 leading-relaxed">{analysis.interpretation.opportunity}</p>
              </CardContent>
            </Card>
          </div>
        )
      
      case 'guidance':
        return (
          <div className="space-y-4">
            <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-lg">
              <CardContent className="p-4">
                <h4 className="font-semibold text-amber-900 mb-3">Recommendations</h4>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">⭐</span>
                      <span className="text-slate-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-lg">
              <CardContent className="p-4">
                <h4 className="font-semibold text-amber-900 mb-3">Changing Lines</h4>
                <p className="text-slate-700 mb-2">{analysis.changingLines.significance}</p>
                <p className="text-slate-700">{analysis.changingLines.transformation}</p>
              </CardContent>
            </Card>
            <Card elevation={2} className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl shadow-lg">
              <CardContent className="p-4">
                <p className="text-blue-900 text-sm">
                  💡 Visit the "Ask the Seer" tab to consult the I Ching Master for deeper guidance about your reading.
                </p>
              </CardContent>
            </Card>
          </div>
        )
      
      case 'timing':
        return (
          <div className="space-y-4">
            <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-lg">
              <CardContent className="p-4">
                <h4 className="font-semibold text-amber-900 mb-3">Timing Analysis</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-600">Season:</span>
                    <p className="text-slate-700 font-semibold">{analysis.timing.season}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Element:</span>
                    <p className="text-slate-700 font-semibold">{analysis.timing.element}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Direction:</span>
                    <p className="text-slate-700 font-semibold">{analysis.timing.direction}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Time of Day:</span>
                    <p className="text-slate-700 font-semibold">{analysis.timing.timeOfDay}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${analysis.timing.favorable ? 'bg-green-100 text-green-800 border-2 border-green-300' : 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'}`}>
                    {analysis.timing.favorable ? 'Favorable Timing' : 'Challenging Timing'}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-lg">
              <CardContent className="p-4">
                <h4 className="font-semibold text-amber-900 mb-3">Elements</h4>
                <div className="space-y-2">
                  <p className="text-slate-700">Primary: <span className="font-semibold">{analysis.elements.primary}</span></p>
                  <p className="text-slate-700">Secondary: <span className="font-semibold">{analysis.elements.secondary}</span></p>
                  <p className="text-slate-700">Conflict: <span className="font-semibold">{analysis.elements.conflict}</span></p>
                  <p className="text-slate-700">Harmony: <span className="font-semibold">{analysis.elements.harmony}</span></p>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      case 'ask-the-seer':
        return (
          <div className="space-y-4">
            <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-lg">
              <CardContent className="p-4">
                <h4 className="font-semibold text-amber-900 mb-3">Practical Advice</h4>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">⭐</span>
                      <span className="text-slate-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <p className="text-sm text-amber-800 mt-2">
              Use the <strong>Ask the Seer</strong> tab to consult the I Ching master about your reading.
            </p>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen p-4 starfield-ultra-sharp">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 pt-4"
        >
          <h1 className="text-5xl font-serif font-semibold mb-6">
            <span className="text-yellow-400">☯</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">I Ching</span>
          </h1>
          <p className="text-slate-200 leading-relaxed text-lg mb-4">
            Ancient Chinese wisdom through the Book of Changes and cosmic balance
          </p>
          {/* Inspirational Quote */}
          <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-lg max-w-2xl mx-auto">
            <CardContent className="p-6">
              <p className="text-xl italic text-amber-900 font-serif mb-2">
                "The I Ching is the oracle of the sages, and those who consult it find harmony in the ever-changing dance of yin and yang."
              </p>
              <p className="text-slate-600 text-sm">— Confucius</p>
            </CardContent>
          </Card>
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
            <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-amber-900 mb-6 text-center">Cosmic Balance</h2>
                
                {/* Question Input */}
                <div className="mb-6">
                  <h3 className="text-lg text-amber-900 mb-4 flex items-center font-semibold">
                    <span className="mr-2">❓</span>
                    Your Question
                  </h3>
                  <textarea
                    placeholder="Ask the I Ching for guidance on your path..."
                    value={question || ""}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full bg-white border-2 border-amber-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-all duration-300 h-32 resize-none"
                    aria-label="I Ching question input"
                  />
                </div>

                {/* Method */}
                <div className="mb-6">
                  <h3 className="text-lg text-amber-900 mb-4 flex items-center font-semibold">
                    <span className="mr-2 text-amber-600">☯</span>
                    Consultation Method
                  </h3>
                  <select
                    value={method || ""}
                    onChange={(e) => setMethod((e.target.value || '') as '' | 'coins' | 'yarrow' | 'random')}
                    className="w-full bg-white border-2 border-amber-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-amber-400 transition-all duration-300"
                    aria-label="I Ching consultation method"
                  >
                    <option value="">Select Method</option>
                    <option value="coins">Three Coins</option>
                    <option value="yarrow">Yarrow Stalks</option>
                    <option value="random">Random Hexagram</option>
                  </select>
                </div>

                {/* Instructions */}
                <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-300">
                  <h4 className="text-amber-900 font-semibold mb-2 flex items-center">
                    <span className="mr-2">💡</span>
                    I Ching Insights
                  </h4>
                  <ul className="space-y-1 text-sm text-slate-700">
                    <li>• Ancient Chinese wisdom</li>
                    <li>• Yin and yang balance</li>
                    <li>• Hexagram interpretation</li>
                    <li>• Cosmic guidance</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <motion.button
                    whileHover={{}}
                    whileTap={{ scale: 0.98 }}
                    onClick={performIChingReading}
                    disabled={isLoading || !question.trim() || !method}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl p-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all duration-300"
                    aria-label="Consult the I Ching"
                  >
                    {isLoading ? <><span>☯</span> Consulting...</> : <><span>☯</span> Consult the I Ching</>}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{}}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetData}
                    className="w-full bg-white border-2 border-amber-300 text-amber-900 rounded-xl p-4 font-semibold hover:bg-amber-50 transition-all duration-300"
                    aria-label="Reset I Ching reading"
                  >
                    🔄 Reset
                  </motion.button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl shadow-lg">
              <CardContent className="p-6">
              {/* Tabs with Devotionist Styling */}
              <div className="flex flex-wrap gap-2 mb-6">
                {["overview", "hexagrams", "interpretation", "guidance", "timing", "ask-the-seer"].map((tab) => (
                  <motion.button
                    key={tab}
                    whileHover={{}}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 m3-elevation-0 m3-elevation-transition m3-transition-standard ${
                      activeTab === tab
                        ? "bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-900 m3-elevation-1"
                        : "text-slate-600 hover:text-amber-900 hover:bg-amber-100/50 hover:m3-elevation-1"
                    }`}
                    aria-label={`View ${tab === 'ask-the-seer' ? 'Ask the Seer' : tab} tab`}
                    aria-selected={activeTab === tab}
                  >
                    {tab === 'ask-the-seer' ? 'Ask the Seer' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </motion.button>
                ))}
              </div>

              {/* Content */}
              {activeTab === 'ask-the-seer' ? (
                <IChingSeerChatInterface
                  analysis={analysis}
                  userId={user?.uid}
                  userProfile={userProfile}
                  sessionId={analysis ? `iching_${analysis.id || Date.now()}` : undefined}
                />
              ) : (
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
                        className="text-4xl mb-4 text-amber-600"
                      >
                        ☯
                      </motion.div>
                      <p className="text-slate-700 text-lg">Consulting the ancient Book of Changes...</p>
                    </motion.div>
                  ) : error ? (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-center py-16"
                    >
                      <div className="text-4xl mb-4">⚠️</div>
                      <p className="text-red-600 text-lg mb-2 font-semibold">Consultation Error</p>
                      <p className="text-slate-700 mb-4">{error}</p>
                      <button
                        onClick={resetData}
                        className="px-4 py-2 bg-amber-100 border-2 border-amber-300 text-amber-900 rounded-lg hover:bg-amber-200 transition-all duration-300"
                        aria-label="Try again"
                      >
                        Try Again
                      </button>
                    </motion.div>
                  ) : analysis ? (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {renderTabContent()}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-16"
                    >
                      <div className="text-6xl mb-6 text-amber-600">☯</div>
                      <h3 className="text-2xl font-bold text-amber-900 mb-4">Ready for Ancient Wisdom?</h3>
                      <p className="text-slate-700 leading-relaxed">
                        Ask your question above to receive guidance through the ancient 
                        wisdom of the I Ching and the Book of Changes.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Features Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl shadow-lg mt-12">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-amber-900 mb-6 text-center">✨ I Ching Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-3 text-amber-600">☯</div>
                  <h4 className="text-amber-900 font-semibold mb-2">Yin Yang</h4>
                  <p className="text-slate-600 text-sm">Cosmic balance</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">📖</div>
                  <h4 className="text-amber-900 font-semibold mb-2">Ancient Text</h4>
                  <p className="text-slate-600 text-sm">Book of Changes</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">🔮</div>
                  <h4 className="text-amber-900 font-semibold mb-2">Hexagrams</h4>
                  <p className="text-slate-600 text-sm">64 sacred symbols</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">✨</div>
                  <h4 className="text-amber-900 font-semibold mb-2">Sage Wisdom</h4>
                  <p className="text-slate-600 text-sm">Confucian guidance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
