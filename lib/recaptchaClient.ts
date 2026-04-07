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

  const grecaptcha = window.grecaptcha;
  if (!grecaptcha) {
    devLog.warn("reCAPTCHA script not loaded", "recaptchaClient");
    await logError?.("captcha_missing_script", "Captcha script missing", "info");
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
