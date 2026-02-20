"use client";

import { motion } from "framer-motion";
import { UserPlus, Calendar, Sparkles, MessageCircle } from 'lucide-react';
import { AboutSection } from './AboutSection';

const steps = [
  {
    icon: UserPlus,
    title: "Fill Your Details",
    description: "Enter your birth details for personalized readings"
  },
  {
    icon: Calendar,
    title: "Choose the Tool",
    description: "Select from Vedic astrology, Tarot, Numerology, and more"
  },
  {
    icon: Sparkles,
    title: "Ask the Seer",
    description: "Receive comprehensive analysis powered by ancient wisdom and modern AI"
  },
  {
    icon: MessageCircle,
    title: "Share Feedback",
    description: "Use the feedback button to share screenshots and suggestions—we implement improvements quickly."
  }
];

export function AboutHowItWorks() {
  return (
    <AboutSection 
      title="How It Works" 
      subtitle="Your journey begins in simple steps"
    >
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.1,
            },
          },
        }}
      >
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: index * 0.1,
                ease: [0, 0, 0.2, 1],
                duration: 0.35
              }}
              className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-colors duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-4">
                <Icon className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-white/80 font-light">{step.description}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </AboutSection>
  );
}
