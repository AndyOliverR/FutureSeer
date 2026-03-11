"use client";

import { useState, useEffect } from "react";

const DESKTOP_MEDIA = "(min-width: 768px)";

function readIsMobile(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia(DESKTOP_MEDIA);
  if (mq && typeof mq.matches === "boolean") return !mq.matches;
  const w = window.innerWidth;
  if (w >= 768) return false;
  if (w > 0 && w < 768) return true;
  return false;
}

/**
 * Returns whether the app is in "mobile layout" (Material 3) mode.
 * Uses matchMedia('(min-width: 768px)') so layout aligns with CSS breakpoints
 * and is reliable on first load (landing page). Delayed re-checks fix wrong
 * layout when the viewport isn't ready on initial paint (localhost and Vercel).
 */
export function useIsMobileLayout(): boolean {
  const [isMobileLayout, setIsMobileLayout] = useState(readIsMobile);

  useEffect(() => {
    const setFromRead = () => setIsMobileLayout(readIsMobile());

    setFromRead();

    const t1 = window.setTimeout(setFromRead, 50);
    const t2 = window.setTimeout(setFromRead, 200);
    const t3 = window.setTimeout(setFromRead, 500);

    const onUpdate = setFromRead;
    window.addEventListener("resize", onUpdate);
    window.addEventListener("orientationchange", onUpdate);

    const observer = new MutationObserver(setFromRead);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-platform"] });

    let mediaQuery: MediaQueryList | null = null;
    try {
      mediaQuery = window.matchMedia(DESKTOP_MEDIA);
      mediaQuery.addEventListener("change", setFromRead);
    } catch {
      // ignore
    }

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.removeEventListener("resize", onUpdate);
      window.removeEventListener("orientationchange", onUpdate);
      observer.disconnect();
      mediaQuery?.removeEventListener("change", setFromRead);
    };
  }, []);

  return isMobileLayout;
}
