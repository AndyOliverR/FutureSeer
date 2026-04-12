'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useMysticalProfileContext } from '@/contexts/MysticalProfileContext';
import { Button } from '@/components/ui/button';
import { useIsMobileLayout } from '@/hooks/useIsMobileLayout';

const envRelease =
  typeof process.env.NEXT_PUBLIC_MYSTICAL_PIPELINE_RELEASE === 'string'
    ? process.env.NEXT_PUBLIC_MYSTICAL_PIPELINE_RELEASE.trim()
    : '';

function dismissKey(userId: string, release: string) {
  return `fs_pipeline_refresh_dismissed_${userId}_${release}`;
}

/**
 * When the app ships a new mystical pipeline release (env) and the user's stored
 * profile was generated under an older tag, show a dismissible CTA to regenerate on Profile.
 * Users without metadata.pipelineRelease (legacy) see nothing until their next generation writes it.
 */
export function MysticalPipelineRefreshBanner() {
  const { user, userProfile } = useAuth();
  const { profile, loading } = useMysticalProfileContext();
  const isMobileLayout = useIsMobileLayout();
  const [dismissed, setDismissed] = useState(false);

  const storedRelease = profile?.metadata?.pipelineRelease;

  const shouldShow = useMemo(() => {
    if (!envRelease || dismissed || loading || !user?.uid) return false;
    if (!userProfile?.mysticalProfileGenerated) return false;
    if (typeof storedRelease !== 'string' || !storedRelease.trim()) return false;
    if (storedRelease === envRelease) return false;
    if (typeof window !== 'undefined') {
      try {
        if (sessionStorage.getItem(dismissKey(user.uid, envRelease)) === '1') return false;
      } catch {
        /* ignore */
      }
    }
    return true;
  }, [user?.uid, userProfile?.mysticalProfileGenerated, storedRelease, dismissed, loading]);

  const onDismiss = () => {
    if (!user?.uid || !envRelease) return;
    try {
      sessionStorage.setItem(dismissKey(user.uid, envRelease), '1');
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  if (!shouldShow) return null;

  const isMobile = isMobileLayout;
  return (
    <div
      role="region"
      aria-label="Profile refresh notice"
      className={
        isMobile
          ? 'sticky top-0 z-[60] flex items-center gap-2 border-b border-amber-500/40 bg-[#0f172a] px-3 py-2.5 text-sm text-amber-100'
          : 'sticky top-0 z-[60] flex items-center gap-3 border-b border-amber-400/35 bg-gradient-to-r from-amber-950/90 via-slate-950/95 to-slate-950/95 px-4 py-2.5 text-sm text-amber-50'
      }
    >
      <p className="min-w-0 flex-1 leading-snug">
        A newer reading engine is available. Regenerate your mystical profile on Profile to use the latest
        interpretations.
      </p>
      <Button
        asChild
        size="sm"
        className={
          isMobile
            ? 'shrink-0 rounded-full bg-amber-500 text-slate-950 hover:bg-amber-400'
            : 'shrink-0 rounded-full border border-amber-400/50 bg-amber-500/15 text-amber-100 hover:bg-amber-500/25'
        }
      >
        <Link href="/profile">Open Profile</Link>
      </Button>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-full p-1.5 text-amber-200/80 hover:bg-white/10 hover:text-amber-50"
        aria-label="Dismiss notice"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
