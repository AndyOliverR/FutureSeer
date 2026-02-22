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
      <div className="max-w-4xl mx-auto grid grid-cols-1 gap-4">
        {sections.map((item, index) => (
          <motion.article
            key={index}
            className="p-6 rounded-3xl bg-surface-container border border-outline-variant hover:border-amber-500/30 transition-all duration-300"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, ease: [0.2, 0, 0, 1] }}
          >
            <div className="flex gap-4 items-start">
              <div className="shrink-0 w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold">
                {index + 1}
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-amber-400 uppercase tracking-wide">
                  {item.title}
                </h3>
                <p className="text-sm text-surface-on-variant leading-relaxed font-normal">
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
