# Failure triage — map errors to the right layer

When something fails, identify **which layer** is broken before changing code. Use [DEVELOPER_RUNBOOK.md](./DEVELOPER_RUNBOOK.md) for the canonical doc index.

## Layers

| Layer | What it is | Typical symptoms | Verify with |
|-------|------------|------------------|-------------|
| **Web / API** | Node server build, API routes, Vercel | 500s, build errors, wrong env on deploy | `pnpm run build`, `pnpm run lint`, `pnpm test`, `pnpm run test:e2e:ci` |
| **Static export** | `CAPACITOR_BUILD=1` → `out/` | Missing `out/`, export errors, dynamic route issues | `pnpm run build:capacitor` |
| **Capacitor** | `webDir`, sync, plugins | Stale UI in app, sync complaints | `pnpm run cap:sync` or `pnpm run mobile:build` |
| **Native shell** | Xcode / Gradle, signing | Install fails, signing errors | [APP_STORE_PLAY_STORE_READINESS.md](./APP_STORE_PLAY_STORE_READINESS.md), [ANDROID_STUDIO_ERRORS.md](./ANDROID_STUDIO_ERRORS.md) |
| **Runtime (mobile WebView)** | API base URL, CORS, auth in WebView | Works in browser, fails on device | Confirm production API URL and Firebase auth config for native |

## Quick commands (local)

```bash
pnpm run build
pnpm run lint
pnpm test
pnpm run build:capacitor
```

Optional full smoke (build + server + Playwright): `pnpm run test:e2e:ci`

## Recording a failure

When reporting or fixing an issue, capture:

1. **Command** (exact)
2. **Exit code / stderr** (first 30 lines)
3. **Layer** from the table above
4. **Environment** (OS, Node `node -v`, branch)

---

## Last verification run (automated)

This section is updated when maintainers run the audit commands in CI or locally. **Full audit runs** (Tier 1–2 tables, security audit outcome, manual checklist) live in **[AUDIT_LOG.md](./AUDIT_LOG.md)**.

| Command | Exit | Layer | Notes |
|---------|------|-------|--------|
| `node -v` / `pnpm -v` | — | Web | v24.13.1 / 10.28.2 (matches AGENTS.md) |
| `pnpm run lint` | **1** | Web | Fails: large backlog (e.g. `no-explicit-any`, `no-require-imports` in scripts/tests). **Not** a signal that `pnpm run build` is broken. |
| `pnpm run build` | 0 | Web | Next.js production build succeeded (occasional webpack warnings from third-party deps). |
| `pnpm run build:capacitor` | 0 | Static export | `out/index.html` present; same as web build. |
| `pnpm test` | 0 | Web | 7 suites, 56 tests passed. |

**Mapping:** Lint debt is **Web / quality**; treat it separately from Capacitor or native store steps. Use [APP_STORE_PLAY_STORE_READINESS.md](./APP_STORE_PLAY_STORE_READINESS.md) when `build:capacitor` fails or `out/` is missing.
