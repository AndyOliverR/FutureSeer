/**
 * User subcollection reads/writes that work with both:
 * - firebase-admin Firestore (typical server / getFirebaseDB() on Node)
 * - Client modular firebase/firestore (browser or server fallback without Admin)
 *
 * Do not pass Admin Firestore into `doc()` / `collection()` from `firebase/firestore` — it throws
 * "Expected first argument to collection() to be a CollectionReference...".
 */

import { getFirebaseDB } from '@/lib/firebase';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  where,
  type WhereFilterOp,
} from 'firebase/firestore';

async function getAdminDb(): Promise<import('firebase-admin/firestore').Firestore | null> {
  if (typeof window !== 'undefined') return null;
  try {
    const { adminDb } = await import('@/lib/firebase-admin');
    return adminDb;
  } catch {
    return null;
  }
}

function isFirestoreTimestampLike(v: unknown): boolean {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.toDate === 'function' && typeof o.seconds === 'number';
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  if (v == null || typeof v !== 'object') return false;
  if (Array.isArray(v)) return false;
  if (v instanceof Date) return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
}

/** Recursively replace client Firestore Timestamps so Admin SDK .set() accepts the payload. */
export function deepForAdminWrite<T>(value: T): T {
  if (value == null) return value;
  if (isFirestoreTimestampLike(value)) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- server-only branch; avoids async in serializer
    const { Timestamp } = require('firebase-admin/firestore') as typeof import('firebase-admin/firestore');
    return Timestamp.fromDate((value as unknown as { toDate: () => Date }).toDate()) as T;
  }
  if (value instanceof Date) return value;
  if (Array.isArray(value)) {
    return value.map((x) => deepForAdminWrite(x)) as T;
  }
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = deepForAdminWrite(v);
    }
    return out as T;
  }
  return value;
}

type ClientFirestoreFirstArg = Parameters<typeof doc>[0];

export type UserSubcollectionWhereClause = { field: string; op: WhereFilterOp; value: unknown };

export async function userSubdocSet(
  userId: string,
  subcollection: string,
  docId: string,
  data: Record<string, unknown>,
  options?: { merge?: boolean }
): Promise<void> {
  const adminDb = await getAdminDb();
  if (adminDb) {
    const payload = deepForAdminWrite(data) as Record<string, unknown>;
    await adminDb
      .collection('users')
      .doc(userId)
      .collection(subcollection)
      .doc(docId)
      .set(payload, { merge: options?.merge ?? false });
    return;
  }
  const db = getFirebaseDB();
  if (!db) {
    throw new Error('Firestore not available');
  }
  await setDoc(
    doc(db as ClientFirestoreFirstArg, 'users', userId, subcollection, docId),
    data,
    { merge: options?.merge ?? false }
  );
}

export async function userSubdocGet(
  userId: string,
  subcollection: string,
  docId: string
): Promise<Record<string, unknown> | null> {
  const adminDb = await getAdminDb();
  if (adminDb) {
    const snap = await adminDb
      .collection('users')
      .doc(userId)
      .collection(subcollection)
      .doc(docId)
      .get();
    return snap.exists ? (snap.data() as Record<string, unknown>) : null;
  }
  const db = getFirebaseDB();
  if (!db) return null;
  const docRef = doc(db as ClientFirestoreFirstArg, 'users', userId, subcollection, docId);
  const snap = await getDoc(docRef);
  return snap.exists() ? (snap.data() as Record<string, unknown>) : null;
}

export async function userSubcollectionQueryOrdered(
  userId: string,
  subcollection: string,
  orderByField: string,
  orderDir: 'desc' | 'asc' = 'desc',
  limitCount?: number
): Promise<Record<string, unknown>[]> {
  const adminDb = await getAdminDb();
  if (adminDb) {
    let q: import('firebase-admin/firestore').Query = adminDb
      .collection('users')
      .doc(userId)
      .collection(subcollection)
      .orderBy(orderByField, orderDir);
    if (limitCount != null && limitCount > 0) {
      q = q.limit(limitCount);
    }
    const snap = await q.get();
    return snap.docs.map((d) => ({
      ...(d.data() as Record<string, unknown>),
      id: d.id,
    }));
  }
  const db = getFirebaseDB();
  if (!db) return [];
  const readingsRef = collection(db as ClientFirestoreFirstArg, 'users', userId, subcollection);
  const q =
    limitCount != null && limitCount > 0
      ? query(readingsRef, orderBy(orderByField, orderDir), limit(limitCount))
      : query(readingsRef, orderBy(orderByField, orderDir));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((d) => ({
    ...(d.data() as Record<string, unknown>),
    id: d.id,
  }));
}

