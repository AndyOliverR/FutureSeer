/**
 * Runs dependency audit and targeted security lint checks.
 * Exits with code 1 if either step fails.
 *
 * Audit uses scripts/audit-deps-bulk.mjs (npm bulk advisory API) because
 * npm retired the legacy audit endpoints that pnpm 10 still calls (HTTP 410).
 */
import { spawnSync } from 'node:child_process';

function buildSanitizedEnv() {
  const env = { ...process.env };
  delete env.npm_config_npm_globalconfig;
  delete env.npm_config_verify_deps_before_run;
  delete env.npm_config__jsr_registry;
  return env;
}

function runShell(command) {
  const result = spawnSync(command, {
    stdio: 'inherit',
    shell: true,
    env: buildSanitizedEnv(),
  });
  if (result.signal) {
    return 1;
  }
  return result.status ?? 0;
}

console.log('\n=== Dependency audit (high/critical) ===\n');
const auditExit = runShell('node scripts/audit-deps-bulk.mjs high');
if (auditExit !== 0) {
  console.error('\n[security] FAILED: dependency audit reported high/critical issues.');
  console.error('Try: pnpm run security:audit   then: pnpm run audit:fix\n');
} else {
  console.log('\n[security] Dependency audit passed.\n');
}

console.log('=== Security lint (app/api, scripts, lib) ===\n');
const lintExit = runShell('pnpm run lint:security');
if (lintExit !== 0) {
  console.error('\n[security] FAILED: lint:security reported ESLint errors.');
  console.error('Run: pnpm run lint:security\n');
} else {
  console.log('\n[security] Security lint passed.\n');
}

const failed = auditExit !== 0 || lintExit !== 0;
if (failed) {
  console.error('[security] One or more checks failed.');
}
process.exit(failed ? 1 : 0);
