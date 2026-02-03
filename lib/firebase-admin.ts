// Firebase Admin SDK Configuration
// Server-side Firebase operations

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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
    console.error('❌ Firebase Admin initialization failed:', error);
    // Fallback to client-side Firebase for development
    adminApp = null;
  }
} else {
  adminApp = getApps()[0];
}

// Get Firestore instance
export const adminDb = adminApp ? getFirestore(adminApp) : null;

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
