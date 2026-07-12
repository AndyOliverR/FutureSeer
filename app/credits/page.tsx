'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { CreditPackCheckout } from '@/components/billing/CreditPackCheckout';
import { CreditBalanceWidget } from '@/components/billing/CreditBalanceWidget';
import { useBillingCredits } from '@/hooks/useBillingCredits';
import { Button } from '@/components/ui/button';

export default function CreditsPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { snapshot } = useBillingCredits();
  const countryCode = userProfile?.country?.trim().toUpperCase() || 'IN';

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-300">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-serif text-amber-200 mb-3">Credits</h1>
        <p className="text-slate-300 mb-6 max-w-md">
          Sign in to buy credits and use the full app — first reading in each area is free.
        </p>
        <Button asChild>
          <Link href="/signin?redirect=/credits">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen starfield-ultra-sharp">
      <div className="relative z-10 container mx-auto px-4 py-10 max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-amber-200 mb-2">
              Add credits
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Pay as you go — full access to every tool. Your first Main Seer question, first Ask
              the Seer per tool, and first profile regen are free.
            </p>
          </div>
          <CreditBalanceWidget />
        </div>

        {snapshot?.unlimited ? (
          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/60 p-6 mb-8">
            <p className="text-amber-100">
              You have unlimited membership — no credits needed for AI readings.
            </p>
            <Button asChild variant="outline" className="mt-4 border-amber-500/40">
              <Link href="/pricing">Manage membership</Link>
            </Button>
          </div>
        ) : (
          <CreditPackCheckout countryCode={countryCode} />
        )}

        <div className="mt-10 rounded-xl border border-slate-700/50 bg-slate-900/30 p-5 text-sm text-slate-400">
          <p className="font-medium text-slate-300 mb-2">How credits work</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Main Seer — 1 credit per question (first question free)</li>
            <li>Tool Seer — 1 credit per question (first per tool free)</li>
            <li>Full profile regen — 8 credits (first regen free)</li>
            <li>Reading stored reports — always free</li>
          </ul>
          <p className="mt-4">
            Prefer unlimited?{' '}
            <Link href="/pricing" className="text-amber-300 hover:underline">
              See membership plans
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
