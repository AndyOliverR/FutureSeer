'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { getIntelligentNameAnalysisData, clearNameAnalysisDataCache, NameAnalysis } from '@/lib/nameAnalysisIntelligence';

interface UseNameAnalysisDataReturn {
  nameAnalysisData: NameAnalysis | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  clearCache: () => void;
  isStale: boolean;
}

export function useNameAnalysisData(): UseNameAnalysisDataReturn {
  const { user, userProfile } = useAuth();
  const [nameAnalysisData, setNameAnalysisData] = useState<NameAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNameAnalysisData = useCallback(async (fullName?: string) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    const nameToAnalyze = fullName || userProfile?.displayName || userProfile?.fullName;
    if (!nameToAnalyze) {
      setError('Full name is required for name analysis');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching name analysis data for user:', user.uid);
      const data = await getIntelligentNameAnalysisData(
        user.uid,
        nameToAnalyze
      );
      
      setNameAnalysisData(data);
      console.log('Successfully fetched name analysis data');
    } catch (err) {
      console.error('Error fetching name analysis data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch name analysis data');
    } finally {
      setLoading(false);
    }
  }, [user, userProfile]);

  const refresh = useCallback(async () => {
    if (nameAnalysisData) {
      await fetchNameAnalysisData(nameAnalysisData.fullName);
    }
  }, [fetchNameAnalysisData, nameAnalysisData]);

  const clearCache = useCallback(async () => {
    if (user?.uid) {
      try {
        await clearNameAnalysisDataCache(user.uid);
        setNameAnalysisData(null);
        setError(null);
        console.log('Cleared name analysis data cache');
      } catch (err) {
        console.warn('Error clearing name analysis cache:', err);
      }
    }
  }, [user]);

  // Check if data is stale (older than 24 hours)
  const isStale = nameAnalysisData ? 
    Date.now() - nameAnalysisData.timestamp.getTime() > 24 * 60 * 60 * 1000 : 
    false;

  // Auto-fetch data when user or profile changes
  useEffect(() => {
    if (user && userProfile?.displayName && !nameAnalysisData) {
      fetchNameAnalysisData();
    } else if (!user) {
      setNameAnalysisData(null);
      setError(null);
    }
  }, [user, userProfile, nameAnalysisData, fetchNameAnalysisData]);

  return {
    nameAnalysisData,
    loading,
    error,
    refresh,
    clearCache,
    isStale
  };
} 