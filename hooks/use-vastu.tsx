'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { getIntelligentVastuData, clearVastuDataCache, VastuReading } from '@/lib/vastuIntelligence';

interface UseVastuDataReturn {
  vastuData: VastuReading | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  clearCache: () => void;
  isStale: boolean;
}

export function useVastuData(): UseVastuDataReturn {
  const { user, userProfile } = useAuth();
  const [vastuData, setVastuData] = useState<VastuReading | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVastuData = useCallback(async (
    propertyType: 'residential' | 'commercial' | 'office' = 'residential',
    plotShape: 'square' | 'rectangular' | 'irregular' = 'rectangular',
    entranceDirection: string = 'north',
    rooms: { [key: string]: boolean } = {}
  ) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching Vastu data for user:', user.uid);
      const data = await getIntelligentVastuData(
        user.uid,
        propertyType,
        plotShape,
        entranceDirection,
        rooms
      );
      
      setVastuData(data);
      console.log('Successfully fetched Vastu data');
    } catch (err) {
      console.error('Error fetching Vastu data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch Vastu data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refresh = useCallback(async () => {
    if (vastuData) {
      await fetchVastuData(
        vastuData.propertyType,
        vastuData.plotShape,
        vastuData.entranceDirection,
        {} // Default rooms for refresh
      );
    }
  }, [fetchVastuData, vastuData]);

  const clearCache = useCallback(async () => {
    if (user?.uid) {
      try {
        await clearVastuDataCache(user.uid);
        setVastuData(null);
        setError(null);
        console.log('Cleared Vastu data cache');
      } catch (err) {
        console.warn('Error clearing Vastu cache:', err);
      }
    }
  }, [user]);

  // Check if data is stale (older than 24 hours)
  const isStale = vastuData ? 
    Date.now() - vastuData.timestamp.getTime() > 24 * 60 * 60 * 1000 : 
    false;

  // Auto-fetch data when user changes (but not automatically since Vastu requires user input)
  useEffect(() => {
    if (user && !vastuData) {
      // Don't auto-fetch Vastu data since it requires user input for property details
      // Users will need to manually trigger the analysis
    } else if (!user) {
      setVastuData(null);
      setError(null);
    }
  }, [user, vastuData]);

  return {
    vastuData,
    loading,
    error,
    refresh,
    clearCache,
    isStale
  };
} 