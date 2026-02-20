"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Brain, Globe, Heart } from "lucide-react";
import Link from "next/link";

export function PersonalNote() {
  const [imageError, setImageError] = useState(false);
  return (
    <motion.section 
      className="px-3 sm:px-4 md:px-6 pt-20 pb-20 m3-gpu-accelerated max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ease: [0, 0, 0.2, 1], duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-colors duration-300">
        <CardContent className="p-4 sm:p-6 md:p-8 lg:p-12">
          {/* Profile Picture and Header */}
          <motion.div 
            className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-amber-400/50 shadow-lg flex-shrink-0">
              {imageError ? (
                <div className="w-full h-full bg-gradient-to-br from-[var(--m3-primary-container)] to-[var(--m3-tertiary-container)] flex items-center justify-center">
                  <span className="text-[var(--m3-on-primary-container)] m3-display-small">A</span>
                </div>
              ) : (
                <Image
                  src="/assets/images/andy-rozario.jpg"
                  alt="AnDY"
                  fill
                  sizes="(max-width: 768px) 128px, 160px"
                  className="object-cover"
                  priority
                  onError={() => setImageError(true)}
                />
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-amber-400 mb-2">
                A Note From Me
              </h1>
              <p className="text-xl font-semibold text-white mb-1">
                AnDY
              </p>
              <p className="text-white/60 text-sm font-light">
                Founder, FutureSeer
              </p>
            </div>
          </motion.div>

          {/* Personal Note Content */}
          <motion.div 
            className="max-w-none space-y-6 text-white/80 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm text-white/80">
              I've always been fascinated by the occult—astrology, numerology, tarot, vastu, and the mysteries that have guided humanity for millennia. What struck me is how the wealthy and powerful have long used these practices in private, while most of us have had little access. As <Link href="https://www.instagram.com/reel/DTGwc16AjHZ/?igsh=MTE0cml2dWFyeWlpdQ==" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline transition-colors">others have noted</Link>, that knowledge has stayed locked away. I wanted to change that: combine AI precision with ancient wisdom and make it available to everyone. That's how FutureSeer was born.
            </p>

            <div className="my-6 p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 rounded-xl transition-colors duration-300">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 mb-3">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>
              <h2 className="text-lg font-bold text-amber-400 mb-3">What Makes FutureSeer Different</h2>
              <ul className="space-y-2 text-sm text-white/80">
                <li className="flex items-start gap-2">
                  <Brain className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-amber-400">AI + tradition:</strong> Unbiased, precise interpretations from validated methods.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Globe className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-amber-400">One platform:</strong> 60+ tools—Vedic & Western astrology, numerology, tarot, I Ching, vastu, and more.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-amber-400">Inclusive:</strong> Clear plans from ₹99/month; first month free. No gatekeeping.</span>
                </li>
              </ul>
            </div>

            <p className="text-sm text-white/80">
              This is just the beginning. FutureSeer grows with every user—your feedback shapes what we build, and we implement suggestions quickly. The wisdom that has guided the world's most successful people should be available to anyone curious enough to explore. Thank you for being part of this mission.
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.section>
  );
}
