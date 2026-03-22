## What changed

- [ ] Describe the user-visible change in 1-3 bullets.
- [ ] Link issue/error report (if bugfix).

## Why this change is safe

- [ ] Root cause identified (for bugfixes).
- [ ] Scope is focused (no unrelated refactors).
- [ ] Risk areas reviewed (auth/profile/onboarding/payments if touched).

## Verification

- [ ] `pnpm run lint`
- [ ] `pnpm test`
- [ ] Playwright smoke run (required for high-risk flows):
  - [ ] onboarding/profile/auth
  - [ ] special-user quota behavior (if relevant)

## Regression prevention

- [ ] Added/updated at least one test that would fail before this change.
- [ ] Confirmed existing behavior outside this scope is unchanged.

## Release checklist (solo-friendly)

- [ ] CI is green:
  - [ ] `CI / Lint + Jest`
  - [ ] `CI / Playwright smoke`
- [ ] Ready to merge to `main`.
- [ ] Post-merge production sanity checks planned.

