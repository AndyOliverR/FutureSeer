"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { generateAIPrediction, getAstroData, getSymbolicData } from "@/lib/api"

export default function ToolPage({ params }: { params: { slug: string } }) {
  const { user, userProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    question: "",
  })

  const toolName = params.slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

  const toolDescriptions: { [key: string]: string } = {
    "vedic-astrology": "Vedic Astrology, also known as Jyotish, is an ancient Indian system that uses the position of celestial bodies to understand human destiny. It provides insights into personality, relationships, career, and life events.",
    "kp-astrology": "Krishnamurti Paddhati (KP) is a modern astrological system that uses sub-lords and cusps to provide precise timing predictions. It's particularly effective for answering specific questions with exact timing.",
    "western-astrology": "Western Astrology is based on the tropical zodiac and focuses on personality traits, life patterns, and psychological insights. It uses the 12 zodiac signs and planetary positions.",
    "horary": "Horary Astrology answers specific questions by casting a chart for the moment the question is asked. It provides yes/no answers and timing for events.",
    "bazi": "Bazi (Four Pillars of Destiny) is a Chinese astrological system that uses year, month, day, and hour pillars to reveal personality and life path.",
    "chaldean-numerology": "Chaldean Numerology is an ancient Babylonian system that assigns numerical values to letters to reveal personality traits and life patterns.",
    "kabbalistic-numerology": "Kabbalistic Numerology uses Hebrew letters and their numerical values to provide spiritual insights and divine guidance.",
    "angel-numbers": "Angel Numbers are sequences that appear repeatedly to convey divine messages and guidance from spiritual realms.",
    "tarot": "Tarot uses 78 cards with rich symbolism to provide guidance on love, career, spirituality, and life decisions.",
    "lenormand": "Lenormand is a 36-card system that provides practical, straightforward answers about daily life and relationships.",
    "runes": "Runes are ancient Norse symbols that offer wisdom, protection, and guidance for life's challenges and decisions.",
    "i-ching": "I Ching (Book of Changes) is an ancient Chinese divination system that provides wisdom through 64 hexagrams.",
    "pendulum": "Pendulum dowsing uses energy detection to answer yes/no questions and find lost objects or information.",
    "palmistry": "Palmistry reads the lines and features of the hand to reveal personality traits and life events.",
    "face-reading": "Face Reading (Physiognomy) interprets facial features to understand personality and predict life patterns.",
    "name-analysis": "Name Analysis uses numerological principles to reveal the hidden meanings and influences of names.",
    "dream-symbols": "Dream Symbol interpretation decodes the messages and guidance hidden in your dreams.",
    "vastu": "Vastu Shastra is an ancient Indian system that harmonizes living spaces with natural energies for prosperity and well-being.",
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.birthDate || !formData.birthPlace) return

    setLoading(true)
    try {
      // Get astrological data
      const astroData = await getAstroData(formData.birthDate, formData.birthPlace)
      
      // Create a specific question for this tool
      const toolQuestion = formData.question || `What insights does ${toolName} reveal about my life path?`
      
      // Get symbolic data
      const symbolicData = getSymbolicData(toolQuestion, astroData)
      
      // Generate AI prediction specific to this tool
      const aiPrediction = await generateAIPrediction(toolQuestion, astroData, symbolicData)
      
      setResult({
        toolName,
        question: toolQuestion,
        astroData,
        symbolicData,
        aiPrediction,
        timestamp: Date.now(),
      })
      setShowResults(true)
    } catch (error) {
      console.error('Error generating reading:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <Link href="/tools" className="text-soft hover:gold-glow mb-4 inline-block">
            ← Back to Tools
          </Link>
          <h1 className="text-4xl font-semibold gold-glow mb-4">{toolName}</h1>
          <p className="text-soft leading-relaxed">Ancient wisdom meets AI precision</p>
        </div>

        {/* Background Symbol */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <div className="symbolic-placeholder w-96 h-96 rounded-full">{toolName} Symbol</div>
        </div>

        {/* Description */}
        <div className="glass-card rounded-3xl p-8 mb-12 relative z-10">
          <h2 className="text-xl gold-glow mb-4">About {toolName}</h2>
          <p className="text-soft leading-relaxed">
            {toolDescriptions[params.slug] || "This ancient divination system provides deep insights into your spiritual path. Our AI analyzes traditional patterns and meanings to deliver personalized guidance tailored to your unique situation."}
          </p>
        </div>

        {/* Input Form */}
        <div className="glass-card rounded-3xl p-8 mb-12 relative z-10">
          <h3 className="text-lg gold-glow mb-6">Enter Your Details</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-soft text-sm mb-2">Birth Date *</label>
              <input
                type="date"
                required
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full bg-transparent border border-white/20 rounded-2xl p-4 text-soft focus:outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-soft text-sm mb-2">Birth Time</label>
              <input
                type="time"
                value={formData.birthTime}
                onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                className="w-full bg-transparent border border-white/20 rounded-2xl p-4 text-soft focus:outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-soft text-sm mb-2">Birth Place *</label>
              <input
                type="text"
                required
                value={formData.birthPlace}
                onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                placeholder="City, Country"
                className="w-full bg-transparent border border-white/20 rounded-2xl p-4 text-soft placeholder-white/50 focus:outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-soft text-sm mb-2">Specific Question (Optional)</label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder={`What would you like to know about your ${toolName.toLowerCase()}?`}
                className="w-full h-24 bg-transparent border border-white/20 rounded-2xl p-4 text-soft placeholder-white/50 resize-none focus:outline-none focus:border-yellow-400"
              />
          </div>
            <div className="text-center">
              <button
                type="submit"
                disabled={loading || !formData.birthDate || !formData.birthPlace}
                className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-2xl font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "🔮 Consulting the Stars..." : `Generate ${toolName} Reading`}
            </button>
          </div>
          </form>
        </div>

        {/* Results */}
        {showResults && result && (
          <div className="glass-card rounded-3xl p-8">
          <h3 className="text-lg gold-glow mb-6">Your {toolName} Reading</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-soft font-medium mb-2">Question</h4>
                <p className="text-soft/70">{result.question}</p>
              </div>
              <div>
                <h4 className="text-soft font-medium mb-2">AI Interpretation</h4>
                <p className="text-soft/70 leading-relaxed">{result.aiPrediction}</p>
              </div>
              <div>
                <h4 className="text-soft font-medium mb-2">Astrological Context</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 glass-card rounded-xl">
                    <div className="text-soft/70">Sun Sign</div>
                    <div className="gold-glow">{result.astroData.sun_sign}</div>
                  </div>
                  <div className="text-center p-3 glass-card rounded-xl">
                    <div className="text-soft/70">Moon Sign</div>
                    <div className="gold-glow">{result.astroData.moon_sign}</div>
                  </div>
                  <div className="text-center p-3 glass-card rounded-xl">
                    <div className="text-soft/70">Rising Sign</div>
                    <div className="gold-glow">{result.astroData.rising_sign}</div>
                  </div>
                </div>
              </div>
            </div>
        </div>
        )}
      </div>
    </div>
  )
}
