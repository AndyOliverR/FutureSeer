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

## Current known examples

- `https://www.futureseer.app/` -> canonical destination `https://futureseer.app/`
- `https://futureseer.app/daily` -> canonical `https://futureseer.app/daily`
