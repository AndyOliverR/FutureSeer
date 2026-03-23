'use client'

import { useCallback, useLayoutEffect, useMemo, useState, startTransition } from 'react'
import { useSearchParams } from 'next/navigation'

export type UnlockTier = 'none' | 'lite' | 'full'

const STORAGE_KEY = 'fs_western_report_unlock'
const LEGACY_KEY = 'report_unlocked'

function readStored(): { tier: UnlockTier; unlocked: boolean } {
  if (typeof window === 'undefined') return { tier: 'none', unlocked: false }
  try {
    if (localStorage.getItem(LEGACY_KEY) === 'true') {
      return { tier: 'full', unlocked: true }
    }
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { tier: 'none', unlocked: false }
    const j = JSON.parse(raw) as { tier?: UnlockTier; unlocked?: boolean }
    if (j.unlocked && j.tier === 'lite') return { tier: 'lite', unlocked: true }
    if (j.unlocked && j.tier === 'full') return { tier: 'full', unlocked: true }
  } catch {
    /* ignore */
  }
  return { tier: 'none', unlocked: false }
}

function writeStored(tier: UnlockTier) {
  if (typeof window === 'undefined') return
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ unlocked: true, tier, at: Date.now() })
  )
  localStorage.setItem(LEGACY_KEY, 'true')
}

export function useWesternReportUnlock() {
  const searchParams = useSearchParams()
  const [tier, setTier] = useState<UnlockTier>('none')
  const [hydrated, setHydrated] = useState(false)

  useLayoutEffect(() => {
    const ref = searchParams.get('ref')
    const viral = searchParams.get('viral')
    if (ref === 'share' || viral === '1') {
      writeStored('full')
      startTransition(() => {
        setTier('full')
        setHydrated(true)
      })
      return
    }
    const { tier: t, unlocked } = readStored()
    startTransition(() => {
      if (unlocked) {
        setTier(t === 'none' ? 'full' : t)
      }
      setHydrated(true)
    })
  }, [searchParams])

  const isUnlocked = tier === 'lite' || tier === 'full'
  const isFullUnlock = tier === 'full'
  const isLiteOnly = tier === 'lite'

  const unlockFull = useCallback(() => {
    setTier('full')
    writeStored('full')
  }, [])

  const unlockLite = useCallback(() => {
    setTier('lite')
    writeStored('lite')
  }, [])

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
