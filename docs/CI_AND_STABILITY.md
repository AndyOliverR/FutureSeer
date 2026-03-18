### CI & Stability Guardrails

**What runs automatically**

- GitHub Actions workflow: `.github/workflows/ci.yml`
  - **On every pull request and push to `main`**:
    - `pnpm install --frozen-lockfile`
    - `pnpm run lint`
    - `pnpm test`
  - **Playwright smoke (PR, push, nightly, manual)**:
    - Installs Playwright browsers
    - Runs `pnpm run test:e2e:ci` (build + start + Playwright tests)
    - Uploads `playwright-report` as an artifact

**E2E smoke coverage (Playwright)**

- `e2e/onboarding.smoke.spec.ts`
  - Sign-in page → `/profile`
  - Edit profile, save, and expect “Profile updated successfully!”
- `e2e/specialUserQuota.smoke.spec.ts`
  - `/profile` for a special user should not show “Profile update limit reached”
  - Generate button is enabled when birth details exist
- `e2e/navigation.smoke.spec.ts`
  - Basic navigation across `/`, `/tools`, `/ask-the-seer`, `/profile`, `/community/attribution`

**Key Jest integration tests**

- `tests/integration/profileQuota.spec.ts`
  - Validates `lib/profileEditQuota.ts` limits and period reset rules

**How to enable branch protection (GitHub UI)**

1. Go to **Settings → Branches → Branch protection rules**.
2. Add a rule for `main`.
3. Enable:
   - “Require a pull request before merging”
   - “Require status checks to pass before merging”
   - Select:
     - `CI / Lint + Jest`
     - `CI / Playwright smoke`

**How to enable monitoring (optional, free tier)**

- Client bootstrap: `lib/monitoring.ts` (used from `app/layout.tsx`).
- Server helper: `lib/serverMonitoring.ts`.

To turn on monitoring:

1. Create a free project in Sentry (or compatible service).
2. Add environment variables:
   - On Vercel and GitHub:
     - `NEXT_PUBLIC_SENTRY_DSN=<frontend DSN>`
     - `SENTRY_DSN=<server DSN>` (or `SENTRY_SERVER_DSN`)
3. Redeploy. When DSNs are present:
   - Client errors will start sending to Sentry.
   - `captureServerException` can be used in API routes to log server errors.

