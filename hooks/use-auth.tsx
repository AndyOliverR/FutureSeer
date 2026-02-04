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

  const refreshProfile = useCallback(async () => {
    if (user) {
      try {
        // Fetch first, then update - don't clear existing profile to prevent UI flash
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
        return profile;
      } catch (error) {
        console.error('Error refreshing profile:', error);
        throw error;
      }
    }
  }, [user]);

  useEffect(() => {
    const initializeAuth = async () => {
      // Ensure Firestore connection is stable before proceeding
      try {
        await ensureFirestoreConnection();
      } catch (connectionError) {
        console.warn('⚠️ Firestore connection check failed during auth initialization:', connectionError);
      }
      
      // Check for redirect result first
      try {
        const redirectResult = await getRedirectResult();
        if (redirectResult) {
          console.log('✅ Redirect authentication completed successfully');
        }
      } catch (redirectError) {
        console.log('ℹ️ No redirect result or redirect error:', redirectError);
      }
      
      // Regular Firebase authentication
      const auth = getFirebaseAuth();
      if (!auth) {
        setLoading(false);
        return;
      }
      
      const PROFILE_LOAD_TIMEOUT_MS = 5000; // 5s so Firestore hang does not block UI forever

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);
        
        try {
          if (firebaseUser) {
            try {
              // Check for admin roles based on email
              const adminRoles = checkAdminRoles(firebaseUser.email);
              setIsSuperadmin(adminRoles.isSuperadmin);
              setIsAdmin(adminRoles.isAdmin);
              setIsSpecialUser(adminRoles.isSpecialUser);
              
              // Also check for Firebase custom claims (for future use)
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
              // Fallback to email-based role checking
              const adminRoles = checkAdminRoles(firebaseUser.email);
              setIsSuperadmin(adminRoles.isSuperadmin);
              setIsAdmin(adminRoles.isAdmin);
              setIsSpecialUser(adminRoles.isSpecialUser);
            }
            
            const timeoutPromise = new Promise<null>((_, reject) =>
              setTimeout(() => reject(new Error('Profile load timeout')), PROFILE_LOAD_TIMEOUT_MS)
            );
            const profile = await Promise.race([
              getUserProfile(firebaseUser.uid),
              timeoutPromise,
            ]);
            setUserProfile(profile);
          } else {
            setUserProfile(null);
            setIsSuperadmin(false);
            setIsAdmin(false);
            setIsSpecialUser(false);
          }
        } catch (e) {
          if (e instanceof Error && e.message === 'Profile load timeout') {
            console.warn('⚠️ Profile load timed out; continuing without profile.');
            setUserProfile(null);
          }
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
 