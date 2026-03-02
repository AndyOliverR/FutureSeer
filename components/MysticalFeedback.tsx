'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Star, Send, Sparkles, MessageCircle, ImageIcon, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useFeedback } from '@/components/FeedbackContext';
import { useModalOpen } from '@/components/ModalOpenContext';
import html2canvas from 'html2canvas';
import { devLog } from '@/lib/devLogger';

const ratingOptions = [
  { value: 1, label: 'Poor' },
  { value: 2, label: 'Fair' },
  { value: 3, label: 'Good' },
  { value: 4, label: 'V. Good' },
  { value: 5, label: 'Excellent' }
];

export function MysticalFeedback({ variant = 'floating' }: { variant?: 'floating' | 'header' } = {}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { isOpen: contextOpen, close: contextClose } = useFeedback();
  const { isAnyModalOpen } = useModalOpen();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (contextOpen) {
      setIsExpanded(true);
      const t = setTimeout(() => contextClose(), 0);
      return () => clearTimeout(t);
    }
  }, [contextOpen, contextClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating, feedback, screenshots,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          userId: user?.uid,
        }),
      });
      if (!response.ok) throw new Error('Failed');
      toast({ title: "Feedback Sent!", description: "Thank you! 🌟" });
      setRating(null); setFeedback(''); setScreenshots([]); setIsExpanded(false);
    } catch (error) {
      toast({ title: "Failed", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const captureScreenshot = async () => {
    try {
      setIsCapturingScreenshot(true);
      // Hide modal for capture
      const modal = modalRef.current;
      if (modal) modal.style.opacity = '0';

      const canvas = await html2canvas(document.body, {
        width: window.innerWidth, height: window.innerHeight,
        useCORS: true, backgroundColor: '#0a0f1f',
        ignoreElements: (el) => !!el.closest('[data-feedback-widget]'),
        logging: false,
      });

      if (modal) modal.style.opacity = '1';

      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      setScreenshots(prev => [dataUrl, ...prev]);
    } catch (e) {
      devLog.error('Screenshot failed', e);
    } finally {
      setIsCapturingScreenshot(false);
    }
  };

  useEffect(() => {
    if (isExpanded && screenshots.length === 0) {
      setTimeout(() => captureScreenshot(), 600);
    }
  }, [isExpanded]);

  if (!mounted) return null;

  return (
    <>
      {variant === 'floating' && (
        <div
          data-feedback-widget="true"
          className="fixed z-[9999] pointer-events-none"
          style={{ bottom: '100px', left: '16px', width: '56px', height: '56px' }}
        >
          <motion.button
            onClick={() => setIsExpanded(true)}
            whileHover={{}}
            whileTap={{ scale: 0.9 }}
            className="pointer-events-auto w-14 h-14 bg-transparent border-none flex items-center justify-center relative"
          >
            <MessageCircle className="w-10 h-10 text-amber-500 relative z-10 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
          </motion.button>
        </div>
      )}

      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsExpanded(false)}
            />
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-surface-container-high border-t sm:border border-outline-variant rounded-t-3xl sm:rounded-3xl m3-elevation-3 overflow-hidden shadow-2xl"
              style={{ maxHeight: '90vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-outline-variant">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h3 className="text-xl font-heading font-bold text-surface-on">Mystical Feedback</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)} className="rounded-full">
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="p-5 overflow-y-auto custom-scrollbar space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Rating */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-surface-on opacity-70 uppercase tracking-widest">Rate Experience</label>
                    <div className="grid grid-cols-5 gap-2">
                      {ratingOptions.map(opt => (
                        <button
                          key={opt.value} type="button" onClick={() => setRating(opt.value)}
                          className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-1 ${rating === opt.value ? 'bg-primary-container border-amber-500' : 'bg-surface-container-low border-outline-variant'}`}
                        >
                          <Star className={`w-5 h-5 ${rating === opt.value ? 'fill-amber-500 text-amber-500' : 'text-surface-on-variant'}`} />
                          <span className="text-[9px] font-bold text-center leading-none">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Screenshots Area */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-surface-on opacity-70 uppercase tracking-widest">Context Captured</label>
                      {screenshots.length < 3 && (
                        <Button
                          type="button" variant="ghost" size="sm"
                          onClick={captureScreenshot} disabled={isCapturingScreenshot}
                          className="text-amber-500 text-xs h-auto py-1 px-2"
                        >
                          <ImageIcon className="w-3 h-3 mr-1" />
                          {isCapturingScreenshot ? "Capturing..." : "Add Screen"}
                        </Button>
                      )}
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                      {screenshots.length === 0 && !isCapturingScreenshot && (
                        <div className="w-full py-8 border-2 border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center opacity-40">
                          <ImageIcon className="w-8 h-8 mb-2" />
                          <span className="text-[10px]">Auto-capturing screen...</span>
                        </div>
                      )}
                      {screenshots.map((s, idx) => (
                        <div key={idx} className="relative flex-shrink-0 w-32 aspect-video bg-black rounded-xl overflow-hidden border border-outline-variant shadow-lg group">
                          <img src={s} alt="Capture" className="w-full h-full object-cover" />
                          <button
                            type="button" onClick={() => setScreenshots(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Text */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-surface-on opacity-70 uppercase tracking-widest">Your Insights</label>
                    <Textarea
                      value={feedback} onChange={e => setFeedback(e.target.value)}
                      placeholder="What's on your mind? The Seer is listening..."
                      className="min-h-[120px] bg-surface-container-low rounded-2xl border-outline-variant focus:border-amber-500 transition-all p-4"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsExpanded(false)} className="flex-1 h-12 rounded-2xl border-outline-variant font-bold">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!rating || isSubmitting} className="flex-1 h-12 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold shadow-lg shadow-amber-500/20">
                      {isSubmitting ? "Sending..." : "Submit"}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
