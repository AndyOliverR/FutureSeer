/**
 * Regenerate PWA / favicon PNGs from the Capacitor iOS app icon asset.
 * Run: node scripts/generate-pwa-icons.mjs
 */
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const src = path.join(
  root,
  'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png',
);
const iconsDir = path.join(root, 'public/icons');

const sizes = [180, 192, 512];

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

await sharp(src).resize(32, 32).png().toFile(path.join(root, 'app/icon.png'));
await sharp(src).resize(180, 180).png().toFile(path.join(root, 'app/apple-icon.png'));

console.log('PWA icons written to public/icons and app/icon.png');
