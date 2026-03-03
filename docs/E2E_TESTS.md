# E2E Tests (Playwright)

Real-browser end-to-end tests for critical user flows. Same idea as [Canary](https://www.runcanary.ai): test the app as a real user would, so we catch regressions before users do. All free and in-repo.

## What runs

- **Playwright** — runs in Chromium (config: `playwright.config.ts` at repo root).
- **Test dir:** `e2e/` — `smoke.spec.ts` (landing, sign-in), `tools.spec.ts` (tools page or redirect).

## Running locally

1. **App must be running** on `http://localhost:3000`:
   ```bash
   pnpm build && pnpm start
   ```
2. In another terminal:
   ```bash
   pnpm run test:e2e
   ```
3. Or one command (build, start server, run tests, then stop):
   ```bash
   pnpm run test:e2e:ci
   ```

For debugging with UI:
```bash
pnpm run test:e2e:ui
```

## CI (GitHub Actions)

The workflow `.github/workflows/e2e.yml` runs on every **pull_request** and **push** to `main`:

1. Checkout, Node, pnpm, install deps.
2. Install Playwright Chromium.
3. Build the app, start server, wait for `http://localhost:3000`, run `pnpm run test:e2e`.
4. On failure: upload `playwright-report/` and `test-results/` as artifacts (traces, screenshots).

No secrets required for the current public-routes-only tests.

## Critical flows covered

| Flow            | What we assert                                      |
|-----------------|-----------------------------------------------------|
| Landing         | Homepage loads, "Ask the Seer" heading, Sign In and Join buttons, footer Pricing/Contact links |
| Sign-in page    | `/signin` loads, auth UI (Welcome Back / Google / email/password) visible |
| Tools page      | `/tools` loads (no 500); either "Mystical Tools" or redirect to sign-in |

## Adding tests

- Add new `e2e/*.spec.ts` files or new `test()` blocks in existing specs.
- Use `page.goto('/path')`, `getByRole`, `getByPlaceholder`, `getByText` for stability.
- For authenticated flows later: use GitHub Secrets (e.g. `E2E_TEST_USER_EMAIL`, `E2E_TEST_USER_PASSWORD`) and Playwright storage state to reuse login.

## Config

- **Base URL:** `http://localhost:3000`
- **Timeouts:** 30s per test, 10s per expect
- **Report:** List in terminal; HTML in `playwright-report/` (open after run or from CI artifacts on failure).
