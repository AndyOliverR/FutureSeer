import React from "react"

interface SymbolicInsight {
  theme: string
  frequency: number
  interpretation: string
}

interface SymbolicPatternHighlightsProps {
  insights: SymbolicInsight[]
}

export function SymbolicPatternHighlights({ insights }: SymbolicPatternHighlightsProps) {
  return (
    <section className="w-full rounded-2xl backdrop-blur-md bg-slate-900/30 border border-slate-700/50 shadow-lg p-6 flex flex-col gap-3 items-center mb-2 card-glow">
      <h3 className="text-xl font-serif text-amber-200 mb-2">Symbolic Patterns</h3>
      <div className="flex flex-wrap gap-4 justify-center w-full">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="min-w-[160px] max-w-xs rounded-xl bg-slate-900/50 border border-amber-400/20 shadow p-4 flex flex-col items-center"
          >
            <div className="text-2xl mb-1">
              {getSymbolEmoji(insight.theme)}
            </div>
            <div className="text-lg font-serif text-amber-100 mb-1">
              {insight.theme} <span className="text-xs text-amber-300">x{insight.frequency}</span>
            </div>
            <div className="text-slate-300 text-sm text-center font-serif mb-1">
              {insight.interpretation}
            </div>
          </div>
        ))}
      </div>
      {insights.length > 0 && (
        <div className="mt-2 text-amber-200 font-serif text-base text-center">
          {getSummary(insights)}
        </div>
      )}
    </section>
  )
}

function getSymbolEmoji(theme: string) {
  if (/fire/i.test(theme)) return "🔥"
  if (/water/i.test(theme)) return "💧"
  if (/earth/i.test(theme)) return "🌍"
  if (/air/i.test(theme)) return "💨"
  if (/saturn/i.test(theme)) return "♄"
  if (/moon/i.test(theme)) return "🌙"
  if (/sun/i.test(theme)) return "☀️"
  if (/venus/i.test(theme)) return "♀️"
  if (/mars/i.test(theme)) return "♂️"
  if (/jupiter/i.test(theme)) return "♃"
  return "⭐"
}

function getSummary(insights: SymbolicInsight[]) {
  if (insights.some(i => /fire/i.test(i.theme))) return "You may be in a purification or transformation cycle."
  if (insights.some(i => /saturn/i.test(i.theme))) return "Saturn's influence brings discipline and lessons."
  if (insights.some(i => /water/i.test(i.theme))) return "Emotional flow and intuition are heightened."
  return "Recurring patterns suggest cosmic energies are aligning for change."
} 