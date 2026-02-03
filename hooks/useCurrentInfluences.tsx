import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './use-auth';
import { log } from '@/lib/consoleLogger';
import { userDataStorage } from '@/lib/userDataStorage';

export interface CurrentInfluencesData {
  currentTransits: any[];
  dashaPeriods: any;
  currentEvents: any;
  lastUpdated: string;
}

export function useCurrentInfluences() {
  const { user } = useAuth();
  const [state, setState] = useState<{
    transitData: CurrentInfluencesData | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: string | null;
    fromCache: boolean;
  }>({
    transitData: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
    fromCache: false
  });

  // Check if Vedic data exists
  const checkVedicDataExists = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const hasData = await userDataStorage.hasVedicData(userId);
      log.info('Vedic data existence check', { hasData, userId }, 'current-influences');
      return hasData;
    } catch (error) {
      log.error('Error checking Vedic data existence', error, 'current-influences');
      return false;
    }
  }, []);

  // Load current influences
  const loadCurrentInfluences = useCallback(async (forceRefresh = false) => {
    if (!user?.uid) {
      setState(prev => ({ ...prev, error: 'User not authenticated' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check if Vedic data exists before calling the API
      const hasVedicData = await checkVedicDataExists(user.uid);
      
      if (!hasVedicData) {
        log.warn('No Vedic data found, will retry in 3 seconds', { userId: user.uid }, 'current-influences');
        
        // Retry after 3 seconds in case data is still being stored
        setTimeout(async () => {
          const retryHasVedicData = await checkVedicDataExists(user.uid);
          if (retryHasVedicData) {
            log.info('Vedic data found on retry, loading current influences', { userId: user.uid }, 'current-influences');
            loadCurrentInfluences(forceRefresh);
          } else {
            log.warn('Still no Vedic data found after retry', { userId: user.uid }, 'current-influences');
            setState(prev => ({ 
              ...prev, 
              error: 'Chart Required for Current Influences',
              isLoading: false 
            }));
          }
        }, 3000);
        
        return;
      }

      const response = await fetch('/api/tools/vedic/current', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          forceRefresh
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Don't throw error for 404 - just set a user-friendly message
        if (response.status === 404) {
          setState(prev => ({ 
            ...prev, 
            error: 'Chart Required for Current Influences',
            isLoading: false 
          }));
          return;
        }
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        log.success('Current influences loaded successfully', null, 'current-influences');
        log.info('Current influences data', {
          transitCount: result.data.currentTransits.length,
          currentDasha: result.data.dashaPeriods.currentDasha.planet,
          retrogradeCount: result.data.currentEvents.retrogradePlanets.length,
          fromCache: result.fromCache
        }, 'current-influences');
        
        setState(prev => ({ 
          ...prev, 
          transitData: result.data,
          lastUpdated: result.data.lastUpdated,
          fromCache: result.fromCache,
          isLoading: false 
        }));
      } else {
        throw new Error(result.error || 'Failed to load current influences');
      }
    } catch (error) {
      log.error('Error loading current influences', error, 'current-influences');
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load current influences',
        isLoading: false 
      }));
    }
  }, [user?.uid, checkVedicDataExists]);

  // Refresh current influences
  const refreshCurrentInfluences = useCallback(async () => {
    await loadCurrentInfluences(true);
  }, [loadCurrentInfluences]);

  // Auto-load current influences when user changes
  useEffect(() => {
    if (user?.uid) {
      // Add a small delay to ensure Vedic data is stored first
      const timer = setTimeout(() => {
        loadCurrentInfluences();
      }, 2000); // 2 second delay

      return () => clearTimeout(timer);
    } else {
      setState(prev => ({ 
        ...prev, 
        transitData: null,
        lastUpdated: null,
        fromCache: false
      }));
    }
  }, [user?.uid, loadCurrentInfluences]);

  // Auto-refresh every hour
  useEffect(() => {
    if (!user?.uid) return;

    const interval = setInterval(() => {
      log.info('Auto-refreshing current influences', null, 'current-influences');
      loadCurrentInfluences();
    }, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, [user?.uid, loadCurrentInfluences]);

  return {
    ...state,
    loadCurrentInfluences,
    refreshCurrentInfluences
  };
}
