'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'
import { analytics } from '@/lib/analytics'

export interface ViralLockOverlayProps {
  onUnlockClick: () => void
  onContinueWithoutSharing: () => void
  /** When true, continue button is disabled (e.g. during lite unlock delay). */
  continueDisabled?: boolean
  className?: string
  /** Link to Coffee / Treat / Hamper subscription (default: /subscribe). */
  showSubscribeCta?: boolean
  subscribeHref?: string
}

/** Reusable CTA layer for blur-lock (single Tabs tree / overlay pattern). */
export function ViralLockOverlay({
  onUnlockClick,
  onContinueWithoutSharing,
  continueDisabled = false,
  className = '',
  showSubscribeCta = true,
  subscribeHref = '/subscribe',
}: ViralLockOverlayProps) {
  return (
    <div
      className={`absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl bg-slate-950/75 px-4 py-10 backdrop-blur-[2px] ${className}`}
    >
      <Lock className="h-10 w-10 text-amber-400" aria-hidden />
      <p className="max-w-md text-center text-lg font-semibold text-white">Unlock your full report</p>
      <p className="max-w-sm text-center text-sm text-slate-300">
        Share FutureSeer to reveal every placement, aspect, and timed insight—or continue with a lighter view.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          onClick={onUnlockClick}
          className="bg-amber-500 font-semibold text-slate-900 hover:bg-amber-400"
        >
          Share to unlock
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onContinueWithoutSharing}
          disabled={continueDisabled}
          className="border-slate-500 text-white hover:bg-white/10"
        >
          Continue without sharing
        </Button>
      </div>
      {showSubscribeCta && (
        <p className="max-w-md text-center text-sm text-amber-100/95">
          Or{' '}
          <Link
            href={subscribeHref}
            className="font-semibold text-amber-300 underline underline-offset-2 hover:text-amber-200"
            onClick={() =>
              analytics.trackPricingView('subscribe_from_viral_lock', { surface: 'viral_lock_overlay' })
            }
          >
            subscribe (Coffee monthly, Treat quarterly, or Hamper yearly)
          </Link>{' '}
          for full access without sharing.
        </p>
      )}
    </div>
  )
}

interface LockedReportViewProps {
  children: ReactNode
  onUnlockClick: () => void
  onContinueWithoutSharing: () => void
}

export function LockedReportView({
  children,
  onUnlockClick,
  onContinueWithoutSharing,
}: LockedReportViewProps) {
  return (
    <div className="relative min-h-[320px] rounded-2xl">
      <div className="pointer-events-none select-none blur-sm filter transition-[filter] duration-300 [&_*]:pointer-events-none">
        {children}
      </div>
      <ViralLockOverlay onUnlockClick={onUnlockClick} onContinueWithoutSharing={onContinueWithoutSharing} />
    </div>
  )
}
