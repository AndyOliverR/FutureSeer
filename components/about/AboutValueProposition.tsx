"use client";

import { motion } from "framer-motion";
import { AboutSection } from "./AboutSection";

const sections = [
  {
    title: "The Problem You're Facing",
    body: "Occult and divination seekers are forced to navigate fragmented systems. Different astrologers, tarot readers, numerologists, and remedy sources often provide conflicting interpretations. Multiple platforms, inconsistent methodologies, scattered remedies, and subjective conclusions create confusion rather than clarity. Instead of guidance, users receive noise.",
  },
  {
    title: "How FutureSeer Solves It",
    body: "FutureSeer consolidates over 40 structured divination tools into a unified analytical framework. Each tool generates a dedicated profile report based on its respective discipline. Every module includes an embedded expert-level \"Ask the Seer\" interface tailored to that specific system. On top of that, a Universal Seer synthesizes outputs across disciplines to deliver a consolidated, deterministic response to the user's question. This removes contradiction and centralizes insight.",
  },
  {
    title: "What Differentiates FutureSeer",
    body: "FutureSeer is not a single-method platform. It is an integrated occult intelligence system. Instead of isolated readings, it performs cross-disciplinary correlation. Instead of generalized responses, it produces tool-specific analysis followed by unified synthesis. Continuous user feedback refines model precision. A dedicated community environment enables structured discussion and knowledge exchange, strengthening interpretive depth over time.",
  },
  {
    title: "Why This Product Is Right for You",
    body: "If you value pattern recognition, planetary movement analysis, symbolic systems, or predictive frameworks—but dislike inconsistency and ambiguity—FutureSeer provides structure. It reduces dependency on multiple practitioners and conflicting remedies. You receive comprehensive interpretation in one ecosystem, designed to evolve with user input and methodological refinement.",
  },
  {
    title: "The Promise",
    body: "FutureSeer is committed to methodological integrity, continuous improvement, and clarity over mystique. Contributions and payments are directed toward improving analytical accuracy, performance stability, and system reliability. The objective is not persuasion—it is precision. Those who seek disciplined occult synthesis will find a centralized, evolving system built to serve that purpose.",
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
            className="relative flex flex-col p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.08,
              ease: [0.2, 0, 0, 1],
              duration: 0.4,
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
