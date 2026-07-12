'use client';

import { useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMysticalProfileContext } from '@/contexts/MysticalProfileContext';
import { buildStrategicReadData } from '@/lib/strategicRead';
import { StrategicReadCard } from '@/components/foresight/StrategicReadCard';

export function HomeStrategicReadSection() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useMysticalProfileContext();

  const data = useMemo(
    () =>
      buildStrategicReadData(
        profile,
        userProfile?.displayName ?? userProfile?.fullName ?? user?.displayName ?? null,
      ),
    [profile, userProfile?.displayName, userProfile?.fullName, user?.displayName],
  );

  if (authLoading) return null;
  if (!user) return null;

  return (
    <div className="w-full max-w-lg mx-auto px-4 mb-8 md:mb-10 md:max-w-2xl">
      {profileLoading && !profile ? (
        <div
          className="rounded-2xl border border-[var(--m3-outline-variant)] md:border-violet-500/20 bg-[var(--m3-surface-container-high)] md:bg-slate-900/50 p-5 animate-pulse"
          aria-hidden
        >
          <div className="h-4 w-28 bg-[var(--m3-surface-container)] rounded mb-3" />
          <div className="h-6 w-2/3 bg-[var(--m3-surface-container)] rounded mb-4" />
          <div className="h-24 w-full bg-[var(--m3-surface-container)] rounded" />
        </div>
      ) : (
        <StrategicReadCard data={data} />
      )}
    </div>
  );
}
