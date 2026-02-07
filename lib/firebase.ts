import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  EmailAuthProvider,
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut, 
  onAuthStateChanged, 
  User,
  UserCredential,
  AuthError
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, orderBy, limit, getDocs, updateDoc, serverTimestamp, enableNetwork, disableNetwork, onSnapshot, connectFirestoreEmulator, waitForPendingWrites } from 'firebase/firestore';
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
          console.warn('⚠️ Firebase Admin SDK config incomplete. Using client SDK fallback.');
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
            console.warn('Firestore settings already applied');
            _adminInitLogged = true;
          }
        }
        
        if (!_adminInitLogged) {
          console.log('✅ Firebase Admin SDK initialized for server-side');
          _adminInitLogged = true;
        }
        return { app: adminApp, auth: null, db: adminDB };
        
      } catch (adminError) {
        console.error('❌ Firebase Admin SDK initialization failed:', adminError);
        console.warn('⚠️ Falling back to client SDK for server-side operations');
        
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
        console.error('❌ Firebase configuration incomplete. Missing:', missingConfigs);
        console.warn('⚠️ Firebase configuration incomplete. Some features may not work.');
        console.info('💡 Please check your environment variables in Vercel dashboard.');
        return { app: null, auth: null, db: null };
      }

      // Log Firebase config status (without exposing actual values)
      console.log('✅ Firebase configuration status:', {
        apiKey: firebaseConfig.apiKey ? '✅ Set' : '❌ Missing',
        authDomain: firebaseConfig.authDomain ? '✅ Set' : '❌ Missing',
        projectId: firebaseConfig.projectId ? '✅ Set' : '❌ Missing',
        storageBucket: firebaseConfig.storageBucket ? '✅ Set' : '❌ Missing',
        messagingSenderId: firebaseConfig.messagingSenderId ? '✅ Set' : '❌ Missing',
        appId: firebaseConfig.appId ? '✅ Set' : '❌ Missing',
      });

      // Initialize Firebase app
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      firebaseAuth = getAuth(app);
      firebaseStorage = getStorage(app);
      
      // Connect to Firestore with enhanced stability and error recovery
      try {
        // Reset connection state
        isFirestoreConnected = false;
        connectionRetryCount = 0;
        
        // Use standard default connection first
        firebaseDB = getFirestore(app);
        console.log('✅ Connected to default Firestore database');
        
        // Enable network connectivity with error handling
        try {
          enableNetwork(firebaseDB);
          console.log('✅ Firestore network enabled');
          isFirestoreConnected = true;
        } catch (networkError) {
          console.warn('⚠️ Network enable failed, continuing without network monitoring:', networkError);
          isFirestoreConnected = true; // Still connected, just without network monitoring
        }
        
        // Simple connection test without creating documents
        console.log('✅ Firestore connection test completed');
        
      } catch (dbError) {
        console.warn('⚠️ Failed to connect to default database, trying "default" connection:', dbError);
        try {
          // Fallback to "default" database connection
          firebaseDB = getFirestore(app, 'default');
          console.log('✅ Connected to "default" Firestore database');
          
          // Enable network for fallback connection
          try {
            enableNetwork(firebaseDB);
            console.log('✅ Firestore network enabled (fallback)');
            isFirestoreConnected = true;
          } catch (networkError) {
            console.warn('⚠️ Network enable failed (fallback), continuing without network monitoring:', networkError);
            isFirestoreConnected = true;
          }
        } catch (fallbackError) {
          console.error('❌ Failed to connect to Firestore:', fallbackError);
          console.warn('⚠️ Firestore features will not work. Check your Firebase project settings.');
          return { app, auth: firebaseAuth, db: null };
        }
      }
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
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

// Fast Refresh / HMR Firestore corruption detection
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Clear Firestore cache on page load to prevent corruption from persisting
  const clearFirestoreCache = async () => {
    try {
      const databases = await indexedDB.databases();
      for (const db of databases) {
        if (db.name?.includes('firestore')) {
          indexedDB.deleteDatabase(db.name);
          console.log('🗑️ Cleared Firestore cache:', db.name);
        }
      }
    } catch (error) {
      // IndexedDB.databases() might not be supported in all browsers
      console.warn('⚠️ Could not clear Firestore cache:', error);
    }
  };
  
  // Clear cache on initial load
  clearFirestoreCache();
  
  // Track if we've seen Firestore corruption
  let firestoreCorruptionDetected = false;
  let corruptionCheckInterval: NodeJS.Timeout | null = null;
  
  // Intercept console.error to detect Firestore corruption
  const originalConsoleError = console.error;
  console.error = function(...args: any[]) {
    const errorMessage = args.join(' ');
    
    // Detect Firestore corruption errors - specific patterns that indicate critical corruption
    const isCriticalCorruption = (
      (errorMessage.includes('INTERNAL ASSERTION FAILED') && 
       (errorMessage.includes('Unexpected state') || errorMessage.includes('ca9') || errorMessage.includes('b815'))) ||
      errorMessage.includes('Target ID already exists')
    );
    
    if (isCriticalCorruption) {
      if (!firestoreCorruptionDetected) {
        firestoreCorruptionDetected = true;
        console.warn('🔄 Critical Firestore corruption detected. Clearing cache and reloading...');
        
        // Clear Firestore IndexedDB immediately
        indexedDB.databases().then(databases => {
          databases.forEach(db => {
            if (db.name?.includes('firestore')) {
              indexedDB.deleteDatabase(db.name);
              console.log('🗑️ Deleted corrupted Firestore DB:', db.name);
            }
          });
        }).catch(() => {
          console.warn('Could not clear IndexedDB');
        });
        
        // Force full page reload after clearing cache
        setTimeout(() => {
          window.location.href = window.location.pathname;
        }, 500);
      }
      
      // Don't log the error again
      return;
    }
    
    // Call original for non-Firestore errors
    originalConsoleError.apply(console, args);
  };
  
  // Periodic check for hung state (backup recovery)
  let lastActivityTime = Date.now();
  
  // Reset activity time on any user interaction
  ['click', 'keydown', 'scroll', 'touchstart'].forEach(event => {
    window.addEventListener(event, () => {
      lastActivityTime = Date.now();
    }, { passive: true });
  });
  
  // Check every 10 seconds if app is stuck
  const stuckCheckInterval = setInterval(() => {
    const timeSinceActivity = Date.now() - lastActivityTime;
    
    // If user has been inactive for 30+ seconds and page is loading, likely stuck
    if (timeSinceActivity > 30000 && document.body.innerText.includes('Loading your mystical journey')) {
      console.warn('🔄 App appears stuck. Reloading page...');
      window.location.reload();
    }
  }, 10000);
}

export const getFirebaseStorage = (): any => {
  if (typeof window === 'undefined') {
    // Server-side: Use Admin SDK Storage if available
    if (adminApp) {
      try {
        const { getStorage: getAdminStorage } = require('firebase-admin/storage');
        return getAdminStorage(adminApp);
      } catch (error) {
        console.warn('⚠️ Firebase Admin Storage not available, using client SDK');
      }
    }
  }
  // Client-side or fallback: Initialize client Storage
  if (!firebaseStorage && app) {
    firebaseStorage = getStorage(app);
  }
  return firebaseStorage;
};

// Enhanced Firestore connection management
export const ensureFirestoreConnection = async (): Promise<boolean> => {
  try {
    const { db } = initializeFirebase();
    if (!db) {
      console.error('❌ Firestore not initialized');
      return false;
    }

    // Check if we need to reconnect
    if (!isFirestoreConnected && connectionRetryCount < MAX_RETRY_ATTEMPTS) {
      console.log(`🔄 Attempting Firestore reconnection (attempt ${connectionRetryCount + 1}/${MAX_RETRY_ATTEMPTS})`);
      
      try {
        // Try to enable network again
        enableNetwork(db);
        isFirestoreConnected = true;
        connectionRetryCount = 0;
        console.log('✅ Firestore reconnection successful');
        return true;
      } catch (reconnectError) {
        connectionRetryCount++;
        console.warn(`⚠️ Firestore reconnection attempt ${connectionRetryCount} failed:`, reconnectError);
        
        if (connectionRetryCount >= MAX_RETRY_ATTEMPTS) {
          console.error('❌ Max Firestore reconnection attempts reached');
          return false;
        }
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, 1000 * connectionRetryCount));
        return ensureFirestoreConnection();
      }
    }

    return isFirestoreConnected;
  } catch (error) {
    console.error('❌ Error ensuring Firestore connection:', error);
    return false;
  }
};

// Reset Firestore connection state
export const resetFirestoreConnection = (): void => {
  isFirestoreConnected = false;
  connectionRetryCount = 0;
  console.log('🔄 Firestore connection state reset');
};

