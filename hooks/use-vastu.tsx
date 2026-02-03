'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getIntelligentVastuData, getPersonalizedVastuReport } from "@/lib/vastuIntelligence";

export function useVastu() {
  const { user, userProfile } = useAuth();
  const [propertyData, setPropertyData] = useState({
    type: "",
    propertyType: "",
    plotShape: "",
    entranceDirection: "",
    constructionYear: "",
    analysisFocus: "",
    rooms: {},
  });
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-load personalized report when userProfile is available
  useEffect(() => {
    if (user?.uid && userProfile && !analysis) {
      loadPersonalizedVastuReport();
    }
  }, [user?.uid, userProfile]);

  // Load personalized Vastu report based on user profile only
  async function loadPersonalizedVastuReport() {
    if (!user?.uid) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const reading = await getPersonalizedVastuReport(user.uid, userProfile);
      setAnalysis(reading);
    } catch (err: any) {
      console.error('Personalized Vastu report error:', err);
      setError(err.message || "Failed to load personalized Vastu report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function performVastuAnalysis() {
    if (!user?.uid) {
      setError("Please sign in to perform Vastu analysis");
      return;
    }

    if (!propertyData.type || !propertyData.entranceDirection || !propertyData.plotShape) {
      setError("Please fill in all required property details");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const reading = await getIntelligentVastuData(
        user.uid,
        propertyData.propertyType as 'residential' | 'commercial' | 'office' || 'residential',
        propertyData.plotShape as 'square' | 'rectangular' | 'irregular' || 'rectangular',
        propertyData.entranceDirection.toLowerCase(),
        propertyData.rooms || {},
        userProfile // Pass userProfile for personalization
      );
      
      setAnalysis(reading);
    } catch (err: any) {
      console.error('Vastu analysis error:', err);
      setError(err.message || "Failed to perform Vastu analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function resetData() {
    setPropertyData({
      type: "",
      propertyType: "",
      plotShape: "",
      entranceDirection: "",
      constructionYear: "",
      analysisFocus: "",
      rooms: {},
    });
    setAnalysis(null);
    setError(null);
  }

  return {
    propertyData,
    setPropertyData,
    analysis,
    isLoading,
    error,
    performVastuAnalysis,
    loadPersonalizedVastuReport,
    resetData,
    userProfile, // Expose userProfile for components
    user, // Expose user for components
  };
} 