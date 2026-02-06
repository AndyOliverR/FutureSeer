"use client";

import { motion } from "framer-motion";

interface AboutSectionProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}

export function AboutSection({ title, subtitle, children, className = "" }: AboutSectionProps) {
  return (
    <motion.section 
      className={`mb-20 px-3 sm:px-4 md:px-6 ${className} m3-gpu-accelerated`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ease: [0, 0, 0.2, 1], duration: 0.4 }}
    >
      <motion.div 
        className="text-center mb-12"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        <motion.h2 
          className="m3-headline-large md:m3-headline-large font-serif text-transparent bg-clip-text bg-gradient-to-b from-[var(--m3-on-primary-container)] via-[var(--m3-tertiary)] to-[var(--m3-primary)] mb-4 font-semibold"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: {
                ease: [0, 0, 0.2, 1],
                duration: 0.4,
              },
            },
          }}
        >
          {title}
        </motion.h2>
        <motion.p 
          className="m3-body-large md:m3-headline-small text-[var(--m3-on-surface-variant)] max-w-2xl mx-auto font-light m3-transition-decelerated"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: {
                ease: [0, 0, 0.2, 1],
                duration: 0.4,
              },
            },
          }}
        >
          {subtitle}
        </motion.p>
      </motion.div>
      {children}
    </motion.section>
  );
}
