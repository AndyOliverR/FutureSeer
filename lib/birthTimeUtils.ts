/**
 * Normalize birth time for chart/API use.
 * Accepts 24h (HH:mm or HH:mm:ss) or 12h with AM/PM (e.g. "10:30 PM", "22:00 PM").
 * Mixed format like "22:00 PM" is treated as 24h (22:00), not 12h.
 * Invalid times are replaced with 12:00:00 so calculations never fail.
 * Output is always strict 24h HH:mm:ss.
 */
export function normalizeBirthTime(bt: string | null | undefined): string {
  if (!bt || typeof bt !== 'string') return '12:00:00'
  const trimmed = bt.trim()
  if (!trimmed) return '12:00:00'

  const upper = trimmed.toUpperCase()
  const isPM = /\bPM\b/.test(upper)
  const isAM = /\bAM\b/.test(upper)
  const timeOnly = trimmed.replace(/\s*(AM|PM)\s*/gi, '').trim()

  const parts = timeOnly.split(':')
  let h = parseInt(parts[0], 10)
  const m = Math.min(59, Math.max(0, parseInt(parts[1], 10) || 0))
  const s = parts[2] !== undefined ? Math.min(59, Math.max(0, parseInt(parts[2], 10) || 0)) : 0

  if (Number.isNaN(h)) return '12:00:00'

  if (isPM || isAM) {
    if (isPM && isAM) return '12:00:00'
    // Mixed format: hour already in 24h range (0 or 13-23) — treat as 24h, ignore AM/PM
    if (h === 0 || (h >= 13 && h <= 23)) {
      if (h < 0 || h > 23) return '12:00:00'
    } else {
      // 12h format: h is 1-12
      if (h < 1 || h > 12) return '12:00:00'
      if (isPM && h < 12) h += 12
      else if (isAM && h === 12) h = 0
    }
  } else {
    if (h < 0 || h > 23) return '12:00:00'
  }

  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export interface BirthCalendarParts {
  year: number
  month: number
  day: number
}

/**
 * Calendar year, month, and day from a profile birth date.
 * `YYYY-MM-DD` (and timestamps that start with that date) are the written civil day.
 * `new Date('YYYY-MM-DD')` is UTC midnight, so local getters in the Americas return the previous day.
 */
export function parseBirthDateCalendar(birthDate: string | null | undefined): BirthCalendarParts | null {
  if (!birthDate || typeof birthDate !== 'string') return null
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(birthDate.trim())
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  return { year, month, day }
}

/** ISO calendar parts when present; otherwise the local calendar of a parseable date string. */
export function birthCalendarParts(birthDate: string | null | undefined): BirthCalendarParts | null {
  const iso = parseBirthDateCalendar(birthDate)
  if (iso) return iso
  if (!birthDate || typeof birthDate !== 'string') return null
  const date = new Date(birthDate)
  if (Number.isNaN(date.getTime())) return null
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() }
}
