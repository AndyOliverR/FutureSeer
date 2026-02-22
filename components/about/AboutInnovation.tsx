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
        className="max-w-4xl mx-auto p-6 sm:p-8 bg-surface-container-high rounded-[32px] border border-outline-variant shadow-lg flex flex-col md:flex-row gap-6 items-center md:items-start"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        <div className="shrink-0 p-4 bg-primary-container rounded-2xl">
          <Info className="w-8 h-8 text-on-primary-container" />
        </div>
        <div className="space-y-4 text-center md:text-left">
          <p className="text-base text-surface-on leading-relaxed font-normal">
            We're in the early stages of this innovation experiment. As we scale and learn from users like you, our algorithms and features evolve to reach maximum accuracy and quality.
          </p>
          <div className="p-4 bg-surface-container-lowest rounded-2xl border border-primary/10">
            <p className="text-sm text-amber-400 font-bold uppercase tracking-widest leading-none">Early Adopter Privilege</p>
            <p className="text-xs text-surface-on-variant mt-2 font-medium">Your usage and feedback directly shape the future of this platform. You are part of the team.</p>
          </div>
        </div>
      </motion.div>
    </AboutSection>
  );
}
