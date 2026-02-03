"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useAuth } from "@/hooks/use-auth"
import { baziIntelligence, BaziReading } from "@/lib/baziIntelligence"

/**
 * Custom hook for BaZi (Four Pillars of Destiny) reading management
 * Handles loading, caching, and regeneration of BaZi readings
 */
export function useBaZi() {
  const { user, userProfile } = useAuth()
  const [reading, setReading] = useState<BaziReading | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false)
  
  // Request deduplication ref
  const loadingRequestRef = useRef<Promise<BaziReading> | null>(null)

  // Memoize profile completeness check
  const hasCompleteProfile = useMemo(() => {
    return !!(userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace)
  }, [userProfile?.birthDate, userProfile?.birthTime, userProfile?.birthPlace])

  // Memoized load function with request deduplication
  const loadBaziReading = useCallback(async () => {
    if (!user?.uid || !userProfile) {
      setError('User profile required')
      return
    }

    if (!hasCompleteProfile) {
      setError('Complete birth information (date, time, place) required for BaZi analysis')
      return
    }

    // Prevent duplicate requests
    if (loadingRequestRef.current) {
      return
    }

    setIsLoading(true)
    setError(null)
    setHasAutoLoaded(true)

    try {
      // Store the promise to prevent duplicate requests
      loadingRequestRef.current = baziIntelligence.getBaziReading(user.uid, userProfile)
      const baziReading = await loadingRequestRef.current
      setReading(baziReading)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate BaZi reading'
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading BaZi reading:', err)
      }
      setError(errorMessage)
    } finally {
      setIsLoading(false)
      loadingRequestRef.current = null
    }
  }, [user?.uid, userProfile, hasCompleteProfile])

  // Memoized regenerate function
  const regenerateReading = useCallback(async () => {
    if (!user?.uid || !userProfile) return
    
    // Prevent duplicate requests
    if (loadingRequestRef.current) {
      return
    }
    
    setIsLoading(true)
    setError(null)

    try {
      // Force regeneration by clearing cache temporarily
      loadingRequestRef.current = baziIntelligence.getBaziReading(user.uid, userProfile)
      const baziReading = await loadingRequestRef.current
      setReading(baziReading)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to regenerate BaZi reading'
      if (process.env.NODE_ENV === 'development') {
        console.error('Error regenerating BaZi reading:', err)
      }
      setError(errorMessage)
    } finally {
      setIsLoading(false)
      loadingRequestRef.current = null
    }
  }, [user?.uid, userProfile])

  // Auto-load BaZi reading on mount if profile is complete (optimized dependencies)
  useEffect(() => {
    if (user?.uid && hasCompleteProfile && !reading && !isLoading && !hasAutoLoaded) {
      loadBaziReading()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, hasCompleteProfile])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      loadingRequestRef.current = null
    }
  }, [])

  return {
    reading,
    isLoading,
    error,
    hasCompleteProfile,
    loadBaziReading,
    regenerateReading,
    userProfile
  }
}
