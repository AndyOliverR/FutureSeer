'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { getIntelligentVedicData, clearVedicDataCache, VedicReading } from '@/lib/vedicIntelligence';

interface UseVedicReturn {
  vedicData: VedicReading | null;
  loading: boolean;
  error: string | null;
  refreshVedicData: () => Promise<void>;
  clearVedicData: () => Promise<void>;
}

export function useVedic(): UseVedicReturn {
  const { user, userProfile } = useAuth();
  const [vedicData, setVedicData] = useState<VedicReading | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVedicData = useCallback(async () => {
    if (!user || !userProfile) {
      setVedicData(null);
      return;
    }

    // Check if we have the required birth details
    if (!userProfile.birthDate || !userProfile.birthPlace) {
      setError('Birth date and place are required for Vedic astrology analysis');
      setVedicData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching Vedic data for user:', user.uid);
      const data = await getIntelligentVedicData(
        user.uid,
        userProfile.birthDate,
        userProfile.birthTime || '12:00',
        userProfile.birthPlace
      );
      
      setVedicData(data);
      console.log('Vedic data fetched successfully:', data);
    } catch (err) {
      console.error('Error fetching Vedic data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch Vedic data');
      setVedicData(null);
    } finally {
      setLoading(false);
    }
  }, [user, userProfile]);

  const refreshVedicData = useCallback(async () => {
    await fetchVedicData();
  }, [fetchVedicData]);

  const clearVedicData = useCallback(async () => {
    if (!user) return;
    
    try {
      await clearVedicDataCache(user.uid);
      setVedicData(null);
      setError(null);
      console.log('Vedic data cleared for user:', user.uid);
    } catch (err) {
      console.error('Error clearing Vedic data:', err);
      setError('Failed to clear Vedic data');
    }
  }, [user]);

  // Auto-fetch Vedic data when user or profile changes
  useEffect(() => {
    fetchVedicData();
  }, [fetchVedicData]);

  return {
    vedicData,
    loading,
    error,
    refreshVedicData,
    clearVedicData,
  };
} 