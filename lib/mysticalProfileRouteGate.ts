/**
 * PERFORMANCE ARCHITECTURE — Mystical profile Firestore subscription gate
 * Avoids onSnapshot + fetch on marketing/legal routes; subscribes when user navigates to tool/profile surfaces.
 */

const PREFIX_ROUTES = [
  "/profile",
  "/mystical-profile",
  "/profile-setup",
  "/tools",
  "/ask-the-seer",
  "/seer",
  "/remedies",
  "/daily",
  "/credits",
  "/settings",
] as const;

const EXACT_ROUTES = ["/"] as const;

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** True when the route benefits from live comprehensive mystical profile data */
export function shouldSubscribeMysticalProfile(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  if ((EXACT_ROUTES as readonly string[]).includes(pathname)) return true;
  if (PREFIX_ROUTES.some((p) => matchesPrefix(pathname, p))) return true;
  if (pathname.startsWith("/ask-") && pathname.endsWith("-seer")) return true;
  if (pathname.startsWith("/admin")) return true;
  return false;
}
