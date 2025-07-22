"use client"

import { useState, useEffect } from 'react'
import { useAuth } from './use-auth'
import { dreamSymbolsIntelligence, DreamData, DreamAnalysis, DreamQuestion, DreamAnswer } from '@/lib/dreamSymbolsIntelligence'

export function useDreamSymbols() {
  const { user, userProfile } = useAuth()
  const [data, setData] = useState<DreamAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [analysisHistory, setAnalysisHistory] = useState<DreamAnalysis[]>([])

  // Auto-fetch on sign-in if user is present
  useEffect(() => {
    if (user && !data) {
      analyze({
        dreamDescription: 'I was walking through a beautiful garden with flowing water and felt peaceful and connected to nature.',
        symbols: ['water', 'tree'],
        emotions: ['peace', 'connection'],
        dreamType: 'ordinary',
        context: 'Recent spiritual journey'
      })
    }
  }, [user, data])

  const analyze = async (dreamData: DreamData) => {
    if (!user) {
      setError('Authentication required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const analysis = await dreamSymbolsIntelligence.analyzeDream(dreamData)
      setData(analysis)
      setLastUpdated(new Date())

      // Save analysis to history
      await dreamSymbolsIntelligence.saveAnalysis(user.uid, analysis)
      
      // Update analysis history
      setAnalysisHistory(prev => [analysis, ...prev.slice(0, 9)]) // Keep last 10 analyses
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze dream')
    } finally {
      setLoading(false)
    }
  }

  const answerQuestion = async (question: string, category: DreamQuestion['category'] = 'general', urgency: DreamQuestion['urgency'] = 'medium'): Promise<DreamAnswer | null> => {
    if (!data) {
      setError('Please analyze a dream first')
      return null
    }

    const dreamQuestion: DreamQuestion = {
      question,
      category,
      urgency
    }

    try {
      const answer = await dreamSymbolsIntelligence.answerQuestion(data, dreamQuestion)
      return answer
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to answer question')
      return null
    }
  }

  const loadAnalysisHistory = async () => {
    if (!user) return

    try {
      const history = await dreamSymbolsIntelligence.getAnalysisHistory(user.uid)
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
      dreamDescription: 'I was walking through a beautiful garden with flowing water and felt peaceful and connected to nature.',
      symbols: ['water', 'tree'],
      emotions: ['peace', 'connection'],
      dreamType: 'ordinary',
      context: 'Recent spiritual journey'
    })
  }

  const getSystemStatus = () => {
    return dreamSymbolsIntelligence.getSystemStatus()
  }

  const getDreamSymbols = () => {
    return dreamSymbolsIntelligence.getDreamSymbols()
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
    getDreamSymbols
  }
} 