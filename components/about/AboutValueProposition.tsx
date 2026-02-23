"use client";

import { motion } from "framer-motion";
import { AboutSection } from "./AboutSection";

const sections = [
  {
    title: "The Problem",
    body: "Divination seekers face fragmented systems—different astrologers, tarot readers, and numerologists often conflict. Multiple platforms and scattered remedies create confusion instead of clarity.",
  },
  {
    title: "The Solution",
    body: "One platform with 60+ tools, each with its own profile and \"Ask the Seer\" interface. A Universal Seer then synthesizes across disciplines so you get a single, coherent answer—no contradiction.",
  },
  {
    title: "The Promise",
    body: "Methodological integrity and continuous improvement. Your contributions go toward accuracy and reliability. We aim for precision and clarity, not mystique—and we evolve with your feedback.",
  },
];

export function AboutValueProposition() {
  return (
    <AboutSection
      title="Why FutureSeer"
      subtitle="From fragmentation to clarity—one platform, one synthesis"
    >
      <div className="max-w-4xl mx-auto grid grid-cols-1 gap-6">
        {sections.map((item, index) => (
          <motion.article
            key={index}
            className="p-6 sm:p-8 rounded-[32px] glass-effect hover:border-amber-500/40 transition-all duration-300 shadow-xl"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, ease: [0.2, 0, 0, 1] }}
          >
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xl">
                {index + 1}
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-heading font-bold gold-glow uppercase tracking-tight">
                  {item.title}
                </h3>
                <p className="text-base text-surface-on leading-relaxed font-normal opacity-90">
                  {item.body}
                </p>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </AboutSection>
  );
}
