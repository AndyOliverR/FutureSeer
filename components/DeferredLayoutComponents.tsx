"use client";

import dynamic from "next/dynamic";

/**
 * PERFORMANCE ARCHITECTURE — Deferred shell components
 * Non-critical UI loads after first paint (ssr: false). Keep imports here, not in app/layout.tsx.
 */
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

export const DeferredOnboardingTour = dynamic(
  () => import("@/components/OnboardingTour").then((mod) => ({ default: mod.OnboardingTour })),
  { ssr: false, loading: () => null }
);

export const DeferredBottomNavBar = dynamic(
  () => import("@/components/BottomNavBar").then((mod) => ({ default: mod.BottomNavBar })),
  { ssr: false, loading: () => null }
);

export const DeferredServiceWorkerRegistration = dynamic(
  () => import("@/components/ServiceWorkerRegistration").then((mod) => ({ default: mod.ServiceWorkerRegistration })),
  { ssr: false }
);
// Deprecated: Service worker is intentionally decommissioned on web.

export const DeferredViewportHeightSync = dynamic(
  () => import("@/components/ViewportHeightSync").then((mod) => ({ default: mod.ViewportHeightSync })),
  { ssr: false }
);
