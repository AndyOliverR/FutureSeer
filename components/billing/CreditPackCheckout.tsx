'use client';

import { useState } from 'react';
import { devLog } from '@/lib/devLogger';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { initializeRazorpayOrderCheckout } from '@/lib/razorpayClient';
import { listCreditPackOffers } from '@/lib/billingConfig';
import type { CreditPackId } from '@/lib/billingTypes';
import { useBillingCredits } from '@/hooks/useBillingCredits';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

export function CreditPackCheckout({
  countryCode,
  onSuccess,
  compact = false,
}: {
  countryCode: string;
  onSuccess?: () => void;
  compact?: boolean;
}) {
  const { user, userProfile } = useAuth();
  const { refresh } = useBillingCredits();
  const { toast } = useToast();
  const [processingPack, setProcessingPack] = useState<CreditPackId | null>(null);

  const packs = listCreditPackOffers(countryCode);

  const handleBuy = async (packId: CreditPackId) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to buy credits.',
        variant: 'destructive',
      });
      return;
    }

    setProcessingPack(packId);
    try {
      const token = await user.getIdToken();
      const createRes = await fetch('/api/payments/credits/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ packId, countryCode }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(createData.error || 'Could not start checkout');
      }

      await initializeRazorpayOrderCheckout({
        orderId: createData.orderId,
        key: createData.razorpayKeyId,
        name: 'FutureSeer',
        description: `${createData.credits} credits — ${packId}`,
        prefill: {
          name: userProfile?.displayName || user.displayName || undefined,
          email: user.email || userProfile?.email || undefined,
        },
        handler: async (response) => {
          try {
            const verifyRes = await fetch('/api/payments/credits/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${await user.getIdToken()}`,
              },
              body: JSON.stringify({
                ...response,
                packId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
            await refresh();
            toast({
              title: 'Credits added',
              description: `${verifyData.creditsAdded} credits — balance ${verifyData.creditBalance}`,
            });
            onSuccess?.();
          } catch (e) {
            devLog.error('Credit verify failed', e, 'CreditPackCheckout');
            toast({
              title: 'Verification failed',
              description: e instanceof Error ? e.message : 'Please contact support with your payment receipt.',
              variant: 'destructive',
            });
          }
        },
        onError: (err) => {
          if (err instanceof Error && err.message.includes('cancelled')) return;
          toast({
            title: 'Payment cancelled',
            description: 'No charge was made.',
          });
        },
      });
    } catch (e) {
      devLog.error('Credit checkout failed', e, 'CreditPackCheckout');
      toast({
        title: 'Checkout failed',
        description: e instanceof Error ? e.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessingPack(null);
    }
  };

  return (
    <div
      className={cn(
        'grid gap-4',
        compact ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 md:grid-cols-3',
      )}
    >
      {packs.map((pack, index) => {
        const highlighted = pack.packId === 'regular';
        return (
          <div
            key={pack.packId}
            className={cn(
              'relative rounded-2xl border p-5 flex flex-col',
              highlighted
                ? 'border-amber-500/50 bg-amber-500/10 md:scale-[1.02]'
                : 'border-slate-700/60 bg-slate-900/40',
            )}
          >
            {highlighted ? (
              <span className="absolute -top-2.5 left-4 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-950">
                Popular
              </span>
            ) : null}
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" aria-hidden />
              <h3 className="font-semibold text-amber-100">{pack.label}</h3>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{pack.formatted}</p>
            <p className="text-sm text-slate-300 mb-1">{pack.credits} credits</p>
            <p className="text-xs text-slate-400 mb-4 flex-1">{pack.tagline}</p>
            <Button
              type="button"
              disabled={processingPack !== null}
              onClick={() => handleBuy(pack.packId)}
              className={cn(
                'w-full',
                highlighted ? 'bg-amber-500 hover:bg-amber-400 text-slate-950' : '',
              )}
            >
              {processingPack === pack.packId ? 'Opening checkout…' : 'Buy credits'}
            </Button>
            {index === 0 ? (
              <p className="mt-2 text-[10px] text-slate-500 text-center">
                First use of each tool is free
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