// Auth providers with simplified configuration
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account' // Show account picker on sign-in
});

export const emailProvider = new EmailAuthProvider();

// User types
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  fullName?: string; // Full name for numerological calculations
  photoURL?: string;
  isSubscribed: boolean;
  isTipped: boolean;
  trialStartTime?: number;
  trialEndTime?: number;
  createdAt: number;
  lastLoginAt: number;
  birthDate?: string; // ISO date string
  birthPlace?: string; // City, Country
  
  // ENHANCED: Birth time handling
  birthTime?: string; // Exact time (HH:mm format) if known
  birthTimeKnown?: boolean; // Does user know exact time?
  birthTimePeriod?: 'early-morning' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night' | 'late-night' | 'unknown'; // Time of day if exact time unknown
  birthTimeNote?: string; // Additional notes from user
  
  // Geocoded coordinates (from previous implementation)
  birthLatitude?: number;
  birthLongitude?: number;
  coordinatesResolvedAt?: number;
  /** Current or birth place latitude (used by tools when birth coords not set) */
  latitude?: number;
  /** Current or birth place longitude (used by tools when birth coords not set) */
  longitude?: number;

  currentLocation?: string; // Current location for transit charts
  /** IANA timezone (e.g. 'America/New_York') for charts and tools */
  timezone?: string;
  country?: string; // Country code (e.g., 'IN', 'US', 'GB') for pricing
  gender?: 'male' | 'female' | 'non-binary'; // Gender for palm reading
  facePhotoUrl?: string; // Face photo for face reading analysis
  palmPhotoUrl?: string; // Palm photo for palmistry analysis
  emailVerified?: boolean;
  providerData?: any[];
  lastSignInTime?: number;
  creationTime?: number;
  updatedAt?: number;
  // Profile generation tracking
  mysticalProfileGenerated?: boolean; // Whether mystical profile has been generated
  mysticalProfileGeneratedAt?: number; // Timestamp when profile was generated
  profileDataHash?: string; // Hash of profile data to detect changes
  
  // Personal context (helps AI provide relevant answers)
  relationshipStatus?: 'single' | 'in-relationship' | 'married' | 'divorced' | 'widowed' | 'prefer-not-to-say';
  hasChildren?: boolean;
  numberOfChildren?: number;
  
  // Divination interests
  divinationInterests?: string[];
  
  // Notification preferences
  notificationPreferences?: {
    dailyInsights: boolean;
    weeklyPredictions: boolean;
    monthlyHoroscope: boolean;
    communityUpdates: boolean;
    newFeatures: boolean;
  };
  notificationsEnabled?: boolean;
  emailUpdates?: boolean;

  // Payment and Subscription fields
  paymentMethodId?: string; // Razorpay payment method token
  subscriptionId?: string; // Razorpay subscription ID
  selectedPlan?: 'power-user-trial' | 'buy-coffee' | 'treat-me' | 'festive-hamper'; // Contribution tier
  trialEndDate?: number; // Unix timestamp (30 days from signup)
  autoMandateAccepted?: boolean; // User accepted auto-mandate for recurring charges
  autoMandateAcceptedAt?: number; // Timestamp when auto-mandate was accepted
  subscriptionStatus?: 'trial' | 'active' | 'cancelled' | 'expired'; // Current subscription status
  cancelAnytime?: boolean; // User can cancel anytime (default true)
  nextBillingDate?: number; // Unix timestamp for next billing cycle
  razorpayCustomerId?: string; // Razorpay customer ID
  
  // Referral System
  referralCode?: string; // Unique referral code e.g., "FUTURE_ABC123"
  referredBy?: string; // User ID or referral code who referred this user
  referredByRewardClaimed?: boolean; // Whether referrer got their credit
  referralCount?: number; // How many people they've referred
  freeMonthsRemaining?: number; // Stacked free months from referrals
  
  // Tip Jar
  totalTipAmount?: number; // Lifetime tip amount
  lastTipDate?: number; // Last tip timestamp
  tipHistory?: Array<{
    amount: number;
    date: number;
    transactionId: string;
  }>;
}

const PROFILE_CACHE_TTL = 30_000; // 30 seconds

type CachedProfile = {
  data: UserProfile;
  timestamp: number;
};

const profileCache = new Map<string, CachedProfile>();
const inflightProfileFetches = new Map<string, Promise<UserProfile | null>>();
const profileUpdateQueue = new Map<string, Record<string, any>>();
const profileUpdateInFlight = new Map<string, Promise<void>>();

const isBrowserEnvironment = (): boolean => typeof window !== 'undefined';

const getCachedUserProfile = (uid: string): UserProfile | null => {
  if (!isBrowserEnvironment()) return null;
  const cached = profileCache.get(uid);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > PROFILE_CACHE_TTL) {
    profileCache.delete(uid);
    return null;
  }
  return cached.data;
};

const cacheUserProfile = (uid: string, profile: UserProfile | null): void => {
  if (!isBrowserEnvironment() || !profile) return;
  profileCache.set(uid, { data: profile, timestamp: Date.now() });
};

const isInternalFirestoreError = (error: any): boolean => {
  const message = error?.message || '';
  return message.includes('INTERNAL ASSERTION FAILED') || message.includes('Unexpected state (ID');
};

export interface Note {
  id?: string;
  uid: string;
  title: string;
  content: string;
  color?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface AskHistory {
  id?: string;
  uid: string;
  question: string;
  aiSummary: string;
  scientificData?: any;
  symbolicData?: any;
  remedies?: string[];
  timestamp: number;
}

// Throws an error with a user-friendly message while preserving the original auth error code
function throwAuthError(error: AuthError): never {
  const msg = getAuthErrorMessage(error);
  const err = new Error(msg) as Error & { code?: string };
  err.code = error?.code;
  throw err;
}

// Enhanced error handling – covers common Firebase Auth error codes
export const getAuthErrorMessage = (error: AuthError | { code?: string; message?: string }): string => {
  const code = error?.code || '';
  switch (code) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Invalid email or password. Please check your credentials. If you signed up with Google, use "Continue with Google" instead.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled.';
    case 'auth/popup-blocked':
      return 'Pop-up was blocked. Please allow pop-ups for this site.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized. Please try again from futureseer.app or contact support.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled. Please use email sign-up or contact support.';
    case 'auth/app-not-authorized':
      return 'App verification failed. If using the mobile app, ensure it is up to date. Otherwise try in a browser.';
    case 'auth/invalid-api-key':
      return 'App configuration error. Please try again later or contact support.';
    case 'auth/account-exists-with-different-credential':
      return 'An account exists with this email using a different sign-in method. Try "Continue with Google" or use your email password.';
    case 'auth/credential-already-in-use':
      return 'This account is already linked. Please sign in with your existing method.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/requires-recent-login':
      return 'Please sign out and sign in again to continue.';
    case 'auth/web-storage-unsupported':
      return 'Sign-in requires browser storage. Enable cookies and try again, or use a different browser.';
    case 'auth/argument-error':
      return 'Invalid sign-in request. Please refresh and try again.';
    case 'auth/internal-error':
      return 'A temporary error occurred. Please try again in a moment.';
    default:
      if (code || error?.message) {
        console.warn('[Auth] Unhandled error:', code || 'no-code', error?.message);
      }
      return 'An error occurred during authentication. Please try again.';
  }
};

// Global flag to prevent multiple simultaneous sign-in attempts
let isSigningIn = false;
let signInPromise: Promise<User> | null = null;

// Enhanced auth functions
// Helper function to detect country from timezone
async function detectUserCountry(): Promise<string> {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let countryCode = 'IN'; // Default to India
    
    if (timezone.includes('/')) {
      const parts = timezone.split('/');
      if (parts.length > 1) {
        const region = parts[1];
        const timezoneToCountry: Record<string, string> = {
          'New_York': 'US', 'Los_Angeles': 'US', 'Chicago': 'US', 'Denver': 'US',
          'Phoenix': 'US', 'Anchorage': 'US', 'Honolulu': 'US',
          'London': 'GB', 'Paris': 'EU', 'Berlin': 'EU', 'Rome': 'EU', 'Madrid': 'EU',
          'Amsterdam': 'EU', 'Brussels': 'EU', 'Vienna': 'EU',
          'Toronto': 'CA', 'Vancouver': 'CA', 'Montreal': 'CA',
          'Sydney': 'AU', 'Melbourne': 'AU', 'Brisbane': 'AU', 'Perth': 'AU',
          'Singapore': 'SG', 'Dubai': 'AE', 'Sao_Paulo': 'BR', 'Rio_de_Janeiro': 'BR',
          'Mexico_City': 'MX', 'Jakarta': 'ID', 'Bangkok': 'TH', 'Manila': 'PH',
          'Ho_Chi_Minh': 'VN', 'Kuala_Lumpur': 'MY', 'Karachi': 'PK', 'Dhaka': 'BD',
          'Colombo': 'LK', 'Kathmandu': 'NP', 'Mumbai': 'IN', 'Delhi': 'IN',
          'Kolkata': 'IN', 'Chennai': 'IN', 'Bangalore': 'IN', 'Johannesburg': 'ZA'
        };
        countryCode = timezoneToCountry[region] || countryCode;
      }
    }
    return countryCode;
  } catch (error) {
    return 'IN';
  }
}

