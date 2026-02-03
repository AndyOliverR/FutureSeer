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
    description: "Click the feedback button to share screenshots and suggestions. Your feedback is implemented almost instantly."
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
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                delay: index * 0.1,
                ease: [0, 0, 0.2, 1],
                duration: 0.4
              }}
              className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105"
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

      {/* Feedback Button Explanation */}
      <motion.div 
        className="mt-8 p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 rounded-xl max-w-7xl mx-auto transition-all duration-300 hover:scale-105"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          ease: [0, 0, 0.2, 1], 
          duration: 0.4,
          delay: 0.5
        }}
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/30 mb-4">
          <MessageCircle className="w-7 h-7 text-amber-400" />
        </div>
        <h4 className="text-2xl font-bold text-amber-400 mb-3">
          Share Your Feedback with Screenshot
        </h4>
        <p className="text-sm text-white/80 leading-relaxed font-light">
          Found something that could be improved? Click the feedback button (bottom-left corner) to share a screenshot and your suggestions. 
          Our team reviews every piece of feedback personally and implements improvements within 24-48 hours. Your voice shapes our product in real-time.
        </p>
      </motion.div>
    </AboutSection>
  );
}
