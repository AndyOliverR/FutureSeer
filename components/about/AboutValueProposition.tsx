"use client";

import { motion } from "framer-motion";
import { AboutSection } from "./AboutSection";

const sections = [
  {
    title: "The Problem",
    body: "Divination seekers face fragmented systems—different astrologers, tarot readers, and numerologists often conflict. Multiple platforms and scattered remedies create confusion instead of clarity.",
  },
  {
    title: "How FutureSeer Solves It",
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
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {sections.map((item, index) => (
          <motion.article
            key={index}
            className="relative flex flex-col p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-colors duration-300"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.06,
              ease: [0.2, 0, 0, 1],
              duration: 0.35,
            }}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 mb-4 text-amber-400 font-semibold text-lg">
              {index + 1}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-amber-400 mb-3 sm:mb-4">
              {item.title}
            </h3>
            <p className="text-sm text-white/80 leading-relaxed font-light">
              {item.body}
            </p>
          </motion.article>
        ))}
      </div>
    </AboutSection>
  );
}
