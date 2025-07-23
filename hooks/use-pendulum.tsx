"use client"

import { useState, useEffect } from 'react'
import { useAuth } from './use-auth'
import { pendulumIntelligence, PendulumData, PendulumAnalysis, PendulumQuestion, PendulumAnswer } from '@/lib/pendulumIntelligence'

export function usePendulum() {
  const { user, userProfile } = useAuth()
  const [data, setData] = useState<PendulumAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [analysisHistory, setAnalysisHistory] = useState<PendulumAnalysis[]>([])

  // Auto-fetch on sign-in if user is present
  useEffect(() => {
    if (user && !data) {
      analyze({
        question: 'What guidance does the pendulum offer for my current life path?',
        pendulumType: 'crystal',
        userIntention: 'Seeking spiritual guidance'
      })
    }
  }, [user, data])

  const analyze = async (pendulumData: PendulumData) => {
    if (!user) {
      setError('Authentication required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const analysis = await pendulumIntelligence.analyzePendulum(pendulumData)
      setData(analysis)
      setLastUpdated(new Date())

      // Save analysis to history
      await pendulumIntelligence.saveAnalysis(user.uid, analysis)
      
      // Update analysis history
      setAnalysisHistory(prev => [analysis, ...prev.slice(0, 9)]) // Keep last 10 analyses
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze pendulum')
    } finally {
      setLoading(false)
    }
  }

  const answerQuestion = async (question: string, category: PendulumQuestion['category'] = 'general', urgency: PendulumQuestion['urgency'] = 'medium'): Promise<PendulumAnswer | null> => {
    if (!data) {
      setError('Please analyze a pendulum reading first')
      return null
    }

    try {
      const answer = await pendulumIntelligence.answerQuestion(question, category, urgency)
      return answer
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to answer question')
      return null
    }
  }

  const loadAnalysisHistory = async () => {
    if (!user) return

    try {
      const history = await pendulumIntelligence.getAnalysisHistory(user.uid)
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
    await analyze({
      question: 'What guidance does the pendulum offer for my current life path?',
      pendulumType: 'crystal',
      userIntention: 'Seeking spiritual guidance'
    })
  }

  const getSystemStatus = () => {
    return pendulumIntelligence.getSystemStatus()
  }

  const getPendulumTypes = () => {
    return pendulumIntelligence.getPendulumTypes()
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
    getSystemStatus,
    getPendulumTypes
  }
} 