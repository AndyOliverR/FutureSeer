'use client'

import { useMemo, type ReactNode } from 'react'
import { ToolReportViralGate } from '@/components/report-viral/ToolReportViralGate'
import { buildToolTeaser } from '@/lib/report-viral/buildToolTeaser'
import { useViralReportBypass } from '@/hooks/useViralReportBypass'

type RenderReport = (opts: { lite: boolean }) => ReactNode

/**
 * Thin wrapper: buildToolTeaser + staff bypass + ToolReportViralGate.
 * Use for tool report tabs so pages stay minimal.
 */
export function ToolReportViralShell({
  toolSlug,
  reportForTeaser,
  children,
  applyLiteVisualStyling,
}: {
  toolSlug: string
  reportForTeaser: unknown
  children: ReactNode | RenderReport
  applyLiteVisualStyling?: boolean
}) {
  const bypass = useViralReportBypass()
  const teaser = useMemo(() => buildToolTeaser(toolSlug, reportForTeaser), [toolSlug, reportForTeaser])
  const renderReport: RenderReport =
    typeof children === 'function' ? (children as RenderReport) : () => children

  return (
    <ToolReportViralGate
      toolSlug={toolSlug}
      teaser={teaser}
      bypassViralRestrictions={bypass}
      applyLiteVisualStyling={applyLiteVisualStyling ?? false}
      renderReport={renderReport}
    />
  )
}
