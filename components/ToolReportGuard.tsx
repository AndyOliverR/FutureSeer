'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { AlertTriangle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MysticalLoadingState } from '@/components/MysticalLoadingState'
import { ToolReportViralGate } from '@/components/report-viral/ToolReportViralGate'
import { buildToolTeaser } from '@/lib/report-viral/buildToolTeaser'
import { toolReportMissingBody } from '@/lib/accessGatingCopy'
import { ALL_TOOL_SLUGS, classifyToolReportState, type ReportReadinessState } from '@/lib/toolReportReadiness'
import { buildToolSlugByPath, toolSlugForPath } from '@/lib/report-viral/toolSlugToPath'
import { fsAdaptivePanel } from '@/lib/designSystemClasses'
import { useEnsureToolReport } from '@/hooks/useEnsureToolReport'
import { useAuth } from '@/hooks/use-auth'

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
  /** Pipeline / Firestore slug. Inferred from /tools/[path] when omitted. */
  toolSlug?: string
  /** When false, shows a prompt to generate profile instead of rendering children. Defaults to true for backward compatibility. */
  hasReport?: boolean
  /** Custom CTA label when error is shown (default: "Open profile") */
  errorCtaLabel?: string
  /** Custom CTA href when error is shown (default: "/profile") */
  errorCtaHref?: string
  /** Optional viral gate: teaser → lock → unlock. Children may be a function receiving `{ lite }` when viral is set. */
  viral?: ToolReportViralConfig | null
  report?: unknown
  children: React.ReactNode | ((opts: { lite: boolean }) => React.ReactNode)
}

function inferToolSlugFromPath(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean)
  const toolsIdx = parts.indexOf('tools')
  const pathSeg = toolsIdx >= 0 ? parts[toolsIdx + 1] : parts[parts.length - 1]
  if (!pathSeg) return null
  const byPath = buildToolSlugByPath(ALL_TOOL_SLUGS)
  return toolSlugForPath(pathSeg, byPath)
}

/**
 * Defensive guard: do not render tool content until profile/report loading is settled.
 * States: loading -> ensuring on visit -> error -> no report -> ready (children).
 */
export function ToolReportGuard({
  loading,
  error,
  toolLabel,
  toolSlug: toolSlugProp,
  hasReport = true,
  errorCtaLabel = 'Open profile',
  errorCtaHref = '/profile',
  viral = null,
  report,
  children,
}: ToolReportGuardProps) {
  const pathname = usePathname()
  const { userProfile } = useAuth()
  const inferredSlug = useMemo(
    () => toolSlugProp ?? viral?.toolSlug ?? inferToolSlugFromPath(pathname ?? ''),
    [toolSlugProp, viral?.toolSlug, pathname],
  )
  const { ensuring, ensureError, retryEnsure } = useEnsureToolReport(inferredSlug)
  const profileGenerated = userProfile?.mysticalProfileGenerated === true
  const reportState: ReportReadinessState = report ? classifyToolReportState(report) : 'pending'
  const shouldEnforceReportState = report !== undefined
  const combinedLoading = loading || ensuring
  const combinedError = error ?? ensureError
  const stateTitle =
    reportState === 'failed'
      ? `${toolLabel ?? 'This report'} could not be generated`
      : reportState === 'placeholder'
        ? `${toolLabel ?? 'This report'} needs one more step`
        : toolLabel
          ? `${toolLabel} is still being generated`
          : 'Your mystical reading is still being generated'
  const stateBody =
    reportState === 'failed'
      ? 'This report failed to generate. Try again, or open another tool.'
      : reportState === 'placeholder'
        ? toolLabel?.toLowerCase().includes('synastry')
          ? 'Add your partner birth date, time, and place to generate Synastry.'
          : toolLabel?.toLowerCase().includes('horary')
            ? 'Your baseline Horary guidance is ready. Complete next step by entering your question, time, and place.'
            : toolLabel?.toLowerCase().includes('vastu')
              ? 'Your baseline Vastu guidance is ready. Complete next step by adding home layout details for precision recommendations.'
          : 'A partial report is available. Complete the next step on this page.'
        : profileGenerated
          ? (toolLabel
            ? `Preparing your ${toolLabel.toLowerCase()} reading…`
            : 'Preparing this reading…')
          : toolReportMissingBody(toolLabel)
  if (combinedLoading) {
    return (
      <MysticalLoadingState
        variant="fullscreen"
        message={toolLabel ? `Loading ${toolLabel}…` : 'Preparing your reading…'}
      />
    )
  }

  if (combinedError) {
    return (
      <div className="relative min-h-screen starfield-ultra-sharp">
        <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
          <div
            className={`${fsAdaptivePanel} p-6 text-center max-w-2xl mx-auto`}
            role="alert"
          >
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" aria-hidden />
            <h3 className="text-lg font-semibold text-red-300 mb-2">
              {toolLabel ? `Error loading ${toolLabel}` : 'Error loading data'}
            </h3>
            <p className="text-red-400/90 mb-4">{combinedError}</p>
            {profileGenerated ? (
              <Button type="button" onClick={retryEnsure} className="bg-amber-500 hover:bg-amber-600 text-white">
                Try again
              </Button>
            ) : (
              <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
                <Link href={errorCtaHref}>{errorCtaLabel}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!hasReport || (shouldEnforceReportState && reportState !== 'ready')) {
    return (
      <div className="relative min-h-screen starfield-ultra-sharp">
        <div className="relative z-10 container mx-auto px-4 pt-4 pb-8">
          <div className={`${fsAdaptivePanel} p-8 text-center max-w-2xl mx-auto mt-12`}>
            <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-4" aria-hidden />
            <h3 className="text-xl font-serif font-semibold text-amber-300 mb-2">
              {stateTitle}
            </h3>
            <p className="text-slate-400 mb-6">{stateBody}</p>
            {profileGenerated && reportState !== 'placeholder' ? (
              <Button type="button" onClick={retryEnsure} className="bg-amber-500 hover:bg-amber-600 text-white">
                Generate this reading
              </Button>
            ) : (
              <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-900 font-bold">
                <Link href={errorCtaHref}>{errorCtaLabel}</Link>
              </Button>
            )}
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
