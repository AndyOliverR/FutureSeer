"use client";

import { useState, useEffect } from "react";

/**
 * Returns whether the app is in "mobile layout" (Material 3) mode.
 * Reads from the single source of truth: body class .platform-android
 * (and data-platform), which is set by the inline script and
 * PlatformClassProvider based on width < 768 or Capacitor native.
 * Use this for layout/UI branches so iPhone and any small-screen
 * browser get the same Material 3 experience as Android.
 */
export function useIsMobileLayout(): boolean {
  const [isMobileLayout, setIsMobileLayout] = useState(false);

  useEffect(() => {
    const read = () => {
      if (typeof document === "undefined") return false;
      const body = document.body;
      const platform = document.documentElement.getAttribute("data-platform");
      const fromClass = body.classList.contains("platform-android");
      const fromData = platform === "android";
      return fromClass || fromData;
    };

    setIsMobileLayout(read());

    const onUpdate = () => setIsMobileLayout(read());
    window.addEventListener("resize", onUpdate);
    window.addEventListener("orientationchange", onUpdate);
    return () => {
      window.removeEventListener("resize", onUpdate);
      window.removeEventListener("orientationchange", onUpdate);
    };
  }, []);

  return isMobileLayout;
}
