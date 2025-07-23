"use client";
import React from "react"
import { useRouter } from "next/navigation"

interface DailySeerPreviewProps {
  date: string
  summary: string
  callToAction: string
}

export function DailySeerPreview({ date, summary, callToAction }: DailySeerPreviewProps) {
  const router = useRouter()
  return (
    <section className="w-full rounded-2xl backdrop-blur-md bg-slate-900/30 border border-slate-700/50 shadow-lg p-6 flex flex-col items-center mb-2 card-glow">
      <h3 className="text-xl font-serif text-amber-200 mb-2">Today’s Seer Preview</h3>
      <div className="text-xs text-slate-400 font-serif mb-1">{date}</div>
      <div className="text-lg font-serif text-amber-100 mb-3 text-center max-w-xl">{summary}</div>
      <button
        className="mt-2 px-6 py-3 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-semibold text-base shadow-md hover:from-amber-500 hover:to-yellow-400 transition-all button-glow"
        onClick={() => router.push(callToAction)}
      >
        Ask Again
      </button>
    </section>
  )
} 