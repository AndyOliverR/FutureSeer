"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { generateAIPrediction, getAstroData, getSymbolicData } from "@/lib/api"

export default function DailyPage() {
  const { user, userProfile } = useAuth()
  const [dailyData, setDailyData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const generateDailyGuidance = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // Get user's astrological data (using default for now)
        const astroData = await getAstroData('1990-01-01', 'Mumbai, India')
        
        // Generate daily themes
        const themes = [
          { 
            icon: "❤️", 
            title: "Health", 
            question: "What should I focus on for my health today?",
            color: "from-red-500/20 to-pink-500/20"
          },
          { 
            icon: "💰", 
            title: "Wealth", 
            question: "What financial opportunities await me today?",
            color: "from-green-500/20 to-emerald-500/20"
          },
          { 
            icon: "💖", 
            title: "Love", 
            question: "How can I improve my relationships today?",
            color: "from-pink-500/20 to-rose-500/20"
          },
          { 
            icon: "⚡", 
            title: "Energy", 
            question: "What should I focus on for my personal growth today?",
            color: "from-blue-500/20 to-indigo-500/20"
          },
        ]

        // Generate AI predictions for each theme
        const themePredictions = await Promise.all(
          themes.map(async (theme) => {
            const symbolicData = getSymbolicData(theme.question, astroData)
            const prediction = await generateAIPrediction(theme.question, astroData, symbolicData)
            return {
              ...theme,
              forecast: prediction,
              energy: ['High', 'Moderate', 'Strong', 'Excellent'][Math.floor(Math.random() * 4)]
            }
          })
        )

        // Generate symbol of the day
        const symbolQuestion = "What is the most important symbol for me to focus on today?"
        const symbolSymbolicData = getSymbolicData(symbolQuestion, astroData)
        const symbolPrediction = await generateAIPrediction(symbolQuestion, astroData, symbolSymbolicData)

        // Generate daily remedy
        const remedyQuestion = "What spiritual practice or remedy would be most beneficial for me today?"
        const remedySymbolicData = getSymbolicData(remedyQuestion, astroData)
        const remedyPrediction = await generateAIPrediction(remedyQuestion, astroData, remedySymbolicData)

        setDailyData({
          themes: themePredictions,
          symbol: {
            icon: "🔮",
            title: "Symbol of Divine Clarity",
            description: symbolPrediction,
            element: ['Fire', 'Earth', 'Air', 'Water'][Math.floor(Math.random() * 4)],
            planet: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'][Math.floor(Math.random() * 7)],
            energy: ['Receptive', 'Active', 'Balanced', 'Dynamic'][Math.floor(Math.random() * 4)]
          },
          remedy: {
            icon: "🕯️",
            title: "Today's Sacred Remedy",
            description: remedyPrediction,
            duration: "10 minutes",
            bestTime: "Sunset",
            frequency: "Daily"
          }
        })
      } catch (error) {
        console.error('Error generating daily guidance:', error)
        // Fallback data
        setDailyData({
          themes: [
            { icon: "❤️", title: "Health", forecast: "Positive energy flow", energy: "High", color: "from-red-500/20 to-pink-500/20" },
            { icon: "💰", title: "Wealth", forecast: "Opportunities ahead", energy: "Moderate", color: "from-green-500/20 to-emerald-500/20" },
            { icon: "💖", title: "Love", forecast: "Harmony in relationships", energy: "Strong", color: "from-pink-500/20 to-rose-500/20" },
            { icon: "⚡", title: "Energy", forecast: "Mental clarity enhanced", energy: "Excellent", color: "from-blue-500/20 to-indigo-500/20" },
          ],
          symbol: {
            icon: "🔮",
            title: "Symbol of Divine Clarity",
            description: "The crystal sphere signifies heightened intuition and clear vision. Trust your inner wisdom as the universe reveals hidden truths.",
            element: "Water",
            planet: "Moon",
            energy: "Receptive"
          },
          remedy: {
            icon: "🕯️",
            title: "Today's Sacred Remedy",
            description: "Light a white candle at sunset near a window. Gaze into the flame for 5-10 minutes while breathing deeply. Visualize your intentions manifesting.",
            duration: "10 minutes",
            bestTime: "Sunset",
            frequency: "Daily"
          }
        })
      } finally {
        setLoading(false)
      }
    }

    generateDailyGuidance()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔮</div>
          <p className="text-soft">Consulting the cosmic realm...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
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
        {dailyData?.symbol && (
          <div className="glass-card rounded-3xl p-12 mb-12 text-center">
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
          </div>
        )}

        {/* Daily Themes */}
        {dailyData?.themes && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {dailyData.themes.map((theme: any, i: number) => (
              <div key={i} className="glass-card rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{theme.icon}</div>
                    <h3 className="text-soft font-medium">{theme.title}</h3>
                  </div>
                  <span className="text-xs gold-glow bg-yellow-400/20 px-2 py-1 rounded-full">{theme.energy}</span>
                </div>
                <p className="text-soft/70 text-sm leading-relaxed">{theme.forecast}</p>
              </div>
            ))}
          </div>
        )}

        {/* Today's Remedy */}
        {dailyData?.remedy && (
          <div className="glass-card rounded-3xl p-8">
            <h3 className="text-xl gold-glow mb-6 text-center">{dailyData.remedy.title}</h3>
            <div className="text-center">
              <div className="text-4xl mb-4">{dailyData.remedy.icon}</div>
              <p className="text-soft/70 text-sm leading-relaxed mb-6 max-w-md mx-auto">
                {dailyData.remedy.description}
              </p>
              <div className="flex justify-center space-x-6 text-xs">
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
          </div>
        )}
      </div>
    </div>
  )
}
