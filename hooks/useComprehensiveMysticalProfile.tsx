'use client'

import { useMysticalProfileContext } from '@/contexts/MysticalProfileContext'

export type { ComprehensiveMysticalProfile } from '@/contexts/MysticalProfileContext'
export { clearComprehensiveMysticalProfileCache } from '@/contexts/MysticalProfileContext'
export { clearPersistentProfileCache } from '@/lib/comprehensiveProfileCache'

export function useComprehensiveMysticalProfile() {
  return useMysticalProfileContext()
}

export function useToolReport(toolSlug: string) {
  const { profile, loading, error, isReportsStale, refreshProfile } = useMysticalProfileContext()
  const report = profile != null && toolSlug ? (profile as Record<string, unknown>)[toolSlug] : undefined
  return {
    report: report ?? undefined,
    loading,
    error,
    hasReport: report !== undefined && report !== null,
    isReportsStale,
    refreshProfile
  }
}
