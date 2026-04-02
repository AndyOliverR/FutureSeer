"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import CompassHelper, { type CompassMode } from "@/components/fengshui/CompassHelper"

const PRECISION_TO_MODE: Record<string, CompassMode> = {
  "8": "8",
  "16": "16",
  "32": "32",
  "45": "45",
}

const TITLES: Record<string, string> = {
  "8": "8-direction compass",
  "16": "16-zone compass (advanced Vastu)",
  "32": "32-pada (entrance) compass",
  "45": "45-field compass",
}

const DESCRIPTIONS: Record<string, string> = {
  "8": "Eight winds (45° each): N, NE, E, SE, S, SW, W, NW.",
  "16": "Sixteen zones (22.5° each) for plot facing and room placement.",
  "32": "Thirty-two padas (11.25° each) for main door segments.",
  "45": "Forty-five fields (8° each) with devta-style labels — reference grid; schools vary.",
}

export function VastuCompassPrecisionClient({ precision }: { precision: string }) {
  const mode = PRECISION_TO_MODE[precision]
  if (!mode) {
    throw new Error(`Invalid compass precision: ${precision}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50/80 pb-24 md:pb-12">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <Link
          href="/tools/vastu/compass"
          className="inline-flex items-center gap-2 text-sm text-amber-900 font-medium hover:text-amber-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          All compass modes
        </Link>
        <Link href="/tools/vastu" className="block text-sm text-slate-600 hover:text-amber-800 mb-6">
          Back to Vastu tool
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-amber-950 mb-2">{TITLES[precision]}</h1>
        <p className="text-sm text-slate-600 mb-6">{DESCRIPTIONS[precision]}</p>
        <CompassHelper mode={mode} />
      </div>
    </div>
  )
}
