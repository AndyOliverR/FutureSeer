import { initializeApp, getApps } from 'firebase/app';
import { devLog } from '@/lib/devLogger';
import { 
  getAuth, 
  GoogleAuthProvider, 
  EmailAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut, 
  onAuthStateChanged, 
  User,
  UserCredential,
  AuthError,
  indexedDBLocalPersistence,
  initializeAuth,
  browserPopupRedirectResolver,
  browserSessionPersistence,
  signInWithCredential,
  getRedirectResult as firebaseGetRedirectResult
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, orderBy, limit, getDocs, updateDoc, serverTimestamp, enableNetwork, disableNetwork, onSnapshot, connectFirestoreEmulator, waitForPendingWrites, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  saveLocalAskHistory, 
  getLocalAskHistory, 
  saveLocalNote, 
  getLocalNotes, 
  updateLocalNote, 
  deleteLocalNote,
  saveLocalUserProfile,
  getLocalUserProfile
} from './localStorage';
import { clearAstroDataCache } from './astroDataService';
import { generateReferralCode, trackReferralSignup } from './referralUtils';

import { Capacitor } from '@capacitor/core';

// Client-side Firebase config (only public keys)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Server-side Firebase Admin SDK config
const adminConfig = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Lazy Firebase initialization with connection state tracking
let app: any = null;
let firebaseAuth: any = null;
let firebaseDB: any = null;
let firebaseStorage: any = null;
let adminApp: any = null;
let adminDB: any = null;
let isFirestoreConnected = false;
let connectionRetryCount = 0;
const MAX_RETRY_ATTEMPTS = 3;
let isRecovering = false;
let lastRecoveryAttempt = 0;
const RECOVERY_COOLDOWN = 5000; // 5 seconds between recovery attempts
let _adminInitLogged = false;

const initializeFirebase = (): { app: any; auth: any; db: any } => {
  // Check if we're on server-side
  if (typeof window === 'undefined') {
    // Server-side: Initialize Firebase Admin SDK
    if (!adminApp) {
      try {
        // Check if admin config is available
        if (!adminConfig.projectId || !adminConfig.clientEmail || !adminConfig.privateKey) {
          devLog.warn('⚠️ Firebase Admin SDK config incomplete. Using client SDK fallback.', undefined, 'firebase');
          // Fallback to client SDK for server-side (less secure but functional)
          if (!app) {
            app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
          }
          firebaseDB = getFirestore(app);
          return { app, auth: null, db: firebaseDB };
        }

        // Initialize Firebase Admin SDK
        const { initializeApp: initializeAdminApp, getApps: getAdminApps } = require('firebase-admin/app');
        const { getFirestore: getAdminFirestore } = require('firebase-admin/firestore');

        if (getAdminApps().length === 0) {
          adminApp = initializeAdminApp({
            credential: require('firebase-admin').credential.cert({
              projectId: adminConfig.projectId,
              clientEmail: adminConfig.clientEmail,
              privateKey: adminConfig.privateKey,
            }),
          });
        } else {
          adminApp = getAdminApps()[0];
        }

        adminDB = getAdminFirestore(adminApp);

        // Configure Firestore settings for server-side to prevent idle timeouts
        try {
          adminDB.settings({
            ignoreUndefinedProperties: true,
            cacheSizeBytes: 0, // Disable cache for server-side
          });
        } catch (error) {
          // Settings already applied, ignore error
          if (!_adminInitLogged) {
            devLog.warn('Firestore settings already applied', undefined, 'firebase');
            _adminInitLogged = true;
          }
        }

        if (!_adminInitLogged) {
          devLog.debug('✅ Firebase Admin SDK initialized for server-side');
          _adminInitLogged = true;
        }
        return { app: adminApp, auth: null, db: adminDB };

      } catch (adminError) {
        devLog.error('❌ Firebase Admin SDK initialization failed:', adminError, 'firebase');
        devLog.warn('⚠️ Falling back to client SDK for server-side operations', undefined, 'firebase');

        // Fallback to client SDK
        if (!app) {
          app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
        }
        firebaseDB = getFirestore(app);
        return { app, auth: null, db: firebaseDB };
      }
    }

    return { app: adminApp, auth: null, db: adminDB };
  }

  // Client-side: Use regular Firebase SDK
  if (!app) {
    try {
      // Check if all required config values are present
      const missingConfigs = [];
      if (!firebaseConfig.apiKey) missingConfigs.push('NEXT_PUBLIC_FIREBASE_API_KEY');
      if (!firebaseConfig.authDomain) missingConfigs.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
      if (!firebaseConfig.projectId) missingConfigs.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
      if (!firebaseConfig.storageBucket) missingConfigs.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
      if (!firebaseConfig.messagingSenderId) missingConfigs.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
      if (!firebaseConfig.appId) missingConfigs.push('NEXT_PUBLIC_FIREBASE_APP_ID');

      if (missingConfigs.length > 0) {
        devLog.error('❌ Firebase configuration incomplete. Missing:', missingConfigs, 'firebase');
        devLog.warn('⚠️ Firebase configuration incomplete. Some features may not work.', undefined, 'firebase');
        console.info('💡 Please check your environment variables in Vercel dashboard.');
        return { app: null, auth: null, db: null };
      }

      // Initialize Firebase app
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

      // Initialize Auth with persistence and proper resolvers.
      // Falls back to session-only persistence if IndexedDB is unavailable (e.g. private browsing).
      try {
        firebaseAuth = initializeAuth(app, {
          persistence: [indexedDBLocalPersistence, browserSessionPersistence],
          popupRedirectResolver: browserPopupRedirectResolver,
        });
      } catch (persistError) {
        devLog.warn('IndexedDB persistence unavailable, falling back to session persistence', undefined, 'firebase');
        firebaseAuth = initializeAuth(app, {
          persistence: [browserSessionPersistence],
          popupRedirectResolver: browserPopupRedirectResolver,
        });
      }

      firebaseStorage = getStorage(app);

      // Connect to Firestore
      firebaseDB = getFirestore(app);
      enableNetwork(firebaseDB).catch(() => {});

    } catch (error) {
      devLog.error('❌ Firebase initialization failed:', error, 'firebase');
      return { app: null, auth: null, db: null };
    }
  }

  return { app, auth: firebaseAuth, db: firebaseDB };
};

