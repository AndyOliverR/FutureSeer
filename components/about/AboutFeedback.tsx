"use client";

import { AboutSection } from './AboutSection';
import { motion } from 'framer-motion';

export function AboutFeedback() {
  return (
    <AboutSection 
      title="Feedback"
      subtitle="Your voice shapes our product in real-time"
    >
      <div className="max-w-4xl mx-auto space-y-4">
        <motion.div
          className="p-6 sm:p-8 bg-surface-container-high rounded-[32px] border border-outline-variant shadow-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h3 className="text-xl font-bold text-white">Rapid Implementation</h3>
            <span className="px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-bold uppercase tracking-wider">Typically 24–48 hours</span>
          </div>

          <div className="space-y-3">
            {[
              { title: "Improved chart rendering", time: "36 hours ago", desc: "Enhanced visualization accuracy and performance" },
              { title: "Added dark mode toggle", time: "24 hours ago", desc: "User-requested feature for better viewing experience" },
              { title: "Enhanced tool selection UI", time: "48 hours ago", desc: "Improved navigation and discoverability" }
            ].map((item, i) => (
              <div key={i} className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-surface-on">{item.title}</span>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-tight">{item.time}</span>
                </div>
                <p className="text-xs text-surface-on-variant font-normal leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AboutSection>
  );
}
