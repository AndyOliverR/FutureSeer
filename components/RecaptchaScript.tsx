"use client";

import { useState, useEffect } from "react";
import Script from "next/script";

const RECAPTCHA_ENTERPRISE_URL =
  "https://www.google.com/recaptcha/enterprise.js?render=6Ld_vmMsAAAAAJzl7DmmVomD3G3BLkovwM0AB8Fz";

/**
 * Loads reCAPTCHA Enterprise only on auth pages (signin/signup) to avoid
 * "preloaded but not used" warnings on the landing page.
 * Does not load on localhost so the "Localhost is not supported by this site key" popup never appears.
 */
export function RecaptchaScript() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      setShouldLoad(true);
    }
  }, []);

  if (!shouldLoad) return null;
  return (
    <Script
      src={RECAPTCHA_ENTERPRISE_URL}
      strategy="afterInteractive"
    />
  );
}
