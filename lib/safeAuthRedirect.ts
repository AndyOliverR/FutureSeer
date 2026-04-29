/**
 * Validates `?redirect=` after sign-in so we never navigate to a missing route
 * (e.g. proxy stored `/community/foo` but only `/community/attribution` exists).
 */

function stripQueryAndHash(raw: string): string {
  const noHash = raw.split("#")[0] ?? ""
  return noHash.split("?")[0] ?? ""
}

function canonicalizeTrailingSlash(path: string): string {
  if (path === "/" || path === "") return "/"
  return path.replace(/\/+$/, "") || "/"
}

const EXACT_ALLOWED = new Set([
  "/",
  "/about",
  "/ask",
  "/ask-the-seer",
  "/ask-vedic-seer",
  "/community",
  "/community/attribution",
  "/contact",
  "/daily",
  "/data-deletion",
  "/disclaimer",
  "/how-to-use",
  "/learn",
  "/mystical-profile",
  "/notes",
  "/offline",
  "/pricing",
  "/privacy",
  "/privacy-policy",
  "/profile",
  "/profile-setup",
  "/refund-policy",
  "/remedies",
  "/seer",
  "/settings",
  "/settings/advanced-personalization",
  "/shipping-policy",
  "/signin",
  "/signup",
  "/subscribe",
  "/support",
  "/support/tickets",
  "/terms",
  "/tools",
])

function isPrefixAllowed(canonical: string): boolean {
  if (canonical.startsWith("/tools/") && canonical.length > "/tools/".length) return true
  if (canonical.startsWith("/learn/") && canonical.length > "/learn/".length) return true
  if (canonical.startsWith("/admin/") && canonical.length > "/admin/".length) return true
  if (canonical.startsWith("/l/") && canonical.length > "/l/".length) return true
  return false
}

/**
 * Returns a safe in-app path, or null to use the default (returning-user destination or /profile).
 * Unknown `/community/*` (except index and attribution) maps to `/community/attribution`.
 */
export function getSafeAuthRedirectAfterSignIn(redirect: string | null): string | null {
  if (redirect == null || typeof redirect !== "string") return null
  const trimmed = redirect.trim()
  if (trimmed.length > 300) return null
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null
  if (trimmed.includes("\\")) return null
  if (/[\r\n\t]/.test(trimmed)) return null

  const pathOnly = stripQueryAndHash(trimmed)
  if (!pathOnly.startsWith("/")) return null
  if (pathOnly.includes("..")) return null
  if (pathOnly.startsWith("/api/") || pathOnly.startsWith("/_next")) return null

  const path = canonicalizeTrailingSlash(pathOnly)

  if (path === "/community") return "/community"
  if (path.startsWith("/community/")) {
    if (path === "/community/attribution") return "/community/attribution"
    if (path.startsWith("/community/attribution/")) return "/community/attribution"
    return "/community/attribution"
  }

  if (EXACT_ALLOWED.has(path)) return path
  if (isPrefixAllowed(path)) return path

  return null
}
