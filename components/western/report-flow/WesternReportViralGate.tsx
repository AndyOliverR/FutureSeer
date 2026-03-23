'use client'

import { ReactNode, useState, useCallback } from 'react'
import { TeaserView } from '@/components/western/report-flow/TeaserView'
import { LockedReportView } from '@/components/western/report-flow/LockedReportView'
import { FullReportView } from '@/components/western/report-flow/FullReportView'
import { ShareCard } from '@/components/western/report-flow/ShareCard'
import type { WesternTeaserPayload } from '@/lib/western/buildWesternTeaser'
import type { UnlockTier } from '@/hooks/useWesternReportUnlock'
import Link from 'next/link'
import { Users } from 'lucide-react'

interface WesternReportViralGateProps {
  teaser: WesternTeaserPayload
  hydrated: boolean
  tier: UnlockTier
  isUnlocked: boolean
  isFullUnlock: boolean
  shareUrl: string
  unlockFull: () => void
  unlockLite: () => void
  /** Admins / special users: full report with no teaser, lock, or share flow */
  bypassViralRestrictions?: boolean
  /** Locked blur shows full tease; lite omits bonus blocks when unlocked */
  renderReport: (opts: { lite: boolean }) => ReactNode
}

export function WesternReportViralGate({
  teaser,
  hydrated,
  tier,
  isUnlocked,
  isFullUnlock,
  shareUrl,
  unlockFull,
  unlockLite,
  bypassViralRestrictions = false,
  renderReport,
}: WesternReportViralGateProps) {
  const [showShareCard, setShowShareCard] = useState(false)
  const [waitingLite, setWaitingLite] = useState(false)

  const handleShareToUnlock = useCallback(() => {
    setShowShareCard(true)
  }, [])

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
      /* ignore */
    }
    unlockFull()
    setShowShareCard(false)
  }, [shareUrl, unlockFull])

  const nativeShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'FutureSeer — my chart',
          text: `${teaser.archetypeName}: ${teaser.hookLine.slice(0, 120)}…`,
          url: shareUrl,
        })
        unlockFull()
        setShowShareCard(false)
        return
      } catch {
        /* cancelled */
      }
    }
    await copyLink()
  }, [copyLink, shareUrl, teaser.archetypeName, teaser.hookLine, unlockFull])

  const continueWithoutSharing = useCallback(() => {
    setWaitingLite(true)
    window.setTimeout(() => {
      unlockLite()
      setWaitingLite(false)
    }, 4000)
  }, [unlockLite])

  const effectiveTier: 'lite' | 'full' = isFullUnlock ? 'full' : tier === 'lite' ? 'lite' : 'full'
  const lite = isUnlocked && effectiveTier === 'lite'

  if (bypassViralRestrictions) {
    return <div className="space-y-6">{renderReport({ lite: false })}</div>
  }

  return (
    <div className="space-y-6">
      <TeaserView teaser={teaser} />

      {showShareCard && (
        <ShareCard
          archetypeName={teaser.archetypeName}
          hookLine={teaser.hookLine}
          shareUrl={shareUrl}
          onCopy={copyLink}
          onShare={nativeShare}
        />
      )}

      {!hydrated ? (
        <div className="py-12 text-center text-slate-400">Loading report…</div>
      ) : !isUnlocked ? (
        <LockedReportView
          onUnlockClick={handleShareToUnlock}
          onContinueWithoutSharing={waitingLite ? () => {} : continueWithoutSharing}
        >
          {renderReport({ lite: false })}
        </LockedReportView>
      ) : (
        <FullReportView unlockTier={effectiveTier}>{renderReport({ lite })}</FullReportView>
      )}

      {waitingLite && (
        <p className="text-center text-sm text-amber-200/90">Unlocking lighter view in a few seconds…</p>
      )}

      {isUnlocked && (
        <div className="flex justify-center pt-2">
          <Link
            href="/tools/western-astrology?friend=compare&ref=share"
            className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-950/40 px-4 py-2 text-sm font-medium text-violet-100 hover:bg-violet-900/50"
          >
            <Users className="h-4 w-4" />
            Compare with a friend
          </Link>
        </div>
      )}
    </div>
  )
}
