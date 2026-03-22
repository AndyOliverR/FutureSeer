"use client"

import { Card, CardContent } from '@/components/ui/card'
import { MapPin, User, Clock } from 'lucide-react'

export interface ChartBirthSummaryCardProps {
  displayName?: string | null
  fullName?: string | null
  birthDate?: string | null
  birthTime?: string | null
  birthPlace?: string | null
}

function formatBirthDateTime(birthDate?: string | null, birthTime?: string | null): string {
  if (!birthDate) return 'Birth date not set'
  const d = new Date(birthDate)
  if (Number.isNaN(d.getTime())) return birthDate
  const datePart = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  if (!birthTime || birthTime === '12:00:00' || birthTime === '00:00:00') {
    return `${datePart} (time unknown or default)`
  }
  const [hh, mm] = birthTime.split(':').map((x) => parseInt(x, 10))
  if (Number.isNaN(hh) || Number.isNaN(mm)) return `${datePart} · ${birthTime}`
  const t = new Date()
  t.setHours(hh, mm, 0, 0)
  const timePart = t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${datePart}, ${timePart}`
}

export function ChartBirthSummaryCard({
  displayName,
  fullName,
  birthDate,
  birthTime,
  birthPlace,
}: ChartBirthSummaryCardProps) {
  const name = (fullName || displayName || 'Your chart').trim() || 'Your chart'
  const when = formatBirthDateTime(birthDate, birthTime)
  const where = (birthPlace || '').trim() || 'Birth place not set'

  return (
    <Card className="border-2 border-amber-300/80 bg-gradient-to-r from-amber-50 via-white to-amber-50/90 shadow-md rounded-2xl">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="rounded-full bg-amber-200/70 p-2 shrink-0">
              <User className="w-5 h-5 text-amber-900" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-900/80">Chart details</p>
              <p className="text-lg font-serif font-semibold text-slate-900 truncate">{name}</p>
            </div>
          </div>
          <div className="flex flex-col sm:items-end gap-1 text-sm text-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <Clock className="w-4 h-4 text-amber-800 shrink-0" aria-hidden />
              <span className="break-words">{when}</span>
            </div>
            <div className="flex items-start gap-2 min-w-0">
              <MapPin className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" aria-hidden />
              <span className="break-words">{where}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
