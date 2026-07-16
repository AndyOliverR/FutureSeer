'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { COMMON_ANGEL_NUMBERS, lookupAngelNumber } from '@/lib/seo/publicCalculators'

export function AngelNumberCalculatorForm() {
  const [input, setInput] = useState('111')
  const result = useMemo(() => lookupAngelNumber(input), [input])

  return (
    <div className="rounded-2xl border border-amber-500/25 bg-slate-950/50 p-5 sm:p-6 space-y-4">
      <label className="block text-sm text-amber-200/90">
        Number sequence
        <input
          type="text"
          inputMode="numeric"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. 111, 444, 777"
          className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-white"
        />
      </label>
      {result ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-amber-300 text-sm uppercase tracking-wide">{result.sequence}</p>
          <p className="text-2xl font-bold text-white mt-1">{result.title}</p>
          <p className="text-white/80 text-sm mt-2">{result.meaning}</p>
        </div>
      ) : (
        <p className="text-white/55 text-sm">
          Enter a repeating sequence such as 111 or 555. Unlisted patterns still invite personal reflection—use the full Angel Numbers tool for a profile-based reading.
        </p>
      )}
      <div>
        <p className="text-xs text-amber-200/80 mb-2 uppercase tracking-wide">Common sequences</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_ANGEL_NUMBERS.map((n) => (
            <button
              key={n.sequence}
              type="button"
              onClick={() => setInput(n.sequence)}
              className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/80 hover:border-amber-400/50 hover:text-amber-200"
            >
              {n.sequence}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href="/signup"
          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
        >
          Create free account
        </Link>
        <Link
          href="/tools/angel-numbers"
          className="rounded-xl border border-amber-500/40 px-4 py-2 text-sm text-amber-200 hover:bg-amber-500/10"
        >
          Angel Numbers tool
        </Link>
      </div>
    </div>
  )
}
