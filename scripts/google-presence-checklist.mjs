/**
 * Checklist + deep links for "Improve Google presence" (Search Console + Vercel).
 * Run: pnpm audit:google-presence
 */
const rid = encodeURIComponent("sc-domain:futureseer.app");
const gsc = (path) => `https://search.google.com/search-console${path}?resource_id=${rid}`;

const lines = [
  "=== Improve Google presence (manual steps) ===",
  "",
  "1) Submit sitemap (once, then leave it):",
  `   ${gsc("/sitemaps")}`,
  "   URL to submit: https://futureseer.app/sitemap.xml",
  "",
  "2) Vercel (or host) env — must match canonical site:",
  "   NEXT_PUBLIC_APP_URL=https://futureseer.app",
  "   (drives sitemap.xml, robots.txt sitemap line, metadataBase / OG URLs)",
  "",
  "3) Performance (queries, pages, countries):",
  `   ${gsc("/performance/search-analytics")}`,
  "",
  "4) Page indexing (coverage / reasons):",
  `   ${gsc("/index")}`,
  "",
  "5) After each major deploy — URL Inspection:",
  "   Use the inspect bar at the top of Search Console with a live production URL.",
  "",
  "6) Users — least privilege for teammates:",
  `   ${gsc("/users")}`,
  "   Prefer Full or Restricted; reserve Owner for people who need DNS-level control.",
  "",
  "=== Automated checks (repo) ===",
  "   pnpm audit:sitemap:live   — HEAD every URL in live sitemap.xml",
  "   pnpm audit:gsc-hygiene    — security / DNS reminder script",
  "",
];
console.log(lines.join("\n"));