// Initialize Firebase services
export const getFirebaseAuth = (): any => {
  const { auth } = initializeFirebase();
  return auth;
};

export const getFirebaseDB = (): any => {
  const { db } = initializeFirebase();
  return db;
};

export const getFirebaseStorage = (): any => {
  initializeFirebase();
  return firebaseStorage;
};

// Export db as an alias for convenience
export const db = getFirebaseDB();

// Auth providers with optimized configuration for mobile
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account',
  display: 'page'
});

export const emailProvider = new EmailAuthProvider();

// Global flag to prevent multiple simultaneous sign-in attempts
let isSigningIn = false;
let signInPromise: Promise<User> | null = null;

export const signInWithGoogle = async (): Promise<User> => {
  if (isSigningIn && signInPromise) return signInPromise;

  isSigningIn = true;
  signInPromise = (async () => {
    try {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error('Firebase not initialized');

      // NATIVE ANDROID/IOS FLOW
      if (Capacitor.isNativePlatform()) {
        const { signInWithGoogleNative } = await import('./firebase-mobile');
        return await signInWithGoogleNative();
      }

      // WEB FLOW: use popup so we get the user in-page and can redirect reliably.
      // (Redirect flow often leaves getRedirectResult() null due to storage/origin, causing signin loop.)
      devLog.debug('🔄 Attempting Web Google sign-in (popup)...');
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error: any) {
      devLog.error('Error signing in with Google:', error, 'firebase');
      throw error;
    } finally {
      isSigningIn = false;
      signInPromise = null;
    }
  })();

  return signInPromise;
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase not initialized');
    const result: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    throw error;
  }
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string,
  country: string = 'IN',
  selectedPlan?: 'power-user-trial' | 'buy-coffee' | 'treat-me' | 'festive-hamper',
  paymentMethodId?: string,
  autoMandateAccepted?: boolean,
  subscriptionId?: string,
  referralCode?: string
): Promise<User> => {
  try {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase not initialized');
    const result: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    await updateProfile(user, { displayName });

    const db = getFirebaseDB();
    if (db) {
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: displayName,
        photoURL: '',
        country: country || 'IN',
        isSubscribed: !!selectedPlan && selectedPlan !== 'power-user-trial',
        isTipped: false,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        emailVerified: user.emailVerified,
        providerData: user.providerData,
        paymentMethodId,
        subscriptionId,
        selectedPlan,
        autoMandateAccepted: !!autoMandateAccepted,
        subscriptionStatus: 'trial',
        referralCode: generateReferralCode(user.uid),
        referralCount: 0,
        freeMonthsRemaining: 1,
      };
      await setDoc(doc(db, 'users', user.uid), userProfile);
    }
    return user;
  } catch (error: any) {
    throw error;
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase not initialized');
  await sendPasswordResetEmail(auth, email);
};

