"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { getClientPlatformSnapshot } from "@/lib/platformDetection";

/**
 * Applies .platform-android or .platform-web to <body> based on:
 * 1. Capacitor native platform detection (highest priority)
 * 2. Viewport width (< 768px = mobile/Material 3, >= 768px = web/Devotionist)
 *
 * Note: "platform-android" means "mobile layout (Material 3)", not Android OS.
 * Width is the only non-Capacitor signal so desktop-sized screens always get the web layout.
 * Listens for resize and orientationchange so the design system updates in real time.
 * Also syncs data-platform and data-mobile-os on document.documentElement for platform-aware UI (iOS vs Android nav).
 */
function applyPlatformClass() {
  const snapshot = getClientPlatformSnapshot({
    isNativePlatform: Capacitor.isNativePlatform(),
  });
  const cls = snapshot.platformClass;
  const body = document.body;
  const other = cls === "platform-android" ? "platform-web" : "platform-android";
  if (!body.classList.contains(cls)) {
    body.classList.remove(other);
    body.classList.add(cls);
  }
  document.documentElement.setAttribute("data-platform", snapshot.dataPlatform);
  document.documentElement.setAttribute("data-mobile-os", snapshot.mobileOS);
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

    const t1 = window.setTimeout(scheduleApply, 100);
    const t2 = window.setTimeout(scheduleApply, 400);

    const onResizeOrOrientation = () => scheduleApply();
    window.addEventListener("resize", onResizeOrOrientation);
    window.addEventListener("orientationchange", onResizeOrOrientation);
    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", onResizeOrOrientation);
      window.removeEventListener("orientationchange", onResizeOrOrientation);
    };
  }, []);

  return null;
}
