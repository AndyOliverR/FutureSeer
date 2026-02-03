import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { userDataStorage, UserVedicData } from '@/lib/userDataStorage';
import { log } from '@/lib/consoleLogger';

// Helper function to create birth data hash
function createBirthDataHash(birthDate: string, birthTime: string, birthPlace: any): string {
  const placeStr = typeof birthPlace === 'string' ? birthPlace : 
    `${birthPlace.latitude},${birthPlace.longitude},${birthPlace.timezone}`;
  return `${birthDate}-${birthTime}-${placeStr}`;
}

export interface VedicStorageState {
  hasExistingData: boolean;
  isLoading: boolean;
  error: string | null;
  vedicData: UserVedicData | null;
  isStoring: boolean;
  birthDataChanged: boolean;
  currentBirthDataHash: string | null;
}

export function useVedicStorage() {
  const { user } = useAuth();
  const [state, setState] = useState<VedicStorageState>({
    hasExistingData: false,
    isLoading: false,
    error: null,
    vedicData: null,
    isStoring: false,
    birthDataChanged: false,
    currentBirthDataHash: null
  });

  // Check if user has existing Vedic data
  const checkExistingData = useCallback(async () => {
    if (!user?.uid) {
      setState(prev => ({ ...prev, hasExistingData: false }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const hasData = await userDataStorage.hasVedicData(user.uid);
      log.info(`Checking existing Vedic data for user ${user.uid}: ${hasData ? 'Found' : 'Not found'}`);
      
      setState(prev => ({ 
        ...prev, 
        hasExistingData: hasData,
        isLoading: false 
      }));
    } catch (error) {
      log.error('Error checking existing Vedic data:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to check existing data',
        isLoading: false 
      }));
    }
  }, [user?.uid]);

  // Load existing Vedic data
  const loadExistingData = useCallback(async () => {
    if (!user?.uid) {
      setState(prev => ({ ...prev, vedicData: null }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const vedicData = await userDataStorage.getVedicData(user.uid);
      log.success(`Loaded existing Vedic data for user ${user.uid}`);
      
      setState(prev => ({ 
        ...prev, 
        vedicData,
        isLoading: false 
      }));
    } catch (error) {
      log.error('Error loading existing Vedic data:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load existing data',
        isLoading: false 
      }));
    }
  }, [user?.uid]);

  // Check if birth data has changed
  const checkBirthDataChange = useCallback(async (currentBirthData: any) => {
    if (!user?.uid) return;

    try {
      const storedVedicData = await userDataStorage.getVedicData(user.uid);
      if (!storedVedicData) return;

      const currentHash = createBirthDataHash(
        currentBirthData.birthDate,
        currentBirthData.birthTime,
        currentBirthData.birthPlace
      );

      const storedHash = createBirthDataHash(
        storedVedicData.birthDate,
        storedVedicData.birthTime,
        storedVedicData.birthPlace
      );

      const hasChanged = currentHash !== storedHash;
      
      setState(prev => ({
        ...prev,
        birthDataChanged: hasChanged,
        currentBirthDataHash: currentHash
      }));

      if (hasChanged) {
        log.warn(`Birth data changed for user ${user.uid}`, {
          oldHash: storedHash,
          newHash: currentHash
        }, 'vedic-storage');
      }
    } catch (error) {
      log.error('Error checking birth data change', error, 'vedic-storage');
    }
  }, [user?.uid]);

  // Store new Vedic data
  const storeVedicData = useCallback(async (vedicData: Omit<UserVedicData, 'createdAt' | 'lastUpdated'>) => {
    if (!user?.uid) {
      setState(prev => ({ ...prev, error: 'User not authenticated' }));
      return;
    }

    setState(prev => ({ ...prev, isStoring: true, error: null }));

    try {
      await userDataStorage.storeVedicData(user.uid, vedicData);
      log.success(`Vedic data stored permanently for user ${user.uid}`);
      
      setState(prev => ({ 
        ...prev, 
        hasExistingData: true,
        vedicData: {
          ...vedicData,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        },
        isStoring: false 
      }));
    } catch (error) {
      log.error('Error storing Vedic data:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to store data',
        isStoring: false 
      }));
    }
  }, [user?.uid]);

  // Clear Vedic data
  const clearVedicData = useCallback(async () => {
    if (!user?.uid) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await userDataStorage.clearUserData(user.uid, 'vedic');
      log.success(`Vedic data cleared for user ${user.uid}`);
      
      setState(prev => ({ 
        ...prev, 
        hasExistingData: false,
        vedicData: null,
        isLoading: false 
      }));
    } catch (error) {
      log.error('Error clearing Vedic data:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to clear data',
        isLoading: false 
      }));
    }
  }, [user?.uid]);

  // Auto-check for existing data when user changes
  useEffect(() => {
    if (user?.uid) {
      checkExistingData();
    } else {
      setState(prev => ({ 
        ...prev, 
        hasExistingData: false,
        vedicData: null 
      }));
    }
  }, [user?.uid, checkExistingData]);

  return {
    ...state,
    checkExistingData,
    loadExistingData,
    storeVedicData,
    clearVedicData,
    checkBirthDataChange
  };
}
