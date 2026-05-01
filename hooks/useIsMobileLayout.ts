"use client";

import { useState, useEffect } from "react";
import { getClientPlatformSnapshot } from "@/lib/platformDetection";

function readIsMobile(): boolean {
  return getClientPlatformSnapshot().isMobile;
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

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.removeEventListener("resize", onUpdate);
      window.removeEventListener("orientationchange", onUpdate);
      observer.disconnect();
    };
  }, []);

  return isMobileLayout;
}
