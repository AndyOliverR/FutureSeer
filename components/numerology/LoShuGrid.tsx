import React from 'react'
import { buildLoShuCounts } from '@/lib/numerology/loShu'
import { groupedRemedies } from '@/lib/numerology/remedies'

interface LoShuGridProps {
  birthDateISO: string | undefined
  driverReduced?: number | null
  conductorReduced?: number | null
}

export function LoShuGrid({ birthDateISO, driverReduced, conductorReduced }: LoShuGridProps) {
  const { counts, missing } = buildLoShuCounts(birthDateISO || '')
  const derived = new Set<number>()
  if (driverReduced && driverReduced >= 1 && driverReduced <= 9) derived.add(driverReduced)
  if (conductorReduced && conductorReduced >= 1 && conductorReduced <= 9) derived.add(conductorReduced)
  const missingFiltered = missing.filter((n) => !derived.has(n))

  const cell = (n: number) => {
    const isMissing = counts[n] === 0
    const isDerived = isMissing && derived.has(n)
    const baseClass = isMissing
      ? isDerived
        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
        : 'bg-red-50 text-red-700 border-red-300'
      : 'bg-blue-50 text-slate-700 border-blue-200'
    return (
      <div className={`rounded-xl border p-3 text-center ${baseClass}`}>
        <div className="text-xs opacity-80 flex items-center justify-center gap-1">
          {n}
          {isDerived && <span className="px-1.5 py-0.5 rounded-full text-[10px] border border-emerald-500 bg-emerald-100 text-emerald-700">derived</span>}
        </div>
        <div className="mt-1 text-lg font-semibold">{counts[n]}</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="grid grid-cols-3 gap-3">
          {cell(4)}{cell(9)}{cell(2)}
          {cell(3)}{cell(5)}{cell(7)}
          {cell(8)}{cell(1)}{cell(6)}
        </div>
        {/* Legend */}
        <div className="mt-4 text-xs text-slate-600 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-blue-100 border border-blue-300 inline-block" />
            <span>Present in DOB</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-red-100 border border-red-300 inline-block" />
            <span>Missing (needs remedies)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-400 inline-block" />
            <span>Derived from Driver/Conductor</span>
          </div>
        </div>
      </div>
      <div className="lg:col-span-1">
        <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 p-4">
          <h4 className="text-amber-800 font-semibold mb-3">Missing Numbers</h4>
          {missingFiltered.length === 0 ? (
            <p className="text-slate-700 text-sm">No missing numbers in your grid.</p>
          ) : (
            <div className="space-y-3">
              {/* Clear Summary of Missing Numbers */}
              <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-800">
                  <strong>Missing from your chart:</strong> {missingFiltered.join(', ')}
                </p>
                <p className="text-xs text-red-700 mt-1 opacity-80">
                  These numbers don't appear in your birth date and need attention through remedies.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {missingFiltered.map((m) => (
                  <span key={m} className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium border border-amber-300">{m}</span>
                ))}
              </div>
              <div className="mt-3 text-slate-700 text-sm">
                {Object.entries(groupedRemedies(missingFiltered)).map(([num, items]) => (
                  <div key={num} className="mb-3">
                    <div className="text-amber-800 text-sm font-semibold mb-1.5">Remedies for {num}</div>
                    <ul className="list-disc pl-5 space-y-1">
                      {items.map((i, idx) => (
                        <li key={`${num}-${idx}`} className="text-slate-700">{i}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoShuGrid


