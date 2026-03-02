"use client";

import { AboutSection } from './AboutSection';
import { motion } from 'framer-motion';

export function AboutStandards() {
  return (
    <AboutSection 
      title="Standards & Accuracy" 
      subtitle="Ancient wisdom meets modern precision"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Main Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { emoji: "🌟", title: "Swiss Ephemeris", sub: "NASA JPL DE431", detail: "Precision: 0.001 arcseconds", color: "border-amber-500/30" },
            { emoji: "🛰️", title: "NASA Validated", sub: "NASA Horizons system", detail: "Cross-validated data", color: "border-amber-500/30" },
            { emoji: "✨", title: "60+ Tools", sub: "Traditional methods", detail: "Time-tested wisdom", color: "border-amber-500/30" }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-[32px] glass-effect border ${item.color} text-center shadow-xl transition-all duration-300`}
            >
              <div className="text-4xl mb-4">{item.emoji}</div>
              <h4 className="text-lg font-heading font-bold gold-glow mb-2">{item.title}</h4>
              <p className="text-sm text-white/80 font-normal">{item.sub}</p>
              <p className="text-[10px] text-amber-400/70 mt-2 uppercase font-bold tracking-widest">{item.detail}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="p-6 sm:p-8 rounded-[32px] glass-effect border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 shadow-xl"
        >
          <h4 className="text-xl font-heading font-bold gold-glow mb-4 uppercase tracking-tight">Validated Wisdom</h4>
          <p className="text-base text-surface-on leading-relaxed font-normal opacity-90 mb-4">
            Astrology, numerology, divination, tarot, I Ching, Chinese & Indian systems, energy practices—all using validated traditional methods and modern astronomical data.
          </p>
          <p className="text-amber-400/60 text-[10px] uppercase font-bold tracking-tighter">
            Results are for guidance and self-reflection only.
          </p>
        </motion.div>
      </div>
    </AboutSection>
  );
}
