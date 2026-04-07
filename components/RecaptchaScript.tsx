"use client";

import { useSyncExternalStore } from "react";
import Script from "next/script";

function logRecaptchaScriptEvent(action: string, message: string, meta?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const browser = typeof navigator !== "undefined"
    ? `${navigator.userAgent} | ${navigator.language || ""}`
    : undefined;
  void fetch("/api/log-client-error", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      severity: "info",
      area: "auth",
      action,
      message,
      route: window.location.pathname,
      browser,
      meta,
    }),
  }).catch(() => {});
}

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

  return (
    <Script
      src={src}
      strategy="afterInteractive"
      onLoad={() => {
        const hasGrecaptcha = typeof window !== "undefined" && !!window.grecaptcha?.enterprise;
        logRecaptchaScriptEvent(
          hasGrecaptcha ? "captcha_script_loaded" : "captcha_script_loaded_without_global",
          hasGrecaptcha ? "reCAPTCHA script loaded" : "reCAPTCHA script loaded but global missing",
          { hasGrecaptcha }
        );
      }}
      onError={() => {
        logRecaptchaScriptEvent("captcha_script_failed", "reCAPTCHA script failed to load", {
          siteKeyConfigured: !!siteKey,
          hostname: typeof window !== "undefined" ? window.location.hostname : null,
        });
      }}
    />
  );
}
