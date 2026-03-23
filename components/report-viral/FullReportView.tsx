'use client'

import { ReactNode } from 'react'

interface FullReportViewProps {
  children: ReactNode
  unlockTier: 'lite' | 'full'
  /** When false, lite unlock does not apply grayscale wrapper (non-Western tools). */
  applyLiteVisualStyling?: boolean
  className?: string
}

export function FullReportView({
  children,
  unlockTier,
  applyLiteVisualStyling = false,
  className = '',
}: FullReportViewProps) {
  const showLiteStyle = unlockTier === 'lite' && applyLiteVisualStyling

  return (
    <div className={className} data-unlock-tier={unlockTier}>
      {showLiteStyle ? (
        <div className="space-y-6 [&_.prose]:grayscale [&_.shadow-lg]:shadow-sm [&_.rounded-2xl]:rounded-lg">
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  )
}
