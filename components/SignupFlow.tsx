"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlanSelectionStep } from './PlanSelectionStep';
import { PaymentMethodCapture } from './PaymentMethodCapture';
import { AutoMandateAgreement } from './AutoMandateAgreement';

interface SignupFlowProps {
  // Step 1: Basic Info (handled by parent)
  email: string;
  password: string;
  displayName: string;
  selectedCountry: string;
  
  // URL params
  initialPlan?: 'power-user-trial' | 'buy-coffee' | 'treat-me' | 'festive-hamper';
  
  // Callbacks
  onComplete: (data: {
    selectedPlan: 'power-user-trial' | 'buy-coffee' | 'treat-me' | 'festive-hamper';
    paymentMethodId: string;
    autoMandateAccepted: boolean;
  }) => void;
  onError?: (error: string) => void;
}

export function SignupFlow({
  email,
  password,
  displayName,
  selectedCountry,
  initialPlan,
  onComplete,
  onError,
}: SignupFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<
    'power-user-trial' | 'buy-coffee' | 'treat-me' | 'festive-hamper'
  >(initialPlan || 'power-user-trial');
  const [paymentMethodId, setPaymentMethodId] = useState<string>('');
  const [autoMandateAccepted, setAutoMandateAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalSteps = 3; // Plan selection, Payment capture, Auto-mandate agreement

  const handlePlanSelected = (planId: 'power-user-trial' | 'buy-coffee' | 'treat-me' | 'festive-hamper') => {
    setSelectedPlan(planId);
  };

  const [subscriptionId, setSubscriptionId] = useState<string>('');

  const handlePaymentMethodCaptured = (methodId: string, subId?: string) => {
    setPaymentMethodId(methodId);
    if (subId) {
      setSubscriptionId(subId);
    }
    // Auto-advance to next step
    setTimeout(() => {
      setCurrentStep(3);
    }, 500);
  };

  const handleAgreementAccepted = (accepted: boolean) => {
    setAutoMandateAccepted(accepted);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Plan selection - can proceed if plan is selected
      if (selectedPlan) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      // Payment capture - handled by PaymentMethodCapture component
      // It will auto-advance when payment method is captured
    } else if (currentStep === 3) {
      // Auto-mandate agreement - proceed if accepted
      if (autoMandateAccepted && paymentMethodId) {
        handleComplete();
      } else {
        if (onError) {
          onError('Please accept the agreement to continue');
        }
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!paymentMethodId || !autoMandateAccepted) {
      if (onError) {
        onError('Please complete all steps');
      }
      return;
    }

    setIsProcessing(true);
    try {
      onComplete({
        selectedPlan,
        paymentMethodId,
        autoMandateAccepted,
        subscriptionId,
      });
    } catch (error: any) {
      if (onError) {
        onError(error.message || 'Failed to complete signup');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) return selectedPlan !== null;
    if (currentStep === 2) return paymentMethodId !== '';
    if (currentStep === 3) return autoMandateAccepted && paymentMethodId !== '';
    return false;
  };

  const stepTitles = [
    'Choose Your Contribution Tier',
    'Secure Your Spot',
    'Join the Innovation Team',
  ];

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
                  : 'text-slate-500'
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
          {currentStep === 1 && (
            <PlanSelectionStep
              selectedCountry={selectedCountry}
              initialPlan={selectedPlan}
              onPlanSelected={handlePlanSelected}
            />
          )}

          {currentStep === 2 && (
            <PaymentMethodCapture
              selectedPlan={selectedPlan}
              userEmail={email}
              userName={displayName}
              userCountry={selectedCountry}
              onPaymentMethodCaptured={handlePaymentMethodCaptured}
              onError={onError}
            />
          )}

          {currentStep === 3 && (
            <AutoMandateAgreement
              selectedPlan={selectedPlan}
              onAgreementAccepted={handleAgreementAccepted}
            />
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
