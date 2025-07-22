"use client"

import { useState, useEffect } from 'react'
import { useAuth } from './use-auth'
import { lenormandIntelligence, LenormandAnalysis, LenormandQuestion, LenormandAnswer } from '@/lib/lenormandIntelligence'

export function useLenormand() {
  const { user, userProfile } = useAuth()
  const [data, setData] = useState<LenormandAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [analysisHistory, setAnalysisHistory] = useState<LenormandAnalysis[]>([])

  // Auto-fetch on sign-in if user is present
  useEffect(() => {
    if (user && !data) {
      analyze('What guidance do the Lenormand cards offer for my current life path?', 'three')
    }
  }, [user, data])

  const analyze = async (question: string, spreadType: LenormandQuestion['spreadType'] = 'three') => {
    if (!user) {
      setError('Authentication required')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const analysis = await lenormandIntelligence.analyzeSpread(question, spreadType)
      setData(analysis)
      setLastUpdated(new Date())
      await lenormandIntelligence.saveAnalysis(user.uid, analysis)
      setAnalysisHistory(prev => [analysis, ...prev.slice(0, 9)])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze Lenormand spread')
    } finally {
      setLoading(false)
    }
  }

  const answerQuestion = async (question: string, spreadType: LenormandQuestion['spreadType'] = 'three', urgency: LenormandQuestion['urgency'] = 'medium'): Promise<LenormandAnswer | null> => {
    if (!data) {
      setError('Please analyze a Lenormand spread first')
      return null
    }
    try {
      const answer = await lenormandIntelligence.answerQuestion(question, spreadType, urgency)
      return answer
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to answer question')
      return null
    }
  }

  const loadAnalysisHistory = async () => {
    if (!user) return
    try {
      const history = await lenormandIntelligence.getAnalysisHistory(user.uid)
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
    await analyze('What guidance do the Lenormand cards offer for my current life path?', 'three')
  }

  const getSystemStatus = () => {
    return lenormandIntelligence.getSystemStatus()
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