"use client";

import { useSyncExternalStore } from "react";
import Script from "next/script";

function subscribeRecaptchaHost(): () => void {
  return () => {};
}

function getRecaptchaHostSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host !== "localhost" && host !== "127.0.0.1";
}

function getRecaptchaHostServerSnapshot(): boolean {
  return false;
}

/**
 * Loads reCAPTCHA Enterprise on pages that need it (auth, guest community).
 * Skips localhost so the site key domain warning does not appear in dev.
 */
export function RecaptchaScript() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const shouldLoad = useSyncExternalStore(
    subscribeRecaptchaHost,
    getRecaptchaHostSnapshot,
    getRecaptchaHostServerSnapshot
  );

  if (!siteKey || !shouldLoad) return null;

  const src = `https://www.google.com/recaptcha/enterprise.js?render=${encodeURIComponent(siteKey)}`;

  return <Script src={src} strategy="afterInteractive" />;
}
