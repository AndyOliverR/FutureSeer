"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AboutSection } from './AboutSection';
import { motion, AnimatePresence } from 'framer-motion';
import { PRODUCT_FAQ } from '@/lib/seo/faqCatalog';

export function AboutFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <AboutSection
      title="FAQ"
      subtitle="Quick answers"
    >
      <div className="max-w-3xl mx-auto space-y-4">
        {PRODUCT_FAQ.map((faq, index) => (
          <div
            key={faq.question}
            className="rounded-xl border border-amber-500/20 bg-slate-900/40 overflow-hidden"
          >
            <button
              type="button"
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-white hover:bg-white/5"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              aria-expanded={openIndex === index}
            >
              <span className="font-medium text-sm sm:text-base">{faq.question}</span>
              <ChevronDown
                className={`w-5 h-5 shrink-0 text-amber-400 transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            <AnimatePresence initial={false}>
              {openIndex === index ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="px-4 pb-4 text-sm text-white/75 leading-relaxed">{faq.answer}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </AboutSection>
  );
}
