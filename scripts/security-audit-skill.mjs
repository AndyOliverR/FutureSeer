/**
 * Pointer for quarterly AI security audit (P1-12).
 * Does not invoke an LLM — prints scope, cadence, and Cloudflare skill setup.
 *
 * Run: pnpm run security:audit:skill
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const SKILL_REPO = 'https://github.com/cloudflare/security-audit-skill';
const HARNESS_BLOG =
  'https://blog.cloudflare.com/build-your-own-vulnerability-harness/';
const DOCS = 'docs/SECURITY_CHECKS.md#security-audit-harness-lite';
const BACKLOG = 'docs/ENGINEERING_BACKLOG_SCALE_AND_GROWTH.md';

const SCOPED_PATHS = [
  'app/api/seer/',
  'app/api/ask-the-seer/',
  'app/api/ask-*-seer/',
  'lib/userApiAuth.ts',
  'lib/firebase.ts',
  'lib/enforceToolSeerGate.ts',
  'app/api/profile/',
  'lib/seerInputGuard.ts',
  'lib/seerInjectionClassifier.ts',
  'lib/aiGateway.ts',
  'app/api/payments/',
  'app/api/admin/',
  'app/api/cron/',
  'app/api/internal/',
];

const ATTACK_CLASSES = [
  'Auth bypass (missing verifyUserRequest / resolveOwnedUserId)',
  'IDOR on profiles, reports, generation jobs',
  'Unauthenticated or under-protected AI routes (Groq spend)',
  'Seer prompt injection (gate parity on every ask-*-seer)',
  'Payment / webhook forgery (Razorpay)',
  'Cron / internal routes without CRON_SECRET',
];

const localSkill = resolve(process.cwd(), '.cursor/skills/security-audit/SKILL.md');
const hasLocalSkill = existsSync(localSkill);

console.log(`
=== FutureSeer security audit harness (lite) — P1-12 ===

This command does NOT run an AI audit. Use it as a checklist before a
quarterly Cursor session with Cloudflare's security-audit skill.

References:
  Skill repo:  ${SKILL_REPO}
  Harness blog: ${HARNESS_BLOG}
  Docs:        ${DOCS}
  Backlog:     ${BACKLOG} (P1-12)

Cadence:
  Every PR     → pnpm run security (+ gitleaks in CI)
  Monthly      → skim aiCallEvents; verify prod env checklist
  Quarterly    → Recon → Hunt → Validate (second model disproves only)
  After auth/payment/Seer changes → ad-hoc Hunt on affected paths

Phases (Cloudflare skill):
  1. Recon   — parallel agents → architecture.md for scoped API/auth map
  2. Hunt    — one run per attack class below; state threat model per finding
  3. Validate — adversarial pass; validator may NOT add new findings
  4. Triage  — survivors → P0/P1 in engineering backlog; no auto-merge

Scoped paths (Hunt these first, not whole repo):
${SCOPED_PATHS.map((p) => `  • ${p}`).join('\n')}

Attack classes:
${ATTACK_CLASSES.map((c) => `  • ${c}`).join('\n')}

Setup (one-time):
  1. Clone or copy skill from ${SKILL_REPO}
     into .cursor/skills/security-audit/ (SKILL.md + prompts)
  2. In Cursor, run the security-audit skill on the paths above
  3. Save findings locally (e.g. security-audit-runs/) — do not commit PoCs
  4. Re-validate survivors with a different model or security-review agent

Local skill: ${hasLocalSkill ? `found at ${localSkill}` : 'not installed — clone from skill repo above'}

Mechanical pre-check (run before quarterly audit):
  pnpm run security
`);

process.exit(0);
