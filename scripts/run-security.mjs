/**
 * Runs dependency audit and targeted security lint checks.
 * Exits with code 1 if either step fails.
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

const auditExit = runShell('pnpm audit --audit-level=high');
const lintExit = runShell('pnpm run lint:security');
process.exit(auditExit !== 0 || lintExit !== 0 ? 1 : 0);
