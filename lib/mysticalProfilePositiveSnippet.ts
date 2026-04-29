import { buildToolTeaser } from '@/lib/report-viral/buildToolTeaser'
import type { ToolTeaserPayload } from '@/lib/report-viral/types'
import { classifyToolReportState } from '@/lib/profileGenerationOrchestrator'

const MAX_LINE = 180
const MAX_POSITIVE_LINES = 4

function isPositiveKey(key: string): boolean {
  if (/(challenge|weakness|vulnerab|negative|caution|warning|obstacle|threat|loss|debt|lesson|problem|issue|risk|fear|anxiety)/i.test(key)) {
    return false
  }
  return /strength|blessing|gift|talent|fortune|favorable|highlight|success|divine|spiritual|soul|evolution|harmony|abundance|prosper|gifted|virtue|blessed/i.test(key)
}

function pushLine(acc: string[], s: string): void {
  const t = s.trim()
  if (t.length < 14) return
  if (acc.some((x) => x === t || x.includes(t) || t.includes(x))) return
  acc.push(t.length > MAX_LINE ? `${t.slice(0, MAX_LINE - 1)}…` : t)
}

function walkForPositiveLines(value: unknown, depth: number, acc: string[]): void {
  if (depth > 6 || acc.length >= MAX_POSITIVE_LINES) return
  if (value == null) return
  if (typeof value === 'string') return

  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === 'string') pushLine(acc, item)
      else walkForPositiveLines(item, depth + 1, acc)
      if (acc.length >= MAX_POSITIVE_LINES) return
    }
    return
  }

  if (typeof value !== 'object') return
  const obj = value as Record<string, unknown>
  for (const [k, v] of Object.entries(obj)) {
    if (acc.length >= MAX_POSITIVE_LINES) return
    if (isPositiveKey(k)) {
      if (typeof v === 'string') pushLine(acc, v)
      else if (Array.isArray(v)) {
        for (const item of v) {
          if (typeof item === 'string') pushLine(acc, item)
          if (acc.length >= MAX_POSITIVE_LINES) break
        }
      } else if (v && typeof v === 'object') {
        const o = v as Record<string, unknown>
        if (typeof o.overview === 'string') pushLine(acc, o.overview)
        if (typeof o.summary === 'string') pushLine(acc, o.summary)
        walkForPositiveLines(v, depth + 1, acc)
      }
    }
  }

  if (depth < 5 && acc.length < MAX_POSITIVE_LINES) {
    for (const v of Object.values(obj)) {
      walkForPositiveLines(v, depth + 1, acc)
      if (acc.length >= MAX_POSITIVE_LINES) return
    }
  }
}

/**
 * Pull 1–2 uplifting lines from arbitrary report JSON when present.
 */
export function extractPositiveSnippetLines(report: unknown): string[] {
  if (report == null || typeof report !== 'object') return []
  const acc: string[] = []
  walkForPositiveLines(report, 0, acc)
  return acc.slice(0, 2)
}

export function isPlaceholderReport(report: unknown): boolean {
  if (report == null || typeof report !== 'object') return false
  return (report as { placeholder?: boolean }).placeholder === true
}

export function isFailedToolEnvelope(report: unknown): boolean {
  if (report == null || typeof report !== 'object') return false
  const r = report as { status?: string; error?: string }
  return r.status === 'failed' && typeof r.error === 'string'
}

/** Same resolution as useToolReport (top-level pipeline keys). */
export function resolveToolReportFromProfile(
  profile: Record<string, unknown> | null,
  toolSlug: string
): unknown {
  if (!profile || !toolSlug) return undefined
  const toolReports = profile.toolReports as Record<string, { data?: unknown }> | undefined
  return (
    profile[toolSlug] ??
    (toolSlug === 'energyHealing' ? profile['Energy & Healing'] : undefined) ??
    toolReports?.[toolSlug]?.data
  )
}

export function isUsableStoredReport(report: unknown): boolean {
  return classifyToolReportState(report) === 'ready'
}

export interface MysticalCardSnippet {
  primaryLine: string
  secondaryLine: string
  teaser: ToolTeaserPayload
}

export function buildMysticalCardSnippet(toolSlug: string, report: unknown): MysticalCardSnippet {
  const teaser = buildToolTeaser(toolSlug, report)
  const positive = extractPositiveSnippetLines(report)
  const primaryLine = positive[0] ?? teaser.hookLine
  const secondaryLine = positive[1] ?? teaser.subLine
  return { primaryLine, secondaryLine, teaser }
}
