"use client"

import { useState, useEffect } from "react"
import { devLog } from '@/lib/devLogger';
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import IChingSeerChatInterface from "@/components/IChingSeerChatInterface"
import { useIChing } from "@/hooks/use-iching"

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

  // Monitor analysis state changes for debugging
  useEffect(() => {
    devLog.debug('🔮 IChingPage: analysis state changed:', {
      hasAnalysis: !!analysis,
      analysisId: analysis?.id,
      hexagramNumber: analysis?.hexagram?.number,
      isLoading,
      error
    });
  }, [analysis, isLoading, error]);

  // Hexagram visualization component with safety checks
  const HexagramDisplay = ({ hexagram, title }: { hexagram: any, title: string }) => {
    if (!hexagram || !hexagram.lines || !Array.isArray(hexagram.lines)) {
      devLog.warn('⚠️ IChingPage: HexagramDisplay received invalid hexagram:', hexagram, 'page');
      return (
        <div className="text-center text-red-400 p-4">
          <p>Invalid hexagram data</p>
        </div>
      );
    }

    return (
    <div className="flex flex-col items-center space-y-4">
      <h4 className="text-lg font-semibold text-yellow-300">{title}</h4>
      <div className="bg-slate-900/50 rounded-lg p-6 border-2 border-yellow-500/30">
        {/* Hexagram lines from top to bottom (lines are stored bottom to top) */}
        <div className="space-y-2">
          {[...hexagram.lines].reverse().map((line: any, idx: number) => {
            const isChanging = line.changing
            return (
              <div key={idx} className={`flex justify-center ${isChanging ? 'ring-2 ring-yellow-400 rounded p-1' : ''}`}>
                {line.yinYang === 'yang' ? (
                  <div className={`w-32 h-3 rounded bg-yellow-400 ${isChanging ? 'opacity-80' : ''}`} />
                ) : (
                  <div className="flex gap-2">
                    <div className={`w-14 h-3 rounded bg-yellow-400 ${isChanging ? 'opacity-80' : ''}`} />
                    <div className={`w-14 h-3 rounded bg-yellow-400 ${isChanging ? 'opacity-80' : ''}`} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-yellow-400">{hexagram.number}</p>
        <p className="text-lg text-white">{hexagram.chinese}</p>
        <p className="text-sm text-slate-300">{hexagram.name}</p>
        <p className="text-xs text-slate-400 italic">{hexagram.pinyin}</p>
      </div>
    </div>
    );
  };

  // Render tab content based on activeTab
  const renderTabContent = () => {
    if (!analysis) {
      devLog.warn('⚠️ IChingPage: renderTabContent called but analysis is null', undefined, 'page');
      return null;
    }

    if (!analysis.hexagram) {
      devLog.error('❌ IChingPage: analysis exists but hexagram is missing:', analysis, 'page');
      return (
        <div className="text-center py-16">
          <p className="text-red-400">Error: Hexagram data is missing</p>
        </div>
      );
    }

    devLog.debug('IChingPage: Rendering tab content', { activeTab, hasHexagram: !!analysis.hexagram, hasInterpretation: !!analysis.interpretation, hasRecommendations: !!analysis.recommendations }, 'i-ching');

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold gold-glow mb-2">
                Hexagram {analysis.hexagram.number}: {analysis.hexagram.name}
              </h3>
              <p className="text-white">{analysis.hexagram.meaning}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HexagramDisplay hexagram={analysis.hexagram} title="Primary Hexagram" />
              {analysis.hexagram.changingTo && (
                <HexagramDisplay hexagram={analysis.hexagram.changingTo} title="Relating Hexagram" />
              )}
            </div>
            <div className="glass-card rounded-2xl p-4 border border-white/10">
              <h4 className="font-semibold text-yellow-300 mb-2">Question</h4>
              <p className="text-white mb-4">{question}</p>
              <h4 className="font-semibold text-yellow-300 mb-2">Method</h4>
              <p className="text-white">{method === 'coins' ? 'Three Coins' : method === 'yarrow' ? 'Yarrow Stalks' : 'Random'}</p>
            </div>
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
            <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-4">
              <div>
                <h4 className="font-semibold text-yellow-300 mb-2">Trigrams</h4>
                <p className="text-white">
                  Upper: {analysis.hexagram.trigramUpper} ({analysis.hexagram.elementUpper})
                </p>
                <p className="text-white">
                  Lower: {analysis.hexagram.trigramLower} ({analysis.hexagram.elementLower})
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-300 mb-2">Lines</h4>
                <div className="space-y-2">
                  {analysis.hexagram.lines.map((line: any) => (
                    <div key={line.position} className="flex items-center gap-2">
                      <span className="text-white/70 w-20">Line {line.position}:</span>
                      <span className={`text-sm ${line.changing ? 'text-yellow-400 font-bold' : 'text-white'}`}>
                        {line.yinYang === 'yang' ? 'Yang' : 'Yin'} {line.changing ? '(Changing)' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'interpretation':
        return (
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-4 border border-white/10">
              <h4 className="font-semibold text-yellow-300 mb-3">Overall Interpretation</h4>
              <p className="text-white leading-relaxed">{analysis.interpretation.overall}</p>
            </div>
            <div className="glass-card rounded-2xl p-4 border border-white/10">
              <h4 className="font-semibold text-yellow-300 mb-3">Advice</h4>
              <p className="text-white leading-relaxed">{analysis.interpretation.advice}</p>
            </div>
            <div className="glass-card rounded-2xl p-4 border border-white/10">
              <h4 className="font-semibold text-yellow-300 mb-3">Warning</h4>
              <p className="text-white leading-relaxed">{analysis.interpretation.warning}</p>
            </div>
            <div className="glass-card rounded-2xl p-4 border border-white/10">
              <h4 className="font-semibold text-yellow-300 mb-3">Opportunity</h4>
              <p className="text-white leading-relaxed">{analysis.interpretation.opportunity}</p>
            </div>
          </div>
        )
      
      case 'guidance':
        return (
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-4 border border-white/10">
              <h4 className="font-semibold text-yellow-300 mb-3">Recommendations</h4>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⭐</span>
                    <span className="text-white">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card rounded-2xl p-4 border border-white/10">
              <h4 className="font-semibold text-yellow-300 mb-3">Changing Lines</h4>
              <p className="text-white mb-2">{analysis.changingLines.significance}</p>
              <p className="text-white">{analysis.changingLines.transformation}</p>
            </div>
            <div className="glass-card rounded-2xl p-4 border border-blue-500/30 bg-blue-500/10">
              <p className="text-blue-300 text-sm">
                💡 Visit the "Advice" tab to consult the I Ching Master for deeper guidance about your reading.
              </p>
            </div>
          </div>
        )
      
      case 'timing':
        return (
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-4 border border-white/10">
              <h4 className="font-semibold text-yellow-300 mb-3">Timing Analysis</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-white/70">Season:</span>
                  <p className="text-white font-semibold">{analysis.timing.season}</p>
                </div>
                <div>
                  <span className="text-white/70">Element:</span>
                  <p className="text-white font-semibold">{analysis.timing.element}</p>
                </div>
                <div>
                  <span className="text-white/70">Direction:</span>
                  <p className="text-white font-semibold">{analysis.timing.direction}</p>
                </div>
                <div>
                  <span className="text-white/70">Time of Day:</span>
                  <p className="text-white font-semibold">{analysis.timing.timeOfDay}</p>
                </div>
              </div>
              <div className="mt-4">
                <span className={`px-3 py-1 rounded-full text-sm ${analysis.timing.favorable ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {analysis.timing.favorable ? 'Favorable Timing' : 'Challenging Timing'}
                </span>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-4 border border-white/10">
              <h4 className="font-semibold text-yellow-300 mb-3">Elements</h4>
              <div className="space-y-2">
                <p className="text-white">Primary: <span className="font-semibold">{analysis.elements.primary}</span></p>
                <p className="text-white">Secondary: <span className="font-semibold">{analysis.elements.secondary}</span></p>
                <p className="text-white">Conflict: <span className="font-semibold">{analysis.elements.conflict}</span></p>
                <p className="text-white">Harmony: <span className="font-semibold">{analysis.elements.harmony}</span></p>
              </div>
            </div>
          </div>
        )
      
      case 'advice':
        return (
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-4 border border-white/10">
              <h4 className="font-semibold text-yellow-300 mb-3">Practical Advice</h4>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⭐</span>
                    <span className="text-white">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
            {analysis && user && userProfile && (
              <div className="glass-card rounded-2xl p-4 border border-white/10">
                <h4 className="font-semibold text-yellow-300 mb-3">Ask the I Ching Master</h4>
                <div className="h-[600px]">
                  <IChingSeerChatInterface
                    userId={user.uid}
                    userProfile={userProfile}
                    ichingAnalysis={analysis}
                    sessionId={`iching_${analysis.id || Date.now()}`}
                  />
                </div>
              </div>
            )}
            {analysis && (!user || !userProfile) && (
              <div className="glass-card rounded-2xl p-4 border border-yellow-500/30 bg-yellow-500/10">
                <p className="text-yellow-300">
                  Please sign in to consult the I Ching master about your reading.
                </p>
              </div>
            )}
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
          className="text-center mb-8 pt-8"
        >
          <motion.a
            href="/tools"
            className="text-white hover:gold-glow mb-4 inline-block transition-all duration-300"
            whileHover={{ x: -5 }}
          >
            ← Back to Tools
          </motion.a>
          <h1 className="text-5xl font-bold gold-glow mb-4"><span className="text-yellow-400">☯</span> I Ching</h1>
          <p className="text-white leading-relaxed text-lg mb-4">
            Ancient Chinese wisdom through the Book of Changes and cosmic balance
          </p>
          {/* Inspirational Quote */}
          <div className="glass-card rounded-2xl p-6 border border-yellow-500/20 max-w-2xl mx-auto">
            <p className="text-xl italic text-yellow-300 font-serif mb-2">
              "The I Ching is the oracle of the sages, and those who consult it find harmony in the ever-changing dance of yin and yang."
            </p>
            <p className="text-white/70 text-sm">— Confucius</p>
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
              <h2 className="text-2xl gold-glow mb-6 text-center">Cosmic Balance</h2>
              
              {/* Question Input */}
              <div className="mb-6">
                <h3 className="text-lg text-white mb-4 flex items-center">
                  <span className="mr-2">❓</span>
                  Your Question
                </h3>
                <textarea
                  placeholder="Ask the I Ching for guidance on your path..."
                  value={question || ""}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 transition-all duration-300 h-32 resize-none"
                />
              </div>

              {/* Method */}
              <div className="mb-6">
                <h3 className="text-lg text-white mb-4 flex items-center">
                  <span className="mr-2 text-yellow-400">☯</span>
                  Consultation Method
                </h3>
                <select
                  value={method || ""}
                  onChange={(e) => setMethod((e.target.value || '') as '' | 'coins' | 'yarrow' | 'random')}
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:border-yellow-400 transition-all duration-300"
                >
                  <option value="" className="bg-slate-900">Select Method</option>
                  <option value="coins" className="bg-slate-900">Three Coins</option>
                  <option value="yarrow" className="bg-slate-900">Yarrow Stalks</option>
                  <option value="random" className="bg-slate-900">Random Hexagram</option>
                </select>
              </div>

              {/* Instructions */}
              <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                <h4 className="text-yellow-300 font-semibold mb-2 flex items-center">
                  <span className="mr-2">💡</span>
                  I Ching Insights
                </h4>
                <ul className="space-y-1 text-sm text-white/90">
                  <li>• Ancient Chinese wisdom</li>
                  <li>• Yin and yang balance</li>
                  <li>• Hexagram interpretation</li>
                  <li>• Cosmic guidance</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={performIChingReading}
                  disabled={isLoading || !question.trim() || !method}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl p-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? <><span>☯</span> Consulting...</> : <><span>☯</span> Consult the I Ching</>}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetData}
                  className="w-full bg-white/5 border border-white/20 text-white rounded-xl p-4 font-semibold hover:bg-white/10 transition-all duration-300"
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
                {["overview", "hexagrams", "interpretation", "guidance", "timing", "advice"].map((tab) => (
                  <motion.button
                    key={tab}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === tab
                        ? "bg-gradient-to-r from-yellow-500 to-orange-600 text-white"
                        : "bg-white/5 text-white hover:bg-white/10"
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
                      className="text-4xl mb-4 text-yellow-400"
                    >
                      ☯
                    </motion.div>
                    <p className="text-white text-lg">Consulting the ancient Book of Changes...</p>
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
                    <p className="text-red-400 text-lg mb-2 font-semibold">Consultation Error</p>
                    <p className="text-white mb-4">{error}</p>
                    <button
                      onClick={resetData}
                      className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-all duration-300"
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
                    <div className="text-6xl mb-6 text-yellow-400">☯</div>
                    <h3 className="text-2xl gold-glow mb-4">Ready for Ancient Wisdom?</h3>
                    <p className="text-white leading-relaxed">
                      Ask your question above to receive guidance through the ancient 
                      wisdom of the I Ching and the Book of Changes.
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
          <h3 className="text-2xl gold-glow mb-6 text-center">✨ I Ching Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3 text-yellow-400">☯</div>
              <h4 className="text-white font-semibold mb-2">Yin Yang</h4>
              <p className="text-white/80 text-sm">Cosmic balance</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">📖</div>
              <h4 className="text-white font-semibold mb-2">Ancient Text</h4>
              <p className="text-white/80 text-sm">Book of Changes</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🔮</div>
              <h4 className="text-white font-semibold mb-2">Hexagrams</h4>
              <p className="text-white/80 text-sm">64 sacred symbols</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">✨</div>
              <h4 className="text-white font-semibold mb-2">Sage Wisdom</h4>
              <p className="text-white/80 text-sm">Confucian guidance</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

