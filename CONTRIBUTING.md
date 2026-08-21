# Contributing to FutureSeer

Thanks for helping improve an open, auditable divination platform. Please read this before opening a PR.

## Ground rules

1. **Occult accuracy** — Each tool must follow that system’s traditional rules. Do not mix Vedic and Western methodologies in the same calculator, or invent shortcuts that break established technique.
2. **No secrets in PRs** — Never commit `.env`, service-account JSON, API keys, or webhook secrets. Use `env-template.txt` placeholders only.
3. **Dual design system** — Desktop (≥768px) uses Devotionist (web) patterns; mobile / Capacitor uses Material 3. Do not apply Material 3 cards/FABs on desktop or glass Devotionist chrome as the only mobile UI. See [AGENTS.md](AGENTS.md) and [docs/DESIGN_PRINCIPLES.md](docs/DESIGN_PRINCIPLES.md).
4. **Data integrity** — Profile generation, Firestore report persistence, and Ask the Seer flows must not regress. Prefer small, testable patches.
5. **AI control layer** — New Seer / report routes should use `callStructuredAI` / `callTextStream` / shared gates — do not call provider SDKs directly from routes.

## Setup

1. Fork and clone the repo.
2. Use **Node.js 24** (`.nvmrc`) and **pnpm 10.28.2** (`corepack enable`).
3. Environment:
   - Maintainers: `pnpm run env:pull:production` (or `:development`) after `npx vercel login` / `pnpm run vercel:link`
   - Contributors: `cp env-template.txt .env.local` and fill your own Firebase / Groq (and optional) keys
4. `pnpm install` then `DISABLE_WEBPACK_CACHE=1 pnpm dev`

Details: [docs/DEVELOPER_RUNBOOK.md](docs/DEVELOPER_RUNBOOK.md).

## Development workflow

1. Create a branch from `main` (`feat/…`, `fix/…`, `docs/…`).
2. Make focused changes; avoid drive-by refactors.
3. Verify with the path map in [docs/VERIFICATION_PLANS.md](docs/VERIFICATION_PLANS.md). At minimum for most PRs:
   - `pnpm run security` when touching deps or API/lib security-sensitive code
   - Targeted Jest tests when changing `lib/` or API routes
4. Open a PR with:
   - What / why
   - How you tested
   - Screenshots for UI (mobile **and** desktop widths when UI changes)

## Pull request checklist

- [ ] No secrets or real `.env` values
- [ ] Traditional methodology preserved for the tool you touched
- [ ] Design system correct for the breakpoint / platform
- [ ] Tests or manual verification noted
- [ ] Docs updated if behavior or env vars changed

## Scope we especially welcome

- Bug fixes and accessibility improvements
- Traditional-rule corrections with cited sources
- Knowledge base depth under `knowledge/` (expert, no legal disclaimers in KB files)
- Tests for astrology / payment / Seer gate edge cases
- Docs and self-host clarity

## Scope that needs discussion first

- Large refactors or new microservices
- Changing billing / Razorpay flows
- New AI providers without the shared control layer
- Publishing core math as a separate npm package (planned; coordinate first)

## Code of conduct (short)

Be respectful. No harassment, no hate, no doxxing. Security issues go through [SECURITY.md](SECURITY.md), not public issues.

## License

By contributing, you agree your contributions are licensed under the MIT License (see [LICENSE](LICENSE)).

## Support / Sponsors

Optional funding (GitHub Sponsors, Credits) is documented in [SUPPORT.md](SUPPORT.md). Code contributions follow this file; they are not required to sponsor.
