import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './use-auth'
import { 
  getComprehensiveAstroData, 
  getCachedAstroData, 
  clearAstroDataCache,
  hasComprehensiveData,
  type ComprehensiveAstroData 
} from '@/lib/astroDataService'

export function useAstroData() {
  const { user, userProfile } = useAuth()
  const [astroData, setAstroData] = useState<ComprehensiveAstroData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<number | null>(null)

  // Check if we have valid birth details
  const hasValidBirthDetails = userProfile?.birthDate && userProfile?.birthPlace

  // Load astrological data when user profile changes
  useEffect(() => {
    if (!user?.uid || !hasValidBirthDetails) {
      setAstroData(null)
      setLoading(false)
      setError(null)
      return
    }

    const loadAstroData = async () => {
      setLoading(true)
      setError(null)

      try {
        // First check if we have cached data
        const cached = getCachedAstroData(user.uid)
        if (cached) {
          console.log('Using cached astro data for user:', user.uid)
          setAstroData(cached)
          setLastFetched(cached.lastFetched)
          setLoading(false)
          return
        }

        // Check if we have stored data in Firebase
        const hasStored = await hasComprehensiveData(user.uid)
        if (hasStored) {
          // Fetch from storage (this will also cache it)
          const data = await getComprehensiveAstroData(
            user.uid,
            userProfile.birthDate!,
            userProfile.birthPlace!,
            userProfile.birthTime
          )
          setAstroData(data)
          setLastFetched(data.lastFetched)
        } else {
          // Fetch fresh data from AstroApp
          console.log('Fetching fresh astro data for user:', user.uid)
          const data = await getComprehensiveAstroData(
            user.uid,
            userProfile.birthDate!,
            userProfile.birthPlace!,
            userProfile.birthTime
          )
          setAstroData(data)
          setLastFetched(data.lastFetched)
        }
      } catch (err: any) {
        console.error('Error loading astro data:', err)
        setError(err.message || 'Failed to load astrological data')
      } finally {
        setLoading(false)
      }
    }

    loadAstroData()
  }, [user?.uid, userProfile?.birthDate, userProfile?.birthPlace, userProfile?.birthTime, hasValidBirthDetails])

  // Refresh astrological data (force new fetch from AstroApp)
  const refreshData = useCallback(async () => {
    if (!user?.uid || !hasValidBirthDetails) {
      throw new Error('User or birth details not available')
    }

    setLoading(true)
    setError(null)

    try {
      const data = await getComprehensiveAstroData(
        user.uid,
        userProfile.birthDate!,
        userProfile.birthPlace!,
        userProfile.birthTime,
        true // force refresh
      )
      setAstroData(data)
      setLastFetched(data.lastFetched)
      return data
    } catch (err: any) {
      console.error('Error refreshing astro data:', err)
      setError(err.message || 'Failed to refresh astrological data')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user?.uid, userProfile?.birthDate, userProfile?.birthPlace, userProfile?.birthTime, hasValidBirthDetails])

  // Clear cached data (useful when profile is updated)
  const clearCache = useCallback(() => {
    if (user?.uid) {
      clearAstroDataCache(user.uid)
      setAstroData(null)
      setLastFetched(null)
    }
  }, [user?.uid])

  // Get specific data from astro data
  const getSunSign = useCallback(() => astroData?.sunSign || 'Unknown', [astroData])
  const getMoonSign = useCallback(() => astroData?.moonSign || 'Unknown', [astroData])
  const getRisingSign = useCallback(() => astroData?.risingSign || 'Unknown', [astroData])
  const getPlanets = useCallback(() => astroData?.planets || [], [astroData])
  const getHouses = useCallback(() => astroData?.houses || [], [astroData])
  const getAspects = useCallback(() => astroData?.aspects || [], [astroData])
  const getElements = useCallback(() => astroData?.elements || { fire: 0, earth: 0, air: 0, water: 0 }, [astroData])
  const getModalities = useCallback(() => astroData?.modalities || { cardinal: 0, fixed: 0, mutable: 0 }, [astroData])
  const getPersonalityTraits = useCallback(() => astroData?.personalityTraits || [], [astroData])
  const getLifePath = useCallback(() => astroData?.lifePath || '', [astroData])
  const getChallenges = useCallback(() => astroData?.challenges || [], [astroData])
  const getStrengths = useCallback(() => astroData?.strengths || [], [astroData])
  const getCompatibility = useCallback(() => astroData?.compatibility || { bestMatches: [], challengingMatches: [] }, [astroData])
  const getCurrentTransits = useCallback(() => astroData?.currentTransits || [], [astroData])

  // Check if data is fresh (less than 24 hours old)
  const isDataFresh = useCallback(() => {
    if (!lastFetched) return false
    return Date.now() - lastFetched < 24 * 60 * 60 * 1000
  }, [lastFetched])

  // Check if data needs refresh (more than 24 hours old)
  const needsRefresh = useCallback(() => {
    return !isDataFresh()
  }, [isDataFresh])

  return {
    // Data
    astroData,
    sunSign: getSunSign(),
    moonSign: getMoonSign(),
    risingSign: getRisingSign(),
    planets: getPlanets(),
    houses: getHouses(),
    aspects: getAspects(),
    elements: getElements(),
    modalities: getModalities(),
    personalityTraits: getPersonalityTraits(),
    lifePath: getLifePath(),
    challenges: getChallenges(),
    strengths: getStrengths(),
    compatibility: getCompatibility(),
    currentTransits: getCurrentTransits(),
    
    // State
    loading,
    error,
    lastFetched,
    hasValidBirthDetails,
    isDataFresh: isDataFresh(),
    needsRefresh: needsRefresh(),
    
    // Actions
    refreshData,
    clearCache,
  }
} 