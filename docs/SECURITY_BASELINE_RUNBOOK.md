# FutureSeer Security Baseline Runbook

This runbook defines the minimum recurring security checks and incident-response workflow for FutureSeer.

## Scope

- Next.js API routes under `app/api/`
- Firebase Auth/Admin access patterns
- AI-costly routes (`seer`, `ask-*seer`)
- CI security gates

## Weekly Security Cadence (15-30 min)

Run from repo root:

```bash
pnpm run security
pnpm audit --prod --audit-level=high
```

Review and confirm:

- No new high/critical dependency findings.
- No secret scanning failures in CI.
- No auth/ownership regressions in recently changed API routes.
- No unusual AI usage spikes (cost or abuse signals).

## Pre-Merge Security Checklist

For every PR touching API/auth/data:

- Auth is enforced on user-scoped routes.
- Ownership check is enforced (`requestedUserId === auth.uid`) unless explicitly admin.
- Rate limiting is applied to public write and AI-heavy endpoints.
- Input validation exists (type/shape/length).
- No substring-based host checks for URL fetches.
- No sensitive logging (tokens, keys, raw credentials, excessive PII).
- Security-sensitive tests are updated or added.

## FutureSeer Route Baseline (Examples)

### Auth + Ownership Required

These routes must require bearer auth and enforce `userId` ownership:

- `app/api/seer/chat/route.ts`
- `app/api/ask-the-seer/route.ts`
- `app/api/profiles/route.ts`
- `app/api/profiles/[profileId]/route.ts`
- `app/api/personalization/profile/route.ts`
- `app/api/personalization/context/route.ts`
- `app/api/personalization/remedies/route.ts`
- `app/api/community/votes/route.ts`
- `app/api/community/discussions/route.ts` (non-guest path)

Shared helpers:

- `lib/userApiAuth.ts`
- `lib/security/ownership.ts`

### Diagnostic Route Lockdown

Must remain admin-only:

- `app/api/diagnose/route.ts`

Admin verification helper:

- `lib/adminApiAuth.ts`

### SSRF Protection

Image proxy validation must remain strict:

- `app/api/proxy-image/route.ts`
- `lib/security/proxyImageValidation.ts`

Baseline controls:

- Only `https`.
- Exact hostname allowlist.
- Redirect blocking (`redirect: 'error'`).
- Reject non-image upstream content types.

## Secrets and Credential Handling

Never commit service account JSON keys.

Required Firebase Admin env vars:

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

Validation command:

```bash
node scripts/check-firebase-admin-env.mjs
```

Admin script bootstrap (env-only):

- `scripts/firebase-admin-env.js`

Scripts currently using env-based admin init:

- `firebaseadminscripts/setAdminClaim.js`
- `scripts/set-ask-seer-beta.js`
- `scripts/fix-birthtime.js`
- `scripts/cancel-no-charge-subscriptions.js`
- `scripts/setup-user-modes.js`

## CI Security Gates

Workflow:

- `.github/workflows/ci.yml`

Required gates:

- `pnpm run security`
- Gitleaks secret scan
- Lint/test/e2e smoke

Merges should be blocked when any security gate fails.

## Monthly Hardening Tasks

- Re-verify least privilege on admin/custom claims and admin routes.
- Re-check diagnostic/debug routes are not publicly exposed.
- Re-run targeted auth/IDOR/SSRF tests on high-risk routes.
- Review API logs for abuse patterns (429 spikes, repeated unauthorized probes).
- Validate key rotation policy and env hygiene.

## Incident Response Mini-Playbook

1. Contain
   - Disable affected route or feature flag.
   - Apply temporary rate limits/IP blocks.
2. Assess
   - Identify impacted endpoints, data scope, and user exposure.
3. Eradicate
   - Patch root cause (auth, ownership, validation, SSRF, secrets).
4. Recover
   - Redeploy and run security verification commands.
5. Learn
   - Document timeline, root cause, and prevention action.

## Fast Verification Commands

```bash
pnpm run security
npx eslint app/api
pnpm test -- tests/integration/ask-the-seer.test.ts tests/unit/userApiAuth.test.ts tests/unit/proxyImageValidation.test.ts
```

## Non-Negotiable Rules

- Never trust `userId` from request body/query without ownership verification.
- Never expose diagnostics in production without strict admin auth.
- Never fetch user-provided URLs without strict URL and host validation.
- Never commit credential files (especially service account JSON).
