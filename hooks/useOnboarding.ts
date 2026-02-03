'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { getFirebaseDB } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface OnboardingState {
  completed: boolean;
  skipped: boolean;
  lastSeen: Date | null;
  loading: boolean;
}

export function useOnboarding() {
  const { user } = useAuth();
  const [state, setState] = useState<OnboardingState>({
    completed: false,
    skipped: false,
    lastSeen: null,
    loading: true,
  });
  const [isTourActive, setIsTourActive] = useState(false);

  // Load onboarding state from Firestore
  useEffect(() => {
    const loadOnboardingState = async () => {
      if (!user?.uid) {
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        const db = getFirebaseDB();
        if (!db) {
          setState(prev => ({ ...prev, loading: false }));
          return;
        }

        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        
        if (snap.exists()) {
          const data = snap.data();
          setState({
            completed: data.onboardingCompleted || false,
            skipped: data.onboardingSkipped || false,
            lastSeen: data.onboardingLastSeen?.toDate() || null,
            loading: false,
          });
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error loading onboarding state:', error);
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    loadOnboardingState();
  }, [user?.uid]);

  // Mark onboarding as completed
  const markCompleted = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const db = getFirebaseDB();
      if (!db) return;

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        onboardingCompleted: true,
        onboardingSkipped: false,
        onboardingLastSeen: serverTimestamp(),
      }, { merge: true });

      setState(prev => ({
        ...prev,
        completed: true,
        skipped: false,
        lastSeen: new Date(),
      }));
      setIsTourActive(false);
    } catch (error) {
      console.error('Error marking onboarding as completed:', error);
    }
  }, [user?.uid]);

  // Mark onboarding as skipped
  const markSkipped = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const db = getFirebaseDB();
      if (!db) return;

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        onboardingSkipped: true,
        onboardingLastSeen: serverTimestamp(),
      }, { merge: true });

      setState(prev => ({
        ...prev,
        skipped: true,
        lastSeen: new Date(),
      }));
      setIsTourActive(false);
    } catch (error) {
      console.error('Error marking onboarding as skipped:', error);
    }
  }, [user?.uid]);

  // Start the tour
  const startTour = useCallback(() => {
    setIsTourActive(true);
  }, []);

  // Check if user should see the tour (new user who hasn't completed or skipped)
  const shouldShowTour = !state.loading && !state.completed && !state.skipped && user?.uid;

  return {
    ...state,
    isTourActive,
    shouldShowTour,
    startTour,
    markCompleted,
    markSkipped,
    setIsTourActive,
  };
}
