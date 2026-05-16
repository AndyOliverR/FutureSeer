'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { getFirebaseDB, isReportsStale } from '@/lib/firebase'
import { logClientError } from '@/lib/errorLogging'
import { logUserPain } from '@/lib/painLogging'
import { doc, getDoc, getDocFromServer, onSnapshot } from 'firebase/firestore'
import {
  getPersistentProfile,
  setPersistentProfile,
  clearPersistentProfileCache,
  computeComprehensiveProfileVersionHash
} from '@/lib/comprehensiveProfileCache'

export interface ComprehensiveMysticalProfile {
  vedic: {
    ascendant: number
    planets: Array<Record<string, unknown>>
    houses: Array<Record<string, unknown>>
    nakshatras: Array<Record<string, unknown>>
    yogas: Array<Record<string, unknown>>
    dasha: Array<Record<string, unknown>>
    currentDasha: { planet?: string; startDate?: string; endDate?: string } & Record<string, unknown>
    vedicCharts?: Record<string, unknown>
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
      current: Record<string, unknown>
      upcoming: Array<Record<string, unknown>>
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
    /** Set at generation when NEXT_PUBLIC_MYSTICAL_PIPELINE_RELEASE is configured; used for refresh nudges. */
    pipelineRelease?: string
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
  /** True when user has a selected plan (or no-charge); when false, full profile/tools view should show a plan selection CTA. */
  canViewFullProfile: boolean
  isReportsStale: boolean
  refreshProfile: () => Promise<void>
  /** Apply comprehensive profile from generate-mystical API response so UI shows new data without relying on a follow-up Firestore read (which may fail and fall back to stale cache). */
  applyGeneratedProfile: (data: ComprehensiveMysticalProfile) => void
}

const MysticalProfileContext = createContext<MysticalProfileContextValue | null>(null)

// In-memory cache (single source; used by provider only)
const profileCache = new Map<string, { data: ComprehensiveMysticalProfile; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const COMPREHENSIVE_PROFILE_READ_TIMEOUT_MS = 15_000
const WARN_THROTTLE_MS = 30_000

async function firestoreReadWithTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('COMPREHENSIVE_PROFILE_READ_TIMEOUT')), ms)
    promise
      .then((v) => {
        clearTimeout(t)
        resolve(v)
      })
      .catch((e) => {
        clearTimeout(t)
        reject(e)
      })
  })
}

export function clearComprehensiveMysticalProfileCache(userId: string): void {
  profileCache.delete(userId)
}

