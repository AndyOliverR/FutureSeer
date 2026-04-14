import { initializeApp, getApps } from 'firebase/app';
import { devLog } from '@/lib/devLogger';
import {
  getCachedServerAdminFirestore,
  setCachedServerAdminFirestore,
} from '@/lib/firebaseServerAdminCache';
import { 
  getAuth, 
  GoogleAuthProvider, 
  EmailAuthProvider,
  OAuthProvider,
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
import { shouldPreferOAuthRedirect } from '@/lib/oauthWebView';

/** Thrown after signInWithRedirect so callers can skip error UI; page navigates away. */
export const AUTH_REDIRECT_INITIATED_MESSAGE = 'Redirect initiated';

export function isAuthRedirectInitiatedError(error: unknown): boolean {
  return error instanceof Error && error.message === AUTH_REDIRECT_INITIATED_MESSAGE;
}

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
/** When true, server path successfully resolved Firestore from lib/firebase-admin.ts */
let serverAdminDbReady = false;
let serverAdminDb: any = null;
/** Avoid duplicate warnings when parallel server handlers hit getFirebaseDB() before Admin is ready */
let serverFirebaseAdminFallbackWarned = false;

function warnServerFirebaseAdminFallbackOnce(message: string): void {
  if (serverFirebaseAdminFallbackWarned) return;
  serverFirebaseAdminFallbackWarned = true;
  devLog.warn(message, undefined, 'firebase');
}

/**
 * When require('./firebase-admin') returns null adminDb (stale duplicate chunk) but env is valid,
 * initialize Admin once using process.env at call time.
 */
function tryRuntimeAdminFirestoreInit(): any {
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const adminAppMod = require('firebase-admin/app');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getFirestore: getAdminFs } = require('firebase-admin/firestore');
    const apps = adminAppMod.getApps();
    if (apps.length > 0) {
      return getAdminFs(apps[0]);
    }
    const storageBucket =
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      process.env.FIREBASE_ADMIN_STORAGE_BUCKET;
    adminAppMod.initializeApp({
      credential: adminAppMod.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
      ...(storageBucket ? { storageBucket } : {}),
    });
    return getAdminFs(adminAppMod.getApps()[0]);
  } catch (e) {
    devLog.error('❌ Firebase Admin runtime init failed:', e, 'firebase');
    return null;
  }
}

