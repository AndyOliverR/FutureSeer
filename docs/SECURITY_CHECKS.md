# Free in-repo security checks

FutureSeer runs security checks locally with no paid services. All tools are built-in or open-source and run in the repo.

## Commands

| Command | What it does |
|--------|----------------|
| `pnpm run security` | Runs dependency audit (high/critical only) then lint. Use before releases or when you want a full pass. |
| `pnpm audit` | Checks dependencies for known vulnerabilities (npm advisory DB). |
| `pnpm run security:audit` | Same as `pnpm audit` but fails only on high/critical (`--audit-level=high`). |
| `pnpm run audit:fix` | Runs `pnpm audit --fix` to apply automatic fixes where possible. |
| `pnpm run lint` | Runs ESLint including security rules (risky patterns like `eval`, unsafe regex, child_process, etc.). |

## What’s included

- **Dependency audit**: `pnpm audit` uses the built-in npm advisory database. No signup or external service.
- **Code security lint**: `eslint-plugin-security` flags risky patterns (eval, non-literal regex, unsafe buffer, etc.). Configured in `eslint.config.mjs`; runs with `pnpm run lint`.

No GitLab, Snyk, or other paid scanning. Optional: you can add a GitHub Actions workflow that runs `pnpm run security` on push.
