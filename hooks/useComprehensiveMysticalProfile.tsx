'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getFirebaseDB } from '@/lib/firebase'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'

export interface ComprehensiveMysticalProfile {
  vedic: {
    ascendant: number
    planets: any[]
    houses: any[]
    nakshatras: any[]
    yogas: any[]
    dasha: any[]
    currentDasha: any
    vedicCharts?: any
  }
  interpretations: {
    personality: {
      overview: string
      strengths: string[]
      challenges: string[]
    }
    lifePurpose: {
      overview: string
      karmicLessons: string[]
      spiritualPath: string
      soulEvolution: string
    }
    relationships: {
      overview: string
      marriageTiming: string
      compatibility: string
      familyLife: string
    }
    career: {
      overview: string
      suitableProfessions: string[]
      successFactors: string[]
      timing: string
    }
    health: {
      overview: string
      constitution: string
      healthTips: string[]
      vulnerableAreas: string[]
    }
    spirituality: {
      overview: string
      practices: string[]
      evolution: string
      divineConnection: string
    }
    dasha: {
      overview: string
      current: any
      upcoming: any[]
      timing: string
    }
    remedies: {
      overview: string
      mantras: string[]
      gemstones: string[]
      practices: string[]
    }
  }
  metadata: {
    source: string
    version: string
    generatedAt: string
    calculationTime: number
    systemsUsed: string[]
    interpretationType: string
  }
  userId?: string
  lastUpdated?: number
  birthDate?: string
  birthPlace?: string
  birthTime?: string
}

interface UseComprehensiveMysticalProfileReturn {
  profile: ComprehensiveMysticalProfile | null
  loading: boolean
  error: string | null
  hasProfile: boolean
  refreshProfile: () => Promise<void>
}

// In-memory cache
const profileCache = new Map<string, { data: ComprehensiveMysticalProfile; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useComprehensiveMysticalProfile(): UseComprehensiveMysticalProfileReturn {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ComprehensiveMysticalProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async (userId: string, useCache: boolean = true) => {
    try {
      setLoading(true)
      setError(null)

      // Check cache first
      if (useCache) {
        const cached = profileCache.get(userId)
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          if (process.env.NODE_ENV === 'development') {
            console.debug('📦 Using cached comprehensive mystical profile')
          }
          setProfile(cached.data)
          setLoading(false)
          return
        }
      }

      const db = getFirebaseDB()
      if (!db) {
        throw new Error('Database not available')
      }

      const profileRef = doc(db, 'comprehensiveMysticalProfiles', userId)
      const profileSnap = await getDoc(profileRef)

      if (profileSnap.exists()) {
        const data = profileSnap.data() as ComprehensiveMysticalProfile
        setProfile(data)
        
        // Update cache
        profileCache.set(userId, { data, timestamp: Date.now() })
        
        if (process.env.NODE_ENV === 'development') {
          console.debug('✅ Comprehensive mystical profile loaded', {
            systems: data.metadata?.systemsUsed?.length || 0,
            hasInterpretations: !!data.interpretations,
            generatedAt: data.metadata?.generatedAt
          })
        }
      } else {
        setProfile(null)
        if (process.env.NODE_ENV === 'development') {
          console.debug('📭 No comprehensive mystical profile found for user')
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile'
      setError(errorMessage)
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error fetching comprehensive mystical profile:', err)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user?.uid) {
      await fetchProfile(user.uid, false) // Force refresh, bypass cache
    }
  }, [user?.uid, fetchProfile])

  // Initial fetch and real-time updates
  useEffect(() => {
    // Skip if signing out
    if (typeof window !== 'undefined' && sessionStorage.getItem('signing_out') === 'true') {
      setLoading(false)
      setProfile(null)
      return
    }
    
    if (!user?.uid) {
      setLoading(false)
      setProfile(null)
      return
    }

    // Initial fetch
    fetchProfile(user.uid)

    // Set up real-time listener with error handling
    const db = getFirebaseDB()
    if (!db) return

    const profileRef = doc(db, 'comprehensiveMysticalProfiles', user.uid)
    
    let unsubscribe: (() => void) | null = null
    
    try {
      unsubscribe = onSnapshot(
        profileRef,
        (snapshot) => {
          // Double-check we're not signing out
          if (typeof window !== 'undefined' && sessionStorage.getItem('signing_out') === 'true') {
            return
          }
          
          if (snapshot.exists()) {
            const data = snapshot.data() as ComprehensiveMysticalProfile
            setProfile(data)
            // Update cache
            profileCache.set(user.uid, { data, timestamp: Date.now() })
            
            if (process.env.NODE_ENV === 'development') {
              console.debug('🔄 Comprehensive mystical profile updated via real-time listener')
            }
          }
        },
        (err) => {
          // Check if it's a Firestore corruption error
          const errorMessage = err?.message || '';
          if (errorMessage.includes('INTERNAL ASSERTION FAILED') || 
              errorMessage.includes('Unexpected state')) {
            console.warn('⚠️ Firestore listener error detected, will reload page');
            // Don't set error state, let the global error handler reload the page
            return
          }
          
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ Real-time listener error:', err)
          }
        }
      )
    } catch (listenerError) {
      console.warn('⚠️ Could not set up Firestore listener:', listenerError)
    }

    return () => {
      // Clean up listener if it exists
      if (unsubscribe) {
        try {
          unsubscribe()
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
      }
    }
  }, [user?.uid, fetchProfile])

  // When profile is regenerated elsewhere (e.g. profile page), refresh so caches see new data
  useEffect(() => {
    if (typeof window === 'undefined' || !user?.uid) return
    const handler = () => refreshProfile()
    window.addEventListener('futureSeer:profileRegenerated', handler)
    return () => window.removeEventListener('futureSeer:profileRegenerated', handler)
  }, [user?.uid, refreshProfile])

  return {
    profile,
    loading,
    error,
    hasProfile: !!profile && !!profile.vedic && !!profile.interpretations,
    refreshProfile
  }
}
