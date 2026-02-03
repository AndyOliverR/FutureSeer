"use client"

import { useState, useCallback } from "react";
import { kpAstrologyIntelligence, KPChartData, KPAnalysis } from "@/lib/kpAstrologyIntelligence";
import { getCoordinatesWithFallback } from "@/lib/geocoding";
import { useAuth } from "@/hooks/use-auth";

export function useKPAstrology() {
  const { user, userProfile } = useAuth();
  const [birthData, setBirthData] = useState({
    name: "",
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    analysisFocus: "",
  });
  const [analysis, setAnalysis] = useState<KPAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performKPAnalysis = useCallback(async (profileData?: {
    birthDate?: string;
    birthTime?: string;
    birthPlace?: string;
    name?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use profile data if provided, otherwise use form data
      const finalBirthDate = profileData?.birthDate || birthData.birthDate;
      const finalBirthTime = profileData?.birthTime || birthData.birthTime;
      const finalBirthPlace = profileData?.birthPlace || birthData.birthPlace;

      if (!finalBirthDate || !finalBirthTime || !finalBirthPlace) {
        setError('Please provide birth date, time, and place');
        setIsLoading(false);
        return;
      }

      console.log('🎯 Starting KP analysis...', {
        birthDate: finalBirthDate,
        birthTime: finalBirthTime,
        birthPlace: finalBirthPlace
      });

      // Geocode birth place
      const coords = await getCoordinatesWithFallback(finalBirthPlace);
      console.log('📍 Geocoded coordinates:', coords);

      // Prepare chart data
      const chartData: KPChartData = {
        birthDate: finalBirthDate,
        birthTime: finalBirthTime,
        birthPlace: finalBirthPlace,
        latitude: coords.latitude,
        longitude: coords.longitude
      };

      // Analyze chart using KP intelligence
      const result = await kpAstrologyIntelligence.analyzeChart(chartData);
      
      console.log('✅ KP analysis complete:', result);
      setAnalysis(result);
      setError(null);
    } catch (err: any) {
      console.error('❌ KP analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to perform KP astrology analysis';
      setError(errorMessage);
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  }, [birthData]);

  function resetData() {
    setBirthData({
      name: "",
      birthDate: "",
      birthTime: "",
      birthPlace: "",
      analysisFocus: "",
    });
    setAnalysis(null);
    setError(null);
  }

  return {
    birthData,
    setBirthData,
    analysis,
    isLoading,
    error,
    performKPAnalysis,
    resetData,
    user,
    userProfile
  };
} 