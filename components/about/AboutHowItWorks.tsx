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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, ease: [0.2, 0, 0, 1] }}
              className="p-6 rounded-[32px] glass-effect hover:border-amber-500/40 transition-all flex flex-col items-center text-center shadow-xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                <Icon className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-lg font-heading font-bold gold-glow mb-2 uppercase tracking-tight">{step.title}</h3>
              <p className="text-sm text-surface-on leading-relaxed opacity-90">{step.description}</p>
            </motion.div>
          );
        })}
      </div>
    </AboutSection>
  );
}
