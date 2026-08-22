# Developer runbook (canonical)

Use this file as the **single index** for how to build, ship, and audit FutureSeer. Tooling versions and day-to-day commands are authoritative in **[AGENTS.md](../AGENTS.md)**.

**Latest full audit:** [AUDIT_LOG.md](./AUDIT_LOG.md) (automated Tier 1–2 + manual Tier 3 checklist).

## Core documents (read in this order for a full audit)

| Order | Document | Purpose |
|-------|----------|---------|
| 1 | [AGENTS.md](../AGENTS.md) | Node 24, pnpm, dev server, env vars, lint, tests, architecture |
| 2 | [CI_AND_STABILITY.md](./CI_AND_STABILITY.md) | What CI runs (lint, Jest, Playwright), branch protection, Firestore error capture |
| 3 | [APP_STORE_PLAY_STORE_READINESS.md](./APP_STORE_PLAY_STORE_READINESS.md) | Historical store notes — shipping path is the web PWA |

## Related references

- End-to-end tests: [E2E_TESTS.md](./E2E_TESTS.md)
- Agent verification plans (path → commands, audit): [VERIFICATION_PLANS.md](./VERIFICATION_PLANS.md)
- Android Studio issues: [ANDROID_STUDIO_ERRORS.md](./ANDROID_STUDIO_ERRORS.md)
- Security commands: [SECURITY_CHECKS.md](./SECURITY_CHECKS.md)
- Security baseline operations: [SECURITY_BASELINE_RUNBOOK.md](./SECURITY_BASELINE_RUNBOOK.md)
- Auth and routing: [AUTH_AND_ROUTING_SUMMARY.md](./AUTH_AND_ROUTING_SUMMARY.md)
- Failure triage (layer mapping): [FAILURE_TRIAGE.md](./FAILURE_TRIAGE.md)
- reCAPTCHA support triage map: [CAPTCHA_TRIAGE.md](./CAPTCHA_TRIAGE.md)
- System design concepts → this app (gaps & prioritized fixes): [SYSTEM_DESIGN_GAPS_AND_FUTURESEER.md](./SYSTEM_DESIGN_GAPS_AND_FUTURESEER.md)
- Design principles (dual DS, grounded AI, a11y): [DESIGN_PRINCIPLES.md](./DESIGN_PRINCIPLES.md)
- Canonical AI/UI design contract (tokens, components, responsive/a11y rules): [DESIGN.md](../DESIGN.md)
- HEART metrics + SEQ survey: [HEART_AND_METRICS.md](./HEART_AND_METRICS.md)
- Industry mobile growth trends vs this repo (Adjust 2026 synthesis): [analytics/ADJUST_2026_MOBILE_TRENDS_SYNTHESIS.md](./analytics/ADJUST_2026_MOBILE_TRENDS_SYNTHESIS.md)
- Roadmap prioritization (impact–effort, second-order): [ROADMAP_PRIORITIZATION.md](./ROADMAP_PRIORITIZATION.md)
- Marketing and asset workflow (message, channels, frequency, MJ/Firefly, optional Rive/Spline): [MARKETING_AND_ASSET_WORKFLOW.md](./MARKETING_AND_ASSET_WORKFLOW.md)
- Organic growth (user share cards + social scheduler architecture): [ORGANIC_GROWTH_ARCHITECTURE.md](./ORGANIC_GROWTH_ARCHITECTURE.md)
- Google OAuth branding verification (Search Console + consent screen): [GOOGLE_OAUTH_BRANDING_VERIFICATION.md](./GOOGLE_OAUTH_BRANDING_VERIFICATION.md)
- AI control layer (gateway, fallback, prompt assembly, Phase 4 hardening): [AGENTS.md](../AGENTS.md) — `buildToolSeerMessages`, optional `AI_CIRCUIT_STORE=firestore`, semantic injection tuning ([AI_INJECTION_TUNING.md](./AI_INJECTION_TUNING.md)), tool Seer Q&A cache via `cacheQuestion` + `cacheToolSeerAnswer`.

## Local env from Vercel (`vercel env pull`)

Do **not** rely on a restored or hand-copied `.env.local` long-term. Pull from the Vercel project (source of truth for production secrets).

| Command | Writes | Source environment |
|---------|--------|--------------------|
| `pnpm run env:pull` | `.env.local` | Development (Vercel default) |
| `pnpm run env:pull:development` | `.env.local` | Development |
| `pnpm run env:pull:preview` | `.env.preview.local` | Preview |
| `pnpm run env:pull:production` | `.env.local` | Production |

