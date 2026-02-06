'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Star, Send, Sparkles, MessageCircle, ChevronDown, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useFeedback } from '@/components/FeedbackContext';
import { useModalOpen } from '@/components/ModalOpenContext';
import html2canvas from 'html2canvas';

const ratingOptions = [
  { value: 1, label: 'Poor', color: 'from-red-400 to-red-600', bgColor: 'bg-gradient-to-r from-red-400/20 to-red-600/20', borderColor: 'border-red-400/40', glowColor: 'shadow-red-400/60' },
  { value: 2, label: 'Fair', color: 'from-orange-400 to-orange-600', bgColor: 'bg-gradient-to-r from-orange-400/20 to-orange-600/20', borderColor: 'border-orange-400/40', glowColor: 'shadow-orange-400/60' },
  { value: 3, label: 'Good', color: 'from-yellow-400 to-yellow-600', bgColor: 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20', borderColor: 'border-orange-400/40', glowColor: 'shadow-yellow-400/60' },
  { value: 4, label: 'Very Good', color: 'from-blue-400 to-gray-400', bgColor: 'bg-gradient-to-r from-blue-400/20 to-gray-400/20', borderColor: 'border-blue-400/40', glowColor: 'shadow-blue-400/60' },
  { value: 5, label: 'Excellent', color: 'from-amber-400 to-yellow-400', bgColor: 'bg-gradient-to-r from-amber-400/20 to-yellow-400/20', borderColor: 'border-amber-400/40', glowColor: 'shadow-amber-400/60' }
];

interface MysticalFeedbackProps {
  variant?: 'floating' | 'header';
}

export function MysticalFeedback({ variant = 'floating' }: MysticalFeedbackProps = {}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [containerReady, setContainerReady] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { isOpen: contextOpen, close: contextClose } = useFeedback();
  const { isAnyModalOpen } = useModalOpen();
  const modalRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Ensure component only renders on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync from context: when hamburger "Share Feedback" opens, expand panel
  useEffect(() => {
    if (contextOpen) {
      setIsExpanded(true);
      contextClose(); // reset so next open() from menu triggers again
    }
  }, [contextOpen, contextClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          feedback,
          screenshots,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          userId: user?.uid,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      toast({
        title: "✨ Feedback Submitted! ✨",
        description: "Thank you for sharing your mystical experience with us. Your insights help us grow! 🌟",
      });

      // Reset form
      setRating(null);
      setFeedback('');
      setScreenshots([]);
      setIsExpanded(false);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const captureScreenshot = async () => {
    try {
      setIsCapturingScreenshot(true);
      
      // Hide the feedback modal temporarily during capture
      const modalElement = modalRef.current?.parentElement;
      if (modalElement) {
        modalElement.style.visibility = 'hidden';
      }

      // Capture the viewport (excluding the feedback modal)
      const canvas = await html2canvas(document.body, {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        useCORS: true,
        logging: false,
        scale: 1,
        allowTaint: false,
        backgroundColor: '#0a0f1f',
        ignoreElements: (element) => {
          const isModal = element === modalElement || element.closest('[data-feedback-widget]') != null;
          return !!isModal;
        },
        onclone: (clonedDoc) => {
          // Fix: Remove filters and simplify gradients to prevent html2canvas gradient rendering issues
          // html2canvas has trouble with CSS filters, complex gradients, and pseudo-elements
          // This fix ensures screenshots can be captured by simplifying the cloned document
          try {
            const style = clonedDoc.createElement('style');
            style.textContent = `
              /* Remove filters from pseudo-elements */
              body.starfield-ultra-sharp::before,
              body::before,
              body::after {
                filter: none !important;
                -webkit-filter: none !important;
                -moz-filter: none !important;
                display: none !important;
              }
              
              /* Simplify complex gradients - replace with solid colors */
              * {
                background-image: none !important;
              }
              
              /* Keep only solid backgrounds */
              body,
              body.starfield-ultra-sharp {
                background-color: #0a0f1f !important;
                background-image: none !important;
              }
              
              /* Restore simple gradients only for elements that need them visually */
              nav,
              [class*="gradient"],
              [class*="bg-gradient"] {
                background: linear-gradient(90deg, #0a1128 0%, #0d1b35 50%, #0a1128 100%) !important;
              }
            `;
            clonedDoc.head.appendChild(style);
          } catch (err) {
            // If style injection fails, continue anyway - html2canvas may still work
            console.warn('Failed to simplify backgrounds for screenshot:', err);
          }
        },
      });

      // Restore visibility
      if (modalElement) {
        modalElement.style.visibility = 'visible';
      }

      // Convert to base64 data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setScreenshots(prev => [dataUrl, ...prev]);
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      toast({
        title: "Screenshot Capture Failed",
        description: "Could not capture screenshot. You can still submit feedback.",
        variant: "destructive",
      });
    } finally {
      setIsCapturingScreenshot(false);
    }
  };

  // Auto-capture screenshot when modal opens
  useEffect(() => {
    if (isExpanded && screenshots.length === 0) {
      // Small delay to ensure modal is fully rendered
      const timer = setTimeout(() => {
        captureScreenshot();
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  const handleAddScreenshot = () => {
    if (screenshots.length >= 3) {
      toast({
        title: "Maximum Screenshots",
        description: "You can add up to 3 screenshots.",
        variant: "destructive",
      });
      return;
    }
    captureScreenshot();
  };

  const handleRemoveScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    if (rating || feedback || screenshots.length > 0) {
      if (confirm('Are you sure you want to close? Your feedback will be lost.')) {
        setRating(null);
        setFeedback('');
        setScreenshots([]);
        setIsExpanded(false);
        contextClose();
      }
    } else {
      setIsExpanded(false);
      contextClose();
    }
  };

  // Don't render on server
  if (!mounted || typeof document === 'undefined' || !document.body) {
    return null;
  }

  const hideFromA11y = isAnyModalOpen && !isExpanded;

  const feedbackContent = (
    <div 
      ref={widgetRef}
      data-feedback-widget="true"
      data-onboarding="feedback"
      id="feedback-button"
      aria-hidden={hideFromA11y}
      className={variant === 'header' ? "pointer-events-auto" : "fixed pointer-events-auto"}
      data-variant={variant}
      style={variant === 'header' ? {
        position: 'relative',
        width: '40px',
        height: '40px',
        margin: 0,
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      } : {
        position: 'fixed',
        bottom: '80px',
        left: '4px',
        top: 'auto',
        right: 'auto',
        zIndex: 2147483647,
        pointerEvents: 'auto',
        visibility: 'visible',
        opacity: 1,
        display: 'block',
        margin: 0,
        padding: 0,
        width: 'auto',
        height: 'auto',
        minWidth: '48px',
        minHeight: '48px',
        transform: 'translateZ(0)',
      }}
    >
      {/* Main Feedback Panel */}
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div 
            ref={modalRef}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25, 
              ease: [0.2, 0, 0, 1] 
            }}
            className="bg-[var(--m3-surface-container-high)]/95 backdrop-blur-xl border border-[var(--m3-outline-variant)] rounded-2xl m3-elevation-3 hover:m3-elevation-4 m3-elevation-transition m3-gpu-accelerated w-[calc(100vw-32px)] sm:w-[400px] md:w-[500px] h-[calc(100vh-120px)] sm:h-[500px] md:h-[600px] absolute bottom-16 left-0 z-[9999] m3-transition-emphasized"
          >
        
            {/* Animated mystical glow effect - Only show when expanded */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--m3-primary)]/8 via-transparent to-[var(--m3-primary)]/8 rounded-2xl animate-pulse pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--m3-primary)]/5 via-transparent to-[var(--m3-primary)]/5 rounded-2xl pointer-events-none"></div>
            
            {/* Floating particles effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-6 left-6 w-1.5 h-1.5 bg-[var(--m3-primary)]/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="absolute top-12 right-8 w-1 h-1 bg-[var(--m3-tertiary)]/50 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-8 left-10 w-1 h-1 bg-[var(--m3-primary)]/40 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-6 right-6 w-1.5 h-1.5 bg-[var(--m3-tertiary)]/30 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
            </div>

            {/* Expanded State - Full Feedback Form */}
          <div className="relative h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[var(--m3-outline-variant)]">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-[var(--m3-primary-container)] rounded-lg">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--m3-on-primary-container)]" />
                </div>
                <div>
                  <h3 className="m3-title-large text-[var(--m3-on-surface)]">✨ Feedback ✨</h3>
                  <p className="m3-label-medium text-[var(--m3-on-surface-variant)]">Share your experience</p>
                </div>
              </div>
              <div className="flex gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsExpanded(false);
                    contextClose();
                  }}
                  className="text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-primary)] hover:bg-[var(--m3-primary-container)] rounded-lg m3-transition-standard p-1.5 sm:p-2"
                  aria-label="Collapse feedback panel"
                >
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-primary)] hover:bg-[var(--m3-primary-container)] rounded-lg m3-transition-standard p-1.5 sm:p-2"
                  aria-label="Close"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden />
                </Button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="h-[calc(100%-70px)] sm:h-[calc(100%-80px)] overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 scrollbar-thin scrollbar-thumb-[var(--m3-primary)]/30 scrollbar-track-transparent">
              <motion.form 
                onSubmit={handleSubmit} 
                className="space-y-3 sm:space-y-4"
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
                {/* Rating Section */}
                <motion.div 
                  className="space-y-2 sm:space-y-3"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        ease: [0, 0, 0.2, 1],
                        duration: 0.3,
                      },
                    },
                  }}
                >
                  <label className="m3-label-large text-[var(--m3-on-surface)]">
                    ✨ Rate your experience ✨
                  </label>
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {ratingOptions.map((option, index) => (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => setRating(option.value)}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          delay: index * 0.05,
                          ease: [0, 0, 0.2, 1],
                        }}
                        className={`relative p-2 sm:p-3 rounded-lg border-2 m3-ripple m3-button-bounce m3-transition-standard transform hover:scale-105 will-change-transform ${
                          rating === option.value
                            ? `bg-[var(--m3-primary-container)] border-[var(--m3-primary)] m3-elevation-2`
                            : 'bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] hover:border-[var(--m3-primary)]/50 hover:bg-[var(--m3-primary-container)]'
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--m3-primary)] via-[var(--m3-tertiary)] to-[var(--m3-primary)] rounded-full blur-md opacity-20 scale-125 pointer-events-none" />
                        <div className="relative z-10">
                          <Star className={`w-4 h-4 sm:w-5 sm:w-5 mx-auto mb-1 ${
                            rating === option.value 
                              ? 'text-[var(--m3-on-primary-container)]' 
                              : 'text-[var(--m3-on-surface-variant)]'
                          }`} />
                          <p className={`m3-label-small ${
                            rating === option.value 
                              ? 'text-[var(--m3-on-primary-container)]' 
                              : 'text-[var(--m3-on-surface)]'
                          }`}>
                            {option.label}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Screenshot Section */}
                <motion.div 
                  className="space-y-2 sm:space-y-3"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        ease: [0, 0, 0.2, 1],
                        duration: 0.3,
                      },
                    },
                  }}
                >
                  <div className="flex items-center justify-between">
                    <label className="m3-label-large text-[var(--m3-on-surface)]">
                      📸 Screenshot{screenshots.length > 0 ? ` (${screenshots.length}/3)` : ''}
                    </label>
                    {screenshots.length < 3 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddScreenshot}
                        disabled={isCapturingScreenshot}
                        className="m3-label-small border-[var(--m3-outline-variant)] text-[var(--m3-primary)] hover:bg-[var(--m3-primary-container)] hover:border-[var(--m3-primary)]/50 py-1 px-2 h-auto m3-transition-standard"
                      >
                        {isCapturingScreenshot ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 border-2 border-amber-300 border-t-transparent rounded-full animate-spin"></div>
                            Capturing...
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <ImageIcon className="w-3 h-3" />
                            Add Another
                          </div>
                        )}
                      </Button>
                    )}
                  </div>
                  
                  {screenshots.length === 0 && !isCapturingScreenshot && (
                    <div className="m3-body-small text-[var(--m3-on-surface-variant)] bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] rounded-lg p-3">
                      Screenshot will be captured automatically when you open this form.
                    </div>
                  )}

                  {screenshots.length > 0 && (
                    <div className="space-y-2">
                      {screenshots.map((screenshot, index) => (
                        <div key={index} className="relative group bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] rounded-lg overflow-hidden">
                          <img 
                            src={screenshot} 
                            alt={`Screenshot ${index + 1}`}
                            className="w-full h-auto max-h-32 object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveScreenshot(index)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 m3-ripple m3-button-bounce m3-transition-standard"
                            aria-label={`Remove screenshot ${index + 1}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Feedback Section */}
                <motion.div 
                  className="space-y-2 sm:space-y-3"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        ease: [0, 0, 0.2, 1],
                        duration: 0.3,
                      },
                    },
                  }}
                >
                  <label htmlFor="feedback" className="m3-label-large text-[var(--m3-on-surface)]">
                    💫 Share your thoughts (optional) 💫
                  </label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us what suggestion you'd like to add, what improvement you'd like to see next, or what feature you'd like implemented here..."
                    className="min-h-[80px] sm:min-h-[100px] bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] placeholder:text-[var(--m3-on-surface-variant)] m3-input-focus focus:border-[var(--m3-primary)] focus:shadow-[0_0_0_3px_var(--m3-primary-container)] rounded-lg backdrop-blur-sm m3-transition-standard hover:border-[var(--m3-outline)] resize-none m3-body-medium"
                    rows={3}
                  />
                </motion.div>

                {/* Submit Buttons */}
                <motion.div 
                  className="flex gap-2 pt-2"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        ease: [0, 0, 0.2, 1],
                        duration: 0.3,
                      },
                    },
                  }}
                >
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleClose}
                    className="flex-1 border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] hover:bg-[var(--m3-primary-container)] hover:border-[var(--m3-primary)] rounded-lg m3-transition-standard m3-label-large py-1.5 sm:py-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="filled"
                    disabled={!rating || isSubmitting}
                    className="flex-1 bg-[var(--m3-primary)] hover:bg-[var(--m3-primary)]/90 text-[var(--m3-on-primary)] font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg m3-elevation-2 hover:m3-elevation-3 m3-elevation-transition transform hover:scale-[1.02] m3-transition-emphasized m3-gpu-accelerated disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none m3-label-large"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Send className="w-2.5 h-3 sm:w-3 sm:h-3" />
                        Submit
                      </div>
                    )}
                  </Button>
                </motion.div>
              </motion.form>
            </div>
          </div>
          </motion.div>
        ) : (
          <motion.button
            onClick={() => setIsExpanded(true)}
            tabIndex={hideFromA11y ? -1 : 0}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={variant === 'header' 
              ? "w-10 h-10 relative flex items-center justify-center hover:scale-110 m3-ripple m3-button-bounce m3-transition-standard will-change-transform cursor-pointer text-[var(--m3-primary)] hover:text-[var(--m3-primary)]/80 bg-transparent border-none"
              : "w-12 h-12 sm:w-14 sm:h-14 relative flex items-center justify-center bg-transparent border-none hover:scale-110 m3-ripple m3-button-bounce m3-transition-standard will-change-transform cursor-pointer"
            }
            title="Share Feedback"
            aria-label="Share Feedback"
            style={variant === 'header' ? { width: '40px', height: '40px', minWidth: '40px', minHeight: '40px' } : { width: '48px', height: '48px', minWidth: '48px', minHeight: '48px' }}
          >
            {/* Icon - outline only, no background or shadow */}
            <MessageCircle className={variant === 'header' ? "w-5 h-5 text-[var(--m3-primary)] stroke-1 fill-none" : "w-7 h-7 sm:w-9 sm:h-9 text-[var(--m3-primary)] stroke-1 fill-none"} aria-hidden />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );

  // Render using portal directly to document.body (for floating) or return inline (for header)
  // CRITICAL: Portal to document.body ensures fixed positioning works relative to viewport
  // CSS ensures body doesn't have transform that would create containing block
  if (variant === 'header') {
    return feedbackContent;
  }
  
  // Ensure document.body exists before portal (safety check)
  // Portal to body ensures the element is a direct child, allowing fixed positioning
  // to work relative to viewport (not body) when body transform is removed via CSS
  if (typeof document !== 'undefined' && document.body) {
    return createPortal(feedbackContent, document.body);
  }
  
  // Fallback: return null if document.body doesn't exist
  return null;
}
