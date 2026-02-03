'use client';

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./use-auth";
import { getIntelligentNameAnalysisData, NameAnalysis } from "@/lib/nameAnalysisIntelligence";
import { saveToolData, loadToolData, useToolData } from "@/lib/toolStorageUtils";

export function useNameAnalysis() {
  const { user, userProfile } = useAuth();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [analysis, setAnalysis] = useState<NameAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);

  // Auto-populate name from user profile
  // CRITICAL: Use fullName for analysis, displayName only for UI addressing
  useEffect(() => {
    if (!name && userProfile) {
      // Use fullName for analysis (not displayName)
      const fullName = userProfile.fullName || userProfile.displayName || user?.displayName || "";
      if (fullName) {
        setName(fullName);
      }
    }
    if (!birthDate && userProfile?.birthDate) {
      setBirthDate(userProfile.birthDate);
    }
  }, [userProfile, user, name, birthDate]);

  // Load cached analysis data
  useEffect(() => {
    if (user?.uid && name && !analysis && !isLoading && !isAutoGenerating) {
      try {
        const cachedData = loadToolData(user.uid, 'nameAnalysis');
        if (cachedData && cachedData.fullName === name) {
          setAnalysis(cachedData as NameAnalysis);
        }
      } catch (err) {
        console.warn('Error loading cached name analysis:', err);
      }
    }
  }, [user?.uid, name, analysis, isLoading, isAutoGenerating]);

  // Define performNameAnalysis BEFORE using it in useEffect
  const performNameAnalysis = useCallback(async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!user?.uid) {
      setError("Please log in to analyze your name");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call the intelligent name analysis library
      const nameAnalysis = await getIntelligentNameAnalysisData(user.uid, name.trim());
      
      // Save to localStorage for quick access
      saveToolData(user.uid, 'nameAnalysis', nameAnalysis);
      
      setAnalysis(nameAnalysis);
    } catch (err: any) {
      console.error('Error performing name analysis:', err);
      setError(err.message || "Failed to analyze name. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [name, user?.uid]);

  // Auto-generate analysis when profile is complete and no analysis exists
  useEffect(() => {
    const shouldAutoGenerate = 
      user?.uid && 
      name && 
      name.trim().length > 0 &&
      !analysis && 
      !isLoading && 
      !isAutoGenerating;
      
    if (shouldAutoGenerate) {
      setIsAutoGenerating(true);
      performNameAnalysis().finally(() => {
        setIsAutoGenerating(false);
      });
    }
  }, [user?.uid, name, analysis, isLoading, isAutoGenerating, performNameAnalysis]);

  // Fetch additional data for synthesis (numerology, vedic, western)
  const hasCompleteDetails = userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace;
  
  const { toolData: numerologyData } = useToolData(
    user?.uid,
    'numerology',
    hasCompleteDetails
  );

  const { toolData: vedicData } = useToolData(
    user?.uid,
    'vedicAstrology',
    hasCompleteDetails
  );

  const { toolData: westernData } = useToolData(
    user?.uid,
    'westernAstrology',
    hasCompleteDetails
  );

  function resetData() {
    setName("");
    setBirthDate("");
    setAnalysis(null);
    setError(null);
    if (user?.uid) {
      try {
        // Clear from localStorage if needed in future
      } catch (err) {
        console.warn('Error clearing name analysis data:', err);
      }
    }
  }

  return {
    name,
    setName,
    birthDate,
    setBirthDate,
    analysis,
    isLoading,
    error,
    performNameAnalysis,
    resetData,
    // Additional data for synthesis
    numerologyData,
    vedicData,
    westernData,
    user,
    userProfile
  };
}