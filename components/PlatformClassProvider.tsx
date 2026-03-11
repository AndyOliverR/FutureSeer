"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

/**
 * Applies .platform-android or .platform-web to <body> based on:
 * 1. Capacitor native platform detection (highest priority)
 * 2. Viewport width (< 768px = mobile/Material 3, >= 768px = web/Devotionist)
 *
 * Note: "platform-android" means "mobile layout (Material 3)", not Android OS.
 * Width is the only non-Capacitor signal so desktop-sized screens always get the web layout.
 * Listens for resize and orientationchange so the design system updates in real time.
 * Also syncs data-platform on document.documentElement for components that read it.
 */
const MOBILE_BREAKPOINT = 768;

function getPlatformClass(): "platform-android" | "platform-web" {
  if (typeof window === "undefined") return "platform-web";

  if (Capacitor.isNativePlatform()) return "platform-android";

  const isSmallScreen = window.innerWidth < MOBILE_BREAKPOINT;
  // Use viewport width as primary signal so desktop-sized screens always get web layout.
  // Only treat as mobile when width < 768; do not use Android UA alone (avoids desktop showing mobile footer when UA contains "Android").
  if (isSmallScreen) return "platform-android";
  return "platform-web";
}

function applyPlatformClass() {
  const cls = getPlatformClass();
  const body = document.body;
  const other = cls === "platform-android" ? "platform-web" : "platform-android";
  if (!body.classList.contains(cls)) {
    body.classList.remove(other);
    body.classList.add(cls);
  }
  document.documentElement.setAttribute("data-platform", cls === "platform-android" ? "android" : "web");
}

export function PlatformClassProvider() {
  useEffect(() => {
    applyPlatformClass();

    const t1 = window.setTimeout(applyPlatformClass, 100);
    const t2 = window.setTimeout(applyPlatformClass, 400);

    const onResizeOrOrientation = () => applyPlatformClass();
    window.addEventListener("resize", onResizeOrOrientation);
    window.addEventListener("orientationchange", onResizeOrOrientation);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", onResizeOrOrientation);
      window.removeEventListener("orientationchange", onResizeOrOrientation);
    };
  }, []);

  return null;
}
