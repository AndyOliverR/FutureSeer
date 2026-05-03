"use client";

import { Brain, Sparkles, Zap } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "See Into Your Future",
    description:
      "Occult wisdom combined with AI forecasting reveals hidden patterns and genuine glimpses into what lies ahead",
  },
  {
    icon: Sparkles,
    title: "Hidden Data Patterns",
    description: "Predictive analytics powered by ancient divination systems and time series forecasting",
  },
  {
    icon: Zap,
    title: "Innovation Experiment",
    description:
      "Join as a power user. Your usage improves accuracy and precision for everyone. Join the experiment today.",
  },
];

/**
 * Landing feature grid — no React hooks and no framer-motion so first paint cannot hit
 * stale HMR chunks (useState/useEffect undefined) and the landing bundle stays smaller.
 */
export function FeatureBlocks() {
  return (
    <section className="py-8 sm:py-12 md:py-16 bg-transparent" aria-labelledby="features-heading">
      <h2 id="features-heading" className="sr-only">
        Features
      </h2>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-10 space-y-4 md:space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p
            className="text-sm md:text-base text-primary/80 font-medium tracking-[0.18em] uppercase"
            id="product-name"
          >
            FutureSeer
          </p>
          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-primary/85 font-light leading-relaxed tracking-wide normal-case px-2">
            One birth profile powers dozens of traditions—then the Seer reads across your saved reports so you are not
            juggling tabs, books, and half-remembered rules alone.
          </p>
          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-primary/85 font-normal leading-relaxed tracking-normal normal-case px-2">
            Fifty-plus divination systems in one profile—AI answers from your chart and stored reports, not generic
            horoscopes.
          </p>
        </div>

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
          <h3 className="text-2xl font-heading text-amber-400 mb-8 uppercase tracking-widest">Why FutureSeer</h3>
          <ul className="space-y-4 text-left">
            {[
              "You're facing confusion from fragmented divination tools and conflicting interpretations.",
              "FutureSeer unifies 40+ occult systems into one structured platform.",
              "Our synthesis engine correlates multiple outputs into a single coherent insight.",
              "Continuous refinement ensures methodological consistency and increasing precision.",
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