const initializeFirebase = (): { app: any; auth: any; db: any } => {
  // Check if we're on server-side
  if (typeof window === 'undefined') {
    const fromGlobal = getCachedServerAdminFirestore();
    if (fromGlobal) {
      serverAdminDb = fromGlobal;
      serverAdminDbReady = true;
      return { app: null, auth: null, db: serverAdminDb };
    }

    if (serverAdminDbReady) {
      return { app: null, auth: null, db: serverAdminDb };
    }

    try {
      if (!adminConfig.projectId || !adminConfig.clientEmail || !adminConfig.privateKey) {
        const missing: string[] = [];
        if (!adminConfig.projectId) {
          missing.push('FIREBASE_ADMIN_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID');
        }
        if (!adminConfig.clientEmail) missing.push('FIREBASE_ADMIN_CLIENT_EMAIL');
        if (!adminConfig.privateKey) missing.push('FIREBASE_ADMIN_PRIVATE_KEY');
        warnServerFirebaseAdminFallbackOnce(
          `⚠️ Firebase Admin SDK config incomplete (missing: ${missing.join(', ')}). Using client SDK fallback. Add service account fields to .env.local from Firebase Console → Service accounts, then restart pnpm dev (see env-template.txt).`
        );
        if (!app) {
          app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
        }
        firebaseDB = getFirestore(app);
        return { app, auth: null, db: firebaseDB };
      }

      // Use global Admin app registry first: multiple webpack server chunks can each evaluate
      // lib/firebase-admin.ts with stale null exports while another chunk already called initializeApp.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const adminAppMod = require('firebase-admin/app');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getFirestore: getAdminFirestore } = require('firebase-admin/firestore');
      const existingAdminApps = adminAppMod.getApps();
      if (existingAdminApps.length > 0) {
        serverAdminDb = getAdminFirestore(existingAdminApps[0]);
        serverAdminDbReady = true;
        setCachedServerAdminFirestore(serverAdminDb);
        devLog.debug('✅ Server Firestore using firebase-admin (process-wide app)', undefined, 'firebase');
        return { app: null, auth: null, db: serverAdminDb };
      }

      // Single bridge to canonical Admin module (require keeps firebase-admin out of client bundles)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { adminDb } = require('./firebase-admin');
      if (adminDb) {
        serverAdminDb = adminDb;
        serverAdminDbReady = true;
        setCachedServerAdminFirestore(serverAdminDb);
        devLog.debug('✅ Server Firestore using lib/firebase-admin', undefined, 'firebase');
        return { app: null, auth: null, db: adminDb };
      }

      // require('./firebase-admin') may have initialized Admin as a side effect while this
      // webpack chunk still received a stale null export — getApps() is process-global.
      const appsAfterBridge = adminAppMod.getApps();
      if (appsAfterBridge.length > 0) {
        serverAdminDb = getAdminFirestore(appsAfterBridge[0]);
        serverAdminDbReady = true;
        setCachedServerAdminFirestore(serverAdminDb);
        devLog.debug(
          '✅ Server Firestore using firebase-admin (after bridge; process-wide app)',
          undefined,
          'firebase'
        );
        return { app: null, auth: null, db: serverAdminDb };
      }

      const fromGlobalAfterBridge = getCachedServerAdminFirestore();
      if (fromGlobalAfterBridge) {
        serverAdminDb = fromGlobalAfterBridge;
        serverAdminDbReady = true;
        devLog.debug(
          '✅ Server Firestore using firebase-admin (globalThis cache)',
          undefined,
          'firebase'
        );
        return { app: null, auth: null, db: serverAdminDb };
      }

      const runtimeAdminDb = tryRuntimeAdminFirestoreInit();
      if (runtimeAdminDb) {
        serverAdminDb = runtimeAdminDb;
        serverAdminDbReady = true;
        setCachedServerAdminFirestore(serverAdminDb);
        devLog.debug(
          '✅ Server Firestore using firebase-admin (runtime init)',
          undefined,
          'firebase'
        );
        return { app: null, auth: null, db: serverAdminDb };
      }

      warnServerFirebaseAdminFallbackOnce(
        '⚠️ Firebase Admin unavailable (adminDb null after load). Using client SDK for server-side operations. If FIREBASE_ADMIN_* is set in .env.local, restart pnpm dev. Otherwise add credentials from Firebase Console → Service accounts. Check logs for "Firebase Admin initialization failed". See env-template.txt.'
      );
      if (!app) {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      }
      firebaseDB = getFirestore(app);
      return { app, auth: null, db: firebaseDB };
    } catch (adminError) {
      devLog.error('❌ Firebase Admin bridge failed:', adminError, 'firebase');
      warnServerFirebaseAdminFallbackOnce(
        '⚠️ Falling back to client SDK for server-side operations (Admin bridge threw). Fix FIREBASE_ADMIN_* or see env-template.txt.'
      );

      if (!app) {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      }
      firebaseDB = getFirestore(app);
      return { app, auth: null, db: firebaseDB };
    }
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

/** Lazy so Node/Jest imports of this module (e.g. calculateProfileDataHash) do not require OAuthProvider. */
function getAppleOAuthProvider(): OAuthProvider {
  const p = new OAuthProvider('apple.com');
  p.addScope('email');
  p.addScope('name');
  return p;
}

// Global flag to prevent multiple simultaneous OAuth attempts (same provider)
let isSigningIn = false;
let signInPromise: Promise<User> | null = null;
let isAppleSigningIn = false;
let appleSignInPromise: Promise<User> | null = null;

type FederatedOAuthProvider = GoogleAuthProvider | OAuthProvider;

/**
 * Web: popup on Chromium-friendly browsers; full-page redirect on WebKit / iOS / macOS Safari.
 * Popup-blocked → one redirect fallback.
 */
async function signInWithOAuthWeb(
  auth: NonNullable<ReturnType<typeof getFirebaseAuth>>,
  provider: FederatedOAuthProvider,
  label: 'google' | 'apple'
): Promise<User> {
  const startedAtMs =
    typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
  const preferRedirect =
    typeof window !== 'undefined' && shouldPreferOAuthRedirect();

  if (preferRedirect) {
    devLog.debug(`OAuth ${label}: signInWithRedirect (WebKit-friendly)`);
    await signInWithRedirect(auth, provider);
    const elapsedMs =
      (typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now()) - startedAtMs;
    devLog.debug(`OAuth ${label}: redirect initiated in ${Math.round(elapsedMs)}ms`, 'firebase');
    throw new Error(AUTH_REDIRECT_INITIATED_MESSAGE);
  }

  try {
    devLog.debug(`OAuth ${label}: signInWithPopup`);
    const result = await signInWithPopup(auth, provider);
    const elapsedMs =
      (typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now()) - startedAtMs;
    devLog.debug(`OAuth ${label}: popup completed in ${Math.round(elapsedMs)}ms`, 'firebase');
    return result.user;
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === 'auth/popup-blocked') {
      devLog.warn(`OAuth ${label}: popup blocked; falling back to redirect`, undefined, 'firebase');
      await signInWithRedirect(auth, provider);
      const elapsedMs =
        (typeof performance !== 'undefined' && typeof performance.now === 'function'
          ? performance.now()
          : Date.now()) - startedAtMs;
      devLog.debug(`OAuth ${label}: redirect fallback initiated in ${Math.round(elapsedMs)}ms`, 'firebase');
      throw new Error(AUTH_REDIRECT_INITIATED_MESSAGE);
    }
    throw error;
  }
}

export const signInWithGoogle = async (): Promise<User> => {
  if (isSigningIn && signInPromise) return signInPromise;

  isSigningIn = true;
  signInPromise = (async () => {
    try {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error('Firebase not initialized');

      if (Capacitor.isNativePlatform()) {
        const { signInWithGoogleNative } = await import('./firebase-mobile');
        return await signInWithGoogleNative();
      }

      const user = await signInWithOAuthWeb(auth, googleProvider, 'google');
      await ensureUserDocumentFromAuth(user);
      return user;
    } catch (error: unknown) {
      if (!isAuthRedirectInitiatedError(error)) {
        devLog.error('Error signing in with Google:', error, 'firebase');
      }
      throw error;
    } finally {
      isSigningIn = false;
      signInPromise = null;
    }
  })();

  return signInPromise;
};

export const signInWithApple = async (): Promise<User> => {
  if (isAppleSigningIn && appleSignInPromise) return appleSignInPromise;

  isAppleSigningIn = true;
  appleSignInPromise = (async () => {
    try {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error('Firebase not initialized');

      if (Capacitor.isNativePlatform()) {
        throw Object.assign(new Error('Apple sign-in web only'), { code: 'fs/apple-web-only' });
      }

      const user = await signInWithOAuthWeb(auth, getAppleOAuthProvider(), 'apple');
      await ensureUserDocumentFromAuth(user);
      return user;
    } catch (error: unknown) {
      if (!isAuthRedirectInitiatedError(error)) {
        devLog.error('Error signing in with Apple:', error, 'firebase');
      }
      throw error;
    } finally {
      isAppleSigningIn = false;
      appleSignInPromise = null;
    }
  })();

  return appleSignInPromise;
};

/**
 * Grace window to handle popup-cancel races where auth state resolves shortly after dismiss.
 */
export async function waitForAuthenticatedSession(timeoutMs = 3000): Promise<boolean> {
  const auth = getFirebaseAuth();
  if (!auth) return false;
  if (auth.currentUser) return true;

  return await new Promise<boolean>((resolve) => {
    const timeout = setTimeout(() => {
      unsubscribe();
      resolve(false);
    }, timeoutMs);

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (!nextUser) return;
      clearTimeout(timeout);
      unsubscribe();
      resolve(true);
    });
  });
}

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

