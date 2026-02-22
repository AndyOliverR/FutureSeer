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
      className={`mb-16 px-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ ease: [0.2, 0, 0, 1], duration: 0.6 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-amber-400 mb-2 uppercase tracking-tight">
          {title}
        </h2>
        <p className="text-sm sm:text-base text-surface-on-variant max-w-2xl mx-auto font-normal leading-relaxed">
          {subtitle}
        </p>
      </div>
      {children}
    </motion.section>
  );
}
