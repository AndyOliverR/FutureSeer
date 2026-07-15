# Free in-repo security checks

FutureSeer runs security checks locally with no paid services. All tools are built-in or open-source and run in the repo.

For recurring operations, route-level examples, and incident workflow, see the [Security Baseline Runbook](./SECURITY_BASELINE_RUNBOOK.md).

## Commands

| Command | What it does |
|--------|----------------|
| `pnpm run security` | Runs dependency audit (high/critical), **then always runs lint** (even if audit fails). Exits non-zero if **either** step fails. Implemented by [`scripts/run-security.mjs`](../scripts/run-security.mjs). |
| `pnpm run audit` / `pnpm run security:audit` | Dependency check via [`scripts/audit-deps-bulk.mjs`](../scripts/audit-deps-bulk.mjs) (npm `/security/advisories/bulk`). Needed because npm retired the legacy audit API that pnpm 10 still calls (HTTP 410). |
| `pnpm run audit:fix` | Currently unavailable (legacy `pnpm audit --fix` path is broken); upgrade flagged packages manually from `security:audit` output. |
| `pnpm run lint` | Runs ESLint including security rules (risky patterns like `eval`, unsafe regex, child_process, etc.). |
| `pnpm run security:audit:skill` | Prints quarterly AI audit scope, cadence, and Cloudflare [security-audit-skill](https://github.com/cloudflare/security-audit-skill) setup (no LLM call). See § Security audit harness (lite) below. |

### Dependency overrides (moderate advisories)

`package.json` `pnpm.overrides` pins patched transitive versions (`protobufjs`, `uuid@11`, `ws`, `brace-expansion`, `ip-address`, etc.). After changing overrides, run `pnpm install` and `pnpm audit`. If `uuid@11` regresses Firebase Admin on Vercel, do not jump to `uuid@14` without testing upload/delete flows — see git history for the prior ESM breakage note.

## What’s included

- **Dependency audit**: [`scripts/audit-deps-bulk.mjs`](../scripts/audit-deps-bulk.mjs) posts lockfile packages to npm’s bulk advisory API. No signup or external service.
- **Code security lint**: `eslint-plugin-security` flags risky patterns (eval, non-literal regex, unsafe buffer, etc.). Configured in `eslint.config.mjs`; runs with `pnpm run lint`.

No GitLab, Snyk, or other paid scanning. Optional: you can add a GitHub Actions workflow that runs `pnpm run security` on push.

---

## Security audit harness (lite)

Mechanical checks (`pnpm security`, gitleaks in CI, Seer input gates) catch dependency CVEs and risky patterns. They do **not** replace adversarial review of auth boundaries, IDOR, or AI abuse paths.

FutureSeer follows Cloudflare’s **start-with-a-skill** approach ([build your own vulnerability harness](https://blog.cloudflare.com/build-your-own-vulnerability-harness/)): a periodic **Recon → Hunt → Validate** pass using their open [security-audit-skill](https://github.com/cloudflare/security-audit-skill), scoped to this monolith (no fleet DB or per-PR full scans).

### Cadence

| When | What |
|------|------|
| **Every PR / push** | `pnpm run security` (audit + lint); gitleaks in GitHub Actions |
| **Monthly (~30 min)** | Skim `aiCallEvents` for abuse; confirm prod env checklist in [ENGINEERING_BACKLOG](./ENGINEERING_BACKLOG_SCALE_AND_GROWTH.md) § P0 ops |
| **Quarterly (~half day)** | Run the security-audit skill on scoped paths; **second model or agent** validates (disprove only); triage survivors to P0/P1 in backlog |
| **After major auth/payment/Seer changes** | Ad-hoc Hunt on affected paths before next quarterly window |

Run `pnpm run security:audit:skill` anytime to print scope, phases, and setup pointers (does not invoke an LLM).

### Scoped paths (quarterly Hunt)

Prioritize these over a whole-repo scan:

| Area | Paths |
|------|--------|
| Main + tool Seer | `app/api/seer/`, `app/api/ask-the-seer/`, `app/api/ask-*-seer/` |
| Auth + profile | `lib/userApiAuth.ts`, `lib/firebase.ts`, `lib/enforceToolSeerGate.ts`, `app/api/profile/` |
| AI control layer | `lib/seerInputGuard.ts`, `lib/seerInjectionClassifier.ts`, `lib/aiGateway.ts`, `lib/aiFallbackRouter.ts` |
| Payments | `app/api/payments/`, Razorpay webhook routes |
| Admin / cron | `app/api/admin/`, `app/api/cron/`, `app/api/internal/` |
| Data rules | Firestore security rules (if changed) |

### Attack classes to Hunt

- Auth bypass (`userId` in body without `verifyUserRequest` / `resolveOwnedUserId`)
- IDOR (read or write another user’s profile, reports, or generation jobs)
- Unauthenticated or under-rate-limited expensive AI routes (Groq spend)
- Seer prompt injection (gate coverage on every `ask-*-seer` route — see P0-6 checklist)
- Payment / webhook forgery (Razorpay signature verification)
- Cron / internal routes without `CRON_SECRET` or equivalent

### Rules (from Cloudflare, right-sized)

1. **Threat model required** — who is the attacker, what boundary breaks?
2. **Validator cannot file findings** — only disprove Hunt output.
3. **No auto-merge** — human reviews any proposed patch.
4. **Store output outside git** — e.g. local `security-audit-runs/` or private notes; do not commit `findings.json` with exploit detail.

Backlog: **P1-12** in [ENGINEERING_BACKLOG_SCALE_AND_GROWTH.md](./ENGINEERING_BACKLOG_SCALE_AND_GROWTH.md).

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
