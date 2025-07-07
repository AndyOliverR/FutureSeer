"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { PredictionTabs } from "@/components/prediction-tabs"
import { RemedyCards } from "@/components/remedy-cards"
import { TipJar } from "@/components/tip-jar"
import { getAstroData, generateAIPrediction, getSymbolicData, getRemedies, trackEvent } from "@/lib/api"
import { saveAskHistory } from "@/lib/firebase"
import { useRouter } from "next/navigation"

export default function AskPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [question, setQuestion] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [predictionData, setPredictionData] = useState<any>(null)
  const [remedies, setRemedies] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  // Check trial/subscription status
  useEffect(() => {
    if (userProfile && !userProfile.isSubscribed && userProfile.trialEndTime && Date.now() > userProfile.trialEndTime) {
      router.push("/subscribe")
    }
  }, [userProfile, router])

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      setError("Please enter a question to seek guidance from the universe.")
      return
    }

    setLoading(true)
    setError(null)
    trackEvent("ask_question", { question: question.substring(0, 50) })

    try {
      // Get astrological data (using mock data for now)
      const astroData = await getAstroData("1990-01-01", "Mumbai, India")

      // Get symbolic data
      const symbolicData = getSymbolicData(question, astroData)

      // Generate AI prediction
      const aiSummary = await generateAIPrediction(question, astroData, symbolicData)

      // Get remedies
      const remedyList = getRemedies(symbolicData, question)

      const prediction = {
        question,
        aiSummary,
        scientificData: astroData,
        symbolicData,
        remedies: remedyList,
        timestamp: Date.now(),
      }

      setPredictionData(prediction)
      setRemedies(remedyList)
      setShowResults(true)

      // Save to history if user is logged in
      if (user?.uid) {
        try {
          await saveAskHistory({
            uid: user.uid,
            question,
            aiSummary,
            scientificData: astroData,
            symbolicData,
            remedies: remedyList,
            timestamp: Date.now(),
          })
        } catch (historyError) {
          console.error("Error saving to history:", historyError)
          // Don't show error to user, just log it
        }
      }
    } catch (error) {
      console.error("Error generating prediction:", error)
      setError("The cosmic energies are temporarily disrupted. Please try again in a moment.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <Link href="/" className="text-soft hover:gold-glow-24k mb-4 inline-block font-light">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-extra-thin gold-text-24k mb-4 tracking-wide">Ask the Seer</h1>
          <p className="text-soft leading-relaxed font-light">Seek wisdom from our AI-powered cosmic realm</p>
        </div>

        {/* Question Input */}
        <div className="glass-card rounded-3xl p-8 mb-12">
          <textarea
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value)
              setError(null)
            }}
            placeholder="What guidance do you seek from the universe?"
            className="w-full h-32 bg-transparent border border-white/20 rounded-2xl p-6 text-soft placeholder-white/50 resize-none focus:outline-none focus:border-gold-24k font-light"
          />

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <p className="text-red-400 text-sm font-light">{error}</p>
            </div>
          )}

          <div className="text-center mt-6">
            <button
              onClick={handleAskQuestion}
              disabled={loading || !question.trim()}
              className="px-8 py-3 gold-button-24k text-black rounded-2xl font-light hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? "🔮 Consulting the Stars..." : "Reveal"}
            </button>
          </div>
        </div>

        {/* Results */}
        {showResults && predictionData && (
          <>
            {/* Prediction Tabs */}
            <PredictionTabs
              aiSummary={predictionData.aiSummary}
              scientificData={predictionData.scientificData}
              symbolicData={predictionData.symbolicData}
            />

            {/* Remedies */}
            <RemedyCards remedies={remedies} />

            {/* Tip Jar */}
            <TipJar />
          </>
        )}
      </div>
    </div>
  )
}
