import { spawn } from "node:child_process";

/**
 * npm 11 warns when unknown npm_config_* env keys are present.
 * Strip only known noisy keys for the Capacitor sync child process.
 */
const cleanEnv = { ...process.env };
delete cleanEnv.npm_config_npm_globalconfig;
delete cleanEnv.npm_config_verify_deps_before_run;
delete cleanEnv.npm_config__jsr_registry;

const child =
  process.platform === "win32"
    ? spawn("cmd.exe", ["/d", "/s", "/c", "npx cap sync"], {
        stdio: "inherit",
        env: cleanEnv,
      })
    : spawn("npx", ["cap", "sync"], {
        stdio: "inherit",
        env: cleanEnv,
      });

child.on("exit", (code, signal) => {
  if (typeof code === "number") {
    process.exit(code);
  }

  // Preserve failure semantics if process ended by signal.
  if (signal) {
    process.stderr.write(`cap sync terminated by signal: ${signal}\n`);
  }
  process.exit(1);
});
