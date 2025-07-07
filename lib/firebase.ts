import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, orderBy, getDocs, updateDoc } from 'firebase/firestore';

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
      if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
        console.warn('Firebase configuration incomplete. Some features may not work.');
        return { app: null, auth: null, db: null };
      }

      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      firebaseAuth = getAuth(app);
      firebaseDB = getFirestore(app);
    } catch (error) {
      console.error('Error initializing Firebase:', error);
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

// Auth providers
export const googleProvider = new GoogleAuthProvider();

// User types
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isSubscribed: boolean;
  isTipped: boolean;
  trialStartTime?: number;
  trialEndTime?: number;
  createdAt: number;
  lastLoginAt: number;
}

export interface AskHistory {
  id: string;
  uid: string;
  question: string;
  aiSummary: string;
  scientificData: any;
  symbolicData: any;
  remedies: any[];
  timestamp: number;
  reflection?: string;
}

export interface Note {
  id: string;
  uid: string;
  title: string;
  content: string;
  color: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

// Auth functions
export const signInWithGoogle = async () => {
  try {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase not initialized');

    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user exists in Firestore
    const db = getFirebaseDB();
    if (!db) throw new Error('Firestore not initialized');

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
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
      };
      
      await setDoc(doc(db, 'users', user.uid), userProfile);
    } else {
      // Update last login
      await updateDoc(doc(db, 'users', user.uid), {
        lastLoginAt: Date.now(),
      });
    }
    
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase not initialized');

    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Firestore functions
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const db = getFirebaseDB();
    if (!db) return null;

    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export const saveAskHistory = async (askData: Omit<AskHistory, 'id'> & { uid: string }): Promise<string> => {
  try {
    const db = getFirebaseDB();
    if (!db) throw new Error('Firestore not initialized');

    const docRef = await addDoc(collection(db, 'askHistory'), askData);
    return docRef.id;
  } catch (error) {
    console.error('Error saving ask history:', error);
    throw error;
  }
};

export const getAskHistory = async (uid: string): Promise<AskHistory[]> => {
  try {
    const db = getFirebaseDB();
    if (!db) return [];

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
    return [];
  }
};

export const saveNote = async (noteData: Omit<Note, 'id'>): Promise<string> => {
  try {
    const db = getFirebaseDB();
    if (!db) throw new Error('Firestore not initialized');

    const docRef = await addDoc(collection(db, 'notes'), noteData);
    return docRef.id;
  } catch (error) {
    console.error('Error saving note:', error);
    throw error;
  }
};

export const getNotes = async (uid: string): Promise<Note[]> => {
  try {
    const db = getFirebaseDB();
    if (!db) return [];

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
    return [];
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