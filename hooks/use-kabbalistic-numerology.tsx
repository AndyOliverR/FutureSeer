"use client"

import { useState, useEffect } from 'react'
import { useAuth } from './use-auth'
import { kabbalisticNumerologyIntelligence, KabbalisticData, KabbalisticAnalysis, KabbalisticQuestion, KabbalisticAnswer } from '@/lib/kabbalisticNumerologyIntelligence'

export function useKabbalisticNumerology() {
  const { user, userProfile } = useAuth()
  const [data, setData] = useState<KabbalisticAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [analysisHistory, setAnalysisHistory] = useState<KabbalisticAnalysis[]>([])

  // Auto-fetch on sign-in if user has name and birth data
  useEffect(() => {
    if (user && userProfile?.displayName && userProfile?.birthDate && !data) {
      analyze({
        fullName: userProfile.displayName,
        birthDate: userProfile.birthDate,
        birthTime: userProfile.birthTime,
        birthPlace: userProfile.birthPlace
      })
    }
  }, [user, userProfile, data])

  const analyze = async (kabbalisticData: KabbalisticData) => {
    if (!user) {
      setError('Authentication required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const analysis = await kabbalisticNumerologyIntelligence.analyzeKabbalistic(kabbalisticData)
      setData(analysis)
      setLastUpdated(new Date())

      // Save analysis to history
      await kabbalisticNumerologyIntelligence.saveAnalysis(user.uid, analysis)
      
      // Update analysis history
      setAnalysisHistory(prev => [analysis, ...prev.slice(0, 9)]) // Keep last 10 analyses
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze Kabbalistic Numerology')
    } finally {
      setLoading(false)
    }
  }

  const answerQuestion = async (question: string, category: KabbalisticQuestion['category'] = 'general', urgency: KabbalisticQuestion['urgency'] = 'medium'): Promise<KabbalisticAnswer | null> => {
    if (!data) {
      setError('Please analyze your Kabbalistic Numerology first')
      return null
    }

    const kabbalisticQuestion: KabbalisticQuestion = {
      question,
      category,
      urgency
    }

    try {
      const answer = await kabbalisticNumerologyIntelligence.answerQuestion(data, kabbalisticQuestion)
      return answer
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to answer question')
      return null
    }
  }

  const loadAnalysisHistory = async () => {
    if (!user) return

    try {
      const history = await kabbalisticNumerologyIntelligence.getAnalysisHistory(user.uid)
      setAnalysisHistory(history)
    } catch (err) {
      console.warn('Error loading analysis history:', err)
    }
  }

  useEffect(() => {
    if (user) {
      loadAnalysisHistory()
    }
  }, [user])

  const refresh = async () => {
    if (userProfile?.displayName && userProfile?.birthDate) {
      await analyze({
        fullName: userProfile.displayName,
        birthDate: userProfile.birthDate,
        birthTime: userProfile.birthTime,
        birthPlace: userProfile.birthPlace
      })
    }
  }

  const getSystemStatus = () => {
    return kabbalisticNumerologyIntelligence.getSystemStatus()
  }

  return {
    data,
    loading,
    error,
    lastUpdated,
    analysisHistory,
    analyze,
    answerQuestion,
    loadAnalysisHistory,
    refresh,
    getSystemStatus
  }
} 