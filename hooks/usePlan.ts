import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './use-auth';
import { getFirebaseDB } from '@/lib/firebase';

const TRIAL_DURATION_SECONDS = 9 * 60 * 60; // 9 hours

export function usePlan() {
  const { user, isSuperadmin, isAdmin, loading: authLoading } = useAuth();
  const [plan, setPlan] = useState<string | null>(null);
  const [trialStartedAt, setTrialStartedAt] = useState<Date | null>(null);
  const [trialTimeLeft, setTrialTimeLeft] = useState<number | null>(null);
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setPlan(null);
      setTrialStartedAt(null);
      setTrialTimeLeft(null);
      setIsTrialActive(false);
      setIsPaid(false);
      setLoading(false);
      return;
    }

    // Check if user should bypass trial/upgrade prompts
    const shouldBypassUpgrade = isSuperadmin || isAdmin || user.email === 'andyrozario7@gmail.com';
    
    if (shouldBypassUpgrade) {
      // For admin users and special users, set them as paid users
      setPlan('premium');
      setTrialStartedAt(null);
      setTrialTimeLeft(null);
      setIsTrialActive(false);
      setIsPaid(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const fetchPlan = async () => {
      try {
        const db = getFirebaseDB();
        if (!db) {
          setError('Database not initialized');
          setLoading(false);
          return;
        }
        const userRef = doc(db, 'users', user.uid);
        let snap = await getDoc(userRef);
        let data = snap.exists() ? snap.data() : {};
        // If trial_started_at is missing, set it now
        if (!data.trial_started_at) {
          await setDoc(userRef, {
            email: user.email,
            displayName: user.displayName,
            trial_started_at: serverTimestamp(),
            plan: 'trial',
          }, { merge: true });
          snap = await getDoc(userRef);
          data = snap.exists() ? snap.data() : {};
        }
        setPlan(data.plan || null);
        const startedAt = data.trial_started_at?.toDate ? data.trial_started_at.toDate() : null;
        setTrialStartedAt(startedAt);
        if (startedAt) {
          const now = new Date();
          const elapsed = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
          const left = Math.max(0, TRIAL_DURATION_SECONDS - elapsed);
          setTrialTimeLeft(left);
          setIsTrialActive(left > 0 && (data.plan === 'trial' || !data.plan));
        } else {
          setTrialTimeLeft(null);
          setIsTrialActive(false);
        }
        setIsPaid(data.plan && data.plan !== 'trial');
      } catch (err: any) {
        setError(err.message || 'Failed to fetch plan info');
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [user, isSuperadmin, isAdmin]);

  return {
    plan,
    trialStartedAt,
    trialTimeLeft,
    isTrialActive,
    isPaid,
    loading: loading || authLoading,
    error,
  };
} 