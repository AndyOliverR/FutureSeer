# AGENTS.md

## Product Overview & Core Flow

FutureSeer is an AI-powered divination platform that unifies 50+ occult and divination systems (Vedic/Western astrology, tarot, numerology, runes, I Ching, palmistry, etc.) into one cohesive experience. The core value proposition: occult and divination information is scattered across many sources — FutureSeer provides both **individual tool-specific insights** and a **unified cross-tool perspective**.

### User Flow (Critical — all agents must understand this)

1. **Sign-in / Sign-up**: User signs in (existing) or creates a new account via Firebase Auth.
2. **Profile completion** (new users): Redirected to the profile page to fill in required details (birth date/time/place, name, etc.). This data is the foundation for all readings.
3. **Mystical profile generation**: Once the profile is complete and the user clicks "Generate my mystical profile", **all divination tools generate their reports simultaneously**. This is a comprehensive, one-time generation that produces detailed reports for every occult field.
4. **Persistent storage**: All generated reports are stored in Firebase Firestore under the user's profile. When the same user signs back in, they see their previously generated information — nothing is lost.
5. **Tool-specific views**: When a user navigates to a specific tool (e.g., `/tools/tarot`), they see the **detailed report for that specific tool** — generated according to that tool's own rules and methodology.
6. **Per-tool Ask the Seer**: Each divination tool has its own AI expert ("Ask the Seer") that answers questions **specific to that tool's domain and the user's report**. The Tarot expert only speaks about Tarot, the Vedic expert only about Vedic astrology, etc.
7. **Main Ask the Seer**: A unified AI expert (`/seer`) that draws from **all tools** to answer questions holistically — like consulting a master who understands every system.
8. **Community page**: Users can interact, converse, share information, and discuss insights with other users.

### Dual Design System (Critical — context-aware)

The app runs TWO distinct design systems based on screen size and platform:

| Signal | Design | Styling |
|---|---|---|
| Desktop/laptop (>= 768px) | **Devotionist Web** | Transparent surfaces, light serif headings (Cinzel), wide letter-spacing, cosmic floating aesthetic |
| Mobile/small screen (< 768px) OR Capacitor native | **Material 3 Mobile** | Solid dark surfaces, medium-weight headings, tighter spacing, bottom nav bar, Material 3 elevation |

