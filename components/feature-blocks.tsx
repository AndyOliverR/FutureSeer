"use client";

import { Heart, MessageCircle, Sparkles } from "lucide-react";
import { FutureSeerWordmark } from "@/components/brand/FutureSeerWordmark";

const features = [
  {
    icon: Heart,
    title: "Love & relationships",
    description:
      "Ask about connection, compatibility, or timing—patterns from your chart and traditions, explained in plain language.",
  },
  {
    icon: Sparkles,
    title: "Career, money & timing",
    description:
      "Direction and tension across Vedic, numerology, and more—one profile, one conversation, not five conflicting apps.",
  },
  {
    icon: MessageCircle,
    title: "One clear answer",
    description:
      "AI connects patterns across traditions, grounded in your saved reports—not generic horoscope filler.",
  },
];

/**
 * Landing feature grid — no React hooks and no framer-motion so first paint cannot hit
 * stale HMR chunks (useState/useEffect undefined) and the landing bundle stays smaller.
 */
export function FeatureBlocks() {
  return (
    <section className="py-10 sm:py-12 md:py-16 bg-transparent" aria-labelledby="features-heading">
      <h2 id="features-heading" className="sr-only">
        Features
      </h2>
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-6 sm:p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-500 hover:bg-white/10 hover:border-amber-500/40 hover:shadow-[0_0_40px_rgba(245,158,11,0.2)] hover:-translate-y-1 cursor-default animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <div className="absolute inset-0 rounded-3xl bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 group-hover:border-amber-500/50 transition-all duration-500">
                  <feature.icon className="w-8 h-8 text-amber-500 group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] transition-all" />
                </div>
                <h3 className="text-xl font-heading text-white group-hover:text-amber-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed font-light group-hover:text-white transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto text-center animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200 fill-mode-both">
          <h3 className="text-2xl mb-8 uppercase tracking-widest flex flex-wrap items-center justify-center gap-x-2">
            <span className="font-heading text-amber-400">Why</span>
            <FutureSeerWordmark size="md" className="inline-block normal-case tracking-normal" />
          </h3>
          <ul className="space-y-4 text-left">
            {[
              "Start with what matters: love, career, money, personality, or timing—then go deeper when you are ready.",
              "AI connects patterns across systems, grounded in what you actually saved.",
              "Traditional methods explained without hype or guaranteed predictions.",
            ].map((text, i) => (
              <li key={i} className="flex gap-3 items-start group/item">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 group-hover/item:scale-125 transition-transform" />
                <span className="text-slate-300 text-sm leading-relaxed group-hover/item:text-white transition-colors">
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