const SIGNUP_MAX_ATTEMPTS = 3;

function sleepSignupBackoff(attemptIndex: number): Promise<void> {
  const ms = 400 + attemptIndex * 250 + Math.floor(Math.random() * 400);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientAuthNetworkError(error: unknown): boolean {
  return (error as { code?: string })?.code === 'auth/network-request-failed';
}

function isTransientFirestoreWriteError(error: unknown): boolean {
  const code = (error as { code?: string })?.code;
  if (code === 'unavailable' || code === 'deadline-exceeded' || code === 'resource-exhausted') {
    return true;
  }
  const msg =
    error instanceof Error
      ? error.message
      : typeof (error as { message?: string })?.message === 'string'
        ? (error as { message: string }).message
        : '';
  const s = String(error);
  return msg.includes('offline') || s.includes('offline');
}

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
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase not initialized');

  let result: UserCredential | null = null;
  for (let attempt = 0; attempt < SIGNUP_MAX_ATTEMPTS; attempt++) {
    try {
      result = await createUserWithEmailAndPassword(auth, email, password);
      break;
    } catch (error: unknown) {
      const retry = isTransientAuthNetworkError(error) && attempt < SIGNUP_MAX_ATTEMPTS - 1;
      if (!retry) throw error;
      devLog.warn('createUser network flake; retrying signup', undefined, 'firebase');
      await sleepSignupBackoff(attempt);
    }
  }
  if (!result) throw new Error('Firebase not initialized');

  const user = result.user;

  for (let attempt = 0; attempt < SIGNUP_MAX_ATTEMPTS; attempt++) {
    try {
      await updateProfile(user, { displayName });
      break;
    } catch (error: unknown) {
      const retry = isTransientAuthNetworkError(error) && attempt < SIGNUP_MAX_ATTEMPTS - 1;
      if (!retry) throw error;
      devLog.warn('updateProfile network flake; retrying', undefined, 'firebase');
      await sleepSignupBackoff(attempt);
    }
  }

  const db = getFirebaseDB();
  if (db) {
    await ensureFirestoreConnection();

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

    for (let attempt = 0; attempt < SIGNUP_MAX_ATTEMPTS; attempt++) {
      try {
        await setDoc(doc(db, 'users', user.uid), userProfile);
        break;
      } catch (error: unknown) {
        const retry = isTransientFirestoreWriteError(error) && attempt < SIGNUP_MAX_ATTEMPTS - 1;
        if (!retry) throw error;
        devLog.warn('setDoc user profile flake; retrying', undefined, 'firebase');
        await sleepSignupBackoff(attempt);
      }
    }
  }
  return user;
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
    redirectResultPromise = null;
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

/** User-facing auth messages only. Never returns raw provider text (e.g. "Firebase: Error ..."). */
export const getAuthErrorMessage = (error: any): string => {
  const code = error?.code || '';
  const raw = typeof error?.message === 'string' ? error.message : '';
  const appleEnabled =
    process.env.NEXT_PUBLIC_APPLE_SIGNIN_ENABLED === 'true' ||
    process.env.NEXT_PUBLIC_APPLE_SIGNIN_ENABLED === '1';
  switch (code) {
    case 'auth/user-not-found': return 'No account found with this email.';
    case 'auth/wrong-password': return 'Incorrect password.';
    case 'auth/email-already-in-use': return 'An account with this email already exists. Try signing in instead.';
    case 'auth/invalid-credential':
      return appleEnabled
        ? 'Invalid email or password. Try "Forgot password?" or sign in with Google or Apple if you used those.'
        : 'Invalid email or password. Try "Forgot password?" or sign in with Google if you used that.';
    case 'auth/invalid-email': return 'Please enter a valid email address.';
    case 'auth/weak-password': return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/too-many-requests': return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/user-disabled': return 'This account has been disabled. Please contact support.';
    case 'auth/operation-not-allowed': return 'This sign-in method is not enabled. Please contact support.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again. If you use a VPN or ad blocker, try turning it off for this site or switch networks.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was closed before confirmation. If you already selected your account, please wait a moment—your sign-in may still complete automatically. Otherwise tap Sign in with Google again.';
    case 'auth/popup-blocked': return 'Pop-up was blocked by your browser. Please allow pop-ups and try again.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in was briefly interrupted. Please wait a moment; if nothing happens, tap Sign in with Google again.';
    case 'auth/unauthorized-domain':
      return 'Google or Apple sign-in is not available from this web address. Try email and password, or open the app from the main FutureSeer website.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists for this email with a different sign-in method. Try the original provider or email and password.';
    case 'fs/apple-web-only':
      return 'Sign in with Apple is available in your web browser. Open this site in Safari or Chrome to continue.';
    case 'auth/requires-recent-login': return 'Please sign in again to complete this action.';
    case 'auth/credential-already-in-use': return 'These credentials are already linked to another account.';
    case 'fs/captcha-no-site-key':
    case 'fs/captcha-server-config':
      return 'Sign-in is temporarily unavailable. Please try again shortly.';
    case 'fs/captcha-missing-script':
      return 'Security check could not load. Refresh the page and try again.';
    case 'fs/captcha-token-missing':
    case 'fs/captcha-verify-failed':
      return 'Security check failed. Please try again.';
    case 'fs/captcha-internal-error':
      return 'Security check is temporarily unavailable. Please try again.';
    case 'fs/captcha-adaptive-bypass':
      return 'Security checks are temporarily limited. You can continue signing in.';
    default:
      if (raw && (raw.includes('Firebase') || raw.includes('auth/'))) {
        return 'Sign-in failed. Please check your email and password and try again.';
      }
      return 'Something went wrong. Please try again.';
  }
};

export function isInvalidCredentialAuthError(error: { code?: string } | null | undefined): boolean {
  return error?.code === 'auth/invalid-credential';
}

/** Firebase codes that almost always mean bad user input, not infra or app bugs. */
const BENIGN_AUTH_USER_INPUT_CODES = new Set([
  'auth/invalid-email',
  'auth/weak-password',
  'auth/invalid-credential',
]);

export function isBenignAuthUserInputError(error: { code?: string } | null | undefined): boolean {
  const code = error?.code;
  return typeof code === 'string' && BENIGN_AUTH_USER_INPUT_CODES.has(code);
}

/** Firebase codes when the user closed the OAuth popup or cancelled — not app failures. */
const USER_DISMISSED_AUTH_CODES = new Set([
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
]);

export function isUserDismissedAuthError(error: { code?: string } | null | undefined): boolean {
  const code = error?.code;
  return typeof code === 'string' && USER_DISMISSED_AUTH_CODES.has(code);
}

export function isUnauthorizedDomainAuthError(error: { code?: string } | null | undefined): boolean {
  return error?.code === 'auth/unauthorized-domain';
}

export const isReturningUser = (user: User): boolean => {
  const ct = user.metadata?.creationTime ? new Date(user.metadata.creationTime).getTime() : 0;
  const lst = user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).getTime() : 0;
  return lst - ct > 60000;
};

