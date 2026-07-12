/**
 * Verifies RATE_LIMIT_STORE and AI_CIRCUIT_STORE in .env.local (no secrets printed).
 * Run: pnpm run check:distributed-controls
 */
import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const envPath = resolve(process.cwd(), '.env.local');
if (!existsSync(envPath)) {
  console.error('Missing .env.local — copy env-template.txt and set distributed control vars.');
  process.exit(1);
}

config({ path: envPath });

const rate = (process.env.RATE_LIMIT_STORE || '').trim();
const circuit = (process.env.AI_CIRCUIT_STORE || '').trim();
const adminOk =
  !!(process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim() &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY?.includes('BEGIN PRIVATE KEY'));

const issues = [];
if (rate !== 'firestore') {
  issues.push('RATE_LIMIT_STORE should be "firestore" (currently: ' + (rate || 'unset') + ')');
}
if (circuit !== 'firestore') {
  issues.push('AI_CIRCUIT_STORE should be "firestore" (currently: ' + (circuit || 'unset') + ')');
}
if (!adminOk) {
  issues.push('FIREBASE_ADMIN_* required for Firestore-backed limits/breaker');
}

if (issues.length > 0) {
  console.error('Distributed controls env: not production-ready locally:');
  for (const i of issues) console.error('  -', i);
  console.error('\nVercel Production: Project → Settings → Environment Variables → add both vars → Redeploy.');
  process.exit(1);
}

console.log('OK: RATE_LIMIT_STORE=firestore, AI_CIRCUIT_STORE=firestore, Firebase Admin present.');
console.log('After Vercel deploy: GET /api/diagnose (admin Bearer) → services.distributedControls.mode should be "firestore".');
