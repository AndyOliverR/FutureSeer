"use client";

import { Heart, MessageCircle, Sparkles, Users } from "lucide-react";

export function InnovationInvitation() {
  return (
    <div className="text-center mb-16 space-y-6">
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
        <span className="text-amber-400">FutureSeer</span>
        <span className="text-white"> — one profile, many traditions</span>
      </h1>

      <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
        Ask one question. Get answers grounded in your birth profile—not generic horoscopes.
      </p>
      <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
        Start with a 30-day trial. Memberships unlock full tool access after your trial (monthly, quarterly, or annual).
      </p>

      <div className="bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 rounded-2xl p-6 md:p-8 max-w-4xl mx-auto">
        <p className="text-lg md:text-xl text-amber-400 mb-4 font-light">
          Get Early Access — help shape what we build next.
        </p>
        <p className="text-base md:text-lg text-white/80 leading-relaxed">
          One birth profile powers Vedic astrology, Tarot, Numerology, and more. Ask the Seer connects patterns across
          your saved reports in plain language—Swiss Ephemeris charts, traditional rules, no hype or guaranteed
          predictions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 max-w-5xl mx-auto">
        <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300">
          <Heart className="w-8 h-8 text-amber-400 mb-3" />
          <h3 className="text-amber-400 font-semibold mb-2 text-sm">Love & timing</h3>
          <p className="text-white/80 text-xs text-center">Patterns from your chart</p>
        </div>

        <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300">
          <Sparkles className="w-8 h-8 text-amber-400 mb-3" />
          <h3 className="text-amber-400 font-semibold mb-2 text-sm">Career & money</h3>
          <p className="text-white/80 text-xs text-center">One unified conversation</p>
        </div>

        <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300">
          <MessageCircle className="w-8 h-8 text-amber-400 mb-3" />
          <h3 className="text-amber-400 font-semibold mb-2 text-sm">Ask the Seer</h3>
          <p className="text-white/80 text-xs text-center">Cross-tradition answers</p>
        </div>

        <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300">
          <Users className="w-8 h-8 text-amber-400 mb-3" />
          <h3 className="text-amber-400 font-semibold mb-2 text-sm">Founding members</h3>
          <p className="text-white/80 text-xs text-center">Your feedback shapes the product</p>
        </div>
      </div>
    </div>
  );
}
