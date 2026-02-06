"use client";

import { useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { initializeRazorpayOrderCheckout } from '@/lib/razorpayClient';

export interface TipJarFormProps {
  countryCode: string;
}

const QUICK_AMOUNTS: Record<string, number[]> = {
  IN: [50, 100, 250, 500],
  US: [5, 10, 25, 50],
  GB: [5, 10, 20, 50],
  EU: [5, 10, 25, 50],
  DEFAULT: [50, 100, 250, 500],
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  IN: '₹',
  US: '$',
  GB: '£',
  EU: '€',
  CA: 'C$',
  AU: 'A$',
  DEFAULT: '₹',
};

export function TipJarForm({ countryCode }: TipJarFormProps) {
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const quickAmounts = QUICK_AMOUNTS[countryCode] || QUICK_AMOUNTS.DEFAULT;
  const currencySymbol = CURRENCY_SYMBOLS[countryCode] || CURRENCY_SYMBOLS.DEFAULT;

  const handleQuickAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setCustomAmount(value);
      setSelectedAmount(null);
    }
  };

  const handleSendTip = async () => {
    const amount = selectedAmount ?? parseInt(customAmount, 10);

    if (!amount || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid tip amount",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to send a tip",
        variant: "destructive",
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

  const finalAmount = selectedAmount || parseInt(customAmount, 10) || 0;

  return (
    <div className="relative flex flex-col space-y-6">
      {/* Quick Amount Buttons */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-amber-400">
          💝 Select an amount 💝
        </label>
        <div className="grid grid-cols-4 gap-2">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => handleQuickAmountSelect(amount)}
              className={`relative py-2 px-2 rounded-lg border-2 transition-all transform hover:scale-105 ${
                selectedAmount === amount
                  ? 'border-amber-400 bg-amber-500/20 text-amber-400'
                  : 'border-white/20 bg-slate-800/50 text-white hover:border-amber-500/50 hover:bg-amber-500/10'
              }`}
            >
              <div className="text-xs text-white/60">{currencySymbol}</div>
              <div className="font-bold">{amount}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Amount Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-amber-400">
          💫 Or enter custom amount 💫
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 text-lg">
            {currencySymbol}
          </span>
          <Input
            type="text"
            value={customAmount}
            onChange={handleCustomAmountChange}
            placeholder="0"
            className="pl-8 pr-4 py-3 bg-slate-800/50 border border-white/20 text-white text-base rounded-lg focus:border-amber-500/50 focus:ring-amber-500/20"
          />
        </div>
      </div>

      {/* Total Display */}
      {finalAmount > 0 && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/80">Your tip:</span>
            <span className="font-bold text-amber-400">
              {currencySymbol}{finalAmount}
            </span>
          </div>
        </div>
      )}

      {/* Send Tip Button */}
      <Button
        type="button"
        variant="filled"
        onClick={handleSendTip}
        disabled={finalAmount <= 0 || isProcessing}
        className="w-full bg-amber-500 hover:bg-amber-500/90 text-slate-900 font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            Processing...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Send Tip {finalAmount > 0 && `${currencySymbol}${finalAmount}`}
          </div>
        )}
      </Button>

      {/* Footer Note */}
      <p className="text-center text-sm text-white/60">
        Your contribution is a one-time payment. You can tip anytime you want.
      </p>
    </div>
  );
}
