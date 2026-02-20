"use client";

import dynamic from "next/dynamic";

// Defer non-critical components so they don't block first paint.
// ssr: false is only allowed in Client Components (Next.js 16+).
export const DeferredAnalyticsInitializer = dynamic(
  () => import("@/components/AnalyticsInitializer").then((mod) => ({ default: mod.AnalyticsInitializer })),
  { ssr: false }
);

export const DeferredFirestoreErrorSuppressor = dynamic(
  () => import("@/components/FirestoreErrorSuppressor").then((mod) => ({ default: mod.FirestoreErrorSuppressor })),
  { ssr: false }
);

export const DeferredMysticalFeedback = dynamic(
  () => import("@/components/MysticalFeedback").then((mod) => ({ default: mod.MysticalFeedback })),
  { ssr: false, loading: () => null }
);

export const DeferredFloatingTipJar = dynamic(
  () => import("@/components/FloatingTipJar").then((mod) => ({ default: mod.FloatingTipJar })),
  { ssr: false, loading: () => null }
);

export const DeferredServiceWorkerRegistration = dynamic(
  () => import("@/components/ServiceWorkerRegistration").then((mod) => ({ default: mod.ServiceWorkerRegistration })),
  { ssr: false }
);

export const DeferredViewportHeightSync = dynamic(
  () => import("@/components/ViewportHeightSync").then((mod) => ({ default: mod.ViewportHeightSync })),
  { ssr: false }
);
