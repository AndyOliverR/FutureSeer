#!/usr/bin/env node
/**
 * Remove .next before a production build (fixes corrupt webpack cache on Windows).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const nextDir = path.join(root, '.next');

if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log('Removed .next');
} else {
  console.log('No .next directory to remove');
}
