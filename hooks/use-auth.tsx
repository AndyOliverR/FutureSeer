'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { getFirebaseAuth, getFirebaseAuthSync, signInWithGoogle, signOutUser, getUserProfile, UserProfile } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getIdTokenResult } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isSuperadmin: boolean;
  isAdmin: boolean;
  isTestMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for test mode
const createMockUser = (): User => ({
  uid: 'test-user-123',
  email: 'test@futureseer.com',
  displayName: 'Test User',
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: Date.now().toString(),
    lastSignInTime: Date.now().toString(),
  },
  providerData: [],
  refreshToken: 'test-refresh-token',
  tenantId: null,
  phoneNumber: null,
  providerId: 'test',
  delete: async () => {},
  getIdToken: async () => 'test-id-token',
  getIdTokenResult: async () => ({
    authTime: new Date().toISOString(),
    claims: { superadmin: true, admin: true, testMode: true },
    expirationTime: new Date(Date.now() + 3600000).toISOString(),
    issuedAtTime: new Date().toISOString(),
    signInProvider: 'test',
    signInSecondFactor: null,
    token: 'test-token',
  }),
  reload: async () => {},
  toJSON: () => ({}),
});

// Mock user profile for test mode
const createMockUserProfile = (): UserProfile => ({
  uid: 'test-user-123',
  email: 'test@futureseer.com',
  displayName: 'Test User',
  photoURL: '',
  isSubscribed: true,
  isTipped: false,
  trialStartTime: Date.now(),
  trialEndTime: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year
  createdAt: Date.now(),
  lastLoginAt: Date.now(),
  emailVerified: true,
  providerData: [],
  lastSignInTime: Date.now(),
  creationTime: Date.now(),
  // Add some test data for orientation
  birthDate: '1990-01-01',
  birthTime: '12:00',
  birthPlace: 'Mumbai, India',
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);

  // Admin role checking function
  const checkAdminRoles = (email: string | null) => {
    if (!email) return { isSuperadmin: false, isAdmin: false };
    
    // Super admin (God Mode)
    if (email === 'andyrozario@hotmail.com') {
      return { isSuperadmin: true, isAdmin: true };
    }
    
    // Admin (Mary Mode)
    if (email === 'andyoliverrozario2@gmail.com') {
      return { isSuperadmin: false, isAdmin: true };
    }
    
    // Special user (no upgrade prompts)
    if (email === 'andyrozario7@gmail.com') {
      return { isSuperadmin: false, isAdmin: false };
    }
    
    return { isSuperadmin: false, isAdmin: false };
  };

  const signIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear test mode if active
      if (isTestMode) {
        localStorage.removeItem('testMode');
        localStorage.removeItem('testModeEmail');
        localStorage.removeItem('testClaims');
        setIsTestMode(false);
        setUser(null);
        setUserProfile(null);
        setIsSuperadmin(false);
        setIsAdmin(false);
        return;
      }
      
      await signOutUser();
      setUserProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      try {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error refreshing profile:', error);
      }
    }
  };

  useEffect(() => {
    const checkTestMode = () => {
      if (typeof window !== 'undefined') {
        const testMode = localStorage.getItem('testMode');
        return !!testMode;
      }
      return false;
    };

    const initializeAuth = async () => {
      const testModeActive = checkTestMode();
      
      if (testModeActive) {
        // Set up test mode
        setIsTestMode(true);
        const mockUser = createMockUser();
        const mockProfile = createMockUserProfile();
        
        setUser(mockUser);
        setUserProfile(mockProfile);
        setIsSuperadmin(true);
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      // Regular Firebase authentication
      try {
        const auth = await getFirebaseAuth();
        if (!auth) {
          setLoading(false);
          return;
        }
      
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);
        
        if (firebaseUser) {
          try {
            // Check for admin roles based on email
            const adminRoles = checkAdminRoles(firebaseUser.email);
            setIsSuperadmin(adminRoles.isSuperadmin);
            setIsAdmin(adminRoles.isAdmin);
            
            // Also check for Firebase custom claims (for future use)
            const token = await getIdTokenResult(firebaseUser, true);
            if (token.claims.superadmin) {
              setIsSuperadmin(true);
            }
            if (token.claims.admin) {
              setIsAdmin(true);
            }
          } catch (e) {
            // Fallback to email-based role checking
            const adminRoles = checkAdminRoles(firebaseUser.email);
            setIsSuperadmin(adminRoles.isSuperadmin);
            setIsAdmin(adminRoles.isAdmin);
          }
          
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } else {
          setUserProfile(null);
          setIsSuperadmin(false);
          setIsAdmin(false);
        }
        
        setLoading(false);
      });

      return () => unsubscribe();
      } catch (error) {
        console.error('Firebase initialization error:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signOut,
    refreshProfile,
    isSuperadmin,
    isAdmin,
    isTestMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
 