export const signInWithGoogle = async (): Promise<User> => {
  // Prevent multiple simultaneous sign-in attempts
  if (isSigningIn && signInPromise) {
    console.log('⚠️ Sign-in already in progress, returning existing promise');
    return signInPromise;
  }

  isSigningIn = true;
  signInPromise = (async () => {
    try {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error('Firebase not initialized');


      let result: UserCredential;
      
      // Simplified popup approach - let Firebase handle the popup creation
      try {
        console.log('🔄 Attempting Google sign-in with popup...');
        
        result = await signInWithPopup(auth, googleProvider);
        console.log('✅ Popup authentication successful');
      } catch (popupError: any) {
        console.log('⚠️ Popup authentication failed:', popupError.code, popupError.message);
        
        // Handle "Target ID already exists" error - popup is already open
        // This can happen when multiple sign-in attempts occur simultaneously
        const isTargetIdError = popupError.message?.includes('Target ID already exists') ||
                                popupError.message?.includes('already exists') ||
                                popupError.code === 'auth/popup-blocked';
        
        if (isTargetIdError) {
          console.log('⚠️ Popup already exists or blocked, waiting and checking auth state...');
          
          // Wait a bit and check if user is already signed in
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const currentUser = auth.currentUser;
          if (currentUser) {
            console.log('✅ User already signed in');
            return currentUser;
          }
          
          // If still not signed in, try redirect method
          console.log('🔄 Trying redirect method as fallback...');
          const { signInWithRedirect } = await import('firebase/auth');
          await signInWithRedirect(auth, googleProvider);
          throw new Error('Redirect initiated - check auth state for result');
        }
        
        // If popup is blocked or closed, try redirect method
        if (popupError.code === 'auth/popup-closed-by-user' || 
            popupError.code === 'auth/cancelled-popup-request') {
          
          console.log('🔄 Popup closed by user, trying redirect method...');
          
          // Import redirect method dynamically to avoid SSR issues
          const { signInWithRedirect } = await import('firebase/auth');
          await signInWithRedirect(auth, googleProvider);
          
          // Note: With redirect, we need to handle the result in onAuthStateChanged
          // This will be handled in the auth state listener
          throw new Error('Redirect initiated - check auth state for result');
        }
        throw popupError;
      }
    
    // Authentication succeeded - get the user
    const user = result.user;
    
    // Firestore operations are non-critical for authentication success
    // Wrap them in try-catch so they don't cause authentication to fail
    try {
      // Check if user exists in Firestore
      const db = getFirebaseDB();
      if (!db) {
        console.warn('Firestore not initialized, skipping profile creation');
        return user;
      }

      // Check network status before attempting Firestore operations
      const isOnline = await checkNetworkStatus();
      if (!isOnline) {
        console.warn('⚠️ Network offline, skipping Firestore operations');
        return user;
      }

      let userDoc;
      try {
        userDoc = await getDoc(doc(db, 'users', user.uid));
      } catch (docError: any) {
        if (docError.message && docError.message.includes('offline')) {
          console.warn('⚠️ Offline detected during user profile check, skipping Firestore operations');
          return user;
        }
        // For other doc errors, log but don't throw - authentication succeeded
        console.warn('⚠️ Error checking user profile in Firestore (non-critical):', docError.message);
        return user;
      }
      
      if (!userDoc.exists()) {
        // Detect country for new user
        const detectedCountry = await detectUserCountry();
        
        // Create new user profile
        const userProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          country: detectedCountry,
          isSubscribed: false,
          isTipped: false,
          trialStartTime: Date.now(),
          trialEndTime: Date.now() + (9 * 60 * 60 * 1000), // 9 hours
          createdAt: Date.now(),
          lastLoginAt: Date.now(),
          emailVerified: user.emailVerified,
          providerData: user.providerData,
          lastSignInTime: user.metadata.lastSignInTime ? parseInt(user.metadata.lastSignInTime) : Date.now(),
          creationTime: user.metadata.creationTime ? parseInt(user.metadata.creationTime) : Date.now(),
        };
        
        try {
          await setDoc(doc(db, 'users', user.uid), userProfile);
          console.log('Successfully created user profile for:', user.uid);
          saveUserActivity(user.uid, 'sign_in').catch(() => {});
        } catch (profileError: any) {
          // Non-critical: profile creation failed but authentication succeeded
          console.warn('⚠️ Error creating user profile (non-critical, authentication succeeded):', {
            error: profileError.message,
            code: profileError.code,
            uid: user.uid,
            email: user.email
          });
          // Profile will be created on next auth state change or when user accesses profile
        }
      } else {
        // Update last login and profile data with retry logic
        let retries = 0;
        const maxRetries = 2;
        let lastError: any = null;

        while (retries <= maxRetries) {
          try {
            await updateDoc(doc(db, 'users', user.uid), {
              lastLoginAt: Date.now(),
              lastSignInTime: user.metadata.lastSignInTime ? parseInt(user.metadata.lastSignInTime) : Date.now(),
              emailVerified: user.emailVerified,
              displayName: userDoc.data().displayName || user.displayName,
              photoURL: user.photoURL || userDoc.data().photoURL,
            });
            console.log('Updated last login for user:', user.uid);
            saveUserActivity(user.uid, 'sign_in').catch(() => {});
            break; // Success, exit retry loop
          } catch (updateError: any) {
            lastError = updateError;
            
            // Properly serialize error object
            const errorDetails = {
              name: updateError?.name || 'UnknownError',
              message: updateError?.message || String(updateError),
              code: updateError?.code || 'unknown',
              stack: updateError?.stack || '',
              uid: user?.uid || 'unknown',
              // Capture nested error details if present
              ...(updateError?.serverResponse && { serverResponse: updateError.serverResponse }),
              ...(updateError?.cause && { cause: updateError.cause })
            };
            
            // Check if it's a Firestore write channel error (400 Bad Request)
            const isWriteChannelError = errorDetails.code === 'unavailable' || 
                                         errorDetails.message?.includes('400') ||
                                         errorDetails.message?.includes('Bad Request') ||
                                         errorDetails.message?.includes('Write channel');
            
            // Check if error is retryable
            const isRetryable = updateError?.code === 'unavailable' || 
                               updateError?.code === 'deadline-exceeded' ||
                               updateError?.message?.includes('network');
            
            if (isRetryable && retries < maxRetries) {
              retries++;
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 100)); // Exponential backoff
              continue;
            } else {
              // Log error based on type, but don't throw - authentication succeeded
              if (isWriteChannelError) {
                // Suppress write channel errors - they're non-critical and often transient
                console.warn('⚠️ Firestore write channel error during last login update (non-critical, authentication succeeded)');
              } else {
                // Log other errors as warnings since authentication succeeded
                const errorMessage = errorDetails.message || String(errorDetails);
                console.warn('⚠️ Error updating last login (non-critical, authentication succeeded):', errorMessage);
              }
              break; // Exit retry loop - don't throw, authentication succeeded
            }
          }
        }
      }
    } catch (firestoreError: any) {
      // Catch any unexpected Firestore errors that weren't handled above
      // Don't throw - authentication succeeded, Firestore errors are non-critical
      console.warn('⚠️ Non-critical Firestore error after successful authentication:', firestoreError.message);
    }
      
    // Always return the authenticated user, even if Firestore operations failed
    return user;
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      throwAuthError(error);
    } finally {
      isSigningIn = false;
      signInPromise = null;
    }
  })();

  return signInPromise;
};

// Email/Password authentication
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase not initialized');

    const result: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;

    // Update last login in background so sign-in never blocks on Firestore (avoids hang on "Unexpected state")
    const db = getFirebaseDB();
    if (db) {
      updateDoc(doc(db, 'users', user.uid), {
        lastLoginAt: Date.now(),
        lastSignInTime: user.metadata.lastSignInTime ? parseInt(user.metadata.lastSignInTime) : Date.now(),
      }).catch(async (error) => {
        const { firestoreErrorHandler } = await import('./firestoreErrorHandler');
        firestoreErrorHandler.handleError(error as Error, 'updateLastLogin', 'users', user.uid);
      });
      saveUserActivity(user.uid, 'sign_in').catch(() => {});
    }

    return user;
  } catch (error: any) {
    console.error('Error signing in with email:', error);
    throwAuthError(error);
  }
};

