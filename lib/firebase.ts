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
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, orderBy, getDocs, updateDoc, serverTimestamp, enableNetwork, disableNetwork, onSnapshot } from 'firebase/firestore';
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

// Client-side Firebase config (only public keys)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Lazy Firebase initialization
let app: any = null;
let firebaseAuth: any = null;
let firebaseDB: any = null;

const initializeFirebase = (): { app: any; auth: any; db: any } => {
  if (typeof window === 'undefined') {
    // Server-side, return null
    return { app: null, auth: null, db: null };
  }

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
      
             // Connect to Firestore with better error handling and network monitoring
       try {
         // Use standard default connection first
         firebaseDB = getFirestore(app);
         console.log('✅ Connected to default Firestore database');
         
         // Enable network connectivity monitoring
         enableNetwork(firebaseDB);
         console.log('✅ Firestore network enabled');
         
         // Test the connection with a simple operation
         const testDoc = doc(firebaseDB, '_test', 'connection');
         console.log('✅ Firestore connection test completed');
         
         // Monitor network connectivity
         const unsubscribe = onSnapshot(testDoc, 
           () => console.log('✅ Firestore real-time connection working'),
           (error) => {
             console.warn('⚠️ Firestore real-time connection issue:', error);
             if (error.message.includes('offline')) {
               console.log('🔄 Attempting to re-enable network...');
               enableNetwork(firebaseDB);
             }
           }
         );
         
         // Clean up listener after 5 seconds
         setTimeout(() => unsubscribe(), 5000);
         
       } catch (dbError) {
         console.warn('⚠️ Failed to connect to default database, trying "default" connection:', dbError);
         try {
           // Fallback to "default" database connection
           firebaseDB = getFirestore(app, 'default');
           console.log('✅ Connected to "default" Firestore database');
           
           // Enable network for fallback connection
           enableNetwork(firebaseDB);
           console.log('✅ Firestore network enabled (fallback)');
         } catch (fallbackError) {
           console.error('❌ Failed to connect to Firestore:', fallbackError);
           console.warn('⚠️ Firestore features will not work. Check your Firebase project settings.');
           return { app: null, auth: null, db: null };
         }
       }
      
      console.log('✅ Firebase initialized successfully');
      console.log('ℹ️ Note: Firestore connection will be tested on first use');
    } catch (error) {
      console.error('❌ Error initializing Firebase:', error);
      console.error('💡 Please check your Firebase configuration and environment variables.');
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

// Auth providers with enhanced configuration
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
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
  birthTime?: string; // ISO time string (HH:mm or HH:mm:ss)
  emailVerified?: boolean;
  providerData?: any[];
  lastSignInTime?: number;
  creationTime?: number;
  updatedAt?: number;
}

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

// Enhanced error handling
export const getAuthErrorMessage = (error: AuthError): string => {
  switch (error.code) {
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
    default:
      return 'An error occurred during authentication. Please try again.';
  }
};

// Enhanced auth functions
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase not initialized');

    const result: UserCredential = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
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
      throw docError;
    }
    
    if (!userDoc.exists()) {
      // Create new user profile
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
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
      } catch (profileError: any) {
        console.error('Error creating user profile:', {
          error: profileError.message,
          code: profileError.code,
          uid: user.uid,
          email: user.email
        });
        // Don't throw error, user can still use the app
      }
    } else {
      // Update last login and profile data
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          lastLoginAt: Date.now(),
          lastSignInTime: user.metadata.lastSignInTime ? parseInt(user.metadata.lastSignInTime) : Date.now(),
          emailVerified: user.emailVerified,
          displayName: user.displayName || userDoc.data().displayName,
          photoURL: user.photoURL || userDoc.data().photoURL,
        });
        console.log('Updated last login for user:', user.uid);
      } catch (updateError: any) {
        console.error('Error updating last login:', {
          error: updateError.message,
          code: updateError.code,
          uid: user.uid
        });
        // Don't throw error, user can still use the app
      }
    }
    
    return user;
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    throw new Error(getAuthErrorMessage(error));
  }
};

// Email/Password authentication
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase not initialized');

    const result: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    // Update last login
    const db = getFirebaseDB();
    if (db) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          lastLoginAt: Date.now(),
          lastSignInTime: user.metadata.lastSignInTime ? parseInt(user.metadata.lastSignInTime) : Date.now(),
        });
      } catch (error) {
        console.error('Error updating last login:', error);
      }
    }
    
    return user;
  } catch (error: any) {
    console.error('Error signing in with email:', error);
    throw new Error(getAuthErrorMessage(error));
  }
};

