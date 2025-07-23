import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { faceReadingIntelligence, FaceReadingAnalysis, FaceReadingCoaching } from '@/lib/faceReadingIntelligence'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface FaceReadingData {
  analysis: FaceReadingAnalysis | null
  coaching: FaceReadingCoaching[]
  lastUpdated: Date | null
  isStale: boolean
}

export function useFaceReading() {
  const { user } = useAuth()
  const [data, setData] = useState<FaceReadingData>({
    analysis: null,
    coaching: [],
    lastUpdated: null,
    isStale: false
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadFaceReadingData = useCallback(async () => {
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
        setError('Please complete your profile to access Face Reading analysis')
        setLoading(false)
        return
      }

      const profile = profileSnap.data()
      if (!profile.birthDate || !profile.birthPlace) {
        setError('Please complete your profile with birth date and place to access Face Reading analysis')
        setLoading(false)
        return
      }

      // Check for existing face reading data
      const faceReadingRef = doc(db, 'users', user.uid, 'face-readings', 'latest')
      const faceReadingSnap = await getDoc(faceReadingRef)

      if (faceReadingSnap.exists()) {
        const existingData = faceReadingSnap.data() as FaceReadingAnalysis
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
        // Generate new face reading analysis
        const age = Math.floor((Date.now() - new Date(profile.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        const gender = profile.gender || 'other'
        
        const analysis = await faceReadingIntelligence.analyzeFace(age, gender)
        await faceReadingIntelligence.saveAnalysis(user.uid, analysis)

        setData({
          analysis,
          coaching: [],
          lastUpdated: new Date(),
          isStale: false
        })
      }
    } catch (err) {
      console.error('Error loading face reading data:', err)
      setError('Failed to load face reading data. Please try again.')
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
      
      const analysis = await faceReadingIntelligence.analyzeFace(age, gender)
      await faceReadingIntelligence.saveAnalysis(user.uid, analysis)

      setData({
        analysis,
        coaching: data.coaching,
        lastUpdated: new Date(),
        isStale: false
      })
    } catch (err) {
      console.error('Error refreshing face reading data:', err)
      setError('Failed to refresh face reading data')
    } finally {
      setLoading(false)
    }
  }, [user, data.coaching])

  const getCoaching = useCallback(async (question: string): Promise<FaceReadingCoaching | null> => {
    if (!user || !data.analysis) return null

    try {
      const coaching = await faceReadingIntelligence.getCoaching(question, data.analysis)
      await faceReadingIntelligence.saveCoaching(user.uid, coaching)
      
      setData(prev => ({
        ...prev,
        coaching: [...prev.coaching, coaching]
      }))

      return coaching
    } catch (err) {
      console.error('Error getting coaching:', err)
      return null
    }
  }, [user, data.analysis])

  useEffect(() => {
    loadFaceReadingData()
  }, [loadFaceReadingData])

  return {
    faceReadingData: data.analysis,
    coaching: data.coaching,
    loading,
    error,
    refresh,
    getCoaching,
    lastUpdated: data.lastUpdated,
    isStale: data.isStale
  }
} 