export function MysticalProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, userProfile } = useAuth()
  const pathname = usePathname()
  const userProfileRef = useRef(userProfile)
  userProfileRef.current = userProfile
  const lastAppliedGeneratedAtRef = useRef<string | null>(null)
  const profileUserIdRef = useRef<string | null>(null)
  const noProfileLoggedForUserRef = useRef<string | null>(null)
  const lastWarnAtRef = useRef<Record<string, number>>({})

  const [profile, setProfile] = useState<ComprehensiveMysticalProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const stale = isReportsStale(userProfile)
  const warnThrottled = useCallback((key: string, message: string, payload?: unknown) => {
    if (process.env.NODE_ENV !== 'development') return
    const now = Date.now()
    const last = lastWarnAtRef.current[key] ?? 0
    if (now - last < WARN_THROTTLE_MS) return
    lastWarnAtRef.current[key] = now
    if (payload !== undefined) {
      console.warn(message, payload)
      return
    }
    console.warn(message)
  }, [])

  const applyFirestoreProfile = useCallback((userId: string, data: ComprehensiveMysticalProfile | null) => {
    // Always apply incoming server data so that real-time updates (e.g. after generate-mystical)
    // are shown immediately. isReportsStale is used for cache and UI only; do not discard
    // server-written data here, or the client may clear the profile before the user doc
    // (profileDataHash) has refreshed and the report would never appear.
    profileUserIdRef.current = userId
    if (data) {
      const at = data.metadata?.generatedAt
      if (at) lastAppliedGeneratedAtRef.current = at
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
            const incomingAt = cached.data.metadata?.generatedAt
            const lastAt = lastAppliedGeneratedAtRef.current
            if (!(incomingAt && lastAt && new Date(incomingAt).getTime() <= new Date(lastAt).getTime())) {
              setProfile(cached.data)
            }
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
      let profileSnap
      if (useCache || background) {
        profileSnap = await firestoreReadWithTimeout(
          getDoc(profileRef),
          COMPREHENSIVE_PROFILE_READ_TIMEOUT_MS
        )
      } else {
        try {
          profileSnap = await firestoreReadWithTimeout(
            getDocFromServer(profileRef),
            COMPREHENSIVE_PROFILE_READ_TIMEOUT_MS
          )
        } catch (serverErr) {
          // Server read can transiently fail even for valid owners (token refresh race / offline / SDK quirks).
          // Treat permission-denied in this path as non-fatal and fall back to cache/listener.
          const serverErrMessage =
            serverErr instanceof Error ? serverErr.message : String(serverErr ?? '')
          const isTransientServerReadPermissionIssue =
            serverErrMessage.includes('permission-denied') ||
            serverErrMessage.includes('Missing or insufficient permissions') ||
            serverErrMessage.toLowerCase().includes('insufficient permissions')
          if (isTransientServerReadPermissionIssue) {
            warnThrottled(
              'server_read_permission_transient',
              '⚠️ Server read permission transient, falling back to cache/listener:',
              serverErrMessage
            )
          } else {
            warnThrottled('server_read_failed', '⚠️ Server read failed, using cache:', serverErr)
          }
          profileSnap = await firestoreReadWithTimeout(
            getDoc(profileRef),
            COMPREHENSIVE_PROFILE_READ_TIMEOUT_MS
          )
        }
      }

      if (profileSnap.exists()) {
        const data = profileSnap.data() as ComprehensiveMysticalProfile
        const incomingAt = data.metadata?.generatedAt
        const lastAt = lastAppliedGeneratedAtRef.current
        if (incomingAt && lastAt && new Date(incomingAt).getTime() <= new Date(lastAt).getTime()) {
          if (!background) setLoading(false)
          return
        }
        applyFirestoreProfile(userId, data)
        setError(null)
        if (process.env.NODE_ENV === 'development') {
          console.debug('✅ Comprehensive mystical profile loaded', {
            systems: data.metadata?.systemsUsed?.length || 0,
            hasInterpretations: !!data.interpretations,
            generatedAt: data.metadata?.generatedAt
          })
        }
      } else {
        setProfile(null)
        clearPersistentProfileCache(userId)
        if (noProfileLoggedForUserRef.current !== userId) {
          if (process.env.NODE_ENV === 'development') {
            console.debug('📭 No comprehensive mystical profile found for user')
          }
          noProfileLoggedForUserRef.current = userId
          const browser = typeof navigator !== 'undefined' ? `${navigator.userAgent} | ${navigator.language || ''}` : undefined
          user?.getIdToken().then((idToken) => {
            logClientError({
              severity: 'info',
              area: 'profile',
              action: 'no_mystical_profile',
              message: 'No comprehensive mystical profile found for user',
              route: pathname || undefined,
              browser,
              meta: { hasUser: true },
              idToken,
            }).catch(() => {})
          }).catch(() => {})
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile'
      const isReadTimeout = errorMessage === 'COMPREHENSIVE_PROFILE_READ_TIMEOUT'
      const isBenignFirestoreError =
        errorMessage.includes('Target ID already exists') ||
        errorMessage.includes('Failed to get document from server') ||
        errorMessage.includes('permission-denied') ||
        errorMessage.includes('Missing or insufficient permissions') ||
        errorMessage.toLowerCase().includes('insufficient permissions')
      if (isReadTimeout) {
        warnThrottled(
          'profile_read_timeout',
          '⚠️ Comprehensive profile Firestore read exceeded timeout; trying cache/listener'
        )
      }
      if (isBenignFirestoreError) {
        warnThrottled(
          'profile_fetch_benign_error',
          '⚠️ Profile fetch hit known Firestore quirk, will use cache/listener:',
          errorMessage
        )
      } else if (isReadTimeout) {
        setError(
          'Your mystical profile is taking longer than usual to load. Check your connection; saved readings may appear shortly.'
        )
      } else {
        setError(errorMessage)
        void logUserPain({
          area: 'mystical-profile',
          action: 'profile_load_failed',
          message: errorMessage,
          severity: 'error',
          user,
          route: pathname || undefined,
        })
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Error fetching comprehensive mystical profile:', err)
        }
      }
      // If we have cached data (or benign error), try cache so the report still shows. Retry getDoc
      // a few times when Firestore throws "Target ID already exists" so the report can load.
      try {
        const db = getFirebaseDB()
        if (db) {
          const profileRef = doc(db, 'comprehensiveMysticalProfiles', userId)
          const delays = [0, 300, 600]
          let cacheSnap = null
          for (const delay of delays) {
            if (delay > 0) await new Promise((r) => setTimeout(r, delay))
            try {
              cacheSnap = await firestoreReadWithTimeout(getDoc(profileRef), 8_000)
              break
            } catch (e) {
              if (delay === delays[delays.length - 1]) throw e
            }
          }
          if (cacheSnap?.exists()) {
            const data = cacheSnap.data() as ComprehensiveMysticalProfile
            const incomingAt = data.metadata?.generatedAt
            const lastAt = lastAppliedGeneratedAtRef.current
            if (!(incomingAt && lastAt && new Date(incomingAt).getTime() <= new Date(lastAt).getTime())) {
              applyFirestoreProfile(userId, data)
            }
            setError(null)
          } else if (isBenignFirestoreError) {
            setError(null)
          }
        } else if (isBenignFirestoreError) {
          setError(null)
        }
      } catch {
        // ignore
      }
    } finally {
      if (!background) setLoading(false)
    }
  }, [applyFirestoreProfile, pathname, user, warnThrottled])

  const refreshProfile = useCallback(async () => {
    if (user?.uid) {
      await fetchProfile(user.uid, false, false)
    }
  }, [user?.uid, fetchProfile])

  const applyGeneratedProfile = useCallback(
    (data: ComprehensiveMysticalProfile) => {
      if (user?.uid) {
        applyFirestoreProfile(user.uid, data)
      }
    },
    [user?.uid, applyFirestoreProfile]
  )

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('signing_out') === 'true') {
      setLoading(false)
      setProfile(null)
      profileUserIdRef.current = null
      return
    }
    if (!user?.uid) {
      setLoading(false)
      setProfile(null)
      profileUserIdRef.current = null
      return
    }

    const uid = user.uid
    // When user switched, clear profile immediately so we never show the previous user's data
    if (profileUserIdRef.current !== null && profileUserIdRef.current !== uid) {
      setProfile(null)
      setLoading(true)
      profileCache.delete(profileUserIdRef.current)
    }
    profileUserIdRef.current = uid

    // When stale, only clear in-memory cache so we refetch; keep persistent cache so the last
    // generated report still shows if the refetch fails (e.g. Firestore "Target ID already exists").
    if (stale) {
      profileCache.delete(uid)
    }

    const persistent = getPersistentProfile(uid)
    const hadPersistentCache = !!(persistent?.profile)
    if (hadPersistentCache) {
      setProfile(persistent!.profile as ComprehensiveMysticalProfile)
      setLoading(false)
    }

    fetchProfile(uid, !stale, hadPersistentCache)

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
          if (snapshot.exists()) {
            const data = snapshot.data() as ComprehensiveMysticalProfile
            const incomingAt = data.metadata?.generatedAt
            const lastAt = lastAppliedGeneratedAtRef.current
            if (incomingAt && lastAt && new Date(incomingAt).getTime() <= new Date(lastAt).getTime()) {
              return
            }
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
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ comprehensiveProfile?: ComprehensiveMysticalProfile }>).detail
      const uid = user.uid
      // When generate-mystical returns the new profile, apply it and skip refresh so we don't overwrite with stale cache.
      if (detail?.comprehensiveProfile) {
        applyFirestoreProfile(uid, detail.comprehensiveProfile)
        return
      }
      clearComprehensiveMysticalProfileCache(uid)
      clearPersistentProfileCache(uid)
      refreshProfile()
    }
    window.addEventListener('futureSeer:profileRegenerated', handler)
    return () => window.removeEventListener('futureSeer:profileRegenerated', handler)
  }, [user?.uid, refreshProfile, applyFirestoreProfile])

  useEffect(() => {
    if (typeof window === 'undefined' || !user?.uid) return
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ userId?: string }>).detail
      if (detail?.userId !== user.uid) return
      clearComprehensiveMysticalProfileCache(user.uid)
      clearPersistentProfileCache(user.uid)
      setProfile(null)
    }
    window.addEventListener('futureSeer:profileInvalidated', handler)
    return () => window.removeEventListener('futureSeer:profileInvalidated', handler)
  }, [user?.uid])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handler = (e: Event) => {
      const { toolSlug, data } = (e as CustomEvent<{ toolSlug: string; data: unknown }>).detail || {}
      if (!toolSlug || data === undefined) return
      setProfile((prev) => {
        const next = { ...(prev || ({} as ComprehensiveMysticalProfile)), [toolSlug]: data }
        return next as ComprehensiveMysticalProfile
      })
    }
    window.addEventListener('futureSeer:toolReportSaved', handler)
    return () => window.removeEventListener('futureSeer:toolReportSaved', handler)
  }, [])

  const hasToolPayload =
    !!profile &&
    Object.keys(profile).some((key) => !['metadata', 'userId', 'lastUpdated', 'toolReports'].includes(key))
  const hasProfileData = !!profile && (!!profile.vedic || hasToolPayload)
  const canViewFullProfile = Boolean(
    userProfile?.selectedPlan && String(userProfile.selectedPlan).trim().length > 0
  )

  const value: MysticalProfileContextValue = {
    profile,
    loading,
    error,
    hasProfile: hasProfileData,
    canViewFullProfile,
    isReportsStale: stale,
    refreshProfile,
    applyGeneratedProfile
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
