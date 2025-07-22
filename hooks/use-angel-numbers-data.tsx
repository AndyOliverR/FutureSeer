'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { getIntelligentAngelNumbersData } from '@/lib/angelNumbersIntelligence';

interface AngelNumbersData {
  userId: string
  fullName: string
  birthDate: string
  lastFetched: number
  lifePathAngel: number
  destinyAngel: number
  soulAngel: number
  personalityAngel: number
  currentDateAngel: number
  personalYearAngel: number
  personalMonthAngel: number
  personalDayAngel: number
  frequentNumbers: any[]
  masterNumbers: any[]
  repeatingPatterns: string[]
  angelicGuidance: {
    primaryMessage: string
    secondaryMessages: string[]
    actionSteps: string[]
    affirmations: string[]
    warnings?: string[]
  }
  synchronicities: {
    numberSequences: string[]
    timePatterns: string[]
    dateSignificance: string[]
    meaningfulCoincidences: string[]
  }
  metadata: {
    reportId: string
    version: string
    source: string
    isComprehensive: boolean
    systemConfidence?: number
    learningApplied?: boolean
  }
}

interface UseAngelNumbersDataReturn {
  angelNumbersData: AngelNumbersData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  clearCache: () => void;
  isStale: boolean;
}

export function useAngelNumbersData(): UseAngelNumbersDataReturn {
  const { user, userProfile } = useAuth();
  const [angelNumbersData, setAngelNumbersData] = useState<AngelNumbersData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAngelNumbersData = useCallback(async () => {
    if (!user || !userProfile?.displayName || !userProfile?.birthDate) {
      setError('User profile incomplete. Please add your full name and birth date.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching angel numbers data for user:', user.uid);
      const data = await getIntelligentAngelNumbersData(
        user.uid,
        userProfile.displayName,
        userProfile.birthDate
      );
      
      setAngelNumbersData(data);
      console.log('Successfully fetched angel numbers data');
    } catch (err) {
      console.error('Error fetching angel numbers data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch angel numbers data');
    } finally {
      setLoading(false);
    }
  }, [user, userProfile]);

  const refresh = useCallback(async () => {
    await fetchAngelNumbersData();
  }, [fetchAngelNumbersData]);

  const clearCache = useCallback(() => {
    setAngelNumbersData(null);
    setError(null);
  }, []);

  // Check if data is stale (older than 24 hours)
  const isStale = angelNumbersData ? 
    Date.now() - angelNumbersData.lastFetched > 24 * 60 * 60 * 1000 : 
    false;

  // Auto-fetch data when user or profile changes
  useEffect(() => {
    if (user && userProfile?.displayName && userProfile?.birthDate) {
      fetchAngelNumbersData();
    } else {
      setAngelNumbersData(null);
      setError(null);
    }
  }, [user, userProfile, fetchAngelNumbersData]);

  return {
    angelNumbersData,
    loading,
    error,
    refresh,
    clearCache,
    isStale
  };
} 