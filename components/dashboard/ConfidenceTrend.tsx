"use client";
import React, { useState } from "react"

interface ConfidenceTrendProps {
  data: { date: string; confidence: number }[]
}

const timeframes = [
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
]

export function ConfidenceTrend({ data }: ConfidenceTrendProps) {
  const [days, setDays] = useState(7)
  // Filter data for selected timeframe (mock: just take last N)
  const filtered = data.slice(-days)
  // Prepare points for SVG polyline
  const max = Math.max(...filtered.map(d => d.confidence), 100)
  const min = Math.min(...filtered.map(d => d.confidence), 0)
  const points = filtered.map((d, i) => {
    const x = (i / (filtered.length - 1 || 1)) * 180 + 10 // width: 200, padding: 10
    const y = 60 - ((d.confidence - min) / (max - min || 1)) * 40 // height: 60, range: 40
    return `${x},${y}`
  }).join(" ")

  return (
    <section className="w-full rounded-2xl backdrop-blur-md bg-slate-900/30 border border-slate-700/50 shadow-lg p-6 flex flex-col gap-2 items-center mb-2 card-glow">
      <div className="w-full flex items-center justify-between mb-2">
        <h3 className="text-xl font-serif text-amber-200">Confidence Trend</h3>
        <div className="flex gap-2">
          {timeframes.map(tf => (
            <button
              key={tf.value}
              className={`px-2 py-1 rounded font-serif text-xs border transition-all ${days === tf.value ? "bg-amber-500/20 border-amber-400 text-amber-200" : "border-slate-700 text-slate-400 hover:bg-slate-800/30"}`}
              onClick={() => setDays(tf.value)}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full flex flex-col items-center">
        <svg width={200} height={60} className="block">
          <polyline
            fill="none"
            stroke="url(#gold-gradient)"
            strokeWidth={3}
            points={points}
          />
          <defs>
            <linearGradient id="gold-gradient" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fbbf24" />
              <stop offset="0.5" stopColor="#fde68a" />
              <stop offset="1" stopColor="#f59e42" />
            </linearGradient>
          </defs>
        </svg>
        <div className="flex w-full justify-between text-xs text-slate-400 font-serif mt-1">
          <span>{filtered[0]?.date}</span>
          <span>{filtered[filtered.length - 1]?.date}</span>
        </div>
      </div>
    </section>
  )
} 