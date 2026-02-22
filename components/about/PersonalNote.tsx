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
      className="px-4 pt-24 pb-12 max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: [0.2, 0, 0, 1], duration: 0.6 }}
    >
      <div className="bg-surface-container-high rounded-[32px] border border-outline-variant overflow-hidden shadow-xl">
        <div className="p-6 sm:p-10">
          {/* Founder Header */}
          <div className="flex flex-col items-center text-center md:flex-row md:text-left gap-6 mb-10">
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-amber-500/30 shadow-2xl flex-shrink-0">
              {imageError ? (
                <div className="w-full h-full bg-primary-container flex items-center justify-center">
                  <span className="text-on-primary-container text-4xl font-heading">A</span>
                </div>
              ) : (
                <Image
                  src="/assets/images/andy-rozario.jpg"
                  alt="Founder"
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              )}
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-heading font-bold text-amber-400 tracking-tight">
                A Note From Me
              </h1>
              <p className="text-xl font-bold text-white tracking-wide">AnDY</p>
              <p className="text-surface-on-variant text-sm font-medium uppercase tracking-widest opacity-70">
                Founder, FutureSeer
              </p>
            </div>
          </div>

          {/* Content Body */}
          <div className="space-y-8">
            <p className="text-base text-surface-on leading-relaxed font-normal">
              I've always been fascinated by the occult—astrology, numerology, tarot, vastu, and the mysteries that have guided humanity for millennia. What struck me is how the wealthy and powerful have long used these practices in private, while most of us have had little access.
            </p>

            {/* M3 Feature Card inside About */}
            <div className="p-6 bg-surface-container-lowest rounded-3xl border border-amber-500/20 shadow-inner">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-lg font-bold text-amber-400 uppercase tracking-wider">The Mission</h2>
              </div>

              <ul className="space-y-4">
                {[
                  { icon: Brain, title: "AI + Tradition", desc: "Unbiased, precise interpretations." },
                  { icon: Globe, title: "One Platform", desc: "60+ ancient and modern tools." },
                  { icon: Heart, title: "Inclusive Access", desc: "No gatekeeping. Wisdom for all." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <item.icon className="w-5 h-5 text-amber-500 mt-1 shrink-0" />
                    <div>
                      <span className="block font-bold text-white text-sm">{item.title}</span>
                      <span className="text-sm text-surface-on-variant font-light leading-snug">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-base text-surface-on leading-relaxed font-normal">
              FutureSeer grows with every user—your feedback shapes what we build. Wisdom that has guided the world's most successful people should be available to anyone curious enough to explore. Thank you for being part of this mission.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
