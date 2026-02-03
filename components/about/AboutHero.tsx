"use client";

import { motion } from "framer-motion";

export function AboutHero() {
  return (
    <motion.section 
      className="text-center mb-20 px-4 sm:px-6 pt-20 m3-gpu-accelerated"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ease: [0, 0, 0.2, 1], duration: 0.5 }}
    >
      <motion.h1 
        className="m3-display-medium md:m3-display-large font-serif text-transparent bg-clip-text bg-gradient-to-b from-[var(--m3-on-primary-container)] via-[var(--m3-tertiary)] to-[var(--m3-primary)] mb-6 font-semibold"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: [0, 0, 0.2, 1], duration: 0.5, delay: 0.1 }}
      >
        About FutureSeer
      </motion.h1>
      <motion.p 
        className="m3-headline-small md:m3-headline-medium text-[var(--m3-on-surface-variant)] max-w-3xl mx-auto leading-relaxed font-light m3-transition-decelerated"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: [0, 0, 0.2, 1], duration: 0.5, delay: 0.2 }}
      >
        Where ancient wisdom meets artificial intelligence. Unlock the mysteries of your path through personalized divination powered by NASA-validated astronomical data and time-tested traditional methods.
      </motion.p>
    </motion.section>
  );
}