/** Top-level collection add (e.g. `astroLearning`) — Admin- or client-safe. */
export async function rootCollectionAdd(
  collectionId: string,
  data: Record<string, unknown>
): Promise<string | null> {
  const adminDb = await getAdminDb();
  if (adminDb) {
    const ref = await adminDb
      .collection(collectionId)
      .add(deepForAdminWrite(data) as Record<string, unknown>);
    return ref.id;
  }
  const db = getFirebaseDB();
  if (!db) return null;
  const ref = await addDoc(collection(db as ClientFirestoreFirstArg, collectionId), data);
  return ref.id;
}

/** Top-level document read (e.g. `comprehensiveMysticalProfiles/{userId}`). */
export async function rootDocGet(
  collectionId: string,
  docId: string
): Promise<Record<string, unknown> | null> {
  const adminDb = await getAdminDb();
  if (adminDb) {
    const snap = await adminDb.collection(collectionId).doc(docId).get();
    return snap.exists ? (snap.data() as Record<string, unknown>) : null;
  }
  const db = getFirebaseDB();
  if (!db) return null;
  const snap = await getDoc(doc(db as ClientFirestoreFirstArg, collectionId, docId));
  return snap.exists() ? (snap.data() as Record<string, unknown>) : null;
}

/** Top-level document set (Admin- or client-safe). */
export async function rootDocSet(
  collectionId: string,
  docId: string,
  data: Record<string, unknown>,
  options?: { merge?: boolean }
): Promise<void> {
  const adminDb = await getAdminDb();
  if (adminDb) {
    await adminDb
      .collection(collectionId)
      .doc(docId)
      .set(deepForAdminWrite(data) as Record<string, unknown>, { merge: options?.merge ?? false });
    return;
  }
  const db = getFirebaseDB();
  if (!db) throw new Error('Firestore not available');
  await setDoc(doc(db as ClientFirestoreFirstArg, collectionId, docId), data, {
    merge: options?.merge ?? false,
  });
}

/** Query a root collection with `where` clauses (Admin- or client-safe). */
export async function rootCollectionQueryWhere(
  collectionId: string,
  wheres: UserSubcollectionWhereClause[],
  options?: { orderByField?: string; orderDir?: 'asc' | 'desc'; limitCount?: number }
): Promise<Array<Record<string, unknown> & { id: string }>> {
  const adminDb = await getAdminDb();
  if (adminDb) {
    let q: import('firebase-admin/firestore').Query = adminDb.collection(collectionId);
    for (const w of wheres) {
      q = q.where(w.field, w.op as import('firebase-admin/firestore').WhereFilterOp, w.value);
    }
    if (options?.orderByField) {
      q = q.orderBy(options.orderByField, options.orderDir ?? 'asc');
    }
    if (options?.limitCount != null && options.limitCount > 0) {
      q = q.limit(options.limitCount);
    }
    const snap = await q.get();
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Record<string, unknown>),
    }));
  }
  const db = getFirebaseDB();
  if (!db) return [];
  const base = collection(db as ClientFirestoreFirstArg, collectionId);
  const constraints = wheres.map((w) => where(w.field, w.op, w.value));
  const ob =
    options?.orderByField != null
      ? [orderBy(options.orderByField, options.orderDir ?? 'asc')]
      : [];
  const lim =
    options?.limitCount != null && options.limitCount > 0 ? [limit(options.limitCount)] : [];
  const q = query(base, ...constraints, ...ob, ...lim);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Record<string, unknown>),
  }));
}

/** `users/{userId}` root document. */
export async function userRootDocGet(userId: string): Promise<Record<string, unknown> | null> {
  const adminDb = await getAdminDb();
  if (adminDb) {
    const snap = await adminDb.collection('users').doc(userId).get();
    return snap.exists ? (snap.data() as Record<string, unknown>) : null;
  }
  const db = getFirebaseDB();
  if (!db) return null;
  const snap = await getDoc(doc(db as ClientFirestoreFirstArg, 'users', userId));
  return snap.exists() ? (snap.data() as Record<string, unknown>) : null;
}

export async function userRootDocSet(
  userId: string,
  data: Record<string, unknown>,
  options?: { merge?: boolean }
): Promise<void> {
  const adminDb = await getAdminDb();
  if (adminDb) {
    const payload = deepForAdminWrite(data) as Record<string, unknown>;
    await adminDb.collection('users').doc(userId).set(payload, { merge: options?.merge ?? false });
    return;
  }
  const db = getFirebaseDB();
  if (!db) throw new Error('Firestore not available');
  await setDoc(doc(db as ClientFirestoreFirstArg, 'users', userId), data, {
    merge: options?.merge ?? false,
  });
}

