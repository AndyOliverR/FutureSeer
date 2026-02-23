"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AboutSection } from './AboutSection';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: "What makes FutureSeer different?",
    answer: "FutureSeer combines traditional astrological wisdom with advanced AI algorithms. We use proprietary astronomical calculations (Swiss Ephemeris NASA JPL DE431) alongside machine learning to provide accurate insights across multiple systems."
  },
  {
    question: "Do I need to know my exact birth time?",
    answer: "For Vedic astrology, birth time improves accuracy significantly. However, many tools (like Tarot or Numerology) don't require it. If you don't know your time, we can still provide valuable guidance."
  },
  {
    question: "Is my personal information secure?",
    answer: "Absolutely. Your privacy is sacred. We employ bank-level encryption. Your information is yours alone—we never sell or monetize your personal data."
  },
  {
    question: "Can I try FutureSeer for free?",
    answer: "Yes! Everyone gets the first month completely free with all features included. Explore 60+ tools and the Seer AI with no credit card required upfront."
  },
  {
    question: "How accurate are the predictions?",
    answer: "We use precise NASA-validated astronomical data. However, divination tools are for guidance and self-reflection, not deterministic prediction. Our AI helps you interpret possibilities to make informed decisions."
  }
];

export function AboutFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <AboutSection 
      title="FAQ"
      subtitle="Everything you need to know"
    >
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 rounded-2xl transition-all duration-300 shadow-xl"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors"
            >
              <span className="text-white font-bold pr-4">{faq.question}</span>
              <ChevronDown className={`w-5 h-5 text-amber-500 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6"
                >
                  <p className="text-sm text-white/80 leading-relaxed font-light">{faq.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </AboutSection>
  );
}
