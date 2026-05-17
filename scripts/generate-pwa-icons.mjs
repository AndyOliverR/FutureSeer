/**
 * Regenerate PWA / favicon PNGs from the canonical FS logo.
 * Source: assets/fs-app-icon-source.png (orange FS on peach circle).
 * Run: node scripts/generate-pwa-icons.mjs
 */
import fs from 'node:fs';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const canonicalSrc = path.join(root, 'assets/fs-app-icon-source.png');
const legacyIosSrc = path.join(
  root,
  'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png',
);
const iconsDir = path.join(root, 'public/icons');

const hasCanonical = fs.existsSync(canonicalSrc);
const hasLegacyIos = fs.existsSync(legacyIosSrc);
const src = hasCanonical ? canonicalSrc : hasLegacyIos ? legacyIosSrc : null;

if (!src) {
  console.error('Icon source not found. Expected one of:', canonicalSrc, legacyIosSrc);
  process.exit(1);
}

const sizes = [16, 32, 180, 192, 512];

for (const size of sizes) {
  await sharp(src)
    .resize(size, size, { fit: 'cover' })
    .png()
    .toFile(path.join(iconsDir, `icon-${size}.png`));
}

await sharp(src)
  .resize(384, 384, { fit: 'contain', background: { r: 10, g: 15, b: 31, alpha: 1 } })
  .extend({
    top: 64,
    bottom: 64,
    left: 64,
    right: 64,
    background: { r: 10, g: 15, b: 31, alpha: 1 },
  })
  .resize(512, 512)
  .png()
  .toFile(path.join(iconsDir, 'icon-maskable-512.png'));

await sharp(src).resize(32, 32, { fit: 'cover' }).png().toFile(path.join(root, 'app/icon.png'));
await sharp(src).resize(180, 180, { fit: 'cover' }).png().toFile(path.join(root, 'app/apple-icon.png'));
await sharp(src).resize(32, 32, { fit: 'cover' }).png().toFile(path.join(root, 'public/favicon.png'));

console.log(`PWA icons written from ${path.relative(root, src)}`);
