import fs from 'node:fs';
import path from 'node:path';

import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'app', 'api');

function walk(dir) {
  for (const n of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, n.name);
    if (n.isDirectory()) walk(p);
    else if (n.name === 'route.ts') {
      let s = fs.readFileSync(p, 'utf8');
      const bad = /import \{ enforceToolSeerGate \} from '@\/lib\/enforceToolSeerGate'\r?\n;\r?\n/g;
      if (!bad.test(s)) continue;
      s = s.replace(
        bad,
        "import { enforceToolSeerGate } from '@/lib/enforceToolSeerGate'\n",
      );
      fs.writeFileSync(p, s);
      console.log('fixed', path.relative(root, p));
    }
  }
}

walk(root);
