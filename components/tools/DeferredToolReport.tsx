"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

type DeferredToolReportProps = {
  loader: () => Promise<{ default: ComponentType<Record<string, unknown>> }>;
  componentProps?: Record<string, unknown>;
  /** Accessible label while the report chunk loads */
  loadingLabel?: string;
};

/**
 * PERFORMANCE ARCHITECTURE — Lazy-mount heavy tool report viewers below the fold.
 * Pass a dynamic import factory so each tool page keeps its report in a separate chunk.
 */
export function DeferredToolReport({
  loader,
  componentProps = {},
  loadingLabel = "Loading report…",
}: DeferredToolReportProps) {
  const Report = dynamic(loader, {
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

  return <Report {...componentProps} />;
}
