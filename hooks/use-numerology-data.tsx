'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { getIntelligentNumerologyData } from '@/lib/numerologyIntelligence';

interface NumerologyData {
  userId: string
  fullName: string
  birthDate: string
  lastFetched: number
  lifePathNumber: number
  destinyNumber: number
  soulNumber: number
  personalityNumber: number
  birthDayNumber: number
  maturityNumber: number
  personalYearNumber: number
  personalMonthNumber: number
  personalDayNumber: number
  karmicDebts: number[]
  masterNumbers: number[]
  pinnacles: number[]
  challenges: number[]
  letterAnalysis: { [key: string]: number }
  insights: {
    lifePurpose: string
    strengths: string[]
    challenges: string[]
    opportunities: string[]
    compatibility: string[]
    careerPaths: string[]
    personalGrowth: string[]
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

interface UseNumerologyDataReturn {
  numerologyData: NumerologyData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  clearCache: () => void;
  isStale: boolean;
}

export function useNumerologyData(): UseNumerologyDataReturn {
  const { user, userProfile } = useAuth();
  const [numerologyData, setNumerologyData] = useState<NumerologyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNumerologyData = useCallback(async () => {
    if (!user || !userProfile?.fullName || !userProfile?.birthDate) {
      setError('User profile incomplete. Please add your full name and birth date.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching numerology data for user:', user.uid);
      const data = await getIntelligentNumerologyData(
        user.uid,
        userProfile.fullName,
        userProfile.birthDate
      );
      
      setNumerologyData(data);
      console.log('Successfully fetched numerology data');
    } catch (err) {
      console.error('Error fetching numerology data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch numerology data');
    } finally {
      setLoading(false);
    }
  }, [user, userProfile]);

  const refresh = useCallback(async () => {
    await fetchNumerologyData();
  }, [fetchNumerologyData]);

  const clearCache = useCallback(() => {
    setNumerologyData(null);
    setError(null);
  }, []);

  // Check if data is stale (older than 24 hours)
  const isStale = numerologyData ? 
    Date.now() - numerologyData.lastFetched > 24 * 60 * 60 * 1000 : 
    false;

  // Auto-fetch data when user or profile changes
  useEffect(() => {
    if (user && userProfile?.fullName && userProfile?.birthDate) {
      fetchNumerologyData();
    } else {
      setNumerologyData(null);
      setError(null);
    }
  }, [user, userProfile, fetchNumerologyData]);

  return {
    numerologyData,
    loading,
    error,
    refresh,
    clearCache,
    isStale
  };
} 