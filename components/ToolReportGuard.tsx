'use client'

import Link from 'next/link'
import { AlertTriangle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MysticalLoadingState } from '@/components/MysticalLoadingState'
import { ToolReportViralGate } from '@/components/report-viral/ToolReportViralGate'
import { buildToolTeaser } from '@/lib/report-viral/buildToolTeaser'
import { toolReportMissingBody } from '@/lib/accessGatingCopy'
import { classifyToolReportState, type ReportReadinessState } from '@/lib/profileGenerationOrchestrator'

export interface ToolReportViralConfig {
  toolSlug: string
  report: unknown
  bypassViralRestrictions: boolean
  /** Western report applies lite styling; most tools omit. */
  applyLiteVisualStyling?: boolean
}

export interface ToolReportGuardProps {
  loading: boolean
  error: string | null
  toolLabel?: string
  /** When false, shows a prompt to generate profile instead of rendering children. Defaults to true for backward compatibility. */
  hasReport?: boolean
  /** Custom CTA label when error is shown (default: "Generate your mystical profile") */
  errorCtaLabel?: string
  /** Custom CTA href when error is shown (default: "/profile") */
  errorCtaHref?: string
  /** Optional viral gate: teaser → lock → unlock. Children may be a function receiving `{ lite }` when viral is set. */
  viral?: ToolReportViralConfig | null
  report?: unknown
  children: React.ReactNode | ((opts: { lite: boolean }) => React.ReactNode)
}

/**
 * Defensive guard: do not render tool content until profile/report loading is settled.
 * States: loading -> error -> no report -> ready (children).
 */
export function ToolReportGuard({
  loading,
  error,
  toolLabel,
  hasReport = true,
  errorCtaLabel = 'Generate your mystical profile',
  errorCtaHref = '/profile',
  viral = null,
  report,
  children,
}: ToolReportGuardProps) {
  const reportState: ReportReadinessState = report ? classifyToolReportState(report) : 'pending'
  const shouldEnforceReportState = report !== undefined
  if (loading) {
    return (
      <MysticalLoadingState
        variant="fullscreen"
        message={toolLabel ? `Loading ${toolLabel}…` : 'Preparing your reading…'}
      />
    )
  }

  if (error) {
    return (
      <div className="relative min-h-screen starfield-ultra-sharp">
        <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
          <div
            className="backdrop-blur-sm bg-slate-900/50 border-amber-500/50 rounded-xl p-6 text-center max-w-2xl mx-auto"
            role="alert"
          >
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

  if (!hasReport || (shouldEnforceReportState && reportState !== 'ready')) {
    return (
      <div className="relative min-h-screen starfield-ultra-sharp">
        <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
          <div className="backdrop-blur-sm bg-slate-900/50 border border-amber-500/30 rounded-xl p-8 text-center max-w-2xl mx-auto mt-12">
            <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-4" aria-hidden />
            <h3 className="text-xl font-serif font-semibold text-amber-300 mb-2">
              {toolLabel ? `${toolLabel} is still being generated` : 'Your mystical reading is still being generated'}
            </h3>
            <p className="text-slate-400 mb-6">{reportState === 'failed' ? 'This report failed to generate. Retry generation from your profile.' : toolReportMissingBody(toolLabel)}</p>
            <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-900 font-bold">
              <Link href={errorCtaHref}>{errorCtaLabel}</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (viral) {
    const teaser = buildToolTeaser(viral.toolSlug, viral.report)
    return (
      <ToolReportViralGate
        toolSlug={viral.toolSlug}
        teaser={teaser}
        bypassViralRestrictions={viral.bypassViralRestrictions}
        applyLiteVisualStyling={viral.applyLiteVisualStyling ?? false}
        renderReport={({ lite }) =>
          typeof children === 'function' ? children({ lite }) : <>{children}</>
        }
      />
    )
  }

  return (
    <>
      {typeof children === 'function' ? (children as (opts: { lite: boolean }) => React.ReactNode)({ lite: false }) : children}
    </>
  )
}
