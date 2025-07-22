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
          className="mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-semibold text-sm shadow-md hover:from-amber-500 hover:to-yellow-400 transition-all button-glow"
          onClick={() => router.push("/remedies/active")}
        >
          See full remedy
        </button>
      </div>
    </section>
  )
} 