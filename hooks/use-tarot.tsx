import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { tarotIntelligence, TarotReading, TarotCoaching } from '@/lib/tarotIntelligence'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface TarotData {
  reading: TarotReading | null
  coaching: TarotCoaching[]
  lastUpdated: Date | null
  isStale: boolean
}

export function useTarotData() {
  const { user } = useAuth()
  const [data, setData] = useState<TarotData>({
    reading: null,
    coaching: [],
    lastUpdated: null,
    isStale: false
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTarotData = useCallback(async () => {
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
        setError('Please complete your profile to access Tarot readings')
        setLoading(false)
        return
      }
      const profile = profileSnap.data()
      if (!profile.birthDate || !profile.birthPlace) {
        setError('Please complete your profile with birth date and place to access Tarot readings')
        setLoading(false)
        return
      }
      // Check for existing tarot data
      const tarotRef = doc(db, 'users', user.uid, 'tarot-readings', 'latest')
      const tarotSnap = await getDoc(tarotRef)
      if (tarotSnap.exists()) {
        const existingData = tarotSnap.data() as TarotReading
        const lastUpdated = existingData.timestamp instanceof Date 
          ? existingData.timestamp 
          : new Date((existingData.timestamp as any).seconds * 1000)
        const isStale = Date.now() - lastUpdated.getTime() > 24 * 60 * 60 * 1000 // 24 hours
        setData({
          reading: existingData,
          coaching: [], // Will be loaded separately if needed
          lastUpdated,
          isStale
        })
      } else {
        // Generate new tarot reading
        const defaultQuestion = 'What guidance does the Tarot offer for my current life path?'
        const spreadType = 'three' // Default to three-card spread for initial reading
        const reading = await tarotIntelligence.drawCards(defaultQuestion, spreadType)
        await tarotIntelligence.saveReading(user.uid, reading)
        setData({
          reading,
          coaching: [],
          lastUpdated: new Date(),
          isStale: false
        })
      }
    } catch (err) {
      console.error('Error loading tarot data:', err)
      setError('Failed to load tarot data. Please try again.')
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
      const defaultQuestion = 'What guidance does the Tarot offer for my current life path?'
      const spreadType = 'three' // Default to three-card spread for refresh
      const reading = await tarotIntelligence.drawCards(defaultQuestion, spreadType)
      await tarotIntelligence.saveReading(user.uid, reading)
      setData({
        reading,
        coaching: data.coaching,
        lastUpdated: new Date(),
        isStale: false
      })
    } catch (err) {
      console.error('Error refreshing tarot data:', err)
      setError('Failed to refresh tarot data')
    } finally {
      setLoading(false)
    }
  }, [user, data.coaching])

  const drawTarot = useCallback(async (question: string, spreadType: string): Promise<TarotReading | null> => {
    if (!user) return null
    try {
      const reading = await tarotIntelligence.drawCards(question, spreadType)
      await tarotIntelligence.saveReading(user.uid, reading)
      setData(prev => ({
        ...prev,
        reading,
        lastUpdated: new Date(),
        isStale: false
      }))
      return reading
    } catch (err) {
      console.error('Error drawing tarot:', err)
      return null
    }
  }, [user])

  const getCoaching = useCallback(async (question: string): Promise<TarotCoaching | null> => {
    if (!user || !data.reading) return null
    try {
      const coaching = await tarotIntelligence.getCoaching(question, data.reading)
      if (coaching) {
        await tarotIntelligence.saveCoaching(user.uid, coaching)
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
  }, [user, data.reading])

  useEffect(() => {
    loadTarotData()
  }, [loadTarotData])

  return {
    tarotData: data.reading,
    coaching: data.coaching,
    loading,
    error,
    refresh,
    drawTarot,
    getCoaching,
    lastUpdated: data.lastUpdated,
    isStale: data.isStale
  }
} 