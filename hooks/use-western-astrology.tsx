'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { getIntelligentWesternAstrologyData, clearWesternAstrologyDataCache, WesternAstrologyReading } from '@/lib/westernAstrologyIntelligence';

interface UseWesternAstrologyDataReturn {
  westernAstrologyData: WesternAstrologyReading | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  clearCache: () => void;
  isStale: boolean;
}

export function useWesternAstrologyData(): UseWesternAstrologyDataReturn {
  const { user, userProfile } = useAuth();
  const [westernAstrologyData, setWesternAstrologyData] = useState<WesternAstrologyReading | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWesternAstrologyData = useCallback(async (
    birthDate?: string,
    birthTime?: string,
    birthPlace?: string
  ) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    const dateToUse = birthDate || userProfile?.birthDate;
    const timeToUse = birthTime || userProfile?.birthTime || '12:00';
    const placeToUse = birthPlace || userProfile?.birthPlace;

    if (!dateToUse || !placeToUse) {
      setError('Birth date and place are required for Western Astrology analysis');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching Western Astrology data for user:', user.uid);
      const data = await getIntelligentWesternAstrologyData(
        user.uid,
        dateToUse,
        timeToUse,
        placeToUse
      );
      
      setWesternAstrologyData(data);
      console.log('Successfully fetched Western Astrology data');
    } catch (err) {
      console.error('Error fetching Western Astrology data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch Western Astrology data');
    } finally {
      setLoading(false);
    }
  }, [user, userProfile]);

  const refresh = useCallback(async () => {
    if (westernAstrologyData) {
      await fetchWesternAstrologyData(
        westernAstrologyData.birthDate,
        westernAstrologyData.birthTime,
        westernAstrologyData.birthPlace
      );
    }
  }, [fetchWesternAstrologyData, westernAstrologyData]);

  const clearCache = useCallback(async () => {
    if (user?.uid) {
      try {
        await clearWesternAstrologyDataCache(user.uid);
        setWesternAstrologyData(null);
        setError(null);
        console.log('Cleared Western Astrology data cache');
      } catch (err) {
        console.warn('Error clearing Western Astrology cache:', err);
      }
    }
  }, [user]);

  // Check if data is stale (older than 24 hours)
  const isStale = westernAstrologyData ? 
    Date.now() - westernAstrologyData.timestamp.getTime() > 24 * 60 * 60 * 1000 : 
    false;

  // Auto-fetch data when user or profile changes
  useEffect(() => {
    if (user && userProfile?.birthDate && userProfile?.birthPlace && !westernAstrologyData) {
      fetchWesternAstrologyData();
    } else if (!user) {
      setWesternAstrologyData(null);
      setError(null);
    }
  }, [user, userProfile, westernAstrologyData, fetchWesternAstrologyData]);

  return {
    westernAstrologyData,
    loading,
    error,
    refresh,
    clearCache,
    isStale
  };
} 