import React from "react"

interface HeroWelcomeProps {
  userName: string
  lunarPhase: string
  dominantElement: string
}

export function HeroWelcome({ userName, lunarPhase, dominantElement }: HeroWelcomeProps) {
  return (
    <section className="w-full rounded-2xl backdrop-blur-md bg-slate-900/30 border border-slate-700/50 shadow-lg py-8 px-6 flex flex-col items-center justify-center text-center mb-2 card-glow">
      <h2 className="text-2xl md:text-3xl font-serif font-light text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 mb-2">
        Welcome back, <span className="italic">{userName}</span> ✨
      </h2>
      <div className="flex flex-col md:flex-row gap-2 md:gap-6 items-center justify-center text-base font-serif font-light text-amber-200 mb-2">
        <span className="flex items-center gap-2">
          <span role="img" aria-label="moon phase">🌘</span> Lunar Phase: {lunarPhase}
        </span>
        <span className="hidden md:inline">|</span>
        <span className="flex items-center gap-2">
          <span role="img" aria-label="element">💧</span> Dominant Element: {dominantElement}
        </span>
      </div>
      <p className="text-slate-300 font-light max-w-xl mx-auto leading-relaxed mt-2">
        The cosmos aligns in your favor, {userName}. Your intuition is strong today - trust the signs and let the stars guide your next steps.
      </p>
    </section>
  )
} 