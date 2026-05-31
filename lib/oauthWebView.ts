/**
 * WebKit (Safari / iOS / iPadOS) and Android mobile browsers often break Firebase OAuth popups
 * (background-tab races, auth/network-request-failed). Prefer full-page redirect there.
 */
export function shouldPreferOAuthRedirect(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;

  // All browsers on iPhone / iPod / iPad use WebKit for OAuth UI.
  if (/iPhone|iPod|iPad/i.test(ua)) return true;

  // iPadOS desktop UA can report as Macintosh with touch points.
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return true;

  // Android phones: popup OAuth is flaky when the account picker backgrounds the tab.
  if (/Android/i.test(ua) && /Mobile/i.test(ua)) return true;

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
