'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/hooks/useOnboarding';
import { onboardingSteps, OnboardingStep } from '@/lib/onboardingSteps';

export function OnboardingTour() {
  const { isTourActive, shouldShowTour, startTour, markCompleted, markSkipped, setIsTourActive } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Auto-start tour for new users
  useEffect(() => {
    if (shouldShowTour && !isTourActive) {
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        startTour();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldShowTour, isTourActive, startTour]);

  // Find and highlight target element
  useEffect(() => {
    if (!isTourActive || currentStep >= onboardingSteps.length) return;

    const step = onboardingSteps[currentStep];
    let element: HTMLElement | null = null;

    if (step.target === 'body') {
      element = document.body;
    } else {
      element = document.querySelector(step.target) as HTMLElement;
    }

    setTargetElement(element);

    // Scroll element into view if needed
    if (element && element !== document.body) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isTourActive, currentStep]);

  if (!isTourActive || currentStep >= onboardingSteps.length) {
    return null;
  }

  const step = onboardingSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === onboardingSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      markCompleted();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    markSkipped();
  };

  const handleComplete = () => {
    markCompleted();
  };

  // Calculate tooltip position
  const getTooltipPosition = () => {
    if (!targetElement || step.target === 'body') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const rect = targetElement.getBoundingClientRect();
    const placement = step.placement || 'bottom';

    switch (placement) {
      case 'top':
        return {
          top: `${rect.top - 20}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          top: `${rect.bottom + 20}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.left - 20}px`,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.right + 20}px`,
          transform: 'translate(0, -50%)',
        };
      default:
        return {
          top: `${rect.bottom + 20}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translate(-50%, 0)',
        };
    }
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isTourActive && (
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={(e) => {
              // Only close on overlay click, not tooltip
              if (e.target === overlayRef.current) {
                handleSkip();
              }
            }}
          >
            {/* Highlight target element */}
            {targetElement && targetElement !== document.body && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute border-4 border-amber-400 rounded-lg pointer-events-none"
                style={{
                  top: targetElement.getBoundingClientRect().top + window.scrollY - 4,
                  left: targetElement.getBoundingClientRect().left + window.scrollX - 4,
                  width: targetElement.getBoundingClientRect().width + 8,
                  height: targetElement.getBoundingClientRect().height + 8,
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <AnimatePresence>
        {isTourActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed z-[9999] max-w-sm"
            style={getTooltipPosition()}
          >
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-amber-400/50 rounded-xl p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-white/80 text-sm leading-relaxed">{step.content}</p>
                </div>
                <button
                  onClick={handleSkip}
                  className="ml-4 text-white/60 hover:text-white transition-colors"
                  aria-label="Close tour"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress indicator */}
              <div className="mb-4">
                <div className="flex gap-1">
                  {onboardingSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        index <= currentStep ? 'bg-amber-400' : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-white/60 mt-2 text-center">
                  Step {currentStep + 1} of {onboardingSteps.length}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-white/70 hover:text-white"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip Tour
                </Button>

                <div className="flex gap-2">
                  {!isFirstStep && (
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      className="border-amber-400/50 text-white hover:bg-amber-400/10"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    onClick={isLastStep ? handleComplete : handleNext}
                    className="bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 hover:from-amber-600 hover:to-yellow-500"
                  >
                    {isLastStep ? 'Get Started' : 'Next'}
                    {!isLastStep && <ChevronRight className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Arrow pointing to target */}
            {targetElement && targetElement !== document.body && step.placement && step.placement !== 'center' && (
              <div
                className="absolute w-0 h-0"
                style={{
                  [step.placement === 'top' ? 'bottom' : step.placement === 'bottom' ? 'top' : step.placement === 'left' ? 'right' : 'left']: '-16px',
                  left: step.placement === 'left' || step.placement === 'right' ? '50%' : '50%',
                  transform: step.placement === 'left' || step.placement === 'right' ? 'translateY(-50%)' : 'translateX(-50%)',
                  borderWidth: '8px',
                  borderStyle: 'solid',
                  borderColor: step.placement === 'top' 
                    ? 'transparent transparent rgba(251, 191, 36, 0.8) transparent'
                    : step.placement === 'bottom'
                    ? 'rgba(251, 191, 36, 0.8) transparent transparent transparent'
                    : step.placement === 'left'
                    ? 'transparent rgba(251, 191, 36, 0.8) transparent transparent'
                    : 'transparent transparent transparent rgba(251, 191, 36, 0.8)',
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
