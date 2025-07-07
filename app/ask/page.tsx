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

  // Check trial/subscription status
  useEffect(() => {
    if (userProfile && !userProfile.isSubscribed && userProfile.trialEndTime && Date.now() > userProfile.trialEndTime) {
      router.push('/subscribe')
    }
  }, [userProfile, router])

  const handleAskQuestion = async () => {
    if (!question.trim() || !user || !user.uid) return

    setLoading(true)
    trackEvent('ask_question', { question: question.substring(0, 50) })

    try {
      // Get astrological data (using mock data for now)
      const astroData = await getAstroData('1990-01-01', 'Mumbai, India')
      
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

      // Save to history
      await saveAskHistory({
        uid: user.uid,
        question,
        aiSummary,
        scientificData: astroData,
        symbolicData,
        remedies: remedyList,
        timestamp: Date.now(),
      })

    } catch (error) {
      console.error('Error generating prediction:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <Link href="/" className="text-soft hover:gold-glow mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-semibold gold-glow mb-4">Ask the Seer</h1>
          <p className="text-soft leading-relaxed">Seek wisdom from our AI-powered cosmic realm</p>
        </div>

        {/* Question Input */}
        <div className="glass-card rounded-3xl p-8 mb-12">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What guidance do you seek from the universe?"
            className="w-full h-32 bg-transparent border border-white/20 rounded-2xl p-6 text-soft placeholder-white/50 resize-none focus:outline-none focus:border-yellow-400"
          />
          <div className="text-center mt-6">
            <button
              onClick={handleAskQuestion}
              disabled={loading || !question.trim()}
              className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-2xl font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
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
