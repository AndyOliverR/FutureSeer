/**
 * Server-only: delete a user's Firestore data and Firebase Auth account.
 * Used by POST /api/account/delete after Bearer token verification.
 */

import 'server-only';

import type { DocumentReference, Firestore, Query } from 'firebase-admin/firestore';
import { adminDb, getAuth } from '@/lib/firebase-admin';
import { devLog } from '@/lib/devLogger';
import { cancelSubscription } from '@/lib/razorpay';

const BATCH = 400;

async function recursiveDeleteDocument(docRef: DocumentReference): Promise<void> {
  const cols = await docRef.listCollections();
  for (const colRef of cols) {
    const snap = await colRef.get();
    for (const d of snap.docs) {
      await recursiveDeleteDocument(d.ref);
    }
  }
  await docRef.delete().catch(() => undefined);
}

async function deleteByQuery(db: Firestore, query: Query): Promise<number> {
  let total = 0;
  while (true) {
    const snap = await query.limit(BATCH).get();
    if (snap.empty) break;
    const batch = db.batch();
    snap.docs.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();
    total += snap.size;
    if (snap.size < BATCH) break;
  }
  return total;
}

async function deleteDiscussionsByAuthor(db: Firestore, uid: string): Promise<void> {
  const q = db.collection('communityDiscussions').where('authorId', '==', uid);
  const snap = await q.get();
  for (const doc of snap.docs) {
    const comments = await doc.ref.collection('comments').get();
    if (!comments.empty) {
      const batch = db.batch();
      comments.docs.forEach((c) => batch.delete(c.ref));
      await batch.commit();
    }
    await doc.ref.delete().catch(() => undefined);
  }
}

async function deleteCommentsByAuthorEverywhere(db: Firestore, uid: string): Promise<void> {
  try {
    const q = db.collectionGroup('comments').where('authorId', '==', uid);
    await deleteByQuery(db, q);
  } catch (e) {
    devLog.warn('[deleteUserAccount] collectionGroup comments delete skipped', e, 'deleteUserAccount');
  }
}

async function tryCancelRazorpay(subscriptionId: string | undefined): Promise<void> {
  if (!subscriptionId || typeof subscriptionId !== 'string') return;
  try {
    await cancelSubscription(subscriptionId, false);
  } catch (e) {
    devLog.warn('[deleteUserAccount] Razorpay cancel failed (continuing delete)', e, 'deleteUserAccount');
  }
}

export type DeleteUserAccountResult =
  | { ok: true; deletedFirestorePaths: string[] }
  | { ok: false; error: string; status: number };

/**
 * Permanently removes the user's data and Auth record. Idempotent where possible.
 */
export async function deleteUserAccount(uid: string): Promise<DeleteUserAccountResult> {
  if (!uid) {
    return { ok: false, error: 'Invalid user', status: 400 };
  }

  const db = adminDb;
  if (!db) {
    return { ok: false, error: 'Server database not configured', status: 503 };
  }

  const paths: string[] = [];

  try {
    const userSnap = await db.collection('users').doc(uid).get();
    const userData = userSnap.data() as Record<string, unknown> | undefined;
    const subscriptionId =
      typeof userData?.subscriptionId === 'string' ? userData.subscriptionId : undefined;
    await tryCancelRazorpay(subscriptionId);

    await deleteDiscussionsByAuthor(db, uid);
    paths.push('communityDiscussions (author)');

    await deleteCommentsByAuthorEverywhere(db, uid);
    paths.push('comments (author collectionGroup)');

    const uidQueries: Array<{ col: string; field: string }> = [
      { col: 'notes', field: 'uid' },
      { col: 'askHistory', field: 'uid' },
      { col: 'userActivity', field: 'uid' },
      { col: 'dailyGuidance', field: 'userId' },
      { col: 'vedicAnalyses', field: 'userId' },
      { col: 'communityVotes', field: 'userId' },
      { col: 'communityContributions', field: 'userId' },
      { col: 'toolInterests', field: 'userId' },
    ];
    for (const { col, field } of uidQueries) {
      const n = await deleteByQuery(db, db.collection(col).where(field, '==', uid));
      if (n > 0) paths.push(`${col} (${n})`);
    }

    const fromConn = await deleteByQuery(
      db,
      db.collection('communityConnections').where('fromUserId', '==', uid),
    );
    if (fromConn > 0) paths.push(`communityConnections from (${fromConn})`);
    const toConn = await deleteByQuery(
      db,
      db.collection('communityConnections').where('toUserId', '==', uid),
    );
    if (toConn > 0) paths.push(`communityConnections to (${toConn})`);

    try {
      const refSnap = await db.collection('referrals').where('referrerId', '==', uid).get();
      if (!refSnap.empty) {
        const batch = db.batch();
        refSnap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
        paths.push(`referrals (${refSnap.size})`);
      }
    } catch {
      /* collection may be absent */
    }

    try {
      const n = await deleteByQuery(db, db.collection('supportTickets').where('userId', '==', uid));
      if (n > 0) paths.push(`supportTickets (${n})`);
    } catch (e) {
      devLog.warn('[deleteUserAccount] supportTickets cleanup skipped', e, 'deleteUserAccount');
    }

    try {
      const n = await deleteByQuery(db, db.collection('aiInferenceEvents').where('userId', '==', uid));
      if (n > 0) paths.push(`aiInferenceEvents (${n})`);
    } catch (e) {
      devLog.warn('[deleteUserAccount] aiInferenceEvents cleanup skipped', e, 'deleteUserAccount');
    }

    await db.collection('aiInferenceDaily').doc(uid).delete().catch(() => undefined);
    paths.push('aiInferenceDaily');

    await recursiveDeleteDocument(db.collection('users').doc(uid));
    paths.push('users/{uid} recursive');

    await db.collection('comprehensiveMysticalProfiles').doc(uid).delete().catch(() => undefined);
    paths.push('comprehensiveMysticalProfiles');

    try {
      await recursiveDeleteDocument(db.collection('seerMaster').doc(uid));
    } catch {
      await db.collection('seerMaster').doc(uid).delete().catch(() => undefined);
    }
    paths.push('seerMaster');

    await db.collection('communityMembers').doc(uid).delete().catch(() => undefined);
    paths.push('communityMembers');

    await getAuth().deleteUser(uid);
    paths.push('auth user');
  } catch (e) {
    devLog.error('[deleteUserAccount] failed', e, 'deleteUserAccount');
    const msg = e instanceof Error ? e.message : 'Deletion failed';
    return { ok: false, error: msg, status: 500 };
  }

  return { ok: true, deletedFirestorePaths: paths };
}
