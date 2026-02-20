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
  const p = profile as Record<string, unknown> | null
  // Resolve from both shapes: top-level (e.g. profile.western) or toolReports[slug].data
  const toolReports = p != null ? (p.toolReports as Record<string, { data?: unknown }> | undefined) : undefined
  const report =
    p != null && toolSlug
      ? (p[toolSlug] ??
         (toolSlug === 'energyHealing' ? p['Energy & Healing'] : undefined) ??
         toolReports?.[toolSlug]?.data)
      : undefined
  return {
    report: report ?? undefined,
    loading,
    error,
    hasReport: report !== undefined && report !== null,
    isReportsStale,
    refreshProfile
  }
}
