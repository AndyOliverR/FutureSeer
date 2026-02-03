"use client"

import Link from "next/link"
import { useDailyGuidance } from "@/hooks/useDailyGuidance"
import { CosmicLoader } from "@/components/cosmic-loader"
import { motion, AnimatePresence } from "framer-motion"
import { Header } from "@/components/header"

export default function DailyPage() {
  const { loading, error, dailyData } = useDailyGuidance()

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <CosmicLoader />
        <div className="text-center mt-8">
          <div className="text-4xl mb-4">🔮</div>
          <p className="text-soft">Consulting the cosmic realm...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 starfield-ultra-sharp">
      <Header />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <Link href="/" className="text-soft hover:gold-glow mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-semibold gold-glow mb-4">Daily Cosmic Guidance</h1>
          <p className="text-soft leading-relaxed">AI-generated celestial wisdom • {new Date().toLocaleDateString()}</p>
        </div>

        {/* Symbol of the Day */}
        <AnimatePresence>
          {dailyData?.symbol && (
            <motion.div
              key="symbol"
              className="glass-card rounded-3xl p-12 mb-12 text-center"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="text-8xl mb-6">{dailyData.symbol.icon}</div>
              <h2 className="text-2xl gold-glow mb-4">{dailyData.symbol.title}</h2>
          <p className="text-soft leading-relaxed max-w-2xl mx-auto mb-6">
                {dailyData.symbol.description}
          </p>
          <div className="flex justify-center space-x-8 text-sm">
            <div className="text-center">
              <div className="text-soft/70">Element</div>
                  <div className="gold-glow">{dailyData.symbol.element}</div>
            </div>
            <div className="text-center">
              <div className="text-soft/70">Planet</div>
                  <div className="gold-glow">{dailyData.symbol.planet}</div>
            </div>
            <div className="text-center">
              <div className="text-soft/70">Energy</div>
                  <div className="gold-glow">{dailyData.symbol.energy}</div>
            </div>
          </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Daily Themes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <AnimatePresence>
            {dailyData?.themes && dailyData.themes.map((theme: any, i: number) => (
              <motion.div
                key={i}
                className="glass-card rounded-2xl p-6"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
              >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{theme.icon}</div>
                  <h3 className="text-soft font-medium">{theme.title}</h3>
                </div>
                <span className="text-xs gold-glow bg-yellow-400/20 px-2 py-1 rounded-full">{theme.energy}</span>
              </div>
              <p className="text-soft/70 text-sm leading-relaxed">{theme.forecast}</p>
              </motion.div>
          ))}
          </AnimatePresence>
        </div>

        {/* Today's Remedy */}
        <AnimatePresence>
          {dailyData?.remedy && (
            <motion.div
              key="remedy"
              className="glass-card rounded-3xl p-8"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <h3 className="text-xl gold-glow mb-6 text-center">{dailyData.remedy.title}</h3>
          <div className="text-center">
                <div className="text-4xl mb-4">{dailyData.remedy.icon}</div>
                <p className="text-soft leading-relaxed mb-4">{dailyData.remedy.description}</p>
                <div className="flex justify-center space-x-8 text-sm">
              <div className="text-center">
                <div className="text-soft/70">Duration</div>
                    <div className="gold-glow">{dailyData.remedy.duration}</div>
              </div>
              <div className="text-center">
                <div className="text-soft/70">Best Time</div>
                    <div className="gold-glow">{dailyData.remedy.bestTime}</div>
              </div>
              <div className="text-center">
                <div className="text-soft/70">Frequency</div>
                    <div className="gold-glow">{dailyData.remedy.frequency}</div>
              </div>
            </div>
          </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {error && <div className="text-red-400 text-center mt-8">{error}</div>}
      </div>
    </div>
  )
}
