"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NameAnalysisCoachInterface } from "@/components/NameAnalysisCoachInterface"
import { NameAnalysisSeerChatInterface } from "@/components/NameAnalysisSeerChatInterface"
import { useNameAnalysis } from "@/hooks/use-name-analysis"

const NAME_TABS = [
  { id: "overview", label: "Overview" },
  { id: "personality", label: "Personality" },
  { id: "vibrations", label: "Elements & Vibrations" },
  { id: "purpose", label: "Career & Purpose" },
  { id: "compatibility", label: "Relationships" },
  { id: "advice", label: "Recommendations" },
  { id: "ask-the-seer", label: "Ask the Seer" },
] as const

export default function NameAnalysisPage() {
  const { userProfile } = useAuth()
  const {
    name,
    birthDate,
    analysis,
    isLoading,
    error,
    numerologyData,
    vedicData,
    westernData
  } = useNameAnalysis()

  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="relative min-h-screen starfield-ultra-sharp">
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        {/* Top spacing for nav bar */}
        <div className="pt-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl font-serif font-semibold mb-6">
              <span className="text-yellow-400">📝</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Name Analysis</span>
            </h1>
            <p className="text-slate-200 leading-relaxed text-xl font-light mb-8">Personality analysis through name</p>
            {/* Inspirational Quote */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-6 max-w-2xl mx-auto mb-8 shadow-md">
              <p className="text-xl italic text-amber-900 font-serif mb-2">
                "Your name is not just a label, but a sacred vibration that shapes your destiny and reveals your soul's purpose."
              </p>
              <p className="text-slate-600 text-sm">— Ancient Name Wisdom</p>
            </div>
          </motion.div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto pb-8">
          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 overflow-hidden">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
                <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-800/50 border-b border-amber-500/20 rounded-none h-auto min-h-0 justify-start [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/30">
                  {NAME_TABS.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="shrink-0 rounded-t-lg rounded-b-none px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 data-[state=inactive]:hover:bg-slate-800/30 border border-transparent data-[state=inactive]:border-slate-600/50 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-b-amber-400/80 transition-all"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Content */}
                <div className="space-y-6 pt-6 px-4 sm:px-6 pb-6 mt-0">
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
                      📝
                    </motion.div>
                    <p className="text-slate-300 text-lg">Analyzing the vibrational power of your name...</p>
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
                    <p className="text-slate-300">{error}</p>
                  </motion.div>
                ) : analysis ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {activeTab === "ask-the-seer" ? (
                      <NameAnalysisSeerChatInterface
                        analysis={analysis}
                        variant="light"
                        userProfile={userProfile}
                      />
                    ) : (
                      <NameAnalysisCoachInterface 
                        analysis={analysis}
                        activeTab={activeTab}
                        name={name}
                        birthDate={birthDate}
                        numerologyData={numerologyData}
                        vedicData={vedicData}
                        westernData={westernData}
                      />
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
                    <p className="text-slate-300 text-lg">Generating your name analysis...</p>
                  </motion.div>
                )}
              </AnimatePresence>
                </div>
              </Tabs>
            </div>
          </motion.div>
        </div>
        </div>
      </div>
    </div>
  )
} 