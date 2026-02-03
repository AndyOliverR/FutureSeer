'use client'

import React, { useState } from 'react'

interface TruncatedTextProps {
  text: string
  maxLength: number
  className?: string
}

export function TruncatedText({ text, maxLength, className = '' }: TruncatedTextProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const shouldTruncate = text.length > maxLength
  
  return (
    <div className={className}>
      <p className="text-slate-300 text-sm leading-relaxed font-light">
        {isExpanded || !shouldTruncate ? text : `${text.slice(0, maxLength)}...`}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-amber-400 text-xs mt-2 hover:text-amber-300 transition-colors underline"
        >
          {isExpanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  )
}
