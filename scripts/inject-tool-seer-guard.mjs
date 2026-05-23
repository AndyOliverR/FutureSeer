/**
 * One-off: inject enforceToolSeerGate after `const body = await request.json(...)` in tool seer routes.
 * Run: node scripts/inject-tool-seer-guard.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const targets = [];
const api = path.join(root, 'app', 'api');
for (const name of fs.readdirSync(api)) {
  if (name.startsWith('ask-')) {
    const f = path.join(api, name, 'route.ts');
    if (fs.existsSync(f)) targets.push(f);
  }
}
for (const sub of ['palmistry', 'hellenistic']) {
  const f = path.join(api, sub, 'ask-seer', 'route.ts');
  if (fs.existsSync(f)) targets.push(f);
}

function routeKeyFromFile(file) {
  const rel = path.relative(path.join(root, 'app', 'api'), file);
  const dir = path.dirname(rel);
  return dir.replace(/\\/g, '_').replace(/-/g, '_');
}

/** Match `const body = await request.json()...` then newline (optional `as Type`). */
const needle =
  /(\r?\n)( {4}const body\s*(?:: [^\n]+)?\s*=\s*await request\.json\(\)(?:\.catch\(\(\) => \(\{\}\)\))?(?: as [^\n]+)?;?)\r?\n/;

let updated = 0;
for (const file of targets) {
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes('enforceToolSeerGate')) continue;
  if (!s.includes('createAIStream')) continue;
  if (!needle.test(s)) continue;

  const key = routeKeyFromFile(file);
  const importLine = `import { enforceToolSeerGate } from '@/lib/enforceToolSeerGate'\n`;
  if (!s.includes('enforceToolSeerGate')) {
    const m = s.match(/^import .+ from ['"]next\/server['"]/m);
    if (m) {
      const idx = s.indexOf(m[0]) + m[0].length;
      s = s.slice(0, idx) + '\n' + importLine + s.slice(idx);
    } else {
      s = importLine + s;
    }
  }

  const gateBlock = `\n    const __toolSeerGate = await enforceToolSeerGate(request, body && typeof body === 'object' && body !== null ? body as Record<string, unknown> : {}, '${key}')\n    if (__toolSeerGate) return __toolSeerGate\n`;

  s = s.replace(needle, `$1$2${gateBlock}\n`);
  fs.writeFileSync(file, s);
  updated++;
  console.log('patched', path.relative(root, file), key);
}

console.log('done, patched', updated, 'files');
