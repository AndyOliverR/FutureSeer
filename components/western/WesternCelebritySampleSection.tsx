"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CELEBRITY_DATABASE } from '@/lib/celebrityDatabase'
import { Star } from 'lucide-react'

const SAMPLE_LIMIT = 12

/**
 * Discovery strip: public figures with verified-style birth data (Sun sign from DB).
 * Complements the signed-in chart experience without calling APIs.
 */
export function WesternCelebritySampleSection() {
  const samples = CELEBRITY_DATABASE.slice(0, SAMPLE_LIMIT)

  return (
    <Card className="border-2 border-slate-200 bg-slate-50/80 rounded-2xl shadow-sm">
      <CardHeader className="px-5 pt-5 pb-2 sm:px-6 sm:pt-6">
        <CardTitle className="flex items-center gap-2 text-lg font-serif text-slate-900">
          <Star className="w-5 h-5 text-amber-600 shrink-0" />
          Trending-style sample charts
        </CardTitle>
        <p className="text-sm text-slate-600 font-normal text-pretty">
          Famous charts with documented birth data—explore how Sun sign and biography show up in practice. Sign in and
          complete your profile to generate your own wheel and full report.
        </p>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
        <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white overflow-hidden">
          {samples.map((c, i) => (
            <li
              key={`${c.name}-${i}`}
              className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-sm"
            >
              <span className="font-medium text-slate-900">{c.name}</span>
              <span className="text-amber-800 font-medium">{c.sunSign}</span>
              <span className="text-slate-500 w-full sm:w-auto sm:text-right text-xs">
                {c.birthDate.replace(/-/g, ' · ')}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
