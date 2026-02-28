"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Sparkles, Brain, Globe, Heart } from "lucide-react";

export function PersonalNote() {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.section 
      className="px-4 pt-24 pb-12 max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: [0.2, 0, 0, 1], duration: 0.6 }}
    >
      <div className="glass-effect rounded-[32px] p-6 sm:p-10 shadow-2xl">
        {/* Founder Header */}
        <div className="flex flex-col items-center text-center md:flex-row md:text-left gap-6 mb-10">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-amber-500/20 shadow-lg">
            {imageError ? (
              <div className="w-full h-full bg-primary-container flex items-center justify-center">
                <span className="text-on-primary-container text-4xl font-heading">A</span>
              </div>
            ) : (
              <Image
                src="/assets/images/andy-rozario.jpg"
                alt="Founder"
                width={128}
                height={128}
                className="object-cover w-full h-full"
                onError={() => setImageError(true)}
              />
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-heading font-bold gold-glow tracking-tight">
              A Note From Me
            </h1>
            <p className="text-xl font-bold text-white tracking-wide">AnDY</p>
            <p className="text-surface-on-variant text-sm font-medium uppercase tracking-widest opacity-70">
              Founder, FutureSeer
            </p>
          </div>
        </div>

        {/* Content Body - full width, spread out to match page layout */}
        <div className="space-y-10">
          <div className="space-y-5 font-sans text-sm sm:text-base leading-relaxed text-surface-on">
            <p>
              I've been drawn to the occult and divination for years—not from superstition, but from curiosity. Across cultures and civilizations, these systems were treated as structured knowledge frameworks: Vedic Astrology, Bazi, Tarot, Numerology, Bibliomancy, geomancy, and dozens more. They weren't casual novelties. They were consulted seriously.
            </p>
            <p>
              What fascinated me wasn't secrecy. It was depth. The sheer intellectual architecture behind these systems is immense—layered logic, symbolic mathematics, archetypal psychology, cosmology. Entire civilizations refined them over centuries. Yet most people today only see fragmented, oversimplified versions.
            </p>
            <p>
              Futureseer exists to change that.
            </p>
            <p>
              This is not about belief. It's about exploration. Think of it as entering a vast library of symbolic intelligence that few people fully explore. You don't need to accept it blindly. Experience it. Test it against your own life. Extract insight. Discard what doesn't resonate. Keep what sharpens your awareness.
            </p>
            <p>
              Even if you approach it analytically, these systems function as structured reflection engines. They surface blind spots. They reveal patterns. They force better questions. Used correctly, they become cognitive tools.
            </p>
            <p>
              Futureseer brings together culturally significant, historically rich divination systems into one refined platform. Instead of scattered interpretations, you get depth. Instead of generic readings, you get structured frameworks.
            </p>
            <p>
              If you're intellectually curious, ambitious, or simply exploring alternative models of decision-making, you'll find this compelling.
            </p>
            <p>
              We're building something expansive. Over time, access will become limited and invite-only. Not for hype—but to preserve quality, depth, and serious engagement.
            </p>
            <p>
              If you're here early, you're ahead of the curve.
            </p>
            <p>
              Explore it before the doors narrow.
            </p>
          </div>

          {/* Mission Card */}
          <div className="p-6 bg-black/20 rounded-3xl border border-amber-500/10 shadow-inner">
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
          <p className="font-sans text-sm sm:text-base leading-relaxed text-surface-on">
            This is just the beginning. Your feedback shapes what we build. Thank you for being part of this mission.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
