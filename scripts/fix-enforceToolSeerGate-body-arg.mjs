import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const needle =
  ", body && typeof body === 'object' && body !== null ? body as Record<string, unknown> : {}, ";

function walkApiRoutes(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkApiRoutes(p, out);
    else if (e.name === 'route.ts') out.push(p);
  }
  return out;
}

let updated = 0;
for (const f of walkApiRoutes(path.join(root, 'app', 'api'))) {
  const s = fs.readFileSync(f, 'utf8');
  if (!s.includes('body as Record<string, unknown>')) continue;
  const t = s.split(needle).join(', body, ');
  if (t !== s) {
    fs.writeFileSync(f, t);
    updated++;
    console.log(path.relative(root, f));
  }
}
console.log('updated', updated, 'files');
