/**
 * Prints plan steps that must be done in Google Search Console and DNS (not automatable from this repo).
 * Run: pnpm audit:gsc-hygiene
 */
const lines = [
  "",
  "=== Google Search Console (manual) ===",
  "1. Open Users and permissions:",
  "   https://search.google.com/search-console/users",
  "2. If you do not recognize an Owner, remove them (or downgrade if available).",
  "3. Settings > Ownership verification: keep at least one method before removing DNS TXT.",
  "",
  "=== Registrar / DNS (manual) ===",
  "1. Audit who can log in to the domain registrar and DNS host.",
  "2. Review TXT records for google-site-verification=... tokens.",
  "3. Remove only tokens tied to accounts you are revoking.",
  "",
  "=== 404 report (manual in GSC) ===",
  "1. Indexing > Pages > Not found (404) > open examples / export URLs.",
  "2. Compare with automated check: pnpm audit:sitemap:live",
  "   (confirms current sitemap.xml URLs return 2xx/3xx on production).",
  "",
  "=== Canonical conflict check (manual in GSC) ===",
  "1. Indexing > Pages > Duplicate, Google chose different canonical than user.",
  "2. Export example URLs and group by template (/tools, /learn, etc.).",
  "3. URL Inspection each group: compare User-declared canonical vs Google-selected canonical.",
  "4. Confirm sitemap URL, internal links, and final redirected URL all match canonical host/path.",
  "",
  "=== hreflang/alternates check (manual) ===",
  "1. Inspect one /learn/[slug] URL and verify alternates include locale variants + x-default.",
  "2. Ensure locale URLs in sitemap match alternates language targets.",
  "",
];
console.log(lines.join("\n"));
