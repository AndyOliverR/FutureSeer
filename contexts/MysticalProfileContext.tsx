'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getFirebaseDB, isReportsStale } from '@/lib/firebase'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import {
  getPersistentProfile,
  setPersistentProfile,
  clearPersistentProfileCache,
  computeComprehensiveProfileVersionHash
} from '@/lib/comprehensiveProfileCache'

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
  [toolSlug: string]: unknown
}

export interface MysticalProfileContextValue {
  profile: ComprehensiveMysticalProfile | null
  loading: boolean
  error: string | null
  hasProfile: boolean
  isReportsStale: boolean
  refreshProfile: () => Promise<void>
}

const MysticalProfileContext = createContext<MysticalProfileContextValue | null>(null)

// In-memory cache (single source; used by provider only)
const profileCache = new Map<string, { data: ComprehensiveMysticalProfile; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function clearComprehensiveMysticalProfileCache(userId: string): void {
  profileCache.delete(userId)
}

export function MysticalProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, userProfile } = useAuth()
  const userProfileRef = useRef(userProfile)
  userProfileRef.current = userProfile

  const [profile, setProfile] = useState<ComprehensiveMysticalProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const stale = isReportsStale(userProfile)

  const applyFirestoreProfile = useCallback((userId: string, data: ComprehensiveMysticalProfile | null) => {
    if (isReportsStale(userProfileRef.current)) {
      setProfile(null)
      profileCache.delete(userId)
      clearPersistentProfileCache(userId)
      return
    }
    if (data) {
      const version = computeComprehensiveProfileVersionHash(data)
      setProfile(data)
      profileCache.set(userId, { data, timestamp: Date.now() })
      setPersistentProfile(userId, version, data)
    } else {
      setProfile(null)
    }
  }, [])

  const fetchProfile = useCallback(async (userId: string, useCache: boolean = true, background: boolean = false) => {
    try {
      if (!background) {
        setLoading(true)
        setError(null)
      }

      if (useCache) {
        const cached = profileCache.get(userId)
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          if (isReportsStale(userProfileRef.current)) {
            setProfile(null)
            profileCache.delete(userId)
            clearPersistentProfileCache(userId)
          } else {
            setProfile(cached.data)
          }
          if (!background) setLoading(false)
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
        if (isReportsStale(userProfileRef.current)) {
          setProfile(null)
          profileCache.delete(userId)
          clearPersistentProfileCache(userId)
        } else {
          applyFirestoreProfile(userId, data)
          if (process.env.NODE_ENV === 'development') {
            console.debug('✅ Comprehensive mystical profile loaded', {
              systems: data.metadata?.systemsUsed?.length || 0,
              hasInterpretations: !!data.interpretations,
              generatedAt: data.metadata?.generatedAt
            })
          }
        }
      } else {
        setProfile(null)
        clearPersistentProfileCache(userId)
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
      if (!background) setLoading(false)
    }
  }, [applyFirestoreProfile])

  const refreshProfile = useCallback(async () => {
    if (user?.uid) {
      await fetchProfile(user.uid, false, false)
    }
  }, [user?.uid, fetchProfile])

  useEffect(() => {
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

    const uid = user.uid
    if (stale) {
      setProfile(null)
      profileCache.delete(uid)
      clearPersistentProfileCache(uid)
      setLoading(false)
      return
    }

    const persistent = getPersistentProfile(uid)
    const hadPersistentCache = !!(persistent?.profile)
    if (hadPersistentCache) {
      setProfile(persistent!.profile as ComprehensiveMysticalProfile)
      setLoading(false)
    }

    fetchProfile(uid, true, hadPersistentCache)

    const db = getFirebaseDB()
    if (!db) return

    const profileRef = doc(db, 'comprehensiveMysticalProfiles', uid)
    let unsubscribe: (() => void) | null = null

    try {
      unsubscribe = onSnapshot(
        profileRef,
        (snapshot) => {
          if (typeof window !== 'undefined' && sessionStorage.getItem('signing_out') === 'true') {
            return
          }
          if (isReportsStale(userProfileRef.current)) {
            setProfile(null)
            profileCache.delete(uid)
            clearPersistentProfileCache(uid)
            return
          }
          if (snapshot.exists()) {
            const data = snapshot.data() as ComprehensiveMysticalProfile
            applyFirestoreProfile(uid, data)
            if (process.env.NODE_ENV === 'development') {
              console.debug('🔄 Comprehensive mystical profile updated via real-time listener')
            }
          } else {
            setProfile(null)
            clearPersistentProfileCache(uid)
          }
        },
        (err) => {
          const errorMessage = err?.message || ''
          if (errorMessage.includes('INTERNAL ASSERTION FAILED') || errorMessage.includes('Unexpected state')) {
            console.warn('⚠️ Firestore listener error detected, will reload page')
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
      if (unsubscribe) {
        try {
          unsubscribe()
        } catch {
          // ignore
        }
      }
    }
  }, [user?.uid, userProfile, stale, fetchProfile, applyFirestoreProfile])

  useEffect(() => {
    if (typeof window === 'undefined' || !user?.uid) return
    const handler = () => refreshProfile()
    window.addEventListener('futureSeer:profileRegenerated', handler)
    return () => window.removeEventListener('futureSeer:profileRegenerated', handler)
  }, [user?.uid, refreshProfile])

  const value: MysticalProfileContextValue = {
    profile,
    loading,
    error,
    hasProfile: !!profile && !!profile.vedic && !!profile.interpretations,
    isReportsStale: stale,
    refreshProfile
  }

  return (
    <MysticalProfileContext.Provider value={value}>
      {children}
    </MysticalProfileContext.Provider>
  )
}

export function useMysticalProfileContext(): MysticalProfileContextValue {
  const ctx = useContext(MysticalProfileContext)
  if (ctx == null) {
    throw new Error('useMysticalProfileContext must be used within MysticalProfileProvider')
  }
  return ctx
}
