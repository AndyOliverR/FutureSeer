// Canonical server-side Firebase Admin entry. Prefer importing this module from API routes
// and server-only code. Client bundles should not import this file (use lib/firebase.ts).

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { devLog } from '@/lib/devLogger';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { setCachedServerAdminFirestore } from '@/lib/firebaseServerAdminCache';

const projectId =
  process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

let adminApp: ReturnType<typeof initializeApp> | null = null;

if (getApps().length === 0) {
  if (projectId && clientEmail && privateKey) {
    try {
      const storageBucket =
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
        process.env.FIREBASE_ADMIN_STORAGE_BUCKET;
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
        ...(storageBucket ? { storageBucket } : {}),
      });
    } catch (error) {
      devLog.error('❌ Firebase Admin initialization failed:', error, 'firebase-admin');
      adminApp = null;
    }
  }
} else {
  adminApp = getApps()[0];
}

let _firestoreSettingsLogged = false;

function getAdminFirestoreInstance(): Firestore | null {
  if (!adminApp) return null;
  const fs = getFirestore(adminApp);
  try {
    fs.settings({
      ignoreUndefinedProperties: true,
      cacheSizeBytes: 0,
    });
  } catch {
    if (!_firestoreSettingsLogged) {
      devLog.warn('Firestore settings already applied', undefined, 'firebase-admin');
      _firestoreSettingsLogged = true;
    }
  }
  if (!_firestoreSettingsLogged) {
    devLog.debug('✅ Firebase Admin Firestore ready for server', undefined, 'firebase-admin');
    _firestoreSettingsLogged = true;
  }
  return fs;
}

export const adminDb = getAdminFirestoreInstance();
setCachedServerAdminFirestore(adminDb);

// Firebase Admin Auth (verifyIdToken, listUsers, setCustomUserClaims, createCustomToken)
export { getAuth };

export function isAdminAvailable(): boolean {
  return adminDb !== null;
}

export async function getDocument(collection: string, docId: string) {
  if (adminDb) {
    const docRef = adminDb.collection(collection).doc(docId);
    const docSnap = await docRef.get();
    return docSnap.exists ? docSnap.data() : null;
  }
  return null;
}

export async function setDocument(collection: string, docId: string, data: any) {
  if (adminDb) {
    const docRef = adminDb.collection(collection).doc(docId);
    await docRef.set(data, { merge: true });
    return true;
  }
  return false;
}

export async function batchSetDocuments(
  writes: Array<{ collection: string; docId: string; data: any }>
): Promise<boolean> {
  if (!adminDb) return false;
  const batch = adminDb.batch();
  for (const w of writes) {
    const docRef = adminDb.collection(w.collection).doc(w.docId);
    batch.set(docRef, w.data, { merge: true });
  }
  await batch.commit();
  return true;
}

export async function deleteDocument(collection: string, docId: string): Promise<boolean> {
  if (adminDb) {
    const docRef = adminDb.collection(collection).doc(docId);
    await docRef.delete();
    return true;
  }
  return false;
}
