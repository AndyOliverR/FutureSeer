"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import CompassHelper, { type CompassMode } from "@/components/fengshui/CompassHelper"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function VastuCompassPage() {
  const [mode, setMode] = useState<CompassMode>("16")
  const [last, setLast] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50/80 pb-24 md:pb-12">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <Link
          href="/tools/vastu"
          className="inline-flex items-center gap-2 text-sm text-amber-900 font-medium hover:text-amber-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Vastu
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-amber-950 mb-2">Vastu compass</h1>
        <p className="text-sm text-slate-600 mb-4">
          Full-screen compass with live dial: 4 cardinal directions through 45 energy fields (8° sectors). The dial
          shows a <strong>North-up reference</strong> even before the compass activates. Use the same reading on the
          main Vastu tool under Room Placement.
        </p>
        <div className="mb-6 rounded-xl border border-amber-200 bg-white/80 p-3">
          <p className="text-xs font-semibold text-amber-900 mb-2">Open a precision page</p>
          <div className="flex flex-wrap gap-2">
            {(["8", "16", "32", "45"] as const).map((p) => (
              <Link
                key={p}
                href={`/tools/vastu/compass/${p}`}
                className="text-sm px-3 py-1.5 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 font-medium"
              >
                {p === "8" ? "8 directions" : p === "16" ? "16 zones" : p === "32" ? "32 padas" : "45 fields"}
              </Link>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <p className="text-xs font-semibold text-amber-900 mb-2">Precision</p>
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(v) => {
              if (v === "4" || v === "8" || v === "16" || v === "32" || v === "45") setMode(v)
            }}
            className="flex flex-wrap gap-1"
          >
            {(["4", "8", "16", "32", "45"] as const).map((m) => (
              <ToggleGroupItem
                key={m}
                value={m}
                aria-label={`${m} mode`}
                className={cn("text-xs px-3 data-[state=on]:bg-amber-200")}
              >
                {m === "4" ? "4" : m === "8" ? "8" : m === "16" ? "16" : m === "32" ? "32" : "45"}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <CompassHelper
          mode={mode}
          buttonLabel="Copy current reading"
          onUseDirection={(d) => setLast(d)}
        />
        {last && (
          <p className="mt-4 text-sm text-slate-700">
            Last reading: <span className="font-semibold text-amber-900">{last}</span>
          </p>
        )}
      </div>
    </div>
  )
}
