/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * One-off: Replace raw console.log/warn/error/debug with devLog in app, components, lib.
 * Skips lib/consoleLogger.ts and lib/devLogger.ts.
 */
const fs = require('fs');
const path = require('path');

const devLogImport = "import { devLog } from '@/lib/devLogger';";

function walk(dir, out) {
  try {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules') walk(full, out);
      else if (e.isFile() && (e.name.endsWith('.ts') || e.name.endsWith('.tsx'))) {
        const content = fs.readFileSync(full, 'utf8');
        const isLoggerFile = full.endsWith('consoleLogger.ts') || full.endsWith('devLogger.ts');
        if (/console\.(log|warn|error|debug)\(/.test(content) && !isLoggerFile) {
          out.push(full);
        }
      }
    }
  } catch (_) {}
}

const files = [];
walk(path.join(__dirname, '..', 'app'), files);
walk(path.join(__dirname, '..', 'components'), files);
walk(path.join(__dirname, '..', 'lib'), files);

let changed = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const hasDevLog = content.includes("from '@/lib/devLogger'") || content.includes('from "@/lib/devLogger"');
  const needImport = !hasDevLog;

  // Replace console.error( with devLog.error(
  content = content.replace(/console\.error\s*\(\s*([^,)]+)\s*,\s*([^)]+)\)/g, (_, msg, arg) => {
    changed++;
    return `devLog.error(${msg}, ${arg}, '${path.basename(file, path.extname(file))}')`;
  });
  content = content.replace(/console\.error\s*\(\s*([^)]+)\)/g, (_, arg) => {
    changed++;
    return `devLog.error(${arg}, undefined, '${path.basename(file, path.extname(file))}')`;
  });
  content = content.replace(/console\.warn\s*\(\s*([^,)]+)\s*,\s*([^)]+)\)/g, (_, msg, arg) => {
    changed++;
    return `devLog.warn(${msg}, ${arg}, '${path.basename(file, path.extname(file))}')`;
  });
  content = content.replace(/console\.warn\s*\(\s*([^)]+)\)/g, (_, arg) => {
    changed++;
    return `devLog.warn(${arg}, undefined, '${path.basename(file, path.extname(file))}')`;
  });
  content = content.replace(/console\.log\s*\(/g, () => { changed++; return 'devLog.debug('; });
  content = content.replace(/console\.debug\s*\(/g, () => { changed++; return 'devLog.debug('; });

  if (content.includes('console.')) {
    content = content.replace(/console\.error\(/g, 'devLog.error(');
    content = content.replace(/console\.warn\(/g, 'devLog.warn(');
    content = content.replace(/console\.(log|debug)\(/g, 'devLog.debug(');
  }

  const needsImport = !hasDevLog && /devLog\.(error|warn|debug|info)\(/.test(content);
  if (needsImport) {
    const firstImportEnd = content.indexOf('\n', content.indexOf('import '));
    const insertAt = firstImportEnd >= 0 ? firstImportEnd + 1 : 0;
    content = content.slice(0, insertAt) + devLogImport + '\n' + content.slice(insertAt);
  }

  fs.writeFileSync(file, content, 'utf8');
}
console.log('Processed', files.length, 'files');
