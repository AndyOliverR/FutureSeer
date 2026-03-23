'use client'

import { useCallback, useLayoutEffect, useMemo, useState, startTransition } from 'react'
import { useSearchParams } from 'next/navigation'

export type UnlockTier = 'none' | 'lite' | 'full'

const LEGACY_KEY = 'report_unlocked'
const LEGACY_WESTERN_KEY = 'fs_western_report_unlock'

function storageKeyForTool(toolSlug: string): string {
  return `fs_tool_report_unlock:${toolSlug}`
}

function readStored(toolSlug: string): { tier: UnlockTier; unlocked: boolean } {
  if (typeof window === 'undefined') return { tier: 'none', unlocked: false }
  try {
    const namespaced = localStorage.getItem(storageKeyForTool(toolSlug))
    if (namespaced) {
      const j = JSON.parse(namespaced) as { tier?: UnlockTier; unlocked?: boolean }
      if (j.unlocked && j.tier === 'lite') return { tier: 'lite', unlocked: true }
      if (j.unlocked && j.tier === 'full') return { tier: 'full', unlocked: true }
    }
    if (localStorage.getItem(LEGACY_KEY) === 'true') {
      return { tier: 'full', unlocked: true }
    }
    if (toolSlug === 'western') {
      const legacy = localStorage.getItem(LEGACY_WESTERN_KEY)
      if (legacy) {
        const j = JSON.parse(legacy) as { tier?: UnlockTier; unlocked?: boolean }
        if (j.unlocked && j.tier === 'lite') return { tier: 'lite', unlocked: true }
        if (j.unlocked && j.tier === 'full') return { tier: 'full', unlocked: true }
      }
    }
  } catch {
    /* ignore */
  }
  return { tier: 'none', unlocked: false }
}

function writeStored(toolSlug: string, tier: UnlockTier) {
  if (typeof window === 'undefined') return
  localStorage.setItem(
    storageKeyForTool(toolSlug),
    JSON.stringify({ unlocked: true, tier, at: Date.now() })
  )
  localStorage.setItem(LEGACY_KEY, 'true')
  if (toolSlug === 'western') {
    localStorage.setItem(
      LEGACY_WESTERN_KEY,
      JSON.stringify({ unlocked: true, tier, at: Date.now() })
    )
  }
}

export function useToolReportUnlock(toolSlug: string) {
  const searchParams = useSearchParams()
  const [tier, setTier] = useState<UnlockTier>('none')
  const [hydrated, setHydrated] = useState(false)

  useLayoutEffect(() => {
    const ref = searchParams.get('ref')
    const viral = searchParams.get('viral')
    if (ref === 'share' || viral === '1') {
      writeStored(toolSlug, 'full')
      startTransition(() => {
        setTier('full')
        setHydrated(true)
      })
      return
    }
    const { tier: t, unlocked } = readStored(toolSlug)
    startTransition(() => {
      if (unlocked) {
        setTier(t === 'none' ? 'full' : t)
      }
      setHydrated(true)
    })
  }, [searchParams, toolSlug])

  const isUnlocked = tier === 'lite' || tier === 'full'
  const isFullUnlock = tier === 'full'
  const isLiteOnly = tier === 'lite'

  const unlockFull = useCallback(() => {
    setTier('full')
    writeStored(toolSlug, 'full')
  }, [toolSlug])

  const unlockLite = useCallback(() => {
    setTier('lite')
    writeStored(toolSlug, 'lite')
  }, [toolSlug])

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const u = new URL(window.location.href)
    u.searchParams.set('ref', 'share')
    u.searchParams.set('viral', '1')
    return u.toString()
  }, [])

  return {
    hydrated,
    tier,
    isUnlocked,
    isFullUnlock,
    isLiteOnly,
    unlockFull,
    unlockLite,
    shareUrl,
  }
}
