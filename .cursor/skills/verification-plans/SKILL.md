---
name: verification-plans
description: >-
  Run path-targeted verification before finishing code changes. Maps git diff
  to commands in docs/VERIFICATION_PLANS.md. Use when implementing features,
  fixing bugs, or before opening a PR — instead of waiting for full CI only.
---

# Verification plans (FutureSeer)

Fast inner-loop checks for agents. Full catalog and audit: **[docs/VERIFICATION_PLANS.md](../../../docs/VERIFICATION_PLANS.md)**.

## When to use

- After editing any application code (`app/`, `components/`, `lib/`, `hooks/`, `e2e/`, `scripts/`).
- Before saying a task is complete or suggesting a PR.
- When the user reports regressions in profile, mystical profile, Seer, or share card flows.

## Workflow

1. **List changed paths**
   ```bash
   git diff --name-only
   ```
   If nothing staged, include untracked files relevant to the task.

2. **Resolve plans** — Open `docs/VERIFICATION_PLANS.md` → section **Path → plan mapping**. Collect every **Plan ID** whose pattern matches any changed path. Always include **`plan-core`** last.

3. **Run commands** — For each plan ID (in catalog order: specific plans first, `plan-core` last), run every command in that plan’s **Commands** block. Use repo root; Node 24 + pnpm per AGENTS.md.

4. **On failure** — Fix the issue, re-run only the failed plan (and `plan-core`), then continue.

5. **Do not** run `pnpm run test:e2e:ci` unless a matched plan requires it or the user changed routing/landing/tools E2E — it is slow (build + browser).

## Quick path → plan lookup

| If you changed… | Run these plan IDs |
|-----------------|-------------------|
| `MysticalShare*` / `lib/growth/mysticalShare*` | `plan-share-card` |
| `mystical-profile` / `MysticalProfileContext` | `plan-mystical-profile`, often `plan-share-card` |
| `ProfilePhoto*` / `ProfileCamera*` / profile photos | `plan-profile-photos` |
| `app/profile` | `plan-profile` (+ `plan-profile-photos` if camera/upload) |
| `generate-mystical` / `profileGenerationOrchestrator` | `plan-profile-generate` |
| `lib/ai*` / `seer*` / `enforceToolSeer*` | `plan-ai-seer` |
| `app/api/ask-*-seer` | `plan-ai-seer`, `plan-ai-seer-tool` |
| `app/api/seer` / `/seer` page | `plan-ai-seer`, `plan-ai-seer-main` |
| `birth*` / `vedic/` / `western/` / `astronomia` | `plan-astrology-pipeline` |
| `hero` / `landing` / `globals.css` / `app/page` | `plan-landing` |
| `app/tools/` | `plan-tools-ui` |
| `signin` / `signup` / `use-auth` | `plan-auth` |
| `app/api/payments` | `plan-payments` |
| `app/api/` or `scripts/` security-sensitive | `plan-security` |
| Everything else | `plan-ui` or `plan-api-lib` + **`plan-core`** |

## ESLint changed files only

```bash
pnpm exec eslint path/to/File.tsx path/to/other.ts
```

Match CI: lint only files you changed, not the whole repo.

## Completion checklist

- [ ] All matched plans from VERIFICATION_PLANS.md executed successfully
- [ ] `plan-core` passed (`pnpm test` + eslint on touched files)
- [ ] If `app/api/` / payments / upload touched: `plan-security` passed
- [ ] Manual steps noted in catalog performed when E2E cannot cover auth
- [ ] Did not claim "CI will pass" without running mapped commands locally

## CI backstop

PRs still run `.github/workflows/ci.yml` (security, lint+jest, Playwright). Plans reduce surprises; they do not replace CI.

For CI failures, use the global **fix-ci** / **loop-on-ci** skills after local plans pass.