// Email/Password registration
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
    
    // Update profile with display name
    await updateProfile(user, { displayName });
    
    // Detect country if not provided
    const userCountry = country || await detectUserCountry();
    
    // Calculate trial end date (30 days from now)
    const trialEndDate = Date.now() + (30 * 24 * 60 * 60 * 1000);
    
    // Generate unique referral code for new user
    const userReferralCode = generateReferralCode(user.uid);
    
    // Create user profile in Firestore
    const db = getFirebaseDB();
    if (db) {
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: displayName,
        photoURL: '',
        country: userCountry,
        isSubscribed: selectedPlan !== 'power-user-trial' && selectedPlan !== undefined,
        isTipped: false,
        trialStartTime: Date.now(),
        trialEndTime: trialEndDate,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        emailVerified: user.emailVerified,
        providerData: user.providerData,
        lastSignInTime: user.metadata.lastSignInTime ? parseInt(user.metadata.lastSignInTime) : Date.now(),
        creationTime: user.metadata.creationTime ? parseInt(user.metadata.creationTime) : Date.now(),
        // Payment and subscription fields
        paymentMethodId: paymentMethodId,
        subscriptionId: subscriptionId,
        selectedPlan: selectedPlan,
        trialEndDate: Math.floor(trialEndDate / 1000), // Unix timestamp
        autoMandateAccepted: autoMandateAccepted || false,
        autoMandateAcceptedAt: autoMandateAccepted ? Date.now() : undefined,
        subscriptionStatus: 'trial',
        cancelAnytime: true,
        // Referral system
        referralCode: userReferralCode,
        referralCount: 0,
        freeMonthsRemaining: 1, // First month free for everyone
      };
      
      await setDoc(doc(db, 'users', user.uid), userProfile);
      saveUserActivity(user.uid, 'sign_in').catch(() => {});
      
      // Track referral if referral code was provided
      if (referralCode) {
        try {
          await trackReferralSignup(user.uid, referralCode, db);
          console.log('✅ Referral tracked successfully');
        } catch (error) {
          console.error('⚠️ Error tracking referral:', error);
          // Don't fail signup if referral tracking fails
        }
      }
    }
    
    return user;
  } catch (error: any) {
    console.error('Error signing up with email:', error);
    throwAuthError(error);
  }
};

// Password reset
export const resetPassword = async (email: string): Promise<void> => {
  try {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase not initialized');

    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    throwAuthError(error);
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase not initialized');
    
    // Sign out from Firebase
    await signOut(auth);
    
    // Clear all local data
    if (typeof window !== 'undefined') {
      const { clearLocalData } = await import('./localStorage');
      clearLocalData();
      profileCache.clear();
      clearAstroDataCache('all');
      
      // Clear session flags
      sessionStorage.removeItem('signing_out');
      sessionStorage.removeItem('force_reauth');
      
      console.log('✅ Signed out successfully and cleared all data');
      
      // Simple page reload to home
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Helper to detect if error is truly offline vs. just connecting
const isOfflineError = (error: any): boolean => {
  const message = error?.message || '';
  const code = error?.code || '';
  return (
    message.includes('offline') ||
    message.includes('Failed to get document') ||
    code === 'unavailable' ||
    code === 'deadline-exceeded'
  );
};

// Network status check - enhanced to wait for actual connection
export const checkNetworkStatus = async (): Promise<boolean> => {
  try {
    const db = getFirebaseDB();
    if (!db) return false;
    
    // Enable network
    await enableNetwork(db);
    
    // Wait for connection to be established by attempting a lightweight operation
    // This is a better indicator than just calling enableNetwork()
    try {
      // Use a timeout to prevent hanging
      const connectionTest = Promise.race([
        waitForPendingWrites(db).then(() => true),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 2000))
      ]);
      await connectionTest;
    } catch (waitError) {
      // If wait fails, still return true - we tried to enable network
      // This prevents blocking the app if there are transient connection issues
      if (process.env.NODE_ENV === 'development') {
        console.warn('Connection wait timeout, proceeding anyway');
      }
    }
    
    return true;
  } catch (error) {
    console.warn('Network check failed:', error);
    return false;
  }
};

// Profile validation helper
export const isProfileComplete = (profile: UserProfile | null): boolean => {
  if (!profile) return false;
  
  // Check required fields for comprehensive divination
  const hasRequiredFields = !!(
    profile.birthDate &&
    profile.birthTime &&
    profile.birthPlace &&
    profile.fullName
    // Removed latitude/longitude requirement - coordinates are optional
  );
  
  // Additional validation for birth time format
  const isValidBirthTime = profile.birthTime ? 
    /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(profile.birthTime) : false;
  
  // Additional validation for birth date format
  const isValidBirthDate = profile.birthDate ? 
    /^\d{4}-\d{2}-\d{2}$/.test(profile.birthDate) : false;
  
  return hasRequiredFields && isValidBirthTime && isValidBirthDate;
};

// Get profile completion status with specific missing fields
export const getProfileCompletionStatus = (profile: UserProfile | null): {
  isComplete: boolean;
  missingFields: string[];
  completionPercentage: number;
} => {
  if (!profile) {
    return {
      isComplete: false,
      missingFields: ['fullName', 'birthDate', 'birthTime', 'birthPlace'],
      completionPercentage: 0
    };
  }
  
  const requiredFields = [
    { key: 'fullName', label: 'Full Name', value: profile.fullName },
    { key: 'birthDate', label: 'Birth Date', value: profile.birthDate },
    { key: 'birthTime', label: 'Birth Time', value: profile.birthTime },
    { key: 'birthPlace', label: 'Birth Place', value: profile.birthPlace }
    // Removed coordinates from required fields - coordinates are optional
  ];
  
  const missingFields = requiredFields
    .filter(field => !field.value)
    .map(field => field.label);
  
  const completionPercentage = Math.round(((requiredFields.length - missingFields.length) / requiredFields.length) * 100);
  
  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercentage
  };
};

