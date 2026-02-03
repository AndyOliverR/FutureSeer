'use client'

import React, { useState } from 'react'

interface MantraCollapsibleProps {
  mantras: string[]
  maxInitial: number
}

export function MantraCollapsible({ mantras, maxInitial }: MantraCollapsibleProps) {
  const [showAll, setShowAll] = useState(false)
  const displayMantras = showAll ? mantras : mantras.slice(0, maxInitial)
  const hasMore = mantras.length > maxInitial
  
  return (
    <div>
      <div className="space-y-2">
        {displayMantras.map((mantra: string, index: number) => (
          <div
            key={index}
            className="p-3 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-amber-500/10"
          >
            <p className="text-sm text-slate-200 font-light leading-relaxed">
              {mantra}
            </p>
          </div>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-amber-400 text-xs mt-3 hover:text-amber-300 transition-colors underline"
        >
          {showAll ? 'Show less' : `Show ${mantras.length - maxInitial} more mantras`}
        </button>
      )}
    </div>
  )
}
