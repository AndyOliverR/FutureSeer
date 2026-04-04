/**
 * Verifies FIREBASE_ADMIN_* in .env.local without printing secrets.
 * Run: pnpm run check:firebase-admin
 */
import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const envPath = resolve(process.cwd(), '.env.local');
if (!existsSync(envPath)) {
  console.error('Missing .env.local — copy env-template.txt to .env.local and fill values.');
  process.exit(1);
}

config({ path: envPath });

const projectId =
  process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

const issues = [];
if (!projectId || /your-project-id/i.test(String(projectId))) {
  issues.push('FIREBASE_ADMIN_PROJECT_ID (or NEXT_PUBLIC_FIREBASE_PROJECT_ID)');
}
if (!clientEmail || /your-service-account/i.test(String(clientEmail))) {
  issues.push('FIREBASE_ADMIN_CLIENT_EMAIL');
}
if (!privateKey || !String(privateKey).includes('BEGIN PRIVATE KEY')) {
  issues.push('FIREBASE_ADMIN_PRIVATE_KEY');
}

if (issues.length > 0) {
  console.error('Firebase Admin env: incomplete — missing or placeholder:');
  for (const i of issues) console.error(`  - ${i}`);
  console.error('See env-template.txt; JSON from Firebase Console → Project settings → Service accounts.');
  process.exit(1);
}

try {
  const app =
    getApps().length === 0
      ? initializeApp({
          credential: cert({ projectId, clientEmail, privateKey }),
          projectId,
        })
      : getApps()[0];
  getFirestore(app);
  console.log('Firebase Admin env: OK (credentials present and cert() succeeds).');
  process.exit(0);
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  console.error('Firebase Admin env: cert/init failed —', msg);
  process.exit(1);
}
