"use client";
import React, { useState } from "react"
import { getAstroData, getSymbolicData, generateAIPrediction } from "@/lib/api"
import { saveAskHistory } from "@/lib/firebase"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Star, Share2, Settings, BookOpen, Sparkles } from "lucide-react"

export default function AskPage() {
  const { user, userProfile } = useAuth()
  const [question, setQuestion] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [birthPlace, setBirthPlace] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [astroData, setAstroData] = useState<any>(null)
  const [symbolicData, setSymbolicData] = useState<any>(null)
  const [prediction, setPrediction] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<number | null>(null)
  
  // Enhanced AstroScribe features
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [interpretationType, setInterpretationType] = useState("general")
  const [writingStyle, setWritingStyle] = useState("conversational")
  const [focusAreas, setFocusAreas] = useState<string[]>([])
  const [reportLength, setReportLength] = useState("standard")

  // For demo: mock user profile
  const defaultProfile = { birthDate: "1990-01-01", birthPlace: "New York, USA" }

  const focusAreaOptions = [
    "Personality & Traits",
    "Relationships & Love", 
    "Career & Success",
    "Health & Wellness",
    "Spiritual Growth",
    "Life Challenges",
    "Opportunities",
    "Timing & Cycles"
  ]

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setAstroData(null)
    setSymbolicData(null)
    setPrediction(null)
    setRevealed(false)
    setBookmarked(false)
    setConfidence(null)
    try {
      const usedBirthDate = birthDate || userProfile?.birthDate || defaultProfile.birthDate
      const usedBirthPlace = birthPlace || userProfile?.birthPlace || defaultProfile.birthPlace
      
      // Use comprehensive astro data service with userId for caching
      const astro = await getAstroData(usedBirthDate, usedBirthPlace, user?.uid)
      setAstroData(astro)
      const symbolic = getSymbolicData(question, astro)
      setSymbolicData(symbolic)
      
      // Enhanced confidence calculation based on focus areas and interpretation type
      let baseConfidence = 60
      if (focusAreas.length > 0) baseConfidence += 10
      if (interpretationType !== "general") baseConfidence += 10
      if (reportLength === "detailed" || reportLength === "comprehensive") baseConfidence += 10
      const conf = Math.min(99, baseConfidence + Math.floor(Math.random() * 20))
      setConfidence(conf)
      
      // Enhanced AI prediction with AstroScribe features
      const enhancedQuestion = `${question}\n\nInterpretation Type: ${interpretationType}\nWriting Style: ${writingStyle}\nFocus Areas: ${focusAreas.join(', ')}\nReport Length: ${reportLength}`
      const ai = await generateAIPrediction(enhancedQuestion, astro, symbolic)
      setPrediction(ai)
      
      // Save to Firebase
      if (user?.uid) {
        await saveAskHistory({
          uid: user.uid,
          question,
          aiSummary: ai,
          scientificData: astro,
          symbolicData: symbolic,
          remedies: [],
          timestamp: Date.now(),
          interpretationType,
          writingStyle,
          focusAreas,
          reportLength
        })
      }
      
      setTimeout(() => setRevealed(true), 200)
    } catch (err: any) {
      setError("Something cosmic went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function handleBookmark() {
    if (!prediction) return
    const bookmarks = JSON.parse(localStorage.getItem("futureseer_bookmarks") || "[]")
    bookmarks.push({
      question,
      prediction,
      date: new Date().toISOString(),
      interpretationType,
      writingStyle,
      focusAreas
    })
    localStorage.setItem("futureseer_bookmarks", JSON.stringify(bookmarks))
    setBookmarked(true)
    setToast("Bookmarked!")
    setTimeout(() => setToast(null), 1500)
  }

  function handleShare() {
    if (!prediction) return
    const shareText = `🔮 FutureSeer Reading: ${question}\n\n${prediction.substring(0, 200)}...\n\nGet your own reading at futureseer.app`
    if (navigator.share) {
      navigator.share({
        title: "FutureSeer Reading",
        text: shareText,
        url: "https://futureseer.app"
      })
    } else {
      navigator.clipboard.writeText(shareText)
      setToast("Copied to clipboard!")
      setTimeout(() => setToast(null), 1500)
    }
  }

  function toggleFocusArea(area: string) {
    setFocusAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/5 to-amber-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
            Ask the Seer
          </h1>
          <p className="text-xl text-slate-300 font-serif max-w-2xl mx-auto mb-6">
            Pose your question to the cosmos and receive mystical guidance from the ancient wisdom of the stars
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-amber-400 mb-6">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm">Enhanced with AI-powered interpretation</span>
          </div>
          
          {/* Inspirational Quote */}
          <div className="glass-card rounded-2xl p-6 border border-purple-500/20 max-w-2xl mx-auto">
            <p className="text-xl italic text-purple-300 font-serif mb-2">
              "When artificial intelligence meets ancient wisdom, the cosmos reveals its secrets to those who dare to ask."
            </p>
            <p className="text-slate-400 text-sm">— FutureSeer Prophecy</p>
          </div>
        </div>

        {/* Question Form */}
        <form
          onSubmit={handleAsk}
          className="w-full max-w-4xl mx-auto flex flex-col gap-4 items-center mb-10"
        >
          {/* Basic Information */}
          <div className="w-full flex flex-col md:flex-row gap-4">
            <input
              type="date"
              className="w-full md:w-1/2 px-4 py-3 rounded-xl bg-slate-900/60 border border-amber-400/30 text-lg font-serif text-amber-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 backdrop-blur-md shadow-lg input-glow"
              placeholder="Birth Date (optional)"
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
              disabled={loading}
            />
            <input
              type="text"
              className="w-full md:w-1/2 px-4 py-3 rounded-xl bg-slate-900/60 border border-amber-400/30 text-lg font-serif text-amber-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 backdrop-blur-md shadow-lg input-glow"
              placeholder="Birth Place (optional)"
              value={birthPlace}
              onChange={e => setBirthPlace(e.target.value)}
              disabled={loading}
            />
          </div>
          
          {/* Question Input */}
          <input
            type="text"
            className="w-full px-6 py-4 rounded-xl bg-slate-900/60 border border-amber-400/30 text-lg font-serif text-amber-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 backdrop-blur-md shadow-lg input-glow"
            placeholder="Type your question for the cosmos..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            required
            disabled={loading}
          />

          {/* Advanced Options Toggle */}
          <div className="w-full flex justify-center">
            <Button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="outline"
              className="border-amber-400/30 text-amber-400 hover:bg-amber-400/10 flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              {showAdvanced ? "Hide Advanced Options" : "Show Advanced Options"}
            </Button>
          </div>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="w-full glass-card rounded-2xl p-6 border border-amber-400/20">
              <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Advanced Interpretation Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Interpretation Type */}
                <div>
                  <label className="block text-soft font-semibold mb-2">Interpretation Type</label>
                  <select
                    value={interpretationType}
                    onChange={(e) => setInterpretationType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-amber-400/30 text-soft focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                  >
                    <option value="general">General Guidance</option>
                    <option value="birth-chart">Birth Chart Analysis</option>
                    <option value="relationship">Relationship Compatibility</option>
                    <option value="career">Career & Life Path</option>
                    <option value="health">Health & Wellness</option>
                    <option value="spiritual">Spiritual Development</option>
                    <option value="timing">Timing & Transits</option>
                    <option value="custom">Custom Interpretation</option>
                  </select>
                </div>

                {/* Writing Style */}
                <div>
                  <label className="block text-soft font-semibold mb-2">Writing Style</label>
                  <select
                    value={writingStyle}
                    onChange={(e) => setWritingStyle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-amber-400/30 text-soft focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                  >
                    <option value="conversational">Conversational & Friendly</option>
                    <option value="professional">Professional & Analytical</option>
                    <option value="poetic">Poetic & Inspirational</option>
                    <option value="detailed">Detailed & Comprehensive</option>
                    <option value="concise">Concise & Practical</option>
                  </select>
                </div>

                {/* Report Length */}
                <div>
                  <label className="block text-soft font-semibold mb-2">Report Length</label>
                  <select
                    value={reportLength}
                    onChange={(e) => setReportLength(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-amber-400/30 text-soft focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                  >
                    <option value="brief">Brief Summary</option>
                    <option value="standard">Standard Report</option>
                    <option value="detailed">Detailed Analysis</option>
                    <option value="comprehensive">Comprehensive Report</option>
                  </select>
                </div>

                {/* Focus Areas */}
                <div>
                  <label className="block text-soft font-semibold mb-2">Focus Areas</label>
                  <div className="grid grid-cols-2 gap-2">
                    {focusAreaOptions.map((area) => (
                      <label key={area} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={focusAreas.includes(area)}
                          onChange={() => toggleFocusArea(area)}
                          className="w-4 h-4 text-amber-600 bg-slate-800 border-amber-400/30 rounded focus:ring-amber-500 focus:ring-2"
                        />
                        <span className="text-soft text-sm">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-8 py-4 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed button-glow"
          >
            {loading ? "Consulting the stars..." : "🔮 Ask the Seer"}
          </button>
        </form>

        {/* Error Display */}
        {error && (
          <div className="w-full max-w-4xl mx-auto mb-8 p-4 bg-red-900/30 border border-red-500/30 rounded-xl text-red-200">
            {error}
          </div>
        )}

        {/* Results */}
        {prediction && (
          <div className="w-full max-w-4xl mx-auto">
            {/* Enhanced Confidence Meter */}
            {confidence && (
              <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 font-serif">Cosmic Confidence</span>
                  <span className="text-amber-400 font-bold">{confidence}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${confidence}%` }}
                  ></div>
                </div>
                {showAdvanced && (
                  <div className="mt-2 text-xs text-slate-400">
                    Enhanced by {interpretationType} analysis • {writingStyle} style • {focusAreas.length} focus areas
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Prediction */}
            <div className="glass-card rounded-3xl p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-amber-400 font-serif">Cosmic Guidance</h2>
                  {showAdvanced && (
                    <div className="text-sm text-amber-300 mt-1">
                      {interpretationType} • {writingStyle} • {reportLength}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleBookmark}
                    variant="outline"
                    size="sm"
                    className="border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
                  >
                    <Star className={`w-4 h-4 ${bookmarked ? 'fill-amber-400' : ''}`} />
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    size="sm"
                    className="border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className={`transition-all duration-1000 ${revealed ? 'opacity-100' : 'opacity-0'}`}>
                <p className="text-lg leading-relaxed text-slate-200 font-serif whitespace-pre-wrap">
                  {prediction}
                </p>
              </div>
            </div>

            {/* Astrological Context */}
            {astroData && (
              <div className="glass-card rounded-3xl p-8 mb-8">
                <h3 className="text-xl font-bold text-amber-400 mb-4 font-serif">Astrological Context</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-800/30 rounded-xl">
                    <div className="text-2xl mb-2">☀️</div>
                    <div className="text-amber-400 font-bold">{astroData.sun_sign}</div>
                    <div className="text-sm text-slate-400">Sun Sign</div>
                  </div>
                  <div className="text-center p-4 bg-slate-800/30 rounded-xl">
                    <div className="text-2xl mb-2">🌙</div>
                    <div className="text-amber-400 font-bold">{astroData.moon_sign}</div>
                    <div className="text-sm text-slate-400">Moon Sign</div>
                  </div>
                  <div className="text-center p-4 bg-slate-800/30 rounded-xl">
                    <div className="text-2xl mb-2">⭐</div>
                    <div className="text-amber-400 font-bold">{astroData.rising_sign}</div>
                    <div className="text-sm text-slate-400">Rising Sign</div>
                  </div>
                </div>
              </div>
            )}

            {/* Symbolic Data */}
            {symbolicData && (
              <div className="glass-card rounded-3xl p-8">
                <h3 className="text-xl font-bold text-amber-400 mb-4 font-serif">Symbolic Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-amber-300 font-bold mb-2">Primary Symbol</h4>
                    <p className="text-slate-300">{symbolicData.primarySymbol}</p>
                  </div>
                  <div>
                    <h4 className="text-amber-300 font-bold mb-2">Elemental Influence</h4>
                    <p className="text-slate-300">{symbolicData.elementalInfluence}</p>
                  </div>
                  <div>
                    <h4 className="text-amber-300 font-bold mb-2">Cosmic Alignment</h4>
                    <p className="text-slate-300">{symbolicData.cosmicAlignment}</p>
                  </div>
                  <div>
                    <h4 className="text-amber-300 font-bold mb-2">Timing</h4>
                    <p className="text-slate-300">{symbolicData.timing}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-amber-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
} 