export async function userRootDocUpdate(userId: string, partial: Record<string, unknown>): Promise<void> {
  const adminDb = await getAdminDb();
  if (adminDb) {
    await adminDb
      .collection('users')
      .doc(userId)
      .update(deepForAdminWrite(partial) as Record<string, unknown>);
    return;
  }
  const db = getFirebaseDB();
  if (!db) throw new Error('Firestore not available');
  await updateDoc(doc(db as ClientFirestoreFirstArg, 'users', userId), partial);
}

export async function userRootDocDelete(userId: string): Promise<void> {
  const adminDb = await getAdminDb();
  if (adminDb) {
    await adminDb.collection('users').doc(userId).delete();
    return;
  }
  const db = getFirebaseDB();
  if (!db) throw new Error('Firestore not available');
  await deleteDoc(doc(db as ClientFirestoreFirstArg, 'users', userId));
}

export async function userSubdocDelete(
  userId: string,
  subcollection: string,
  docId: string
): Promise<void> {
  const adminDb = await getAdminDb();
  if (adminDb) {
    await adminDb.collection('users').doc(userId).collection(subcollection).doc(docId).delete();
    return;
  }
  const db = getFirebaseDB();
  if (!db) throw new Error('Firestore not available');
  await deleteDoc(doc(db as ClientFirestoreFirstArg, 'users', userId, subcollection, docId));
}

export async function userSubdocUpdate(
  userId: string,
  subcollection: string,
  docId: string,
  partial: Record<string, unknown>
): Promise<void> {
  const adminDb = await getAdminDb();
  if (adminDb) {
    await adminDb
      .collection('users')
      .doc(userId)
      .collection(subcollection)
      .doc(docId)
      .update(deepForAdminWrite(partial) as Record<string, unknown>);
    return;
  }
  const db = getFirebaseDB();
  if (!db) throw new Error('Firestore not available');
  await updateDoc(doc(db as ClientFirestoreFirstArg, 'users', userId, subcollection, docId), partial);
}

export async function userSubcollectionAdd(
  userId: string,
  subcollection: string,
  data: Record<string, unknown>
): Promise<string> {
  const adminDb = await getAdminDb();
  if (adminDb) {
    const ref = await adminDb
      .collection('users')
      .doc(userId)
      .collection(subcollection)
      .add(deepForAdminWrite(data) as Record<string, unknown>);
    return ref.id;
  }
  const db = getFirebaseDB();
  if (!db) throw new Error('Firestore not available');
  const ref = await addDoc(
    collection(db as ClientFirestoreFirstArg, 'users', userId, subcollection),
    data
  );
  return ref.id;
}

/** All documents in `users/{userId}/{subcollection}` (unordered). */
export async function userSubcollectionListDocuments(
  userId: string,
  subcollection: string
): Promise<Array<Record<string, unknown> & { id: string }>> {
  const adminDb = await getAdminDb();
  if (adminDb) {
    const snap = await adminDb.collection('users').doc(userId).collection(subcollection).get();
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Record<string, unknown>),
    }));
  }
  const db = getFirebaseDB();
  if (!db) return [];
  const snap = await getDocs(collection(db as ClientFirestoreFirstArg, 'users', userId, subcollection));
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Record<string, unknown>),
  }));
}

export async function userSubcollectionQueryWhere(
  userId: string,
  subcollection: string,
  wheres: UserSubcollectionWhereClause[],
  options?: { orderByField?: string; orderDir?: 'asc' | 'desc'; limitCount?: number }
): Promise<Array<Record<string, unknown> & { id: string }>> {
  const adminDb = await getAdminDb();
  if (adminDb) {
    let q: import('firebase-admin/firestore').Query = adminDb
      .collection('users')
      .doc(userId)
      .collection(subcollection);
    for (const w of wheres) {
      q = q.where(w.field, w.op as import('firebase-admin/firestore').WhereFilterOp, w.value);
    }
    if (options?.orderByField) {
      q = q.orderBy(options.orderByField, options.orderDir ?? 'asc');
    }
    if (options?.limitCount != null && options.limitCount > 0) {
      q = q.limit(options.limitCount);
    }
    const snap = await q.get();
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Record<string, unknown>),
    }));
  }
  const db = getFirebaseDB();
  if (!db) return [];
  const base = collection(db as ClientFirestoreFirstArg, 'users', userId, subcollection);
  const constraints = wheres.map((w) => where(w.field, w.op, w.value));
  const ob =
    options?.orderByField != null
      ? [orderBy(options.orderByField, options.orderDir ?? 'asc')]
      : [];
  const lim =
    options?.limitCount != null && options.limitCount > 0 ? [limit(options.limitCount)] : [];
  const q = query(base, ...constraints, ...ob, ...lim);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Record<string, unknown>),
  }));
}
