"use client";

import { Info } from 'lucide-react';
import { AboutSection } from './AboutSection';
import { motion } from 'framer-motion';

export function AboutInnovation() {
  return (
    <AboutSection 
      title="Innovation Phase"
      subtitle="Join us on this journey"
    >
      <motion.div
        className="max-w-4xl mx-auto p-6 sm:p-10 rounded-[32px] glass-effect border border-amber-500/20 shadow-2xl flex flex-col md:flex-row gap-8 items-center md:items-start"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
      >
        <div className="shrink-0 p-5 bg-amber-500/10 rounded-2xl border border-amber-500/20">
          <Info className="w-10 h-10 text-amber-400" />
        </div>
        <div className="space-y-6 text-center md:text-left">
          <p className="text-lg text-surface-on leading-relaxed font-normal">
            We're in the early stages of this innovation experiment. As we scale and learn from users like you, our algorithms and features evolve to reach maximum accuracy and quality.
          </p>
          <div className="p-5 bg-black/30 rounded-2xl border border-amber-500/10 inline-block">
            <p className="text-sm text-amber-400 font-bold uppercase tracking-widest leading-none">Early Adopter Privilege</p>
            <p className="text-xs text-surface-on-variant mt-3 font-medium opacity-80">Your usage and feedback directly shape the future of this platform. You are part of the team.</p>
          </div>
        </div>
      </motion.div>
    </AboutSection>
  );
}
