import 'server-only';

import type { Firestore } from 'firebase-admin/firestore';

const GET_ALL_CHUNK = 30;

/** Fetch Firestore user root docs for a set of uids (batched getAll). */
export async function fetchUserDocsByUid(
  db: Firestore,
  uids: string[],
): Promise<Record<string, Record<string, unknown>>> {
  const out: Record<string, Record<string, unknown>> = {};
  const unique = [...new Set(uids.filter(Boolean))];
  if (unique.length === 0) return out;

  for (let i = 0; i < unique.length; i += GET_ALL_CHUNK) {
    const chunk = unique.slice(i, i + GET_ALL_CHUNK);
    const refs = chunk.map((uid) => db.collection('users').doc(uid));
    const snaps = await db.getAll(...refs);
    for (const snap of snaps) {
      if (snap.exists) {
        out[snap.id] = snap.data() as Record<string, unknown>;
      }
    }
  }

  return out;
}
