/**
 * Runs `pnpm audit --audit-level=high`, then always runs `pnpm run lint`.
 * Exits with code 1 if either step fails (so audit failures are not masked by lint success).
 */
import { spawnSync } from 'node:child_process';

function runShell(command) {
  const result = spawnSync(command, { stdio: 'inherit', shell: true });
  if (result.signal) {
    return 1;
  }
  return result.status ?? 0;
}

const auditExit = runShell('pnpm audit --audit-level=high');
const lintExit = runShell('pnpm run lint');
process.exit(auditExit !== 0 || lintExit !== 0 ? 1 : 0);