Prerequisites:

1. `npx vercel login` (once per machine)
2. Linked project under `.vercel/` — already present for this repo’s maintainers; otherwise `pnpm run vercel:link`
3. `.env*` is gitignored — confirm `git check-ignore -v .env.local` before committing anything

**After a production pull for local Next.js:** set `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<projectId>.firebaseapp.com` and usually `NEXT_PUBLIC_APP_URL=http://localhost:3000` / `NEXT_PUBLIC_BASE_URL=http://localhost:3000` so Google/Apple popup auth and local API base URLs work (see next section).

Optional sanity checks: `pnpm run check:firebase-admin`, `pnpm run check:distributed-controls`.

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

## Distributed controls (production scale)

Firestore-backed **rate limits** and **AI circuit breaker** coordinate across Vercel serverless instances. Without these env vars, each instance uses in-memory state only.

| Variable | Value | Requires |
|----------|-------|----------|
| `RATE_LIMIT_STORE` | `firestore` | `FIREBASE_ADMIN_*` → collection `_apiRateLimits` |
| `AI_CIRCUIT_STORE` | `firestore` | `FIREBASE_ADMIN_*` → collection `_aiCircuitBreaker` |

### Enable on Vercel (Production)

1. [Vercel Dashboard](https://vercel.com) → your **FutureSeer** project → **Settings** → **Environment Variables**.
2. Add **`RATE_LIMIT_STORE`** = `firestore` → scope **Production** (optionally Preview for staging).
3. Add **`AI_CIRCUIT_STORE`** = `firestore` → scope **Production**.
4. Confirm **`FIREBASE_ADMIN_PROJECT_ID`**, **`FIREBASE_ADMIN_CLIENT_EMAIL`**, **`FIREBASE_ADMIN_PRIVATE_KEY`** are already set for Production (same as other Admin routes).
5. **Redeploy** production (env vars apply on the next deployment, not retroactively to running lambdas).

CLI alternative (after `npx vercel login` and `vercel link`):

```bash
npx vercel env add RATE_LIMIT_STORE production
# enter: firestore
npx vercel env add AI_CIRCUIT_STORE production
# enter: firestore
npx vercel --prod
```

### Verify

**Local env (optional):** `pnpm run check:distributed-controls` — checks `.env.local` only.

**Production (authoritative):** As an admin user, call:

```http
GET https://futureseer.app/api/diagnose
Authorization: Bearer <Firebase ID token>
```

Expect `services.distributedControls.mode` = **`"firestore"`** and both `active: true`. If `mode` is `"partial"` or `"memory"`, read `recommendations` in the JSON.

After real API traffic, optional Firestore console check: collections **`_apiRateLimits`** and **`_aiCircuitBreaker`** receive documents.

## External comparison (optional)

Community Next + Capacitor starters are useful to compare **config only** (static export, `webDir`, scripts)—not to replace this app’s stack. Prefer **[Capacitor Next.js](https://capacitorjs.com/docs/next)** and **[Next.js static exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)** for correctness.

## Linux desktop quick runbook (Electron)

Use this when validating desktop support for Linux users.

1. Ensure runtime prerequisites:
   - Node `24.x`, pnpm `10.28.2` (from `package.json` / `AGENTS.md`)
   - X11 runtime available (for local GUI) or `xvfb` in CI/headless environments
2. Install deps: `pnpm install --frozen-lockfile`
3. Build web app: `pnpm run build`
4. Launch desktop (Linux-safe): `pnpm run desktop:linux`

### Linux smoke command (headless/CI)

For a quick launch verification without manual interaction:

- `ELECTRON_NO_SANDBOX=1 ELECTRON_EXIT_AFTER_MS=5000 pnpm run electron`

Notes:
- `ELECTRON_NO_SANDBOX=1` is intended for CI/root-like Linux runners.
- `ELECTRON_EXIT_AFTER_MS` auto-quits the app after startup so smoke checks can finish.

### Automated Linux readiness audit (strict 10-point)

Run:

- `pnpm run linux:readiness`

What it checks (PASS/FAIL):
1. Node version (`24.x`)
2. pnpm version (`10.28.2`)
3. Frozen lockfile install
4. Production build
5. Production server startup
6. `/signin` HTML render
7. `/profile` HTML render
8. Mobile-width render probe
9. Electron binary health
10. Headless Electron launch smoke (`xvfb-run`)

Exit code:
- `0` when all checks pass
- `1` when one or more checks fail
