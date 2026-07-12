'use client';

import Link from 'next/link';
import { Coins } from 'lucide-react';
import { useBillingCredits } from '@/hooks/useBillingCredits';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

export function CreditBalanceWidget({ className }: { className?: string }) {
  const { user } = useAuth();
  const { snapshot, loading } = useBillingCredits();

  if (!user) return null;

  if (snapshot?.unlimited) {
    return (
      <Link
        href="/pricing"
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-200 hover:bg-amber-500/20 transition-colors',
          className,
        )}
        title="Unlimited membership"
      >
        <Coins className="h-3.5 w-3.5" aria-hidden />
        <span>Unlimited</span>
      </Link>
    );
  }

  const balance = snapshot?.creditBalance ?? 0;
  const low = balance <= 3 && !loading;

  return (
    <Link
      href="/credits"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
        low
          ? 'border-amber-500/50 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25'
          : 'border-slate-600/60 bg-slate-900/50 text-slate-200 hover:border-amber-500/40',
        className,
      )}
      title="Add credits"
    >
      <Coins className="h-3.5 w-3.5 text-amber-400" aria-hidden />
      <span>{loading ? '…' : `${balance} credits`}</span>
    </Link>
  );
}
