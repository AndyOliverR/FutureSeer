"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMysticalProfileContext } from "@/contexts/MysticalProfileContext";
import { useAuth } from "@/hooks/use-auth";
import { Sparkles } from "lucide-react";
import { fsAdaptivePanelStrong } from "@/lib/designSystemClasses";

/**
 * When the user has a generated profile but no selected plan, show a paywall
 * instead of tool content so they must select a plan to view full reports.
 * Tools listing (/tools) is never gated.
 */
export function ToolsProfileGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { hasProfile, loading } = useMysticalProfileContext();
  const { requiresReturningPaymentCommit } = useAuth();

  const isToolPage = pathname?.startsWith("/tools/");
  const shouldGate = isToolPage && hasProfile && !loading && requiresReturningPaymentCommit;

  if (shouldGate) {
    return (
      <div className="relative z-10 flex min-h-[60vh] flex-col items-center justify-center px-6 py-12">
        <div className={`max-w-md p-8 text-center ${fsAdaptivePanelStrong}`}>
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-amber-500/20 p-4">
              <Sparkles className="h-10 w-10 text-amber-400" />
            </div>
          </div>
          <h2 className="mb-2 font-heading text-xl font-semibold tracking-wide text-amber-200">
            Add credits to continue
          </h2>
          <p className="mb-6 text-sm text-slate-300">
            Your mystical profile is ready. Buy credits for full AI access — first reading in each tool is free.
          </p>
          <Link
            href="/credits"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-medium text-slate-900 transition hover:bg-amber-400"
          >
            Add credits
          </Link>
          <p className="mt-4 text-xs text-slate-500">
            Or{' '}
            <Link href="/pricing" className="text-amber-400 hover:underline">
              unlimited membership
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
