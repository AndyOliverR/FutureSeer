# AGENTS.md

## Cursor Cloud specific instructions

### Overview

FutureSeer is a single Next.js 16 monolith (App Router + Webpack). All backend logic runs as API routes under `app/api/`. There are no separate microservices or databases to run locally — Firebase (Auth, Firestore) and Groq are cloud-hosted.

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

The app starts and renders the landing page without real credentials, but auth/AI features require valid keys.

### Linting

`next lint` was removed in Next.js 16. Use ESLint directly:

```bash
npx eslint .
```

An `eslint.config.mjs` (flat config) was added to bridge the existing `.eslintrc.json` config with ESLint 9.

### Testing

```bash
pnpm test            # Jest unit/integration tests
pnpm test:integration  # integration tests only (15s timeout)
```

Some tests reference modules via `@/lib/...` that may fail due to path resolution — these are pre-existing issues, not environment problems.

### Build Scripts (pnpm install)

After `pnpm install`, a warning about "Ignored build scripts" appears. `sharp` (needed by Next.js image optimization) works with prebuilt binaries, so the warning is safe to ignore. The `swisseph` build is explicitly ignored in `package.json`.

### Key Gotchas

- The SSR error `Bail out to client-side rendering: next/dynamic` in dev server logs is expected — the app uses `next/dynamic` heavily and renders client-side.
- The project includes Electron (`pnpm desktop`) and Capacitor (`pnpm mobile:build`) shells — these are optional and not needed for web development.
