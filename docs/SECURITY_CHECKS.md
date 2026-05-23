# Free in-repo security checks

FutureSeer runs security checks locally with no paid services. All tools are built-in or open-source and run in the repo.

For recurring operations, route-level examples, and incident workflow, see the [Security Baseline Runbook](./SECURITY_BASELINE_RUNBOOK.md).

## Commands

| Command | What it does |
|--------|----------------|
| `pnpm run security` | Runs dependency audit (high/critical), **then always runs lint** (even if audit fails). Exits non-zero if **either** step fails. Implemented by [`scripts/run-security.mjs`](../scripts/run-security.mjs). |
| `pnpm audit` | Checks dependencies for known vulnerabilities (npm advisory DB). |
| `pnpm run security:audit` | Same as `pnpm audit` but fails only on high/critical (`--audit-level=high`). |
| `pnpm run audit:fix` | Runs `pnpm audit --fix` to apply automatic fixes where possible. |
| `pnpm run lint` | Runs ESLint including security rules (risky patterns like `eval`, unsafe regex, child_process, etc.). |

### Dependency overrides (moderate advisories)

`package.json` `pnpm.overrides` pins patched transitive versions (`protobufjs`, `uuid@11`, `ws`, `brace-expansion`, `ip-address`, etc.). After changing overrides, run `pnpm install` and `pnpm audit`. If `uuid@11` regresses Firebase Admin on Vercel, do not jump to `uuid@14` without testing upload/delete flows — see git history for the prior ESM breakage note.

## What’s included

- **Dependency audit**: `pnpm audit` uses the built-in npm advisory database. No signup or external service.
- **Code security lint**: `eslint-plugin-security` flags risky patterns (eval, non-literal regex, unsafe buffer, etc.). Configured in `eslint.config.mjs`; runs with `pnpm run lint`.

No GitLab, Snyk, or other paid scanning. Optional: you can add a GitHub Actions workflow that runs `pnpm run security` on push.

---

## Google Cloud / Firebase credential best practices

Google recommends securing API keys and service accounts. Here’s how FutureSeer aligns and what to do in the console.

### Already in place

- **No keys in source control**: All secrets live in environment variables (`.env.local` is gitignored; Vercel uses Environment Variables). Firebase client config, Firebase Admin (`FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`), `GROQ_API_KEY`, `GOOGLE_PLACES_API_KEY`, `TIMEZONE_API_KEY`, reCAPTCHA (if re-enabled), etc. are read from `process.env` only.

### What to do in Google Cloud / Firebase Console

1. **API key restrictions**  
   In [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials, for each API key used by FutureSeer (e.g. Firebase, Places, reCAPTCHA):
   - Restrict to the APIs you use (e.g. Places API, reCAPTCHA Enterprise).
   - Add application restrictions: HTTP referrers for `https://futureseer.app/*` and `https://*.vercel.app/*` (or your dev URL) so the key cannot be used from other sites.

2. **Audit and disable unused keys**  
   In the same Credentials page, review keys and service accounts. Disable or delete any that have had no use in the last 30 days.

3. **Service account least privilege**  
   In IAM & Admin → IAM, find the service account used for Firebase Admin (or other GCP services). Use the IAM recommender to trim unused roles so it only has the minimum permissions it needs (e.g. Firestore, Storage, Auth).

4. **Service account key rotation (optional)**  
   If you use a user-managed key for Firebase Admin (private key in env), rotate it periodically: create a new key in Firebase Project settings → Service accounts, update `FIREBASE_ADMIN_PRIVATE_KEY` in Vercel and `.env.local`, then disable the old key.

5. **Essential Contacts and billing alerts**  
   In GCP Console → Billing → Budgets & alerts, set a budget and alerts. In IAM & Admin → Essential Contacts, ensure the right email is set so security and billing notifications reach you.
