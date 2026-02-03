"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AboutSection } from './AboutSection';

const faqs = [
  {
    question: "What makes FutureSeer different from other astrology apps?",
    answer: "FutureSeer combines traditional astrological wisdom with advanced AI algorithms. We use proprietary astronomical calculations alongside machine learning to provide personalized, accurate insights across multiple divination systems. Our calculations are based on Swiss Ephemeris (NASA JPL DE431) and cross-validated with NASA Horizons system."
  },
  {
    question: "Do I need to know my exact birth time?",
    answer: "For Vedic astrology and detailed chart readings, knowing your birth time improves accuracy significantly. However, many of our tools (like Tarot, Numerology, and I Ching) don't require birth time at all. If you don't know your exact time, we can still provide valuable insights."
  },
  {
    question: "Is my personal information secure?",
    answer: "Absolutely. Your privacy is sacred to us. We employ bank-level encryption to protect your birth data and readings. Your information is yours alone—we never sell, share, or monetize your personal data. Period."
  },
  {
    question: "Can I try FutureSeer before subscribing?",
    answer: "Yes! Everyone gets the first month completely free with all features included. You can explore all 60+ divination tools, generate your charts, and try the Seer AI to see if FutureSeer resonates with you. No credit card required for the first month."
  },
  {
    question: "What divination systems do you support?",
    answer: "We offer 60+ tools across 8 categories: Vedic (Jyotish) astrology, Western astrology, Tarot, Numerology, I Ching, Angel Numbers, Palmistry, Face Reading, Runes, Geomancy, and more. Each system is integrated with AI interpretation engines that provide comprehensive, personalized guidance."
  },
  {
    question: "How accurate are the predictions?",
    answer: "We use precise astronomical calculations (Swiss Ephemeris with 0.001 arcsecond precision) and time-tested traditional methods. Our astrological data is cross-validated with NASA Horizons system. However, astrology and divination are tools for self-reflection and guidance, not deterministic prediction. Our AI helps you interpret patterns and possibilities, empowering you to make informed decisions."
  }
];

export function AboutFAQ() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <AboutSection 
      title="Frequently Asked Questions" 
      subtitle="Everything you need to know about FutureSeer"
    >
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 rounded-xl overflow-hidden transition-all duration-300"
          >
            <button
              onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors"
              aria-expanded={openFaqIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <span className="text-amber-400 font-medium pr-4">{faq.question}</span>
              <ChevronDown
                className={`w-5 h-5 text-amber-400 flex-shrink-0 transition-transform duration-300 ${
                  openFaqIndex === index ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>
            {openFaqIndex === index && (
              <div id={`faq-answer-${index}`} className="px-6 pb-4">
                <p className="text-sm text-white/80 leading-relaxed font-light">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </AboutSection>
  );
}
