/**
 * OAuth flow selection for mobile vs desktop browsers.
 * Redirect OAuth stores state in sessionStorage; partitioned or cleared storage
 * causes Firebase "missing initial state" on return. Prefer popup on Chromium Android.
 */

export const OAUTH_REDIRECT_PENDING_KEY = "futureSeer:oauthRedirectPending";

const OAUTH_REDIRECT_PENDING_MAX_AGE_MS = 15 * 60 * 1000;

function isAndroidInAppBrowser(ua: string): boolean {
  return /FBAN|FBAV|Instagram|Line\/|Twitter/i.test(ua);
}

/**
 * WebKit (Safari / iOS / iPadOS) often breaks Firebase OAuth popups.
 * Android Chrome: use popup to avoid redirect sessionStorage partition failures.
 */
export function shouldPreferOAuthRedirect(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;

  // All browsers on iPhone / iPod / iPad use WebKit for OAuth UI.
  if (/iPhone|iPod|iPad/i.test(ua)) return true;

  // iPadOS desktop UA can report as Macintosh with touch points.
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return true;

  // Android: Chromium popup is more reliable than redirect (missing initial state).
  if (/Android/i.test(ua) && /Mobile/i.test(ua)) {
    if (isAndroidInAppBrowser(ua) || /SamsungBrowser/i.test(ua)) return true;
    if (/Chrome\//i.test(ua) || /Chromium\//i.test(ua) || /EdgA\//i.test(ua)) return false;
    return true;
  }

  // Safari on macOS (not Chrome, Chromium, Edge, Opera, Firefox).
  if (
    /Macintosh/i.test(ua) &&
    /Safari\//i.test(ua) &&
    !/Chrome\//i.test(ua) &&
    !/Chromium\//i.test(ua) &&
    !/Edg\//i.test(ua) &&
    !/OPR\//i.test(ua) &&
    !/Firefox\//i.test(ua)
  ) {
    return true;
  }

  return false;
}

export function hasOAuthRedirectReturnInUrl(): boolean {
  if (typeof window === "undefined") return false;
  const blob = `${window.location.search}${window.location.hash}`;
  return /apiKey=|authType=|sessionId=/i.test(blob);
}

export function markOAuthRedirectPending(provider: "google" | "apple"): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(
      OAUTH_REDIRECT_PENDING_KEY,
      JSON.stringify({ provider, at: Date.now() }),
    );
  } catch {
    // sessionStorage may be blocked in private mode
  }
}

export function clearOAuthRedirectPending(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(OAUTH_REDIRECT_PENDING_KEY);
  } catch {
    // noop
  }
}

export function hasPendingOAuthRedirect(
  maxAgeMs = OAUTH_REDIRECT_PENDING_MAX_AGE_MS,
): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(OAUTH_REDIRECT_PENDING_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { at?: number };
    if (typeof parsed.at === "number" && Date.now() - parsed.at > maxAgeMs) {
      clearOAuthRedirectPending();
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** Only call Firebase getRedirectResult when we expect an OAuth return. */
export function shouldProcessOAuthRedirectReturn(): boolean {
  return hasOAuthRedirectReturnInUrl() || hasPendingOAuthRedirect();
}

export function isMissingOAuthRedirectStateError(error: unknown): boolean {
  const msg =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  return (
    msg.includes("missing initial state") ||
    msg.includes("sessionStorage is inaccessible")
  );
}

/** Remove stale Firebase OAuth query params when no redirect is in progress. */
export function cleanupStaleOAuthUrlParams(): void {
  if (typeof window === "undefined") return;
  if (!hasOAuthRedirectReturnInUrl()) return;
  if (hasPendingOAuthRedirect()) return;

  try {
    const url = new URL(window.location.href);
    let changed = false;
    for (const key of [...url.searchParams.keys()]) {
      const lower = key.toLowerCase();
      if (
        lower.includes("apikey") ||
        lower.includes("authtype") ||
        lower.includes("sessionid") ||
        lower.startsWith("firebase")
      ) {
        url.searchParams.delete(key);
        changed = true;
      }
    }
    if (changed) {
      const next = `${url.pathname}${url.search}${url.hash}`;
      window.history.replaceState({}, "", next);
    }
  } catch {
    // noop
  }
}