**How it works:**
- **Naming:** `.platform-android` and `data-platform="android"` mean **"mobile layout (Material 3)"**, not Android OS. They are set when screen width &lt; 768px or when running in Capacitor native; use them for layout/design system only.
- `PlatformClassProvider` (in `components/PlatformClassProvider.tsx`) applies `.platform-android` or `.platform-web` to `<body>` on every page load, resize, and orientationchange, and syncs `data-platform` on the document element.
- CSS custom properties (`--m3-surface`, etc.) in `globals.css` change values under `.platform-android` — e.g., surfaces become solid (#020617) instead of transparent.
- Tailwind responsive classes (`md:hidden`, `md:grid-cols-3`) handle layout.
- `BottomNavBar` is visible only when body has `.platform-android` and viewport is &lt; 768px (`bottom-nav-mobile` class + `md:hidden`). Use the shared `useIsMobileLayout()` hook (from `hooks/useIsMobileLayout.ts`) for layout branches in components; do not rely on Android user-agent alone.
- `DevotionistStyleCard` is for web; `Material3FAB`, `Material3LoadingSpinner` are for mobile.

**Rules for agents:**
- NEVER use Material 3 component patterns (solid surface cards, FABs, bottom sheets) on desktop/web layouts.
- NEVER use Devotionist components (transparent glass cards, wide-tracking serif text) on mobile layouts.
- When adding UI, ALWAYS check which design system applies at the target breakpoint.
- Use Tailwind responsive prefixes (`md:`, `lg:`) to differentiate — DO NOT hardcode one style for all screens.
- Test UI changes at BOTH mobile width (< 768px) and desktop width (>= 1024px).

### Non-Negotiable Rules

- **Occult accuracy**: Each divination system has its own established rules and methodologies. The app MUST follow the traditional rules of each field. Do not mix methodologies between tools or take shortcuts with interpretations.
- **No breakage**: Customer experience is critical. Every code change must be tested to ensure no regressions in existing flows — especially profile generation, report storage/retrieval, and the Ask the Seer chat.
- **Data integrity**: User-generated reports must persist correctly. A returning user must always see their previously generated data.

**Design principles (product + UX):** See [docs/DESIGN_PRINCIPLES.md](docs/DESIGN_PRINCIPLES.md) for the short principle set (tradition vs. novelty, dual design system, grounded AI, persistence, accessibility). HEART/SEQ and roadmap prioritization live in [docs/HEART_AND_METRICS.md](docs/HEART_AND_METRICS.md) and [docs/ROADMAP_PRIORITIZATION.md](docs/ROADMAP_PRIORITIZATION.md).

### Astrology calculation pipeline

When changing or adding astrology logic:

- **Audit first**: Find existing modules for time parsing (`lib/birthTimeUtils.ts`), local-to-UTC (`lib/birthDateTimeToUTC.ts`), timezone/offset (coordinates-based in that module), ephemeris (`lib/astronomia-vedic.ts`, `lib/vedic/siderealCalculator.ts`, `lib/western/tropicalCalculator.ts`), and zodiac/sign logic. Reuse them; do not recreate.
- **Pipeline**: (1) Normalize birth time to 24h (`normalizeBirthTime` → `HH:mm:ss`). (2) Convert local birth time to UTC using place timezone or coordinates-based offset (`birthLocalToUTC`). (3) Use that UTC `Date` for all chart calculations. (4) Western = tropical; Vedic/KP = sidereal Lahiri.
- **Preservation**: Do not delete working code or do large refactors. Prefer patching and small helpers. If a change could break other tools (Western, KP, Horary, etc.), propose instead of implementing blindly.
- **Validation**: After computing Moon (or any planet) longitude, the assigned sign must match the longitude range (e.g. Libra 180–210°, Scorpio 210–240°). In development, a mismatch is logged as a warning.
- **Depth snapshot:** Implementation map, gaps vs desktop ephemeris suites, and parity-test notes — [docs/ASTROLOGY_ENGINE_AUDIT.md](docs/ASTROLOGY_ENGINE_AUDIT.md).

## Cursor Cloud specific instructions

For a single index linking web, CI, and mobile/store docs, see **[docs/DEVELOPER_RUNBOOK.md](docs/DEVELOPER_RUNBOOK.md)**.

### Architecture

FutureSeer is a single Next.js 16 monolith (App Router + Webpack). All backend logic runs as API routes under `app/api/`. There are no separate microservices or databases to run locally — Firebase (Auth, Firestore) and Groq are cloud-hosted.

### Firebase Studio product sunset (not the Firebase backend)

The **Firebase Studio** cloud IDE (preview) shuts down **March 22, 2027**. **Firestore, Auth, and hosting for this Firebase project are unaffected** — only the Studio workspace product ends. This repo is the source of truth for development. If you ever find **code that exists only** in a Firebase Studio workspace, export it before that date using Google’s [Firebase Studio migration guide](https://firebase.google.com/docs/studio/migrating-project) (e.g. Zip & Download or `npx firebase-tools@latest studio:export` on an extracted copy).

### Node.js & Package Manager

- Requires **Node.js 24** (see `.nvmrc`). Use `nvm use 24` if not active.
- Uses **pnpm 10.28.2** (see `packageManager` in `package.json`). Enable via `corepack enable`.

### Running the Dev Server

```bash
DISABLE_WEBPACK_CACHE=1 pnpm dev
```

The `DISABLE_WEBPACK_CACHE=1` flag avoids `EPERM` errors on rename in sandboxed/CI environments. The app serves on `http://localhost:3000`.

### Environment Variables

A `.env.local` file is needed with at minimum:
- `NEXT_PUBLIC_FIREBASE_*` — Firebase client SDK config (6 vars)
- `FIREBASE_ADMIN_*` — Firebase Admin SDK config (3 vars)
- `GROQ_API_KEY` — primary AI provider
- Optional: `RATE_LIMIT_STORE=firestore` — persist API rate counters in Firestore collection `_apiRateLimits` (requires Firebase Admin); default is in-memory per instance.
- Optional (financial astrology multi-agent): `FINANCIAL_MULTIAGENT_ENABLED` — set to `false` to skip the TradingAgents-style analyst/debate/synthesis pass (default: enabled unless `false`). Also `FINANCIAL_MULTIAGENT_DEBATE_ROUNDS` (default `1`), `FINANCIAL_MULTIAGENT_ANALYST_MODEL` (default `llama-3.1-8b-instant`), `FINANCIAL_MULTIAGENT_SYNTH_MODEL` (default `llama-3.3-70b-versatile`).

The app starts and renders the landing page without real credentials, but auth/AI features require valid keys.

### Linting

`next lint` was removed in Next.js 16. Use ESLint directly:

```bash
npx eslint .
```

An `eslint.config.mjs` (flat config) was added to bridge the existing `.eslintrc.json` config with ESLint 9.

**ESLint phased cleanup:** For `app/tools`, `app/api`, `components`, `hooks`, and `lib`, some rules are set to **warn** (`@typescript-eslint/no-explicit-any`, `react-hooks/set-state-in-effect`, `react-hooks/set-state-in-render`, `react-hooks/refs`, `react-hooks/purity`, `react-hooks/preserve-manual-memoization`, `react/no-unescaped-entities`) so CI stays green while debt is paid down. When a subtree is cleaned up, narrow the `files` globs in `eslint.config.mjs` or add a **later** config object that sets those rules back to `error` for that path (flat config: last matching block wins).

### Security checks (free, in-repo)

Run `pnpm run security` to run dependency audit then **always** lint (including security rules); see [`scripts/run-security.mjs`](scripts/run-security.mjs). See [docs/SECURITY_CHECKS.md](docs/SECURITY_CHECKS.md) for all commands.

### Testing

```bash
pnpm test            # Jest unit/integration tests
pnpm test:integration  # integration tests only (15s timeout)
```

**E2E (real browser):** `pnpm run test:e2e` — requires the app running (`pnpm build && pnpm start` in another terminal, or run `pnpm run test:e2e:ci` to build, start server, run Playwright, then stop). E2E runs in GitHub Actions on every PR. See [docs/E2E_TESTS.md](docs/E2E_TESTS.md) for details.

Some tests reference modules via `@/lib/...` that may fail due to path resolution — these are pre-existing issues, not environment problems.

### Build Scripts (pnpm install)

After `pnpm install`, a warning about "Ignored build scripts" appears. `sharp` (needed by Next.js image optimization) works with prebuilt binaries, so the warning is safe to ignore. The `swisseph` build is explicitly ignored in `package.json`.

### Key Gotchas

- The SSR error `Bail out to client-side rendering: next/dynamic` in dev server logs is expected — the app uses `next/dynamic` heavily and renders client-side.
- The project includes Electron (`pnpm desktop`) and Capacitor (`pnpm mobile:build`) shells — these are optional and not needed for web development.