export const signOutUser = async (): Promise<void> => {
  try {
    const auth = getFirebaseAuth();
    if (Capacitor.isNativePlatform()) {
      const { signOutNative } = await import('./firebase-mobile');
      await signOutNative();
    }
    if (auth) await signOut(auth);
    // Only redirect after sign-out succeeds
    if (typeof window !== 'undefined') {
      document.cookie = 'fs_auth=; path=/; max-age=0; SameSite=Lax';
      sessionStorage.clear();
      window.location.href = '/';
    }
  } catch (error) {
    devLog.error('Error signing out:', error, 'firebase');
    throw error;
  }
};

export const getAuthErrorMessage = (error: any): string => {
  const code = error?.code || '';
  switch (code) {
    case 'auth/user-not-found': return 'No account found with this email.';
    case 'auth/wrong-password': return 'Incorrect password.';
    case 'auth/email-already-in-use': return 'An account with this email already exists. Try signing in instead.';
    case 'auth/invalid-credential': return 'Invalid email or password. Try "Forgot password?" or sign in with Google if you used that.';
    case 'auth/invalid-email': return 'Please enter a valid email address.';
    case 'auth/weak-password': return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/too-many-requests': return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/user-disabled': return 'This account has been disabled. Please contact support.';
    case 'auth/operation-not-allowed': return 'This sign-in method is not enabled. Please contact support.';
    case 'auth/network-request-failed': return 'Network error. Please check your connection and try again.';
    case 'auth/popup-closed-by-user': return 'Sign-in cancelled.';
    case 'auth/popup-blocked': return 'Pop-up was blocked by your browser. Please allow pop-ups and try again.';
    case 'auth/cancelled-popup-request': return 'Sign-in cancelled.';
    case 'auth/unauthorized-domain': return 'This domain is not authorized. Please contact support.';
    case 'auth/requires-recent-login': return 'Please sign in again to complete this action.';
    case 'auth/credential-already-in-use': return 'These credentials are already linked to another account.';
    default: return 'Something went wrong. Please try again.';
  }
};

export const isReturningUser = (user: User): boolean => {
  const ct = user.metadata?.creationTime ? new Date(user.metadata.creationTime).getTime() : 0;
  const lst = user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).getTime() : 0;
  return lst - ct > 60000;
};

export const getRedirectResult = async (): Promise<any> => {
  const auth = getFirebaseAuth();
  if (!auth) return null;
  return await firebaseGetRedirectResult(auth);
};

// Enhanced Firestore connection management
export const ensureFirestoreConnection = async (): Promise<boolean> => {
  try {
    const { db } = initializeFirebase();
    if (!db) return false;
    try {
      await enableNetwork(db);
      return true;
    } catch (e) {
      return false;
    }
  } catch (error) {
    return false;
  }
};

// Firestore user profile data
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const db = getFirebaseDB();
    if (!db) return null;
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    devLog.error('Error getting user profile:', error, 'firebase');
    return null;
  }
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
  try {
    const db = getFirebaseDB();
    if (!db) return;
    const userRef = doc(db, 'users', uid);
    // Firestore updateDoc() does not accept undefined; omit undefined fields
    const clean = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    ) as Partial<UserProfile>;
    await updateDoc(userRef, {
      ...clean,
      updatedAt: Date.now()
    });
  } catch (error) {
    devLog.error('Error updating user profile:', error, 'firebase');
    throw error;
  }
};

export const updateSubscriptionStatus = async (uid: string, isSubscribed: boolean): Promise<void> => {
  await updateUserProfile(uid, { isSubscribed });
};

export const updateTipStatus = async (uid: string, isTipped: boolean): Promise<void> => {
  await updateUserProfile(uid, { isTipped });
};

