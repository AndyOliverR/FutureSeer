'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import { devLog } from '@/lib/devLogger';
import { analytics } from '@/lib/analytics';
import { ONBOARDING_FULL_REPORT_BYPASS_KEY, shouldRequireReturningPaymentCommit } from '@/lib/authRouting';
import {
  getFirebaseAuth,
  signInWithGoogle,
  signOutUser,
  getUserProfile,
  UserProfile,
  ensureFirestoreConnection,
  getRedirectResult,
  ensureUserDocumentFromAuth,
} from '@/lib/firebase';
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
  requiresReturningPaymentCommit: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type GlobalAuthBootstrapState = typeof globalThis & {
  __fsAuthBootstrapPromise__?: Promise<void> | null;
};

function getGlobalAuthBootstrapPromise(): Promise<void> | null {
  const g = globalThis as GlobalAuthBootstrapState;
  return g.__fsAuthBootstrapPromise__ ?? null;
}

function setGlobalAuthBootstrapPromise(value: Promise<void> | null): void {
  const g = globalThis as GlobalAuthBootstrapState;
  g.__fsAuthBootstrapPromise__ = value;
}

function profileIndicatesSpecialUser(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return (
    profile.specialUser === true ||
    profile.special_user === true ||
    profile.isSpecialUser === true
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSpecialUser, setIsSpecialUser] = useState(false);
  const [hasOnboardingFullReportBypass, setHasOnboardingFullReportBypass] = useState(false);

  const checkAdminRoles = (email: string | null) => {
    if (!email) return { isSuperadmin: false, isAdmin: false, isSpecialUser: false };

    const superadminEmails = (process.env.NEXT_PUBLIC_SUPERADMIN_EMAILS || 'andyrozario@hotmail.com')
      .split(',').map(e => e.trim().toLowerCase());
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'andyoliverrozario2@gmail.com')
      .split(',').map(e => e.trim().toLowerCase());
    const specialUserEmails = (process.env.NEXT_PUBLIC_SPECIAL_USER_EMAILS || 'andyrozario7@gmail.com')
      .split(',').map(e => e.trim().toLowerCase());

    const lowerEmail = email.toLowerCase();

    if (superadminEmails.includes(lowerEmail)) {
      return { isSuperadmin: true, isAdmin: true, isSpecialUser: false };
    }
    if (adminEmails.includes(lowerEmail)) {
      return { isSuperadmin: false, isAdmin: true, isSpecialUser: false };
    }
    if (specialUserEmails.includes(lowerEmail)) {
      return { isSuperadmin: false, isAdmin: false, isSpecialUser: true };
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
      setHasOnboardingFullReportBypass(false);
      
      // Then sign out from Firebase (this also clears localStorage now)
      await signOutUser();
      
      devLog.debug('User signed out successfully', 'auth');
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
        const token = await getIdTokenResult(user, true);
        const adminRoles = checkAdminRoles(user.email);
        setIsSpecialUser(
          adminRoles.isSpecialUser ||
            token.claims.specialUser === true ||
            profileIndicatesSpecialUser(profile)
        );
      } catch (error) {
        console.error('Error refreshing profile:', error);
        throw error;
      }
    }
  }, [user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncBypassFlag = () => {
      try {
        setHasOnboardingFullReportBypass(
          sessionStorage.getItem(ONBOARDING_FULL_REPORT_BYPASS_KEY) === '1'
        );
      } catch {
        setHasOnboardingFullReportBypass(false);
      }
    };
    syncBypassFlag();
    window.addEventListener('futureSeer:onboardingBypassChanged', syncBypassFlag);
    window.addEventListener('focus', syncBypassFlag);
    return () => {
      window.removeEventListener('futureSeer:onboardingBypassChanged', syncBypassFlag);
      window.removeEventListener('focus', syncBypassFlag);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const unsubRef: { current: (() => void) | undefined } = { current: undefined };

    const initializeAuth = async () => {
      void ensureFirestoreConnection().catch((connectionError) => {
        console.warn('⚠️ Firestore connection check failed during auth initialization:', connectionError);
      });

      const auth = getFirebaseAuth();
      if (!auth) {
        if (!cancelled) setLoading(false);
        return;
      }

      /** Do not block onAuthStateChanged on redirect; cap wait so global bootstrap promise always settles. */
      const REDIRECT_RESULT_TIMEOUT_MS = 5000;

      const runRedirectBootstrap = async (): Promise<void> => {
        try {
          const redirectResult = await Promise.race([
            getRedirectResult(),
            new Promise<null>((resolve) => {
              setTimeout(() => resolve(null), REDIRECT_RESULT_TIMEOUT_MS);
            }),
          ]);
          if (cancelled) return;
          if (redirectResult?.user) {
            devLog.debug('Redirect authentication completed successfully', 'auth');
            void ensureUserDocumentFromAuth(redirectResult.user).catch(() => {});
            setUser(redirectResult.user);
            setLoading(false);
            void getUserProfile(redirectResult.user.uid)
              .then((profile) => {
                if (!cancelled) setUserProfile(profile);
              })
              .catch(() => {
                if (!cancelled) setUserProfile(null);
              });
          }
        } catch {
          devLog.debug('No redirect result or redirect error', 'auth');
        }
      };

      let bootstrapPromise = getGlobalAuthBootstrapPromise();
      if (!bootstrapPromise) {
        bootstrapPromise = runRedirectBootstrap().finally(() => {
          if (getGlobalAuthBootstrapPromise() === bootstrapPromise) {
            setGlobalAuthBootstrapPromise(null);
          }
        });
        setGlobalAuthBootstrapPromise(bootstrapPromise);
      }
      void bootstrapPromise;

      if (cancelled) return;

      const PROFILE_LOAD_TIMEOUT_MS = 8000;
      const PROFILE_RETRY_DELAY_MS = 2000;
      const MAX_PROFILE_RETRIES = 2;

      const loadProfileWithRetry = async (uid: string, attempt = 0): Promise<UserProfile | null> => {
        const timeoutPromise = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Profile load timeout')), PROFILE_LOAD_TIMEOUT_MS)
        );
        try {
          return await Promise.race([getUserProfile(uid), timeoutPromise]);
        } catch {
          if (attempt < MAX_PROFILE_RETRIES) {
            console.warn(`⚠️ Profile load attempt ${attempt + 1} failed, retrying in ${PROFILE_RETRY_DELAY_MS}ms...`);
            await new Promise(r => setTimeout(r, PROFILE_RETRY_DELAY_MS));
            if (cancelled) return null;
            return loadProfileWithRetry(uid, attempt + 1);
          }
          console.warn('⚠️ Profile load failed after retries; continuing without profile.');
          return null;
        }
      };

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (cancelled) return;

        setUser(firebaseUser);

        if (firebaseUser) {
          try {
            analytics.identifyUser(firebaseUser.uid, {
              email: firebaseUser.email ?? undefined,
            });
          } catch {
            /* non-blocking */
          }
        }

        if (typeof document !== 'undefined') {
          if (firebaseUser) {
            document.cookie = 'fs_auth=1; path=/; max-age=2592000; SameSite=Lax';
          } else {
            document.cookie = 'fs_auth=; path=/; max-age=0; SameSite=Lax';
          }
        }

        try {
          if (firebaseUser) {
            let idTokenResult: Awaited<ReturnType<typeof getIdTokenResult>> | null = null;
            try {
              const adminRoles = checkAdminRoles(firebaseUser.email);
              setIsSuperadmin(adminRoles.isSuperadmin);
              setIsAdmin(adminRoles.isAdmin);
              setIsSpecialUser(adminRoles.isSpecialUser);

              idTokenResult = await getIdTokenResult(firebaseUser, true);
              if (cancelled) return;
              const token = idTokenResult;
              if (token.claims.superadmin) {
                setIsSuperadmin(true);
              }
              if (token.claims.admin) {
                setIsAdmin(true);
              }
              if (token.claims.role === 'admin') {
                setIsAdmin(true);
              }
              if (token.claims.specialUser === true) {
                setIsSpecialUser(true);
              }
            } catch {
              if (cancelled) return;
              const adminRoles = checkAdminRoles(firebaseUser.email);
              setIsSuperadmin(adminRoles.isSuperadmin);
              setIsAdmin(adminRoles.isAdmin);
              setIsSpecialUser(adminRoles.isSpecialUser);
            }

            const profile = await loadProfileWithRetry(firebaseUser.uid);
            if (cancelled) return;
            setUserProfile(profile);
            const roles = checkAdminRoles(firebaseUser.email);
            const claimSpecial = idTokenResult?.claims?.specialUser === true;
            setIsSpecialUser(
              roles.isSpecialUser || claimSpecial || profileIndicatesSpecialUser(profile)
            );
          } else {
            setUserProfile(null);
            setIsSuperadmin(false);
            setIsAdmin(false);
            setIsSpecialUser(false);
          }
        } catch {
          if (cancelled) return;
          if (firebaseUser) {
            setUserProfile(null);
          } else {
            setUserProfile(null);
            setIsSuperadmin(false);
            setIsAdmin(false);
            setIsSpecialUser(false);
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      });

      if (cancelled) {
        unsubscribe();
        return;
      }
      unsubRef.current = unsubscribe;
    };

    void initializeAuth();

    return () => {
      cancelled = true;
      unsubRef.current?.();
    };
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
    requiresReturningPaymentCommit:
      !!user &&
      shouldRequireReturningPaymentCommit({
        profile: userProfile,
        isSuperadmin,
        isAdmin,
        isSpecialUser,
        hasSessionBypass: hasOnboardingFullReportBypass,
      }),
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
 