"use client";

import { useEffect } from "react";

/**
 * Sets --vh on document for reliable viewport height in mobile browsers and installed PWAs.
 * 100vh is unreliable in mobile WebView; use calc(var(--vh, 1vh) * 100) as fallback.
 */
export function ViewportHeightSync() {
  useEffect(() => {
    let rafId: number | null = null;
    let lastVhPx: string | null = null;

    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      const nextVhPx = `${vh}px`;
      if (nextVhPx === lastVhPx) return;
      lastVhPx = nextVhPx;
      document.documentElement.style.setProperty("--vh", nextVhPx);
    };

    const scheduleSetVh = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        setVh();
      });
    };

    scheduleSetVh();
    window.addEventListener("resize", scheduleSetVh);
    window.addEventListener("orientationchange", scheduleSetVh);
    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("resize", scheduleSetVh);
      window.removeEventListener("orientationchange", scheduleSetVh);
    };
  }, []);
  return null;
}
