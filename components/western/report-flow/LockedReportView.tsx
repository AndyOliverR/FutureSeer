'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'

interface LockedReportViewProps {
  children: ReactNode
  onUnlockClick: () => void
  onContinueWithoutSharing: () => void
  delaySeconds?: number
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
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl bg-slate-950/75 px-4 py-10 backdrop-blur-[2px]">
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
            className="border-slate-500 text-white hover:bg-white/10"
          >
            Continue without sharing
          </Button>
        </div>
      </div>
    </div>
  )
}