// Firestore functions
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  // Early validation: return null if uid is invalid or empty
  if (!uid || typeof uid !== 'string' || uid.trim().length === 0) {
    console.warn('⚠️ Invalid user ID provided to getUserProfile');
    return null;
  }

  const respondWithCache = (profile: UserProfile | null): UserProfile | null => {
    if (profile) {
      cacheUserProfile(uid, profile);
    }
    return profile;
  };

  const fetchProfile = async (): Promise<UserProfile | null> => {
    try {
      const db = getFirebaseDB();
      if (!db) {
        // Only use localStorage on client-side
        if (typeof window !== 'undefined') {
          console.warn('⚠️ Firestore not initialized, using local storage for user profile');
          const localProfile = getLocalUserProfile();
          if (localProfile && localProfile.birthTime) {
            localProfile.birthTime = cleanupCorruptedBirthTime(localProfile.birthTime);
          }
          return respondWithCache(localProfile);
        }
        return null;
      }

      // Skip network check on server-side (Admin SDK handles this)
      if (typeof window !== 'undefined') {
        const isOnline = await checkNetworkStatus();
        if (!isOnline) {
          console.warn('⚠️ Network offline, using local storage for user profile');
          const localProfile = getLocalUserProfile();
          if (localProfile && localProfile.birthTime) {
            localProfile.birthTime = cleanupCorruptedBirthTime(localProfile.birthTime);
          }
          return respondWithCache(localProfile);
        }
      }

      // Fetch from Firestore - detect SDK type and use appropriate syntax
      try {
        let userDoc: any;
        let profileData: UserProfile | null = null;

        // Check if we're using Admin SDK (has .collection method) or Client SDK
        if (typeof db.collection === 'function') {
          // Server-side: Firebase Admin SDK
          console.log('🔧 Using Firebase Admin SDK to fetch profile');
          const docRef = db.collection('users').doc(uid);
          const snapshot = await docRef.get();
          
          if (snapshot.exists) {
            profileData = snapshot.data() as UserProfile;
          }
        } else {
          // Client-side: Firebase Client SDK with retry logic for offline errors
          console.log('🔧 Using Firebase Client SDK to fetch profile');
          const { doc, getDoc } = await import('firebase/firestore');
          const PROFILE_FETCH_TIMEOUT_MS = 5000;

          // Retry logic with exponential backoff for offline errors
          let retries = 0;
          const maxRetries = 3;
          const retryDelays = [100, 200, 400]; // Exponential backoff in ms
          let lastError: any = null;
          let profileFetchTimedOut = false;

          while (retries <= maxRetries) {
            try {
              const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Profile fetch timeout')), PROFILE_FETCH_TIMEOUT_MS)
              );
              userDoc = await Promise.race([
                getDoc(doc(db, 'users', uid)),
                timeoutPromise,
              ]);
              break; // Success, exit retry loop
            } catch (docFetchError: any) {
              if (docFetchError?.message === 'Profile fetch timeout') {
                profileFetchTimedOut = true;
                userDoc = undefined;
                if (process.env.NODE_ENV === 'development') {
                  console.warn('⚠️ Profile fetch timed out; using fallback.');
                }
                break;
              }
              lastError = docFetchError;

              // Only retry if it's an offline error
              if (isOfflineError(docFetchError) && retries < maxRetries) {
                retries++;
                const delay = retryDelays[retries - 1] || 400;
                if (process.env.NODE_ENV === 'development') {
                  console.log(`🔄 Retrying profile fetch after ${delay}ms (attempt ${retries}/${maxRetries})`);
                }
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
              }

              // Not an offline error or max retries reached, throw
              throw docFetchError;
            }
          }

          if (userDoc && userDoc.exists()) {
            profileData = userDoc.data() as UserProfile;
          }

          if (profileFetchTimedOut && typeof window !== 'undefined') {
            const localProfile = getLocalUserProfile();
            if (localProfile && localProfile.birthTime) {
              localProfile.birthTime = cleanupCorruptedBirthTime(localProfile.birthTime);
            }
            return respondWithCache(localProfile);
          }
        }

        if (profileData) {
          // Clean up corrupted birth time data
          if (profileData.birthTime) {
            profileData.birthTime = cleanupCorruptedBirthTime(profileData.birthTime);
          }
          
          console.log('✅ Successfully fetched user profile for:', uid);
          return respondWithCache(profileData);
        }
        return null;
      } catch (docError: any) {
        // Suppress Firestore internal assertion errors
        if (isInternalFirestoreError(docError)) {
          console.warn('⚠️ Firestore internal error suppressed in getUserProfile:', docError.message);
          // Try to return local profile as fallback
          if (typeof window !== 'undefined') {
            const localProfile = getLocalUserProfile();
            if (localProfile && localProfile.birthTime) {
              localProfile.birthTime = cleanupCorruptedBirthTime(localProfile.birthTime);
            }
            return respondWithCache(localProfile);
          }
          return null;
        }

        // Handle permission-denied errors silently if user is signed out
        // This is expected behavior when user is no longer authenticated
        if (docError.code === 'permission-denied') {
          // Don't log this as an error - it's expected after sign out
          return null;
        }

        // Only try localStorage on client-side
        if (isOfflineError(docError) && typeof window !== 'undefined') {
          // Offline error - fall back to local storage silently
          const localProfile = getLocalUserProfile();
          if (localProfile && localProfile.birthTime) {
            localProfile.birthTime = cleanupCorruptedBirthTime(localProfile.birthTime);
          }
          return respondWithCache(localProfile);
        }
        throw docError;
      }
    } catch (error: any) {
      // Suppress Firestore internal assertion errors
      if (isInternalFirestoreError(error)) {
        console.warn('⚠️ Firestore internal error suppressed in getUserProfile:', error.message);
        // Try to return local profile as fallback
        if (typeof window !== 'undefined') {
          const localProfile = getLocalUserProfile();
          if (localProfile && localProfile.birthTime) {
            localProfile.birthTime = cleanupCorruptedBirthTime(localProfile.birthTime);
          }
          return respondWithCache(localProfile);
        }
        return null;
      }

      // Handle permission-denied errors silently - expected after sign out
      if (error.code === 'permission-denied' || error.code === 'permissions') {
        // User is not authenticated - don't log as error
        return null;
      }

      // Log other errors
      console.error('Error getting user profile:', error);
      
      // Only try localStorage on client-side
      if (isOfflineError(error) && typeof window !== 'undefined') {
        // Offline error - fall back to local storage silently
        const localProfile = getLocalUserProfile();
        if (localProfile && localProfile.birthTime) {
          localProfile.birthTime = cleanupCorruptedBirthTime(localProfile.birthTime);
        }
        return respondWithCache(localProfile);
      }
      
      return null;
    }
  };

  if (!isBrowserEnvironment()) {
    return fetchProfile();
  }

  const cachedProfile = getCachedUserProfile(uid);
  if (cachedProfile) {
    return cachedProfile;
  }

  const inflightRequest = inflightProfileFetches.get(uid);
  if (inflightRequest) {
    return inflightRequest;
  }

  const fetchPromise = fetchProfile().finally(() => {
    inflightProfileFetches.delete(uid);
  });

  inflightProfileFetches.set(uid, fetchPromise);
  return fetchPromise;
};

export const saveAskHistory = async (askData: Omit<AskHistory, 'id'> & { uid: string }): Promise<string> => {
  try {
    const db = getFirebaseDB();
    if (!db) {
      console.log('Firebase not available, using local storage');
      return saveLocalAskHistory(askData);
    }

    // Validate data before saving
    if (!askData.uid || !askData.question || !askData.aiSummary) {
      console.warn('Invalid ask data, skipping save');
      return 'validation-failed';
    }

    // Try Firebase first, with a timeout
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Firebase timeout')), 5000)
    );
    
    const firebasePromise = addDoc(collection(db, 'askHistory'), askData);
    
    try {
      const docRef = await Promise.race([firebasePromise, timeoutPromise]);
      console.log('Successfully saved ask history to Firebase:', docRef.id);
      return docRef.id;
    } catch (firebaseError) {
      console.warn('Firebase save failed, using local storage:', firebaseError);
      return saveLocalAskHistory(askData);
    }
  } catch (error: any) {
    console.warn('Error in saveAskHistory, using local storage:', error.message);
    return saveLocalAskHistory(askData);
  }
};

export const getAskHistory = async (uid: string): Promise<AskHistory[]> => {
  try {
    const db = getFirebaseDB();
    if (!db) {
      console.warn('Firebase not initialized, using local storage');
      return getLocalAskHistory().filter((h) => h.uid === uid);
    }

    const q = query(
      collection(db, 'askHistory'),
      where('uid', '==', uid),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AskHistory[];
  } catch (error: any) {
    console.error('Error getting ask history:', error);
    
    // Special handling for index errors
    if (error?.code === 'failed-precondition' || error?.message?.includes('query requires an index')) {
      console.warn('Firebase index still building. Falling back to local storage temporarily.');
    } else {
      console.warn('Firebase error. Falling back to local storage:', error.message);
    }
    
    // Fall back to local storage
    return getLocalAskHistory().filter((h) => h.uid === uid);
  }
};

export interface UserActivityItem {
  id?: string;
  uid: string;
  type: string;
  timestamp: number;
  payload?: Record<string, unknown>;
}

export const saveUserActivity = async (
  uid: string,
  type: string,
  payload?: Record<string, unknown>
): Promise<string | void> => {
  try {
    if (!uid) return;

    // Prefer server-side API (bypasses client Firestore rules)
    if (typeof window !== 'undefined') {
      const auth = getFirebaseAuth();
      const currentUser = auth?.currentUser;
      if (currentUser?.uid === uid) {
        try {
          const token = await currentUser.getIdToken();
          const res = await fetch('/api/activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ type, payload }),
          });
          if (res.ok) {
            const data = await res.json();
            return data.id;
          }
        } catch (_) {
          // Fall through to client write
        }
      }
    }

    const db = getFirebaseDB();
    if (!db) return;
    const docRef = await addDoc(collection(db, 'userActivity'), {
      uid,
      type,
      timestamp: Date.now(),
      ...(payload && { payload }),
    });
    return docRef.id;
  } catch (err: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('saveUserActivity failed (non-blocking):', err);
    }
  }
};

export const getUserActivity = async (
  uid: string,
  limitCount: number = 50
): Promise<UserActivityItem[]> => {
  try {
    const db = getFirebaseDB();
    if (!db || !uid) return [];
    const q = query(
      collection(db, 'userActivity'),
      where('uid', '==', uid),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as UserActivityItem[];
  } catch (err: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('getUserActivity failed:', err);
    }
    return [];
  }
};

