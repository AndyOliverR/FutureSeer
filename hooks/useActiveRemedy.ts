"use client";
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useDailyGuidance } from './useDailyGuidance';
import { useAllReadings } from './useAllReadings';
import { getSavedRemedies } from '@/lib/firebase';

export interface ActiveRemedy {
  remedy: string;
  type: string;
  status: 'Pending' | 'Viewed';
  source: 'saved' | 'daily' | 'recent' | 'none';
  metadata?: any;
}

export function useActiveRemedy() {
  const { user, userProfile } = useAuth();
  const { dailyData } = useDailyGuidance();
  const { readings } = useAllReadings();
  const [activeRemedy, setActiveRemedy] = useState<ActiveRemedy | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveRemedy = useCallback(async () => {
    if (!user?.uid) {
      setActiveRemedy(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Priority 1: Check user's saved remedies from profile
      const savedRemedies = await getSavedRemedies(user.uid);
      if (savedRemedies && savedRemedies.length > 0) {
        // Get the most recent saved remedy
        const mostRecent = savedRemedies[savedRemedies.length - 1];
        const remedyTitle = typeof mostRecent === 'string' 
          ? mostRecent 
          : mostRecent?.title || mostRecent?.name || 'Personalized Remedy';
        const remedyType = mostRecent?.type || mostRecent?.category || 'Crystal';
        
        setActiveRemedy({
          remedy: remedyTitle,
          type: remedyType,
          status: 'Pending',
          source: 'saved',
          metadata: mostRecent
        });
        setLoading(false);
        return;
      }

      // Priority 2: Check today's remedy from daily guidance
      if (dailyData?.remedy) {
        const dailyRemedy = dailyData.remedy;
        setActiveRemedy({
          remedy: dailyRemedy.title || 'Today\'s Sacred Remedy',
          type: dailyRemedy.type || 'Ritual',
          status: 'Pending',
          source: 'daily',
          metadata: dailyRemedy
        });
        setLoading(false);
        return;
      }

      // Priority 3: Check most recent reading's remedies
      if (readings.length > 0) {
        const mostRecentReading = readings[0];
        if (mostRecentReading.remedies && mostRecentReading.remedies.length > 0) {
          const remedy = mostRecentReading.remedies[0];
          const remedyTitle = typeof remedy === 'string' 
            ? remedy 
            : remedy?.title || remedy?.name || 'Reading Remedy';
          const remedyType = remedy?.type || remedy?.category || 'Crystal';
          
          setActiveRemedy({
            remedy: remedyTitle,
            type: remedyType,
            status: 'Pending',
            source: 'recent',
            metadata: remedy
          });
          setLoading(false);
          return;
        }
      }

      // No remedy found - set to null (will show default message in UI)
      setActiveRemedy({
        remedy: 'No active remedy',
        type: 'General',
        status: 'Pending',
        source: 'none'
      });
    } catch (error) {
      console.error('Error fetching active remedy:', error);
      setActiveRemedy({
        remedy: 'No active remedy',
        type: 'General',
        status: 'Pending',
        source: 'none'
      });
    } finally {
      setLoading(false);
    }
  }, [user?.uid, dailyData, readings]);

  useEffect(() => {
    fetchActiveRemedy();
  }, [fetchActiveRemedy]);

  return {
    activeRemedy,
    loading,
    refreshRemedy: fetchActiveRemedy
  };
}

