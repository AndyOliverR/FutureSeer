"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { getAskHistory, AskHistory } from "@/lib/firebase"

export default function HistoryPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [history, setHistory] = useState<AskHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.uid) {
      loadHistory()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadHistory = async () => {
    if (!user?.uid) return
    
    try {
      const userHistory = await getAskHistory(user.uid)
      setHistory(userHistory)
    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredHistory = history.filter(
    (item) =>
      (filterType === "all" || item.question.toLowerCase().includes(filterType.toLowerCase())) &&
      item.question.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  const getQuestionType = (question: string) => {
    const lowerQuestion = question.toLowerCase()
    if (lowerQuestion.includes('love') || lowerQuestion.includes('relationship')) return 'Love'
    if (lowerQuestion.includes('money') || lowerQuestion.includes('career') || lowerQuestion.includes('job')) return 'Career'
    if (lowerQuestion.includes('health') || lowerQuestion.includes('body')) return 'Health'
    if (lowerQuestion.includes('travel') || lowerQuestion.includes('journey')) return 'Travel'
    return 'General'
  }

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📜</div>
          <p className="text-soft">Loading your cosmic history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <Link href="/dashboard" className="text-soft hover:gold-glow mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-semibold gold-glow mb-4">Prediction History</h1>
          <p className="text-soft leading-relaxed">Review your past cosmic consultations</p>
        </div>

        {/* Search and Filter */}
        <div className="glass-card rounded-3xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search your questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border border-white/20 rounded-2xl p-4 text-soft placeholder-white/50 focus:outline-none focus:border-yellow-400"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent border border-white/20 rounded-2xl p-4 text-soft focus:outline-none focus:border-yellow-400"
            >
              <option value="all" className="bg-gray-800">
                All Questions
              </option>
              <option value="love" className="bg-gray-800">
                Love & Relationships
              </option>
              <option value="career" className="bg-gray-800">
                Career & Money
              </option>
              <option value="health" className="bg-gray-800">
                Health & Wellness
              </option>
              <option value="travel" className="bg-gray-800">
                Travel & Journey
              </option>
            </select>
          </div>
        </div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-soft/70">
              {history.length === 0 
                ? "No predictions yet. Start by asking the Seer a question!"
                : "No predictions found matching your search"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => {
              const questionType = getQuestionType(item.question)
              return (
                <div
                  key={item.id}
                  className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-soft font-medium mb-2">{item.question}</h3>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-soft/70">{formatDate(item.timestamp)}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            questionType === "Love"
                              ? "bg-pink-500/20 text-pink-300"
                              : questionType === "Career"
                                ? "bg-green-500/20 text-green-300"
                                : questionType === "Health"
                                  ? "bg-red-500/20 text-red-300"
                                  : questionType === "Travel"
                                    ? "bg-blue-500/20 text-blue-300"
                                    : "bg-purple-500/20 text-purple-300"
                          }`}
                        >
                          {questionType}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="gold-glow text-sm font-medium">
                        {item.remedies?.length || 0} remedies
                      </div>
                      <div className="text-soft/50 text-xs">prescribed</div>
                    </div>
                  </div>
                  <div className="text-yellow-400 text-sm">View Details →</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