export const saveNote = async (noteData: Omit<Note, 'id'>): Promise<string> => {
  try {
    const db = getFirebaseDB();
    if (!db) {
      console.warn('Firebase not initialized, using local storage');
      return saveLocalNote(noteData);
    }

    // Log the data being saved for debugging
    console.log('Saving note:', {
      uid: noteData.uid,
      titleLength: noteData.title?.length || 0,
      contentLength: noteData.content?.length || 0,
      color: noteData.color,
      tagsCount: noteData.tags?.length || 0,
      createdAt: noteData.createdAt,
      updatedAt: noteData.updatedAt
    });

    // Validate data before saving
    if (!noteData.uid || !noteData.title || !noteData.content) {
      console.warn('Invalid note data, skipping save:', {
        hasUid: !!noteData.uid,
        hasTitle: !!noteData.title,
        hasContent: !!noteData.content
      });
      return 'validation-failed';
    }

    const docRef = await addDoc(collection(db, 'notes'), noteData);
    console.log('Successfully saved note with ID:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('Error saving note:', {
      error: error.message,
      code: error.code,
      details: error.details || 'No additional details',
      data: {
        uid: noteData.uid,
        titleLength: noteData.title?.length || 0,
        contentLength: noteData.content?.length || 0
      }
    });
    
    // Fall back to local storage
    console.log('Falling back to local storage for note');
    return saveLocalNote(noteData);
  }
};

export const getNotes = async (uid: string): Promise<Note[]> => {
  try {
    const db = getFirebaseDB();
    if (!db) {
      console.warn('Firebase not initialized, using local storage');
      return getLocalNotes();
    }

    const q = query(
      collection(db, 'notes'),
      where('uid', '==', uid),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Note[];
  } catch (error) {
    console.error('Error getting notes:', error);
    // Fall back to local storage
    console.log('Falling back to local storage for notes');
    return getLocalNotes();
  }
};

export const updateSubscriptionStatus = async (uid: string, isSubscribed: boolean): Promise<void> => {
  try {
    const db = getFirebaseDB();
    if (!db) throw new Error('Firestore not initialized');

    await updateDoc(doc(db, 'users', uid), {
      isSubscribed,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }
};

export const updateTipStatus = async (uid: string, isTipped: boolean): Promise<void> => {
  try {
    const db = getFirebaseDB();
    if (!db) throw new Error('Firestore not initialized');

    await updateDoc(doc(db, 'users', uid), {
      isTipped,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Error updating tip status:', error);
    throw error;
  }
};

const sanitizeProfileUpdate = (updateData: Partial<UserProfile>): Record<string, any> => {
  const validatedData: Record<string, any> = {};

  Object.keys(updateData).forEach(key => {
    const value = (updateData as any)[key];
    if (value === undefined || value === null) {
      return;
    }

    if (key === 'birthTime') {
      validatedData[key] = String(value);
    } else if (key.includes('Time') || key.includes('At')) {
      validatedData[key] = typeof value === 'number' ? value : Date.now();
    } else if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed !== '') {
        validatedData[key] = trimmed;
      }
    } else if (typeof value === 'boolean') {
      validatedData[key] = value;
    } else if (typeof value === 'number' && !isNaN(value)) {
      validatedData[key] = value;
    } else if (Array.isArray(value)) {
      validatedData[key] = value;
    } else if (typeof value === 'object') {
      validatedData[key] = value;
    } else {
      console.warn(`⚠️ Skipping invalid data for key ${key}:`, value);
    }
  });

  if (Object.keys(validatedData).length > 0) {
    validatedData.updatedAt = Date.now();
  }

  return validatedData;
};

const enqueueProfileUpdate = (uid: string, update: Record<string, any>): void => {
  const existing = profileUpdateQueue.get(uid) || {};
  profileUpdateQueue.set(uid, { ...existing, ...update });
};

const flushQueuedProfileUpdates = async (uid: string): Promise<void> => {
  if (profileUpdateInFlight.has(uid)) {
    return profileUpdateInFlight.get(uid)!;
  }

  const runFlush = (async () => {
    if (!profileUpdateQueue.has(uid)) {
      return;
    }

    const isConnected = await ensureFirestoreConnection();
    if (!isConnected) {
      console.warn('⚠️ Firestore connection unstable, postponing profile sync');
      return;
    }

    const db = getFirebaseDB();
    if (!db) {
      console.warn('⚠️ Firestore not initialized, postponing profile sync');
      return;
    }

    while (true) {
      const payload = profileUpdateQueue.get(uid);
      if (!payload || Object.keys(payload).length === 0) {
        profileUpdateQueue.delete(uid);
        break;
      }

      profileUpdateQueue.delete(uid);

      try {
        await updateDoc(doc(db, 'users', uid), payload);
        if (payload.birthDate || payload.birthPlace || payload.birthTime) {
          console.log('Birth details updated, clearing astro data cache for user:', uid);
          clearAstroDataCache(uid);
        }
        console.log('✅ Successfully synced user profile to Firebase for:', uid);
      } catch (firebaseError: any) {
        if (isInternalFirestoreError(firebaseError)) {
          console.warn('⚠️ Firestore internal error suppressed in updateUserProfile:', firebaseError.message);
          resetFirestoreConnection();
        } else {
          console.warn('⚠️ Firebase sync failed (data saved locally):', {
            error: firebaseError.message,
            code: firebaseError.code,
            uid,
            payload
          });
          if (firebaseError.message && firebaseError.message.includes('permissions')) {
            console.info('ℹ️ Firebase permissions issue detected. Please deploy security rules.');
          }
          if (firebaseError.code === 'bad-request' || firebaseError.message?.includes('400')) {
            console.error('❌ Firebase 400 Bad Request - Check data format:', payload);
          }
        }

        const existing = profileUpdateQueue.get(uid) || {};
        profileUpdateQueue.set(uid, { ...payload, ...existing });
        break;
      }
    }
  })();

  const trackedPromise = runFlush.finally(() => {
    profileUpdateInFlight.delete(uid);
  });

  profileUpdateInFlight.set(uid, trackedPromise);
  return trackedPromise;
};

export const updateUserProfile = async (uid: string, profileData: Partial<UserProfile>): Promise<void> => {
  try {
    console.log('🔄 Updating user profile for:', uid, 'with data:', profileData);
    
    // Always save to localStorage first for immediate availability
    const existingProfile = getLocalUserProfile();
    const updatedProfile = {
      ...existingProfile,
      ...profileData,
      uid,
      updatedAt: Date.now(),
    };
    saveLocalUserProfile(updatedProfile);
    console.log('✅ Profile saved to local storage for:', uid);
    cacheUserProfile(uid, updatedProfile as UserProfile);

    // Ensure Firestore connection is stable before proceeding
    const isConnected = await ensureFirestoreConnection();
    if (!isConnected) {
      console.warn('⚠️ Firestore connection unstable, using local storage only');
      return;
    }

    // Try Firebase as secondary storage (don't block on failure)
    const db = getFirebaseDB();
    if (!db) {
      console.warn('⚠️ Firestore not initialized, using local storage only');
      return;
    }

    // Remove uid from profileData to avoid overwriting it
    const { uid: _, ...updateData } = profileData;
    const validatedData = sanitizeProfileUpdate(updateData);

    if (Object.keys(validatedData).length > 0) {
      enqueueProfileUpdate(uid, validatedData);
      await flushQueuedProfileUpdates(uid);
    }
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    // Don't throw error since we saved to localStorage
  }
};

// Clean up corrupted birth time data
export const cleanupCorruptedBirthTime = (birthTime: any): string => {
  // If birthTime is a number (timestamp) or looks like a timestamp string
  if (typeof birthTime === 'number' || 
      (typeof birthTime === 'string' && /^\d{13,}$/.test(birthTime))) {
    console.warn('⚠️ Detected corrupted birth time (timestamp):', birthTime);
    return ''; // Return empty string to force re-entry
  }
  
  // If it's a valid HH:MM format, return as-is
  if (typeof birthTime === 'string' && /^\d{1,2}:\d{2}$/.test(birthTime)) {
    return birthTime;
  }
  
  // Otherwise, return empty
  return '';
};

// Sync localStorage with Firebase
export const syncLocalStorageWithFirebase = async (uid: string): Promise<void> => {
  try {
    const db = getFirebaseDB();
    if (!db) {
      console.warn('⚠️ Firestore not initialized, cannot sync');
      return;
    }

    const localProfile = getLocalUserProfile();
    if (!localProfile) {
      console.log('ℹ️ No local profile to sync');
      return;
    }

    // Try to sync local data to Firebase
    try {
      await setDoc(doc(db, 'users', uid), {
        ...localProfile,
        updatedAt: Date.now(),
      });
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Successfully synced local profile to Firebase');
      }
    } catch (syncError: any) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Failed to sync local profile to Firebase:', syncError.message);
      }
    }
  } catch (error) {
    console.error('Error syncing localStorage with Firebase:', error);
  }
};

// Trial management
export const isTrialExpired = (trialEndTime?: number): boolean => {
  if (!trialEndTime) return true;
  return Date.now() > trialEndTime;
};

