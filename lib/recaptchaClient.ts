"use client";

import { devLog } from "@/lib/devLogger";

declare global {
  interface Window {
    grecaptcha?: {
      enterprise: {
        ready: (cb: () => void | Promise<void>) => void;
        execute: (siteKey: string, opts: { action: string }) => Promise<string>;
      };
    };
  }
}

/** Email auth pages: skip on Material mobile layout and localhost (matches prior product behavior). */
export function shouldSkipRecaptchaAuthUi(isMobileLayout: boolean): boolean {
  if (isMobileLayout) return true;
  if (typeof window === "undefined") return true;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1";
}

/** Guest community: skip only on localhost; mobile web still runs reCAPTCHA when configured. */
export function shouldSkipRecaptchaGuestUi(): boolean {
  if (typeof window === "undefined") return true;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1";
}

type LogFn = (
  code: string,
  message: string,
  level: "info" | "warning" | "error",
  meta?: Record<string, unknown>
) => Promise<void>;

declare global {
  interface Window {
    __fsRecaptchaFallbackAttempted?: boolean;
    __fsRecaptchaReadyAt?: number;
  }
}

type CaptchaErrorCode =
  | "fs/captcha-no-site-key"
  | "fs/captcha-missing-script"
  | "fs/captcha-execute-failed"
  | "fs/captcha-token-missing"
  | "fs/captcha-verify-failed";

interface CaptchaError extends Error {
  code: CaptchaErrorCode;
  stage?: "config" | "script" | "execute" | "token" | "verify";
  status?: number;
  reason?: string;
}

function createCaptchaError(
  code: CaptchaErrorCode,
  message: string,
  extra?: Pick<CaptchaError, "stage" | "status" | "reason">
): CaptchaError {
  const error = new Error(message) as CaptchaError;
  error.code = code;
  if (extra?.stage) error.stage = extra.stage;
  if (typeof extra?.status === "number") error.status = extra.status;
  if (typeof extra?.reason === "string") error.reason = extra.reason;
  return error;
}

async function waitForGrecaptchaReady(timeoutMs = 2500, intervalMs = 125): Promise<boolean> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (window.grecaptcha?.enterprise) return true;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return !!window.grecaptcha?.enterprise;
}

async function injectRecaptchaScript(siteKey: string, host: "www.google.com" | "www.recaptcha.net"): Promise<boolean> {
  if (typeof document === "undefined") return false;
  const src = `https://${host}/recaptcha/enterprise.js?render=${encodeURIComponent(siteKey)}`;
  const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
  if (existing) return true;
  return await new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

/**
 * Runs enterprise.execute + POST /api/auth/verify-captcha. No-op when skipped or no site key.
 */
export async function ensureRecaptchaVerifiedForWebAuth(
  isMobileLayout: boolean,
  action: string,
  logError?: LogFn
): Promise<void> {
  if (shouldSkipRecaptchaAuthUi(isMobileLayout)) return;

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) {
    await logError?.("captcha_no_site_key", "reCAPTCHA site key not configured", "warning");
    throw createCaptchaError(
      "fs/captcha-no-site-key",
      "Sign-in is temporarily unavailable. Please try again later.",
      { stage: "config" }
    );
  }

  let grecaptcha = window.grecaptcha;
  if (!grecaptcha) {
    const injectedGoogle = await injectRecaptchaScript(siteKey, "www.google.com");
    const readyAfterInjectGoogle = injectedGoogle ? await waitForGrecaptchaReady(1800, 120) : false;
    if (!readyAfterInjectGoogle) {
      if (typeof window !== "undefined") window.__fsRecaptchaFallbackAttempted = true;
      await injectRecaptchaScript(siteKey, "www.recaptcha.net");
      await waitForGrecaptchaReady(1800, 120);
    }

    const readyAfterWait = await waitForGrecaptchaReady();
    if (readyAfterWait) {
      grecaptcha = window.grecaptcha;
    }
  }
  if (!grecaptcha) {
    const scriptTagPresent =
      typeof document !== "undefined" &&
      !!document.querySelector('script[src*="google.com/recaptcha/enterprise.js"]');
    const fallbackScriptTagPresent =
      typeof document !== "undefined" &&
      !!document.querySelector('script[src*="recaptcha.net/recaptcha/enterprise.js"]');
    const fallbackAttempted =
      typeof window !== "undefined" &&
      !!(window as Window & { __fsRecaptchaFallbackAttempted?: boolean }).__fsRecaptchaFallbackAttempted;
    devLog.warn("reCAPTCHA script not loaded", "recaptchaClient");
    await logError?.("captcha_missing_script", "Captcha script missing", "info", {
      scriptTagPresent,
      fallbackScriptTagPresent,
      fallbackAttempted,
      runtimeRecoveryAttempted: true,
      hostname: typeof window !== "undefined" ? window.location.hostname : null,
    });
    throw createCaptchaError(
      "fs/captcha-missing-script",
      "Security check could not load. Refresh the page and try again.",
      { stage: "script" }
    );
  }

  const token = await new Promise<string | null>((resolve) => {
    grecaptcha.enterprise.ready(async () => {
      try {
        const t = await grecaptcha.enterprise.execute(siteKey, { action });
        resolve(t);
      } catch (err: unknown) {
        devLog.error("reCAPTCHA execution failed:", err, "recaptchaClient");
        await logError?.("captcha_failed", "Captcha execution failed", "info", {
          message: err instanceof Error ? err.message : null,
          hostname: typeof window !== "undefined" ? window.location.hostname : null,
        });
        resolve(null);
      }
    });
  });

  if (!token) {
    throw createCaptchaError("fs/captcha-token-missing", "Security check failed. Please try again.", {
      stage: "execute",
    });
  }

  const verifyRes = await fetch("/api/auth/verify-captcha", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, action }),
  });

  if (!verifyRes.ok) {
    const verifyData = (await verifyRes.json().catch(() => ({}))) as {
      error?: string;
      code?: string;
      reason?: string;
    };
    await logError?.("captcha_failed", "Captcha verification failed", "info", { status: verifyRes.status });
    throw createCaptchaError(
      "fs/captcha-verify-failed",
      verifyData.error || "Security check failed. Please try again.",
      {
        stage: "verify",
        status: verifyRes.status,
        reason: verifyData.code || verifyData.reason,
      }
    );
  }

  await logError?.("captcha_verified", "Captcha verified", "info");
}

export async function getRecaptchaTokenForGuest(action: string): Promise<string | null> {
  if (shouldSkipRecaptchaGuestUi()) return null;

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) {
    devLog.warn("NEXT_PUBLIC_RECAPTCHA_SITE_KEY missing; guest post blocked on non-localhost", "recaptchaClient");
    return null;
  }

  const grecaptcha = window.grecaptcha;
  if (!grecaptcha) {
    devLog.warn("reCAPTCHA script not loaded", "recaptchaClient");
    return null;
  }

  return new Promise<string | null>((resolve) => {
    grecaptcha.enterprise.ready(async () => {
      try {
        const t = await grecaptcha.enterprise.execute(siteKey, { action });
        resolve(t);
      } catch (err: unknown) {
        devLog.error("reCAPTCHA execution failed:", err, "recaptchaClient");
        resolve(null);
      }
    });
  });
}
