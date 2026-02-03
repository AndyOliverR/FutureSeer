'use client'

import { useState, useEffect, useCallback } from 'react'
import { getFirebaseDB } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import type { ComprehensiveMysticalProfile } from '@/hooks/useComprehensiveMysticalProfile'

export interface MergedDashboardProfile extends ComprehensiveMysticalProfile {
  western?: any
  westernAstrology?: any
  tarot?: any
  numerology?: any
}

/**
 * Fetches Western, Tarot, and Astro-Numerology caches from Firestore and merges
 * them with the base comprehensive profile so the dashboard extractor can show
 * snippets for all tools the user has used.
 */
export function useDashboardProfile(
  userId: string | undefined,
  baseProfile: ComprehensiveMysticalProfile | null
): MergedDashboardProfile | null {
  const [mergedProfile, setMergedProfile] = useState<MergedDashboardProfile | null>(baseProfile)

  const fetchAndMerge = useCallback(async (uid: string, base: ComprehensiveMysticalProfile | null) => {
    const db = getFirebaseDB()
    if (!db) {
      setMergedProfile(base)
      return
    }

    const merged: MergedDashboardProfile = base ? { ...base } : ({} as MergedDashboardProfile)

    try {
      const [westernSnap, tarotSnap, numerologySnap] = await Promise.all([
        getDoc(doc(db, 'users', uid, 'westernAstrologyReports', 'comprehensive')),
        getDoc(doc(db, 'users', uid, 'combinedSystemReports', 'current')),
        getDoc(doc(db, 'users', uid, 'astroNumerologyReports', 'current'))
      ])

      if (westernSnap.exists()) {
        const westernData = westernSnap.data()
        const data = westernData?.data ?? westernData
        if (data?.comprehensiveAnalysis) {
          merged.western = { comprehensiveAnalysis: data.comprehensiveAnalysis }
          merged.westernAstrology = merged.western
        }
      }

      if (tarotSnap.exists()) {
        const tarotData = tarotSnap.data()
        const data = tarotData?.data ?? tarotData
        if (data?.tarotProfile || data?.holisticAnalysis) {
          merged.tarot = {
            birthCard: data.tarotProfile?.birthCard ?? data.birthCard,
            profile: data.tarotProfile ? { birthCard: data.tarotProfile.birthCard } : undefined,
            holisticAnalysis: data.holisticAnalysis
          }
        }
      }

      if (numerologySnap.exists()) {
        const numData = numerologySnap.data()
        const data = numData?.data ?? numData
        if (data?.lifePathNumber != null || data?.comprehensiveAnalysis) {
          merged.numerology = {
            lifePathNumber: data.lifePathNumber,
            lifePath: data.lifePathNumber,
            personalYearNumber: data.personalYearNumber,
            nameNumber: data.nameNumber,
            comprehensiveAnalysis: data.comprehensiveAnalysis
          }
        }
      }

      setMergedProfile(merged)
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Dashboard profile merge failed:', err)
      }
      setMergedProfile(base)
    }
  }, [])

  useEffect(() => {
    if (!userId) {
      setMergedProfile(baseProfile)
      return
    }
    fetchAndMerge(userId, baseProfile)
  }, [userId, baseProfile, fetchAndMerge])

  return mergedProfile
}
