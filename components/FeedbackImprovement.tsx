"use client";

import { Button } from '@/components/ui/button';
import { Clock, MessageCircle, Sparkles } from 'lucide-react';
import { MysticalFeedback } from './MysticalFeedback';

interface FeedbackImprovementProps {
  variant?: 'section' | 'compact';
}

export function FeedbackImprovement({ variant = 'section' }: FeedbackImprovementProps) {
  // Mock recent improvements - in production, this would come from an API
  const recentImprovements = [
    {
      title: "Improved chart rendering",
      description: "Enhanced visual clarity based on user suggestions",
      implementedAt: "36 hours ago",
      userCount: 5
    },
    {
      title: "Added dark mode toggle",
      description: "User-requested feature for better viewing experience",
      implementedAt: "24 hours ago",
      userCount: 3
    },
    {
      title: "Enhanced tool selection UI",
      description: "Streamlined interface based on feedback",
      implementedAt: "48 hours ago",
      userCount: 8
    }
  ];

  const openFeedback = () => {
    // The MysticalFeedback component handles its own modal state
    // Trigger feedback modal opening (if needed, can be handled via context or ref)
  };

  if (variant === 'compact') {
    return (
      <div className="feedback-improvement-compact bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 rounded-xl p-6">
        <h4 className="text-xl font-serif text-amber-400 mb-3 font-normal">
          Your Feedback, Implemented Instantly
        </h4>
        <p className="text-sm text-white/80 font-light mb-4 leading-relaxed">
          We believe in a one-to-one, face-to-face approach. Every feedback is considered and 
          implemented almost instantly to make the tool better.
        </p>
        <Button 
          onClick={openFeedback}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 text-white font-semibold rounded-xl transition-all duration-300"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Share Feedback with Screenshot
        </Button>
      </div>
    );
  }

  return (
    <section className="feedback-improvement bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 rounded-2xl p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-6 h-6 text-amber-400" />
        <h3 className="text-2xl sm:text-3xl font-serif text-amber-400 font-normal">
          Your Feedback, Implemented Instantly
        </h3>
      </div>
      <p className="trust-messaging text-base sm:text-lg text-white/80 leading-relaxed font-light mb-6">
        We believe in a one-to-one, face-to-face approach. FutureSeer might not be perfect yet, 
        but <strong className="text-amber-400">every feedback from our users is considered and implemented almost instantly</strong> 
        to make the tool better. Your voice shapes our product in real-time.
      </p>
      
      <div className="rapid-response-highlight bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 rounded-xl p-4 mb-6">
        <div className="response-time flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-400" />
          <span className="text-amber-400 font-semibold">Average implementation time: 24-48 hours</span>
        </div>
      </div>
      
      <div className="recent-improvements mb-6">
        <h4 className="text-xl font-serif text-amber-400 mb-4 font-normal">
          Recent Improvements from User Feedback:
        </h4>
        <ul className="space-y-3">
          {recentImprovements.map((improvement, index) => (
            <li key={index} className="flex items-start gap-3 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 rounded-lg p-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mt-0.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
              </div>
              <div className="flex-1">
                <h5 className="text-amber-400 font-semibold text-sm mb-1">{improvement.title}</h5>
                <p className="text-white/80 text-xs font-light">Implemented {improvement.implementedAt}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="feedback-cta text-center">
        <Button 
          onClick={openFeedback}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 text-white font-semibold px-8 py-3 rounded-xl mb-3 flex items-center gap-2 mx-auto transition-all duration-300"
        >
          <MessageCircle className="w-5 h-5" />
          Share Your Feedback with Screenshot
        </Button>
        <p className="text-xs text-white/80 font-light max-w-xl mx-auto">
          Click the feedback button to share a screenshot. We review each submission personally 
          and implement improvements within 24-48 hours.
        </p>
      </div>
    </section>
  );
}
