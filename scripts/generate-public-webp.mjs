/**
 * Optional offline step: create .webp siblings for PNG/JPEG under public/crystals and public/gemstones.
 * Does not remove originals. Safe to re-run.
 *
 * Usage: node scripts/generate-public-webp.mjs
 */
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(process.cwd(), "public");
const DIRS = ["crystals/photos", "gemstones/photos"];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (/\.(png|jpe?g)$/i.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

async function convertOne(file) {
  const webp = file.replace(/\.(png|jpe?g)$/i, ".webp");
  const webpStat = await stat(webp).catch(() => null);
  const srcStat = await stat(file);
  if (webpStat && webpStat.mtimeMs >= srcStat.mtimeMs) {
    return { file, skipped: true };
  }
  await sharp(file).webp({ quality: 82 }).toFile(webp);
  return { file, skipped: false };
}

async function main() {
  let converted = 0;
  let skipped = 0;
  for (const sub of DIRS) {
    const dir = path.join(ROOT, sub);
    const files = await walk(dir).catch(() => []);
    for (const file of files) {
      const result = await convertOne(file);
      if (result.skipped) skipped += 1;
      else converted += 1;
    }
  }
  console.log(`WebP: ${converted} created/updated, ${skipped} skipped (up to date).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
