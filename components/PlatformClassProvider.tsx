"use client";

import { useEffect } from "react";
import { applyPlatformClassToDocument } from "@/lib/applyPlatformToDocument";

/**
 * Applies .platform-android or .platform-web on resize/orientation.
 * First paint: inline script in app/layout.tsx. This provider keeps classes in sync.
 */
function applyPlatformClass() {
  applyPlatformClassToDocument();
}

export function PlatformClassProvider() {
  useEffect(() => {
    let rafId: number | null = null;

    const scheduleApply = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        applyPlatformClass();
      });
    };

    scheduleApply();

    const onResizeOrOrientation = () => scheduleApply();
    window.addEventListener("resize", onResizeOrOrientation);
    window.addEventListener("orientationchange", onResizeOrOrientation);
    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("resize", onResizeOrOrientation);
      window.removeEventListener("orientationchange", onResizeOrOrientation);
    };
  }, []);

  return null;
}
