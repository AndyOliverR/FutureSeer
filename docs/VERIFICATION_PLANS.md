# Verification plans (agent inner loop)

FutureSeer uses a **two-loop** validation model. This doc is the **inner loop**: small, path-targeted checks agents run **before** opening a PR. **CI** (`.github/workflows/ci.yml`) remains the outer-loop backstop.

Inspired by [CI for coding agents](https://thenewstack.io/ci-for-coding-agents/) — we use **plans** (behavior + commands), not Signadot/K8s. No new infrastructure.

---

## Audit snapshot (where things live)

### CI today (single workflow)

| Job | Blocks merge? | What it runs |
|-----|---------------|--------------|
| **Security Scan** | Yes | `pnpm security` (audit + `lint:security` on `app/api`, `scripts`, `lib`), Gitleaks |
| **Lint + Jest** | Yes | ESLint on **changed** `.ts/.tsx` only; full `pnpm test` |
| **Playwright smoke** | Yes | `pnpm run test:e2e:ci` (build + 4 active specs, unauthenticated) |
| **Linux desktop smoke** | No (`continue-on-error`) | Build + Electron xvfb ~5s |
| **Linux readiness audit** | Yes (PR/push) | `pnpm run linux:readiness` |

**Not in CI:** `pnpm test:integration` alone, `pnpm test:seer`, `pnpm test:coverage`, full-repo `pnpm run lint`.

### Test layers

| Layer | Location | Role |
|-------|----------|------|
| Unit | `tests/unit/` (30 files), `lib/**/*.test.ts` | Fast logic, AI gates, parsers, share card |
| Integration | `tests/integration/` (7 files) | Profile generate API (mocked), ask-the-seer proxy, gating, tool-visit |
| QA / manual | `tests/qa/`, `tests/regressionRunner.ts` | Seer regression (needs running app + env) |
| E2E | `e2e/*.spec.ts` (6 files) | Browser smoke; **no logged-in flows** in CI |

### API surface (196 `route.ts` handlers)

| Domain | ~Count | Risk |
|--------|-------:|------|
| `app/api/ask-*-seer` | 40 | AI + streaming + gates |
| `app/api/profile/*` | 7 | Generation, upload, quota |
| `app/api/seer/*`, main chat | 4 | Unified Seer |
| `app/api/payments/*` | 6 | **No automated tests** |
| `app/api/tools/*` | 31 | Tool runtime |
| `app/api/admin/*` | 22 | Privileged ops |
| Comprehensive `*/comprehensive` | 14 | Report generation |

### Critical user flows vs coverage

| Flow | Routes / libs | Automated coverage |
|------|---------------|-------------------|
| Sign-in / sign-up | `app/signin`, `app/signup`, Firebase | E2E UI smoke; unit auth mocks — **no real Auth E2E** |
| Profile + photos | `app/profile`, `ProfilePhotoCapture*` | E2E onboarding smoke (anonymous-safe) — **no camera E2E** |
| Mystical profile + snippets | `app/mystical-profile`, `MysticalProfileContext` | API tests mocked; share card unit — **no generation E2E** |
| Tool reports | `app/tools/*`, orchestrator | `tool-visit`, readiness — **no per-tool E2E** |
| Per-tool Seer | `app/api/ask-*-seer` | AI unit tests — **no per-route integration** |
| Main Seer | `app/seer`, `app/api/seer/chat` | `ask-the-seer.test.ts` wrapper only |
| Payments | `app/api/payments/*` | Gating helpers only |

### Repo agent skills

- **In repo:** `.cursor/skills/verification-plans/` (this workflow).
- **Global (Cursor plugins):** `run-smoke-tests`, `fix-ci`, `verify-this`, `loop-on-ci` — use together with plans below.

---

## How to use a plan

1. After editing, run `git diff --name-only` (or use the changed-files list from the session).
2. Match paths against [Path → plan mapping](#path--plan-mapping) (first match wins; run **all** matching plans).
3. Run each plan’s **Commands** in order. Stop and fix on first failure.
4. For UI work, note **manual** steps when E2E does not cover auth.
5. Before marking work complete, run **plan-core** if nothing else matched.

**Rules**

- Prefer the **smallest** plan that covers the diff; do not run `test:e2e:ci` for a one-line copy change in `knowledge/`.
- Do not skip **plan-security** when touching `app/api/`, `scripts/`, or `lib/` auth/payment/upload paths.
- `pnpm run test:e2e:ci` needs ~10–25 min (full build). Use only when a plan says so or UI/routing changed.

---

## Path → plan mapping

Use glob-style patterns. Multiple plans can apply.

| Path patterns | Plan ID(s) |
|---------------|------------|
| `components/growth/MysticalShare*`, `lib/growth/mysticalShare*` | `plan-share-card` |
| `app/mystical-profile/**`, `contexts/MysticalProfileContext*` | `plan-mystical-profile` |
| `components/profile/ProfilePhoto*`, `components/profile/ProfileCamera*` | `plan-profile-photos` |
| `app/profile/**`, `app/profile-setup/**` | `plan-profile`, `plan-profile-photos` (if photo UI) |
| `app/api/profile/generate-mystical/**`, `lib/profileGenerationOrchestrator*` | `plan-profile-generate` |
| `app/api/profile/upload-photo/**`, `lib/imageCompression*` | `plan-profile-photos` |
| `lib/ai*.ts`, `lib/seer*.ts`, `lib/enforceToolSeer*`, `lib/aiGateway*`, `lib/aiStructuredOutput*` | `plan-ai-seer` |
| `app/api/ask-*-seer/**`, `lib/*SeerPrompts*` | `plan-ai-seer`, `plan-ai-seer-tool` |
| `app/api/seer/**`, `app/api/ask-the-seer/**`, `app/seer/**`, `app/ask-the-seer/**` | `plan-ai-seer`, `plan-ai-seer-main` |
| `lib/birth*.ts`, `lib/birthDateTimeToUTC*`, `lib/vedic/**`, `lib/western/**`, `lib/astronomia*` | `plan-astrology-pipeline` |
| `app/globals.css`, `components/hero*`, `app/page.tsx`, `components/landing/**` | `plan-landing` |
| `app/tools/**`, `components/**` tool UI | `plan-tools-ui` |
| `app/signin/**`, `app/signup/**`, `hooks/use-auth*`, `lib/firebase.ts` | `plan-auth` |
| `app/api/payments/**`, `lib/subscription*` | `plan-payments` |
| `scripts/run-security.mjs`, `package.json` (audit/overrides), `.github/workflows/ci.yml` | `plan-security` |
| `e2e/**`, `playwright.config.ts` | `plan-e2e` |
| `app/api/**` (other), `lib/**` | `plan-api-lib` |
| `components/**`, `hooks/**`, `app/**` (UI) | `plan-ui` |
| Any code change | `plan-core` (always, last) |

---

## Plan catalog

### `plan-core` — default backstop

**Selection hint:** Any code change; run before claiming done.

**Commands:**

```bash
pnpm exec eslint <changed-files.ts/tsx>   # only files you touched
pnpm test
```

If no TS files changed, run `pnpm test` only.

---

### `plan-security` — API / scripts / lib security

**Selection hint:** `app/api/`, `scripts/`, payment/auth/upload libs, CI workflow, `run-security.mjs`.

**Commands:**

```bash
pnpm run security
```

---

### `plan-share-card` — cosmic share card

**Selection hint:** Share card visual, panel, growth card libs, export PNG.

**Commands:**

```bash
pnpm test tests/unit/mysticalShareCard.test.ts
pnpm exec eslint components/growth/MysticalShareCardVisual.tsx components/growth/MysticalShareCardPanel.tsx lib/growth/mysticalShareCard.ts
```

**Manual (after deploy or local `pnpm build && pnpm start`):** Open `/mystical-profile` — card not clipped; body text readable; Download PNG works.

---

### `plan-mystical-profile` — snippets, context, page

**Selection hint:** Mystical profile page, snippet cards, profile context cache/refresh.

**Commands:**

```bash
pnpm test tests/integration/report-readiness.test.ts tests/integration/profile-generate.test.ts
pnpm exec eslint app/mystical-profile/page.tsx contexts/MysticalProfileContext.tsx
```

**Manual:** Logged-in user with generated profile — snippets appear without double refresh; share section loads.

---

### `plan-profile` — profile form & generation entry

**Selection hint:** Profile page, save, generate button, onboarding fields.

**Commands:**

```bash
pnpm test tests/integration/profile-generate.test.ts tests/integration/profileQuota.spec.ts tests/integration/returning-user-gating.test.ts
pnpm exec eslint app/profile/page.tsx
```

**Manual:** Edit profile → save; Generate Full Report disabled/enabled states correct.

---

### `plan-profile-photos` — face/palm camera & upload

**Selection hint:** Profile photo capture, camera modal, upload API.

**Commands:**

```bash
pnpm test tests/unit/proxyImageValidation.test.ts
pnpm exec eslint components/profile/ProfilePhotoCaptureButtons.tsx components/profile/ProfileCameraModal.tsx app/profile/page.tsx
```

**Manual:** Mobile or Android — Open camera opens preview; Upload still works. Desktop — file picker OK.

---

### `plan-profile-generate` — mystical generation orchestrator

**Selection hint:** `generate-mystical` route, orchestrator, tool slug pipeline.

**Commands:**

```bash
pnpm test tests/integration/profile-generate.test.ts tests/integration/report-readiness.test.ts tests/integration/tool-visit.test.tsx
pnpm test tests/unit/engine-parity.test.ts
```

---

### `plan-ai-seer` — shared AI control layer

**Selection hint:** Gateway, structured output, injection guard, circuit breaker, prompt builder, token budget.

**Commands:**

```bash
pnpm test tests/unit/aiCircuitBreaker.test.ts tests/unit/aiStructuredOutput.test.ts tests/unit/aiTextStream.test.ts tests/unit/aiFallbackRouter.test.ts tests/unit/aiPromptBuilder.test.ts tests/unit/aiTokenBudget.test.ts tests/unit/seerInputGuard.test.ts tests/unit/seerInjectionClassifier.test.ts tests/unit/enforceToolSeerGate.test.ts tests/unit/seerGateResponses.test.ts tests/unit/toolSeerQuestionCache.test.ts
pnpm run lint:security
```

---

### `plan-ai-seer-tool` — per-tool Ask the Seer route

**Selection hint:** Any `app/api/ask-<tool>-seer/route.ts` or tool-specific seer prompts.

**Commands:**

```bash
pnpm test tests/unit/enforceToolSeerGate.test.ts tests/unit/seerInputGuard.test.ts tests/unit/aiTextStream.test.ts
pnpm exec eslint app/api/ask-*-seer/route.ts lib/*SeerPrompts.ts
pnpm run lint:security
```

**Gap:** No per-tool route integration test yet — add when touching a specific tool seer heavily.

---

### `plan-ai-seer-main` — unified Seer chat

**Selection hint:** `app/api/seer/chat`, `app/api/ask-the-seer`, `/seer` page.

**Commands:**

```bash
pnpm test tests/integration/ask-the-seer.test.ts tests/unit/aiPromptBuilder.test.ts tests/unit/seerInputGuard.test.ts
pnpm exec eslint app/api/seer/chat/route.ts app/api/ask-the-seer/route.ts
```

**Optional (local server + env):** `pnpm run test:seer` — see `tests/README_SEER_REGRESSION.md`.

---

### `plan-astrology-pipeline` — birth time, ephemeris, charts

**Selection hint:** UTC conversion, sidereal/tropical calculators, sign assignment, vedic/western libs.

**Commands:**

```bash
pnpm test tests/unit/engine-parity.test.ts tests/unit/westernBirthTimeAndFacts.test.ts tests/unit/charts.unified.test.ts tests/unit/westernComprehensiveParser.test.ts
pnpm exec eslint lib/birthTimeUtils.ts lib/birthDateTimeToUTC.ts lib/vedic/ lib/western/ lib/astronomia-vedic.ts
```

**Manual rule (AGENTS.md):** After Moon/planet sign changes, verify longitude falls in sign range (dev warning if mismatch).

---

### `plan-landing` — marketing / hero / globals

**Selection hint:** Landing page, hero, global CSS, gold typography.

**Commands:**

```bash
pnpm exec eslint app/page.tsx components/hero-section.tsx app/globals.css components/landing/
```

**Optional E2E:**

```bash
pnpm run test:e2e -- e2e/smoke.spec.ts
```

(requires app running or use `test:e2e:ci` if routing changed)

---

### `plan-tools-ui` — tool pages

**Selection hint:** `app/tools/*` pages or tool-specific components.

**Commands:**

```bash
pnpm test tests/integration/tool-visit.test.tsx
pnpm exec eslint app/tools/<changed-paths>
```

**Optional E2E:**

```bash
pnpm run test:e2e -- e2e/tools.spec.ts
```

---

### `plan-auth` — sign-in / routing / Firebase client

**Selection hint:** Sign-in, sign-up, auth hook, safe redirects.

**Commands:**

```bash
pnpm test tests/unit/safeAuthRedirect.test.ts tests/unit/auth-routing-payment-gate.test.ts tests/unit/firebase.signup.test.ts tests/unit/firebase.oauth-stability.test.ts tests/auth.test.js
pnpm exec eslint app/signin/ app/signup/ hooks/use-auth.tsx
```

---

### `plan-payments` — billing (high risk, low automation)

**Selection hint:** Payments API, subscription, webhooks.

**Commands:**

```bash
pnpm test tests/unit/auth-routing-payment-gate.test.ts tests/integration/returning-user-gating.test.ts
pnpm run lint:security
pnpm exec eslint app/api/payments/
```

**Manual:** Webhook signature, subscribe flow — no CI coverage yet.

---

### `plan-ui` — general components / hooks

**Selection hint:** Shared UI, hooks, non-tool pages.

**Commands:**

```bash
pnpm exec eslint <changed components/hooks/app paths>
pnpm test
```

For layout: check mobile (&lt;768px) and desktop (≥1024px) per AGENTS.md dual design system.

---

### `plan-api-lib` — other API and lib changes

**Selection hint:** `app/api/*` or `lib/*` not covered above.

**Commands:**

```bash
pnpm run lint:security
pnpm exec eslint <changed paths>
pnpm test
```

Add or extend `tests/integration/*` when introducing new API contracts.

---

### `plan-e2e` — Playwright specs

**Selection hint:** Editing `e2e/` or Playwright config.

**Commands:**

```bash
pnpm run build && pnpm start
# other terminal:
pnpm run test:e2e
```

Or CI-equivalent: `pnpm run test:e2e:ci`.

---

## Outer loop (CI) — what agents do not duplicate

On push/PR, GitHub Actions runs the full pipeline. Agents should **not** re-run full CI locally unless debugging CI itself.

| Check name (approx.) | Local equivalent |
|----------------------|------------------|
| Security Scan | `pnpm security` |
| Lint + Jest | `pnpm exec eslint <changed>` + `pnpm test` |
| Playwright smoke | `pnpm run test:e2e:ci` |

See [CI_AND_STABILITY.md](./CI_AND_STABILITY.md), [E2E_TESTS.md](./E2E_TESTS.md).

---

## Gaps → future plans (not implemented yet)

| ID | Behavior to validate | Suggested addition |
|----|----------------------|-------------------|
| `plan-e2e-auth` | Logged-in profile + generation | Playwright storage state + GitHub secrets |
| `plan-e2e-mystical-generate` | Full generate button → cards appear | E2E with test user |
| `plan-birth-utc` | `birthLocalToUTC` + sign ranges | Unit tests in `lib/birthDateTimeToUTC.test.ts` |
| `plan-payments-webhook` | Stripe/Razorpay webhook | Integration test with fixtures |
| `plan-upload-photo` | `upload-photo` API | Integration test with mocked Storage |

When you add a test file for a gap, add a row to **Path → plan mapping** and a catalog entry.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-24 | Initial audit + plan catalog + path mapping (agent inner loop) |
