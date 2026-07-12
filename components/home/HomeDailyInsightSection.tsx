"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMysticalProfileContext } from "@/contexts/MysticalProfileContext";
import { buildDailyInsightCardData } from "@/lib/dailyInsightForHome";
import { DailyInsightCard } from "@/components/daily/DailyInsightCard";

/**
 * Signed-in home strip: at-a-glance daily insight when user has started onboarding.
 */
export function HomeDailyInsightSection() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useMysticalProfileContext();

  const data = useMemo(
    () =>
      buildDailyInsightCardData(
        profile,
        userProfile?.displayName ?? userProfile?.fullName ?? user?.displayName ?? null,
      ),
    [profile, userProfile?.displayName, userProfile?.fullName, user?.displayName],
  );

  if (authLoading) return null;
  if (!user) return null;

  return (
    <div className="w-full max-w-lg mx-auto px-4 -mt-4 mb-8 md:mb-10 md:max-w-2xl">
      {profileLoading && !profile ? (
        <div
          className="rounded-2xl border border-[var(--m3-outline-variant)] md:border-amber-500/20 bg-[var(--m3-surface-container-high)] md:bg-slate-900/50 p-5 animate-pulse"
          aria-hidden
        >
          <div className="h-4 w-24 bg-[var(--m3-surface-container)] rounded mb-3" />
          <div className="h-6 w-3/4 bg-[var(--m3-surface-container)] rounded mb-4" />
          <div className="h-16 w-full bg-[var(--m3-surface-container)] rounded" />
        </div>
      ) : (
        <DailyInsightCard data={data} />
      )}
    </div>
  );
}
