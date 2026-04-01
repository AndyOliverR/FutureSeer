# Full stability audit log

Baseline recorded from automated commands. Update this file when you re-run an audit.

| Field | Value |
|-------|--------|
| **Commit** | `efa53e4390915e39c3a078872eb6946026fed28d` |
| **Commit date** | 2026-03-20 (author timestamp) |
| **Environment** | Windows, Node 24.x, pnpm 10.28.2 |
| **Tier 3 (production)** | Validated by operator — 2026-03-20 (see below) |

---

## Tier 1 — Automated

| Step | Command | Result |
|------|---------|--------|
| Install | `pnpm install --frozen-lockfile` | Pass |
| Jest | `pnpm test` | Pass (7 suites, 56 tests) |
| Production build | `pnpm run build` | Pass (occasional webpack warnings from third-party deps) |
| E2E smoke | `pnpm run test:e2e:ci` | Pass (8 Playwright tests) |
| Security script | `pnpm run security` | **Fail** — `pnpm audit --audit-level=high` still reports **48** vulnerabilities (6 low, 12 moderate, 29 high, **1 critical**); the script stops there so **`pnpm run lint` does not run** in that single command. See [SECURITY_CHECKS.md](./SECURITY_CHECKS.md). |

### Is this “fixed”?

**No — not automatically.** Nothing in the repo changes the audit result until dependencies are upgraded (direct or transitive), `pnpm.overrides` are added where safe, or advisories are accepted as **false positives / dev-only / unreachable** with a documented rationale.

**What to do next (pick what fits your risk tolerance):**

1. **Run `pnpm audit`** and review paths (often `firebase-admin`, `@capacitor/cli`, `tailwindcss`→`glob`, `eslint`→`flatted`).
2. **Bump** parent packages when newer releases pull patched subdeps (e.g. newer `firebase-admin`, `@capacitor/cli`, `eslint`).
3. **Use `pnpm.overrides`** in `package.json` only for known-safe pin bumps (test after).
4. **`pnpm run security`** now runs **`scripts/run-security.mjs`**: audit first, **then lint always**; exit non-zero if either fails (see [SECURITY_CHECKS.md](./SECURITY_CHECKS.md)).

**Production validation (Tier 3) does not mean npm audit is clean** — it means the live app works for users; dependency advisories are a separate hygiene track.

---

## Tier 2 — Mobile / static export

| Step | Command | Result |
|------|---------|--------|
| Capacitor export | `pnpm run build:capacitor` | Pass |
| `out/index.html` | `Test-Path out/index.html` | Present |
| `pnpm run mobile:build` | `build:capacitor` + `cap sync` | Pass |
| Native projects | `ios/`, `android/` | Present |

**Notes:** On Windows, `cap sync` warned CocoaPods / `xcodebuild` missing (expected without macOS/Xcode). Android/iOS assets copied; plugins listed: `@capacitor-firebase/authentication@7.0.0`.

---

## Tier 3 — Manual smoke (AGENTS.md critical path)

Complete these in a **real browser** (or production WebView) with a valid Firebase session and deployed API. Playwright smoke does **not** cover full sign-in or mystical generation.

**Production** here means: the **live deployed URL** (same HTTPS origin, env, and Firebase project as end users). Not required for every check—**preview/staging** is fine for pre-release—but **production** was validated for this log.

| # | Check | Status |
|---|--------|--------|
| 1 | Sign-in / sign-up | Pass — production |
| 2 | Profile completion and save | Pass — production |
| 3 | Generate mystical profile (full) | Pass — production |
| 4 | Open a tool page; report loads from Firestore | Pass — production |
| 5 | Ask the Seer (tool + `/seer` as needed) | Pass — production |
| 6 | Community page loads | Pass — production |

**Recorded:** Operator confirmed **2026-03-20**: page loads, signed in, critical flows checked and working on **production**.

---

## Lint vs CI

- **`pnpm run lint`** on the **entire** repo is expected to fail until ESLint backlog is cleared; CI only runs ESLint on **changed** files in PRs (see `.github/workflows/ci.yml`).
- **`pnpm run security`** runs audit then **always** runs lint (see `scripts/run-security.mjs`). It still exits non-zero while **`pnpm audit --audit-level=high`** reports issues.

---

## Related docs

- [DEVELOPER_RUNBOOK.md](./DEVELOPER_RUNBOOK.md) — index of runbooks
- [FAILURE_TRIAGE.md](./FAILURE_TRIAGE.md) — layer mapping for failures
- [CI_AND_STABILITY.md](./CI_AND_STABILITY.md) — CI jobs and Firestore error capture
