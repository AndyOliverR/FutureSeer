"use client";

import { useEffect } from "react";

/**
 * Sets --vh on document for reliable viewport height in WebView (e.g. Capacitor).
 * 100vh is unreliable in mobile WebView; use calc(var(--vh, 1vh) * 100) as fallback.
 */
export function ViewportHeightSync() {
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);
  return null;
}
