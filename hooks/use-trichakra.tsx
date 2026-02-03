'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { trichakraIntelligence, UserProfile } from "@/lib/trichakraIntelligence";
import { TrichakraAnalysis } from "@/lib/trichakraIntelligence";

export function useTrichakra() {
  const { user, userProfile } = useAuth();
  const [analysis, setAnalysis] = useState<TrichakraAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-load Trichakra analysis when userProfile is available
  useEffect(() => {
    if (user?.uid && userProfile && !analysis) {
      loadTrichakraAnalysis();
    }
  }, [user?.uid, userProfile]);

  // Load Trichakra analysis based on user profile
  async function loadTrichakraAnalysis() {
    if (!user?.uid) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if user profile has required data
      if (!userProfile.birthDate || !userProfile.birthTime || !userProfile.birthPlace) {
        setError("Complete profile (birth date, time, and place) is required for Trichakra analysis");
        setIsLoading(false);
        return;
      }

      // Prepare user profile for analysis
      const profile: UserProfile = {
        fullName: userProfile.fullName,
        birthDate: userProfile.birthDate,
        birthTime: userProfile.birthTime,
        birthPlace: userProfile.birthPlace,
        latitude: userProfile.latitude,
        longitude: userProfile.longitude
      };

      // Generate Trichakra analysis
      const trichakraAnalysis = await trichakraIntelligence.generateTrichakraRemedies(profile);
      setAnalysis(trichakraAnalysis);
    } catch (err: any) {
      console.error('Trichakra analysis error:', err);
      setError(err.message || "Failed to load Trichakra analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Manually trigger analysis (useful for refreshing)
  async function performTrichakraAnalysis(customProfile?: UserProfile) {
    if (!user?.uid) {
      setError("Please sign in to perform Trichakra analysis");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const profile = customProfile || {
        fullName: userProfile?.fullName,
        birthDate: userProfile?.birthDate,
        birthTime: userProfile?.birthTime,
        birthPlace: userProfile?.birthPlace,
        latitude: userProfile?.latitude,
        longitude: userProfile?.longitude
      };

      // Validate required fields
      if (!profile.birthDate || !profile.birthTime || !profile.birthPlace) {
        setError("Complete birth data (date, time, and place) is required for Trichakra analysis");
        setIsLoading(false);
        return;
      }

      // Generate Trichakra analysis
      const trichakraAnalysis = await trichakraIntelligence.generateTrichakraRemedies(profile);
      setAnalysis(trichakraAnalysis);
    } catch (err: any) {
      console.error('Trichakra analysis error:', err);
      setError(err.message || "Failed to perform Trichakra analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function resetData() {
    setAnalysis(null);
    setError(null);
  }

  return {
    analysis,
    isLoading,
    error,
    performTrichakraAnalysis,
    loadTrichakraAnalysis,
    resetData,
    userProfile,
    user
  };
}
