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
                <span className="text-primary-on-container text-4xl font-heading">A</span>
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
              I&apos;ve been drawn to the occult and divination for years, not out of superstition, but out of disciplined curiosity. Across cultures and civilizations, systems like Vedic Astrology, Bazi, Tarot, Numerology, Bibliomancy, and Geomancy were treated as structured frameworks of knowledge. They were consulted seriously, studied deeply, and refined over centuries.
            </p>
            <p>
              What fascinates me is not secrecy. It&apos;s depth. The intellectual architecture behind these systems is immense: layered symbolic logic, archetypal psychology, mathematical cycles, and cosmological models. Entire civilizations invested in mapping patterns of meaning, while modern culture often reduces that legacy into fragments.
            </p>
            <p>
              Futureseer exists to restore that depth in a modern form.
            </p>
            <p>
              This platform is not about blind belief. It is about exploration with discernment. Enter it like a vast library of symbolic intelligence. Test what you encounter against your own life. Keep what sharpens awareness. Let go of what does not.
            </p>
            <p>
              I come from a generation that learned to navigate hard transitions: analog to digital, certainty to volatility, old systems to new ones. That experience taught me to hold contradiction without paralysis, to adapt fast without abandoning first principles. That same mindset shapes this platform.
            </p>
            <p>
              Even when approached analytically, these traditions can function as structured reflection engines. They reveal patterns, expose blind spots, and force better questions. Used thoughtfully, they become cognitive tools for self-understanding, strategy, and decision-making.
            </p>
            <p>
              In a world moving quickly through technological waves, AI is powerful but still a phase. Enduring wisdom usually survives the cycle. Futureseer is built on that premise: combine contemporary intelligence with knowledge preserved by elders, scholars, and practitioners across centuries.
            </p>
            <p>
              Some people will look at the same signals and still miss what you see. That is not arrogance. It is perspective earned through study, pattern recognition, and lived experience. Futureseer is for people who take that perspective seriously.
            </p>
            <p>
              Here, culturally significant divination systems live in one refined platform. Instead of scattered interpretations, you get depth. Instead of generic readings, you engage structured frameworks designed for meaningful inquiry.
            </p>
            <p>
              If you are intellectually curious, ambitious, or exploring alternative models of insight, you may find this compelling.
            </p>
            <p>
              We&apos;re building something expansive. Over time, access may become more limited, not for hype, but to preserve quality, depth, and meaningful engagement.
            </p>
            <p>
              If you&apos;re here early, you&apos;re ahead of the curve.
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
            This is just the beginning. Your feedback will help shape what we build next.
          </p>
          <p className="font-sans text-sm sm:text-base leading-relaxed text-surface-on text-center">
            Crafted with ❤️ in India — For the World.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
