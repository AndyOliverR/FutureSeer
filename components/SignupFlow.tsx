"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { analytics } from '@/lib/analytics';

type SignupVariant = 'control' | 'story_first';

type SignupFlowStep = 'pain' | 'empathy' | 'solution' | 'wow';

interface SignupFlowProps {
  // URL params
  initialPlan?: 'power-user-trial' | 'buy-coffee' | 'treat-me' | 'festive-hamper';
  variant?: SignupVariant;
  
  // Callbacks (onComplete may be async; must be awaited so loading state matches real work)
  onComplete: (data: {
    selectedPlan?: 'power-user-trial' | 'buy-coffee' | 'treat-me' | 'festive-hamper';
    paymentMethodId?: string;
    autoMandateAccepted?: boolean;
    subscriptionId?: string;
  }) => void | Promise<void>;
  onError?: (error: string) => void;
}

export function SignupFlow({
  initialPlan,
  variant = 'control',
  onComplete,
}: SignupFlowProps) {
  const steps: SignupFlowStep[] =
    variant === 'story_first'
      ? ['pain', 'empathy', 'solution', 'wow']
      : ['wow'];
  const totalSteps = steps.length;
  const [currentStep, setCurrentStep] = useState(1);
  const currentStepKey = steps[currentStep - 1];
  const [isProcessing, setIsProcessing] = useState(false);

  const isIntroStep = currentStepKey === 'pain' || currentStepKey === 'empathy' || currentStepKey === 'solution' || currentStepKey === 'wow';

  const handleNext = () => {
    analytics.trackOnboardingStepNext(currentStepKey, currentStep, {
      surface: 'signup',
      variant,
    });
    if (isIntroStep) setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    if (currentStep > 1) {
      analytics.trackOnboardingStepBack(currentStepKey, currentStep, {
        surface: 'signup',
        variant,
      });
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsProcessing(true);
    try {
      await Promise.resolve(
        onComplete({
          selectedPlan: initialPlan || 'power-user-trial',
        }),
      );
    } catch {
      // Parent onComplete handles setError / logging and rethrows; avoid onError here so we do not
      // overwrite a friendly message with raw Firebase text when onError is the same as setError.
    } finally {
      setIsProcessing(false);
    }
  };

  const canProceed = () => {
    return isIntroStep;
  };

  const stepTitles = steps.map((step) => {
    if (step === 'pain') return 'Your Main Challenge';
    if (step === 'empathy') return 'You Are Understood';
    if (step === 'solution') return 'How We Help';
    if (step === 'wow') return 'Your Breakthrough';
    return 'Your Breakthrough';
  });

  useEffect(() => {
    analytics.trackOnboardingStepView(currentStepKey, currentStep, {
      surface: 'signup',
      variant,
    });
  }, [currentStep, currentStepKey, variant]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {stepTitles.map((title, index) => (
            <div
              key={index}
              className={`flex-1 text-center ${
                index < currentStep - 1
                  ? 'text-green-400'
                  : index === currentStep - 1
                  ? 'text-amber-400'
                  : 'text-slate-400'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${
                  index < currentStep - 1
                    ? 'bg-green-500'
                    : index === currentStep - 1
                    ? 'bg-amber-500'
                    : 'bg-slate-700'
                }`}
              >
                {index < currentStep - 1 ? (
                  <Check className="w-6 h-6 text-white" />
                ) : (
                  <span className="text-white font-semibold">{index + 1}</span>
                )}
              </div>
              <p className="text-xs font-serif hidden sm:block">{title}</p>
            </div>
          ))}
        </div>
        <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStepKey === 'pain' && (
            <div className="rounded-2xl border border-amber-500/30 bg-slate-900/50 p-6">
              <h3 className="text-xl font-semibold text-amber-300 mb-2">What is your biggest challenge right now?</h3>
              <p className="text-white/80">Most users tell us they feel scattered, spiritually disconnected, or overwhelmed by conflicting guidance.</p>
            </div>
          )}

          {currentStepKey === 'empathy' && (
            <div className="rounded-2xl border border-amber-500/30 bg-slate-900/50 p-6">
              <h3 className="text-xl font-semibold text-amber-300 mb-2">You are not alone.</h3>
              <p className="text-white/80">FutureSeer is designed for people who want grounded clarity without losing spiritual depth.</p>
            </div>
          )}

          {currentStepKey === 'solution' && (
            <div className="rounded-2xl border border-amber-500/30 bg-slate-900/50 p-6">
              <h3 className="text-xl font-semibold text-amber-300 mb-2">How FutureSeer helps</h3>
              <p className="text-white/80">You get tool-specific experts plus one unified Seer that combines insights across traditions while preserving each method.</p>
            </div>
          )}

          {currentStepKey === 'wow' && (
            <div className="rounded-2xl border border-amber-500/30 bg-slate-900/50 p-6">
              <h3 className="text-xl font-semibold text-amber-300 mb-2">Wow moment</h3>
              <p className="text-white/80">Within minutes of profile completion, all major reports are generated and stored so your next session starts with personalized depth.</p>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8">
        <Button
          onClick={handleBack}
          disabled={currentStep === 1 || isProcessing}
          variant="outline"
          className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {currentStep < totalSteps ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed() || isProcessing}
            className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-900 font-semibold"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={!canProceed() || isProcessing}
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold"
          >
            {isProcessing ? 'Completing...' : 'Complete Signup'}
            <Check className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
