// Server-side Firebase helper for the Vedic Learning Engine
import { NextRequest } from 'next/server';

export const getAdminFirebaseDB = async () => {
  try {
    // Check if we have admin credentials
    console.log('🔍 Checking Firebase Admin credentials...');
    console.log('Project ID:', process.env.FIREBASE_ADMIN_PROJECT_ID ? '✅ Set' : '❌ Missing');
    console.log('Client Email:', process.env.FIREBASE_ADMIN_CLIENT_EMAIL ? '✅ Set' : '❌ Missing');
    console.log('Private Key:', process.env.FIREBASE_ADMIN_PRIVATE_KEY ? '✅ Set' : '❌ Missing');
    
    if (process.env.FIREBASE_ADMIN_PROJECT_ID && process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      console.log('🔐 All Firebase Admin credentials present, initializing...');
      
      try {
        const { initializeApp: initializeAdminApp, getApps: getAdminApps, cert } = await import('firebase-admin/app');
        const { getFirestore: getAdminFirestore } = await import('firebase-admin/firestore');
        
        console.log('📦 Firebase Admin packages imported successfully');
        
        if (getAdminApps().length === 0) {
          console.log('🚀 Initializing Firebase Admin app...');
          initializeAdminApp({
            credential: cert({
              projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
              clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
          });
          console.log('✅ Firebase Admin app initialized');
        } else {
          console.log('✅ Firebase Admin app already exists');
        }
        
        const adminDB = getAdminFirestore();
        console.log('✅ Firebase Admin Firestore instance created');
        return adminDB;
      } catch (importError) {
        console.error('❌ Failed to import Firebase Admin packages:', importError);
        return null;
      }
    } else {
      console.log('⚠️ Missing Firebase Admin credentials');
      return null;
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
    return null;
  }
};