// Email/Password registration
export const signUpWithEmail = async (email: string, password: string, displayName: string): Promise<User> => {
  try {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase not initialized');

    const result: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    // Update profile with display name
    await updateProfile(user, { displayName });
    
    // Create user profile in Firestore
    const db = getFirebaseDB();
    if (db) {
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: displayName,
        photoURL: '',
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
      
      await setDoc(doc(db, 'users', user.uid), userProfile);
    }
    
    return user;
  } catch (error: any) {
    console.error('Error signing up with email:', error);
    throw new Error(getAuthErrorMessage(error));
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
    throw new Error(getAuthErrorMessage(error));
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase not initialized');

    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Network status check
export const checkNetworkStatus = async (): Promise<boolean> => {
  try {
    const db = getFirebaseDB();
    if (!db) return false;
    
    // Try to enable network
    await enableNetwork(db);
    return true;
  } catch (error) {
    console.warn('Network check failed:', error);
    return false;
  }
};

// Firestore functions
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const db = getFirebaseDB();
    if (!db) {
      console.warn('⚠️ Firestore not initialized, using local storage for user profile');
      return getLocalUserProfile(uid);
    }

    // Check network status first
    const isOnline = await checkNetworkStatus();
    if (!isOnline) {
      console.warn('⚠️ Network offline, using local storage for user profile');
      return getLocalUserProfile(uid);
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (docError: any) {
      if (docError.message && docError.message.includes('offline')) {
        console.log('🔄 Offline detected, falling back to local storage');
        return getLocalUserProfile(uid);
      }
      throw docError;
    }
  } catch (error: any) {
    console.error('Error getting user profile:', error);
    
    // If it's an offline error, try local storage
    if (error.message && error.message.includes('offline')) {
      console.log('🔄 Offline detected, falling back to local storage');
      return getLocalUserProfile(uid);
    }
    
    return null;
  }
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
      return getLocalAskHistory();
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
  } catch (error) {
    console.error('Error getting ask history:', error);
    // Fall back to local storage
    console.log('Falling back to local storage for ask history');
    return getLocalAskHistory();
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

export const updateUserProfile = async (uid: string, profileData: Partial<UserProfile>): Promise<void> => {
  try {
    // Always save to localStorage first for immediate availability
    const existingProfile = getLocalUserProfile(uid);
    const updatedProfile = {
      ...existingProfile,
      ...profileData,
      uid,
      updatedAt: Date.now(),
    };
    saveLocalUserProfile(uid, updatedProfile);
    console.log('✅ Profile saved to local storage for:', uid);

    // Try Firebase as secondary storage (don't block on failure)
    const db = getFirebaseDB();
    if (!db) {
      console.warn('⚠️ Firestore not initialized, using local storage only');
      return;
    }

    // Remove uid from profileData to avoid overwriting it
    const { uid: _, ...updateData } = profileData;
    
    try {
      // Set a timeout for Firebase operations
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Firebase timeout')), 5000)
      );
      
      const firebasePromise = updateDoc(doc(db, 'users', uid), {
        ...updateData,
        updatedAt: Date.now(),
      });
      
      await Promise.race([firebasePromise, timeoutPromise]);
      
      // Clear astro data cache if birth details were changed
      if (updateData.birthDate || updateData.birthPlace || updateData.birthTime) {
        console.log('Birth details updated, clearing astro data cache for user:', uid);
        clearAstroDataCache(uid);
      }
      
      console.log('✅ Successfully synced user profile to Firebase for:', uid);
    } catch (firebaseError: any) {
      // Log the error but don't throw since we saved to localStorage
      console.warn('⚠️ Firebase sync failed (data saved locally):', {
        error: firebaseError.message,
        code: firebaseError.code,
        uid: uid
      });
      
      // Check if it's a permissions error
      if (firebaseError.message && firebaseError.message.includes('permissions')) {
        console.info('ℹ️ Firebase permissions issue detected. Please deploy security rules.');
      }
    }
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    // Don't throw error since we saved to localStorage
  }
};

// Sync localStorage with Firebase
export const syncLocalStorageWithFirebase = async (uid: string): Promise<void> => {
  try {
    const db = getFirebaseDB();
    if (!db) {
      console.warn('⚠️ Firestore not initialized, cannot sync');
      return;
    }

    const localProfile = getLocalUserProfile(uid);
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
      console.log('✅ Successfully synced local profile to Firebase');
    } catch (syncError: any) {
      console.warn('⚠️ Failed to sync local profile to Firebase:', syncError.message);
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

// Legacy exports for backward compatibility
export const auth = getFirebaseAuth();
export const db = getFirebaseDB();

export default app;
