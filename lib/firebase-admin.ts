// Firebase Admin SDK Configuration
// Server-side Firebase operations

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { devLog } from '@/lib/devLogger';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
let adminApp;
if (getApps().length === 0) {
  try {
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    });
  } catch (error) {
    devLog.error('❌ Firebase Admin initialization failed:', error, 'firebase-admin');
    // Fallback to client-side Firebase for development
    adminApp = null;
  }
} else {
  adminApp = getApps()[0];
}

// Get Firestore instance
export const adminDb = adminApp ? getFirestore(adminApp) : null;

// Firebase Admin Auth (uses default app; for verifyIdToken, listUsers, setCustomUserClaims, createCustomToken)
export { getAuth };

// Helper function to check if admin is available
export function isAdminAvailable(): boolean {
  return adminDb !== null;
}

// Fallback functions for when admin is not available
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
