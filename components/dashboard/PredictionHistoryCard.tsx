"use client";
import React from "react"
import { useRouter } from "next/navigation"

interface PredictionItem {
  date: string
  question: string
  confidence: number
  id: string
}

interface PredictionHistoryCardProps {
  items: PredictionItem[]
}

export function PredictionHistoryCard({ items }: PredictionHistoryCardProps) {
  const router = useRouter()
  return (
    <section className="w-full">
      <h3 className="text-xl font-serif text-amber-200 mb-4 px-2">Recent Predictions</h3>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {items.slice(0, 3).map((item) => (
          <div
            key={item.id}
            className="min-w-[260px] max-w-xs flex-shrink-0 rounded-2xl backdrop-blur-md bg-slate-900/40 border border-slate-700/50 shadow-lg p-6 flex flex-col gap-3 items-start justify-between"
          >
            <div className="text-xs text-slate-400 font-serif mb-1">{formatDate(item.date)}</div>
            <div className="text-lg font-serif text-amber-100 mb-2 line-clamp-2">{item.question}</div>
            <MiniConfidenceBar value={item.confidence} />
            <button
              className="mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-semibold text-sm shadow-md hover:from-amber-500 hover:to-yellow-400 transition-all button-glow"
              onClick={() => router.push(`/history/${item.id}`)}
            >
              Open full insight
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

function MiniConfidenceBar({ value }: { value: number }) {
  return (
    <div className="w-full flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-xs text-amber-300 font-serif">Confidence</span>
        <span className="text-xs text-amber-200 font-serif">{value}%</span>
      </div>
      <div className="w-full h-2 bg-slate-800/60 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-amber-600 rounded-full transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

function formatDate(date: string) {
  const d = new Date(date)
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
} 