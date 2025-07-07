"use client"

import { useState } from "react"

interface PredictionTabsProps {
  aiSummary: string
  scientificData: any
  symbolicData: any
}

export function PredictionTabs({ aiSummary, scientificData, symbolicData }: PredictionTabsProps) {
  const [activeTab, setActiveTab] = useState("ai")

  const tabs = [
    { id: "ai", label: "🧠 AI Summary" },
    { id: "scientific", label: "📊 Scientific" },
    { id: "symbolic", label: "🧿 Symbolic" },
  ]

  return (
    <div className="mb-12">
      {/* Tab Navigation */}
      <div className="flex space-x-2 bg-purple-900/20 p-2 rounded-2xl backdrop-blur-sm mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-light transition-all leading-relaxed ${
              activeTab === tab.id ? "bg-gold text-purple-950" : "text-gray-200 hover:bg-purple-800/30"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-purple-900/20 rounded-2xl p-8 backdrop-blur-sm border border-purple-800/30">
        {activeTab === "ai" && (
          <div className="space-y-6">
            <h3 className="text-xl text-gold font-light">AI-Generated Cosmic Summary</h3>
            <p className="text-gray-200 leading-relaxed">
              Our AI has analyzed your question across all 18 divination systems. The universe whispers of
              transformation ahead. Your inquiry reveals a soul seeking clarity in times of change. The cosmic energies
              suggest patience and trust in the divine timing of your journey.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["Past Influences", "Present Energy", "Future Potential"].map((phase, i) => (
                <div key={i} className="bg-purple-800/20 p-4 rounded-xl text-center">
                  <div className="text-2xl mb-2">{["🌑", "🌓", "🌕"][i]}</div>
                  <div className="text-purple-300 text-sm font-light leading-relaxed">{phase}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "scientific" && (
          <div className="space-y-6">
            <h3 className="text-xl text-gold font-light">Tool-by-Tool AI Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { tool: "Vedic Astrology", confidence: "87%", insight: "Strong planetary alignment detected" },
                { tool: "Tarot Reading", confidence: "92%", insight: "Major Arcana influence present" },
                { tool: "Numerology", confidence: "78%", insight: "Life path resonance confirmed" },
                { tool: "I Ching", confidence: "85%", insight: "Hexagram 14 - Great Possession" },
              ].map((result, i) => (
                <div key={i} className="bg-purple-800/20 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-200 text-sm font-medium">{result.tool}</span>
                    <span className="text-gold text-sm">{result.confidence}</span>
                  </div>
                  <p className="text-purple-300 text-xs leading-relaxed">{result.insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "symbolic" && (
          <div className="space-y-6">
            <h3 className="text-xl text-gold font-light">AI-Detected Sacred Symbols & Archetypes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-4">🌟</div>
                <h4 className="text-gray-200 font-medium mb-2">The Star</h4>
                <p className="text-purple-300 text-sm leading-relaxed">
                  Hope, inspiration, and spiritual guidance illuminate your path
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🔑</div>
                <h4 className="text-gray-200 font-medium mb-2">The Key</h4>
                <p className="text-purple-300 text-sm leading-relaxed">
                  Hidden knowledge and solutions await your discovery
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🌊</div>
                <h4 className="text-gray-200 font-medium mb-2">The Flow</h4>
                <p className="text-purple-300 text-sm leading-relaxed">
                  Emotional currents guide you toward your destiny
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
