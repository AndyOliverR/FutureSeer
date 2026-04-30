'use client'

import { useMysticalProfileContext } from '@/contexts/MysticalProfileContext'
import { classifyToolReportState } from '@/lib/profileGenerationOrchestrator'
import type { PersistedToolStatus } from '@/lib/mysticalStageB'

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
  const toolStatusMap = (p != null ? (p.toolStatus as Record<string, PersistedToolStatus> | undefined) : undefined) ?? {}
  const persistedStatus = toolStatusMap[toolSlug]
  const reportState = classifyToolReportState(report)
  const state = persistedStatus?.state ?? reportState
  const updatedAt = persistedStatus?.updatedAt ?? persistedStatus?.generatedAt
  const generatedAt = persistedStatus?.generatedAt
  return {
    report: report ?? undefined,
    loading,
    error,
    hasReport: report !== undefined && report !== null && state === 'ready',
    reportState,
    reportStatus: persistedStatus,
    reportStateResolved: state,
    reportUpdatedAt: updatedAt,
    reportGeneratedAt: generatedAt,
    reportUnchanged: persistedStatus?.unchanged === true,
    isReportsStale,
    refreshProfile
  }
}
