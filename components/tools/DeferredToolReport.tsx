"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

type LazyReportLoader = () => Promise<{ default: ComponentType<Record<string, unknown>> }>;

/**
 * PERFORMANCE ARCHITECTURE — Create a lazy report component at module scope.
 *
 * Do NOT call next/dynamic inside a React render body (react-hooks/static-components).
 * Call this once at the top of a tool page file:
 *
 *   const HeavyReport = createDeferredToolReport(lazyComprehensiveVedicReport);
 */
export function createDeferredToolReport(
  loader: LazyReportLoader,
  loadingLabel = "Loading report…"
) {
  return dynamic(loader, {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-[200px] items-center justify-center rounded-2xl border border-outline-variant bg-surface-container-high p-6 text-sm text-surface-on-variant"
        role="status"
        aria-live="polite"
      >
        {loadingLabel}
      </div>
    ),
  });
}
