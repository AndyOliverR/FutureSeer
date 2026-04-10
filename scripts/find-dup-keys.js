/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const content = fs.readFileSync('lib/nameMeanings.ts', 'utf8');
const lines = content.split('\n');
const keyRe = /^\s*"([^"]+)":\s*\{/;
const seen = new Map();
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(keyRe);
  if (m) {
    const key = m[1];
    if (seen.has(key)) seen.get(key).push(i + 1);
    else seen.set(key, [i + 1]);
  }
}
const dups = [...seen.entries()].filter(([, v]) => v.length > 1);
console.log(dups.map(([k, v]) => k + ': lines ' + v.join(', ')).join('\n'));
