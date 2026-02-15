// Server-side Firebase helper for the Vedic Learning Engine
import { NextRequest } from 'next/server';
import { devLog } from '@/lib/devLogger';

export const getAdminFirebaseDB = async () => {
  try {
    // Check if we have admin credentials
    devLog.debug('🔍 Checking Firebase Admin credentials...');
    devLog.debug('Project ID:', process.env.FIREBASE_ADMIN_PROJECT_ID ? '✅ Set' : '❌ Missing');
    devLog.debug('Client Email:', process.env.FIREBASE_ADMIN_CLIENT_EMAIL ? '✅ Set' : '❌ Missing');
    devLog.debug('Private Key:', process.env.FIREBASE_ADMIN_PRIVATE_KEY ? '✅ Set' : '❌ Missing');
    
    if (process.env.FIREBASE_ADMIN_PROJECT_ID && process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      devLog.debug('🔐 All Firebase Admin credentials present, initializing...');
      
      try {
        const { initializeApp: initializeAdminApp, getApps: getAdminApps, cert } = await import('firebase-admin/app');
        const { getFirestore: getAdminFirestore } = await import('firebase-admin/firestore');
        
        devLog.debug('📦 Firebase Admin packages imported successfully');
        
        if (getAdminApps().length === 0) {
          devLog.debug('🚀 Initializing Firebase Admin app...');
          initializeAdminApp({
            credential: cert({
              projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
              clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
          });
          devLog.debug('✅ Firebase Admin app initialized');
        } else {
          devLog.debug('✅ Firebase Admin app already exists');
        }
        
        const adminDB = getAdminFirestore();
        devLog.debug('✅ Firebase Admin Firestore instance created');
        return adminDB;
      } catch (importError) {
        devLog.error('❌ Failed to import Firebase Admin packages:', importError, 'serverFirebase');
        return null;
      }
    } else {
      devLog.debug('⚠️ Missing Firebase Admin credentials');
      return null;
    }
  } catch (error) {
    devLog.error('❌ Failed to initialize Firebase Admin:', error, 'serverFirebase');
    return null;
  }
};
