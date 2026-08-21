/**
 * Collapse restated LLM lead copy so a stored report does not print the same
 * paragraph as executive_summary, overview, and keyInsights.
 */
function normalizeProse(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

function similar(a: string, b: string): boolean {
  const left = normalizeProse(a)
  const right = normalizeProse(b)
  if (!left || !right) return false
  if (left === right) return true
  const shorter = left.length <= right.length ? left : right
  const longer = left.length <= right.length ? right : left
  return shorter.length >= 40 && longer.includes(shorter.slice(0, Math.min(80, shorter.length)))
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return undefined
}

export function collapseDuplicateReportFields(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...data }
  const analysis =
    next.comprehensiveAnalysis && typeof next.comprehensiveAnalysis === 'object' && !Array.isArray(next.comprehensiveAnalysis)
      ? { ...(next.comprehensiveAnalysis as Record<string, unknown>) }
      : null

  const lead = firstString(
    next.executive_summary,
    next.executiveSummary,
    next.overview,
    next.reading,
    analysis?.executive_summary,
    analysis?.executiveSummary,
    analysis?.overview,
    analysis?.chartOverview,
  )

  const hasExecutive = Boolean(
    firstString(next.executive_summary, next.executiveSummary, analysis?.executive_summary, analysis?.executiveSummary),
  )

  const dropIfDup = (obj: Record<string, unknown>, key: string) => {
    if (key === 'executive_summary' || key === 'executiveSummary') return
    if (!hasExecutive && (key === 'overview' || key === 'chartOverview' || key === 'reading')) return
    const val = obj[key]
    if (typeof val === 'string' && lead && similar(lead, val)) {
      delete obj[key]
    }
  }

  if (lead) {
    dropIfDup(next, 'overview')
    dropIfDup(next, 'chartOverview')
    if (Array.isArray(next.keyInsights)) {
      next.keyInsights = (next.keyInsights as unknown[]).filter((item) => {
        const text = typeof item === 'string' ? item : (item as { text?: string; description?: string })?.text ?? (item as { description?: string })?.description
        return typeof text !== 'string' || !similar(lead, text)
      })
      if ((next.keyInsights as unknown[]).length === 0) delete next.keyInsights
    }
    if (analysis) {
      dropIfDup(analysis, 'overview')
      dropIfDup(analysis, 'chartOverview')
      next.comprehensiveAnalysis = analysis
    }
  }

  return next
}
