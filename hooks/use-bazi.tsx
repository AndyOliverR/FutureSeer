"use client"

import { useState, useEffect } from 'react'
import { useAuth } from './use-auth'
import { baziIntelligence, BaziData, BaziAnalysis, BaziQuestion, BaziAnswer } from '@/lib/baziIntelligence'

export function useBazi() {
  const { user, userProfile } = useAuth()
  const [data, setData] = useState<BaziAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [analysisHistory, setAnalysisHistory] = useState<BaziAnalysis[]>([])

  // Auto-fetch on sign-in if user has birth data
  useEffect(() => {
    if (user && userProfile?.birthDate && userProfile?.birthPlace && !data) {
      analyze({
        birthDate: userProfile.birthDate,
        birthTime: userProfile.birthTime || "12:00",
        birthPlace: userProfile.birthPlace,
        latitude: 0,
        longitude: 0
      })
    }
  }, [user, userProfile, data])

  const analyze = async (baziData: BaziData) => {
    if (!user) {
      setError('Authentication required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const analysis = await baziIntelligence.analyzeBazi(baziData)
      setData(analysis)
      setLastUpdated(new Date())

      // Save analysis to history
      await baziIntelligence.saveAnalysis(user.uid, analysis)
      
      // Update analysis history
      setAnalysisHistory(prev => [analysis, ...prev.slice(0, 9)]) // Keep last 10 analyses
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze Bazi chart')
    } finally {
      setLoading(false)
    }
  }

  const answerQuestion = async (question: string, category: BaziQuestion['category'] = 'general', urgency: BaziQuestion['urgency'] = 'medium'): Promise<BaziAnswer | null> => {
    if (!data) {
      setError('Please analyze your Bazi chart first')
      return null
    }

    const baziQuestion: BaziQuestion = {
      question,
      category,
      urgency
    }

    try {
      const answer = await baziIntelligence.answerQuestion(data, baziQuestion)
      return answer
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to answer question')
      return null
    }
  }

  const loadAnalysisHistory = async () => {
    if (!user) return

    try {
      const history = await baziIntelligence.getAnalysisHistory(user.uid)
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
    if (userProfile?.birthDate && userProfile?.birthPlace) {
      await analyze({
        birthDate: userProfile.birthDate,
        birthTime: userProfile.birthTime || "12:00",
        birthPlace: userProfile.birthPlace,
        latitude: 0,
        longitude: 0
      })
    }
  }

  const getSystemStatus = () => {
    return baziIntelligence.getSystemStatus()
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