"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useToolData, saveToolData } from "@/lib/toolStorageUtils"
import type { SimplifiedKabbalisticAnalysis } from "@/lib/kabbalisticNumerologyIntelligence"

export function useKabbalisticNumerology() {
  const { user, userProfile } = useAuth()
  const [isAutoGenerating, setIsAutoGenerating] = useState(false)

  // Check if user has minimum required details (name and birth date)
  const hasRequiredDetails = userProfile?.birthDate && (userProfile?.fullName || userProfile?.displayName || user?.displayName)

  // Use localStorage-based hook to load saved data (refetch used after API save)
  const { toolData: kabbalisticData, isLoading, error, refetch } = useToolData(
    user?.uid,
    'kabbalistic-numerology',
    !!hasRequiredDetails
  )

  // Auto-generate Kabbalistic analysis when profile is complete and no data exists (via API to avoid slow client bundle + main-thread blocking)
  useEffect(() => {
    const shouldAutogen = !!hasRequiredDetails && !isLoading && !kabbalisticData && !!user?.uid && !isAutoGenerating
    if (!shouldAutogen) return

    const fullName = userProfile?.fullName || userProfile?.displayName || user?.displayName || ''
    const birthDate = userProfile?.birthDate || ''
    if (!fullName || !birthDate) return

    setIsAutoGenerating(true)
    ;(async () => {
      try {
        const res = await fetch('/api/tools/kabbalistic-numerology/analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: fullName, birthDate, userId: user?.uid }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Analysis failed')
        const result = json.data
        if (user?.uid && result) {
          saveToolData(user.uid, 'kabbalistic-numerology', result)
          refetch()
        }
      } catch (err: any) {
        console.error('Kabbalistic numerology autogen failed:', err)
      } finally {
        setIsAutoGenerating(false)
      }
    })()
  }, [hasRequiredDetails, isLoading, kabbalisticData, user?.uid, userProfile?.birthDate, userProfile?.displayName, userProfile?.fullName, user?.displayName, isAutoGenerating, refetch])

  return {
    analysis: kabbalisticData as SimplifiedKabbalisticAnalysis | null,
    isLoading: isLoading || isAutoGenerating,
    error,
    refetch,
    hasRequiredDetails: !!hasRequiredDetails
  }
} 