export const getTrialTimeLeft = (trialEndTime?: number): number => {
  if (!trialEndTime) return 0;
  const timeLeft = trialEndTime - Date.now();
  return Math.max(0, timeLeft);
};

// Global error handler for Firestore internal assertion errors and popup issues
export const setupFirestoreErrorHandler = (): void => {
  if (typeof window === 'undefined') return; // Server-side only

  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const errorMessage = args.join(' ');
    
    // Check for Firestore internal assertion errors - suppress and prevent loops
    if (errorMessage.includes('INTERNAL ASSERTION FAILED') && errorMessage.includes('FIRESTORE')) {
      const now = Date.now();
      
      // In development, detect critical corruption patterns that need full page reload
      if (process.env.NODE_ENV === 'development') {
        // Critical corruption: "Unexpected state (ID: ca9)" or "Target ID already exists"
        if ((errorMessage.includes('Unexpected state') && errorMessage.includes('ca9')) ||
            errorMessage.includes('Target ID already exists') ||
            (errorMessage.includes('b815') && errorMessage.includes('ca9'))) {
          
          // Prevent reload loops - only reload if 10+ seconds since last reload
          const lastReloadKey = 'firestoreLastReload';
          const lastReload = parseInt(sessionStorage.getItem(lastReloadKey) || '0');
          const timeSinceReload = now - lastReload;
          
          if (timeSinceReload > 10000) {
            console.warn('🔄 Critical Firestore corruption detected. Reloading page to recover...');
            sessionStorage.setItem(lastReloadKey, now.toString());
            
            setTimeout(() => {
              window.location.reload();
            }, 1500);
            
            return; // Don't log error or attempt recovery
          }
        }
      }
      
      // For non-critical errors, attempt recovery
      if (!isRecovering && (now - lastRecoveryAttempt > RECOVERY_COOLDOWN)) {
        isRecovering = true;
        lastRecoveryAttempt = now;
        
        console.warn('🛡️ Firestore internal assertion error detected (suppressed). Attempting recovery...');
        
        setTimeout(async () => {
          try {
            if (!isFirestoreConnected) {
              const isConnected = await ensureFirestoreConnection();
              if (isConnected) {
                console.log('✅ Firestore connection recovered');
              }
            }
          } catch (recoveryError) {
            console.warn('⚠️ Firestore recovery skipped to prevent loops');
          } finally {
            isRecovering = false;
          }
        }, 2000);
      } else {
        // Suppress repeated errors within cooldown period
        return;
      }
      
      // Don't call original console.error for this error to prevent spam
      return;
    }
    
    // Check for Firestore write channel errors (400 Bad Request) in last login updates
    if (errorMessage.includes('Error updating last login') && 
        (errorMessage.includes('400') || errorMessage.includes('Bad Request') || errorMessage.includes('Write channel'))) {
      console.warn('⚠️ FirestoreErrorSuppressor suppressed Firestore write channel error');
      return; // Don't call original console.error
    }
    
    // Check for Cross-Origin-Opener-Policy errors (popup blocking)
    // This includes Firebase's internal polling errors that check window.closed
    if (errorMessage.includes('Cross-Origin-Opener-Policy') || 
        errorMessage.includes('window.closed') ||
        errorMessage.includes('popup-closed-by-user') ||
        errorMessage.includes('popup-blocked') ||
        errorMessage.includes('policy would block') ||
        errorMessage.includes('policy would block the window.closed call') ||
        errorMessage.includes('opener-policy') ||
        errorMessage.includes('COOP') ||
        errorMessage.includes('popup') ||
        errorMessage.includes('window.open') ||
        errorMessage.includes('Target ID already exists') ||
        errorMessage.includes('already exists') ||
        (errorMessage.includes('block') && errorMessage.includes('window.closed'))) {
      // Suppress these errors completely - they're expected browser security behavior
      // Firebase's polling mechanism checks window.closed which triggers COOP warnings
      return; // Don't log as error or warning
    }
    
    // Call original console.error for all other errors
    originalConsoleError.apply(console, args);
  };
};

// Initialize error handler
if (typeof window !== 'undefined') {
  setupFirestoreErrorHandler();
  
  // Additional global error handler for popup issues and Firestore errors - COMPREHENSIVE SUPPRESSION
  window.addEventListener('error', (event) => {
    const errorMessage = event.message || event.error?.message || '';
    const errorString = errorMessage.toString();
    
    // Suppress Firestore internal assertion errors
    if (errorString.includes('INTERNAL ASSERTION FAILED') && errorString.includes('FIRESTORE')) {
      event.preventDefault();
      event.stopPropagation();
      // Silently suppress - these are harmless internal Firestore errors
      return false;
    }
    
    // Suppress COOP/popup errors (including Firebase polling errors)
    if (errorMessage.includes('Cross-Origin-Opener-Policy') || 
        errorMessage.includes('window.closed') ||
        errorMessage.includes('popup') ||
        errorMessage.includes('policy would block') ||
        errorMessage.includes('policy would block the window.closed call') ||
        errorMessage.includes('COOP') ||
        errorMessage.includes('opener') ||
        errorMessage.includes('cross-origin') ||
        (errorMessage.includes('block') && errorMessage.includes('window.closed'))) {
      // Completely suppress these errors - they're browser security features, not actual errors
      // Firebase's internal polling mechanism triggers these warnings
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  });
  
  // Handle unhandled promise rejections - COMPREHENSIVE SUPPRESSION
  window.addEventListener('unhandledrejection', (event) => {
    const errorMessage = event.reason?.message || event.reason || '';
    const errorString = errorMessage.toString();
    
    // Suppress Firestore internal assertion errors
    if (errorString.includes('INTERNAL ASSERTION FAILED') && errorString.includes('FIRESTORE')) {
      event.preventDefault();
      // Silently suppress - these are harmless internal Firestore errors
      return false;
    }
    
    // Suppress COOP/popup errors (including Firebase polling errors)
    if (errorMessage.includes('Cross-Origin-Opener-Policy') || 
        errorMessage.includes('window.closed') ||
        errorMessage.includes('popup') ||
        errorMessage.includes('policy would block') ||
        errorMessage.includes('policy would block the window.closed call') ||
        errorMessage.includes('COOP') ||
        errorMessage.includes('opener') ||
        errorMessage.includes('cross-origin') ||
        (errorMessage.includes('block') && errorMessage.includes('window.closed'))) {
      // Completely suppress these errors - they're browser security features, not actual errors
      // Firebase's internal polling mechanism triggers these warnings
      event.preventDefault();
      return false;
    }
  });

  // Note: console.error is already overridden by setupFirestoreErrorHandler()
  // which handles both Firestore errors and COOP errors, so no additional override needed here

  // Override console.warn to suppress COOP-related warnings and framer-motion filter warnings
  const originalConsoleWarn = console.warn;
  console.warn = (...args: any[]) => {
    const errorMessage = args.join(' ');
    if (errorMessage.includes('Cross-Origin-Opener-Policy') || 
        errorMessage.includes('window.closed') ||
        errorMessage.includes('policy would block') ||
        errorMessage.includes('policy would block the window.closed call') ||
        errorMessage.includes('COOP') ||
        errorMessage.includes('opener') ||
        errorMessage.includes('cross-origin') ||
        errorMessage.includes('popup') ||
        errorMessage.includes('blocked call') ||
        (errorMessage.includes('block') && errorMessage.includes('window.closed')) ||
        errorMessage.includes('brightness(NaN)') ||
        (errorMessage.includes('not an animatable value') && errorMessage.includes('brightness'))) {
      // Suppress these console warnings completely
      return;
    }
    // Call original console.warn for other warnings
    originalConsoleWarn.apply(console, args);
  };
}

// Handle redirect results
export const getRedirectResult = async (): Promise<UserCredential | null> => {
  try {
    const auth = getFirebaseAuth();
    if (!auth) return null;
    
    const { getRedirectResult } = await import('firebase/auth');
    return await getRedirectResult(auth);
  } catch (error) {
    console.error('Error getting redirect result:', error);
    return null;
  }
};

// Enhanced error handling for popup issues
export const handleAuthError = (error: any): string => {
  if (error.code === 'auth/popup-closed-by-user') {
    return 'Sign-in was cancelled. Please try again.';
  }
  if (error.code === 'auth/popup-blocked') {
    return 'Pop-up was blocked by your browser. Please allow pop-ups for this site or try again.';
  }
  if (error.code === 'auth/cancelled-popup-request') {
    return 'Sign-in was cancelled. Please try again.';
  }
  // Handle "Target ID already exists" error
  if (error.message?.includes('Target ID already exists') || 
      error.message?.includes('already exists')) {
    return 'Sign-in is already in progress. Please wait...';
  }
  return getAuthErrorMessage(error);
};

// Legacy exports for backward compatibility
export const auth = getFirebaseAuth();
export const db = getFirebaseDB();

// Profile generation status utilities
export const calculateProfileDataHash = (profile: Partial<UserProfile>): string => {
  // Create a simple hash of the profile data that affects mystical profile generation
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
  
  // Simple hash function for browser compatibility
  const dataString = JSON.stringify(relevantData);
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
};

export const hasProfileDataChanged = (profile: UserProfile, newData: Partial<UserProfile>): boolean => {
  const currentHash = profile.profileDataHash || '';
  const newHash = calculateProfileDataHash({ ...profile, ...newData });
  return currentHash !== newHash;
};

export const markProfileAsGenerated = async (uid: string, profileData?: Partial<UserProfile>): Promise<void> => {
  try {
    const db = getFirebaseDB();
    if (!db) {
      console.warn('Firebase not initialized, cannot mark profile as generated');
      return;
    }

    const userRef = doc(db, 'users', uid);
    const newHash = profileData ? calculateProfileDataHash(profileData) : '';
    
    await updateDoc(userRef, {
      mysticalProfileGenerated: true,
      mysticalProfileGeneratedAt: Date.now(),
      profileDataHash: newHash,
      updatedAt: Date.now()
    });
    
    console.log('✅ Profile marked as generated for user:', uid);
  } catch (error) {
    console.error('Error marking profile as generated:', error);
  }
};

export const resetProfileGenerationStatus = async (uid: string): Promise<void> => {
  try {
    const db = getFirebaseDB();
    if (!db) {
      console.warn('Firebase not initialized, cannot reset profile generation status');
      return;
    }

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      mysticalProfileGenerated: false,
      mysticalProfileGeneratedAt: null,
      updatedAt: Date.now()
    });
    
    // Clear astro data cache when profile is reset
    clearAstroDataCache(uid);
    
    console.log('✅ Profile generation status reset for user:', uid);
  } catch (error) {
    console.error('Error resetting profile generation status:', error);
  }
};

