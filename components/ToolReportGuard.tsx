'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface ToolReportGuardProps {
  loading: boolean
  error: string | null
  toolLabel?: string
  /** Custom CTA label when error is shown (default: "Generate your mystical profile") */
  errorCtaLabel?: string
  /** Custom CTA href when error is shown (default: "/profile") */
  errorCtaHref?: string
  children: React.ReactNode
}

/**
 * Defensive guard: do not render tool content until profile/report loading is settled.
 * States: loading (full-page only) -> error (full-page only) -> ready (children).
 */
export function ToolReportGuard({ loading, error, toolLabel, errorCtaLabel = 'Generate your mystical profile', errorCtaHref = '/profile', children }: ToolReportGuardProps) {
  if (loading) {
    return (
      <div className="relative min-h-screen starfield-ultra-sharp">
        <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4" aria-hidden />
              <p className="text-slate-300">
                {toolLabel ? `Loading ${toolLabel}...` : 'Loading...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative min-h-screen starfield-ultra-sharp">
        <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
          <div className="backdrop-blur-sm bg-slate-900/50 border-amber-500/50 rounded-xl p-6 text-center max-w-2xl mx-auto">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" aria-hidden />
            <h3 className="text-lg font-semibold text-red-300 mb-2">
              {toolLabel ? `Error loading ${toolLabel}` : 'Error loading data'}
            </h3>
            <p className="text-red-400/90 mb-4">{error}</p>
            <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
              <Link href={errorCtaHref}>{errorCtaLabel}</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
