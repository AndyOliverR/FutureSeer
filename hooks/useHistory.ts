"use client";
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from './use-auth';
import { getAskHistory, getUserActivity, getFirebaseAuth, AskHistory, UserActivityItem } from '@/lib/firebase';
import { useDebounce } from '@/hooks/use-debounce';

export function useHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<AskHistory[]>([]);
  const [activity, setActivity] = useState<UserActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const refreshHistory = useCallback(async () => {
    if (!user?.uid) {
      setHistory([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const userHistory = await getAskHistory(user.uid);
      setHistory(userHistory);
    } catch (err) {
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshActivity = useCallback(async () => {
    if (!user?.uid) {
      setActivity([]);
      setActivityError(null);
      setLoadingActivity(false);
      return;
    }
    setLoadingActivity(true);
    setActivityError(null);
    try {
      const auth = getFirebaseAuth();
      const token = await auth?.currentUser?.getIdToken?.();
      if (token) {
        const res = await fetch('/api/activity', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = (await res.json()) as UserActivityItem[];
          setActivity(Array.isArray(data) ? data : []);
          setActivityError(null);
          return;
        }
      }
      const userActivity = await getUserActivity(user.uid, 50);
      setActivity(userActivity);
      if (userActivity.length === 0 && token) {
        setActivityError('Activity couldn\'t be loaded. Index may still be building.');
      } else {
        setActivityError(null);
      }
    } catch {
      setActivity([]);
      setActivityError('Activity couldn\'t be loaded.');
    } finally {
      setLoadingActivity(false);
    }
  }, [user]);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  useEffect(() => {
    refreshActivity();
  }, [refreshActivity]);

  const getQuestionType = useCallback((question: string) => {
    const lowerQuestion = question.toLowerCase();
    if (lowerQuestion.includes('love') || lowerQuestion.includes('relationship')) return 'Love';
    if (lowerQuestion.includes('money') || lowerQuestion.includes('career') || lowerQuestion.includes('job')) return 'Career';
    if (lowerQuestion.includes('health') || lowerQuestion.includes('body')) return 'Health';
    if (lowerQuestion.includes('travel') || lowerQuestion.includes('journey')) return 'Travel';
    return 'General';
  }, []);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesSearch = item.question.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesFilter = filterType === "all" || 
        getQuestionType(item.question).toLowerCase().includes(filterType.toLowerCase());
      return matchesSearch && matchesFilter;
    });
  }, [history, debouncedSearchTerm, filterType, getQuestionType]);

  const formatDate = useCallback((timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }, []);

  const getTypeColor = useCallback((type: string) => {
    switch (type) {
      case 'Love':
        return { 
          bg: 'bg-[var(--m3-primary-container)]', 
          text: 'text-[var(--m3-on-primary-container)]', 
          border: 'border-[var(--m3-primary)]/50' 
        };
      case 'Career':
        return { 
          bg: 'bg-[var(--m3-tertiary-container)]', 
          text: 'text-[var(--m3-on-tertiary-container)]', 
          border: 'border-[var(--m3-tertiary)]/50' 
        };
      case 'Health':
        return { 
          bg: 'bg-secondary-container', 
          text: 'text-secondary-on-container', 
          border: 'border-secondary/50' 
        };
      case 'Travel':
        return { 
          bg: 'bg-[var(--m3-surface-container-low)]', 
          text: 'text-[var(--m3-primary)]', 
          border: 'border-[var(--m3-primary)]/30' 
        };
      default:
        return { 
          bg: 'bg-[var(--m3-surface-container-low)]', 
          text: 'text-[var(--m3-on-surface-variant)]', 
          border: 'border-[var(--m3-outline-variant)]' 
        };
    }
  }, []);

  return {
    history,
    filteredHistory,
    activity,
    loading,
    loadingActivity,
    error,
    activityError,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    getQuestionType,
    formatDate,
    getTypeColor,
    refreshHistory,
    refreshActivity,
  };
} 