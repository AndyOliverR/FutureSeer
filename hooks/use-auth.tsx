'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import { getFirebaseAuth, signInWithGoogle, signOutUser, getUserProfile, UserProfile, ensureFirestoreConnection, getRedirectResult } from '@/lib/firebase';
import { onAuthStateChanged, getIdTokenResult } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isSuperadmin: boolean;
  isAdmin: boolean;
  isSpecialUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSpecialUser, setIsSpecialUser] = useState(false);

  // Admin role checking function
  const checkAdminRoles = (email: string | null) => {
    if (!email) return { isSuperadmin: false, isAdmin: false, isSpecialUser: false };
    
    // Super admin (God Mode)
    if (email === 'andyrozario@hotmail.com') {
      return { isSuperadmin: true, isAdmin: true, isSpecialUser: false };
    }
    
    // Admin (Mary Mode)
    if (email === 'andyoliverrozario2@gmail.com') {
      return { isSuperadmin: false, isAdmin: true, isSpecialUser: false };
    }
    
    return { isSuperadmin: false, isAdmin: false, isSpecialUser: false };
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
      // Clear user profile state first
      setUserProfile(null);
      
      // Then sign out from Firebase (this also clears localStorage now)
      await signOutUser();
      
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const refreshProfile = useCallback(async (): Promise<void> => {
    if (user) {
      try {
        // Fetch first, then update - don't clear existing profile to prevent UI flash
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error refreshing profile:', error);
        throw error;
      }
    }
  }, [user]);

  useEffect(() => {
    const initializeAuth = async () => {
      // Ensure Firestore connection in the background so auth state is not blocked
      void ensureFirestoreConnection().catch((connectionError) => {
        console.warn('⚠️ Firestore connection check failed during auth initialization:', connectionError);
      });

      // Check for redirect result first
      try {
        const redirectResult = await getRedirectResult();
        if (redirectResult) {
          console.log('✅ Redirect authentication completed successfully');
        }
      } catch (redirectError) {
        console.log('ℹ️ No redirect result or redirect error:', redirectError);
      }

      // Regular Firebase authentication (no longer blocked on Firestore)
      const auth = getFirebaseAuth();
      if (!auth) {
        setLoading(false);
        return;
      }
      
      const PROFILE_LOAD_TIMEOUT_MS = 8000;
      const PROFILE_RETRY_DELAY_MS = 2000;
      const MAX_PROFILE_RETRIES = 2;

      const loadProfileWithRetry = async (uid: string, attempt = 0): Promise<UserProfile | null> => {
        const timeoutPromise = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Profile load timeout')), PROFILE_LOAD_TIMEOUT_MS)
        );
        try {
          return await Promise.race([getUserProfile(uid), timeoutPromise]);
        } catch (err) {
          if (attempt < MAX_PROFILE_RETRIES) {
            console.warn(`⚠️ Profile load attempt ${attempt + 1} failed, retrying in ${PROFILE_RETRY_DELAY_MS}ms...`);
            await new Promise(r => setTimeout(r, PROFILE_RETRY_DELAY_MS));
            return loadProfileWithRetry(uid, attempt + 1);
          }
          console.warn('⚠️ Profile load failed after retries; continuing without profile.');
          return null;
        }
      };

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);

        // Sync lightweight auth cookie for middleware route protection
        if (typeof document !== 'undefined') {
          if (firebaseUser) {
            document.cookie = 'fs_auth=1; path=/; max-age=2592000; SameSite=Lax';
          } else {
            document.cookie = 'fs_auth=; path=/; max-age=0; SameSite=Lax';
          }
        }
        
        try {
          if (firebaseUser) {
            try {
              const adminRoles = checkAdminRoles(firebaseUser.email);
              setIsSuperadmin(adminRoles.isSuperadmin);
              setIsAdmin(adminRoles.isAdmin);
              setIsSpecialUser(adminRoles.isSpecialUser);
              
              const token = await getIdTokenResult(firebaseUser, true);
              if (token.claims.superadmin) {
                setIsSuperadmin(true);
              }
              if (token.claims.admin) {
                setIsAdmin(true);
              }
              if (token.claims.role === 'admin') {
                setIsAdmin(true);
              }
            } catch (e) {
              const adminRoles = checkAdminRoles(firebaseUser.email);
              setIsSuperadmin(adminRoles.isSuperadmin);
              setIsAdmin(adminRoles.isAdmin);
              setIsSpecialUser(adminRoles.isSpecialUser);
            }
            
            const profile = await loadProfileWithRetry(firebaseUser.uid);
            setUserProfile(profile);
          } else {
            setUserProfile(null);
            setIsSuperadmin(false);
            setIsAdmin(false);
            setIsSpecialUser(false);
          }
        } catch (e) {
          if (firebaseUser) {
            setUserProfile(null);
          } else {
            setUserProfile(null);
            setIsSuperadmin(false);
            setIsAdmin(false);
            setIsSpecialUser(false);
          }
        } finally {
          setLoading(false);
        }
      });

      return () => unsubscribe();
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
    isSpecialUser,
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
 