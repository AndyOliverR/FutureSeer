/**
 * Client-side OS detection for platform-aware UI (iOS, Android, macOS, desktop).
 * Drives Devotionist (web), Material 3 (Android), and Konsta iOS (iOS/macOS + optional Apple ID).
 * SSR-safe: returns null / default when not in browser.
 */

export type MobileOS = "ios" | "android" | null;

export type DesignSystem = "devotionist" | "material" | "konsta-ios";

/**
 * Returns the mobile OS when viewport is considered mobile (caller should check width).
 * Returns null for desktop or when not in browser (SSR).
 */
export function getMobileOS(): MobileOS {
  if (typeof window === "undefined" || typeof navigator === "undefined") return null;

  const ua = navigator.userAgent;
  if (!ua) return null;

  // iOS: iPhone, iPad, iPod (Safari on iOS always includes these)
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  // Android
  if (/Android/i.test(ua)) return "android";

  return null;
}

/**
 * Returns true when the device is macOS (Macintosh) and not iPhone/iPad.
 * Used to apply Konsta iOS styling on MacBook/desktop Mac.
 */
export function getIsMacOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (!ua) return false;
  if (/iPhone|iPad|iPod/i.test(ua)) return false;
  return /Macintosh|Mac OS X/i.test(ua);
}

/**
 * Returns the design system to use: devotionist (wide non-Apple), material (Android), konsta-ios (iOS/macOS or Apple ID).
 * Caller must pass viewport width and optionally whether the user signed in with Apple ID.
 */
export function getDesignSystem(params: {
  isMobile: boolean;
  mobileOS: MobileOS | null;
  isMacOS: boolean;
  signedInWithApple: boolean;
}): DesignSystem {
  const { isMobile, mobileOS, isMacOS, signedInWithApple } = params;

  if (!isMobile) {
    // Wide: Devotionist unless macOS or Apple ID → Konsta iOS
    if (isMacOS || signedInWithApple) return "konsta-ios";
    return "devotionist";
  }

  // Narrow: iOS or Apple ID → Konsta iOS; Android → Material; else Material fallback
  if (mobileOS === "ios" || signedInWithApple) return "konsta-ios";
  if (mobileOS === "android") return "material";
  return "material";
}
