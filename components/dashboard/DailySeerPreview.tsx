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
        className="group relative overflow-hidden mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-amber-600/20 to-yellow-500/20 border border-amber-400/30 text-amber-200 font-serif font-semibold text-base hover:from-amber-500/30 hover:to-yellow-400/30 hover:border-amber-400/50 hover:text-amber-100 transition-all duration-300 backdrop-blur-sm"
        onClick={() => router.push(callToAction)}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        <div className="relative flex items-center justify-center gap-2">
          <span className="text-xl">🔮</span>
          <span className="transition-transform group-hover:scale-105">Ask Again</span>
        </div>
      </button>
    </section>
  )
} 