/**
 * Single-flight redirect result: overlapping calls (e.g. React remount / duplicate init)
 * must not run firebaseGetRedirectResult concurrently — it can trigger Auth internal
 * "Pending promise was never set" assertions.
 */
let redirectResultPromise: Promise<UserCredential | null> | null = null;

export const getRedirectResult = async (): Promise<UserCredential | null> => {
  const auth = getFirebaseAuth();
  if (!auth) return null;
  if (!redirectResultPromise) {
    redirectResultPromise = firebaseGetRedirectResult(auth).catch((e: unknown) => {
      devLog.debug('getRedirectResult: no result or error', e, 'firebase');
      return null;
    });
  }
  return redirectResultPromise;
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
    // Firestore does not accept undefined; omit undefined fields
    const clean = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    ) as Partial<UserProfile>;
    const now = Date.now();
    const snap = await getDoc(userRef);

    let payload: Record<string, unknown>;

    if (!snap.exists()) {
      const auth = getFirebaseAuth();
      const cur = auth?.currentUser;
      const authMatches = cur?.uid === uid;
      const email = authMatches ? (cur?.email ?? '') : '';
      const displayNameFromClean =
        typeof clean.displayName === 'string' && clean.displayName.trim() !== ''
          ? clean.displayName
          : '';
      const displayName =
        displayNameFromClean || (authMatches ? (cur?.displayName ?? '').trim() : '') || '';

      payload = {
        uid,
        email,
        displayName,
        photoURL: '',
        country: 'IN',
        createdAt: now,
        lastLoginAt: now,
        isSubscribed: false,
        isTipped: false,
        referralCode: generateReferralCode(uid),
        referralCount: 0,
        freeMonthsRemaining: 1,
        subscriptionStatus: 'trial',
        ...clean,
        updatedAt: now,
      };
    } else {
      payload = {
        ...clean,
        updatedAt: now,
      };
    }

    await setDoc(userRef, payload as Partial<UserProfile>, { merge: true });
  } catch (error) {
    devLog.error('Error updating user profile:', error, 'firebase');
    throw error;
  }
};

/** Ensure Firestore users/{uid} exists after OAuth (Google/Apple) without email signup path. */
export async function ensureUserDocumentFromAuth(user: User): Promise<void> {
  try {
    await updateUserProfile(user.uid, {});
  } catch (e) {
    devLog.warn('ensureUserDocumentFromAuth failed (non-fatal)', e, 'firebase');
  }
}

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
  freeTrialTermsAccepted?: boolean;
  freeTrialTermsAcceptedAt?: number;
  subscriptionStatus?: string;
  noChargeAccount?: boolean;
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
  /** When true, main Seer may receive optional same-day headline titles as world context (server-side only). */
  seerIncludeNewsHeadlines?: boolean;
  timezone?: number | string;
  /** Admin-granted; synced from custom claims via set-claims. */
  specialUser?: boolean;
  special_user?: boolean;
  isSpecialUser?: boolean;
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
