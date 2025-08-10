"use client";
import React from "react"
import { useRouter } from "next/navigation"

interface ActiveRemedyCardProps {
  remedy: string
  type: string
  status: "Pending" | "Viewed"
}

export function ActiveRemedyCard({ remedy, type, status }: ActiveRemedyCardProps) {
  const router = useRouter()
  return (
    <section className={`w-full rounded-2xl backdrop-blur-md bg-slate-900/30 border border-slate-700/50 shadow-lg p-6 flex flex-col items-center mb-2 relative card-glow ${status === "Pending" ? "animate-pulse" : ""}`}>
      <h3 className="text-xl font-serif text-amber-200 mb-2">Active Remedy</h3>
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="text-2xl font-serif text-amber-100 mb-1">{remedy}</div>
        <div className="text-sm text-amber-300 font-serif mb-2">Type: {type}</div>
        {status === "Pending" && (
          <div className="text-xs text-yellow-400 font-serif mb-2">New! You haven’t opened this remedy yet.</div>
        )}
        <button
          className="group relative overflow-hidden mt-3 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-indigo-500/20 border border-purple-400/30 text-purple-200 font-serif font-semibold text-sm hover:from-purple-500/30 hover:to-indigo-400/30 hover:border-purple-400/50 hover:text-purple-100 transition-all duration-300 backdrop-blur-sm"
          onClick={() => router.push("/remedies/active")}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <div className="relative flex items-center justify-center gap-2">
            <span className="text-lg">💎</span>
            <span className="transition-transform group-hover:scale-105">See full remedy</span>
          </div>
        </button>
      </div>
    </section>
  )
} 