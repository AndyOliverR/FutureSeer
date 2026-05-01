"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getClientPlatformSnapshot, getIsMacOS, getDesignSystem } from "@/lib/platformDetection";

function applyDesignSystem() {
  if (typeof document === "undefined") return;

  const user = (window as unknown as { __authUser?: { providerData?: Array<{ providerId?: string }> } }).__authUser;
  const signedInWithApple = Boolean(
    user?.providerData?.some((p) => p?.providerId === "apple.com")
  );

  const snapshot = getClientPlatformSnapshot();
  const mobileOS =
    snapshot.mobileOS === "ios"
      ? ("ios" as const)
      : snapshot.mobileOS === "android"
        ? ("android" as const)
        : null;

  const designSystem = getDesignSystem({
    isMobile: snapshot.isMobile,
    mobileOS,
    isMacOS: getIsMacOS(),
    signedInWithApple,
  });

  document.documentElement.setAttribute(
    "data-design-system",
    designSystem
  );
  document.documentElement.setAttribute(
    "data-apple-id",
    signedInWithApple ? "true" : "false"
  );

  // Konsta: add k-ios to body when Konsta iOS theme so Konsta CSS applies
  const body = document.body;
  if (designSystem === "konsta-ios") {
    body.classList.add("k-ios");
    body.classList.remove("k-material");
  } else if (designSystem === "material") {
    body.classList.add("k-material");
    body.classList.remove("k-ios");
  } else {
    body.classList.remove("k-ios", "k-material");
  }
}

/**
 * Syncs data-design-system and data-apple-id to the document based on viewport,
 * OS detection, and whether the user signed in with Apple ID.
 * Must run inside AuthProvider so we can read the current user.
 */
export function DesignSystemSync() {
  const { user } = useAuth();

  useEffect(() => {
    (window as unknown as { __authUser?: unknown }).__authUser = user ?? undefined;
    applyDesignSystem();

    const t1 = window.setTimeout(applyDesignSystem, 100);
    const t2 = window.setTimeout(applyDesignSystem, 400);

    const onResizeOrOrientation = () => applyDesignSystem();
    window.addEventListener("resize", onResizeOrOrientation);
    window.addEventListener("orientationchange", onResizeOrOrientation);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", onResizeOrOrientation);
      window.removeEventListener("orientationchange", onResizeOrOrientation);
    };
  }, [user]);

  return null;
}
