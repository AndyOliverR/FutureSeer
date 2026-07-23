# Security Policy

## Supported versions

Security fixes are applied on the `main` branch and production deployments of [futureseer.app](https://futureseer.app).

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

1. Prefer [GitHub Security Advisories](https://github.com/AndyOliverR/FutureSeer/security/advisories/new) (private report).
2. Or contact the maintainers via [futureseer.app/contact](https://futureseer.app/contact) and mark the message as a security report.

Include:

- Affected path or feature (e.g. Seer API, payments webhook, admin route)
- Steps to reproduce
- Impact (data exposure, auth bypass, spend abuse, etc.)
- Whether you have a suggested fix

We aim to acknowledge reports within **7 days** and share a remediation plan when confirmed.

## What is in scope

- Authentication / authorization bypass (including IDOR on profiles or reports)
- Payment or webhook forgery (Razorpay)
- Secrets or credential leakage in the repository or deployments
- Unauthenticated expensive AI routes (Groq / gateway spend abuse)
- Seer prompt-injection bypasses of input gates
- Firestore / Storage rule gaps that expose other users’ data

## What is out of scope

- Theoretical issues without a plausible exploit path
- Reports that require physical access or already-compromised admin accounts
- Denial of service against third-party APIs you do not control
- Social-engineering of individual users

## Maintainer security practices

- Secrets live in Vercel / `.env.local` — never commit `.env*` (see `env-template.txt`)
- CI runs `pnpm run security` and gitleaks on every push
- Operational checks: [docs/SECURITY_CHECKS.md](docs/SECURITY_CHECKS.md), [docs/SECURITY_BASELINE_RUNBOOK.md](docs/SECURITY_BASELINE_RUNBOOK.md)
- Rotate credentials with [docs/SECRET_ROTATION_CHECKLIST.md](docs/SECRET_ROTATION_CHECKLIST.md) when applicable

## Responsible disclosure

Please give us a reasonable window to patch before public disclosure. Credit is welcome in release notes if you want to be named.
