"use client";

/**
 * PreloadAssets - Reserved for future critical asset preloading.
 * Starfield preload was removed to avoid "preloaded but not used" console warning;
 * the image is used only as CSS background and is loaded when the first
 * .starfield-ultra-sharp element is painted.
 */
export function PreloadAssets() {
  return null;
}
