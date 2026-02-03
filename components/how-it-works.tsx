"use client";
import { UserPlus, Calendar, Sparkles, MessageCircle, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ReferralBenefitsSection } from "./ReferralBenefitsSection";
import { useAuth } from "@/hooks/use-auth";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

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

export function HowItWorks() {
  const [sectionRef, isVisible] = useIntersectionObserver<HTMLElement>({
    threshold: 0
  });
  
  // Start with visible=true to ensure content renders on first load
  const effectiveVisible = isVisible || true;

  const router = useRouter();
  const { userProfile } = useAuth();
  const userCountry = userProfile?.country || 'IN';

  return (
    <section ref={sectionRef} data-how-it-works className="py-10 sm:py-16">
      <div className="max-w-5xl mx-auto rounded-[28px] px-6 sm:px-12 py-12 text-center bg-slate-900/30 border border-slate-700/50 shadow-[0_30px_60px_rgba(0,0,0,0.55)] backdrop-blur-sm">
        <h2 className="text-3xl sm:text-4xl font-serif text-white mb-3 sm:mb-4 font-normal">
          Join the Innovation Experiment
        </h2>
        <p className="text-sm sm:text-base text-white text-center mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto font-light">
          See into your future using occult wisdom, AI forecasting, and hidden data patterns. Your journey begins in simple steps.
        </p>
        
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-12">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`relative flex flex-col items-center text-center px-4 transition-all duration-700 ${
                effectiveVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="mb-4 relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/30 to-yellow-400/20 flex items-center justify-center border border-amber-400/50 shadow-[0_12px_28px_rgba(0,0,0,0.5)]">
                  <step.icon className="w-7 h-7 text-amber-200 drop-shadow-[0_0_12px_rgba(255,215,0,0.4)]" />
                </div>
              </div>
              <h3 className="text-lg font-sans text-white mb-2 font-normal">{step.title}</h3>
              <p className="text-sm sm:text-base text-white leading-relaxed max-w-xs mx-auto font-light">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Feedback Button Explanation */}
        <div className="mt-8 p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl text-left">
          <h4 className="text-xl font-serif text-white mb-3 font-normal flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-amber-400" />
            Share Your Feedback
          </h4>
          <p className="text-white/90 font-light leading-relaxed mb-4">
            Found something that could be improved? Click the feedback button (bottom-left corner) to share a screenshot 
            and your suggestions. Our team reviews every piece of feedback personally and implements improvements 
            within 24-48 hours. Your voice shapes our product in real-time.
          </p>
          <p className="text-white/70 text-sm font-light italic">
            We believe in a one-to-one, face-to-face approach. Every feedback is considered and implemented almost instantly.
          </p>
        </div>

        {/* Sign Up CTA */}
        {!userProfile && (
          <div className="mt-8">
            <p className="text-white/80 font-light mb-4">
              Ready to join the innovation experiment? Start your journey and become a power user.
            </p>
            <Button
              onClick={() => router.push('/signup')}
              className="bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 hover:from-amber-400 hover:to-yellow-300 font-semibold px-8 py-3 rounded-xl inline-flex items-center gap-2"
            >
              Join the Experiment
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Referral Benefits (Compact) */}
      {userProfile && (
        <div className="mt-12">
          <ReferralBenefitsSection countryCode={userCountry} />
        </div>
      )}
    </section>
  );
}
