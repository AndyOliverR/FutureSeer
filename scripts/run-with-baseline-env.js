#!/usr/bin/env node
/**
 * Sets BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA=true and runs the given command.
 * Used to suppress baseline-browser-mapping "data over two months old" warning.
 * Example: node scripts/run-with-baseline-env.js next build --webpack
 * Note: package.json lint/build use cross-env; this script is for ad-hoc use.
 */
process.env.BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA = 'true';
process.env.BROWSERSLIST_IGNORE_OLD_DATA = 'true';
const { spawnSync } = require('child_process');
const path = require('path');
const args = process.argv.slice(2);
if (args.length === 0) {
  process.stderr.write('Usage: node run-with-baseline-env.js <command> [args...]\n');
  process.exit(1);
}
const [command, ...cmdArgs] = args;
const result = spawnSync(command, cmdArgs, {
  stdio: 'inherit',
  shell: true,
  env: process.env,
  cwd: path.join(__dirname, '..'),
});
process.exit(result.status ?? 1);