// Profile generation status utilities
export const calculateProfileDataHash = (profile: Partial<UserProfile>): string => {
  const relevantData = {
    birthDate: profile.birthDate,
    birthTime: profile.birthTime,
    birthPlace: profile.birthPlace,
    currentLocation: profile.currentLocation,
    gender: profile.gender,
    fullName: profile.fullName,
    displayName: profile.displayName,
    facePhotoUrl: profile.facePhotoUrl,
    palmPhotoUrl: profile.palmPhotoUrl
  };
  const dataString = JSON.stringify(relevantData);
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

export const hasProfileDataChanged = (profile: UserProfile, newData: Partial<UserProfile>): boolean => {
  const currentHash = profile.profileDataHash || '';
  const newHash = calculateProfileDataHash({ ...profile, ...newData });
  return currentHash !== newHash;
};

export const isReportsStale = (userProfile: UserProfile | null): boolean => {
  if (!userProfile) return true;
  const stored = userProfile.profileDataHash;
  if (stored == null || stored === '') {
    if (userProfile.mysticalProfileGenerated === true) return false;
    return true;
  }
  return calculateProfileDataHash(userProfile) !== stored;
};

export const isProfileComplete = (profile: UserProfile | null): boolean => {
  if (!profile) return false;
  return !!(profile.birthDate && profile.birthPlace && (profile.birthTimeKnown === false || profile.birthTime));
};

export const getProfileCompletionStatus = (profile: UserProfile | null) => {
  if (!profile) return { isComplete: false, missingFields: ['all'], completionPercentage: 0 };
  const missingFields = [];
  if (!profile.birthDate) missingFields.push('birthDate');
  if (!profile.birthPlace) missingFields.push('birthPlace');
  if (profile.birthTimeKnown !== false && !profile.birthTime) missingFields.push('birthTime');
  const completionPercentage = Math.round(((3 - missingFields.length) / 3) * 100);
  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercentage
  };
};

export const markProfileAsGenerated = async (uid: string, profileData?: Partial<UserProfile>): Promise<void> => {
  try {
    const db = getFirebaseDB();
    if (!db) return;
    const userRef = doc(db, 'users', uid);
    const newHash = profileData ? calculateProfileDataHash(profileData) : '';
    await updateDoc(userRef, {
      mysticalProfileGenerated: true,
      mysticalProfileGeneratedAt: Date.now(),
      profileDataHash: newHash,
      updatedAt: Date.now()
    });
  } catch (error) {
    devLog.error('Error marking profile as generated:', error, 'firebase');
  }
};

export const resetProfileGenerationStatus = async (uid: string): Promise<void> => {
  try {
    const db = getFirebaseDB();
    if (!db) return;
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      mysticalProfileGenerated: false,
      mysticalProfileGeneratedAt: null,
      profileDataHash: null,
      updatedAt: Date.now()
    });
    clearAstroDataCache(uid);
  } catch (error) {
    devLog.error('Error resetting profile generation status:', error, 'firebase');
  }
};

