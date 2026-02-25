"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

/**
 * Applies .platform-android or .platform-web to <body> based on:
 * 1. Capacitor native platform detection (highest priority)
 * 2. Screen width (< 768px = mobile/Material 3, >= 768px = web/Devotionist)
 * 3. User agent Android detection (secondary signal)
 *
 * Listens for resize events so rotating a tablet or resizing a browser
 * switches the design system in real-time.
 */
const MOBILE_BREAKPOINT = 768;

function getPlatformClass(): "platform-android" | "platform-web" {
  if (typeof window === "undefined") return "platform-web";

  if (Capacitor.isNativePlatform()) return "platform-android";

  const isSmallScreen = window.innerWidth < MOBILE_BREAKPOINT;
  const isAndroidUA = /Android/i.test(navigator.userAgent);

  if (isSmallScreen || isAndroidUA) return "platform-android";
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
}

export function PlatformClassProvider() {
  useEffect(() => {
    applyPlatformClass();

    const onResize = () => applyPlatformClass();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return null;
}
