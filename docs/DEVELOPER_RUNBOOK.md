# Developer runbook (canonical)

Use this file as the **single index** for how to build, ship, and audit FutureSeer. Tooling versions and day-to-day commands are authoritative in **[AGENTS.md](../AGENTS.md)**.

**Latest full audit:** [AUDIT_LOG.md](./AUDIT_LOG.md) (automated Tier 1–2 + manual Tier 3 checklist).

## Core documents (read in this order for a full audit)

| Order | Document | Purpose |
|-------|----------|---------|
| 1 | [AGENTS.md](../AGENTS.md) | Node 24, pnpm, dev server, env vars, lint, tests, architecture |
| 2 | [CI_AND_STABILITY.md](./CI_AND_STABILITY.md) | What CI runs (lint, Jest, Playwright), branch protection, optional Sentry |
| 3 | [APP_STORE_PLAY_STORE_READINESS.md](./APP_STORE_PLAY_STORE_READINESS.md) | Capacitor static build (`out/`), `mobile:build`, sync, signing, store versioning |

## Related references

- End-to-end tests: [E2E_TESTS.md](./E2E_TESTS.md)
- Android Studio issues: [ANDROID_STUDIO_ERRORS.md](./ANDROID_STUDIO_ERRORS.md)
- Security commands: [SECURITY_CHECKS.md](./SECURITY_CHECKS.md)
- Auth and routing: [AUTH_AND_ROUTING_SUMMARY.md](./AUTH_AND_ROUTING_SUMMARY.md)
- Failure triage (layer mapping): [FAILURE_TRIAGE.md](./FAILURE_TRIAGE.md)
- System design concepts → this app (gaps & prioritized fixes): [SYSTEM_DESIGN_GAPS_AND_FUTURESEER.md](./SYSTEM_DESIGN_GAPS_AND_FUTURESEER.md)
- Design principles (dual DS, grounded AI, a11y): [DESIGN_PRINCIPLES.md](./DESIGN_PRINCIPLES.md)
- HEART metrics + SEQ survey: [HEART_AND_METRICS.md](./HEART_AND_METRICS.md)
- Roadmap prioritization (impact–effort, second-order): [ROADMAP_PRIORITIZATION.md](./ROADMAP_PRIORITIZATION.md)
- Marketing and asset workflow (message, channels, frequency, MJ/Firefly, optional Rive/Spline): [MARKETING_AND_ASSET_WORKFLOW.md](./MARKETING_AND_ASSET_WORKFLOW.md)

## External comparison (optional)

Community Next + Capacitor starters are useful to compare **config only** (static export, `webDir`, scripts)—not to replace this app’s stack. Prefer **[Capacitor Next.js](https://capacitorjs.com/docs/next)** and **[Next.js static exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)** for correctness.
