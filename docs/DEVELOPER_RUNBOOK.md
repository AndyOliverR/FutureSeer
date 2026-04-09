# Developer runbook (canonical)

Use this file as the **single index** for how to build, ship, and audit FutureSeer. Tooling versions and day-to-day commands are authoritative in **[AGENTS.md](../AGENTS.md)**.

**Latest full audit:** [AUDIT_LOG.md](./AUDIT_LOG.md) (automated Tier 1–2 + manual Tier 3 checklist).

## Core documents (read in this order for a full audit)

| Order | Document | Purpose |
|-------|----------|---------|
| 1 | [AGENTS.md](../AGENTS.md) | Node 24, pnpm, dev server, env vars, lint, tests, architecture |
| 2 | [CI_AND_STABILITY.md](./CI_AND_STABILITY.md) | What CI runs (lint, Jest, Playwright), branch protection, Firestore error capture |
| 3 | [APP_STORE_PLAY_STORE_READINESS.md](./APP_STORE_PLAY_STORE_READINESS.md) | Capacitor static build (`out/`), `mobile:build`, sync, signing, store versioning |

## Related references

- End-to-end tests: [E2E_TESTS.md](./E2E_TESTS.md)
- Android Studio issues: [ANDROID_STUDIO_ERRORS.md](./ANDROID_STUDIO_ERRORS.md)
- Security commands: [SECURITY_CHECKS.md](./SECURITY_CHECKS.md)
- Security baseline operations: [SECURITY_BASELINE_RUNBOOK.md](./SECURITY_BASELINE_RUNBOOK.md)
- Auth and routing: [AUTH_AND_ROUTING_SUMMARY.md](./AUTH_AND_ROUTING_SUMMARY.md)
- Failure triage (layer mapping): [FAILURE_TRIAGE.md](./FAILURE_TRIAGE.md)
- reCAPTCHA support triage map: [CAPTCHA_TRIAGE.md](./CAPTCHA_TRIAGE.md)
- System design concepts → this app (gaps & prioritized fixes): [SYSTEM_DESIGN_GAPS_AND_FUTURESEER.md](./SYSTEM_DESIGN_GAPS_AND_FUTURESEER.md)
- Design principles (dual DS, grounded AI, a11y): [DESIGN_PRINCIPLES.md](./DESIGN_PRINCIPLES.md)
- HEART metrics + SEQ survey: [HEART_AND_METRICS.md](./HEART_AND_METRICS.md)
- Roadmap prioritization (impact–effort, second-order): [ROADMAP_PRIORITIZATION.md](./ROADMAP_PRIORITIZATION.md)
- Marketing and asset workflow (message, channels, frequency, MJ/Firefly, optional Rive/Spline): [MARKETING_AND_ASSET_WORKFLOW.md](./MARKETING_AND_ASSET_WORKFLOW.md)
- Google OAuth branding verification (Search Console + consent screen): [GOOGLE_OAUTH_BRANDING_VERIFICATION.md](./GOOGLE_OAUTH_BRANDING_VERIFICATION.md)

## Firebase Auth domain: local dev vs production

`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` is passed to the Firebase client ([`lib/firebase.ts`](../lib/firebase.ts)). If it is your **custom domain** (e.g. `futureseer.app`), the Google **popup** loads `https://<authDomain>/__/auth/handler`—which is **not** served by `next dev` on localhost. The production site must **rewrite** `/__/auth/*` to `https://<projectId>.firebaseapp.com/__/auth/*` ([`next.config.mjs`](../next.config.mjs)).

**Local development:** In `.env.local`, set `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<yourProjectId>.firebaseapp.com` so the popup uses Firebase Hosting’s auth helper. Keep `futureseer.app` (or your custom domain) in Firebase **Authorized domains**; production on Vercel can still use `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=futureseer.app` once `/__/auth/*` returns a non-404.

**Verify production:** `curl -sI https://your-domain/__/auth/handler` should not be a Next 404. If it is, ensure `NEXT_PUBLIC_FIREBASE_PROJECT_ID` (or `FIREBASE_ADMIN_PROJECT_ID`) is set at **build** time on Vercel so rewrites resolve; the config also falls back to the repo’s default project id if both are missing.

### OAuth consistency checklist (quick)

Use this when Google/Apple auth fails on Safari/iOS/macOS or shows `redirect_uri_mismatch` / `auth/unauthorized-domain`.

1. `NEXT_PUBLIC_APP_URL` is canonical (`https://futureseer.app`) and `www` redirects to apex.
2. `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` is intentional:
   - local dev: `<projectId>.firebaseapp.com`
   - production: canonical custom host (recommended) or documented firebaseapp fallback.
3. Firebase Auth → Authorized domains includes the exact auth-domain host.
4. Google OAuth Web client includes exact redirect URI: `https://<authDomain>/__/auth/handler`.
5. Apple Sign in (if enabled) includes exact return URL: `https://<authDomain>/__/auth/handler`.
6. Check `GET /api/diagnose` and inspect `services.oauth.checks` for pass/warn/fail hints.

## External comparison (optional)

Community Next + Capacitor starters are useful to compare **config only** (static export, `webDir`, scripts)—not to replace this app’s stack. Prefer **[Capacitor Next.js](https://capacitorjs.com/docs/next)** and **[Next.js static exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)** for correctness.
