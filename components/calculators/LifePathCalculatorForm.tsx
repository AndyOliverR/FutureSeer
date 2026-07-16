'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { lifePathFromIsoDate } from '@/lib/seo/publicCalculators'

export function LifePathCalculatorForm() {
  const [birthDate, setBirthDate] = useState('')
  const result = useMemo(() => (birthDate ? lifePathFromIsoDate(birthDate) : null), [birthDate])

  return (
    <div className="rounded-2xl border border-amber-500/25 bg-slate-950/50 p-5 sm:p-6 space-y-4">
      <label className="block text-sm text-amber-200/90">
        Birth date
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-white"
        />
      </label>
      {result ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-amber-300 text-sm uppercase tracking-wide">Life path number</p>
          <p className="text-4xl font-bold text-white mt-1">{result.number}</p>
          <p className="text-white/80 text-sm mt-2">{result.blurb}</p>
        </div>
      ) : (
        <p className="text-white/55 text-sm">Enter your birth date to calculate your life path number.</p>
      )}
      <p className="text-white/60 text-xs leading-relaxed">
        This free calculator uses Pythagorean-style digit reduction. For destiny, soul, and chart-linked numbers,
        open{' '}
        <Link href="/tools/numerology" className="text-amber-300 underline">
          Numerology
        </Link>{' '}
        after you generate your FutureSeer profile.
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href="/signup"
          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
        >
          Create free account
        </Link>
        <Link href="/tools/numerology" className="rounded-xl border border-amber-500/40 px-4 py-2 text-sm text-amber-200 hover:bg-amber-500/10">
          Numerology tool
        </Link>
      </div>
    </div>
  )
}
