# FutureSeer

**Open-source AI divination platform** — traditional occult systems (Vedic & Western astrology, Tarot, numerology, runes, I Ching, and more) implemented as type-safe engines, with a unified “Ask the Seer” layer that respects each tradition’s rules.

Live product: [futureseer.app](https://futureseer.app)

> Mysticism should be inspectable. We open-source the code so enthusiasts and engineers can audit methodology, improve accuracy, and self-host — not so anyone can paste secrets into git.

## Why open source

Commercial AI “horoscope apps” often hide how readings are produced. FutureSeer aims to **democratize serious divination tooling**:

- Algorithms and chart pipelines you can read and challenge
- Per-tool Seer experts that stay inside that system’s domain
- A master Seer that synthesizes across tools without mushing traditions together
- Community contributions toward better traditional fidelity — and optional support so the lights stay on

Support the project via the GitHub **Sponsor** button, [Credits](https://futureseer.app/credits), or [Contact](https://futureseer.app/contact). See [CONTRIBUTING.md](CONTRIBUTING.md).

## Features

### Product
- **50+ divination tools** with tool-specific reports and Ask the Seer chat
- **Mystical profile generation** — comprehensive multi-tool reports stored for returning users
- **Daily insights** and cross-tool “Ask the Seer”
- **Community** discussion surfaces
- **Credits / payments** via Razorpay (production); contributors can run without live billing keys

### Technical
- **Next.js 16** (App Router) + TypeScript monolith
- **Firebase** Auth + Firestore for profiles and persisted reports
- **AI**: Groq (primary), optional OpenAI / Vercel AI Gateway — via a shared control layer (gates, budget, fallback)
- **Astrology pipeline**: local→UTC birth time, tropical (Western) / sidereal Lahiri (Vedic/KP)
- **Dual design system**: Devotionist web (≥768px) and Material 3 mobile / Capacitor
- **Capacitor** hybrid mobile + optional Electron desktop

Architecture and agent rules: [AGENTS.md](AGENTS.md) · Runbook: [docs/DEVELOPER_RUNBOOK.md](docs/DEVELOPER_RUNBOOK.md)

## Quick start

### Prerequisites

- **Node.js 24.x** (see `.nvmrc`)
- **pnpm 10.28.2** — `corepack enable`
- Your own Firebase project (or maintainer access)
- Groq API key (and other keys as needed — see `env-template.txt`)

### Installation

1. Clone and install:

   ```bash
   git clone https://github.com/AndyOliverR/FutureSeer.git
   cd FutureSeer
   pnpm install
   ```

2. Environment (never commit `.env.local`):

   **Maintainers (Vercel):**

   ```bash
   npx vercel login
   pnpm run vercel:link   # once per clone if .vercel is missing
   pnpm run env:pull:production
   ```

   **Contributors:**

   ```bash
   cp env-template.txt .env.local
   # fill Firebase + Groq (and optional) keys
   ```

   After a production pull, set local auth URLs as described in [docs/DEVELOPER_RUNBOOK.md](docs/DEVELOPER_RUNBOOK.md) (§ Local env from Vercel).

3. Run:

   ```bash
   DISABLE_WEBPACK_CACHE=1 pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Security

- Report vulnerabilities privately — see [SECURITY.md](SECURITY.md)
- Local checks: `pnpm run security` · CI also runs gitleaks
- Baseline ops: [docs/SECURITY_BASELINE_RUNBOOK.md](docs/SECURITY_BASELINE_RUNBOOK.md)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR. High-level:

1. Fork → feature branch → focused PR
2. Preserve traditional methodology for the tool you touch
3. Match the correct design system for mobile vs desktop
4. Run path-targeted verification from [docs/VERIFICATION_PLANS.md](docs/VERIFICATION_PLANS.md)

## License

MIT — see [LICENSE](LICENSE). Divination content is for education and entertainment; not medical, legal, or financial advice.

## Support

- **Docs**: this README, [AGENTS.md](AGENTS.md), [docs/DEVELOPER_RUNBOOK.md](docs/DEVELOPER_RUNBOOK.md)
- **Issues**: GitHub Issues
- **Product support**: [futureseer.app/contact](https://futureseer.app/contact)

---

**FutureSeer** — ancient systems, modern engineering, open to audit.
