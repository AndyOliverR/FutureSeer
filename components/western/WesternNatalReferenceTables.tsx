"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  elementModalityPolarityCounts,
  partOfFortuneFromPlanets,
  type PlanetLike,
} from "@/lib/western/chartDerivedFacts"
import { TableProperties } from "lucide-react"

export interface WesternNatalReferenceTablesProps {
  chartData: {
    planets?: PlanetLike[]
    ephemeris?: { planets?: string; houses?: string; julianDayUt?: number | null }
  }
}

function formatDeg(deg: number): string {
  const d = Math.floor(deg)
  const m = Math.floor((deg - d) * 60)
  return `${d}°${String(m).padStart(2, "0")}'`
}

export function WesternNatalReferenceTables({ chartData }: WesternNatalReferenceTablesProps) {
  const planets = chartData.planets ?? []
  const counts = elementModalityPolarityCounts(planets)
  const pof = partOfFortuneFromPlanets(planets)
  const south = planets.find((p) => p.name === "South Node" || p.name === "Southnode")
  const lilith = planets.find((p) => p.name === "Lilith")

  return (
    <Card className="border-2 border-slate-200 bg-white/95 rounded-2xl shadow-md text-slate-900">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-serif text-slate-900">
          <TableProperties className="w-5 h-5 text-amber-700" />
          Natal reference tables
        </CardTitle>
        <p className="text-sm text-slate-600 font-normal">
          Deterministic counts and points (same inputs as your saved chart). Ephemeris note reflects how positions were computed.
        </p>
        {chartData.ephemeris?.planets && (
          <p className="text-xs text-slate-500 leading-snug">{chartData.ephemeris.planets}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6 pt-0 text-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 px-3 py-2 font-semibold text-slate-800">Polarity (10 classical planets)</div>
            <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-slate-800">
              <tbody>
                <tr className="border-t border-slate-100">
                  <td className="px-3 py-2 text-slate-800">Masculine</td>
                  <td className="px-3 py-2 tabular-nums text-slate-900">{counts.masculine}</td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="px-3 py-2 text-slate-800">Feminine</td>
                  <td className="px-3 py-2 tabular-nums text-slate-900">{counts.feminine}</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 px-3 py-2 font-semibold text-slate-800">Elements</div>
            <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-slate-800">
              <tbody>
                <tr className="border-t border-slate-100">
                  <td className="px-3 py-2">Fire</td>
                  <td className="px-3 py-2 tabular-nums text-slate-900">{counts.fire}</td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="px-3 py-2">Earth</td>
                  <td className="px-3 py-2 tabular-nums text-slate-900">{counts.earth}</td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="px-3 py-2">Air</td>
                  <td className="px-3 py-2 tabular-nums text-slate-900">{counts.air}</td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="px-3 py-2">Water</td>
                  <td className="px-3 py-2 tabular-nums text-slate-900">{counts.water}</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-100 px-3 py-2 font-semibold text-slate-800">Modalities</div>
          <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] text-sm text-left text-slate-800">
            <tbody>
              <tr className="border-t border-slate-100">
                <td className="px-3 py-2">Cardinal</td>
                <td className="px-3 py-2 tabular-nums text-slate-900">{counts.cardinal}</td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="px-3 py-2">Fixed</td>
                <td className="px-3 py-2 tabular-nums text-slate-900">{counts.fixed}</td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="px-3 py-2">Mutable</td>
                <td className="px-3 py-2 tabular-nums text-slate-900">{counts.mutable}</td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-100 px-3 py-2 font-semibold text-slate-800">Lots &amp; nodes</div>
          <div className="overflow-x-auto">
          <table className="w-full min-w-[360px] text-sm text-left text-slate-800">
            <tbody>
              {pof && (
                <tr className="border-t border-slate-100">
                  <td className="px-3 py-2 text-slate-800">Part of Fortune (classic)</td>
                  <td className="px-3 py-2 text-slate-900">
                    {pof.sign} {formatDeg(pof.degreeInSign)} ({pof.isDayChart ? "day" : "night"} formula)
                  </td>
                </tr>
              )}
              {south && (
                <tr className="border-t border-slate-100">
                  <td className="px-3 py-2">South Node</td>
                  <td className="px-3 py-2 text-slate-900">
                    {typeof south.sign === "string" ? south.sign : (south.sign as { signName?: string })?.signName}{" "}
                    {typeof south.degree === "number"
                      ? `${south.degree.toFixed(1)}°`
                      : typeof south.longitude === "number"
                        ? formatDeg(((south.longitude % 30) + 30) % 30)
                        : ""}
                  </td>
                </tr>
              )}
              {lilith && (
                <tr className="border-t border-slate-100">
                  <td className="px-3 py-2">Lilith (mean apogee)</td>
                  <td className="px-3 py-2 text-slate-900">
                    {typeof lilith.sign === "string" ? lilith.sign : (lilith.sign as { signName?: string })?.signName}{" "}
                    {typeof lilith.degree === "number"
                      ? `${lilith.degree.toFixed(1)}°`
                      : typeof lilith.longitude === "number"
                        ? formatDeg(((lilith.longitude % 30) + 30) % 30)
                        : ""}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