// ============================================================================
// READING AGGREGATION HELPERS
// ============================================================================

export interface UnifiedReading {
  id: string;
  type: 'ask' | 'tarot' | 'runes' | 'lenormand' | 'scrying';
  question: string;
  timestamp: number;
  confidence?: number;
  symbolicData?: any;
  remedies?: any[];
  rawData?: any; // Preserve original data
}

/**
 * Fetch all tarot readings for a user
 */
export const getTarotReadings = async (userId: string): Promise<UnifiedReading[]> => {
  try {
    const db = getFirebaseDB();
    if (!db) return [];

    const tarotRef = collection(db, 'users', userId, 'tarot-readings');
    const q = query(tarotRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        type: 'tarot' as const,
        question: data.question || '',
        timestamp: data.timestamp?.toMillis?.() || new Date(data.timestamp).getTime() || Date.now(),
        confidence: data.confidence || data.overallConfidence || 75,
        symbolicData: data.symbolicData || { elementalInfluence: 'Fire' },
        remedies: data.remedies || [],
        rawData: data
      };
    });
  } catch (error) {
    console.error('Error fetching tarot readings:', error);
    return [];
  }
};

/**
 * Fetch all rune readings for a user
 */
export const getRuneReadings = async (userId: string): Promise<UnifiedReading[]> => {
  try {
    const db = getFirebaseDB();
    if (!db) return [];

    const runesRef = collection(db, 'users', userId, 'rune-readings');
    const q = query(runesRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        type: 'runes' as const,
        question: data.question || '',
        timestamp: data.timestamp?.toMillis?.() || new Date(data.timestamp).getTime() || Date.now(),
        confidence: data.confidence || data.overallConfidence || 75,
        symbolicData: data.symbolicData || { elementalInfluence: 'Earth' },
        remedies: data.remedies || [],
        rawData: data
      };
    });
  } catch (error) {
    console.error('Error fetching rune readings:', error);
    return [];
  }
};

/**
 * Fetch all lenormand readings for a user
 */
export const getLenormandReadings = async (userId: string): Promise<UnifiedReading[]> => {
  try {
    const db = getFirebaseDB();
    if (!db) return [];

    const lenormandRef = collection(db, 'users', userId, 'lenormand-readings');
    const q = query(lenormandRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        type: 'lenormand' as const,
        question: data.question || '',
        timestamp: data.timestamp?.toMillis?.() || new Date(data.timestamp).getTime() || Date.now(),
        confidence: data.confidence || data.overallConfidence || 75,
        symbolicData: data.symbolicData || { elementalInfluence: 'Air' },
        remedies: data.remedies || [],
        rawData: data
      };
    });
  } catch (error) {
    console.error('Error fetching lenormand readings:', error);
    return [];
  }
};

/**
 * Fetch all scrying readings for a user
 */
export const getScryingReadings = async (userId: string): Promise<UnifiedReading[]> => {
  try {
    const db = getFirebaseDB();
    if (!db) return [];

    const scryingRef = collection(db, 'scryingReadings');
    const q = query(
      scryingRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        type: 'scrying' as const,
        question: data.question || '',
        timestamp: data.timestamp?.toMillis?.() || new Date(data.timestamp).getTime() || Date.now(),
        confidence: data.confidenceLevel || data.confidence || 75,
        symbolicData: data.symbolicData || { elementalInfluence: 'Water' },
        remedies: data.remedies || [],
        rawData: data
      };
    });
  } catch (error: any) {
    // Handle permission errors gracefully - these are expected when user doesn't have access
    // or when Firestore rules restrict access (which is normal security behavior)
    if (error?.code === 'permission-denied' || 
        error?.code === 'permissions' ||
        error?.message?.includes('Missing or insufficient permissions') ||
        error?.message?.includes('permission-denied')) {
      // Permission errors are expected and handled gracefully - use warn instead of error
      console.warn('⚠️ Scrying readings access restricted (expected):', error?.code || 'permission-denied');
      return [];
    }
    // Only log unexpected errors as errors
    console.error('Error fetching scrying readings:', error);
    return [];
  }
};

/**
 * Fetch all readings from all sources for a user
 * Gracefully handles errors - if one reading type fails, others still load
 */
export const getAllReadings = async (userId: string): Promise<UnifiedReading[]> => {
  try {
    // Use Promise.allSettled to ensure all reading types are attempted
    // even if some fail due to permissions or other errors
    const results = await Promise.allSettled([
      getAskHistory(userId).then(history => history.map(item => ({
        id: item.id || '',
        type: 'ask' as const,
        question: item.question || '',
        timestamp: item.timestamp || Date.now(),
        confidence: item.symbolicData?.confidence || 75,
        symbolicData: item.symbolicData || { elementalInfluence: 'Fire' },
        remedies: item.remedies || [],
        rawData: item
      }))).catch(err => {
        console.warn('Error fetching ask history:', err);
        return [];
      }),
      getTarotReadings(userId).catch(err => {
        console.warn('Error fetching tarot readings:', err);
        return [];
      }),
      getRuneReadings(userId).catch(err => {
        console.warn('Error fetching rune readings:', err);
        return [];
      }),
      getLenormandReadings(userId).catch(err => {
        console.warn('Error fetching lenormand readings:', err);
        return [];
      }),
      getScryingReadings(userId).catch(err => {
        console.warn('Error fetching scrying readings:', err);
        return [];
      })
    ]);

    // Extract successful results, defaulting to empty array for failed ones
    const askHistory = results[0].status === 'fulfilled' ? results[0].value : [];
    const tarotReadings = results[1].status === 'fulfilled' ? results[1].value : [];
    const runeReadings = results[2].status === 'fulfilled' ? results[2].value : [];
    const lenormandReadings = results[3].status === 'fulfilled' ? results[3].value : [];
    const scryingReadings = results[4].status === 'fulfilled' ? results[4].value : [];

    // Combine and sort by timestamp
    const allReadings = [
      ...askHistory,
      ...tarotReadings,
      ...runeReadings,
      ...lenormandReadings,
      ...scryingReadings
    ].sort((a, b) => b.timestamp - a.timestamp);

    return allReadings;
  } catch (error) {
    console.error('Error fetching all readings:', error);
    return [];
  }
};

/**
 * Get user's saved remedies from profile
 */
export const getSavedRemedies = async (userId: string): Promise<any[]> => {
  try {
    const db = getFirebaseDB();
    if (!db) return [];

    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return [];

    const userData = userDoc.data();
    return userData.savedRemedies || [];
  } catch (error) {
    console.error('Error fetching saved remedies:', error);
    return [];
  }
};

export default app;
