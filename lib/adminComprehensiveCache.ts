/**
 * Read/write helpers for user-scoped comprehensive reports stored via Firebase Admin.
 */

import { adminDb } from '@/lib/firebase-admin';
import { devLog } from '@/lib/devLogger';

export type ReadAdminCacheOptions<T> = {
  allowStale?: boolean;
  maxAgeHours?: number;
  extract: (doc: Record<string, unknown>) => T | null;
};

export async function readAdminComprehensiveCache<T>(
  userId: string,
  subcollection: string,
  docId: string,
  options: ReadAdminCacheOptions<T>,
): Promise<T | null> {
  if (!adminDb) return null;
  try {
    const snap = await adminDb
      .collection('users')
      .doc(userId)
      .collection(subcollection)
      .doc(docId)
      .get();
    if (!snap.exists) return null;
    const doc = snap.data() as Record<string, unknown>;
    if (!doc) return null;

    if (!options.allowStale) {
      const ts = doc.timestamp as number | undefined;
      const lastUpdated = doc.lastUpdated;
      let ageMs: number | null = null;
      if (typeof ts === 'number') {
        ageMs = Date.now() - ts;
      } else if (typeof lastUpdated === 'string') {
        ageMs = Date.now() - new Date(lastUpdated).getTime();
      }
      if (ageMs !== null) {
        const maxHours = options.maxAgeHours ?? 24;
        if (ageMs >= maxHours * 60 * 60 * 1000) return null;
      }
    }

    return options.extract(doc);
  } catch (e) {
    devLog.warn(
      `readAdminComprehensiveCache failed (${subcollection}/${docId})`,
      e,
      'adminComprehensiveCache',
    );
    return null;
  }
}

export async function writeAdminComprehensiveCache(
  userId: string,
  subcollection: string,
  docId: string,
  payload: Record<string, unknown>,
): Promise<void> {
  if (!adminDb) return;
  try {
    await adminDb
      .collection('users')
      .doc(userId)
      .collection(subcollection)
      .doc(docId)
      .set({ ...payload, timestamp: Date.now() }, { merge: true });
  } catch (e) {
    devLog.warn(
      `writeAdminComprehensiveCache failed (${subcollection}/${docId})`,
      e,
      'adminComprehensiveCache',
    );
  }
}
