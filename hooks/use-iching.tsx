import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { ichingIntelligence, IChingAnalysis, IChingCoaching } from '@/lib/ichingIntelligence'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface IChingData {
  analysis: IChingAnalysis | null
  coaching: IChingCoaching[]
  lastUpdated: Date | null
  isStale: boolean
}

export function useIChingData() {
  const { user } = useAuth()
  const [data, setData] = useState<IChingData>({
    analysis: null,
    coaching: [],
    lastUpdated: null,
    isStale: false
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadIChingData = useCallback(async () => {
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
        setError('Please complete your profile to access I Ching analysis')
        setLoading(false)
        return
      }

      const profile = profileSnap.data()
      if (!profile.birthDate || !profile.birthPlace) {
        setError('Please complete your profile with birth date and place to access I Ching analysis')
        setLoading(false)
        return
      }

      // Check for existing I Ching data
      const ichingRef = doc(db, 'users', user.uid, 'iching-readings', 'latest')
      const ichingSnap = await getDoc(ichingRef)

      if (ichingSnap.exists()) {
        const existingData = ichingSnap.data() as IChingAnalysis
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
        // Generate new I Ching analysis with a default question
        const defaultQuestion = 'What guidance does the I Ching offer for my current life path?'
        const analysis = await ichingIntelligence.consultIChing(defaultQuestion, 'random')
        await ichingIntelligence.saveAnalysis(user.uid, analysis)

        setData({
          analysis,
          coaching: [],
          lastUpdated: new Date(),
          isStale: false
        })
      }
    } catch (err) {
      console.error('Error loading I Ching data:', err)
      setError('Failed to load I Ching data. Please try again.')
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

      const defaultQuestion = 'What guidance does the I Ching offer for my current life path?'
      const analysis = await ichingIntelligence.consultIChing(defaultQuestion, 'random')
      await ichingIntelligence.saveAnalysis(user.uid, analysis)

      setData({
        analysis,
        coaching: data.coaching,
        lastUpdated: new Date(),
        isStale: false
      })
    } catch (err) {
      console.error('Error refreshing I Ching data:', err)
      setError('Failed to refresh I Ching data')
    } finally {
      setLoading(false)
    }
  }, [user, data.coaching])

  const consultIChing = useCallback(async (question: string, method: 'coins' | 'yarrow' | 'random'): Promise<IChingAnalysis | null> => {
    if (!user) return null

    try {
      const analysis = await ichingIntelligence.consultIChing(question, method)
      await ichingIntelligence.saveAnalysis(user.uid, analysis)

      setData(prev => ({
        ...prev,
        analysis,
        lastUpdated: new Date(),
        isStale: false
      }))

      return analysis
    } catch (err) {
      console.error('Error consulting I Ching:', err)
      return null
    }
  }, [user])

  const getCoaching = useCallback(async (question: string): Promise<IChingCoaching | null> => {
    if (!user || !data.analysis) return null

    try {
      const coaching = await ichingIntelligence.getCoaching(question, data.analysis)
      await ichingIntelligence.saveCoaching(user.uid, coaching)
      
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
    loadIChingData()
  }, [loadIChingData])

  return {
    ichingData: data.analysis,
    coaching: data.coaching,
    loading,
    error,
    refresh,
    consultIChing,
    getCoaching,
    lastUpdated: data.lastUpdated,
    isStale: data.isStale
  }
} 