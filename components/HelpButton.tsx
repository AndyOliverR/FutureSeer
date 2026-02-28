'use client';

import { useState } from 'react';
import { HelpCircle, RotateCcw, BookOpen, MessageCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useOnboarding } from '@/hooks/useOnboarding';
import Link from 'next/link';

export function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { startTour } = useOnboarding();

  const handleRestartTour = () => {
    setIsOpen(false);
    startTour();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center w-10 h-10 hover:scale-110 transition-all duration-200 text-amber-400 hover:text-amber-300 relative z-[102] focus-visible:outline-2 focus-visible:outline-amber-400 focus-visible:outline-offset-2 rounded"
        aria-label="Help"
        title="Help"
      >
        <HelpCircle className="w-5 h-5 text-current" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#020617] border-amber-400/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">Help Center</DialogTitle>
            <DialogDescription className="text-white/70">
              Get help with using FutureSeer
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Restart Tour */}
            <button
              onClick={handleRestartTour}
              className="w-full flex items-center gap-3 p-4 rounded-lg bg-[#0f172a]/80 border border-amber-400/30 hover:bg-[#0f172a] hover:border-amber-400/50 transition-colors text-left"
            >
              <div className="p-2 rounded-lg bg-amber-400/20">
                <RotateCcw className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Restart Tour</h3>
                <p className="text-sm text-white/60">Take the guided tour again</p>
              </div>
            </button>

            {/* How to Use */}
            <Link
              href="/how-to-use"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 p-4 rounded-lg bg-[#0f172a]/80 border border-amber-400/30 hover:bg-[#0f172a] hover:border-amber-400/50 transition-colors text-left"
            >
              <div className="p-2 rounded-lg bg-amber-400/20">
                <BookOpen className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">How to Use</h3>
                <p className="text-sm text-white/60">Complete guide to FutureSeer</p>
              </div>
            </Link>

            {/* Feedback */}
            <button
              onClick={() => {
                setIsOpen(false);
                // Trigger feedback button click
                const feedbackButton = document.querySelector('[data-onboarding="feedback"]') as HTMLElement;
                if (feedbackButton) {
                  feedbackButton.click();
                }
              }}
              className="w-full flex items-center gap-3 p-4 rounded-lg bg-[#0f172a]/80 border border-amber-400/30 hover:bg-[#0f172a] hover:border-amber-400/50 transition-colors text-left"
            >
              <div className="p-2 rounded-lg bg-amber-400/20">
                <MessageCircle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Share Feedback</h3>
                <p className="text-sm text-white/60">Help us improve FutureSeer</p>
              </div>
            </button>

            {/* Quick Tips */}
            <div className="pt-4 border-t border-amber-400/20">
              <h3 className="text-white font-semibold mb-3">Quick Tips</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li>• Complete your profile for personalized readings</li>
                <li>• Explore different divination tools for varied insights</li>
                <li>• Ask the Seer for instant answers to your questions</li>
                <li>• Your feedback shapes FutureSeer in real-time</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
