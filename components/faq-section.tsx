"use client";
import { useState, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const faqs = [
  {
    question: "What makes FutureSeer different from other astrology apps?",
    answer: "FutureSeer combines traditional astrological wisdom with advanced AI algorithms. We use proprietary astronomical calculations alongside machine learning to provide personalized, accurate insights across multiple divination systems."
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
    answer: "Yes! We offer a free tier that includes basic readings and limited access to our tools. You can explore Vedic astrology, generate your birth chart, and try the Seer AI chat to see if FutureSeer resonates with you."
  },
  {
    question: "What divination systems do you support?",
    answer: "We offer Vedic (Jyotish) astrology, Western astrology, Tarot, Numerology, I Ching, Angel Numbers, Palmistry, and more. Each system is integrated with AI interpretation engines that provide comprehensive, personalized guidance."
  },
  {
    question: "How accurate are the predictions?",
    answer: "We use precise astronomical calculations and time-tested traditional methods. However, astrology and divination are tools for self-reflection and guidance, not deterministic prediction. Our AI helps you interpret patterns and possibilities, empowering you to make informed decisions."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const query = searchQuery.toLowerCase();
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <section className="py-10 sm:py-16">
      <div className="max-w-3xl mx-auto rounded-[28px] px-6 sm:px-10 py-10 bg-slate-900/30 border border-slate-700/50 shadow-[0_30px_60px_rgba(0,0,0,0.55)] backdrop-blur-sm">
        <h2 className="text-3xl sm:text-4xl font-serif text-white text-center mb-3 sm:mb-4 font-normal">
          Frequently Asked Questions
        </h2>
        <p className="text-sm sm:text-base text-white text-center mb-6 sm:mb-8 font-light">
          Everything you need to know about FutureSeer
        </p>

        {/* Search bar */}
        <div className="mb-6 sm:mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-200/80" />
            <Input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border border-slate-700/50 text-slate-100 placeholder:text-slate-400 focus:border-amber-500 focus:ring-amber-500/40 min-h-[44px] rounded-xl"
            />
          </div>
        </div>

        {filteredFaqs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white font-light">No FAQs found matching your search.</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredFaqs.map((faq, index) => {
              const originalIndex = faqs.indexOf(faq);
              return (
                <div
                  key={originalIndex}
                  className="rounded-2xl bg-slate-800/50 border border-slate-700/50 overflow-hidden backdrop-blur-sm hover:border-amber-500/40 transition-all duration-300 shadow-[0_20px_45px_rgba(0,0,0,0.45)]"
                >
                  <button
                    className="w-full px-4 sm:px-6 py-4 sm:py-5 min-h-[56px] text-left flex items-center justify-between gap-4 group touch-manipulation"
                    onClick={() => setOpenIndex(openIndex === originalIndex ? null : originalIndex)}
                    aria-expanded={openIndex === originalIndex}
                    aria-controls={`faq-answer-${originalIndex}`}
                  >
                    <span className="text-sm sm:text-base font-sans text-white group-hover:opacity-90 transition-opacity leading-relaxed pr-2 font-normal">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 sm:w-6 sm:h-6 text-amber-600 transition-transform duration-500 ease-in-out flex-shrink-0 ${
                        openIndex === originalIndex ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  
                  <div
                    id={`faq-answer-${originalIndex}`}
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      openIndex === originalIndex ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="px-4 sm:px-6 pb-4 sm:pb-5 text-sm sm:text-base text-white leading-relaxed font-light">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
