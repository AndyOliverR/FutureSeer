# SEO Indexing Audit Checklist (Search Console URLs)

Use this checklist for each affected URL in Search Console.

1. Inspect URL in Search Console and note:
   - Crawled URL
   - User-declared canonical
   - Google-selected canonical
2. If crawled URL is non-canonical:
   - Enforce one-hop permanent redirect (301/308) to canonical URL.
3. Verify canonical destination:
   - Returns `200`
   - Contains an explicit canonical tag to itself
   - Is present in `sitemap.xml`
4. Remove non-canonical/redirect-source URL from:
   - Sitemap entries
   - Internal links
5. Re-test:
   - Run URL Inspection -> Test live URL
   - Request indexing for canonical destination URL

## Host policy for FutureSeer

- Canonical host: `https://futureseer.app`
- Redirect host: `https://www.futureseer.app` -> `https://futureseer.app`

## Search Console snapshot (17 Aug 2026)

Most “why pages aren’t indexed” rows are **expected exclusions**, not ranking emergencies. After this deploy, expand each reason in [Search Console](https://search.google.com/search-console/index?resource_id=sc-domain:futureseer.app), export URLs, confirm they match the table, then click **Validate fix**.

| GSC reason | Action |
|---|---|
| Not found (404) | Real leftovers. Download the URL list. Add 301s for live equivalents (old tool slugs are already in `next.config.mjs`). Leave true dead URLs as 404. Typical leftovers: locale paths under `/hi/tools/...` (only `app/[locale]/page.tsx` exists), removed learn slugs, `/dashboard`. |
| Excluded by noindex | **Leave.** Intended for signin/signup, `/seer`, `/ask-the-seer`, `/notes`. Do not remove noindex unless a public marketing page is in the list. |
| Alternative with proper canonical | **Leave.** www vs apex, `/privacy-policy` → `/privacy`, `/tools/i-ching` → `/tools/iching`, locale landings. |
| Page with redirect | **Leave.** www→apex 308 in `proxy.ts`; i-ching + privacy-policy + tool aliases in `next.config.mjs`; `/mystical-profile` → `/tools`. |
| Soft 404 | **Fixed in code.** Unknown `/tools/[slug]` now returns HTTP 404 (`notFound()`), not a 200 empty shell. |
| Crawled – currently not indexed | Quality/queue, not a robots bug. Keep `ToolSeoIntro` on public tool layouts. After deploy, URL Inspection + **Request indexing** only for money pages: `/`, `/tools`, `/pricing`, `/learn`, top public tools. Do **not** request `/signin` or `/community/*`. |
| Discovered – currently not indexed | Queue. Sitemap hygiene helps (`/community/attribution` removed because `/community*` is auth-gated). Cannot force indexing. |

### After deploy (manual)

1. Confirm canonical `https://futureseer.app` and www 308 still hold (URL Inspection).
2. Expand each GSC reason → export URLs → match the table above.
3. Request indexing only for public money pages listed above.
4. Click **Validate fix** on rows that were actually fixed (soft 404, sitemap, 301 aliases).

Out of scope: indexing private reports, on-demand generate, planetary-guidance WIP.

## Current known examples

- `https://www.futureseer.app/` -> canonical destination `https://futureseer.app/`
- `https://futureseer.app/daily` -> canonical `https://futureseer.app/daily`
