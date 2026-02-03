"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Sparkles, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { initializeRazorpayOrderCheckout } from '@/lib/razorpayClient';

interface TipJarModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryCode?: string;
}

const QUICK_AMOUNTS = {
  IN: [50, 100, 250, 500],
  US: [5, 10, 25, 50],
  GB: [5, 10, 20, 50],
  EU: [5, 10, 25, 50],
  DEFAULT: [50, 100, 250, 500]
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  IN: '₹',
  US: '$',
  GB: '£',
  EU: '€',
  CA: 'C$',
  AU: 'A$',
  DEFAULT: '₹'
};

export function TipJarModal({ isOpen, onClose, countryCode = 'IN' }: TipJarModalProps) {
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const quickAmounts = QUICK_AMOUNTS[countryCode as keyof typeof QUICK_AMOUNTS] || QUICK_AMOUNTS.DEFAULT;
  const currencySymbol = CURRENCY_SYMBOLS[countryCode] || CURRENCY_SYMBOLS.DEFAULT;

  const handleQuickAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setCustomAmount(value);
      setSelectedAmount(null);
    }
  };

  const handleSendTip = async () => {
    const amount = selectedAmount || parseInt(customAmount);

    if (!amount || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid tip amount",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to send a tip",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const createRes = await fetch('/api/payments/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-order',
          amount,
          countryCode,
          userId: user.uid,
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(createData.error || 'Failed to create tip order');
      }

      const { orderId, razorpayKeyId } = createData;
      if (!orderId || !razorpayKeyId) {
        throw new Error('Missing order or key from server');
      }

      await initializeRazorpayOrderCheckout({
        orderId,
        key: razorpayKeyId,
        name: 'FutureSeer',
        description: 'Tip',
        prefill: {
          name: user.displayName || undefined,
          email: user.email || undefined,
        },
        handler: async (res) => {
          try {
            const verifyRes = await fetch('/api/payments/tip/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: res.razorpay_payment_id,
                razorpay_order_id: res.razorpay_order_id,
                razorpay_signature: res.razorpay_signature,
                userId: user.uid,
                amount,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || 'Verification failed');
            }
            toast({
              title: "Thank you! 💝",
              description: `Your tip of ${currencySymbol}${amount} helps keep FutureSeer accessible to all`,
              duration: 5000,
            });
            onClose();
            setCustomAmount('');
            setSelectedAmount(null);
          } catch (err: unknown) {
            console.error('Tip verify error:', err);
            toast({
              title: "Payment failed",
              description: err instanceof Error ? err.message : 'Verification failed. Please contact support.',
              variant: "destructive",
            });
          } finally {
            setIsProcessing(false);
          }
        },
        onError: () => {
          toast({
            title: "Payment cancelled",
            description: "You closed the payment window.",
            variant: "destructive",
          });
          setIsProcessing(false);
        },
      });
      // Don't clear isProcessing here; handler or onError will when user pays or dismisses
    } catch (error: unknown) {
      console.error('Error processing tip:', error);
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : 'Unable to process your tip. Please try again.',
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const finalAmount = selectedAmount || parseInt(customAmount) || 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
          className="fixed bg-[var(--m3-surface-container-high)]/95 backdrop-blur-xl border border-[var(--m3-outline-variant)] rounded-2xl m3-elevation-3 hover:m3-elevation-4 m3-elevation-transition m3-gpu-accelerated w-[calc(100vw-32px)] sm:w-[400px] md:w-[500px] h-auto max-h-[calc(100vh-120px)] sm:max-h-[500px] md:max-h-[600px] bottom-16 left-4 z-[9999]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Animated mystical glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--m3-secondary)]/8 via-transparent to-[var(--m3-secondary)]/8 rounded-2xl animate-pulse pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-[var(--m3-secondary)]/5 via-transparent to-[var(--m3-secondary)]/5 rounded-2xl pointer-events-none"></div>
          
          {/* Floating particles effect */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            <div className="absolute top-6 left-6 w-1.5 h-1.5 bg-[var(--m3-secondary)]/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="absolute top-12 right-8 w-1 h-1 bg-[var(--m3-secondary)]/50 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-8 left-10 w-1 h-1 bg-[var(--m3-secondary)]/40 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-6 right-6 w-1.5 h-1.5 bg-[var(--m3-secondary)]/30 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
          </div>

          <div className="relative flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[var(--m3-outline-variant)] flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-[var(--m3-secondary-container)] rounded-lg">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--m3-on-secondary-container)]" />
                </div>
                <div>
                  <h3 className="m3-title-large text-[var(--m3-on-surface)]">✨ Tip Jar ✨</h3>
                  <p className="m3-label-medium text-[var(--m3-on-surface-variant)]">Show your appreciation</p>
                </div>
              </div>
              <div className="flex gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-secondary)] hover:bg-[var(--m3-secondary-container)] rounded-lg m3-transition-standard p-1.5 sm:p-2"
                >
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-secondary)] hover:bg-[var(--m3-secondary-container)] rounded-lg m3-transition-standard p-1.5 sm:p-2"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[400px] sm:max-h-[450px] p-3 sm:p-3 space-y-2 sm:space-y-3 scrollbar-thin scrollbar-thumb-[var(--m3-secondary)]/30 scrollbar-track-transparent">

              {/* Quick Amount Buttons */}
              <div className="space-y-2">
                <label className="m3-label-large text-[var(--m3-on-surface)]">
                  💝 Select an amount 💝
                </label>
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleQuickAmountSelect(amount)}
                      className={`relative py-2 px-2 rounded-lg border-2 m3-ripple m3-button-bounce m3-transition-standard transform hover:scale-105 will-change-transform m3-elevation-0 hover:m3-elevation-1 active:m3-elevation-0 m3-elevation-transition ${
                        selectedAmount === amount
                          ? 'border-[var(--m3-secondary)] bg-[var(--m3-secondary-container)] text-[var(--m3-on-secondary-container)] m3-elevation-1'
                          : 'bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] hover:border-[var(--m3-secondary)]/50 hover:bg-[var(--m3-secondary-container)] text-[var(--m3-on-surface)]'
                      }`}
                    >
                      <div className="m3-label-small text-[var(--m3-on-surface-variant)]">{currencySymbol}</div>
                      <div className="m3-title-small font-bold">{amount}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount Input */}
              <div className="space-y-2">
                <label className="m3-label-large text-[var(--m3-on-surface)]">
                  💫 Or enter custom amount 💫
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--m3-on-surface-variant)] text-lg">
                    {currencySymbol}
                  </span>
                  <Input
                    type="text"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    placeholder="0"
                    className="pl-8 pr-4 py-2.5 sm:py-3 bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] text-base sm:text-lg m3-input-focus focus:border-[var(--m3-secondary)] focus:shadow-[0_0_0_3px_var(--m3-secondary-container)] rounded-lg backdrop-blur-sm m3-transition-standard hover:border-[var(--m3-secondary)]/40"
                  />
                </div>
              </div>

              {/* Total Display */}
              {finalAmount > 0 && (
                <div className="p-3 bg-[var(--m3-secondary-container)] border border-[var(--m3-outline-variant)] rounded-lg m3-transition-standard">
                  <div className="flex items-center justify-between">
                    <span className="m3-body-medium text-[var(--m3-on-surface-variant)]">Your tip:</span>
                    <span className="m3-headline-small font-bold text-[var(--m3-secondary)]">
                      {currencySymbol}{finalAmount}
                    </span>
                  </div>
                </div>
              )}

              {/* Send Tip Button */}
              <Button
                variant="filled"
                onClick={handleSendTip}
                disabled={finalAmount <= 0 || isProcessing}
                className="w-full bg-[var(--m3-secondary)] hover:bg-[var(--m3-secondary)]/90 text-[var(--m3-on-secondary)] font-semibold py-2 rounded-lg m3-elevation-2 hover:m3-elevation-3 m3-elevation-transition transform hover:scale-[1.02] m3-transition-emphasized disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none m3-label-large m3-gpu-accelerated"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                    Send Tip {finalAmount > 0 && `${currencySymbol}${finalAmount}`}
                  </div>
                )}
              </Button>

              {/* Footer Note */}
              <p className="text-center m3-body-small text-[var(--m3-on-surface-variant)] mt-2">
                Your contribution is a one-time payment. You can tip anytime you want.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
