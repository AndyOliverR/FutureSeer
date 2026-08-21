'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useToolReport } from '@/hooks/useComprehensiveMysticalProfile'
import { fetchWithFirebaseAuthRequired } from '@/lib/clientFirebaseFetch'
import { classifyToolReportState } from '@/lib/toolReportReadiness'

/**
 * When the profile is committed but this tool has no report yet, generate it on visit.
 */
export function useEnsureToolReport(toolSlug: string | null) {
  const { user, userProfile } = useAuth()
  const { hasReport, loading, refreshProfile, report, reportState } = useToolReport(toolSlug ?? '')
  const [ensuring, setEnsuring] = useState(false)
  const [ensureError, setEnsureError] = useState<string | null>(null)
  const startedRef = useRef<string | null>(null)
  const [retryNonce, setRetryNonce] = useState(0)

  useEffect(() => {
    if (!toolSlug || !user || loading) return
    if (userProfile?.mysticalProfileGenerated !== true) return
    if (hasReport) return
    const state = report ? classifyToolReportState(report, toolSlug) : reportState
    if (state === 'placeholder') return
    if (startedRef.current === toolSlug) return

    startedRef.current = toolSlug
    let cancelled = false
    setEnsuring(true)
    setEnsureError(null)

    void (async () => {
      try {
        const res = await fetchWithFirebaseAuthRequired('/api/profile/ensure-tool-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toolSlug }),
        })
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        if (!res.ok) {
          throw new Error(data.error || 'Could not generate this reading.')
        }
        if (!cancelled) {
          await refreshProfile()
        }
      } catch (err) {
        if (!cancelled) {
          startedRef.current = null
          setEnsureError(err instanceof Error ? err.message : 'Could not generate this reading.')
        }
      } finally {
        if (!cancelled) setEnsuring(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [toolSlug, user, userProfile?.mysticalProfileGenerated, hasReport, loading, report, reportState, refreshProfile, retryNonce])

  const retryEnsure = () => {
    startedRef.current = null
    setEnsureError(null)
    setRetryNonce((n) => n + 1)
  }

  const ensureWithExtras = async (extraInputs: Record<string, unknown>) => {
    if (!toolSlug) return
    setEnsuring(true)
    setEnsureError(null)
    try {
      const res = await fetchWithFirebaseAuthRequired('/api/profile/ensure-tool-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolSlug, extraInputs }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        throw new Error(data.error || 'Could not generate this reading.')
      }
      await refreshProfile()
    } catch (err) {
      setEnsureError(err instanceof Error ? err.message : 'Could not generate this reading.')
      throw err
    } finally {
      setEnsuring(false)
    }
  }

  return {
    ensuring,
    ensureError,
    hasReport,
    loading: loading || ensuring,
    retryEnsure,
    ensureWithExtras,
  }
}

