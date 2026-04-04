/**
 * Process-wide cache for the resolved Admin Firestore instance.
 * Next may load multiple copies of lib/firebase.ts; globalThis is shared per Node process.
 */

const SERVER_ADMIN_FIRESTORE_GLOBAL = Symbol.for('futureseer.serverAdminFirestore');

type GlobalWithAdmin = typeof globalThis & { [k: symbol]: unknown };

export function getCachedServerAdminFirestore(): unknown {
  return (globalThis as GlobalWithAdmin)[SERVER_ADMIN_FIRESTORE_GLOBAL] ?? null;
}

export function setCachedServerAdminFirestore(db: unknown): void {
  if (db) {
    (globalThis as GlobalWithAdmin)[SERVER_ADMIN_FIRESTORE_GLOBAL] = db;
  }
}
