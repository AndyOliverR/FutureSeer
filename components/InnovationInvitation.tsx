"use client";

import { Eye, Sparkles, TrendingUp, Users } from "lucide-react";

export function InnovationInvitation() {
  return (
    <div className="text-center mb-16 space-y-6">
      {/* Main Title */}
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
        Join the <span className="text-amber-400">FutureSeer Innovation Experiment</span>
      </h1>
      
      {/* Subtitle */}
      <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
        You&apos;re joining a movement to make AI-powered divination accessible to all.
      </p>
      <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
        Start with a 30-day trial. Paid plans are <strong className="text-amber-400/90">memberships</strong> (recurring
        billing monthly, quarterly, or annually) that support the innovation experiment and unlock full tool access
        after your trial.
      </p>

      {/* Key Message */}
      <div className="bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 rounded-2xl p-6 md:p-8 max-w-4xl mx-auto">
        <p className="text-lg md:text-xl text-amber-400 mb-4 font-light">
          Start free for 30 days. Your usage makes this innovation possible.
        </p>
        <p className="text-base md:text-lg text-white/80 leading-relaxed">
          See into your future using the power of occult wisdom, AI forecasting, hidden data patterns, and predictive analytics. FutureSeer combines ancient divination with cutting-edge technology to provide genuine glimpses into what lies ahead.
        </p>
      </div>

      {/* Future-Seeing Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 max-w-5xl mx-auto">
        <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300">
          <Eye className="w-8 h-8 text-amber-400 mb-3" />
          <h3 className="text-amber-400 font-semibold mb-2 text-sm">Occult Wisdom</h3>
          <p className="text-white/80 text-xs text-center">Ancient divination methods</p>
        </div>
        
        <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300">
          <TrendingUp className="w-8 h-8 text-amber-400 mb-3" />
          <h3 className="text-amber-400 font-semibold mb-2 text-sm">AI Forecasting</h3>
          <p className="text-white/80 text-xs text-center">Predictive analytics</p>
        </div>
        
        <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300">
          <Sparkles className="w-8 h-8 text-amber-400 mb-3" />
          <h3 className="text-amber-400 font-semibold mb-2 text-sm">Hidden Patterns</h3>
          <p className="text-white/80 text-xs text-center">Data pattern recognition</p>
        </div>
        
        <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300">
          <Users className="w-8 h-8 text-amber-400 mb-3" />
          <h3 className="text-amber-400 font-semibold mb-2 text-sm">Community Power</h3>
          <p className="text-white/80 text-xs text-center">Your usage improves accuracy</p>
        </div>
      </div>
    </div>
  );
}
