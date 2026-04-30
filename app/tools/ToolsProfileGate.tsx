"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMysticalProfileContext } from "@/contexts/MysticalProfileContext";
import { useAuth } from "@/hooks/use-auth";
import { getReturningPaymentCommitDestination } from "@/lib/authRouting";
import { Sparkles } from "lucide-react";

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
        <div className="max-w-md rounded-2xl border border-amber-500/30 bg-slate-900/90 p-8 text-center shadow-xl backdrop-blur-sm">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-amber-500/20 p-4">
              <Sparkles className="h-10 w-10 text-amber-400" />
            </div>
          </div>
          <h2 className="mb-2 font-heading text-xl font-semibold tracking-wide text-amber-200">
            Select a plan to view your reports
          </h2>
          <p className="mb-6 text-sm text-slate-300">
            Your mystical profile is ready. Choose a plan to unlock your full readings and tool reports.
          </p>
          <Link
            href={getReturningPaymentCommitDestination(pathname || "/tools")}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-medium text-slate-900 transition hover:bg-amber-400"
          >
            Go to Subscription
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
