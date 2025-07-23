import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { palmistryIntelligence, PalmistryAnalysis, PalmistryCoaching } from '@/lib/palmistryIntelligence'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface PalmistryData {
  analysis: PalmistryAnalysis | null
  coaching: PalmistryCoaching[]
  lastUpdated: Date | null
  isStale: boolean
}

export function usePalmistryData() {
  const { user } = useAuth()
  const [data, setData] = useState<PalmistryData>({
    analysis: null,
    coaching: [],
    lastUpdated: null,
    isStale: false
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPalmistryData = useCallback(async () => {
    if (!user) {
      setError('User not authenticated')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Check if user has a profile
      const profileRef = doc(db, 'users', user.uid)
      const profileSnap = await getDoc(profileRef)
      
      if (!profileSnap.exists()) {
        setError('Please complete your profile to access Palmistry analysis')
        setLoading(false)
        return
      }

      const profile = profileSnap.data()
      if (!profile.birthDate || !profile.birthPlace) {
        setError('Please complete your profile with birth date and place to access Palmistry analysis')
        setLoading(false)
        return
      }

      // Check for existing palmistry data
      const palmistryRef = doc(db, 'users', user.uid, 'palmistry-readings', 'latest')
      const palmistrySnap = await getDoc(palmistryRef)

      if (palmistrySnap.exists()) {
        const existingData = palmistrySnap.data() as PalmistryAnalysis
        const lastUpdated = existingData.timestamp instanceof Date 
          ? existingData.timestamp 
          : new Date((existingData.timestamp as any).seconds * 1000)
        
        const isStale = Date.now() - lastUpdated.getTime() > 24 * 60 * 60 * 1000 // 24 hours

        setData({
          analysis: existingData,
          coaching: [], // Will be loaded separately if needed
          lastUpdated,
          isStale
        })
      } else {
        // Generate new palmistry analysis
        const age = Math.floor((Date.now() - new Date(profile.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        const gender = profile.gender || 'other'
        const hand = 'right' // Default to right hand for initial analysis
        const dominantHand = profile.dominantHand || 'right'
        
        const analysis = await palmistryIntelligence.analyzePalm(hand, dominantHand, age, gender)
        await palmistryIntelligence.saveAnalysis(user.uid, analysis)

        setData({
          analysis,
          coaching: [],
          lastUpdated: new Date(),
          isStale: false
        })
      }
    } catch (err) {
      console.error('Error loading palmistry data:', err)
      setError('Failed to load palmistry data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [user])

  const refresh = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const profile = (await getDoc(doc(db, 'users', user.uid))).data()
      if (!profile?.birthDate || !profile?.birthPlace) {
        setError('Please complete your profile with birth date and place')
        return
      }

      const age = Math.floor((Date.now() - new Date(profile.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      const gender = profile.gender || 'other'
      const hand = 'right' // Default to right hand for refresh
      const dominantHand = profile.dominantHand || 'right'
      
      const analysis = await palmistryIntelligence.analyzePalm(hand, dominantHand, age, gender)
      await palmistryIntelligence.saveAnalysis(user.uid, analysis)

      setData({
        analysis,
        coaching: data.coaching,
        lastUpdated: new Date(),
        isStale: false
      })
    } catch (err) {
      console.error('Error refreshing palmistry data:', err)
      setError('Failed to refresh palmistry data')
    } finally {
      setLoading(false)
    }
  }, [user, data.coaching])

  const analyzePalm = useCallback(async (hand: 'left' | 'right' | 'both', dominantHand: 'left' | 'right', age: number, gender: 'male' | 'female' | 'other'): Promise<PalmistryAnalysis | null> => {
    if (!user) return null

    try {
      const analysis = await palmistryIntelligence.analyzePalm(hand, dominantHand, age, gender)
      await palmistryIntelligence.saveAnalysis(user.uid, analysis)

      setData(prev => ({
        ...prev,
        analysis,
        lastUpdated: new Date(),
        isStale: false
      }))

      return analysis
    } catch (err) {
      console.error('Error analyzing palm:', err)
      return null
    }
  }, [user])

  const getCoaching = useCallback(async (question: string): Promise<PalmistryCoaching | null> => {
    if (!user || !data.analysis) return null

    try {
      const coaching = await palmistryIntelligence.getCoaching(question, data.analysis)
      if (coaching) {
        await palmistryIntelligence.saveCoaching(user.uid, coaching)
        
        setData(prev => ({
          ...prev,
          coaching: [...prev.coaching, coaching]
        }))
      }

      return coaching
    } catch (err) {
      console.error('Error getting coaching:', err)
      return null
    }
  }, [user, data.analysis])

  useEffect(() => {
    loadPalmistryData()
  }, [loadPalmistryData])

  return {
    palmistryData: data.analysis,
    coaching: data.coaching,
    loading,
    error,
    refresh,
    analyzePalm,
    getCoaching,
    lastUpdated: data.lastUpdated,
    isStale: data.isStale
  }
} 