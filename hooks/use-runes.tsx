import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { runesIntelligence, RuneReading, RunesCoaching } from '@/lib/runesIntelligence'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface RunesData {
  reading: RuneReading | null
  coaching: RunesCoaching[]
  lastUpdated: Date | null
  isStale: boolean
}

export function useRunesData() {
  const { user } = useAuth()
  const [data, setData] = useState<RunesData>({
    reading: null,
    coaching: [],
    lastUpdated: null,
    isStale: false
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRunesData = useCallback(async () => {
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
        setError('Please complete your profile to access Rune readings')
        setLoading(false)
        return
      }

      const profile = profileSnap.data()
      if (!profile.birthDate || !profile.birthPlace) {
        setError('Please complete your profile with birth date and place to access Rune readings')
        setLoading(false)
        return
      }

      // Check for existing rune data
      const runesRef = doc(db, 'users', user.uid, 'rune-readings', 'latest')
      const runesSnap = await getDoc(runesRef)

      if (runesSnap.exists()) {
        const existingData = runesSnap.data() as RuneReading
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
        // Generate new rune reading
        const defaultQuestion = 'What guidance do the runes offer for my current life path?'
        const spreadType = 'three' // Default to three-rune spread for initial reading
        
        const reading = await runesIntelligence.castRunes(defaultQuestion, spreadType)
        await runesIntelligence.saveReading(user.uid, reading)

        setData({
          reading,
          coaching: [],
          lastUpdated: new Date(),
          isStale: false
        })
      }
    } catch (err) {
      console.error('Error loading rune data:', err)
      setError('Failed to load rune data. Please try again.')
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

      const defaultQuestion = 'What guidance do the runes offer for my current life path?'
      const spreadType = 'three' // Default to three-rune spread for refresh
      
      const reading = await runesIntelligence.castRunes(defaultQuestion, spreadType)
      await runesIntelligence.saveReading(user.uid, reading)

      setData({
        reading,
        coaching: data.coaching,
        lastUpdated: new Date(),
        isStale: false
      })
    } catch (err) {
      console.error('Error refreshing rune data:', err)
      setError('Failed to refresh rune data')
    } finally {
      setLoading(false)
    }
  }, [user, data.coaching])

  const castRunes = useCallback(async (question: string, spreadType: string): Promise<RuneReading | null> => {
    if (!user) return null

    try {
      const reading = await runesIntelligence.castRunes(question, spreadType)
      await runesIntelligence.saveReading(user.uid, reading)

      setData(prev => ({
        ...prev,
        reading,
        lastUpdated: new Date(),
        isStale: false
      }))

      return reading
    } catch (err) {
      console.error('Error casting runes:', err)
      return null
    }
  }, [user])

  const getCoaching = useCallback(async (question: string): Promise<RunesCoaching | null> => {
    if (!user || !data.reading) return null

    try {
      const coaching = await runesIntelligence.getCoaching(question, data.reading)
      if (coaching) {
        await runesIntelligence.saveCoaching(user.uid, coaching)
        
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
    loadRunesData()
  }, [loadRunesData])

  return {
    runesData: data.reading,
    coaching: data.coaching,
    loading,
    error,
    refresh,
    castRunes,
    getCoaching,
    lastUpdated: data.lastUpdated,
    isStale: data.isStale
  }
} 