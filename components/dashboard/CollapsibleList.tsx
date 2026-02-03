'use client'

import React, { useState } from 'react'

interface CollapsibleListProps {
  title: string
  items: string[]
  maxInitial: number
  color?: string
}

export function CollapsibleList({ title, items, maxInitial, color = 'amber' }: CollapsibleListProps) {
  const [showAll, setShowAll] = useState(false)
  const displayItems = showAll ? items : items.slice(0, maxInitial)
  const hasMore = items.length > maxInitial
  
  return (
    <div>
      <h4 className="m3-title-small font-semibold text-[var(--m3-primary)] mb-2">{title}</h4>
      <ul className="list-disc list-inside space-y-1">
        {displayItems.map((item, idx) => (
          <li key={idx} className="m3-body-small text-[var(--m3-on-surface-variant)] font-light">{item}</li>
        ))}
      </ul>
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="m3-label-small text-[var(--m3-primary)] mt-2 hover:text-[var(--m3-on-primary-container)] m3-transition-standard underline"
        >
          {showAll ? 'Show less' : `Show ${items.length - maxInitial} more`}
        </button>
      )}
    </div>
  )
}
