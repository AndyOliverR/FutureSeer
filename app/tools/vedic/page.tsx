"use client"

import { useState } from "react"
import { VedicChart } from "@/components/vedic-chart"

export default function VedicPage() {
  const [birthDate, setBirthDate] = useState("")
  const [birthTime, setBirthTime] = useState("")
  const [birthPlace, setBirthPlace] = useState("")
  const [showResults, setShowResults] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 to-indigo-950 relative">
      {/* Background Symbol */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <VedicChart />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl font-thin text-gold mb-4">🕉️ Vedic Astrology</h1>
          <p className="text-gray-200 font-light leading-relaxed">Ancient wisdom analyzed by AI for modern insights</p>
        </div>

        {/* Input Form */}
        <div className="bg-purple-900/20 rounded-2xl p-8 mb-12 backdrop-blur-sm border border-purple-800/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-purple-300 text-sm font-light mb-2">Birth Date</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-purple-800/30 border border-purple-700 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-purple-300 text-sm font-light mb-2">Birth Time</label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full bg-purple-800/30 border border-purple-700 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-purple-300 text-sm font-light mb-2">Birth Place</label>
              <input
                type="text"
                placeholder="City, Country"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                className="w-full bg-purple-800/30 border border-purple-700 rounded-xl p-3 text-gray-100 placeholder-purple-400 focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => setShowResults(true)}
              className="bg-gradient-to-r from-gold to-yellow-400 text-purple-950 px-8 py-3 rounded-full font-medium hover:scale-105 transition-transform"
            >
              🔮 Generate AI Analysis
            </button>
          </div>
        </div>

        {/* Results */}
        {showResults && (
          <div className="space-y-8">
            <div className="bg-purple-900/20 rounded-2xl p-8 backdrop-blur-sm border border-purple-800/30">
              <h3 className="text-xl text-gold font-light mb-6 text-center">Your AI-Generated Cosmic Blueprint</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-gray-200 font-medium mb-4">🌟 Planetary Positions</h4>
                  <div className="space-y-3">
                    {[
                      { planet: "Sun ☉", sign: "Leo", degree: "15°23'", house: "5th" },
                      { planet: "Moon ☽", sign: "Cancer", degree: "8°45'", house: "4th" },
                      { planet: "Mars ♂", sign: "Aries", degree: "22°17'", house: "1st" },
                      { planet: "Mercury ☿", sign: "Virgo", degree: "3°52'", house: "6th" },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center bg-purple-800/20 p-3 rounded-lg">
                        <span className="text-gray-200 text-sm">{item.planet}</span>
                        <span className="text-purple-300 text-sm">{item.sign}</span>
                        <span className="text-gold text-xs">{item.degree}</span>
                        <span className="text-purple-400 text-xs">{item.house}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-gray-200 font-medium mb-4">🏠 House Analysis</h4>
                  <div className="space-y-3">
                    {[
                      { house: "1st House", theme: "Self & Identity", strength: "Strong", planet: "Mars" },
                      { house: "4th House", theme: "Home & Family", strength: "Excellent", planet: "Moon" },
                      { house: "5th House", theme: "Creativity", strength: "Good", planet: "Sun" },
                      { house: "6th House", theme: "Service", strength: "Moderate", planet: "Mercury" },
                    ].map((item, i) => (
                      <div key={i} className="bg-purple-800/20 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-200 text-sm">{item.house}</span>
                          <span className="text-gold text-xs">{item.strength}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-purple-300 text-xs leading-relaxed">{item.theme}</span>
                          <span className="text-purple-400 text-xs">{item.planet}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* AI-Generated Remedies */}
            <div className="bg-purple-900/20 rounded-2xl p-8 backdrop-blur-sm border border-purple-800/30">
              <h4 className="text-gray-200 font-medium mb-6 text-center">🌟 AI-Prescribed Vedic Remedies</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { remedy: "Wear Ruby on Sunday", planet: "Sun", benefit: "Boost confidence & leadership" },
                  { remedy: "Chant Gayatri Mantra", planet: "Sun", benefit: "Enhance spiritual power" },
                  { remedy: "Donate red lentils", planet: "Mars", benefit: "Reduce aggression" },
                  { remedy: "Fast on Tuesdays", planet: "Mars", benefit: "Strengthen willpower" },
                ].map((item, i) => (
                  <div key={i} className="bg-purple-800/20 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-200 text-sm font-medium">{item.remedy}</span>
                      <span className="text-gold text-xs">{item.planet}</span>
                    </div>
                    <p className="text-purple-400 text-xs leading-relaxed">{item.benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
