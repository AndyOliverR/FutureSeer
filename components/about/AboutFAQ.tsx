"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AboutSection } from './AboutSection';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: "What makes FutureSeer different?",
    answer: "FutureSeer brings multiple traditional systems into one platform, with AI-assisted synthesis to keep insights coherent and practical."
  },
  {
    question: "Do I need to know my exact birth time?",
    answer: "Birth time improves chart precision, but you can still use tools like Tarot and Numerology without exact time."
  },
  {
    question: "Is my personal information secure?",
    answer: "Yes. We treat profile data as private and use secure handling practices for account and billing flows."
  },
  {
    question: "Can I try FutureSeer for free?",
    answer: "Yes. New users start with a free trial before choosing a membership tier."
  },
  {
    question: "How accurate are the predictions?",
    answer: "We aim for methodological consistency and quality. Outputs are for guidance and reflection, not deterministic guarantees."
  }
];

export function AboutFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <AboutSection 
      title="FAQ"
      subtitle="Quick answers"
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
