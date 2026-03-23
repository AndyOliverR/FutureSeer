'use client'

import { ReactNode } from 'react'

interface FullReportViewProps {
  children: ReactNode
  unlockTier: 'lite' | 'full'
  className?: string
}

export function FullReportView({ children, unlockTier, className = '' }: FullReportViewProps) {
  return (
    <div
      className={className}
      data-unlock-tier={unlockTier}
    >
      {unlockTier === 'lite' ? (
        <div className="space-y-6 [&_.prose]:grayscale [&_.shadow-lg]:shadow-sm [&_.rounded-2xl]:rounded-lg">
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  )
}
