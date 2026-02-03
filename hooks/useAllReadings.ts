"use client";
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from './use-auth';
import { getAllReadings, UnifiedReading } from '@/lib/firebase';

export function useAllReadings() {
  const { user } = useAuth();
  const [readings, setReadings] = useState<UnifiedReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshReadings = useCallback(async () => {
    if (!user?.uid) {
      setReadings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const allReadings = await getAllReadings(user.uid);
      setReadings(allReadings);
    } catch (err) {
      setError('Failed to load readings');
      console.error('Error loading readings:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    refreshReadings();
  }, [refreshReadings]);

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

  // Calculate statistics
  const totalReadings = useMemo(() => readings.length, [readings]);
  
  const averageConfidence = useMemo(() => {
    if (readings.length === 0) return 0;
    const sum = readings.reduce((acc, reading) => acc + (reading.confidence || 75), 0);
    return Math.round(sum / readings.length);
  }, [readings]);

  const recentReadings = useMemo(() => {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return readings.filter(reading => reading.timestamp >= sevenDaysAgo).length;
  }, [readings]);

  // Confidence trend data (last 7 days)
  const confidenceTrendData = useMemo(() => {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return readings
      .filter(reading => reading.timestamp >= sevenDaysAgo)
      .map(reading => ({
        date: formatDate(reading.timestamp),
        confidence: reading.confidence || 75
      }))
      .slice(-7);
  }, [readings, formatDate]);

  // Symbolic patterns from all readings
  const symbolicPatterns = useMemo(() => {
    const patterns = readings.reduce((acc, reading) => {
      const element = reading.symbolicData?.elementalInfluence || 'Fire';
      const existing = acc.find(p => p.theme === element);
      if (existing) {
        existing.frequency++;
      } else {
        acc.push({
          theme: element,
          frequency: 1,
          interpretation: `Strong ${element.toLowerCase()} energy in your readings`
        });
      }
      return acc;
    }, [] as Array<{ theme: string; frequency: number; interpretation: string }>);

    return patterns
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 4);
  }, [readings]);

  return {
    readings,
    loading,
    error,
    refreshReadings,
    formatDate,
    totalReadings,
    averageConfidence,
    recentReadings,
    confidenceTrendData,
    symbolicPatterns
  };
}

