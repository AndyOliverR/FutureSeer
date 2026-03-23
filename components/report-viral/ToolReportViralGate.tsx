'use client'

import { ReactNode, useState, useCallback } from 'react'
import { TeaserView } from '@/components/report-viral/TeaserView'
import { LockedReportView } from '@/components/report-viral/LockedReportView'
import { FullReportView } from '@/components/report-viral/FullReportView'
import { ShareCard } from '@/components/report-viral/ShareCard'
import type { ToolTeaserPayload } from '@/lib/report-viral/types'
import { useToolReportUnlock } from '@/hooks/useToolReportUnlock'
import { toolPathForSlug } from '@/lib/report-viral/toolSlugToPath'
import { analytics } from '@/lib/analytics'
import Link from 'next/link'
import { Users } from 'lucide-react'

interface ToolReportViralGateProps {
  toolSlug: string
  /** Defaults from toolSlugToPath */
  toolPath?: string
  teaser: ToolTeaserPayload
  bypassViralRestrictions?: boolean
  /** Western page strips bonus sections on lite; other tools omit visual lite styling */
  applyLiteVisualStyling?: boolean
  renderReport: (opts: { lite: boolean }) => ReactNode
}

export function ToolReportViralGate({
  toolSlug,
  toolPath,
  teaser,
  bypassViralRestrictions = false,
  applyLiteVisualStyling = false,
  renderReport,
}: ToolReportViralGateProps) {
  const { hydrated, tier, isUnlocked, isFullUnlock, shareUrl, unlockFull, unlockLite } =
    useToolReportUnlock(toolSlug)
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
          title: 'FutureSeer — my reading',
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

  const compareHref = `/tools/${toolPath ?? toolPathForSlug(toolSlug)}?friend=compare&ref=share`

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
        <FullReportView unlockTier={effectiveTier} applyLiteVisualStyling={applyLiteVisualStyling}>
          {renderReport({ lite })}
        </FullReportView>
      )}

      {waitingLite && (
        <p className="text-center text-sm text-amber-200/90">Unlocking lighter view in a few seconds…</p>
      )}

      {isUnlocked && (
        <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-center">
          <Link
            href={compareHref}
            className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-950/40 px-4 py-2 text-sm font-medium text-violet-100 hover:bg-violet-900/50"
          >
            <Users className="h-4 w-4" />
            Compare with a friend
          </Link>
          <Link
            href="/subscribe"
            className="text-center text-sm font-medium text-amber-200/90 underline underline-offset-2 hover:text-amber-100"
            onClick={() =>
              analytics.trackPricingView('subscribe_from_viral_gate_footer', { surface: 'tool_report_viral_gate' })
            }
          >
            Coffee, Treat, or Hamper — upgrade for full access everywhere
          </Link>
        </div>
      )}
    </div>
  )
}
