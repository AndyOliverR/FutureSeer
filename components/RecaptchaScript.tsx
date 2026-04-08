"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
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
  const [provider, setProvider] = useState<"google" | "recaptcha_net">("google");
  const [fallbackAttempted, setFallbackAttempted] = useState(false);
  const shouldLoad = useSyncExternalStore(
    subscribeRecaptchaHost,
    getRecaptchaHostSnapshot,
    getRecaptchaHostServerSnapshot
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as Window & { __fsRecaptchaFallbackAttempted?: boolean }).__fsRecaptchaFallbackAttempted =
      fallbackAttempted;
  }, [fallbackAttempted]);

  useEffect(() => {
    if (!siteKey || !shouldLoad) return;
    const host = provider === "google" ? "www.google.com" : "www.recaptcha.net";
    const src = `https://${host}/recaptcha/enterprise.js?render=${encodeURIComponent(siteKey)}`;
    logRecaptchaScriptEvent("captcha_loader_host_selected", "reCAPTCHA loader host selected", {
      provider,
      src,
      fallbackAttempted,
    });
  }, [provider, fallbackAttempted, siteKey, shouldLoad]);

  if (!siteKey || !shouldLoad) return null;

  const host = provider === "google" ? "www.google.com" : "www.recaptcha.net";
  const src = `https://${host}/recaptcha/enterprise.js?render=${encodeURIComponent(siteKey)}`;

  return (
    <Script
      key={`${provider}-${siteKey}`}
      src={src}
      strategy="afterInteractive"
      onLoad={() => {
        const hasGrecaptcha = typeof window !== "undefined" && !!window.grecaptcha?.enterprise;
        if (typeof window !== "undefined" && hasGrecaptcha) {
          (window as Window & { __fsRecaptchaReadyAt?: number }).__fsRecaptchaReadyAt = Date.now();
        }
        logRecaptchaScriptEvent(
          hasGrecaptcha
            ? (provider === "google" ? "captcha_script_loaded" : "captcha_script_fallback_loaded")
            : "captcha_script_loaded_without_global",
          hasGrecaptcha ? "reCAPTCHA script loaded" : "reCAPTCHA script loaded but global missing",
          { hasGrecaptcha, provider, fallbackAttempted }
        );
      }}
      onError={() => {
        logRecaptchaScriptEvent("captcha_script_failed", "reCAPTCHA script failed to load", {
          siteKeyConfigured: !!siteKey,
          provider,
          fallbackAttempted,
          hostname: typeof window !== "undefined" ? window.location.hostname : null,
        });
        if (provider === "google" && !fallbackAttempted) {
          setFallbackAttempted(true);
          logRecaptchaScriptEvent("captcha_script_fallback_attempt", "Trying recaptcha.net fallback", {
            fromProvider: "google",
            toProvider: "recaptcha_net",
          });
          setProvider("recaptcha_net");
        } else if (provider === "recaptcha_net") {
          logRecaptchaScriptEvent("captcha_script_fallback_failed", "Fallback script also failed", {
            provider,
            fallbackAttempted,
          });
        }
      }}
    />
  );
}