// Activity Logging
export const saveUserActivity = async (uid: string, activity: any): Promise<void> => {
  try {
    const db = getFirebaseDB();
    if (!db) return;
    const activityRef = collection(db, 'users', uid, 'activities');
    await addDoc(activityRef, {
      ...activity,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    devLog.error('Error saving user activity:', error, 'firebase');
  }
};

// Notes Management
export const saveNote = async (uid: string, note: any): Promise<string | null> => {
  try {
    const db = getFirebaseDB();
    if (!db) return null;
    const notesRef = collection(db, 'users', uid, 'notes');
    const docRef = await addDoc(notesRef, {
      ...note,
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    devLog.error('Error saving note:', error, 'firebase');
    return null;
  }
};

export const getNotes = async (uid: string): Promise<any[]> => {
  try {
    const db = getFirebaseDB();
    if (!db) return [];
    const notesRef = collection(db, 'users', uid, 'notes');
    const q = query(notesRef, orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    devLog.error('Error getting notes:', error, 'firebase');
    return [];
  }
};

/** Saves an ask entry to history (local for now; Firestore can be added later). */
export const saveAskHistory = async (data: {
  uid: string;
  question: string;
  aiSummary: string;
  scientificData?: any;
  symbolicData?: any;
  remedies?: any[];
  timestamp: number;
}): Promise<void> => {
  saveLocalAskHistory(data);
};

/** Returns ask history for a user (from local storage for now; filter by uid). */
export const getAskHistory = async (uid: string): Promise<any[]> => {
  const all = getLocalAskHistory();
  return all.filter((entry) => entry.uid === uid);
};

/** Ask history entry shape (matches LocalAskHistory). */
export interface AskHistory {
  id: string;
  uid: string;
  question: string;
  aiSummary: string;
  scientificData?: any;
  symbolicData?: any;
  remedies?: any[];
  timestamp: number;
}

/** User activity log item from Firestore. */
export interface UserActivityItem {
  type?: string;
  toolSlug?: string;
  path?: string;
  timestamp?: any;
  [key: string]: any;
}

/** Returns recent activity for a user from Firestore (users/{uid}/activities). */
export const getUserActivity = async (uid: string, limitCount: number = 50): Promise<UserActivityItem[]> => {
  try {
    const db = getFirebaseDB();
    if (!db) return [];
    const activityRef = collection(db, 'users', uid, 'activities');
    const q = query(activityRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as UserActivityItem));
  } catch {
    return [];
  }
};

/** Returns user's saved remedies (e.g. from profile or a future collection). Stub returns [] until persistence is added. */
export const getSavedRemedies = async (_uid: string): Promise<any[]> => {
  try {
    const db = getFirebaseDB();
    if (!db) return [];
    // TODO: read from user profile field or remedies subcollection when added
    return [];
  } catch {
    return [];
  }
};

/** Unified reading shape used by useAllReadings. */
export interface UnifiedReading {
  timestamp: number;
  confidence?: number;
  symbolicData?: { elementalInfluence?: string };
  remedies?: any[];
  [key: string]: any;
}

/** Returns all readings for a user. Stub returns [] until persistence is added. */
export const getAllReadings = async (_uid: string): Promise<UnifiedReading[]> => {
  try {
    const db = getFirebaseDB();
    if (!db) return [];
    // TODO: read from user readings subcollection or activity log when added
    return [];
  } catch {
    return [];
  }
};

export const clearUserProfileCache = (uid: string) => {
  // In-memory cache clearing logic would go here if implemented
};

export const cleanupCorruptedBirthTime = (birthTime: any): string => {
  if (typeof birthTime === 'number' || (typeof birthTime === 'string' && /^\d{13,}$/.test(birthTime))) {
    return '';
  }
  if (typeof birthTime === 'string' && /^\d{1,2}:\d{2}$/.test(birthTime)) {
    return birthTime;
  }
  return '';
};

// Types
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  fullName?: string;
  photoURL?: string;
  isSubscribed: boolean;
  isTipped: boolean;
  createdAt: number;
  lastLoginAt: number;
  birthDate?: string;
  birthPlace?: string;
  birthTime?: string;
  birthTimeKnown?: boolean;
  birthTimePeriod?: 'early-morning' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night' | 'late-night' | 'unknown';
  birthTimeNote?: string;
  birthLatitude?: number;
  birthLongitude?: number;
  latitude?: number;
  longitude?: number;
  coordinatesResolvedAt?: number;
  currentLocation?: string;
  gender?: 'male' | 'female' | 'non-binary';
  facePhotoUrl?: string;
  palmPhotoUrl?: string;
  emailVerified?: boolean;
  providerData?: any[];
  lastSignInTime?: number;
  creationTime?: number;
  updatedAt?: number;
  mysticalProfileGenerated?: boolean;
  profileDataHash?: string;
  profileStatus?: 'incomplete' | 'completed';
  country?: string;
  paymentMethodId?: string;
  subscriptionId?: string;
  selectedPlan?: string;
  autoMandateAccepted?: boolean;
  subscriptionStatus?: string;
  trialEndDate?: number;
  trialEndTime?: number;
  nextBillingDate?: number;
  referralCode?: string;
  referralCount?: number;
  freeMonthsRemaining?: number;
  notificationsEnabled?: boolean;
  emailUpdates?: boolean;
  relationshipStatus?: 'single' | 'in-relationship' | 'married' | 'divorced' | 'widowed' | 'prefer-not-to-say';
  hasChildren?: boolean;
  numberOfChildren?: number;
  divinationInterests?: string[];
  notificationPreferences?: {
    dailyInsights?: boolean;
    weeklyPredictions?: boolean;
    monthlyHoroscope?: boolean;
    communityUpdates?: boolean;
    newFeatures?: boolean;
  };
  timezone?: number | string;
}

export interface Note {
  id?: string;
  title: string;
  content: string;
  color?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
  userId?: string;
}

export default app;
