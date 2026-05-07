import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const target = resolve(
  process.cwd(),
  "android/capacitor-cordova-android-plugins/build.gradle",
);

if (!existsSync(target)) {
  process.stdout.write(`[post-cap-sync] Skipped: file not found at ${target}\n`);
  process.exit(0);
}

const original = readFileSync(target, "utf8");

const stripped = original.replace(
  /^\s*flatDir\s*\{\s*[\r\n]+\s*dirs\s+'src\/main\/libs',\s*'libs'\s*[\r\n]+\s*\}\s*[\r\n]*/m,
  "",
);

if (stripped === original) {
  process.stdout.write("[post-cap-sync] No flatDir block found; nothing changed.\n");
  process.exit(0);
}

writeFileSync(target, stripped, "utf8");
process.stdout.write("[post-cap-sync] Removed generated flatDir repository block.\n");
