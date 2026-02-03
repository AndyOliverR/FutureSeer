/**
 * Builds per-day summary narrative from activity and Ask history for the History page.
 */

export interface ActivityItem {
  type: string
  timestamp: number
  payload?: Record<string, unknown>
}

export interface ReadingItem {
  question: string
  timestamp: number
}

export interface DaySummary {
  dateKey: string
  label: string
  summaryText: string
}

function formatDayLabel(ts: number): string {
  const d = new Date(ts)
  const today = new Date()
  const isToday = d.toDateString() === today.toDateString()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = d.toDateString() === yesterday.toDateString()
  if (isToday) return 'Today'
  if (isYesterday) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined })
}

function getActivityLabel(type: string, payload?: Record<string, unknown>): string | null {
  if (type === 'sign_in') return 'signed in'
  if (type === 'page_view' && payload?.path) {
    const path = String(payload.path)
    if (path === '/' || path === '') return 'viewed Home'
    if (path === '/dashboard') return 'viewed the Dashboard'
    if (path === '/history') return 'viewed History'
    if (path === '/ask-the-seer' || path === '/seer') return 'viewed Ask the Seer'
    if (path === '/profile') return 'viewed Profile'
    if (path === '/settings') return 'viewed Settings'
    if (path === '/tools') return 'viewed Tools'
    if (path === '/pricing') return 'viewed Pricing'
    if (path.startsWith('/tools/')) {
      const slug = path.replace('/tools/', '').replace(/\//g, '')
      const name = slug.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
      return `opened ${name}`
    }
    return `viewed ${path}`
  }
  if (type === 'tool_open' && payload?.toolSlug) {
    const slug = String(payload.toolSlug)
    const name = slug.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
    return `opened ${name}`
  }
  return null
}

function getReadingTopic(question: string): string {
  const q = question.toLowerCase()
  if (q.includes('love') || q.includes('relationship')) return 'love'
  if (q.includes('money') || q.includes('career') || q.includes('job')) return 'career'
  if (q.includes('health') || q.includes('body')) return 'health'
  if (q.includes('travel') || q.includes('journey')) return 'travel'
  return 'general'
}

export function buildHistorySummaries(
  activity: ActivityItem[],
  readings: ReadingItem[],
  options?: { maxDays?: number }
): DaySummary[] {
  const maxDays = options?.maxDays ?? 14
  const byDay: Record<string, { activities: string[]; readingTopics: string[] }> = {}

  const add = (dateKey: string, label: string, kind: 'activity' | 'topic') => {
    if (!byDay[dateKey]) byDay[dateKey] = { activities: [], readingTopics: [] }
    if (kind === 'activity' && !byDay[dateKey].activities.includes(label)) {
      byDay[dateKey].activities.push(label)
    }
    if (kind === 'topic') byDay[dateKey].readingTopics.push(label)
  }

  activity.forEach((item) => {
    const dateKey = new Date(item.timestamp).toDateString()
    const label = getActivityLabel(item.type, item.payload)
    if (label) add(dateKey, label, 'activity')
  })

  readings.forEach((item) => {
    const dateKey = new Date(item.timestamp).toDateString()
    add(dateKey, getReadingTopic(item.question), 'topic')
  })

  const sortedDays = Object.keys(byDay).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).slice(0, maxDays)

  return sortedDays.map((dateKey) => {
    const { activities, readingTopics } = byDay[dateKey]
    const ts = new Date(dateKey).getTime()
    const label = formatDayLabel(ts)
    const parts: string[] = []
    if (activities.length) parts.push(`you ${activities.join(', ')}`)
    if (readingTopics.length) {
      const unique = [...new Set(readingTopics)]
      const topicList = unique.length <= 2 ? unique.join(' and ') : `${unique.slice(0, 2).join(', ')} and more`
      parts.push(`asked the Seer ${readingTopics.length} question${readingTopics.length > 1 ? 's' : ''} about ${topicList}`)
    }
    const summaryText = parts.length ? `On ${label} ${parts.join(', and ')}.` : `On ${label} you had no recorded activity.`
    return { dateKey, label, summaryText }
  })
}

/**
 * Builds a single-sentence "last session" summary from recent activity.
 * Uses most recent items (up to maxItems) within maxAgeMs.
 */
export function buildLastSessionSummary(
  activity: ActivityItem[],
  options?: { maxItems?: number; maxAgeMs?: number }
): string {
  const maxItems = options?.maxItems ?? 10
  const maxAgeMs = options?.maxAgeMs ?? 24 * 60 * 60 * 1000
  const now = Date.now()
  const cutoff = now - maxAgeMs
  const recent = activity
    .filter((a) => a.timestamp >= cutoff)
    .slice(0, maxItems)
  const labels: string[] = []
  const seen = new Set<string>()
  for (const a of recent) {
    const label = getActivityLabel(a.type, a.payload)
    if (label && !seen.has(label)) {
      seen.add(label)
      labels.push(label)
    }
  }
  if (labels.length === 0) return ""
  if (labels.length === 1) return `You ${labels[0]}.`
  const last = labels.pop()!
  return `You ${labels.join(", ")}, and ${last}.`
}
